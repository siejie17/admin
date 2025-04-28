import React from 'react';
import { Box, Stack, Typography, useTheme } from '@mui/material';

const LikertScaleItem = ({ value, label, icon, color }) => {
    const theme = useTheme();

    return (
        <Stack
            direction="column"
            alignItems="center"
            spacing={1}
            sx={{
                width: '100%',
                transition: 'all 0.3s ease',
                p: 1.5,
                borderRadius: 2,
            }}
        >
            {/* Icon at top */}
            {/* <Box
                sx={{
                    color: color,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: 40
                }}
            >
                {React.cloneElement(icon, { sx: { fontSize: '1.25rem' } })}
            </Box> */}

            {/* Number in middle */}
            <Typography
                variant="h6"
                sx={{
                    color: color,
                    fontWeight: 700,
                    lineHeight: 1
                }}
            >
                {value}
            </Typography>

            {/* Label at bottom */}
            <Typography
                variant="body2"
                sx={{
                    color: theme.palette.text.secondary,
                    fontWeight: 500,
                    textAlign: 'center',
                    fontSize: '0.75rem'
                }}
            >
                {label}
            </Typography>
        </Stack>
    );
};

export default LikertScaleItem;