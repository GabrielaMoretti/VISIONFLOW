/**
 * Editor Slice — manages the active editing session state.
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { OklchMoodAdjustment } from '../utils/moodMapping';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface EditorState {
  /** ID of the image currently being edited */
  activeImageId: string | null;
  /** Current mood / text prompt */
  moodText: string;
  /** Mood analysis confidence (0–100) */
  moodConfidence: number;
  /** Detected mood names */
  moodNames: string[];
  /** OKLCH mood adjustments currently applied */
  currentAdjustments: OklchMoodAdjustment | null;
  /** Intensity slider (0–1) */
  intensity: number;
  /** Active tool tab */
  activeTab: 'color' | 'ai' | 'info';
  /** Processing state */
  processing: boolean;
  processingMessage: string;
  /** Undo/redo history depth */
  undoCount: number;
  redoCount: number;
}

const initialState: EditorState = {
  activeImageId: null,
  moodText: '',
  moodConfidence: 0,
  moodNames: [],
  currentAdjustments: null,
  intensity: 0.65,
  activeTab: 'color',
  processing: false,
  processingMessage: '',
  undoCount: 0,
  redoCount: 0,
};

// ---------------------------------------------------------------------------
// Slice
// ---------------------------------------------------------------------------

const editorSlice = createSlice({
  name: 'editor',
  initialState,
  reducers: {
    setActiveImage(state, action: PayloadAction<string | null>) {
      state.activeImageId = action.payload;
    },
    setMoodText(state, action: PayloadAction<string>) {
      state.moodText = action.payload;
    },
    setMoodResult(
      state,
      action: PayloadAction<{
        moods: string[];
        adjustments: OklchMoodAdjustment;
        confidence: number;
      }>
    ) {
      state.moodNames = action.payload.moods;
      state.currentAdjustments = action.payload.adjustments;
      state.moodConfidence = action.payload.confidence;
    },
    setIntensity(state, action: PayloadAction<number>) {
      state.intensity = Math.max(0, Math.min(1, action.payload));
    },
    setActiveTab(state, action: PayloadAction<EditorState['activeTab']>) {
      state.activeTab = action.payload;
    },
    setProcessing(state, action: PayloadAction<{ active: boolean; message?: string }>) {
      state.processing = action.payload.active;
      state.processingMessage = action.payload.message ?? '';
    },
    resetEditor(state) {
      Object.assign(state, initialState);
    },
  },
});

export const {
  setActiveImage,
  setMoodText,
  setMoodResult,
  setIntensity,
  setActiveTab,
  setProcessing,
  resetEditor,
} = editorSlice.actions;

export default editorSlice.reducer;
