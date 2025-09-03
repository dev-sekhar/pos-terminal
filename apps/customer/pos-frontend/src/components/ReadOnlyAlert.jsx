import React from 'react';
import { Alert, Button } from '@mui/material';
import { Payment, Lock } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { usePaymentStatus } from '../hooks/usePaymentStatus';

const ReadOnlyAlert = () => {
  const { isReadOnlyMode, paymentAlert } = usePaymentStatus();
  const navigate = useNavigate();

  if (!isReadOnlyMode) return null;

  return (
    <Alert 
      severity="warning" 
      icon={<Lock />}
      sx={{ mb: 2 }}
      action={
        <Button 
          color="inherit" 
          size="small" 
          startIcon={<Payment />}
          onClick={() => navigate('/app/billing')}
        >
          Make Payment
        </Button>
      }
    >
      Account is in read-only mode due to overdue payments. Add, edit, and delete operations are disabled.
    </Alert>
  );
};

export default ReadOnlyAlert;