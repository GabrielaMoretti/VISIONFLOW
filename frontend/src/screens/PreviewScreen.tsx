/**
 * PreviewScreen — Visualização & Exportação
 *
 * Shows the final result of the color-graded image with:
 *   - Device frame simulation
 *   - Before/After comparison
 *   - Export options
 *   - Color analysis summary
 */

import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { colors, spacing, radius, typography } from '../constants/theme';
import { useAppSelector } from '../store';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type PreviewNav = StackNavigationProp<RootStackParamList, 'Preview'>;
type PreviewRoute = RouteProp<RootStackParamList, 'Preview'>;

interface Props {
  navigation: PreviewNav;
  route: PreviewRoute;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function PreviewScreen({ navigation, route }: Props) {
  const { projectId, imageId } = route.params;

  const project = useAppSelector((s) =>
    s.project.projects.find((p) => p.id === projectId)
  );
  const image = project?.images.find((i) => i.id === imageId);
  const editor = useAppSelector((s) => s.editor);

  const [showOriginal, setShowOriginal] = useState(false);

  const handleExport = useCallback(() => {
    Alert.alert(
      'Exportar',
      'Formatos disponíveis: PNG, JPEG (sRGB).\n\nA função de exportação completa (com perfil de cor, metadados EXIF, device frame) será implementada na próxima etapa.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Salvar na galeria',
          onPress: () => Alert.alert('✅ Sucesso', 'A imagem foi salva. (simulado)'),
        },
      ]
    );
  }, []);

  const handleShare = useCallback(() => {
    Alert.alert(
      'Compartilhar',
      'Integração com share sheet nativa será adicionada com expo-sharing.',
      [{ text: 'OK' }]
    );
  }, []);

  if (!image) {
    return (
      <View style={styles.root}>
        <Text style={styles.errorText}>Imagem não encontrada.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      {/* Device preview frame */}
      <View style={styles.deviceFrame}>
        <View style={styles.deviceNotch} />
        <View style={styles.deviceScreen}>
          <Image
            source={{ uri: image.uri }}
            style={styles.previewImage}
            resizeMode="contain"
          />
        </View>
        <View style={styles.deviceChin} />
      </View>

      {/* Before / After toggle */}
      <View style={styles.compareRow}>
        <TouchableOpacity
          style={[styles.compareBtn, !showOriginal && styles.compareBtnActive]}
          onPress={() => setShowOriginal(false)}
        >
          <Text style={[styles.compareBtnText, !showOriginal && styles.compareBtnTextActive]}>
            Editada
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.compareBtn, showOriginal && styles.compareBtnActive]}
          onPress={() => setShowOriginal(true)}
        >
          <Text style={[styles.compareBtnText, showOriginal && styles.compareBtnTextActive]}>
            Original
          </Text>
        </TouchableOpacity>
      </View>

      {/* Mood summary */}
      {editor.moodNames.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>MOOD APLICADO</Text>
          <Text style={styles.cardValue}>{editor.moodNames.join(', ')}</Text>
          <Text style={styles.cardSub}>
            Intensidade: {Math.round(editor.intensity * 100)}% • Confiança: {editor.moodConfidence}%
          </Text>
          {editor.currentAdjustments && (
            <View style={styles.adjustGrid}>
              <AdjustCell label="Hue" value={`${editor.currentAdjustments.hueDelta.toFixed(1)}°`} />
              <AdjustCell label="Chroma" value={editor.currentAdjustments.chromaDelta.toFixed(3)} />
              <AdjustCell label="Lightness" value={editor.currentAdjustments.lightnessDelta.toFixed(3)} />
              <AdjustCell label="Filmic" value={editor.currentAdjustments.filmicPreset} />
            </View>
          )}
        </View>
      )}

      {/* Color analysis */}
      {image.colorAnalysis && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>ANÁLISE DE COR</Text>
          <View style={styles.metricsGrid}>
            <MetricCell label="Temperatura" value={`${image.colorAnalysis.temperature_kelvin}K`} />
            <MetricCell label="Harmonia" value={image.colorAnalysis.color_harmony} />
            <MetricCell label="Saturação" value={image.colorAnalysis.saturation_level} />
            <MetricCell label="Lightness" value={`${image.colorAnalysis.average_lightness}%`} />
          </View>
          <View style={styles.colorSwatches}>
            {image.colorAnalysis.dominant_colors_hex.map((hex, i) => (
              <View key={i} style={[styles.swatch, { backgroundColor: hex }]}>
                <Text style={styles.swatchLabel}>{hex}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Compliance checklist */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>CHECKLIST DE QUALIDADE</Text>
        <CheckRow label="Imagem carregada" ok />
        <CheckRow label="Mood text analisado" ok={editor.moodNames.length > 0} />
        <CheckRow label="Color analysis backend" ok={!!image.colorAnalysis} />
        <CheckRow label="Gamut sRGB verificado" ok={false} />
        <CheckRow label="Resolução ≥ 1080p" ok={false} />
      </View>

      {/* Export actions */}
      <View style={styles.exportRow}>
        <TouchableOpacity style={styles.btnPrimary} onPress={handleExport}>
          <Text style={styles.btnPrimaryText}>💾 Exportar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btnSecondary} onPress={handleShare}>
          <Text style={styles.btnSecondaryText}>📤 Compartilhar</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

// ---------------------------------------------------------------------------
// Small sub-components
// ---------------------------------------------------------------------------

function AdjustCell({ label, value }: { label: string; value: string }) {
  return (
    <View style={subStyles.adjustCell}>
      <Text style={subStyles.adjustLabel}>{label}</Text>
      <Text style={subStyles.adjustValue}>{value}</Text>
    </View>
  );
}

function MetricCell({ label, value }: { label: string; value: string }) {
  return (
    <View style={subStyles.metricCell}>
      <Text style={subStyles.metricLabel}>{label}</Text>
      <Text style={subStyles.metricValue}>{value}</Text>
    </View>
  );
}

function CheckRow({ label, ok }: { label: string; ok: boolean }) {
  return (
    <View style={subStyles.checkRow}>
      <Text style={subStyles.checkIcon}>{ok ? '✅' : '⬜'}</Text>
      <Text style={[subStyles.checkLabel, ok && subStyles.checkLabelDone]}>{label}</Text>
    </View>
  );
}

const subStyles = StyleSheet.create({
  adjustCell: {
    alignItems: 'center',
    flex: 1,
    paddingVertical: spacing.sm,
  },
  adjustLabel: {
    ...typography.caption,
    marginBottom: 2,
  },
  adjustValue: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 14,
  },
  metricCell: {
    width: '48%',
    paddingVertical: spacing.sm,
  },
  metricLabel: {
    ...typography.caption,
    marginBottom: 2,
  },
  metricValue: {
    color: colors.textPrimary,
    fontWeight: '600',
    fontSize: 14,
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  checkIcon: {
    fontSize: 16,
    marginRight: spacing.sm,
  },
  checkLabel: {
    ...typography.body,
    color: colors.textSecondary,
  },
  checkLabelDone: {
    color: colors.textPrimary,
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
    paddingVertical: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  errorText: {
    ...typography.body,
    color: colors.error,
    textAlign: 'center',
    marginTop: spacing.xxl,
  },
  deviceFrame: {
    alignSelf: 'center',
    width: 260,
    borderRadius: 28,
    backgroundColor: '#111',
    padding: 8,
    marginBottom: spacing.lg,
  },
  deviceNotch: {
    width: 80,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#222',
    alignSelf: 'center',
    marginBottom: 6,
  },
  deviceScreen: {
    height: 440,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: colors.bgSurface,
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  deviceChin: {
    height: 10,
    backgroundColor: 'transparent',
  },
  compareRow: {
    flexDirection: 'row',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    backgroundColor: colors.bgSurface,
    borderRadius: radius.md,
    padding: spacing.xs,
  },
  compareBtn: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: radius.sm,
  },
  compareBtnActive: {
    backgroundColor: colors.bgElevated,
  },
  compareBtnText: {
    ...typography.body,
    color: colors.textMuted,
  },
  compareBtnTextActive: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  card: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    backgroundColor: colors.bgSurface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardTitle: {
    ...typography.label,
    marginBottom: spacing.sm,
  },
  cardValue: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  cardSub: {
    ...typography.caption,
    marginBottom: spacing.sm,
  },
  adjustGrid: {
    flexDirection: 'row',
    marginTop: spacing.sm,
    backgroundColor: colors.bgElevated,
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  colorSwatches: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  swatch: {
    width: 48,
    height: 48,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 2,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  swatchLabel: {
    color: '#fff',
    fontSize: 8,
    fontWeight: '600',
    ...(Platform.OS === 'web'
      ? { textShadow: '0 0 2px #000' }
      : { textShadowColor: '#000', textShadowRadius: 2 }),
  },
  exportRow: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.sm,
    gap: spacing.md,
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
    backgroundColor: colors.bgSurface,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  btnSecondaryText: {
    color: colors.textPrimary,
    fontWeight: '600',
    fontSize: 15,
  },
});
