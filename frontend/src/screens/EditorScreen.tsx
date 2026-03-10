/**
 * EditorScreen — Estúdio de Criação
 *
 * The main editing workspace. Allows:
 *   - Image selection & import (via device picker)
 *   - Mood text input → real-time OKLCH color grading
 *   - Intensity slider
 *   - Color analysis (server-side via backend)
 *   - AI tools: background removal, upscaling
 *   - Navigate to Preview
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { colors, spacing, radius, typography } from '../constants/theme';
import { useAppDispatch, useAppSelector } from '../store';
import {
  setMoodText,
  setMoodResult,
  setIntensity,
  setActiveImage,
  setProcessing,
  setActiveTab,
} from '../store/editorSlice';
import {
  uploadImageToProject,
  analyzeImage,
  addProcessedImage,
} from '../store/projectSlice';
import { analyzeTextMoodOklch } from '../utils/moodMapping';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type EditorNav = StackNavigationProp<RootStackParamList, 'Editor'>;
type EditorRoute = RouteProp<RootStackParamList, 'Editor'>;

interface Props {
  navigation: EditorNav;
  route: EditorRoute;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function EditorScreen({ navigation, route }: Props) {
  const { projectId } = route.params;
  const dispatch = useAppDispatch();

  const project = useAppSelector((s) =>
    s.project.projects.find((p) => p.id === projectId)
  );
  const editor = useAppSelector((s) => s.editor);
  const backendConnected = useAppSelector((s) => s.project.backendConnected);

  const [localMoodText, setLocalMoodText] = useState(editor.moodText);

  const activeImage = project?.images.find((i) => i.id === editor.activeImageId);

  // -----------------------------------------------------------------------
  // Image import via expo-image-picker
  // -----------------------------------------------------------------------
  const handleImportImage = useCallback(async () => {
    // Show options: Gallery or Camera
    Alert.alert(
      'Importar Imagem',
      'Escolha a origem da imagem:',
      [
        { text: 'Galeria', onPress: () => pickImage('library') },
        { text: 'Câmera', onPress: () => pickImage('camera') },
        { text: 'Cancelar', style: 'cancel' },
      ]
    );
  }, []);

  const pickImage = async (source: 'library' | 'camera') => {
    try {
      // Request permission
      let permissionResult;
      if (source === 'camera') {
        permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      } else {
        permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      }
      
      if (!permissionResult.granted) {
        Alert.alert(
          'Permissão negada',
          source === 'camera'
            ? 'É necessário permitir acesso à câmera.'
            : 'É necessário permitir acesso à galeria de fotos.'
        );
        return;
      }

      // Launch picker or camera
      const result =
        source === 'camera'
          ? await ImagePicker.launchCameraAsync({
              allowsEditing: false,
              quality: 1,
              base64: false,
            })
          : await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              allowsEditing: false,
              quality: 1,
              base64: false,
            });

      if (result.canceled) return;

      const asset = result.assets[0];
      
      dispatch(setProcessing({ active: true, message: 'Enviando imagem ao backend...' }));
      
      try {
        // Upload to backend
        const uploadResult = await dispatch(
          uploadImageToProject({
            projectId,
            uri: asset.uri,
            filename: asset.fileName || `image_${Date.now()}.jpg`,
          })
        ).unwrap();
        
        // Set as active image
        if (uploadResult?.image?.id) {
          dispatch(setActiveImage(uploadResult.image.id));
        }
        
        Alert.alert('✅ Sucesso', 'Imagem enviada e pronta para edição!');
      } catch (err: any) {
        Alert.alert('Erro no upload', err?.toString() || 'Falha ao enviar imagem ao backend');
      } finally {
        dispatch(setProcessing({ active: false }));
      }
    } catch (err: any) {
      console.error('Image picker error:', err);
      Alert.alert('Erro', err?.toString() || 'Falha ao abrir seletor de imagens');
    }
  };

  // -----------------------------------------------------------------------
  // Mood analysis
  // -----------------------------------------------------------------------
  const handleAnalyzeMood = useCallback(() => {
    if (!localMoodText.trim()) return;

    dispatch(setMoodText(localMoodText));
    const result = analyzeTextMoodOklch(localMoodText, editor.intensity);
    dispatch(
      setMoodResult({
        moods: result.moods,
        adjustments: result.adjustments,
        confidence: result.confidence,
      })
    );
  }, [dispatch, localMoodText, editor.intensity]);

  // -----------------------------------------------------------------------
  // Backend color analysis
  // -----------------------------------------------------------------------
  const handleServerAnalyze = useCallback(async () => {
    if (!activeImage || !backendConnected) {
      Alert.alert('Erro', 'Selecione uma imagem e verifique a conexão com o backend.');
      return;
    }
    dispatch(setProcessing({ active: true, message: 'Analisando cores...' }));
    try {
      await dispatch(analyzeImage({ projectId, imageId: activeImage.id })).unwrap();
      Alert.alert('Sucesso', 'Análise de cores concluída! Veja os resultados na aba Info.');
    } catch (err: any) {
      Alert.alert('Erro', err ?? 'Falha na análise');
    } finally {
      dispatch(setProcessing({ active: false }));
    }
  }, [dispatch, activeImage, backendConnected, projectId]);

  // -----------------------------------------------------------------------
  // Remove background
  // -----------------------------------------------------------------------
  const handleRemoveBackground = useCallback(async () => {
    if (!activeImage || !backendConnected) return;
    
    dispatch(setProcessing({ active: true, message: 'Removendo fundo com U²-Net...' }));
    
    try {
      const api = await import('../services/api');
      const blob = await api.removeBackground(activeImage.id, false);
      
      // Convert blob to data URI for display
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUri = reader.result as string;
        
        // Add processed image to project
        const newImageId = `${activeImage.id}_nobg_${Date.now().toString(36)}`;
        const newFilename = `${activeImage.filename.split('.')[0]}_nobg.png`;
        
        dispatch(
          addProcessedImage({
            projectId,
            image: {
              id: newImageId,
              filename: newFilename,
              originalName: `${activeImage.originalName} (Fundo Removido)`,
              uri: dataUri,
              format: 'png',
              size: blob.size,
            },
          })
        );
        
        // Set as active image
        dispatch(setActiveImage(newImageId));
        
        Alert.alert(
          '✅ Fundo Removido!',
          'A imagem com fundo transparente foi adicionada ao projeto.'
        );
        
        dispatch(setProcessing({ active: false }));
      };
      
      reader.onerror = () => {
        Alert.alert('Erro', 'Falha ao processar resultado');
        dispatch(setProcessing({ active: false }));
      };
      
      reader.readAsDataURL(blob);
    } catch (err: any) {
      dispatch(setProcessing({ active: false }));
      Alert.alert('Erro', err?.message || 'Falha ao remover fundo');
    }
  }, [activeImage, backendConnected, dispatch, projectId]);

  // -----------------------------------------------------------------------
  // Upscale image
  // -----------------------------------------------------------------------
  const handleUpscale = useCallback(async () => {
    if (!activeImage || !backendConnected) return;
    
    dispatch(setProcessing({ active: true, message: 'Upscaling 4× com Real-ESRGAN (pode levar 10-30s)...' }));
    
    try {
      const api = await import('../services/api');
      const blob = await api.upscaleImage(activeImage.id, 4);
      
      // Convert blob to data URI
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUri = reader.result as string;
        
        // Add upscaled image to project
        const newImageId = `${activeImage.id}_upscaled_${Date.now().toString(36)}`;
        const newFilename = `${activeImage.filename.split('.')[0]}_upscaled_4x.png`;
        
        dispatch(
          addProcessedImage({
            projectId,
            image: {
              id: newImageId,
              filename: newFilename,
              originalName: `${activeImage.originalName} (Upscaled 4×)`,
              uri: dataUri,
              format: 'png',
              size: blob.size,
            },
          })
        );
        
        // Set as active image
        dispatch(setActiveImage(newImageId));
        
        Alert.alert(
          '✅ Upscale Concluído!',
          'A imagem foi ampliada 4× com sucesso e adicionada ao projeto.'
        );
        
        dispatch(setProcessing({ active: false }));
      };
      
      reader.onerror = () => {
        Alert.alert('Erro', 'Falha ao processar resultado');
        dispatch(setProcessing({ active: false }));
      };
      
      reader.readAsDataURL(blob);
    } catch (err: any) {
      dispatch(setProcessing({ active: false }));
      Alert.alert('Erro', err?.message || 'Falha no upscaling');
    }
  }, [activeImage, backendConnected, dispatch, projectId]);

  // -----------------------------------------------------------------------
  // Navigate to preview
  // -----------------------------------------------------------------------
  const handlePreview = useCallback(() => {
    if (!activeImage) {
      Alert.alert('Selecione uma imagem primeiro');
      return;
    }
    navigation.navigate('Preview', { projectId, imageId: activeImage.id });
  }, [navigation, projectId, activeImage]);

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------
  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      {/* Image area */}
      <View style={styles.canvasArea}>
        {activeImage ? (
          <Image
            source={{ uri: activeImage.uri }}
            style={styles.canvasImage}
            resizeMode="contain"
          />
        ) : (
          <TouchableOpacity style={styles.canvasEmpty} onPress={handleImportImage}>
            <Text style={styles.canvasEmptyIcon}>📤</Text>
            <Text style={styles.canvasEmptyText}>Toque para importar imagem</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Image thumbnails */}
      {project && project.images.length > 0 && (
        <ScrollView horizontal style={styles.thumbStrip} showsHorizontalScrollIndicator={false}>
          {project.images.map((img) => (
            <TouchableOpacity
              key={img.id}
              style={[
                styles.thumb,
                img.id === editor.activeImageId && styles.thumbActive,
              ]}
              onPress={() => dispatch(setActiveImage(img.id))}
            >
              <Image source={{ uri: img.uri }} style={styles.thumbImage} />
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Tab bar */}
      <View style={styles.tabBar}>
        {(['color', 'ai', 'info'] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, editor.activeTab === tab && styles.tabActive]}
            onPress={() => dispatch(setActiveTab(tab))}
          >
            <Text style={[styles.tabText, editor.activeTab === tab && styles.tabTextActive]}>
              {tab === 'color' ? '🎨 Color' : tab === 'ai' ? '🤖 AI' : '📊 Info'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Color tab content */}
      {editor.activeTab === 'color' && (
        <View style={styles.panel}>
          <Text style={styles.sectionLabel}>MOOD — TEXTO PARA COR</Text>
          <TextInput
            style={styles.moodInput}
            value={localMoodText}
            onChangeText={setLocalMoodText}
            placeholder="ex: cinematic melancholic sunset"
            placeholderTextColor={colors.textMuted}
            onSubmitEditing={handleAnalyzeMood}
            returnKeyType="go"
          />
          <TouchableOpacity style={styles.btnPrimary} onPress={handleAnalyzeMood}>
            <Text style={styles.btnPrimaryText}>Analisar Mood</Text>
          </TouchableOpacity>

          {editor.moodNames.length > 0 && (
            <View style={styles.moodResult}>
              <Text style={styles.moodLabel}>
                Moods: {editor.moodNames.join(', ')}
              </Text>
              <Text style={styles.moodConfidence}>
                Confiança: {editor.moodConfidence}%
              </Text>
              {editor.currentAdjustments && (
                <View style={styles.adjustmentChips}>
                  <Chip label={`Hue Δ${editor.currentAdjustments.hueDelta.toFixed(1)}°`} />
                  <Chip label={`Chroma Δ${editor.currentAdjustments.chromaDelta.toFixed(3)}`} />
                  <Chip label={`L Δ${editor.currentAdjustments.lightnessDelta.toFixed(3)}`} />
                  <Chip label={`Filmic: ${editor.currentAdjustments.filmicPreset}`} />
                </View>
              )}
            </View>
          )}

          <Text style={[styles.sectionLabel, { marginTop: spacing.lg }]}>INTENSIDADE</Text>
          <View style={styles.sliderRow}>
            <Text style={styles.sliderValue}>{Math.round(editor.intensity * 100)}%</Text>
            {/* Simple increment/decrement in lieu of a Slider component */}
            <TouchableOpacity
              style={styles.btnSmall}
              onPress={() => dispatch(setIntensity(Math.max(0, editor.intensity - 0.05)))}
            >
              <Text style={styles.btnSmallText}>−</Text>
            </TouchableOpacity>
            <View style={styles.sliderTrack}>
              <View style={[styles.sliderFill, { width: `${editor.intensity * 100}%` }]} />
            </View>
            <TouchableOpacity
              style={styles.btnSmall}
              onPress={() => dispatch(setIntensity(Math.min(1, editor.intensity + 0.05)))}
            >
              <Text style={styles.btnSmallText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* AI tab content */}
      {editor.activeTab === 'ai' && (
        <View style={styles.panel}>
          <Text style={styles.sectionLabel}>FERRAMENTAS AI</Text>
          <View style={styles.btnGroup}>
            <TouchableOpacity
              style={[styles.btnSecondary, !backendConnected && styles.btnDisabled]}
              onPress={handleServerAnalyze}
              disabled={!backendConnected}
            >
              <Text style={styles.btnSecondaryText}>🔬 Análise (colour-science)</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btnSecondary, (!backendConnected || !activeImage) && styles.btnDisabled]}
              disabled={!backendConnected || !activeImage}
              onPress={handleRemoveBackground}
            >
              <Text style={styles.btnSecondaryText}>✂️ Remover Fundo (U²-Net)</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btnSecondary, (!backendConnected || !activeImage) && styles.btnDisabled]}
              disabled={!backendConnected || !activeImage}
              onPress={handleUpscale}
            >
              <Text style={styles.btnSecondaryText}>🔍 Upscale 4× (Real-ESRGAN)</Text>
            </TouchableOpacity>
          </View>
          {!backendConnected && (
            <Text style={styles.warningText}>
              ⚠️ Backend offline — Conecte o servidor FastAPI na porta 8000 para usar as ferramentas de IA.
            </Text>
          )}
          {backendConnected && !activeImage && (
            <Text style={styles.infoText}>
              💡 Importe uma imagem primeiro para usar as ferramentas de IA.
            </Text>
          )}
        </View>
      )}

      {/* Info tab content */}
      {editor.activeTab === 'info' && (
        <View style={styles.panel}>
          <Text style={styles.sectionLabel}>INFORMAÇÕES DA IMAGEM</Text>
          {activeImage?.colorAnalysis ? (
            <View>
              <InfoRow label="Temperatura" value={`${activeImage.colorAnalysis.temperature_kelvin}K`} />
              <InfoRow label="Harmonia" value={activeImage.colorAnalysis.color_harmony} />
              <InfoRow label="Saturação" value={activeImage.colorAnalysis.saturation_level} />
              <InfoRow label="Lightness" value={`${activeImage.colorAnalysis.average_lightness}%`} />
              <InfoRow label="Dynamic Range" value={`${activeImage.colorAnalysis.dynamic_range}`} />
              <Text style={[styles.sectionLabel, { marginTop: spacing.md }]}>CORES DOMINANTES</Text>
              <View style={styles.colorSwatches}>
                {activeImage.colorAnalysis.dominant_colors_hex.map((hex, i) => (
                  <View key={i} style={[styles.swatch, { backgroundColor: hex }]} />
                ))}
              </View>
            </View>
          ) : (
            <Text style={styles.infoEmpty}>
              Execute a análise de cor (aba AI) para ver as métricas.
            </Text>
          )}
        </View>
      )}

      {/* Bottom actions */}
      <View style={styles.bottomActions}>
        <TouchableOpacity style={styles.btnPrimary} onPress={handlePreview}>
          <Text style={styles.btnPrimaryText}>Preview & Exportar →</Text>
        </TouchableOpacity>
      </View>

      {/* Processing overlay */}
      {editor.processing && (
        <View style={styles.processingOverlay}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.processingText}>{editor.processingMessage}</Text>
        </View>
      )}
    </ScrollView>
  );
}

