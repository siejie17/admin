import React from 'react';
import {
    Box,
    Typography,
    Paper,
    Container,
    useTheme,
    Card,
    CardContent,
    Divider
} from '@mui/material';
import { Info as InfoIcon } from '@mui/icons-material';

const EmptyList = ({ icon, title, subtitle, info }) => {
    const theme = useTheme();

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                height: '100vh',
            }}
        >
            {/* Main content area - centered vertically and horizontally */}
            <Box
                sx={{
                    display: 'flex',
                    flexGrow: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                    px: 3
                }}
            >
                <Container maxWidth="sm">
                    <Paper
                        elevation={0}
                        sx={{
                            py: 5,
                            px: 4,
                            borderRadius: 2,
                            textAlign: 'center',
                            position: 'relative'
                        }}
                    >
                        {/* Decorative circle elements using MUI styling */}
                        <Box
                            sx={{
                                position: 'absolute',
                                top: -20,
                                left: 'calc(50% - 70px)',
                                width: 140,
                                height: 140,
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center'
                            }}
                        >
                            <Box
                                sx={{
                                    position: 'absolute',
                                    width: 60,
                                    height: 60,
                                    borderRadius: '50%',
                                    bgcolor: theme.palette.secondary.light,
                                    opacity: 0.6,
                                    left: -10,
                                    top: -5
                                }}
                            />
                            <Box
                                sx={{
                                    position: 'absolute',
                                    width: 50,
                                    height: 50,
                                    borderRadius: '50%',
                                    bgcolor: theme.palette.primary.light,
                                    opacity: 0.4,
                                    right: -5,
                                    top: -15
                                }}
                            />
                            <Paper
                                elevation={4}
                                sx={{
                                    position: 'relative',
                                    zIndex: 1,
                                    width: 80,
                                    height: 80,
                                    borderRadius: '50%',
                                    bgcolor: theme.palette.primary.main,
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center'
                                }}
                            >
                                {React.cloneElement(icon, {
                                    sx: {
                                        fontSize: 40,
                                        color: theme.palette.common.white,
                                    }
                                })}
                            </Paper>
                        </Box>

                        {/* Main content */}
                        <Box sx={{ mt: 8, mb: 4 }}>
                            <Typography variant="h5" component="h2" gutterBottom>
                                {title}
                            </Typography>
                            <Typography variant="body1" color="text.secondary" paragraph>
                                {subtitle}
                            </Typography>
                        </Box>

                        {/* Info card */}
                        <Card variant="outlined" sx={{
                            bgcolor: theme.palette.info.light + '20',
                            mb: 3,
                            border: `1px solid ${theme.palette.info.light}`
                        }}>
                            <CardContent sx={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: 1,
                                p: 2,
                                '&:last-child': { pb: 2 } // Override MUI default padding
                            }}>
                                <InfoIcon sx={{
                                    color: theme.palette.info.main,
                                    fontSize: 20,
                                    mt: 0.3
                                }} />
                                <Typography variant="body2" color="info.dark">
                                    {info}
                                </Typography>
                            </CardContent>
                        </Card>

                        {/* Decorative dividers */}
                        <Box sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            mt: 4
                        }}>
                            <Divider sx={{ width: '25%', borderColor: theme.palette.primary.light }} />
                            <Divider sx={{ width: '40%', borderColor: theme.palette.secondary.light }} />
                            <Divider sx={{ width: '15%', borderColor: theme.palette.primary.main }} />
                        </Box>
                    </Paper>
                </Container>
            </Box>

            {/* Footer */}
            <Box
                sx={{
                    py: 2,
                    textAlign: 'center'
                }}
            >
                <Typography variant="caption" color="text.secondary">
                    Event Management System • Dashboard
                </Typography>
            </Box>
        </Box>
    );
}

export default EmptyList;