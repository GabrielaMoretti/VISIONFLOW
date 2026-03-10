/**
 * HomeScreen — Dashboard de Projetos
 *
 * Shows project list, quick actions, backend health indicator,
 * and image import via the system picker.
 */

import React, { useEffect, useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { colors, spacing, radius, typography, shadows } from '../constants/theme';
import {
  useAppDispatch,
  useAppSelector,
} from '../store';
import {
  createProject,
  setActiveProject,
  deleteProject,
  checkBackendHealth,
} from '../store/projectSlice';
import type { Project } from '../store/projectSlice';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type HomeNav = StackNavigationProp<RootStackParamList, 'Home'>;

interface Props {
  navigation: HomeNav;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function HomeScreen({ navigation }: Props) {
  const dispatch = useAppDispatch();
  const { projects, backendConnected, loading } = useAppSelector((s) => s.project);
  const [healthChecked, setHealthChecked] = useState(false);

  // Check backend on mount
  useEffect(() => {
    dispatch(checkBackendHealth()).finally(() => setHealthChecked(true));
  }, [dispatch]);

  // Create project
  const handleNewProject = useCallback(() => {
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    const name = `Projeto ${projects.length + 1}`;
    dispatch(createProject({ id, name }));
    navigation.navigate('Editor', { projectId: id });
  }, [dispatch, navigation, projects.length]);

  // Open existing project
  const handleOpenProject = useCallback(
    (project: Project) => {
      dispatch(setActiveProject(project.id));
      navigation.navigate('Editor', { projectId: project.id });
    },
    [dispatch, navigation]
  );

  // Delete
  const handleDeleteProject = useCallback(
    (id: string) => {
      Alert.alert('Apagar projeto?', 'Esta ação não pode ser desfeita.', [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Apagar', style: 'destructive', onPress: () => dispatch(deleteProject(id)) },
      ]);
    },
    [dispatch]
  );

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  const renderProject = ({ item }: { item: Project }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.7}
      onPress={() => handleOpenProject(item)}
      onLongPress={() => handleDeleteProject(item.id)}
    >
      <View style={styles.cardPreview}>
        {item.images.length > 0 ? (
          <Image
            source={{ uri: item.images[0].uri }}
            style={styles.cardImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.cardPlaceholder}>
            <Text style={styles.cardPlaceholderText}>🎨</Text>
          </View>
        )}
      </View>
      <Text style={styles.cardTitle} numberOfLines={1}>
        {item.name}
      </Text>
      <Text style={styles.cardCaption}>
        {item.images.length} {item.images.length === 1 ? 'imagem' : 'imagens'}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.root}>
      {/* Status bar */}
      <View style={styles.statusBar}>
        <View style={[styles.statusDotBase, backendConnected ? styles.statusDotOnline : styles.statusDotOffline]} />
        <Text style={styles.statusText}>
          {!healthChecked
            ? 'Conectando...'
            : backendConnected
            ? 'Backend conectado'
            : 'Backend offline — modo local'}
        </Text>
      </View>

      {/* Quick actions */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.studioBtn} onPress={() => navigation.navigate('Studio' as any)}>
          <Text style={styles.studioBtnText}>🎬 Estúdio de Criação</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.primaryBtn} onPress={handleNewProject}>
          <Text style={styles.primaryBtnText}>+ Novo Projeto</Text>
        </TouchableOpacity>
      </View>

      {/* Project list */}
      {projects.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>📂</Text>
          <Text style={styles.emptyTitle}>Nenhum projeto ainda</Text>
          <Text style={styles.emptyDesc}>
            Crie um projeto para começar a importar e editar suas imagens.
          </Text>
        </View>
      ) : (
        <FlatList
          data={[...projects].sort(
            (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          )}
          renderItem={renderProject}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.list}
          columnWrapperStyle={styles.listRow}
        />
      )}

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.bgSurface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  statusDotBase: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.sm,
  },
  statusDotOnline: {
    backgroundColor: colors.success,
  },
  statusDotOffline: {
    backgroundColor: colors.error,
  },
  statusText: {
    ...typography.caption,
  },
  actions: {
    flexDirection: 'row',
    padding: spacing.lg,
    gap: spacing.md,
  },
  studioBtn: {
    flex: 1,
    backgroundColor: colors.bgElevated,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  studioBtnText: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 15,
  },
  primaryBtn: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  primaryBtnText: {
    color: colors.textInverse,
    fontWeight: '700',
    fontSize: 15,
  },
  list: {
    padding: spacing.lg,
    paddingTop: 0,
  },
  listRow: {
    gap: spacing.md,
  },
  card: {
    flex: 1,
    backgroundColor: colors.bgCard,
    borderRadius: radius.lg,
    overflow: 'hidden',
    marginBottom: spacing.md,
    ...shadows.card,
  },
  cardPreview: {
    height: 130,
    backgroundColor: colors.bgElevated,
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardPlaceholderText: {
    fontSize: 36,
  },
  cardTitle: {
    ...typography.heading,
    fontSize: 15,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  cardCaption: {
    ...typography.caption,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    paddingTop: spacing.xs,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxl,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  emptyTitle: {
    ...typography.heading,
    marginBottom: spacing.sm,
  },
  emptyDesc: {
    ...typography.body,
    textAlign: 'center',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
