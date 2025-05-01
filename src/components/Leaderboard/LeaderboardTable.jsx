import React from 'react';
import { alpha, Avatar, Box, Chip, Typography, useTheme } from '@mui/material';
import { EmojiEvents as EmojiEventsIcon, FilterListOff as FilterListOffIcon } from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';

import EmptyTableRows from '../General/EmptyTableRows';

const LeaderboardTable = ({ leaderboardList, isLoading }) => {
    const theme = useTheme();

    const commonHeaderStyle = {
        height: '46px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
        px: 1.5,
        borderRadius: '8px',
        bgcolor: alpha(theme.palette.background.default, 0.7),
        mb: 1
    };

    const leaderboardColumns = () => {
        // Common theme colors for consistent styling
        const primaryLight = alpha(theme.palette.primary.main, 0.08);
        const primaryMedium = alpha(theme.palette.primary.main, 0.15);
        const primaryBorder = alpha(theme.palette.primary.main, 0.25);

        // Enhanced header style with more refined appearance
        const enhancedHeaderStyle = {
            ...commonHeaderStyle,
            justifyContent: 'center',
            position: 'relative',
            py: 1.5,
            '&::after': {
                content: '""',
                position: 'absolute',
                bottom: -8,
                left: '50%',
                transform: 'translateX(-50%)',
                width: 40,
                height: 3,
                backgroundColor: theme.palette.primary.main,
                borderRadius: '10px',
                boxShadow: `0 1px 3px ${primaryMedium}`
            }
        };

        // Typography style for header text
        const headerTypographyStyle = {
            variant: "subtitle1",
            fontWeight: "700",
            color: "text.primary",
            sx: {
                letterSpacing: '0.02em',
                fontSize: '0.9rem'
            }
        };

        const baseColumns = [
            {
                field: 'rank',
                headerName: 'Rank',
                width: 100,
                align: 'center',
                headerAlign: 'center',
                renderHeader: () => (
                    <Box sx={enhancedHeaderStyle}>
                        <Typography {...headerTypographyStyle}>
                            Rank
                        </Typography>
                    </Box>
                ),
                renderCell: (params) => {
                    // Define medal colors based on ranking
                    let textColor = theme.palette.primary.main;
                    let bgColor = primaryLight;
                    let borderColor = primaryBorder;

                    // Set colors based on ranking (1=gold, 2=silver, 3=bronze)
                    if (params.value === 1) {
                        textColor = '#D3AF37'; // Gold text
                        bgColor = alpha('#FFD700', 0.15); // Light gold background
                        borderColor = '#FFD700'; // Gold border
                    } else if (params.value === 2) {
                        textColor = '#808080'; // Silver text
                        bgColor = alpha('#C0C0C0', 0.15); // Light silver background
                        borderColor = '#C0C0C0'; // Silver border
                    } else if (params.value === 3) {
                        textColor = '#CD7F32'; // Bronze text
                        bgColor = alpha('#CD7F32', 0.15); // Light bronze background
                        borderColor = '#CD7F32'; // Bronze border
                    }

                    return (
                        <Box sx={{
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}>
                            <Box
                                sx={{
                                    height: 25,
                                    width: 25,
                                    borderRadius: '8px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    backgroundColor: bgColor,
                                    border: `1px solid ${borderColor}`,
                                    boxShadow: `0 2px 4px ${alpha(theme.palette.common.black, 0.05)}`,
                                    transition: 'all 0.2s ease',
                                    '&:hover': {
                                        backgroundColor: alpha(borderColor, 0.3),
                                        transform: 'scale(1.05)',
                                        boxShadow: `0 3px 6px ${alpha(theme.palette.common.black, 0.1)}`
                                    }
                                }}
                            >
                                <Typography
                                    variant="body2"
                                    fontWeight="700"
                                    color={textColor}
                                    fontSize="0.65rem"
                                >
                                    {params.value}
                                </Typography>
                            </Box>
                        </Box>
                    );
                }
            },
            {
                field: 'fullName',
                headerName: 'Student',
                flex: 1,
                headerAlign: 'center',
                minWidth: 220,
                renderHeader: () => (
                    <Box sx={enhancedHeaderStyle}>
                        <Typography {...headerTypographyStyle}>
                            Student
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
                            py: 1.5,
                            pl: 1,
                            gap: 1.5,
                            transition: 'all 0.2s ease',
                            '&:hover': {
                                transform: 'translateX(4px)',
                            }
                        }}>
                            <Avatar
                                sx={{
                                    width: 25,
                                    height: 25,
                                    bgcolor: primaryMedium,
                                    color: theme.palette.primary.dark,
                                    fontWeight: 600,
                                    fontSize: '0.65rem',
                                    border: `2px solid ${alpha(theme.palette.background.paper, 0.9)}`,
                                    boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.2)}`,
                                    transition: 'transform 0.2s ease',
                                    '&:hover': {
                                        transform: 'scale(1.1)'
                                    }
                                }}
                            >
                                <Box
                                    component="img"
                                    src={`data:image/jpeg;base64,${profilePicture}`}
                                    alt="Student Profile"
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
                            <Box sx={{
                                flexGrow: 1,
                                borderLeft: `3px solid ${alpha(theme.palette.primary.main, 0)}`,
                                pl: 1,
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                    borderLeft: `3px solid ${alpha(theme.palette.primary.main, 0.6)}`,
                                }
                            }}>
                                <Typography
                                    variant="body1"
                                    fontWeight="600"
                                    color="text.primary"
                                    sx={{
                                        lineHeight: 1.2,
                                        fontSize: '0.75rem',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                        maxWidth: '90%'
                                    }}
                                >
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
                    <Box sx={enhancedHeaderStyle}>
                        <Typography {...headerTypographyStyle}>
                            Year of Study
                        </Typography>
                    </Box>
                ),
                renderCell: (params) => (
                    <Box
                        sx={{
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <Chip
                            label={params.value}
                            variant="outlined"
                            size="small"
                            sx={{
                                fontWeight: 600,
                                fontSize: '0.75rem',
                                borderRadius: '6px',
                                backgroundColor: alpha(theme.palette.info.light, 0.1),
                                borderColor: alpha(theme.palette.info.main, 0.3),
                                color: theme.palette.info.dark,
                                '&:hover': {
                                    backgroundColor: alpha(theme.palette.info.light, 0.2),
                                },
                                transition: 'all 0.2s ease'
                            }}
                        />
                    </Box>
                )
            },
            {
                field: 'points',
                headerName: 'Points',
                width: 150,
                headerAlign: 'center',
                align: 'center',
                renderHeader: () => (
                    <Box sx={enhancedHeaderStyle}>
                        <Typography {...headerTypographyStyle}>
                            Points
                        </Typography>
                    </Box>
                ),
                renderCell: (params) => (
                    <Box
                        sx={{
                            width: '100%',
                            height: '100%',
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
                            fontSize="0.85rem"
                        >
                            {params.value}
                        </Typography>
                    </Box>
                )
            },
            {
                field: 'lastUpdated',
                headerName: 'Last Updated',
                width: 200,
                headerAlign: 'center',
                align: 'center',
                renderHeader: () => (
                    <Box sx={enhancedHeaderStyle}>
                        <Typography {...headerTypographyStyle}>
                            Last Updated
                        </Typography>
                    </Box>
                ),
                renderCell: (params) => (
                    <Box
                        sx={{
                            width: '100%',
                            height: '100%',
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
                            fontSize="0.85rem"
                        >
                            {params.value}
                        </Typography>
                    </Box>
                )
            }
        ];

        return baseColumns;
    }

    return (
        <Box
            sx={{
                width: 'auto',
                borderRadius: '20px',
                overflow: 'hidden',
                boxShadow: (theme) => `0 20px 40px ${alpha(theme.palette.common.black, 0.08)}`,
                background: (theme) => `linear-gradient(145deg, 
                                    ${alpha(theme.palette.background.paper, 0.98)}, 
                                    ${alpha(theme.palette.background.paper, 1)} 50%,
                                    ${alpha(theme.palette.primary.light, 0.07)} 130%)`,
                border: (theme) => `1px solid ${alpha(theme.palette.divider, 0.05)}`,
                backdropFilter: 'blur(16px)',
                position: 'relative',
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '3px',
                    background: (theme) => `linear-gradient(90deg, 
                                                ${alpha(theme.palette.primary.main, 0.2)}, 
                                                ${alpha(theme.palette.primary.light, 0.9)} 50%, 
                                                ${alpha(theme.palette.background.paper, 0.6)})`,
                    zIndex: 5
                }
            }}
        >
            <Box
                sx={{
                    height: 450,
                    width: '100%',
                    position: 'relative',
                    '& .MuiDataGrid-root': {
                        border: 'none',
                        borderRadius: '20px',
                        overflow: 'hidden',
                        boxShadow: 'none',
                        backgroundColor: 'transparent',
                        '--DataGrid-rowBorderColor': 'transparent',
                        '&::after': {
                            content: '""',
                            position: 'absolute',
                            bottom: 50, // Height of footer
                            left: 0,
                            right: 0,
                            height: '20px',
                            background: (theme) => `linear-gradient(to top, 
                                                    ${alpha(theme.palette.background.paper, 1)}, 
                                                    ${alpha(theme.palette.background.paper, 0)})`,
                            pointerEvents: 'none',
                            zIndex: 3
                        }
                    },
                    '& .MuiDataGrid-columnHeaders': {
                        borderBottom: 'none',
                        backgroundColor: (theme) => alpha(theme.palette.background.default, 0.6),
                        backdropFilter: 'blur(14px)',
                        height: 50,
                        position: 'relative',
                        '&::after': {
                            content: '""',
                            position: 'absolute',
                            bottom: 0,
                            left: '6px',
                            right: '6px',
                            height: '1px',
                            background: (theme) => `linear-gradient(90deg, 
                                                    ${alpha(theme.palette.divider, 0)}, 
                                                    ${alpha(theme.palette.divider, 0.25)} 20%, 
                                                    ${alpha(theme.palette.divider, 0.25)} 80%, 
                                                    ${alpha(theme.palette.divider, 0)})`,
                        }
                    },
                    '& .MuiDataGrid-columnHeaderTitle': {
                        fontWeight: 600,
                        fontSize: '0.85rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                        color: (theme) => alpha(theme.palette.text.secondary, 0.85),
                    },
                    '& .MuiDataGrid-columnSeparator': {
                        display: 'none',
                    },
                    '& .MuiDataGrid-footerContainer': {
                        borderTop: 'none',
                        backgroundColor: (theme) => alpha(theme.palette.background.default, 0.6),
                        borderRadius: '0 0 20px 20px',
                        position: 'relative',
                        height: 50,
                    },
                    '& .MuiDataGrid-row': {
                        transition: 'all 0.28s cubic-bezier(0.4, 0, 0.2, 1)',
                        display: 'flex',
                        justifyContent: 'center',
                        '&:hover': {
                            transform: 'translateY(-1px) scale(1.005)',
                            zIndex: 2,
                            '&::after': {
                                opacity: 1,
                                transform: 'scaleX(0.98)',
                            }
                        },
                        '&::after': {
                            content: '""',
                            position: 'absolute',
                            bottom: 0,
                            left: '2%',
                            width: '96%',
                            height: '1px',
                            background: (theme) => `linear-gradient(90deg, 
                                                    ${alpha(theme.palette.divider, 0)}, 
                                                    ${alpha(theme.palette.divider, 0.12)} 20%, 
                                                    ${alpha(theme.palette.divider, 0.12)} 80%, 
                                                    ${alpha(theme.palette.divider, 0)})`,
                            opacity: 0.6,
                            transition: 'all 0.3s ease',
                            transform: 'scaleX(0.8)',
                        },
                        '&:nth-of-type(even)': {
                            backgroundColor: (theme) => alpha(theme.palette.background.default, 0.45),
                        },
                        '&.Mui-selected': {
                            backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.1),
                            '&:hover': {
                                backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.15),
                            }
                        },
                        '&:last-child': {
                            '&::after': {
                                display: 'none'
                            }
                        }
                    },
                    // Enhanced scrollbar styling
                    '& ::-webkit-scrollbar': {
                        width: '10px',
                        height: '10px',
                    },
                    '& ::-webkit-scrollbar-track': {
                        backgroundColor: 'transparent',
                        borderRadius: '10px',
                        margin: '6px',
                    },
                    '& ::-webkit-scrollbar-thumb': {
                        backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.2),
                        borderRadius: '10px',
                        border: (theme) => `2px solid transparent`,
                        backgroundClip: 'content-box',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                            backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.4),
                            cursor: 'pointer',
                        },
                    },
                    // Enhanced pagination styling
                    '& .MuiTablePagination-root': {
                        fontSize: '0.85rem',
                        color: (theme) => alpha(theme.palette.text.primary, 0.85),
                    },
                    '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
                        fontSize: '0.85rem',
                        color: (theme) => alpha(theme.palette.text.secondary, 0.85),
                        fontWeight: 500,
                    },
                    '& .MuiTablePagination-select': {
                        borderRadius: '10px',
                        marginRight: '8px',
                        padding: '6px 12px',
                        backgroundColor: (theme) => alpha(theme.palette.background.default, 0.7),
                        transition: 'all 0.25s ease',
                        '&:hover': {
                            backgroundColor: (theme) => alpha(theme.palette.action.hover, 0.15),
                            borderColor: (theme) => alpha(theme.palette.primary.main, 0.3),
                        }
                    },
                    '& .MuiTablePagination-actions': {
                        '& .MuiIconButton-root': {
                            padding: '8px',
                            borderRadius: '10px',
                            color: (theme) => theme.palette.primary.main,
                            backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.06),
                            transition: 'all 0.25s ease',
                            margin: '0 3px',
                            '&:hover': {
                                backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.15),
                                transform: 'translateY(-1px)',
                                boxShadow: (theme) => `0 4px 12px ${alpha(theme.palette.primary.main, 0.2)}`,
                            },
                            '&.Mui-disabled': {
                                color: (theme) => alpha(theme.palette.text.disabled, 0.4),
                                backgroundColor: 'transparent',
                            },
                        },
                    },
                    // Enhanced loading overlay
                    '& .MuiDataGrid-overlay': {
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: (theme) => alpha(theme.palette.background.paper, 0.75),
                        backdropFilter: 'blur(8px)',
                        borderRadius: '16px',
                        padding: '28px',
                        height: '100%',
                        '& .MuiCircularProgress-root': {
                            color: (theme) => theme.palette.primary.main,
                        }
                    },
                    // Better focus outline
                    '& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within': {
                        outline: 'none',
                    },
                    '& .MuiDataGrid-cell:focus-within': {
                        position: 'relative',
                        '&::after': {
                            content: '""',
                            position: 'absolute',
                            left: '5%',
                            right: '5%',
                            bottom: 0,
                            height: '2px',
                            backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.6),
                            borderRadius: '2px',
                        }
                    },
                    // Empty rows styling
                    '& .MuiDataGrid-virtualScroller': {
                        backgroundColor: 'transparent',
                    },
                    // Better sort icons
                    '& .MuiDataGrid-iconButtonContainer': {
                        '& .MuiIconButton-root': {
                            padding: '4px',
                            color: (theme) => alpha(theme.palette.text.secondary, 0.7),
                            transition: 'all 0.2s ease',
                            '&:hover': {
                                backgroundColor: (theme) => alpha(theme.palette.action.hover, 0.15),
                                color: (theme) => theme.palette.primary.main,
                                transform: 'scale(1.1)',
                            }
                        }
                    },
                    '& .MuiDataGrid-sortIcon': {
                        opacity: 0.8,
                        fontSize: '0.9rem',
                    },
                }}
            >
                <DataGrid
                    rows={leaderboardList}
                    columns={leaderboardColumns()}
                    loading={isLoading}
                    disableRowSelectionOnClick
                    disableColumnResize={true}
                    autoHeight={false}
                    initialState={{
                        pagination: {
                            paginationModel: { pageSize: 10 },
                        }
                    }}
                    pageSizeOptions={[5, 10, 25, 50]}
                    getRowId={(row) => row.id}
                    getRowHeight={() => 50}
                    slots={{
                        noRowsOverlay: () => (
                            <EmptyTableRows
                                icon={<EmojiEventsIcon />}
                                title="No Leaderboard Data Yet"
                                subtitle="No student participation records have been logged. Encourage engagement to populate the leaderboard."
                            />
                        ),
                        noResultsOverlay: () => (
                            <EmptyTableRows
                                icon={<FilterListOffIcon />}
                                title="No Results Found"
                                subtitle="Your current filter criteria didn't match any records. Try adjusting your filters to see more results."
                            />
                        )
                    }}
                    sx={{
                        '& .MuiCircularProgress-root': {
                            color: (theme) => theme.palette.primary.main,
                        },
                        '& .MuiDataGrid-main': {
                            borderRadius: 4,
                            overflow: 'hidden',
                        },
                        // Add shimmer effect during loading
                        '& .MuiDataGrid-loadingOverlay': {
                            '&::after': {
                                content: '""',
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '200%',
                                height: '100%',
                                background: (theme) => `linear-gradient(90deg, 
                                                                        transparent, 
                                                                        ${alpha(theme.palette.background.paper, 0.2)}, 
                                                                        transparent)`,
                                animation: 'shimmer 2s infinite',
                                '@keyframes shimmer': {
                                    '0%': {
                                        transform: 'translateX(-100%)',
                                    },
                                    '100%': {
                                        transform: 'translateX(50%)',
                                    },
                                },
                            },
                        },
                        // No results overlay styling
                        '& .MuiDataGrid-overlay': {
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 2,
                            '& svg': {
                                fontSize: '2.5rem',
                                color: (theme) => alpha(theme.palette.text.secondary, 0.5),
                                marginBottom: 1,
                            },
                        }
                    }}
                />
            </Box>
        </Box>
    )
}

export default LeaderboardTable;