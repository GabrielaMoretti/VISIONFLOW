/**
 * VisionFlow — Entry Point
 *
 * This is the root file referenced by package.json "main".
 * It wraps the app in the Redux provider and renders the navigator.
 */

import React from 'react';
import { StatusBar } from 'react-native';
import { registerRootComponent } from 'expo';
import { Provider } from 'react-redux';
import { store } from '../frontend/src/store';
import AppNavigator from '../frontend/src/navigation/AppNavigator';

function App() {
  return (
    <Provider store={store}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <AppNavigator />
    </Provider>
  );
}

registerRootComponent(App);
export default App;
