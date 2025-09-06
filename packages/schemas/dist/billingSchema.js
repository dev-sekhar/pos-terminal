import * as yup from 'yup';
export const paymentSchema = yup.object().shape({
    amount: yup
        .number()
        .required('Payment amount is required')
        .positive('Payment amount must be positive')
        .test('decimal-places', 'Amount cannot have more than 2 decimal places', (value) => {
        if (!value)
            return true;
        return Number(value.toFixed(2)) === value;
    }),
    method: yup
        .string()
        .oneOf(['CARD', 'BANK', 'CASH'], 'Invalid payment method')
        .default('CARD'),
    invoiceId: yup
        .number()
        .required('Invoice ID is required')
        .positive('Invalid invoice ID')
});
export const createPaymentValidation = (maxAmount) => {
    return paymentSchema.shape({
        amount: yup
            .number()
            .required('Payment amount is required')
            .positive('Payment amount must be positive')
            .max(maxAmount || Number.MAX_VALUE, `Payment cannot exceed ${(maxAmount === null || maxAmount === void 0 ? void 0 : maxAmount.toFixed(2)) || 'maximum allowed amount'}`)
            .test('decimal-places', 'Amount cannot have more than 2 decimal places', (value) => {
            if (!value)
                return true;
            return Number(value.toFixed(2)) === value;
        })
    });
};
