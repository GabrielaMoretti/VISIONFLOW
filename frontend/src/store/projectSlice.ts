/**
 * Project Slice — manages project list and active project state.
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import * as api from '../services/api';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ProjectImage {
  id: string;
  filename: string;
  originalName: string;
  uri: string;
  format: string;
  size: number;
  uploadedAt: string;
  /** Server-side color analysis (populated after analyze call) */
  colorAnalysis?: api.ColorAnalysis | null;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  images: ProjectImage[];
  createdAt: string;
  updatedAt: string;
}

interface ProjectState {
  projects: Project[];
  activeProjectId: string | null;
  loading: boolean;
  error: string | null;
  backendConnected: boolean;
}

const initialState: ProjectState = {
  projects: [],
  activeProjectId: null,
  loading: false,
  error: null,
  backendConnected: false,
};

// ---------------------------------------------------------------------------
// Async thunks
// ---------------------------------------------------------------------------

export const checkBackendHealth = createAsyncThunk(
  'project/checkHealth',
  async () => {
    const result = await api.checkHealth();
    return result;
  }
);

export const uploadImageToProject = createAsyncThunk(
  'project/uploadImage',
  async (
    { projectId, uri, filename }: { projectId: string; uri: string; filename: string },
    { rejectWithValue }
  ) => {
    try {
      const result = await api.uploadImage(uri, filename);
      return { projectId, image: result };
    } catch (err: any) {
      return rejectWithValue(err.message ?? 'Upload failed');
    }
  }
);

export const analyzeImage = createAsyncThunk(
  'project/analyzeImage',
  async (
    { projectId, imageId }: { projectId: string; imageId: string },
    { rejectWithValue }
  ) => {
    try {
      const result = await api.analyzeColors(imageId);
      return { projectId, imageId, analysis: result };
    } catch (err: any) {
      return rejectWithValue(err.message ?? 'Analysis failed');
    }
  }
);

// ---------------------------------------------------------------------------
// Slice
// ---------------------------------------------------------------------------

const projectSlice = createSlice({
  name: 'project',
  initialState,
  reducers: {
    createProject(state, action: PayloadAction<{ id: string; name: string; description?: string }>) {
      const now = new Date().toISOString();
      state.projects.push({
        id: action.payload.id,
        name: action.payload.name,
        description: action.payload.description ?? '',
        images: [],
        createdAt: now,
        updatedAt: now,
      });
      state.activeProjectId = action.payload.id;
    },
    setActiveProject(state, action: PayloadAction<string | null>) {
      state.activeProjectId = action.payload;
    },
    deleteProject(state, action: PayloadAction<string>) {
      state.projects = state.projects.filter((p) => p.id !== action.payload);
      if (state.activeProjectId === action.payload) {
        state.activeProjectId = null;
      }
    },
    renameProject(state, action: PayloadAction<{ id: string; name: string }>) {
      const proj = state.projects.find((p) => p.id === action.payload.id);
      if (proj) {
        proj.name = action.payload.name;
        proj.updatedAt = new Date().toISOString();
      }
    },
    clearError(state) {
      state.error = null;
    },
    addProcessedImage(
      state,
      action: PayloadAction<{
        projectId: string;
        image: {
          id: string;
          filename: string;
          originalName: string;
          uri: string;
          format: string;
          size: number;
        };
      }>
    ) {
      const proj = state.projects.find((p) => p.id === action.payload.projectId);
      if (proj) {
        const img = action.payload.image;
        proj.images.push({
          id: img.id,
          filename: img.filename,
          originalName: img.originalName,
          uri: img.uri,
          format: img.format,
          size: img.size,
          uploadedAt: new Date().toISOString(),
          colorAnalysis: null,
        });
        proj.updatedAt = new Date().toISOString();
      }
    },
  },
  extraReducers: (builder) => {
    // Health check
    builder.addCase(checkBackendHealth.fulfilled, (state) => {
      state.backendConnected = true;
    });
    builder.addCase(checkBackendHealth.rejected, (state) => {
      state.backendConnected = false;
    });

    // Upload
    builder.addCase(uploadImageToProject.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(uploadImageToProject.fulfilled, (state, action) => {
      state.loading = false;
      const proj = state.projects.find((p) => p.id === action.payload.projectId);
      if (proj) {
        const img = action.payload.image;
        proj.images.push({
          id: img.id,
          filename: img.filename,
          originalName: img.original_name,
          uri: `http://localhost:8000/uploads/${img.filename}`,
          format: img.format,
          size: img.size,
          uploadedAt: img.uploaded_at,
          colorAnalysis: null,
        });
        proj.updatedAt = new Date().toISOString();
      }
    });
    builder.addCase(uploadImageToProject.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Analyze
    builder.addCase(analyzeImage.fulfilled, (state, action) => {
      const proj = state.projects.find((p) => p.id === action.payload.projectId);
      if (proj) {
        const img = proj.images.find((i) => i.id === action.payload.imageId);
        if (img) {
          img.colorAnalysis = action.payload.analysis;
        }
      }
    });
  },
});

export const {
  createProject,
  setActiveProject,
  deleteProject,
  renameProject,
  clearError,
  addProcessedImage,
} = projectSlice.actions;

export default projectSlice.reducer;
