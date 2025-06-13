import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Button,
    Pagination,
    Paper,
    Chip,
    useMediaQuery,
    useTheme,
    Fade,
    alpha,
    Tooltip,
    Stack,
    TextField,
    InputAdornment,
    IconButton
} from '@mui/material';
import { Add as AddIcon, Redeem as RedeemIcon, Storefront as StorefrontIcon, Search as SearchIcon, Clear as ClearIcon } from '@mui/icons-material';

import { useNavigate } from 'react-router-dom';
import { collection, query, orderBy, limit, startAfter, where, onSnapshot } from 'firebase/firestore';

import { getItem } from '../../utils/localStorage';
import { db } from '../../utils/firebaseConfig';

import MerchandiseListState from '../../components/Merchandises/MerchandiseListState';
import Loader from '../../components/General/Loader';
import EmptyList from '../../components/General/EmptyList';

const MerchandiseListingPage = () => {
    const [merchandises, setMerchandises] = useState([]);
    const [allMerchandises, setAllMerchandises] = useState([]);
    const [merhandisesCount, setMerchandisesCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [lastVisible, setLastVisible] = useState(null);
    const [hasMore, setHasMore] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const navigate = useNavigate();
    const merchandisesPerPage = 6;

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isExtraSmall = useMediaQuery(theme.breakpoints.down('xs'));

    const fetchMerchandises = async (isFirstPage = false) => {
        try {
            const adminData = await getItem("admin");
            const parsedAdminData = JSON.parse(adminData);

            // Get total count for pagination
            const countQuery = query(
                collection(db, "merchandise"),
                where("adminID", "==", parsedAdminData.facultyID)
            );

            // First set up a listener for the count to update totalPages dynamically
            const countUnsubscribe = onSnapshot(countQuery, (countSnapshot) => {
                const totalMerchandises = countSnapshot.size;
                setMerchandisesCount(totalMerchandises);
                setTotalPages(Math.ceil(totalMerchandises / merchandisesPerPage));
            }, (error) => {
                console.error("Error in count snapshot:", error);
                setError("Failed to get merchandise count.");
            });

            let merchandisesQuery;

            if (isFirstPage) {
                merchandisesQuery = query(
                    collection(db, "merchandise"),
                    where("adminID", "==", parsedAdminData.facultyID),
                    orderBy("name", "asc"),
                    limit(merchandisesPerPage)
                );
            } else if (lastVisible) {
                merchandisesQuery = query(
                    collection(db, "merchandise"),
                    where("adminID", "==", parsedAdminData.facultyID),
                    orderBy("name", "asc"),
                    startAfter(lastVisible),
                    limit(merchandisesPerPage)
                );
            } else {
                // Return if we're not on the first page and don't have a last document
                setLoading(false);
                return { countUnsubscribe, dataUnsubscribe: () => { } };
            }

            const dataUnsubscribe = onSnapshot(merchandisesQuery, (snapshot) => {
                if (snapshot.empty) {
                    setHasMore(false);
                    setMerchandises([]);
                    setAllMerchandises([]);
                } else {
                    // Get the last visible document for pagination
                    const lastDoc = snapshot.docs[snapshot.docs.length - 1];
                    setLastVisible(lastDoc);

                    const merchList = snapshot.docs.map((doc) => ({
                        id: doc.id,
                        ...doc.data()
                    }));

                    setAllMerchandises(merchList);
                    // Initial filtering will be handled by the useEffect
                    setMerchandises(merchList);
                    setHasMore(snapshot.docs.length >= merchandisesPerPage);
                }

                setLoading(false);
            }, (error) => {
                console.error("Error in data snapshot:", error);
                setError("Failed to load merchandises. Please try again later.");
                setLoading(false);
            });

            return { countUnsubscribe, dataUnsubscribe };
        } catch (error) {
            console.error("Error fetching merchandises:", error);
            setError("Failed to load merchandises. Please try again later.");
            setLoading(false);
            return { countUnsubscribe: () => { }, dataUnsubscribe: () => { } };
        }
    }

    useEffect(() => {
        let unsubscribes = { countUnsubscribe: () => { }, dataUnsubscribe: () => { } };

        fetchMerchandises(true)
            .then(result => {
                unsubscribes = result;
            })
            .catch(error => {
                console.error("Error in listener setup:", error);
                setError("Failed to initialize merchandise listeners.");
                setLoading(false);
            });

        return () => {
            unsubscribes.countUnsubscribe();
            unsubscribes.dataUnsubscribe();
        }
    }, []);

    // Add this new useEffect to handle search filtering
    useEffect(() => {
        if (searchQuery.trim() === '') {
            setMerchandises(allMerchandises);
        } else {
            const filtered = allMerchandises.filter(merch => 
                merch.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setMerchandises(filtered);
        }
    }, [searchQuery, allMerchandises]);

    // Handle page change
    const handlePageChange = (event, value) => {
        setPage(value);

        let unsubscribes = { countUnsubscribe: () => { }, dataUnsubscribe: () => { } };

        if (value === 1) {
            fetchMerchandises(true)
                .then(result => {
                    unsubscribes = result;
                })
                .catch(error => {
                    console.error("Error in listener setup:", error);
                    setError("Failed to initialize merchandise listeners.");
                    setLoading(false);
                });
        } else {
            fetchMerchandises(false)
                .then(result => {
                    unsubscribes = result;
                })
                .catch(error => {
                    console.error("Error in listener setup:", error);
                    setError("Failed to initialize merchandise listeners.");
                    setLoading(false);
                });
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });

        return () => {
            unsubscribes.countUnsubscribe();
            unsubscribes.dataUnsubscribe();
        }
    };

    // Handle search input change
    const handleSearchChange = (event) => {
        setSearchQuery(event.target.value);
        setPage(1); // Reset to first page when searching
    };

    // Clear search
    const handleClearSearch = () => {
        setSearchQuery('');
        setPage(1);
    };

    return (
        <Box
            sx={{
                maxWidth: "100%",
                pb: 3,
            }}
        >
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: isExtraSmall ? 'column' : 'row',//{ xs: 'column', sm: 'row' },
                    alignItems: isExtraSmall ? 'flex-start' : 'center',
                    py: { xs: 1, sm: 2 },
                    px: { xs: 2, sm: 3.5 },
                    gap: { xs: 2, sm: 0 },
                    mb: 4,
                    borderBottom: '1px solid rgba(0, 0, 0, 0.06)'
                }}
            >
                {/* Header with Back Button */}
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        flexGrow: 1,
                        minWidth: 0,
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box
                            sx={{
                                backgroundColor: alpha(theme.palette.primary.main, 0.08),
                                color: theme.palette.primary.dark,
                                borderRadius: 2,
                                p: 1.25,
                                mr: 2,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0, // Prevent icon from shrinking
                            }}
                        >
                            <StorefrontIcon
                                sx={{
                                    fontSize: { xs: 18, sm: 22 },
                                    color: theme.palette.primary.dark
                                }}
                            />
                        </Box>

                        <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            minWidth: 0, // Important for text overflow
                            flexWrap: { xs: 'nowrap', sm: 'wrap' }, // Allow wrapping on smaller screens
                        }}>
                            <Typography
                                variant="h5"
                                component="h1"
                                fontWeight="700"
                                sx={{
                                    fontSize: { xs: '1.25rem', sm: '1.5rem' },
                                    letterSpacing: '-0.01em',
                                    mr: 1.5,
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: { xs: 'nowrap', sm: 'normal' }, // Only allow wrapping on sm+
                                }}
                            >
                                My Merchandises
                            </Typography>

                            <Tooltip title="Total merchandises managed by admin" arrow placement="top">
                                <Chip
                                    label={merhandisesCount}
                                    size="small"
                                    color="primary"
                                    sx={{
                                        height: 24,
                                        fontWeight: 600,
                                        borderRadius: 4,
                                        bgcolor: alpha(theme.palette.primary.main, 0.12),
                                        color: theme.palette.primary.main,
                                        border: 'none',
                                    }}
                                />
                            </Tooltip>
                        </Box>
                    </Box>
                </Box>

                {/* Search Bar */}
                <Box
                    sx={{
                        width: { xs: '100%', sm: '300px' },
                        mx: { xs: 0, sm: 2 },
                        mb: { xs: 2, sm: 0 }
                    }}
                >
                    <TextField
                        fullWidth
                        size="small"
                        placeholder="Search merchandises..."
                        value={searchQuery}
                        onChange={handleSearchChange}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon sx={{ color: 'text.secondary' }} />
                                </InputAdornment>
                            ),
                            endAdornment: searchQuery && (
                                <InputAdornment position="end">
                                    <IconButton
                                        size="small"
                                        onClick={handleClearSearch}
                                        edge="end"
                                    >
                                        <ClearIcon fontSize="small" />
                                    </IconButton>
                                </InputAdornment>
                            ),
                            sx: {
                                borderRadius: 2,
                                backgroundColor: alpha(theme.palette.background.paper, 0.8),
                                '&:hover': {
                                    backgroundColor: alpha(theme.palette.background.paper, 0.9),
                                },
                                '&.Mui-focused': {
                                    backgroundColor: theme.palette.background.paper,
                                }
                            }
                        }}
                    />
                </Box>

                {/* Action Buttons */}
                <Stack
                    direction={isExtraSmall ? "column" : "row"}
                    spacing={1.5}
                    sx={{
                        mb: { xs: 2, sm: 0 },
                        ml: { xs: 1, sm: 0 },
                        width: { xs: '100%', sm: 'auto' },
                        // flexShrink: 0,
                    }}
                >
                    <Button
                        fullWidth
                        variant="contained"
                        startIcon={<AddIcon fontSize='small' />}
                        onClick={() => navigate('/merchandise/create-merchandise')}
                        size={isMobile ? "small" : "medium"}
                        sx={{
                            borderRadius: 2,
                            textTransform: 'none',
                            fontWeight: 600,
                            backgroundImage: `linear-gradient(135deg, rgba(33, 150, 243, 0.8), ${theme.palette.primary.main})`,
                            fontSize: '12px',
                            py: 1,
                            boxShadow: 2,
                            whiteSpace: 'nowrap', // Prevent button text from wrapping
                            '&:hover': {
                                backgroundImage: `linear-gradient(135deg, rgba(33, 150, 243, 0.9), ${theme.palette.primary.dark})`,
                                boxShadow: 3,
                                transform: 'translateY(-1px)',
                                transition: 'all 0.2s ease',
                            },
                        }}
                        aria-label="add event button"
                    >
                        Add Merch
                    </Button>
                </Stack>
            </Box>

            {/* Content Area */}
            {loading ? <Loader loadingText='Loading merchandises...' />
                : merchandises.length === 0 ? (
                    <EmptyList 
                        icon={<RedeemIcon />} 
                        title={searchQuery ? "No Matching Merchandises" : "No Merchandises Available"} 
                        subtitle={searchQuery 
                            ? `No merchandises found matching "${searchQuery}"` 
                            : "There are currently no merchandises managed by you."
                        } 
                        info={searchQuery 
                            ? "Try adjusting your search terms or browse all merchandises." 
                            : "Merchandises that you create will appear here. You can manage, edit, and track all your merchandises from this dashboard."
                        }
                    />
                ) : (
                    <>
                        <Fade in={true}>
                            <Box>
                                <MerchandiseListState merchandises={merchandises} />
                            </Box>
                        </Fade>

                        {/* Only show pagination if there are results and no active search */}
                        {!searchQuery && (
                            <Box sx={{
                                display: 'flex',
                                justifyContent: 'flex-end',
                                position: 'fixed',
                                bottom: 40,
                                right: 40,
                                zIndex: 1000,
                            }}>
                                <Paper
                                    elevation={3}
                                    sx={{
                                        py: 1,
                                        px: 1.5,
                                        borderRadius: 3,
                                        backgroundColor: theme.palette.background.paper,
                                        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                                        backdropFilter: 'blur(8px)',
                                        boxShadow: `0 4px 12px ${alpha(theme.palette.common.black, 0.08)}`,
                                    }}
                                >
                                    <Pagination
                                        count={totalPages || 1}
                                        page={page}
                                        onChange={handlePageChange}
                                        color="primary"
                                        size={isMobile ? "small" : "medium"}
                                        showFirstButton
                                        showLastButton
                                        sx={{
                                            '& .MuiPaginationItem-root': {
                                                color: 'black',
                                                borderRadius: 1.5,
                                                mx: { xs: 0.2, sm: 0.5 },
                                                fontWeight: 500,
                                                fontSize: { xs: '0.875rem', sm: '0.9rem' }
                                            },
                                            '& .Mui-selected': {
                                                fontWeight: 700,
                                                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                                '&:hover': {
                                                    backgroundColor: alpha(theme.palette.primary.main, 0.2),
                                                }
                                            }
                                        }}
                                    />
                                </Paper>
                            </Box>
                        )}
                    </>
                )}
        </Box>
    )
}

export default MerchandiseListingPage;