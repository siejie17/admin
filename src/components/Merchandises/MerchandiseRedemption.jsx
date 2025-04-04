import { collection, query, where, orderBy, onSnapshot, doc, getDoc, updateDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react'
import { db } from '../../utils/firebaseConfig';
import {
    Box,
    Typography,
    Button,
    Chip,
    alpha,
    useTheme,
    CardContent,
    Avatar
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import NumbersIcon from '@mui/icons-material/Numbers';
import BadgeIcon from '@mui/icons-material/Badge';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import StraightenIcon from '@mui/icons-material/Straighten';
import PendingIcon from '@mui/icons-material/Pending';
import UndoIcon from '@mui/icons-material/Undo';
import InventoryIcon from '@mui/icons-material/Inventory';
import Loader from '../General/Loader';

const MerchandiseRedemption = ({ merchandiseID }) => {
    const theme = useTheme();

    const [merchandiseCategory, setMerchandiseCategory] = useState('');
    const [redemptionList, setRedemptionList] = useState([]);
    const [billedRedemptionList, setBilledRedemptionList] = useState([]);
    const [redemptionLength, setRedemptionLength] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    const [lastUpdate, setLastUpdated] = useState(new Date());

    const statusColors = {
        collected: {
            bgColor: alpha(theme.palette.success.main, 0.08),
            color: theme.palette.success.main,
            borderColor: alpha(theme.palette.success.main, 0.3)
        },
        pending: {
            bgColor: alpha(theme.palette.warning.main, 0.08),
            color: theme.palette.warning.main,
            borderColor: alpha(theme.palette.warning.main, 0.3)
        }
    };

    useEffect(() => {
        let unsub;

        fetchRedemptions()
            .then(result => {
                unsub = result;
            })
            .catch(error => {
                console.error("Error in listener setup:", error);
                setIsLoading(false);
            });

        return unsub;
    }, []);

    useEffect(() => {
        if (redemptionList && redemptionList.length > 0) {
            const dataWithIds = redemptionList.map((item, index) => ({
                ...item,
                bil: index + 1
            }));
            setBilledRedemptionList(dataWithIds);
        }
    }, [redemptionList]);

    const fetchRedemptions = async () => {
        setIsLoading(true);
        try {
            const merchandiseCategoryRef = doc(db, "merchandise", merchandiseID);
            const merchandiseCategorySnap = await getDoc(merchandiseCategoryRef);

            if (merchandiseCategorySnap.exists()) {
                setMerchandiseCategory(merchandiseCategorySnap.data().category);
            } else {
                console.error("No such merchandise exists:", error);
                setMerchandiseCategory('');
            }

            const redemptionQuery = query(collection(db, "redemption"), where("merchandiseID", "==", merchandiseID), orderBy("collected", "asc"));

            // Real-time listener for redemption collection
            const unsubscribe = onSnapshot(redemptionQuery, async (redemptionSnapshots) => {
                const redemptionData = redemptionSnapshots.docs.map((redemption) => ({
                    id: redemption.id,
                    ...redemption.data(),
                }));

                // Fetch student details for each redemption
                const mergedDataPromises = redemptionData.map(async (redemption) => {
                    const studentData = await fetchStudentData(redemption.studentID);
                    return {
                        ...redemption, studentName: studentData.firstName + " " + studentData.lastName
                    };
                });

                const mergedData = await Promise.all(mergedDataPromises);
                setRedemptionLength(mergedData.length);
                setRedemptionList(mergedData);
                setLastUpdated(new Date());
                setIsLoading(false);
            });

            return unsubscribe;
        } catch (error) {
            console.error("Error when fetching redemption list:", error);
            setIsLoading(false);
        }
    }

    const fetchStudentData = async (studentID) => {
        // console.log(studentID);
        const studentRef = doc(db, "user", studentID);

        const studentSnap = await getDoc(studentRef);
        if (studentSnap.exists()) {
            return studentSnap.data(); // Assuming studentID is unique
        }
        return {}; // Return empty object if no student found
    };

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

    const getColumns = () => {
        const baseColumns = [
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
                                color: theme.palette.primary.main,
                                mr: 0.5,
                                opacity: 0.8
                            }}
                        />
                    </Box>
                ),
                renderCell: (params) => (
                    <Box
                        sx={{
                            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.18)} 0%, ${alpha(theme.palette.primary.main, 0.08)} 100%)`,
                            height: '38px',
                            width: '38px',
                            borderRadius: '14px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: `inset 0 0 0 1px ${alpha(theme.palette.primary.main, 0.25)}`
                        }}
                    >
                        <Typography
                            variant="body2"
                            fontWeight="700"
                            color="primary.main"
                        >
                            {params.value}
                        </Typography>
                    </Box>
                )
            },
            {
                field: 'studentName',
                headerName: 'Student Name',
                flex: 1,
                minWidth: 200,
                renderHeader: () => (
                    <Box sx={commonHeaderStyle}>
                        <BadgeIcon
                            fontSize="small"
                            sx={{
                                color: theme.palette.primary.main,
                                mr: 1,
                                opacity: 0.8
                            }}
                        />
                        <Typography variant="subtitle1" fontWeight="700">
                            Student Name
                        </Typography>
                    </Box>
                ),
                renderCell: (params) => (
                    <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        '&:hover': {
                            transform: 'translateX(2px)',
                            transition: 'transform 0.2s ease-in-out'
                        }
                    }}>
                        <Avatar
                            sx={{
                                width: 40,
                                height: 40,
                                bgcolor: alpha(theme.palette.primary.main, 0.12),
                                color: theme.palette.primary.dark,
                                fontWeight: 700,
                                fontSize: '1rem',
                                boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.15)}`
                            }}
                        >
                            {params.value.charAt(0).toUpperCase()}
                        </Avatar>
                        <Box>
                            <Typography variant="body1" fontWeight="600" color="text.primary">
                                {params.value}
                            </Typography>
                        </Box>
                    </Box>
                )
            },
            {
                field: 'redemptionID',
                headerName: 'Redemption ID',
                flex: 1,
                minWidth: 150,
                renderHeader: () => (
                    <Box sx={commonHeaderStyle}>
                        <LocalOfferIcon
                            fontSize="small"
                            sx={{
                                color: theme.palette.primary.main,
                                mr: 1,
                                opacity: 0.8,
                                transform: 'rotate(-90deg)'
                            }}
                        />
                        <Typography variant="subtitle1" fontWeight="700">
                            Redemption ID
                        </Typography>
                    </Box>
                ),
                renderCell: (params) => (
                    <Box
                        sx={{
                            px: '10px',
                            py: 1.2,
                            borderRadius: 2,
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            gap: 1,
                            width: '80%',
                            bgcolor: alpha(theme.palette.background.default, 0.5),
                            border: `1px dashed ${alpha(theme.palette.divider, 0.2)}`,
                        }}
                    >
                        <Typography
                            variant="body1"
                            fontWeight="700"
                            color="text.primary"
                            sx={{ letterSpacing: '0.5px' }}
                        >
                            {params.value}
                        </Typography>
                    </Box>
                )
            },
            {
                field: 'quantity',
                headerName: 'Quantity',
                width: 130,
                headerAlign: 'center',
                align: 'center',
                renderHeader: () => (
                    <Box sx={{ ...commonHeaderStyle, justifyContent: 'center' }}>
                        <NumbersIcon
                            fontSize="small"
                            sx={{
                                color: theme.palette.primary.main,
                                mr: 0.5,
                                opacity: 0.8
                            }}
                        />
                        <Typography variant="subtitle1" fontWeight="700" color="text.primary">
                            Quantity
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
            {
                field: 'collected',
                headerName: 'Collection Status',
                width: 180,
                headerAlign: 'center',
                align: 'center',
                renderHeader: () => (
                    <Box sx={{ ...commonHeaderStyle, justifyContent: 'center' }}>
                        <Typography variant="subtitle1" fontWeight="700" color="text.primary">
                            Status
                        </Typography>
                    </Box>
                ),
                renderCell: (params) => {
                    const isCollected = params.value;
                    const statusStyle = isCollected ? statusColors.collected : statusColors.pending;

                    return (
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 0.7,
                                color: statusStyle.color,
                                borderRadius: '16px',
                                mx: '8px',
                                py: '10px',
                                px: '12px',
                                bgcolor: statusStyle.bgColor,
                                border: `1px solid ${statusStyle.borderColor}`,
                                boxShadow: `0 2px 4px ${alpha(statusStyle.color, 0.1)}`,
                                minWidth: '130px'
                            }}
                        >
                            {isCollected ?
                                <CheckCircleIcon sx={{ fontSize: '20px' }} /> :
                                <PendingIcon sx={{ fontSize: '20px' }} />
                            }
                            <Typography
                                variant="caption"
                                fontWeight="670"
                            >
                                {isCollected ? "Collected" : "Yet to Collect"}
                            </Typography>
                        </Box>
                    );
                }
            },
            {
                field: 'actions',
                type: 'actions',
                headerName: 'Action',
                width: 200,
                headerAlign: 'center',
                align: 'center',
                sortable: false,
                filterable: false,
                renderHeader: () => (
                    <Box sx={{ ...commonHeaderStyle, justifyContent: 'center' }}>
                        <Typography variant="subtitle1" fontWeight="700" color="text.primary">
                            Action
                        </Typography>
                    </Box>
                ),
                renderCell: (params) => {
                    const isCollected = params.row.collected;

                    return (
                        <Button
                            variant={isCollected ? "outlined" : "contained"}
                            color={isCollected ? "error" : "success"}
                            size="medium"
                            disableElevation
                            startIcon={isCollected ?
                                <UndoIcon fontSize='small' /> :
                                <InventoryIcon fontSize='small' />
                            }
                            onClick={(e) => {
                                e.stopPropagation();
                                isCollected ?
                                    undoRedemption(params.row.id) :
                                    redemptionCollected(params.row.id)
                            }}
                            sx={{
                                fontWeight: '600',
                                whiteSpace: 'nowrap',
                                minWidth: 160,
                                maxHeight: 40,
                                py: 1,
                                borderRadius: '10px',
                                textTransform: 'none',
                                boxShadow: isCollected ? 'none' : `0 4px 14px ${alpha(theme.palette.success.main, 0.25)}`,
                                '&:hover': {
                                    transform: isCollected ? 'scale(1.02)' : 'translateY(-2px)',
                                    boxShadow: isCollected ? 'none' : `0 6px 14px ${alpha(theme.palette.success.main, 0.35)}`,
                                    transition: 'all 0.2s ease-in-out'
                                }
                            }}
                        >
                            {isCollected ? "Undo Collection" : "Mark as Collected"}
                        </Button>
                    );
                }
            }
        ];

        // Add size column if merchandiseCategory is Clothing
        if (merchandiseCategory === "Clothing") {
            baseColumns.splice(3, 0, {
                field: 'selectedSize',
                headerName: 'Size',
                width: 120,
                headerAlign: 'center',
                align: 'center',
                renderHeader: () => (
                    <Box sx={{ ...commonHeaderStyle, justifyContent: 'center' }}>
                        <StraightenIcon
                            fontSize="small"
                            sx={{
                                color: theme.palette.primary.main,
                                mr: 0.5,
                                opacity: 0.8
                            }}
                        />
                        <Typography variant="subtitle1" fontWeight="700" color="text.primary">
                            Size
                        </Typography>
                    </Box>
                ),
                renderCell: (params) => (
                    <Box
                        sx={{
                            py: 0.8,
                            px: 2,
                            borderRadius: '8px',
                            minWidth: '60px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            bgcolor: alpha(theme.palette.grey[200], 0.6),
                            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                        }}
                    >
                        <Typography variant="body1" fontWeight="700" color="text.primary">
                            {params.value}
                        </Typography>
                    </Box>
                )
            });
        }

        return baseColumns;
    };

    const undoRedemption = async (id) => {
        try {
            const redemptionRef = doc(db, "redemption", id);

            await updateDoc(redemptionRef, {
                collected: false,
            })
        } catch (error) {
            console.error("Error when undoing redemption collected status", error)
        }
    }

    const redemptionCollected = async (id) => {
        try {
            const redemptionRef = doc(db, "redemption", id);

            await updateDoc(redemptionRef, {
                collected: true,
            })
        } catch (error) {
            console.error("Error when updating redemption collected status", error)
        }
    }

    if (isLoading) {
        return (
            <Loader loadingText='Loading redemption list...' />
        );
    }

    return (
        <Box
            sx={{
                width: '100%',
                overflow: 'hidden',
                boxShadow: (theme) => `0 8px 24px ${alpha(theme.palette.common.black, 0.1)}`,
                borderBottom: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
                borderRadius: '8px 8px 0 0',
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', my: { xs: 2, md: 2 } }}>
                <Box
                    sx={{
                        width: 4,
                        height: 28,
                        bgcolor: theme.palette.primary.main,
                        borderRadius: 1,
                        mr: 2,
                        display: { xs: 'none', sm: 'block' }
                    }}
                />
                <Box>
                    <Typography
                        variant="h5"
                        sx={{
                            fontWeight: 700,
                            color: theme.palette.text.primary,
                            letterSpacing: '-0.2px'
                        }}
                    >
                        Redemption List
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                        <Chip
                            size="small"
                            label={`${redemptionLength} items`}
                            sx={{
                                height: 20,
                                fontSize: '0.75rem',
                                bgcolor: alpha(theme.palette.primary.main, 0.1),
                                color: theme.palette.primary.main,
                                fontWeight: 600,
                                mr: 1
                            }}
                        />
                        <Typography variant="caption" color="text.secondary">
                            Last updated: {lastUpdate.toLocaleTimeString()}
                        </Typography>
                    </Box>
                </Box>
            </Box>
            <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
                <Box
                    sx={{
                        height: 700,
                        width: '100%',
                        '& .MuiDataGrid-root': {
                            border: 'none',
                            '--DataGrid-rowBorderColor': 'transparent',
                        },
                        '& .MuiDataGrid-cell': {
                            pb: 2,
                            fontSize: '1.275rem',
                            justifyContent: "flex-start",
                            borderBottom: `none`,
                        },
                        '& .MuiDataGrid-columnHeaders': {
                            borderBottom: (theme) => `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                            height: 60,
                        },
                        '& .MuiDataGrid-columnHeaderTitle': {
                            fontWeight: 600,
                            fontSize: '1.275rem',
                            color: 'text.secondary',
                        },
                        '& .MuiDataGrid-columnSeparator': {
                            visibility: 'visible',
                            color: alpha(theme.palette.divider, 0.4),
                        },
                        '& .MuiDataGrid-footerContainer': {
                            borderTop: (theme) => `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                            backgroundColor: (theme) => alpha(theme.palette.background.default, 0.5),
                        },
                        '& .MuiDataGrid-row': {
                            py: '12px',
                            transition: 'background-color 0.2s ease',
                            '&:hover': {
                                backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.04),
                            },
                        },
                        '& .MuiDataGrid-row.collected-row': {
                            backgroundColor: (theme) => alpha(theme.palette.success.main, 0.04),
                        },
                        '& .MuiDataGrid-row.not-collected-row': {
                            backgroundColor: 'transparent',
                        },
                        '& .MuiDataGrid-filler': {
                            display: 'none'
                        },
                        '& .MuiDataGrid-scrollbar': {
                            '&::-webkit-scrollbar': {
                                width: '10px',
                                height: '10px',
                            },
                            '&::-webkit-scrollbar-track': {
                                backgroundColor: alpha(theme.palette.background.default, 0.7),
                                borderRadius: '10px',
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
                            backgroundColor: alpha(theme.palette.background.default, 0.7),
                            borderRadius: '10px',
                            margin: 2,
                        },
                        '& *::-webkit-scrollbar-thumb': {
                            backgroundColor: alpha(theme.palette.primary.main, 0.2),
                            borderRadius: '10px',
                            border: `2px solid ${alpha(theme.palette.background.paper, 0.8)}`,
                            '&:hover': {
                                backgroundColor: alpha(theme.palette.primary.main, 0.3),
                                cursor: 'pointer',
                            },
                        },
                        '& .MuiDataGrid-virtualScroller::-webkit-scrollbar-corner': {
                            // backgroundColor: 'transparent',
                        },
                        '& .MuiDataGrid-topContainer': {
                            // backgroundColor: 'transparent'
                        },
                        '& .MuiTablePagination-root': {
                            fontSize: '0.95rem',
                        },
                        '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
                            fontSize: '0.95rem',
                            color: 'text.secondary'
                        },
                    }}
                >
                    <DataGrid
                        rows={billedRedemptionList}
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
                        getRowClassName={(params) =>
                            params.row.collected ? 'collected-row' : 'not-collected-row'
                        }
                        getRowHeight={() => 55} // Ensure consistent row height
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
            </CardContent>
        </Box>
    );
};

export default MerchandiseRedemption