/**
 * Formats a number as currency with the specified currency symbol
 * @param {number} value - The value to format
 * @param {string} currencySymbol - The currency symbol to use (defaults to $)
 * @returns {string} The formatted currency string
 */
export const formatCurrency = (value, currencySymbol = '$') => {
    // Handle null, undefined, or non-numeric values
    if (!value || isNaN(value)) {
        return `${currencySymbol}0.00`;
    }

    // Convert to number if string
    const numValue = typeof value === 'string' ? parseFloat(value) : value;

    // Format with 2 decimal places and thousands separator
    const formattedValue = numValue.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });

    return `${currencySymbol}${formattedValue}`;
}; 