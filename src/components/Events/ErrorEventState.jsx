import React from 'react';
import { styled } from '@mui/material/styles';
import { 
  Paper, 
  Typography, 
  Button, 
  Box,
  alpha,
  keyframes
} from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import RefreshIcon from '@mui/icons-material/Refresh';

// Pulse animation for the error icon
const pulse = keyframes`
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.8;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
`;

// Styled components
const ErrorContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(6),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: theme.spacing(3),
  margin: `${theme.spacing(5)} auto`,
  maxWidth: '550px',
  backgroundColor: alpha(theme.palette.background.paper, 0.95),
  backdropFilter: 'blur(12px)',
  boxShadow: `0 10px 30px ${alpha(theme.palette.common.black, 0.1)}`,
  border: `1px solid ${alpha(theme.palette.error.main, 0.15)}`,
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '4px',
    background: `linear-gradient(90deg, ${theme.palette.error.light}, ${theme.palette.error.main})`,
  },
}));

const IconWrapper = styled(Box)(({ theme }) => ({
  position: 'relative',
  marginBottom: theme.spacing(3),
  '&::after': {
    content: '""',
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    background: alpha(theme.palette.error.main, 0.08),
    transform: 'translate(-50%, -50%)',
    zIndex: -1,
  }
}));

const ErrorIcon = styled(ErrorOutlineIcon)(({ theme }) => ({
  color: theme.palette.error.main,
  fontSize: '72px',
  animation: `${pulse} 2s infinite ease-in-out`
}));

const RetryButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(3),
  padding: `${theme.spacing(1.2)} ${theme.spacing(3.5)}`,
  borderRadius: theme.spacing(2),
  textTransform: 'none',
  fontWeight: 600,
  fontSize: '1rem',
  boxShadow: `0 4px 14px ${alpha(theme.palette.primary.main, 0.2)}`,
  background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${alpha(theme.palette.primary.light, 0.95)})`,
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, 0.35)}`,
    transform: 'translateY(-2px)',
  }
}));

const ErrorMessage = styled(Typography)(({ theme }) => ({
  maxWidth: '90%',
  color: alpha(theme.palette.text.primary, 0.75),
  marginBottom: theme.spacing(1),
  lineHeight: 1.6,
}));

const ErrorEventState = ({ error, fetchEvents }) => {
  return (
    <ErrorContainer elevation={0}>
      <IconWrapper>
        <ErrorIcon />
      </IconWrapper>
      
      <Typography 
        variant="h5" 
        gutterBottom 
        sx={{ 
          fontWeight: 700, 
          fontSize: { xs: '1.3rem', sm: '1.6rem' },
          letterSpacing: '-0.5px',
          mb: 1.5
        }}
      >
        Unable to Load Events
      </Typography>
      
      <ErrorMessage variant="body1">
        {error || "There was a problem retrieving your events. Please try again or contact support if the issue persists."}
      </ErrorMessage>
      
      <RetryButton
        variant="contained"
        disableElevation
        onClick={() => fetchEvents(true)}
        startIcon={<RefreshIcon />}
      >
        Refresh Events
      </RetryButton>
    </ErrorContainer>
  );
};

export default ErrorEventState;