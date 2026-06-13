import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import targetReducer from './targetSlice';
import dashboardReducer from './dashboardSlice';
import insightsReducer from './insightsSlice';
import workspaceReducer from './workspaceSlice';
import notificationReducer from './notificationSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    target: targetReducer,
    dashboard: dashboardReducer,
    insights: insightsReducer,
    workspace: workspaceReducer,
    notifications: notificationReducer,
  },
  devTools: process.env.NODE_ENV !== 'production',
});
