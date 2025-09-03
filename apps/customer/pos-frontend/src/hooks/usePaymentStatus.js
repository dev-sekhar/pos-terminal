import { useState, useEffect } from 'react';

export const usePaymentStatus = () => {
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [paymentAlert, setPaymentAlert] = useState(null);

  useEffect(() => {
    const loadPaymentStatus = () => {
      const storedPaymentStatus = localStorage.getItem('paymentStatus');
      const storedPaymentAlert = localStorage.getItem('paymentAlert');
      
      if (storedPaymentStatus) {
        setPaymentStatus(JSON.parse(storedPaymentStatus));
      }
      if (storedPaymentAlert) {
        setPaymentAlert(JSON.parse(storedPaymentAlert));
      }
    };

    loadPaymentStatus();

    // Listen for storage changes (when payment is made)
    const handleStorageChange = (e) => {
      if (e.key === 'paymentStatus' || e.key === 'paymentAlert') {
        loadPaymentStatus();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const isReadOnlyMode = paymentStatus?.stage === 'readonly';
  const isBlocked = paymentStatus?.stage === 'blocked';
  const canEdit = paymentStatus?.canEdit !== false;

  return {
    paymentStatus,
    paymentAlert,
    isReadOnlyMode,
    isBlocked,
    canEdit
  };
};