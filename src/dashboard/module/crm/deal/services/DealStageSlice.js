import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    stageOrder: [], // Array of stage IDs in order
};

const dealStageSlice = createSlice({
    name: 'dealStage',
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

export const { setStageOrder, updateStageOrder, resetStageOrder } = dealStageSlice.actions;

// Selectors
export const selectDealStageOrder = (state) => state.dealStage.stageOrder;

export default dealStageSlice.reducer; 