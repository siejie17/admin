import React from 'react';
import { Box, Typography, Fade, LinearProgress } from '@mui/material';

const Loader = ({ loadingText = "Loading..." }) => {
    return (
        <Fade in={true} timeout={800}>
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'absolute', // Position absolutely to take full height
                    top: 154, // Account for components above
                    left: 0,
                    right: 0,
                    bottom: 0,
                    height: `calc(100% - 128px)`, // Calculate remaining height
                    minHeight: 120, // Minimum height for very small spaces
                }}
            >
                <Box sx={{ width: '40%', maxWidth: 300, mb: 3 }}>
                    <LinearProgress
                        sx={{
                            height: 2,
                            borderRadius: 1,
                            backgroundColor: 'rgba(0, 0, 0, 0.06)',
                            '& .MuiLinearProgress-bar': {
                                borderRadius: 1,
                            }
                        }}
                    />
                </Box>

                <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                        opacity: 0.7,
                        letterSpacing: 0.5,
                        fontWeight: 400,
                        fontSize: '0.85rem',
                        textTransform: 'uppercase'
                    }}
                >
                    {loadingText}
                </Typography>
            </Box>
        </Fade>
    );
};

export default Loader;