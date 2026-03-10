/**
 * VisionFlow — Root Navigation
 *
 * Stack-based navigation matching the screen spec:
 *   Home → Editor → Preview → Export
 */

import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { colors } from '../constants/theme';

import HomeScreen from '../screens/HomeScreen';
import EditorScreen from '../screens/EditorScreen';
import PreviewScreen from '../screens/PreviewScreen';
import CreationStudioScreen from '../screens/CreationStudioScreen';

// ---------------------------------------------------------------------------
// Navigator param list
// ---------------------------------------------------------------------------

export type RootStackParamList = {
  Home: undefined;
  Studio: undefined;
  Editor: { projectId: string; imageId?: string };
  Preview: { projectId: string; imageId: string };
};

const Stack = createStackNavigator<RootStackParamList>();

// ---------------------------------------------------------------------------
// Dark theme
// ---------------------------------------------------------------------------

const VisionFlowTheme = {
  ...DefaultTheme,
  dark: true,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.primary,
    background: colors.bg,
    card: colors.bgSurface,
    text: colors.textPrimary,
    border: colors.border,
    notification: colors.primary,
  },
};

// ---------------------------------------------------------------------------
// Root Navigator
// ---------------------------------------------------------------------------

export default function AppNavigator() {
  return (
    <NavigationContainer theme={VisionFlowTheme}>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.bgSurface,
            elevation: 0,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
          },
          headerTintColor: colors.textPrimary,
          headerTitleStyle: {
            fontWeight: '600',
            fontSize: 17,
          },
          cardStyle: { backgroundColor: colors.bg },
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: 'VisionFlow' }}
        />
        <Stack.Screen
          name="Studio"
          component={CreationStudioScreen}
          options={{ title: 'Estúdio de Criação', headerShown: false }}
        />
        <Stack.Screen
          name="Editor"
          component={EditorScreen}
          options={{ title: 'Estúdio' }}
        />
        <Stack.Screen
          name="Preview"
          component={PreviewScreen}
          options={{ title: 'Preview' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
