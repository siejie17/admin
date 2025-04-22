import { Numbers } from '@mui/icons-material';
import { alpha, Avatar, Box, Typography, useTheme } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import React from 'react';

const FeedbackListTable = ({ feedbackList, isLoading }) => {
    const theme = useTheme();

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

    const columns = [
        {
            field: 'bil',
            headerName: '#',
            width: 80,
            align: 'center',
            renderHeader: () => (
                <Box sx={{ ...commonHeaderStyle, justifyContent: 'center' }}>
                    <Numbers
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
            field: 'participantName',
            headerName: 'Participant Name',
            flex: 1,
            minWidth: 200,
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
                        Participant Name
                    </Typography>
                </Box>
            ),
            renderCell: (params) => {
                const { row } = params;
                const { participantName, profilePicture } = row;

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
                                    objectFit: 'cover',
                                }}
                            />
                        </Avatar>
                        <Box sx={{ flexGrow: 1 }}>
                            <Typography variant="body1" fontWeight="600" color="text.primary" sx={{ lineHeight: 1.2 }}>
                                {participantName}
                            </Typography>
                        </Box>
                    </Box>
                );
            }
        },
        {
            field: 'eventSatisfaction',
            headerName: 'Event Satisfaction',
            width: 200,
            headerAlign: 'center',
            align: 'center',
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
                        Event Satisfaction
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
            field: 'gamificationSatisfaction',
            headerName: 'Gamification Satisfaction',
            width: 250,
            headerAlign: 'center',
            align: 'center',
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
                        Gamification Satisfaction
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
            field: 'improvement',
            headerName: 'Overall Improvement',
            width: 500,
            headerAlign: 'center',
            align: 'center',
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
                        Overall Improvement
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
                        sx={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            width: '100%',
                            textAlign: 'center'
                        }}
                        title={params.value}
                    >
                        {params.value}
                    </Typography>
                </Box>
            )
        }
    ];

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
                    height: 350,
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
                    rows={feedbackList}
                    columns={columns}
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
        </Box>
    )
}

export default FeedbackListTable;