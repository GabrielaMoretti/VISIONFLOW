/**
 * VisionFlow — Redux Store Configuration
 *
 * Uses Redux Toolkit for state management + redux-persist for
 * keeping project data across app restarts.
 */

import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import projectReducer from './projectSlice';
import editorReducer from './editorSlice';

export const store = configureStore({
  reducer: {
    project: projectReducer,
    editor: editorReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
