import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    code: "",
    language: "63", // Default to JavaScript ID
    output: [],
    input: "",
    isRunning: false
};

const editorSlice = createSlice({
    name: "editor",
    initialState,
    reducers: {
        setCode: (state, action) => {
            state.code = action.payload;
        },
        setLanguage: (state, action) => {
            state.language = action.payload;
        },
        setOutput: (state, action) => {
            state.output = action.payload;
        },
        setInput: (state, action) => {
            state.input = action.payload;
        },
        setIsRunning: (state, action) => {
            state.isRunning = action.payload;
        },
        clearOutput: (state) => {
            state.output = [];
        }
    }
});

export const { setCode, setLanguage, setOutput, setInput, setIsRunning, clearOutput } = editorSlice.actions;
export default editorSlice.reducer;
