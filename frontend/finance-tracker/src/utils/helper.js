import moment from "moment";

export const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
};

export const getInitials = (name) => {
    if (!name) return "";

    const parts = name.split(" ").filter(Boolean);
    let initials = "";

    for (let i = 0; i < Math.min(parts.length, 2); i++) {
        initials += parts[i][0];
    }

    return initials.toUpperCase();
};

export const addThousandsSeparator = (num) => {
    if (num === null || num === undefined || isNaN(Number(num))) return "";

    const val = Number(num);
    const hasDecimal = val % 1 !== 0;
    
    // Format to 2 decimal places if it has decimal, otherwise format as integer
    const formattedNum = hasDecimal ? val.toFixed(2) : val.toString();
    const [integerPart, fractionalPart] = formattedNum.split(".");
    
    // Indian numbering system: first 3 digits, then groups of 2
    // Example: 13558927 -> 1,35,58,927
    const digits = integerPart.split("").reverse();
    let formattedInteger = "";
    
    for (let i = 0; i < digits.length; i++) {
        // Add comma before digit if:
        // - After first 3 digits (i === 3)
        // - Then every 2 digits after that (i === 5, 7, 9, 11, ...)
        // Pattern: i === 3, 5, 7, 9, 11, ...
        if (i > 0 && (i === 3 || (i > 3 && (i - 3) % 2 === 0))) {
            formattedInteger = "," + formattedInteger;
        }
        formattedInteger = digits[i] + formattedInteger;
    }

    return fractionalPart ? `${formattedInteger}.${fractionalPart}` : formattedInteger;
};

export const prepareExpenseBarChartData = (data = []) => {
    const chartData = data.map((item) => ({
        category: item?.category,
        amount: item?.amount,
    }));

    return chartData;
};

export const prepareIncomeBarChartData = (data = []) => {
    if (!data || data.length === 0) return [];
    
    // Sort and map in one pass for better performance
    const chartData = [...data]
        .sort((a, b) => {
            const dateA = a?.date ? new Date(a.date).getTime() : 0;
            const dateB = b?.date ? new Date(b.date).getTime() : 0;
            return dateA - dateB;
        })
        .map((item) => ({
            name: item?.date ? moment(item.date).format('DD MMM') : '',
            amount: Number(item?.amount) || 0,
            source: item?.source || '',
        }));

    return chartData;
};

export const prepareExpenseLineChartData = (data = []) => {
    if (!data || data.length === 0) return [];
    
    // Sort and map in one pass for better performance
    const chartData = [...data]
        .sort((a, b) => {
            const dateA = a?.date ? new Date(a.date).getTime() : 0;
            const dateB = b?.date ? new Date(b.date).getTime() : 0;
            return dateA - dateB;
        })
        .map((item) => ({
            month: item?.date ? moment(item.date).format('DD') : '',
            amount: Number(item?.amount) || 0,
            category: item?.category || '',
        }));

    return chartData;
};