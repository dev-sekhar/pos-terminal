import React, { useState, useEffect } from 'react';
import { Box, Typography, LinearProgress, Alert, Chip } from '@mui/material';

const PlanLimitsDisplay = () => {
  const [limits, setLimits] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLimits = async () => {
      try {
        const response = await fetch('/api/pricing/limits');
        if (response.ok) {
          const data = await response.json();
          setLimits(data);
        } else {
          setError('Failed to fetch plan limits');
        }
      } catch (err) {
        setError('Error fetching plan limits');
      } finally {
        setLoading(false);
      }
    };

    fetchLimits();
  }, []);

  if (loading) return null;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!limits) return null;

  const renderLimitBar = (resource) => {
    const { currentCount, maxAllowed } = resource;
    const isUnlimited = maxAllowed === 'unlimited';
    const percentage = isUnlimited ? 0 : (currentCount / maxAllowed) * 100;
    const isNearLimit = percentage > 80;
    const isAtLimit = percentage >= 100;

    return (
      <Box sx={{ mb: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
          <Typography variant="body2" fontWeight="medium">
            {resource.currentCount} / {isUnlimited ? '∞' : maxAllowed}
          </Typography>
          {isAtLimit && <Chip label="Limit Reached" color="error" size="small" />}
          {isNearLimit && !isAtLimit && <Chip label="Near Limit" color="warning" size="small" />}
        </Box>
        {!isUnlimited && (
          <LinearProgress
            variant="determinate"
            value={Math.min(percentage, 100)}
            color={isAtLimit ? 'error' : isNearLimit ? 'warning' : 'primary'}
            sx={{ height: 6, borderRadius: 3 }}
          />
        )}
      </Box>
    );
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Plan Usage ({limits.planName})
      </Typography>
      
      <Box mb={2}>
        <Typography variant="subtitle2" color="text.secondary">Users</Typography>
        {renderLimitBar(limits.users)}
      </Box>

      <Box mb={2}>
        <Typography variant="subtitle2" color="text.secondary">Branches</Typography>
        {renderLimitBar(limits.branches)}
      </Box>

      <Box mb={2}>
        <Typography variant="subtitle2" color="text.secondary">Products</Typography>
        {renderLimitBar(limits.products)}
      </Box>

      {limits.features && (
        <Box mt={2}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Available Features
          </Typography>
          <Box display="flex" flexWrap="wrap" gap={1}>
            {limits.features.map((feature, index) => (
              <Chip key={index} label={feature} variant="outlined" size="small" />
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default PlanLimitsDisplay;