import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    companies: [],
    selectedCompany: null,
    isModalOpen: false,
    isEditing: false,
};

const companySlice = createSlice({
    name: 'company',
    initialState,
    reducers: {
        setCompanies: (state, action) => {
            state.companies = action.payload;
        },
        setSelectedCompany: (state, action) => {
            state.selectedCompany = action.payload;
        },
        setIsModalOpen: (state, action) => {
            state.isModalOpen = action.payload;
        },
        setIsEditing: (state, action) => {
            state.isEditing = action.payload;
        },
        resetCompanyState: (state) => {
            state.selectedCompany = null;
            state.isModalOpen = false;
            state.isEditing = false;
        },
    },
});

export const {
    setCompanies,
    setSelectedCompany,
    setIsModalOpen,
    setIsEditing,
    resetCompanyState,
} = companySlice.actions;

export default companySlice.reducer; 