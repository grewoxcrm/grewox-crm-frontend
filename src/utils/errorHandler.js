export const handleApiError = (error) => {
    if (error.response) {
        // Server responded with a status code outside of 2xx range
        const message = error.response.data?.message || 'An error occurred';
        const status = error.response.status;

        switch (status) {
            case 401:
                return {
                    message: 'Unauthorized access. Please login again.',
                    type: 'auth',
                    status
                };
            case 403:
                return {
                    message: 'You do not have permission to perform this action.',
                    type: 'permission',
                    status
                };
            case 404:
                return {
                    message: 'Resource not found.',
                    type: 'notFound',
                    status
                };
            case 422:
                return {
                    message: 'Validation error.',
                    type: 'validation',
                    errors: error.response.data?.errors,
                    status
                };
            default:
                return {
                    message,
                    type: 'error',
                    status
                };
        }
    } else if (error.request) {
        // Request was made but no response received
        return {
            message: 'No response from server. Please check your internet connection.',
            type: 'network',
            status: 0
        };
    } else {
        // Something happened in setting up the request
        return {
            message: error.message || 'An unexpected error occurred.',
            type: 'unknown',
            status: 0
        };
    }
};

export default handleApiError; 