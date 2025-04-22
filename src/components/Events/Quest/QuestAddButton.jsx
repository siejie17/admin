import { Add as AddIcon } from '@mui/icons-material';
import { Button, useTheme } from '@mui/material';
import React from 'react'

const QuestAddButton = () => {
    const theme = useTheme();

    return (
        <Button
            variant="contained"
            // onClick={handleExport}
            sx={{
                height: 40,
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                boxShadow: '0 4px 10px rgba(0, 0, 0, 0.08)',
                background: `linear-gradient(135deg, ${theme.palette.primary.light}, ${theme.palette.primary.main})`,
                transition: 'all 0.3s ease',
                '&:hover': {
                    boxShadow: '0 6px 12px rgba(0, 0, 0, 0.12)',
                    transform: 'translateY(-1px)',
                },
                px: 2,
                display: 'flex',
                gap: 1
            }}
        >
            <AddIcon sx={{ fontSize: 18 }} />
            <span>Add Quest</span>
        </Button>
    )
}

export default QuestAddButton;