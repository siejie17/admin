import React from 'react';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Typography,
    IconButton,
    Divider,
    Fade,
    Box
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const ActionsDialog = ({ dialogOpen, setDialogOpen, dialogContent }) => {
    const handleClose = () => {
        setDialogOpen(false);
    };

    return (
        <Dialog
            open={dialogOpen}
            disableEscapeKeyDown
            onClose={() => { }}
            aria-labelledby="dialog-title"
            aria-describedby="dialog-description"
            TransitionComponent={Fade}
            TransitionProps={{ timeout: 300 }}
            keepMounted
            PaperProps={{
                sx: {
                    borderRadius: 3,
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
                    overflow: 'hidden'
                }
            }}
        >
            <DialogTitle
                id="dialog-title"
                sx={{
                    p: 3,
                    display: 'flex',
                    justifyContent: 'flex-start',
                    alignItems: 'center'
                }}
            >
                <Typography fontWeight={600}>
                    {dialogContent.title}
                </Typography>
            </DialogTitle>

            <Divider />

            <DialogContent sx={{ p: '16px 24px 24px' }}>
                <DialogContentText id="dialog-description" color="text.primary">
                    {dialogContent.context}
                </DialogContentText>
            </DialogContent>

            <DialogActions sx={{ p: '6px 24px 24px', gap: 1 }}>
                <Button
                    onClick={handleClose}
                    variant="outlined"
                    disableElevation
                    sx={{
                        textTransform: 'none',
                        borderRadius: 2,
                        px: 2.5,
                        py: 1,
                        fontWeight: 500
                    }}
                >
                    Cancel
                </Button>
                <Button
                    onClick={dialogContent.action}
                    variant="contained"
                    disableElevation
                    autoFocus
                    sx={{
                        textTransform: 'none',
                        borderRadius: 2,
                        px: 2.5,
                        py: 1,
                        fontWeight: 500,
                        boxShadow: '0 2px 8px rgba(25, 118, 210, 0.25)',
                        '&:hover': {
                            boxShadow: '0 4px 12px rgba(25, 118, 210, 0.35)',
                            bgcolor: 'primary.dark',
                        }
                    }}
                >
                    Confirm
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ActionsDialog;