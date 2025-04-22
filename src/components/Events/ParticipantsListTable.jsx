import { Close, Numbers as NumbersIcon, TaskAlt as TaskAltIcon, Visibility } from '@mui/icons-material';
import { Alert, alpha, Avatar, Box, Button, Dialog, DialogContent, DialogTitle, IconButton, Snackbar, Typography, useTheme } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { doc, updateDoc } from 'firebase/firestore';
import React, { useState } from 'react'
import { db } from '../../utils/firebaseConfig';

const ParticipantsListTable = ({ participants, isLoading }) => {
    const [openImageModal, setOpenImageModal] = useState(false);
    const [currentProof, setCurrentProof] = useState('');

    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarContent, setSnackbarContent] = useState({
        msg: '',
        type: '',
    })

    const theme = useTheme();

    const FACULTY_MAPPING = {
        1: "FACA",
        2: "FBE",
        3: "FCSHD",
        4: "FCSIT",
        5: "FEB",
        6: "FELC",
        7: "FENG",
        8: "FMSH",
        9: "FRST",
        10: "FSSH",
    };

    const commonHeaderStyle = {
        height: '40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: 1.5,
        borderRadius: '8px',
        bgcolor: alpha(theme.palette.background.default, 0.7),
        mb: 1
    };

    const handleViewProof = (paymentProof) => {
        setCurrentProof(paymentProof);
        setOpenImageModal(true);
    }

    const verifyRegistration = async (id) => {
        try {
            const registrationRef = doc(db, "registration", id);

            await updateDoc(registrationRef, {
                isVerified: true,
            })

            setSnackbarContent({
                msg: "The student's verification status is updated successfully.",
                type: 'success'
            })
            setSnackbarOpen(true);
        } catch (error) {
            setSnackbarContent({
                msg: "Something went wrong when updating student's verification status.",
                type: 'error'
            })
            setSnackbarOpen(true);
        }
    }

    const getColumns = () => {
        const columns = [
            {
                field: 'bil',
                headerName: '#',
                width: 80,
                align: 'center',
                renderHeader: () => (
                    <Box sx={{ ...commonHeaderStyle, justifyContent: 'center' }}>
                        <NumbersIcon
                            fontSize="small"
                            sx={{
                                opacity: 0.7
                            }}
                        />
                    </Box>
                ),
                renderCell: (params) => (
                    <Box
                        sx={{
                            height: '32px',
                            width: '32px',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: alpha(theme.palette.primary.main, 0.08),
                            transition: 'all 0.2s ease',
                            '&:hover': {
                                backgroundColor: alpha(theme.palette.primary.main, 0.12),
                                transform: 'scale(1.05)',
                            }
                        }}
                    >
                        <Typography
                            variant="body2"
                            fontWeight="700"
                            color={alpha(theme.palette.text.primary, 0.9)}
                            fontSize="0.8rem"
                        >
                            {params.value}
                        </Typography>
                    </Box>
                )
            },
            {
                field: 'fullName',
                headerName: 'Participant',
                flex: 1,
                minWidth: 200,
                renderHeader: () => (
                    <Box sx={commonHeaderStyle}>
                        <Typography
                            variant="subtitle2"
                            fontWeight="600"
                            fontSize="0.85rem"
                            letterSpacing="0.03em"
                            textTransform="uppercase"
                            color={theme.palette.text.secondary}
                        >
                            Participant
                        </Typography>
                    </Box>
                ),
                renderCell: (params) => {
                    const { row } = params;
                    const { fullName, profilePicture } = row;

                    return (
                        <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            width: '100%',
                            gap: 1.25,
                            '&:hover': {
                                transform: 'translateX(2px)',
                            }
                        }}>
                            <Avatar
                                sx={{
                                    width: 30,
                                    height: 30,
                                    bgcolor: alpha(theme.palette.primary.main, 0.12),
                                    color: theme.palette.primary.dark,
                                    fontWeight: 600,
                                    fontSize: '0.85rem',
                                    boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.15)}`
                                }}
                            >
                                <Box
                                    component="img"
                                    src={`data:image/jpeg;base64,${profilePicture}`}
                                    alt="Student Profile Picture"
                                    sx={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'contain',
                                    }}
                                />
                            </Avatar>
                            <Box sx={{ flexGrow: 1 }}>
                                <Typography variant="body1" fontWeight="600" color="text.primary" sx={{ lineHeight: 1.2 }}>
                                    {fullName}
                                </Typography>
                            </Box>
                        </Box>
                    );
                }
            },
            {
                field: 'yearOfStudy',
                headerName: 'Year of Study',
                width: 150,
                headerAlign: 'center',
                align: 'center',
                renderHeader: () => (
                    <Box sx={{ ...commonHeaderStyle, justifyContent: 'center' }}>
                        <Typography
                            variant="subtitle1"
                            fontWeight="600"
                            fontSize="0.85rem"
                            letterSpacing="0.03em"
                            textTransform="uppercase"
                            color={theme.palette.text.secondary}
                        >
                            Year of Study
                        </Typography>
                    </Box>
                ),
                renderCell: (params) => (
                    <Box
                        sx={{
                            width: '100%',
                            py: 0.8,
                            px: 1.5,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: '6px',
                            transition: 'all 0.2s ease',
                        }}
                    >
                        <Typography
                            variant="body1"
                            fontWeight="600"
                        >
                            {params.value}
                        </Typography>
                    </Box>
                )
            },
            {
                field: 'facultyID',
                headerName: 'Faculty',
                width: 100,
                headerAlign: 'center',
                align: 'center',
                renderHeader: () => (
                    <Box sx={{ ...commonHeaderStyle, justifyContent: 'center' }}>
                        <Typography
                            variant="subtitle2"
                            fontWeight="600"
                            fontSize="0.85rem"
                            letterSpacing="0.03em"
                            textTransform="uppercase"
                            color={theme.palette.text.secondary}
                        >
                            Faculty
                        </Typography>
                    </Box>
                ),
                renderCell: (params) => (
                    <Box
                        sx={{
                            width: '100%',
                            py: 0.8,
                            px: 1.5,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <Typography variant="body1" fontWeight="700" color="text.primary">
                            {FACULTY_MAPPING[params.value]}
                        </Typography>
                    </Box>
                )
            },
            {
                field: 'email',
                headerName: 'Email',
                minWidth: 250,
                headerAlign: 'center',
                align: 'center',
                renderHeader: () => (
                    <Box sx={{ ...commonHeaderStyle, justifyContent: 'center' }}>
                        <Typography
                            variant="subtitle2"
                            fontWeight="600"
                            fontSize="0.85rem"
                            letterSpacing="0.03em"
                            textTransform="uppercase"
                            color={theme.palette.text.secondary}
                        >
                            Email
                        </Typography>
                    </Box>
                ),
                renderCell: (params) => (
                    <Box
                        sx={{
                            py: 1.2,
                            px: 2,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <Typography variant="body1" fontWeight="700" color="text.primary">
                            {params.value}
                        </Typography>
                    </Box>
                )
            },
        ];

        if (participants.every(participant => participant.isVerified === false)) {
            columns.splice(5, 0, {
                field: 'actions',
                type: 'actions',
                headerName: 'Action',
                width: 280,
                headerAlign: 'center',
                align: 'center',
                sortable: false,
                filterable: false,
                renderHeader: () => (
                    <Box sx={{
                        ...commonHeaderStyle,
                        justifyContent: 'center',
                        position: 'relative',
                        '&::after': {
                            content: '""',
                            position: 'absolute',
                            bottom: -8,
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: 40,
                            height: 3,
                            backgroundColor: theme.palette.primary.main,
                            borderRadius: '10px'
                        }
                    }}>
                        <Typography
                            variant="subtitle1"
                            fontWeight="700"
                            color="text.primary"
                            sx={{ letterSpacing: '0.02em' }}
                        >
                            Action
                        </Typography>
                    </Box>
                ),
                renderCell: (params) => (
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                            variant="contained"
                            color="info"
                            size="medium"
                            disableElevation
                            startIcon={
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <Visibility fontSize='small' />
                                </Box>
                            }
                            onClick={(e) => {
                                e.stopPropagation();
                                handleViewProof(params.row.paymentProofBase64);
                            }}
                            sx={{
                                fontWeight: '600',
                                whiteSpace: 'nowrap',
                                minWidth: 'auto',
                                maxHeight: 40,
                                py: 1,
                                px: 2,
                                borderRadius: '12px',
                                textTransform: 'none',
                                transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
                                '&:hover': {
                                    transform: 'translateY(-1px)',
                                    backgroundColor: alpha(theme.palette.info.main, 0.85)
                                },
                                '&:active': {
                                    transform: 'scale(0.98)',
                                    transition: 'all 0.1s ease-in-out'
                                }
                            }}
                        >
                            <Typography sx={{
                                fontWeight: 600,
                                fontSize: '0.875rem',
                                letterSpacing: '0.01em'
                            }}>
                                View Proof
                            </Typography>
                        </Button>
                        <Button
                            variant='contained'
                            color="error"
                            size='medium'
                            disableElevation
                            startIcon={
                                <Box
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                    }}
                                >
                                    <TaskAltIcon fontSize='small' />
                                </Box>
                            }
                            onClick={(e) => {
                                e.stopPropagation();
                                verifyRegistration(params.row.id);
                            }}
                            sx={{
                                fontWeight: '600',
                                whiteSpace: 'nowrap',
                                minWidth: 'auto',
                                maxHeight: 40,
                                py: 1,
                                px: 2,
                                borderRadius: '12px',
                                textTransform: 'none',
                                transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
                                '&:hover': {
                                    transform: 'translateY(-1px)',
                                    backgroundColor: alpha(theme.palette.error.main, 0.85)
                                },
                                '&:active': {
                                    transform: 'scale(0.98)',
                                    transition: 'all 0.1s ease-in-out'
                                }
                            }}
                        >
                            <Typography sx={{
                                fontWeight: 600,
                                fontSize: '0.875rem',
                                letterSpacing: '0.01em'
                            }}>
                                Verify
                            </Typography>
                        </Button>
                    </Box>
                )
            })
        }

        return columns;
    }

    return (
        <Box
            sx={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                overflow: 'hidden',
                boxShadow: (theme) => `0 2px 12px ${alpha(theme.palette.common.black, 0.05)}`,
                borderBottom: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
                borderRadius: '8px 8px 0 0',
            }}
        >
            <Box
                sx={{
                    height: 340,
                    width: '100%',
                    position: 'relative',
                    '& .MuiDataGrid-root': {
                        border: 'none',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
                        backgroundColor: theme.palette.background.paper,
                        '--DataGrid-rowBorderColor': 'transparent',
                    },
                    '& .MuiDataGrid-cell': {
                        pb: 2,
                        fontSize: '0.95rem',
                        fontWeight: 400,
                        justifyContent: "flex-start",
                        borderBottom: `none`,
                        color: theme.palette.text.primary,
                        padding: '16px 12px',
                    },
                    '& .MuiDataGrid-columnHeaders': {
                        borderBottom: 'none',
                        backgroundColor: alpha(theme.palette.background.default, 0.4),
                        backdropFilter: 'blur(8px)',
                        height: 60,
                    },
                    '& .MuiDataGrid-columnHeaderTitle': {
                        fontWeight: 600,
                        fontSize: '0.85rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        color: theme.palette.text.secondary,
                    },
                    '& .MuiDataGrid-columnSeparator': {
                        display: 'none',
                    },
                    '& .MuiDataGrid-footerContainer': {
                        borderTop: 'none',
                        backgroundColor: alpha(theme.palette.background.default, 0.4),
                        backdropFilter: 'blur(8px)',
                        borderRadius: '0 0 12px 12px',
                    },
                    '& .MuiDataGrid-row': {
                        transition: 'transform 0.2s ease, background-color 0.2s ease',
                        display: 'flex',
                        justifyContent: 'center',
                        '&:hover': {
                            backgroundColor: alpha(theme.palette.primary.main, 0.04),
                            transform: 'translateY(-1px)',
                        },
                        '&:nth-of-type(even)': {
                            backgroundColor: alpha(theme.palette.background.default, 0.3),
                        },
                    },
                    '& .MuiDataGrid-scrollbar': {
                        '&::-webkit-scrollbar': {
                            width: '10px',
                            height: '10px',
                        },
                        '&::-webkit-scrollbar-track': {
                            backgroundColor: 'transparent',
                        },
                        '&::-webkit-scrollbar-thumb': {
                            backgroundColor: alpha(theme.palette.primary.main, 0.2),
                            borderRadius: '10px',
                            border: `2px solid ${alpha(theme.palette.background.paper, 0.8)}`,
                            '&:hover': {
                                backgroundColor: alpha(theme.palette.primary.main, 0.3),
                            },
                        },
                    },
                    '& .MuiDataGrid-virtualScroller::-webkit-scrollbar': {
                        width: '10px',
                        height: '10px',
                    },
                    '& *::-webkit-scrollbar-track': {
                        backgroundColor: 'transparent',
                        margin: 2,
                    },
                    '& *::-webkit-scrollbar-thumb': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.2),
                        borderRadius: '10px',
                        '&:hover': {
                            backgroundColor: alpha(theme.palette.primary.main, 0.3),
                            cursor: 'pointer',
                        },
                    },
                    '& .MuiTablePagination-root': {
                        fontSize: '0.85rem',
                    },
                    '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
                        fontSize: '0.85rem',
                        color: 'text.secondary'
                    },
                    '& .MuiTablePagination-select': {
                        borderRadius: '8px',
                        marginRight: '8px',
                        padding: '4px 8px',
                        backgroundColor: alpha(theme.palette.background.default, 0.6),
                    },
                    '& .MuiTablePagination-actions': {
                        '& .MuiIconButton-root': {
                            padding: '4px',
                            borderRadius: '8px',
                            color: theme.palette.primary.main,
                            '&:hover': {
                                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                            },
                            '&.Mui-disabled': {
                                color: alpha(theme.palette.text.disabled, 0.4),
                            },
                        },
                    },
                }}
            >
                <DataGrid
                    rows={participants}
                    columns={getColumns()}
                    loading={isLoading}
                    disableRowSelectionOnClick
                    autoHeight={false}
                    initialState={{
                        pagination: {
                            paginationModel: { pageSize: 10 },
                        }
                    }}
                    pageSizeOptions={[5, 10, 25, 50]}
                    getRowId={(row) => row.id}
                    getRowHeight={() => 55}
                    sx={{
                        '& .MuiCircularProgress-root': {
                            color: theme.palette.primary.main,
                            size: '2rem'
                        },
                        '& .MuiDataGrid-main': {
                            borderRadius: 4,
                            overflow: 'hidden',
                        }
                    }}
                />
            </Box>

            <Dialog
                open={openImageModal}
                onClose={() => setOpenImageModal(false)}
                max="md"
                PaperProps={{
                    sx: {
                        borderRadius: '16px',
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
                        overflow: 'hidden'
                    }
                }}
            >
                <DialogTitle sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    backgroundColor: theme.palette.background.default,
                    py: 2,
                    px: 3
                }}>
                    <Typography variant="h6" fontWeight="600">
                        Payment Proof
                    </Typography>
                    <IconButton
                        onClick={() => setOpenImageModal(false)}
                        sx={{
                            color: theme.palette.text.secondary,
                            transition: 'all 0.2s',
                            '&:hover': {
                                color: theme.palette.primary.main,
                                backgroundColor: alpha(theme.palette.primary.main, 0.1)
                            }
                        }}
                    >
                        <Close />
                    </IconButton>
                </DialogTitle>
                <DialogContent sx={{ p: 0, position: 'relative' }}>
                    {currentProof ? (
                        <Box
                            sx={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                p: 3,
                                backgroundColor: alpha(theme.palette.common.black, 0.03)
                            }}
                        >
                            <img
                                src={`data:image/jpeg;base64,${currentProof}`}
                                alt="Payment Proof"
                                style={{
                                    maxWidth: '100%',
                                    maxHeight: '70vh',
                                    objectFit: 'contain',
                                    borderRadius: '8px',
                                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                                }}
                            />
                        </Box>
                    ) : (
                        <Box sx={{ p: 4, textAlign: 'center' }}>
                            <Typography color="text.secondary">No image available</Typography>
                        </Box>
                    )}
                </DialogContent>
            </Dialog>

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
        </Box>
    )
}

export default ParticipantsListTable;