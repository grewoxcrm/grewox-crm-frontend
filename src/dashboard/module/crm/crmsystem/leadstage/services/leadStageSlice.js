import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    stageOrder: [], // Array of stage IDs in order
};

const leadStageSlice = createSlice({
    name: 'leadStage',
    initialState,
    reducers: {
        setStageOrder: (state, action) => {
            state.stageOrder = action.payload;
        },
        updateStageOrder: (state, action) => {
            state.stageOrder = action.payload;
        },
        resetStageOrder: (state) => {
            state.stageOrder = [];
        },
    },
});

export const { setStageOrder, updateStageOrder, resetStageOrder } = leadStageSlice.actions;

// Selectors
export const selectStageOrder = (state) => state.leadStage.stageOrder;

export default leadStageSlice.reducer; 