import { styled } from '@mui/material/styles';
import { Paper, Typography, Box, Button } from '@mui/material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

const EmptyStateContainer = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(6),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.spacing(3),
    margin: `${theme.spacing(5)} auto`,
    maxWidth: '600px',
    background: `linear-gradient(145deg, 
      ${theme.palette.mode === 'dark' 
        ? 'rgba(35, 35, 40, 0.8) 0%, rgba(25, 25, 30, 0.9) 100%' 
        : 'rgba(255, 255, 255, 0.8) 0%, rgba(245, 245, 250, 0.9) 100%'})`,
    backdropFilter: 'blur(12px)',
    boxShadow: theme.palette.mode === 'dark' 
      ? '0 10px 30px -10px rgba(0,0,0,0.3), 0 1px 3px rgba(0,0,0,0.2), inset 0 1px 1px rgba(255,255,255,0.05)'
      : '0 10px 30px -10px rgba(0,0,0,0.1), 0 1px 3px rgba(0,0,0,0.05), inset 0 1px 1px rgba(255,255,255,0.8)',
    border: `1px solid ${theme.palette.mode === 'dark' 
      ? 'rgba(255,255,255,0.05)' 
      : 'rgba(255,255,255,0.8)'}`,
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    '&:hover': {
      transform: 'translateY(-3px)',
      boxShadow: theme.palette.mode === 'dark' 
        ? '0 14px 35px -10px rgba(0,0,0,0.4), 0 1px 3px rgba(0,0,0,0.2), inset 0 1px 1px rgba(255,255,255,0.05)'
        : '0 14px 35px -10px rgba(0,0,0,0.15), 0 1px 3px rgba(0,0,0,0.05), inset 0 1px 1px rgba(255,255,255,0.8)',
    }
  }));
  
  // Stylized icon container
  const IconContainer = styled(Box)(({ theme }) => ({
    position: 'relative',
    marginBottom: theme.spacing(3),
    padding: theme.spacing(2),
    borderRadius: '50%',
    background: `linear-gradient(135deg, 
      ${theme.palette.primary.light} 0%, 
      ${theme.palette.primary.main} 100%)`,
    boxShadow: `0 10px 20px -10px ${theme.palette.primary.main}`,
    '&::before': {
      content: '""',
      position: 'absolute',
      top: '-4px',
      left: '-4px',
      right: '-4px',
      bottom: '-4px',
      borderRadius: '50%',
      background: `linear-gradient(135deg, 
        ${theme.palette.primary.main} 0%, 
        transparent 50%)`,
      opacity: 0.5,
      filter: 'blur(10px)',
      zIndex: -1,
    }
  }));
  
  const EmptyEventState = () => (
    <EmptyStateContainer elevation={0}>
      <IconContainer>
        <CalendarMonthIcon 
          sx={{ 
            fontSize: { xs: 40, sm: 48 }, 
            color: 'white'
          }} 
        />
      </IconContainer>
      
      <Typography 
        variant="h5" 
        gutterBottom 
        sx={{ 
          fontWeight: 700, 
          fontSize: { xs: '1.3rem', sm: '1.6rem' },
          background: 'linear-gradient(90deg, #303F9F 0%, #3F51B5 50%, #7986CB 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          letterSpacing: '-0.02em',
          mb: 1
        }}
      >
        Your List is Empty
      </Typography>
      
      <Typography 
        variant="body1" 
        color="text.secondary"
        sx={{ 
          maxWidth: '85%',
          lineHeight: 1.6,
          fontSize: { xs: '0.95rem', sm: '1rem' }
        }}
      >
        No events found for this time period. Create a new event or change your filters to see more results.
      </Typography>
    </EmptyStateContainer>
  );
  
  export default EmptyEventState;