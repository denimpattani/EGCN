import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

export const fetchDailyReport = createAsyncThunk(
  'insights/fetchDailyReport',
  async (date, { rejectWithValue }) => {
    try {
      const response = await api.get(`/insights/daily${date ? `?date=${date}` : ''}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch daily report');
    }
  }
);

export const fetchMonthlyReport = createAsyncThunk(
  'insights/fetchMonthlyReport',
  async ({ month, year }, { rejectWithValue }) => {
    try {
      const response = await api.get(`/insights/monthly/${month}${year ? `?year=${year}` : ''}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch monthly report');
    }
  }
);

export const fetchAnnualReport = createAsyncThunk(
  'insights/fetchAnnualReport',
  async (year, { rejectWithValue }) => {
    try {
      const response = await api.get(`/insights/annual/${year}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch annual report');
    }
  }
);

const initialState = {
  dailyReport: null,
  monthlyReport: null,
  annualReport: null,
  isLoading: false,
  error: null,
};

const insightsSlice = createSlice({
  name: 'insights',
  initialState,
  reducers: {
    clearInsightsError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // fetchDailyReport
      .addCase(fetchDailyReport.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDailyReport.fulfilled, (state, action) => {
        state.isLoading = false;
        state.dailyReport = action.payload;
      })
      .addCase(fetchDailyReport.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // fetchMonthlyReport
      .addCase(fetchMonthlyReport.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMonthlyReport.fulfilled, (state, action) => {
        state.isLoading = false;
        state.monthlyReport = action.payload;
      })
      .addCase(fetchMonthlyReport.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // fetchAnnualReport
      .addCase(fetchAnnualReport.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAnnualReport.fulfilled, (state, action) => {
        state.isLoading = false;
        state.annualReport = action.payload;
      })
      .addCase(fetchAnnualReport.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  }
});

export const { clearInsightsError } = insightsSlice.actions;
export default insightsSlice.reducer;
