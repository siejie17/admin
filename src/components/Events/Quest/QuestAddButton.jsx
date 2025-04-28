import { Add as AddIcon } from '@mui/icons-material';
import { Button } from '@mui/material';
import React from 'react'

const QuestAddButton = ({ handleFormOpen }) => {
    return (
        <Button
            variant="contained"
            startIcon={<AddIcon sx={{ fontSize: 18 }} />}
            onClick={handleFormOpen}
            sx={{
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                px: 2,
                py: 1,
                boxShadow: 2,
                fontSize: "10px",
                '&:hover': {
                    backgroundColor: 'primary.dark',
                    boxShadow: 3,
                    transform: 'translateY(-1px)',
                    transition: 'all 0.2s ease',
                },
            }}
            aria-label="show event QR code"
        >
            Add Quest
        </Button>
    )
}

export default QuestAddButton;