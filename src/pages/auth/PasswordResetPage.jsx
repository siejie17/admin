import React, { useState } from 'react';
import {
    Box,
    Button,
    TextField,
    Typography,
    InputAdornment,
    Paper,
    Grid,
    useTheme,
    useMediaQuery,
    Avatar,
    CssBaseline,
    Link,
    Snackbar,
    Alert
} from '@mui/material';
import {
    Email,
    KeyboardBackspace,
    LockReset,
    Stars
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import logo from '../../assets/logo.png';

const PasswordResetPage = () => {
    const [email, setEmail] = useState('');
    const [emailError, setEmailError] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);

    // Blue-themed colors (same as login page)
    const primaryColor = '#4A86E8'; // Bright blue
    const secondaryColor = '#1E3A8A'; // Deep navy blue
    const accentColor = '#93C5FD'; // Light sky blue
    const darkColor = '#0F2447'; // Dark blue-black

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const [invalidSnackbarOpen, setInvalidSnackbarOpen] = useState(false);
    const [errorSnackbarOpen, setErrorSnackbarOpen] = useState(false);

    const validateEmail = (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        let isValid = true;

        // Reset error
        setEmailError('');

        // Email validation
        if (!email) {
            setEmailError('Email is required');
            isValid = false;
        } else if (!validateEmail(email)) {
            setEmailError('Please enter a valid email address');
            isValid = false;
        }

        if (isValid) {
            // Handle password reset request logic here
            try {
                const adminQuery = query(collection(db, "admin"), where("email", "==", email));
                const adminSnap = await getDocs(adminQuery);

                if (adminSnap.empty) {
                    setInvalidSnackbarOpen(true);
                    return;
                }

                await sendPasswordResetEmail(auth, email);
                setIsSubmitted(true);
            } catch (error) {
                console.error("Something went wrong:", error);
                setErrorSnackbarOpen(true);
            } finally {
                setEmail('');
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
                                No worries, we'll help you get back in!
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
                                    We'll send you instructions to reset your password.
                                </Typography>
                            </Box>
                        </Box>
                    </Box>

                    {/* Right side - Password Reset form */}
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
                        {!isSubmitted ? (
                            <>
                                <Typography
                                    variant="h4"
                                    fontWeight="bold"
                                    sx={{ mb: 1, color: darkColor }}
                                >
                                    Reset Your Password
                                </Typography>

                                <Typography
                                    variant="body1"
                                    sx={{ mb: 4, color: 'text.secondary', textAlign: 'center', maxWidth: '500px' }}
                                >
                                    Enter your email address and we'll send you instructions to reset your password
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
                                    </Grid>

                                    <Button
                                        type="submit"
                                        fullWidth
                                        variant="contained"
                                        size="large"
                                        sx={{
                                            mt: 4,
                                            mb: 3,
                                            py: 1.5,
                                            borderRadius: '20px',
                                            fontWeight: 'bold',
                                            textTransform: 'none',
                                            fontSize: '1.1rem',
                                            backgroundColor: primaryColor,
                                            boxShadow: `0 4px 12px rgba(74, 134, 232, 0.4)`,
                                            transition: 'all 0.3s',
                                            '&:hover': {
                                                backgroundColor: darkColor,
                                                transform: 'scale(1.03)',
                                                boxShadow: `0 6px 16px rgba(15, 36, 71, 0.4)`,
                                            }
                                        }}
                                    >
                                        Send Reset Link
                                    </Button>

                                    <Link
                                        component={RouterLink}
                                        to="/login"
                                        sx={{
                                            color: 'white',
                                        }}
                                    >
                                        <Button
                                            fullWidth
                                            variant="contained"
                                            size="large"
                                            sx={{
                                                py: 1.5,
                                                borderRadius: '20px',
                                                fontWeight: 'bold',
                                                textTransform: 'none',
                                                fontSize: '1.1rem',
                                                backgroundColor: '#D3D3D3',
                                                boxShadow: `0 4px 12px rgba(229, 228, 226, 0.4)`,
                                                transition: 'all 0.3s',
                                                '&:hover': {
                                                    backgroundColor: '#C0C0C0',
                                                    transform: 'scale(1.03)',
                                                    boxShadow: `0 6px 16px rgba(15, 36, 71, 0.4)`,
                                                }
                                            }}
                                        >
                                            Back
                                        </Button>
                                    </Link>
                                </Box>
                            </>
                        ) : (
                            // Success message after submission
                            <Box
                                sx={{
                                    textAlign: 'center',
                                    maxWidth: '500px'
                                }}
                            >
                                <Avatar
                                    sx={{
                                        width: 70,
                                        height: 70,
                                        bgcolor: primaryColor,
                                        mb: 3,
                                        mx: 'auto'
                                    }}
                                >
                                    <LockReset sx={{ fontSize: 40 }} />
                                </Avatar>

                                <Typography
                                    variant="h4"
                                    fontWeight="bold"
                                    sx={{ mb: 2, color: darkColor }}
                                >
                                    Check Your Email
                                </Typography>

                                <Typography
                                    variant="body1"
                                    sx={{ mb: 3, color: 'text.secondary' }}
                                >
                                    We've sent a password reset link to <strong>{email}</strong>. Please check your inbox and follow the instructions to reset your password.
                                </Typography>

                                <Typography
                                    variant="body2"
                                    sx={{ mb: 4, color: 'text.secondary' }}
                                >
                                    If you don't see the email, check your spam folder.
                                </Typography>

                                <Box
                                    sx={{
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        mt: 2
                                    }}
                                >
                                    <KeyboardBackspace sx={{ fontSize: 16, mr: 0.5, color: primaryColor }} />
                                    <Link
                                        component={RouterLink}
                                        to="/login"
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
                                        Back to Login
                                    </Link>
                                </Box>
                            </Box>
                        )}

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

export default PasswordResetPage;