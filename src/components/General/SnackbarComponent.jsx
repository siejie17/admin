import { Alert, Snackbar } from '@mui/material';
import React, { useEffect } from 'react';

const SnackbarComponent = ({ snackbarOpen, setSnackbarOpen, snackbarContent }) => {
    return (
        <Snackbar
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            open={snackbarOpen}
            autoHideDuration={4000}
            onClose={() => setSnackbarOpen(false)}
        >
            <Alert
                severity={snackbarContent.type}
                variant="filled"
                sx={{ width: '100%' }}
            >
                {snackbarContent.msg}
            </Alert>
        </Snackbar>
    )
}

export default SnackbarComponent;