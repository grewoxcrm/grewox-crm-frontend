// Currency formatting helper function
export const formatCurrency = (value, currencyIdOrCode, currencies = []) => {
    if (!value) return '0';

    try {
        const numericValue = parseFloat(value);

        // Find currency details either by ID or code
        const currencyDetails = currencies.find(c =>
            c.id === currencyIdOrCode || c.currencyCode === currencyIdOrCode
        );

        if (!currencyDetails) {
            return `${numericValue} ${currencyIdOrCode || 'USD'}`;
        }

        const { currencyCode, currencyIcon } = currencyDetails;

        // Special handling for RTL currencies
        const rtlCurrencies = ['SAR', 'AED', 'QAR', 'BHD', 'KWD', 'OMR'];
        if (rtlCurrencies.includes(currencyCode)) {
            const formatted = new Intl.NumberFormat('en-US', {
                minimumFractionDigits: 0,
                maximumFractionDigits: 2
            }).format(numericValue);
            return `${formatted} ${currencyIcon}`;
        }

        // Special handling for INR
        if (currencyCode === 'INR') {
            return new Intl.NumberFormat('en-IN', {
                style: 'currency',
                currency: 'INR',
                minimumFractionDigits: 0,
                maximumFractionDigits: 2
            }).format(numericValue);
        }

        // Default formatting for all other currencies
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currencyCode,
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        }).format(numericValue);
    } catch (error) {
        console.error('Error formatting currency:', error);
        return `${value} ${currencyIdOrCode || 'USD'}`;
    }
}; 