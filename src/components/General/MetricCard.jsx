import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  useTheme,
  alpha,
  Chip,
  Fade,
} from '@mui/material';

const MetricCard = ({ title, subtitle, value, icon, color }) => {
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

  return (
    <Card
      elevation={elevated ? 2 : 1}
      onMouseEnter={() => setElevated(true)}
      onMouseLeave={() => setElevated(false)}
      sx={{
        position: 'relative',
        minHeight: '50px',
        minWidth: { xs: '308px' },
        width: '100%',
        height: '100%',
        mr: { xs: 3, lg: 8.5 },
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
      <CardContent sx={{ mr: 0.2, px: 3, position: 'relative', zIndex: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Typography
            variant="subtitle1"
            color="text.primary"
            fontSize={13}
            fontWeight={550}
          >
            {title}
          </Typography>

          {icon && (
            <Box
              sx={{
                height: 18,
                width: 18,
                ml: 2,
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

        {subtitle && (
          <Fade in={true} timeout={400}>
            <Box
              sx={{
                position: 'relative',
                display: 'inline-flex',
                alignItems: 'center',
                transform: elevated ? 'translateY(-3px)' : 'translateY(0)',
                transition: 'all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
              }}
            >
              <Chip
                label={
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 600,
                      fontSize: '0.7rem',
                      color: elevated ? 'inherit' : theme.palette.text.secondary,
                    }}
                  >
                    {subtitle}
                  </Typography>
                }
                size="small"
                color={elevated ? "primary" : "default"}
                variant={elevated ? "filled" : "outlined"}
                sx={{
                  borderRadius: '16px',
                  px: 0.5,
                  background: elevated
                    ? `linear-gradient(135deg, ${defaultColor}, ${theme.palette.primary.dark})`
                    : theme.palette.background.paper,
                  boxShadow: elevated
                    ? `0 4px 12px ${theme.palette.mode === 'dark'
                      ? 'rgba(0,0,0,0.5)'
                      : `rgba(${parseInt(defaultColor.slice(1, 3), 16)}, ${parseInt(defaultColor.slice(3, 5), 16)}, ${parseInt(defaultColor.slice(5, 7), 16)}, 0.25)`}`
                    : 'none',
                  borderColor: elevated ? 'transparent' : theme.palette.divider,
                  '&:hover': {
                    transform: 'translateY(-1px)',
                    boxShadow: `0 4px 8px ${theme.palette.mode === 'dark'
                      ? 'rgba(0,0,0,0.6)'
                      : `rgba(${parseInt(defaultColor.slice(1, 3), 16)}, ${parseInt(defaultColor.slice(3, 5), 16)}, ${parseInt(defaultColor.slice(5, 7), 16)}, 0.3)`}`,
                  },
                  transition: 'all 0.3s ease',
                }}
              />

              {/* {elevated && (
                <Box
                  sx={{
                    position: 'absolute',
                    height: '2px',
                    width: '60%',
                    bottom: '-4px',
                    left: '20%',
                    background: `linear-gradient(90deg, transparent, ${defaultColor}, transparent)`,
                    borderRadius: '100%',
                    opacity: 0.6,
                  }}
                />
              )} */}
            </Box>
          </Fade>
        )}

        <Box
          sx={{
            width: '100%',
            mt: 2.5,
            mb: 1,
            transition: 'transform 0.3s ease',
            transform: elevated ? 'scale(1.03)' : 'scale(1)',
            transformOrigin: 'left'
          }}
        >
          <Typography
            variant="h5"
            fontWeight="bold"
            color="text.primary"
          >
            {value}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default MetricCard;