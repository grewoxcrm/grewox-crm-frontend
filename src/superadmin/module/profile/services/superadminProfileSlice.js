import { createSlice } from '@reduxjs/toolkit';
import { superadminProfileApi } from './superadminProfileApi';

const initialState = {
    profile: null,
    loading: false,
    error: null,
    updateSuccess: false,
};

const superadminProfileSlice = createSlice({
    name: 'superadminProfile',
    initialState,
    reducers: {
        resetUpdateStatus: (state) => {
            state.updateSuccess = false;
            state.error = null;
        },
        clearProfileError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Get profile
            .addMatcher(
                superadminProfileApi.endpoints.getSuperAdminProfile.matchPending,
                (state) => {
                    state.loading = true;
                    state.error = null;
                }
            )
            .addMatcher(
                superadminProfileApi.endpoints.getSuperAdminProfile.matchFulfilled,
                (state, { payload }) => {
                    state.loading = false;
                    state.profile = payload.data;
                }
            )
            .addMatcher(
                superadminProfileApi.endpoints.getSuperAdminProfile.matchRejected,
                (state, { payload }) => {
                    state.loading = false;
                    state.error = payload?.data?.message || 'Failed to fetch profile';
                }
            )
            // Update profile
            .addMatcher(
                superadminProfileApi.endpoints.updateSuperAdminProfile.matchPending,
                (state) => {
                    state.loading = true;
                    state.error = null;
                    state.updateSuccess = false;
                }
            )
            .addMatcher(
                superadminProfileApi.endpoints.updateSuperAdminProfile.matchFulfilled,
                (state, { payload }) => {
                    state.loading = false;
                    state.profile = payload.data;
                    state.updateSuccess = true;
                }
            )
            .addMatcher(
                superadminProfileApi.endpoints.updateSuperAdminProfile.matchRejected,
                (state, { payload }) => {
                    state.loading = false;
                    state.error = payload?.data?.message || 'Failed to update profile';
                    state.updateSuccess = false;
                }
            );
    },
});

export const { resetUpdateStatus, clearProfileError } = superadminProfileSlice.actions;
export default superadminProfileSlice.reducer;
