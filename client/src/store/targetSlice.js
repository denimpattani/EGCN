import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

export const submitDailyEntry = createAsyncThunk(
  'target/submitDailyEntry',
  async (entryData, { rejectWithValue }) => {
    try {
      const response = await api.post('/target/daily', entryData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to submit entry');
    }
  }
);

export const fetchTodayEntry = createAsyncThunk(
  'target/fetchTodayEntry',
  async (date, { rejectWithValue }) => {
    try {
      const response = await api.get(`/target/daily${date ? `?date=${date}` : ''}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch entry');
    }
  }
);

export const fetchDailyHistory = createAsyncThunk(
  'target/fetchDailyHistory',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/target/daily/history');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch history');
    }
  }
);

// Module 05: Monthly Target Thunks
export const submitMonthlyTarget = createAsyncThunk(
  'target/submitMonthlyTarget',
  async (targetData, { rejectWithValue }) => {
    try {
      const response = await api.post('/target/monthly', targetData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.response?.data?.errors?.[0]?.message || 'Failed to submit monthly target');
    }
  }
);

export const fetchMonthlyTarget = createAsyncThunk(
  'target/fetchMonthlyTarget',
  async ({ month, year }, { rejectWithValue }) => {
    try {
      const response = await api.get(`/target/monthly/${month}${year ? `?year=${year}` : ''}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch monthly target');
    }
  }
);

export const fetchAllMonthlyTargets = createAsyncThunk(
  'target/fetchAllMonthlyTargets',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/target/monthly/all');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch monthly targets');
    }
  }
);

const initialState = {
  todayEntry: null,
  history: [],
  monthlyTarget: null, // target, achieved, projected, projectionTrend, dailyComparison
  allMonthlyTargets: [],
  isLoading: false,
  isHistoryLoading: false,
  isMonthlyLoading: false,
  error: null,
};

const targetSlice = createSlice({
  name: 'target',
  initialState,
  reducers: {
    clearTargetError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // submitDailyEntry
      .addCase(submitDailyEntry.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(submitDailyEntry.fulfilled, (state, action) => {
        state.isLoading = false;
        state.todayEntry = action.payload;
      })
      .addCase(submitDailyEntry.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // fetchTodayEntry
      .addCase(fetchTodayEntry.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTodayEntry.fulfilled, (state, action) => {
        state.isLoading = false;
        state.todayEntry = action.payload;
      })
      .addCase(fetchTodayEntry.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // fetchDailyHistory
      .addCase(fetchDailyHistory.pending, (state) => {
        state.isHistoryLoading = true;
        state.error = null;
      })
      .addCase(fetchDailyHistory.fulfilled, (state, action) => {
        state.isHistoryLoading = false;
        state.history = action.payload;
      })
      .addCase(fetchDailyHistory.rejected, (state, action) => {
        state.isHistoryLoading = false;
        state.error = action.payload;
      })

      // submitMonthlyTarget
      .addCase(submitMonthlyTarget.pending, (state) => {
        state.isMonthlyLoading = true;
        state.error = null;
      })
      .addCase(submitMonthlyTarget.fulfilled, (state, action) => {
        state.isMonthlyLoading = false;
        // Update the monthlyTarget target details
        if (state.monthlyTarget) {
          state.monthlyTarget.target = action.payload;
        } else {
          state.monthlyTarget = { target: action.payload };
        }
      })
      .addCase(submitMonthlyTarget.rejected, (state, action) => {
        state.isMonthlyLoading = false;
        state.error = action.payload;
      })

      // fetchMonthlyTarget
      .addCase(fetchMonthlyTarget.pending, (state) => {
        state.isMonthlyLoading = true;
        state.error = null;
      })
      .addCase(fetchMonthlyTarget.fulfilled, (state, action) => {
        state.isMonthlyLoading = false;
        state.monthlyTarget = action.payload;
      })
      .addCase(fetchMonthlyTarget.rejected, (state, action) => {
        state.isMonthlyLoading = false;
        state.error = action.payload;
      })

      // fetchAllMonthlyTargets
      .addCase(fetchAllMonthlyTargets.pending, (state) => {
        state.isMonthlyLoading = true;
        state.error = null;
      })
      .addCase(fetchAllMonthlyTargets.fulfilled, (state, action) => {
        state.isMonthlyLoading = false;
        state.allMonthlyTargets = action.payload;
      })
      .addCase(fetchAllMonthlyTargets.rejected, (state, action) => {
        state.isMonthlyLoading = false;
        state.error = action.payload;
      });
  }
});

export const { clearTargetError } = targetSlice.actions;
export default targetSlice.reducer;
