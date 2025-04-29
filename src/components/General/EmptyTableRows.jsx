import { alpha, Box, Typography } from '@mui/material';
import React from 'react'

const EmptyTableRows = ({ icon, title, subtitle }) => {
    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                px: '24px',
                py: '12px'
            }}
        >
            <Box
                sx={{
                    width: '80px',
                    height: '80px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '50%',
                    backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.08),
                    marginBottom: '16px',
                }}
            >
                {React.cloneElement(icon, {
                    sx: {
                        fontSize: '32px',
                        color: (theme) => alpha(theme.palette.primary.main, 0.6),
                    }
                })}
            </Box>
            <Typography
                variant="h6"
                sx={{
                    fontWeight: 600,
                    marginBottom: '8px',
                    color: 'text.primary',
                }}
            >
                {title}
            </Typography>
            <Typography
                variant="body2"
                sx={{
                    color: 'text.secondary',
                    textAlign: 'center',
                    maxWidth: '280px',
                    marginBottom: '16px',
                }}
            >
                {subtitle}
            </Typography>
        </Box>
    )
}

export default EmptyTableRows;