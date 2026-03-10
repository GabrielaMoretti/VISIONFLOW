/**
 * CreationStudioScreen — Native fallback
 * The full studio experience is web-only (see CreationStudioScreen.web.tsx).
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../constants/theme';

export default function CreationStudioScreen() {
  return (
    <View style={styles.root}>
      <Text style={styles.icon}>🖥️</Text>
      <Text style={styles.title}>VisionFlow Studio</Text>
      <Text style={styles.subtitle}>
        O Estúdio de Criação está disponível apenas na versão Web.
      </Text>
      <Text style={styles.hint}>Execute: npx expo start --web</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1, backgroundColor: colors.bg,
    alignItems: 'center', justifyContent: 'center', padding: 32,
  },
  icon: { fontSize: 48, marginBottom: 16 },
  title: { color: colors.textPrimary, fontSize: 22, fontWeight: '700', marginBottom: 8 },
  subtitle: { color: colors.textSecondary, fontSize: 15, textAlign: 'center', marginBottom: 16 },
  hint: {
    color: colors.primary, fontSize: 13, fontFamily: 'monospace',
    backgroundColor: colors.bgElevated, padding: 12, borderRadius: 8,
  },
});
