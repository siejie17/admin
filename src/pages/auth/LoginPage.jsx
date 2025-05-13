import React, { useState } from 'react';
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
  Alert
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  Stars
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import logo from '../../assets/logo.png';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { auth, db } from '../../utils/firebaseConfig';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { setItem } from '../../utils/localStorage';

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const [invalidSnackbarOpen, setInvalidSnackbarOpen] = useState(false);
  const [errorSnackbarOpen, setErrorSnackbarOpen] = useState(false);

  // Blue-themed colors
  const primaryColor = '#6488cc'; // Bright blue
  const secondaryColor = '#1E3A8A'; // Deep navy blue
  const accentColor = '#93C5FD'; // Light sky blue
  const darkColor = '#0F2447'; // Dark blue-black

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

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

    // Reset errors
    setEmailError('');
    setPasswordError('');

    // Email validation
    if (!email) {
      setEmailError('Email is required');
      isValid = false;
    } else if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      isValid = false;
    }

    // Password validation
    if (!password) {
      setPasswordError('Password is required');
      isValid = false;
    }

    if (isValid) {
      // Handle login logic here
      try {
        const adminQuery = query(collection(db, "admin"), where("email", "==", email));
        const adminSnap = await getDocs(adminQuery);

        if (adminSnap.empty) {
          setInvalidSnackbarOpen(true);
          return;
        }

        const adminData = adminSnap.docs[0].data();

        await setItem("admin", JSON.stringify(adminData));

        await signInWithEmailAndPassword(auth, email, password);
      } catch (error) {
        console.error("Something went wrong:", error);
        setErrorSnackbarOpen(true);
      }
    }
  };

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setInvalidSnackbarOpen(false);
  };

  const handleErrorClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setErrorSnackbarOpen(false);
  };

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
          bgcolor: '#F7F9FB',
          overflow: 'hidden'
        }}
      >
        <Paper
          elevation={0}
          sx={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            width: '100%',
            height: '100%',
            margin: 0,
            borderRadius: 0,
            overflow: 'hidden'
          }}
        >
          {/* Left side - Brand/Logo section */}
          <Box
            sx={{
              flex: isMobile ? '1 0 auto' : '0 0 45%',
              bgcolor: primaryColor,
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
            <Box
              sx={{
                position: 'relative',
                zIndex: 1
              }}
            >
              {/* Trophy icon as logo */}
              <Avatar
                sx={{
                  width: 90,
                  height: 90,
                  bgcolor: 'white',
                  mb: 3,
                  boxShadow: `0 8px 24px rgba(0,0,0,0.2)`,
                  mx: 'auto',
                  border: `4px solid ${accentColor}`
                }}
              >
                <img
                  src={logo}
                  style={{ width: 50, height: 50 }}
                />
              </Avatar>

              <Typography
                variant="h3"
                fontWeight="bold"
                gutterBottom
                sx={{ textShadow: '2px 2px 4px rgba(0,0,0,0.2)' }}
              >
                UniEXP
              </Typography>

              <Typography
                variant="h6"
                sx={{ opacity: 0.9, mb: 4, fontWeight: 500 }}
              >
                Ready to create your next amazing event?
              </Typography>

              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 2
                }}
              >
                <Stars sx={{ color: accentColor, mr: 1 }} />
                <Typography
                  variant="body1"
                  sx={{ fontWeight: 500 }}
                >
                  Sign in to continue the adventure!
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Right side - Login form */}
          <Box
            sx={{
              flex: '1 1 auto',
              p: { xs: 3, sm: 4, md: 6 },
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              bgcolor: '#ffffff',
              minHeight: isMobile ? '60vh' : '100vh'
            }}
          >
            <Typography
              variant="h4"
              fontWeight="bold"
              sx={{ mb: 1, color: darkColor }}
            >
              Welcome Back!
            </Typography>

            <Typography
              variant="body1"
              sx={{ mb: 4, color: 'text.secondary' }}
            >
              Enter your credentials to access your event dashboard
            </Typography>

            <Box
              component="form"
              onSubmit={handleSubmit}
              noValidate
              sx={{
                width: '100%',
                maxWidth: '600px',
                mx: 'auto'
              }}
            >
              <Grid container spacing={3}>
                <Grid
                  sx={{
                    width: '100%',
                    maxWidth: '600px', // Adjust this value as needed
                    mx: 'auto' // Centers the form if it's not full width
                  }}
                >
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
                    error={!!emailError}
                    helperText={emailError}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Email sx={{ color: secondaryColor }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 3,
                        '&.Mui-focused fieldset': {
                          borderColor: secondaryColor,
                          borderWidth: 2
                        },
                        '&:hover fieldset': {
                          borderColor: secondaryColor,
                        },
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: secondaryColor
                      },
                      "& .MuiFormLabel-asterisk": {
                        color: "red", // Change this to your desired color
                      },
                    }}
                  />
                </Grid>
                <Grid
                  item
                  xs={12}
                  sx={{
                    width: '100%',
                    maxWidth: '600px',
                    mx: 'auto'
                  }}
                >
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
                    error={!!passwordError}
                    helperText={passwordError}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock sx={{ color: secondaryColor }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={handleTogglePasswordVisibility}
                            edge="end"
                            sx={{ color: showPassword ? secondaryColor : 'action.disabled' }}
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 3,
                        '&.Mui-focused fieldset': {
                          borderColor: secondaryColor,
                          borderWidth: 2
                        },
                        '&:hover fieldset': {
                          borderColor: secondaryColor,
                        },
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: secondaryColor
                      },
                      "& .MuiFormLabel-asterisk": {
                        color: "red", // Change this to your desired color
                      },
                    }}
                  />
                </Grid>
              </Grid>

              <Box
                sx={{
                  mt: 2,
                  display: 'flex',
                  justifyContent: 'flex-end'
                }}
              >
                <Link
                  component={RouterLink}
                  to="/password-reset"
                  variant="body2"
                  underline="hover"
                  sx={{
                    color: primaryColor,
                    fontWeight: 500,
                    transition: 'all 0.2s',
                    '&:hover': {
                      color: darkColor,
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
                sx={{
                  mt: 4,
                  mb: 2,
                  py: 1.5,
                  borderRadius: '20px',
                  fontWeight: 'bold',
                  textTransform: 'none',
                  fontSize: '1.1rem',
                  backgroundColor: primaryColor,
                  boxShadow: `0 4px 12px rgba(255, 107, 107, 0.4)`,
                  transition: 'all 0.3s',
                  '&:hover': {
                    backgroundColor: darkColor,
                    transform: 'scale(1.03)',
                    boxShadow: `0 6px 16px rgba(26, 83, 92, 0.4)`,
                  }
                }}
              >
                Let's Go!
              </Button>
            </Box>

            <Snackbar
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              open={invalidSnackbarOpen}
              autoHideDuration={4000}
              onClose={handleClose}
            >
              <Alert
                severity="error"
                variant="filled"
                sx={{ width: '100%' }}
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
                sx={{ width: '100%' }}
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