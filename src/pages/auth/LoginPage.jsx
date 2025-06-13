import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  InputAdornment,
  IconButton,
  Link,
  Paper,
  Grid,
  useTheme,
  useMediaQuery,
  Avatar,
  CssBaseline,
  Snackbar,
  Alert,
  CircularProgress,
  Fade,
  Slide
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  Stars,
  KeyboardArrowRight,
  AccountCircle,
  Security
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';

import logo from '../../assets/logo.png';

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [focusedField, setFocusedField] = useState('');

  const [invalidSnackbarOpen, setInvalidSnackbarOpen] = useState(false);
  const [errorSnackbarOpen, setErrorSnackbarOpen] = useState(false);

  // Enhanced color palette with gradients
  const primaryColor = '#6488cc';
  const secondaryColor = '#1E3A8A';
  const accentColor = '#93C5FD';
  const darkColor = '#0F2447';
  const gradientPrimary = 'linear-gradient(135deg, #6488cc 0%, #1E3A8A 100%)';
  const gradientAccent = 'linear-gradient(45deg, #93C5FD 0%, #6488cc 100%)';

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Animation effects
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let isValid = true;

    setEmailError('');
    setPasswordError('');

    if (!email) {
      setEmailError('Email is required');
      isValid = false;
    } else if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      isValid = false;
    }

    if (!password) {
      setPasswordError('Password is required');
      isValid = false;
    }

    if (isValid) {
      setIsLoading(true);
      // Simulate API call
      setTimeout(() => {
        setIsLoading(false);
        setInvalidSnackbarOpen(true);
      }, 2000);
    }
  };

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setInvalidSnackbarOpen(false);
  };

  const handleErrorClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setErrorSnackbarOpen(false);
  };

  // Floating particles component
  const FloatingParticles = () => (
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
      }}
    >
      {[...Array(20)].map((_, i) => (
        <Box
          key={i}
          sx={{
            position: 'absolute',
            width: Math.random() * 4 + 2,
            height: Math.random() * 4 + 2,
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '50%',
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animation: `float${i % 3} ${3 + Math.random() * 4}s ease-in-out infinite`,
            '@keyframes float0': {
              '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
              '50%': { transform: 'translateY(-20px) rotate(180deg)' },
            },
            '@keyframes float1': {
              '0%, 100%': { transform: 'translateX(0px) rotate(0deg)' },
              '50%': { transform: 'translateX(20px) rotate(-180deg)' },
            },
            '@keyframes float2': {
              '0%, 100%': { transform: 'translate(0px, 0px) rotate(0deg)' },
              '33%': { transform: 'translate(15px, -15px) rotate(120deg)' },
              '66%': { transform: 'translate(-15px, -10px) rotate(240deg)' },
            },
          }}
        />
      ))}
    </Box>
  );

  return (
    <>
      <CssBaseline />
      <Box
        sx={{
          minHeight: '100vh',
          width: '100vw',
          margin: 0,
          padding: 0,
          display: 'flex',
          alignItems: 'stretch',
          justifyContent: 'stretch',
          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
          overflow: 'hidden'
        }}
      >
        <Paper
          elevation={24}
          sx={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            width: '100%',
            height: '100%',
            margin: 0,
            borderRadius: 0,
            overflow: 'hidden',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }}
        >
          {/* Left side - Enhanced Brand section */}
          <Box
            sx={{
              flex: isMobile ? '1 0 auto' : '0 0 45%',
              background: gradientPrimary,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              p: { xs: 4, sm: 6 },
              position: 'relative',
              color: 'white',
              textAlign: 'center',
              minHeight: isMobile ? '40vh' : '100vh',
              overflow: 'hidden'
            }}
          >
            <FloatingParticles />

            {/* Animated background shapes */}
            <Box
              sx={{
                position: 'absolute',
                top: '10%',
                right: '10%',
                width: 100,
                height: 100,
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.1)',
                animation: 'pulse 4s ease-in-out infinite',
                '@keyframes pulse': {
                  '0%, 100%': { transform: 'scale(1)', opacity: 0.3 },
                  '50%': { transform: 'scale(1.2)', opacity: 0.1 },
                },
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                bottom: '15%',
                left: '15%',
                width: 60,
                height: 60,
                borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%',
                background: 'rgba(255, 255, 255, 0.1)',
                animation: 'morph 6s ease-in-out infinite',
                '@keyframes morph': {
                  '0%, 100%': { borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%' },
                  '25%': { borderRadius: '58% 42% 75% 25% / 76% 46% 54% 24%' },
                  '50%': { borderRadius: '50% 50% 33% 67% / 55% 27% 73% 45%' },
                  '75%': { borderRadius: '33% 67% 58% 42% / 63% 68% 32% 37%' },
                },
              }}
            />

            <Fade in={mounted} timeout={1000}>
              <Box
                sx={{
                  position: 'relative',
                  zIndex: 1
                }}
              >
                {/* Enhanced logo with glow effect */}
                <Avatar
                  sx={{
                    width: 100,
                    height: 100,
                    background: gradientAccent,
                    mb: 3,
                    boxShadow: '0 20px 40px rgba(0,0,0,0.3), 0 0 30px rgba(147, 197, 253, 0.4)',
                    mx: 'auto',
                    border: '4px solid rgba(255, 255, 255, 0.2)',
                    backdropFilter: 'blur(10px)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'scale(1.1) rotate(5deg)',
                      boxShadow: '0 25px 50px rgba(0,0,0,0.3), 0 0 40px rgba(147, 197, 253, 0.6)',
                    }
                  }}
                >
                  <img
                    src={logo}
                    style={{ width: 50, height: 50 }}
                  />
                </Avatar>

                <Typography
                  variant="h2"
                  fontWeight="800"
                  gutterBottom
                  sx={{
                    textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                    background: 'linear-gradient(45deg, #ffffff 30%, #93C5FD 90%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    mb: 2
                  }}
                >
                  UniEXP
                </Typography>

                <Typography
                  variant="h5"
                  sx={{
                    opacity: 0.95,
                    mb: 4,
                    fontWeight: 400,
                    letterSpacing: '0.5px'
                  }}
                >
                  Ready to create your next amazing event?
                </Typography>

                {/* Feature highlights */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 4 }}>
                  {[
                    { icon: <AccountCircle />, text: 'Secure Authentication' },
                    { icon: <Security />, text: 'Admin Dashboard Access' },
                    { icon: <Stars />, text: 'Premium Event Management' }
                  ].map((feature, index) => (
                    <Slide
                      key={index}
                      direction="right"
                      in={mounted}
                      timeout={1000 + index * 200}
                    >
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 1,
                          p: 2,
                          borderRadius: 3,
                          background: 'rgba(255, 255, 255, 0.1)',
                          backdropFilter: 'blur(10px)',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            background: 'rgba(255, 255, 255, 0.2)',
                            transform: 'translateX(10px)',
                          }
                        }}
                      >
                        {feature.icon}
                        <Typography variant="body1" fontWeight="500">
                          {feature.text}
                        </Typography>
                      </Box>
                    </Slide>
                  ))}
                </Box>
              </Box>
            </Fade>
          </Box>

          {/* Right side - Enhanced Login form */}
          <Box
            sx={{
              flex: '1 1 auto',
              p: { xs: 3, sm: 4, md: 6 },
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
              minHeight: isMobile ? '60vh' : '100vh',
              position: 'relative'
            }}
          >
            {/* Subtle background pattern */}
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                opacity: 0.03,
                backgroundImage: 'radial-gradient(circle at 2px 2px, #6488cc 1px, transparent 0)',
                backgroundSize: '50px 50px',
                pointerEvents: 'none'
              }}
            />

            <Fade in={mounted} timeout={1200}>
              <Box sx={{ width: '100%', maxWidth: '600px', position: 'relative', zIndex: 1 }}>
                <Typography
                  variant="h3"
                  fontWeight="700"
                  sx={{
                    mb: 1,
                    color: darkColor,
                    textAlign: 'center',
                    background: `linear-gradient(45deg, ${darkColor} 30%, ${primaryColor} 90%)`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}
                >
                  Welcome Back!
                </Typography>

                <Typography
                  variant="body1"
                  sx={{
                    mb: 5,
                    color: 'text.secondary',
                    textAlign: 'center',
                    fontSize: '1.1rem'
                  }}
                >
                  Enter your credentials to access your event dashboard
                </Typography>

                <Box
                  component="form"
                  onSubmit={handleSubmit}
                  noValidate
                  sx={{ width: '100%' }}
                >
                  <Grid container spacing={4}>
                    <Grid size={{ xs: 12 }}>
                      <TextField
                        required
                        fullWidth
                        id="email"
                        label="Email Address"
                        name="email"
                        autoComplete="email"
                        autoFocus
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onFocus={() => setFocusedField('email')}
                        onBlur={() => setFocusedField('')}
                        error={!!emailError}
                        helperText={emailError}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Email
                                sx={{
                                  color: focusedField === 'email' ? primaryColor : 'text.secondary',
                                  transition: 'color 0.3s ease'
                                }}
                              />
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 4,
                            background: 'rgba(255, 255, 255, 0.8)',
                            backdropFilter: 'blur(10px)',
                            transition: 'all 0.3s ease',
                            '&.Mui-focused': {
                              background: 'rgba(255, 255, 255, 1)',
                              boxShadow: `0 0 0 3px rgba(100, 136, 204, 0.1)`,
                              transform: 'translateY(-2px)',
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: primaryColor,
                              borderWidth: 2
                            },
                            '&:hover': {
                              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                            },
                            '&:hover fieldset': {
                              borderColor: primaryColor,
                            },
                          },
                          '& .MuiInputLabel-root.Mui-focused': {
                            color: primaryColor,
                            fontWeight: 600
                          },
                          '& .MuiFormLabel-asterisk': {
                            color: '#f44336',
                          },
                        }}
                      />
                    </Grid>

                    <Grid size={{ xs: 12 }}>
                      <TextField
                        required
                        fullWidth
                        name="password"
                        label="Password"
                        type={showPassword ? 'text' : 'password'}
                        id="password"
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onFocus={() => setFocusedField('password')}
                        onBlur={() => setFocusedField('')}
                        error={!!passwordError}
                        helperText={passwordError}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Lock
                                sx={{
                                  color: focusedField === 'password' ? primaryColor : 'text.secondary',
                                  transition: 'color 0.3s ease'
                                }}
                              />
                            </InputAdornment>
                          ),
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                aria-label="toggle password visibility"
                                onClick={handleTogglePasswordVisibility}
                                edge="end"
                                sx={{
                                  color: showPassword ? primaryColor : 'action.disabled',
                                  transition: 'all 0.3s ease',
                                  '&:hover': {
                                    backgroundColor: `${primaryColor}15`,
                                    transform: 'scale(1.1)'
                                  }
                                }}
                              >
                                {showPassword ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 4,
                            background: 'rgba(255, 255, 255, 0.8)',
                            backdropFilter: 'blur(10px)',
                            transition: 'all 0.3s ease',
                            '&.Mui-focused': {
                              background: 'rgba(255, 255, 255, 1)',
                              boxShadow: `0 0 0 3px rgba(100, 136, 204, 0.1)`,
                              transform: 'translateY(-2px)',
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: primaryColor,
                              borderWidth: 2
                            },
                            '&:hover': {
                              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                            },
                            '&:hover fieldset': {
                              borderColor: primaryColor,
                            },
                          },
                          '& .MuiInputLabel-root.Mui-focused': {
                            color: primaryColor,
                            fontWeight: 600
                          },
                          '& .MuiFormLabel-asterisk': {
                            color: '#f44336',
                          },
                        }}
                      />
                    </Grid>
                  </Grid>

                  <Box
                    sx={{
                      mt: 3,
                      display: 'flex',
                      justifyContent: 'flex-end'
                    }}
                  >
                    <Link
                      component={RouterLink}
                      to="/password-reset"
                      variant="body2"
                      underline="none"
                      sx={{
                        color: primaryColor,
                        fontWeight: 600,
                        transition: 'all 0.3s ease',
                        position: 'relative',
                        '&:hover': {
                          color: darkColor,
                          '&:after': {
                            width: '100%'
                          }
                        },
                        '&:after': {
                          content: '""',
                          position: 'absolute',
                          bottom: -2,
                          left: 0,
                          width: 0,
                          height: 2,
                          background: gradientPrimary,
                          transition: 'width 0.3s ease',
                        }
                      }}
                    >
                      Forgot Password?
                    </Link>
                  </Box>

                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    size="large"
                    disabled={isLoading}
                    endIcon={!isLoading && <KeyboardArrowRight />}
                    sx={{
                      mt: 5,
                      mb: 2,
                      py: 2,
                      borderRadius: '25px',
                      fontWeight: 'bold',
                      textTransform: 'none',
                      fontSize: '1.2rem',
                      background: gradientPrimary,
                      boxShadow: '0 8px 25px rgba(100, 136, 204, 0.4)',
                      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                      position: 'relative',
                      overflow: 'hidden',
                      '&:before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: '-100%',
                        width: '100%',
                        height: '100%',
                        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                        transition: 'left 0.5s',
                      },
                      '&:hover': {
                        transform: 'translateY(-3px) scale(1.02)',
                        boxShadow: '0 15px 35px rgba(100, 136, 204, 0.4)',
                        '&:before': {
                          left: '100%',
                        }
                      },
                      '&:active': {
                        transform: 'translateY(-1px) scale(1.01)',
                      },
                      '&:disabled': {
                        background: '#e0e0e0',
                        color: '#9e9e9e',
                        transform: 'none',
                        boxShadow: 'none'
                      }
                    }}
                  >
                    {isLoading && (
                      <CircularProgress
                        size={24}
                        sx={{
                          color: 'white',
                          mr: 2
                        }}
                      />
                    )}
                    {isLoading ? 'Authenticating...' : "Let's Go!"}
                  </Button>
                </Box>
              </Box>
            </Fade>

            <Snackbar
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              open={invalidSnackbarOpen}
              autoHideDuration={4000}
              onClose={handleClose}
            >
              <Alert
                severity="error"
                variant="filled"
                sx={{
                  width: '100%',
                  borderRadius: 3,
                  '& .MuiAlert-icon': {
                    fontSize: '1.5rem'
                  }
                }}
              >
                Invalid admin credentials. Please check and try again.
              </Alert>
            </Snackbar>

            <Snackbar
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              open={errorSnackbarOpen}
              autoHideDuration={4000}
              onClose={handleErrorClose}
            >
              <Alert
                severity="error"
                variant="filled"
                sx={{
                  width: '100%',
                  borderRadius: 3,
                  '& .MuiAlert-icon': {
                    fontSize: '1.5rem'
                  }
                }}
              >
                Something went wrong. Please try again.
              </Alert>
            </Snackbar>
          </Box>
        </Paper>
      </Box>
    </>
  );
};

export default LoginPage;