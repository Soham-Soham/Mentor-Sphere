import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import roomReducer from './slices/roomSlice';
import editorReducer from './slices/editorSlice';
import codeHistoryReducer from './slices/codeHistorySlice';

const store = configureStore({
    reducer: {
        auth: authReducer,
        room: roomReducer,
        editor: editorReducer,
        codeHistory: codeHistoryReducer
    }
})

export default store;