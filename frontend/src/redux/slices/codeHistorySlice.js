import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    history: [],
    loading: false,
    error: null
};

const codeHistorySlice = createSlice({
    name: "codeHistory",
    initialState,
    reducers: {
        setHistory: (state, action) => {
            state.history = action.payload;
            state.loading = false;
            state.error = null;
        },
        addHistoryItem: (state, action) => {
            state.history.unshift(action.payload); // Add new item to the beginning
        },
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
        setError: (state, action) => {
            state.error = action.payload;
            state.loading = false;
        },
        clearHistory: (state) => {
            state.history = [];
            state.loading = false;
            state.error = null;
        }
    }
});

export const { setHistory, addHistoryItem, setLoading, setError, clearHistory } = codeHistorySlice.actions;
export default codeHistorySlice.reducer;
