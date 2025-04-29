import { Add as AddIcon } from '@mui/icons-material'
import { Button, useTheme } from '@mui/material'
import React from 'react'

const AddButton = ({ title, addFunction }) => {
    const theme = useTheme();

    return (
        <Button
            variant="contained"
            onClick={addFunction}
            startIcon={<AddIcon fontSize='small' />}
            sx={{
                height: "35px",
                borderRadius: 2,
                fontSize: "10px",
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
            {title}
        </Button>
    )
}

export default AddButton