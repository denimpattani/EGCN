import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

// Async Thunks
export const fetchRoom = createAsyncThunk(
  'workspace/fetchRoom',
  async (clientId = null, { rejectWithValue }) => {
    try {
      const url = clientId ? `/workspace/room?clientId=${clientId}` : '/workspace/room';
      const response = await api.get(url);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch room');
    }
  }
);

export const fetchMessages = createAsyncThunk(
  'workspace/fetchMessages',
  async ({ roomId, before = null }, { rejectWithValue }) => {
    try {
      const url = before 
        ? `/workspace/messages/${roomId}?before=${before}` 
        : `/workspace/messages/${roomId}`;
      const response = await api.get(url);
      return { messages: response.data.data, hasMore: response.data.hasMore, before };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch messages');
    }
  }
);

export const fetchUnreadCount = createAsyncThunk(
  'workspace/fetchUnreadCount',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/workspace/messages/unread');
      return response.data.data.count;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch unread count');
    }
  }
);

export const fetchMeetings = createAsyncThunk(
  'workspace/fetchMeetings',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/workspace/meetings');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch meetings');
    }
  }
);

export const createMeeting = createAsyncThunk(
  'workspace/createMeeting',
  async (meetingData, { rejectWithValue }) => {
    try {
      const response = await api.post('/workspace/meetings', meetingData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to schedule meeting');
    }
  }
);

export const updateMeetingStatus = createAsyncThunk(
  'workspace/updateMeetingStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/workspace/meetings/${id}`, { status });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update meeting');
    }
  }
);

const initialState = {
  room: null, // { roomId, partner: { _id, businessName, role... } }
  messages: [],
  unreadCount: 0,
  isLoading: false,
  hasMore: true,
  typingUsers: [], // Array of { userId, username, isTyping }
  meetings: [],
  activeCall: null, // { peerId, callType, status, partnerName }
  error: null,
};

const workspaceSlice = createSlice({
  name: 'workspace',
  initialState,
  reducers: {
    addMessage: (state, action) => {
      // Avoid duplicate socket messages
      const exists = state.messages.some((msg) => msg._id === action.payload._id);
      if (!exists) {
        state.messages.push(action.payload);
      }
    },
    setTyping: (state, action) => {
      const { userId, username, isTyping } = action.payload;
      if (isTyping) {
        if (!state.typingUsers.some((u) => u.userId === userId)) {
          state.typingUsers.push({ userId, username });
        }
      } else {
        state.typingUsers = state.typingUsers.filter((u) => u.userId !== userId);
      }
    },
    markMessageSeen: (state, action) => {
      const { messageId, seenAt } = action.payload;
      state.messages = state.messages.map((msg) =>
        msg._id === messageId ? { ...msg, seenAt } : msg
      );
    },
    setActiveCall: (state, action) => {
      state.activeCall = action.payload;
    },
    clearActiveCall: (state) => {
      state.activeCall = null;
    },
    resetWorkspaceState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      // Fetch Room
      .addCase(fetchRoom.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchRoom.fulfilled, (state, action) => {
        state.isLoading = false;
        state.room = action.payload;
      })
      .addCase(fetchRoom.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Fetch Messages
      .addCase(fetchMessages.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.isLoading = false;
        const { messages, hasMore, before } = action.payload;
        if (before) {
          // Infinite scroll prepended messages
          state.messages = [...messages, ...state.messages];
        } else {
          // Fresh message load
          state.messages = messages;
        }
        state.hasMore = hasMore;
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Fetch Unread Count
      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload;
      })

      // Fetch Meetings
      .addCase(fetchMeetings.fulfilled, (state, action) => {
        state.meetings = action.payload;
      })

      // Create Meeting
      .addCase(createMeeting.fulfilled, (state, action) => {
        state.meetings.push(action.payload);
        state.meetings.sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt));
      })

      // Update Meeting Status
      .addCase(updateMeetingStatus.fulfilled, (state, action) => {
        state.meetings = state.meetings.map((meeting) =>
          meeting._id === action.payload._id ? action.payload : meeting
        );
      });
  },
});

export const {
  addMessage,
  setTyping,
  markMessageSeen,
  setActiveCall,
  clearActiveCall,
  resetWorkspaceState,
} = workspaceSlice.actions;

export default workspaceSlice.reducer;
