import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  useTheme,
  alpha,
  Chip,
  Fade
} from '@mui/material';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';

const MetricCard = ({ title, value, icon, color, trend, percentage }) => {
  const theme = useTheme();
  const [elevated, setElevated] = useState(false);
  
  // Handle color properly - use theme colors or custom hex
  const getColor = () => {
    if (!color) return theme.palette.primary.main;
    
    // If color is a valid theme color name and exists in the theme
    if (typeof color === 'string' && theme.palette[color] && theme.palette[color].main) {
      return theme.palette[color].main;
    }
    
    // Otherwise treat as a direct color value (hex, rgb, etc.)
    return color;
  };
  
  const defaultColor = getColor();
  const isTrendUp = trend === 'up';
  
  const trendColor = isTrendUp 
    ? theme.palette.success.main 
    : theme.palette.error.main;
  
  const TrendIcon = isTrendUp ? ArrowUpwardIcon : ArrowDownwardIcon;

  return (
    <Card
      elevation={elevated ? 2 : 1}
      onMouseEnter={() => setElevated(true)}
      onMouseLeave={() => setElevated(false)}
      sx={{
        position: 'relative',
        minHeight: '150px',
        minWidth: { xs: '300px', md: '600px', lg: '350px' },
        width: '100%',
        height: '100%',
        mr: { lg: 8 },
        borderRadius: 3,
        overflow: 'visible',
        transition: 'all 0.3s ease',
        transform: elevated ? 'translateY(-2px)' : 'translateY(0)',
        borderLeft: `3px solid ${defaultColor}`,
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          borderRadius: 'inherit',
          background: `radial-gradient(circle at top right, ${alpha(defaultColor, 0.15)}, transparent 70%)`,
          opacity: elevated ? 0.4 : 0.1,
          transition: 'opacity 0.3s ease',
          pointerEvents: 'none',
        }
      }}
    >
      <CardContent sx={{ mr: 1, px: 3, position: 'relative', zIndex: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Typography 
            variant="subtitle1" 
            color="text.primary" 
            fontSize={17}
            fontWeight={600}
          >
            {title}
          </Typography>
          
          {icon && (
            <Box 
              sx={{ 
                height: 40, 
                width: 40, 
                ml: 3,
                borderRadius: 2, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                bgcolor: alpha(defaultColor, 0.1),
                color: defaultColor
              }}
            >
              {icon}
            </Box>
          )}
        </Box>

        <Box 
          sx={{ 
            width: '100%',
            mt: 3,
            mb: 1.5,
            transition: 'transform 0.3s ease',
            transform: elevated ? 'scale(1.03)' : 'scale(1)',
            transformOrigin: 'left'
          }}
        >
          <Typography 
            variant="h4" 
            fontWeight="bold" 
            color="text.primary"
          >
            {value}
          </Typography>
        </Box>
        
        {trend && percentage && (
          <Fade in={true}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
              <Chip
                icon={<TrendIcon fontSize="small" />}
                label={percentage}
                size="small"
                sx={{
                  bgcolor: alpha(trendColor, 0.1),
                  color: trendColor,
                  fontWeight: 'medium',
                  px: 0.5,
                  height: 24
                }}
              />
              <Typography variant="caption" color="text.secondary">
                vs last period
              </Typography>
            </Box>
          </Fade>
        )}
      </CardContent>
    </Card>
  );
};

export default MetricCard;