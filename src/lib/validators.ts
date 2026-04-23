export const validateAmount = (amount: any) => {
    if (typeof amount !== "number" || isNaN(amount)) {
        return "Amount must be a valid number";
    }

    if (amount <=0){
        return "Amount must be greater than 0";
    }
    
    if (amount > 1000000) {
        return "Amount must be less than or equal to 1,000,000";
    }
    return null; // No validation errors
};