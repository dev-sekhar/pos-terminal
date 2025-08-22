import React from 'react';
import { Box, Typography } from '@mui/material';

const PieChart = ({ data, title, subtitle, colors = ['#1976d2', '#dc004e', '#ed6c02', '#2e7d32', '#9c27b0'] }) => {
  if (!data || data.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height={200}>
        <Typography color="text.secondary">No data available</Typography>
      </Box>
    );
  }

  const total = data.reduce((sum, item) => sum + item.value, 0);
  let cumulativePercentage = 0;

  const createPath = (percentage, startAngle) => {
    const angle = (percentage / 100) * 360;
    const endAngle = startAngle + angle;
    
    const x1 = 50 + 40 * Math.cos((startAngle * Math.PI) / 180);
    const y1 = 50 + 40 * Math.sin((startAngle * Math.PI) / 180);
    const x2 = 50 + 40 * Math.cos((endAngle * Math.PI) / 180);
    const y2 = 50 + 40 * Math.sin((endAngle * Math.PI) / 180);
    
    const largeArc = angle > 180 ? 1 : 0;
    
    return `M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`;
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom align="center">{title}</Typography>
      {subtitle && (
        <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 2 }}>
          {subtitle}
        </Typography>
      )}
      <Box display="flex" alignItems="center" gap={2}>
        <svg width="200" height="200" viewBox="0 0 100 100">
          {data.map((item, index) => {
            const percentage = (item.value / total) * 100;
            const startAngle = (cumulativePercentage / 100) * 360 - 90; // Start from top
            const path = createPath(percentage, startAngle);
            cumulativePercentage += percentage;
            
            return (
              <path
                key={index}
                d={path}
                fill={colors[index % colors.length]}
                stroke="#fff"
                strokeWidth="0.5"
              />
            );
          })}
        </svg>
        
        <Box>
          {data.map((item, index) => (
            <Box key={index} display="flex" alignItems="center" mb={0.5}>
              <Box
                width={12}
                height={12}
                bgcolor={colors[index % colors.length]}
                mr={1}
                borderRadius="2px"
              />
              <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                {item.label}: {item.value}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default PieChart;