// ---------------------------------------------------------------------------
// Small sub-components
// ---------------------------------------------------------------------------

function Chip({ label }: { label: string }) {
  return (
    <View style={chipStyles.chip}>
      <Text style={chipStyles.chipText}>{label}</Text>
    </View>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={infoStyles.row}>
      <Text style={infoStyles.label}>{label}</Text>
      <Text style={infoStyles.value}>{value}</Text>
    </View>
  );
}

const chipStyles = StyleSheet.create({
  chip: {
    backgroundColor: colors.primaryMuted,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
    marginRight: spacing.xs,
    marginBottom: spacing.xs,
  },
  chipText: {
    color: colors.primaryLight,
    fontSize: 12,
    fontWeight: '600',
  },
});

const infoStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  label: {
    ...typography.body,
    color: colors.textSecondary,
  },
  value: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '600',
  },
});

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    paddingBottom: spacing.xxl,
  },
  canvasArea: {
    height: 300,
    backgroundColor: colors.bgSurface,
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  canvasImage: {
    width: '100%',
    height: '100%',
  },
  canvasEmpty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  canvasEmptyIcon: {
    fontSize: 40,
    marginBottom: spacing.sm,
  },
  canvasEmptyText: {
    ...typography.body,
  },
  thumbStrip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  thumb: {
    width: 60,
    height: 60,
    borderRadius: radius.sm,
    overflow: 'hidden',
    marginRight: spacing.sm,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  thumbActive: {
    borderColor: colors.primary,
  },
  thumbImage: {
    width: '100%',
    height: '100%',
  },
  tabBar: {
    flexDirection: 'row',
    marginHorizontal: spacing.lg,
    backgroundColor: colors.bgSurface,
    borderRadius: radius.md,
    padding: spacing.xs,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: radius.sm,
  },
  tabActive: {
    backgroundColor: colors.bgElevated,
  },
  tabText: {
    ...typography.caption,
    fontSize: 13,
  },
  tabTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  panel: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    backgroundColor: colors.bgSurface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionLabel: {
    ...typography.label,
    marginBottom: spacing.sm,
  },
  moodInput: {
    backgroundColor: colors.bgElevated,
    color: colors.textPrimary,
    paddingHorizontal: spacing.md,
    paddingVertical: Platform.OS === 'ios' ? spacing.md : spacing.sm,
    borderRadius: radius.md,
    fontSize: 15,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  moodResult: {
    marginTop: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.bgElevated,
    borderRadius: radius.md,
  },
  moodLabel: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  moodConfidence: {
    ...typography.caption,
    marginBottom: spacing.sm,
  },
  adjustmentChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.xs,
  },
  sliderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  sliderValue: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '700',
    width: 44,
  },
  sliderTrack: {
    flex: 1,
    height: 6,
    backgroundColor: colors.bgElevated,
    borderRadius: 3,
    overflow: 'hidden',
  },
  sliderFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
  btnPrimary: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  btnPrimaryText: {
    color: colors.textInverse,
    fontWeight: '700',
    fontSize: 15,
  },
  btnSecondary: {
    backgroundColor: colors.bgElevated,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  btnSecondaryText: {
    color: colors.textPrimary,
    fontWeight: '500',
    fontSize: 14,
  },
  btnDisabled: {
    opacity: 0.4,
  },
  btnGroup: {
    gap: spacing.sm,
  },
  btnSmall: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: colors.bgElevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  btnSmallText: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
  },
  warningText: {
    ...typography.caption,
    color: colors.warning,
    marginTop: spacing.md,
  },
  infoText: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: spacing.md,
    fontStyle: 'italic',
  },
  colorSwatches: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  swatch: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  infoEmpty: {
    ...typography.body,
    fontStyle: 'italic',
  },
  bottomActions: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
  },
  processingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
  },
  processingText: {
    ...typography.body,
    color: colors.textPrimary,
    marginTop: spacing.md,
  },
});
