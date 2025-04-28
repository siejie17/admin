import { Button, useTheme } from '@mui/material';
import { FileDownload } from '@mui/icons-material';
import React from 'react';

const ExcelExportButton = ({ handleExport }) => {
    const theme = useTheme();

    return (
        <Button
            variant="contained"
            onClick={handleExport}
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
            <FileDownload sx={{ fontSize: "16px" }} />
            <span>Export Excel</span>
        </Button>
    )
}

export default ExcelExportButton;