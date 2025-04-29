import React from 'react';
import { Stack, Typography, useTheme } from '@mui/material';

const LikertScaleItem = ({ value, label, color }) => {
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