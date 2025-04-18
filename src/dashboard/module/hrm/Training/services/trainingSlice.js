import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    trainings: [],
    selectedTraining: null,
    branchTypes: [],
    selectedBranchType: null,
    filters: {
        status: undefined,
        branchType: undefined,
        dateRange: [],
        searchText: '',
    },
    isCreateModalVisible: false,
    isEditModalVisible: false,
    loading: false,
    error: null,
};

const trainingSlice = createSlice({
    name: 'training',
    initialState,
    reducers: {
        setTrainings: (state, action) => {
            state.trainings = action.payload;
        },
        setSelectedTraining: (state, action) => {
            state.selectedTraining = action.payload;
        },
        setBranchTypes: (state, action) => {
            state.branchTypes = action.payload;
        },
        setSelectedBranchType: (state, action) => {
            state.selectedBranchType = action.payload;
        },
        setFilters: (state, action) => {
            state.filters = {
                ...state.filters,
                ...action.payload,
            };
        },
        clearFilters: (state) => {
            state.filters = initialState.filters;
        },
        setCreateModalVisible: (state, action) => {
            state.isCreateModalVisible = action.payload;
        },
        setEditModalVisible: (state, action) => {
            state.isEditModalVisible = action.payload;
        },
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
        setError: (state, action) => {
            state.error = action.payload;
        },
        clearError: (state) => {
            state.error = null;
        },
        // Branch type related actions
        addBranchType: (state, action) => {
            state.branchTypes.push(action.payload);
        },
        updateBranchType: (state, action) => {
            const index = state.branchTypes.findIndex(type => type.id === action.payload.id);
            if (index !== -1) {
                state.branchTypes[index] = action.payload;
            }
        },
        deleteBranchType: (state, action) => {
            state.branchTypes = state.branchTypes.filter(type => type.id !== action.payload);
        },
        // Training related actions
        addTraining: (state, action) => {
            state.trainings.push(action.payload);
        },
        updateTraining: (state, action) => {
            const index = state.trainings.findIndex(training => training.id === action.payload.id);
            if (index !== -1) {
                state.trainings[index] = action.payload;
            }
        },
        deleteTraining: (state, action) => {
            state.trainings = state.trainings.filter(training => training.id !== action.payload);
        },
    },
});

export const {
    setTrainings,
    setSelectedTraining,
    setBranchTypes,
    setSelectedBranchType,
    setFilters,
    clearFilters,
    setCreateModalVisible,
    setEditModalVisible,
    setLoading,
    setError,
    clearError,
    addBranchType,
    updateBranchType,
    deleteBranchType,
    addTraining,
    updateTraining,
    deleteTraining,
} = trainingSlice.actions;

export default trainingSlice.reducer;

