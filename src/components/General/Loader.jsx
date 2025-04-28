import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Fade,
  CircularProgress,
  LinearProgress,
  Paper,
  useTheme
} from '@mui/material';
import { AutorenewRounded } from '@mui/icons-material';

const Loader = ({
  loadingText = "Loading...",
  variant = "standard", // standard, circular, pulse
  showProgress = false,
  progressValue = null, // For determinate progress
  color = "primary"
}) => {
  const theme = useTheme();
  const [progress, setProgress] = useState(0);
  const [pulseValue, setPulseValue] = useState(0);

  // Simulated progress animation for indeterminate state
  useEffect(() => {
    if (!showProgress || progressValue === null) {
      const timer = setInterval(() => {
        setProgress((oldProgress) => {
          const diff = Math.random() * 10;
          return Math.min(oldProgress + diff, 100);
        });
      }, 500);

      return () => {
        clearInterval(timer);
      };
    } else {
      setProgress(progressValue);
    }
  }, [progressValue, showProgress]);

  // For pulse animation
  useEffect(() => {
    const pulseTimer = setInterval(() => {
      setPulseValue((v) => (v >= 100 ? 0 : v + 5));
    }, 100);

    return () => {
      clearInterval(pulseTimer);
    };
  }, []);

  const renderLoader = () => {
    switch (variant) {
      case "circular":
        return (
          <Box sx={{ position: 'relative', display: 'inline-flex' }}>
            <CircularProgress
              size={80}
              thickness={4}
              color={color}
              variant={showProgress ? "determinate" : "indeterminate"}
              value={showProgress ? progress : undefined}
              sx={{
                boxShadow: `0 0 15px ${theme.palette[color].light}`,
                borderRadius: '50%',
              }}
            />
            {showProgress && (
              <Box
                sx={{
                  top: 0,
                  left: 0,
                  bottom: 0,
                  right: 0,
                  position: 'absolute',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Typography
                  variant="caption"
                  component="div"
                  color="text.secondary"
                  sx={{ fontWeight: 700 }}
                >
                  {`${Math.round(progress)}%`}
                </Typography>
              </Box>
            )}
          </Box>
        );

      case "pulse":
        return (
          <Box sx={{ position: 'relative', width: '100%', maxWidth: 300 }}>
            <AutorenewRounded
              sx={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
                fontSize: 30,
                color: theme.palette[color].main,
                animation: 'spin 2s linear infinite',
                '@keyframes spin': {
                  '0%': { transform: 'translate(-50%, -50%) rotate(0deg)' },
                  '100%': { transform: 'translate(-50%, -50%) rotate(360deg)' }
                }
              }}
            />
            <Box sx={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              opacity: 0.3 - (pulseValue / 300),
              transform: `scale(${0.8 + pulseValue / 250})`,
              backgroundColor: theme.palette[color].light,
              transition: 'all 0.2s ease-out'
            }} />
            <Box sx={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              backgroundColor: 'transparent',
              border: `2px solid ${theme.palette[color].main}`,
            }} />
          </Box>
        );

      default: // standard
        return (
          <Paper
            elevation={0}
            sx={{
              width: '90%',
              maxWidth: 300,
              p: 2,
              borderRadius: 2,
              background: theme.palette.mode === 'dark'
                ? `linear-gradient(45deg, ${theme.palette.background.paper} 30%, ${theme.palette.grey[800]} 90%)`
                : `linear-gradient(45deg, ${theme.palette.background.paper} 30%, ${theme.palette.grey[100]} 90%)`,
            }}
          >
            <LinearProgress
              variant={showProgress ? "determinate" : "indeterminate"}
              value={showProgress ? progress : undefined}
              color={color}
              sx={{
                height: 6,
                borderRadius: 3,
                mb: 1.5,
                backgroundColor: theme.palette.mode === 'dark'
                  ? 'rgba(255, 255, 255, 0.08)'
                  : 'rgba(0, 0, 0, 0.06)',
                '& .MuiLinearProgress-bar': {
                  borderRadius: 3,
                  backgroundImage: `linear-gradient(90deg, ${theme.palette[color].dark} 0%, ${theme.palette[color].main} 50%, ${theme.palette[color].light} 100%)`,
                }
              }}
            />
            {showProgress && (
              <Typography
                variant="caption"
                align="right"
                sx={{
                  display: 'block',
                  mb: 1,
                  fontWeight: 600,
                  color: theme.palette[color].main
                }}
              >
                {`${Math.round(progress)}%`}
              </Typography>
            )}
          </Paper>
        );
    }
  };

  return (
    <Fade in={true} timeout={800}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: { xs: '80vh', md: '100vh' }, // <-- Full screen height
          gap: 3,
        }}
      >
        {renderLoader()}

        <Typography
          variant="body2"
          color={`${color}.main`}
          sx={{
            mt: 2,
            letterSpacing: 1,
            fontWeight: 500,
            fontSize: '0.9rem',
            textTransform: 'uppercase',
            animation: 'fadeInOut 1.5s infinite ease-in-out',
            '@keyframes fadeInOut': {
              '0%': { opacity: 0.5 },
              '50%': { opacity: 1 },
              '100%': { opacity: 0.5 },
            }
          }}
        >
          {loadingText}
        </Typography>
      </Box>
    </Fade>
  );
};

export default Loader;