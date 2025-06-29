import React, { useState, useEffect } from 'react';
import {
    Box,
    Pagination,
    useMediaQuery,
    useTheme,
    Typography,
    Button,
    Paper,
    Chip,
    alpha,
    Tooltip,
    Stack,
    Fade,
    TextField,
    InputAdornment,
    IconButton
} from '@mui/material';
import {
    Add as AddIcon,
    Event as EventIcon,
    EventNote as EventNoteIcon,
    Search as SearchIcon,
    Clear as ClearIcon
} from '@mui/icons-material';
import { collection, getDocs, query, orderBy, limit, startAfter, where } from 'firebase/firestore';
import { getItem } from '../../utils/localStorage';
import { db } from '../../utils/firebaseConfig'; // Make sure to create this file for your Firebase config
import EventListState from '../../components/Events/List/EventListState';
import { useNavigate } from 'react-router-dom';
import Loader from '../../components/General/Loader';
import EmptyList from '../../components/General/EmptyList';

const EventListingPage = () => {
    const [events, setEvents] = useState([]);
    const [allEvents, setAllEvents] = useState([]);
    const [eventsSize, setEventsSize] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [lastVisible, setLastVisible] = useState(null);
    const [hasMore, setHasMore] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const navigate = useNavigate();
    const eventsPerPage = 6;

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isExtraSmall = useMediaQuery(theme.breakpoints.down('xs'));

    // Load events from Firestore
    const fetchEvents = async (isFirstPage = false, searchTerm = '') => {
        try {
            let eventsQuery;

            const adminData = await getItem("admin");
            const parsedAdminData = JSON.parse(adminData);

            // Base query with faculty filter
            const baseQuery = [
                where("organiserID", "==", parsedAdminData.facultyID)
            ];

            // If searching, get all events for this faculty (no pagination)
            if (searchTerm.trim() !== '') {
                eventsQuery = query(
                    collection(db, "event"),
                    ...baseQuery,
                    orderBy("eventStartDateTime", "desc")
                );
            } else {
                // Normal pagination for non-search
                if (isFirstPage) {
                    eventsQuery = query(
                        collection(db, "event"),
                        ...baseQuery,
                        orderBy("eventStartDateTime", "desc"),
                        limit(eventsPerPage)
                    );
                } else if (lastVisible) {
                    eventsQuery = query(
                        collection(db, "event"),
                        ...baseQuery,
                        orderBy("eventStartDateTime", "desc"),
                        startAfter(lastVisible),
                        limit(eventsPerPage)
                    );
                } else {
                    setLoading(false);
                    return;
                }
            }

            const snapshot = await getDocs(eventsQuery);

            if (snapshot.empty) {
                setHasMore(false);
                setLoading(false);
                return;
            }

            // Get the last visible document for pagination (only if not searching)
            if (searchTerm.trim() === '') {
                const lastDoc = snapshot.docs[snapshot.docs.length - 1];
                setLastVisible(lastDoc);
            }

            // Convert Firestore documents to objects
            const eventList = await Promise.all(
                snapshot.docs.map(async (doc) => {
                    const event = { id: doc.id, ...doc.data() };

                    const imagesQuery = query(collection(db, "eventImages"), where("eventID", "==", event.id));
                    const imagesSnap = await getDocs(imagesQuery);

                    const imagesData = imagesSnap.docs[0].data().images;

                    return { ...event, imagesData };
                })
            );

            // Filter by search term if provided
            let filteredEvents = eventList;
            if (searchTerm.trim() !== '') {
                filteredEvents = eventList.filter(event => 
                    event.eventName.toLowerCase().includes(searchTerm.toLowerCase())
                );
            }

            setAllEvents(filteredEvents);
            setEvents(filteredEvents);

            // Update pagination info
            if (searchTerm.trim() !== '') {
                // For search results, show all matching events
                setEventsSize(filteredEvents.length);
                setTotalPages(1);
                setHasMore(false);
            } else {
                // For normal browsing, estimate total pages
                const countQuery = await getDocs(query(collection(db, "event"), where("organiserID", "==", parsedAdminData.facultyID)));
                const totalEvents = countQuery.size;
                setEventsSize(totalEvents);
                setTotalPages(Math.ceil(totalEvents / eventsPerPage));
            }

            setLoading(false);
        } catch (error) {
            console.error("Error fetching events:", error);
            setError("Failed to load events. Please try again later.");
            setLoading(false);
        }
    };

    // Add search filtering effect
    useEffect(() => {
        if (searchQuery.trim() === '') {
            // If search is cleared, fetch first page normally
            fetchEvents(true);
        } else {
            // If searching, fetch all events and filter
            fetchEvents(true, searchQuery);
        }
    }, [searchQuery]);

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

    // Fetch first page on component mount
    useEffect(() => {
        fetchEvents(true);
    }, []);

    // Handle page change
    const handlePageChange = (event, value) => {
        setPage(value);
        if (value === 1) {
            // If going to first page, use search term if available
            fetchEvents(true, searchQuery);
        } else {
            // For other pages, only work if not searching
            if (searchQuery.trim() === '') {
                fetchEvents(false);
            }
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
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
                    flexDirection: isExtraSmall ? 'column' : 'row',
                    alignItems: isExtraSmall ? 'flex-start' : 'center',
                    py: { xs: 1, sm: 2 },
                    px: { xs: 2, sm: 3 },
                    gap: { xs: 2, sm: 0 },
                    mb: 4,
                    borderBottom: '1px solid rgba(0, 0, 0, 0.06)'
                }}
            >
                {/* Header with Title */}
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
                                transition: 'all 0.2s ease',
                            }}
                        >
                            <EventIcon
                                sx={{
                                    fontSize: { xs: 18, sm: 22 },
                                    color: theme.palette.primary.dark
                                }}
                            />
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography
                                variant="h5"
                                component="h1"
                                fontWeight="700"
                                sx={{
                                    fontSize: { xs: '1.25rem', sm: '1.5rem' },
                                    letterSpacing: '-0.01em'
                                }}
                            >
                                My Events
                            </Typography>

                            <Tooltip title="Total events" arrow placement="top">
                                <Chip
                                    label={eventsSize}
                                    size="small"
                                    color="primary"
                                    sx={{
                                        ml: 1.5,
                                        height: 24,
                                        fontWeight: 600,
                                        borderRadius: 4,
                                        bgcolor: alpha(theme.palette.primary.main, 0.12),
                                        color: theme.palette.primary.main,
                                        border: 'none'
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
                        placeholder="Search events..."
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
                        mb: { xs: 1, sm: 0 },
                        ml: { xs: 0, sm: 'auto' },
                        width: { xs: '100%', sm: 'auto' }
                    }}
                >
                    <Button
                        fullWidth
                        variant="contained"
                        startIcon={<AddIcon fontSize='small' />}
                        onClick={() => navigate('/event/create-event')}
                        size={isMobile ? "small" : "medium"}
                        sx={{
                            borderRadius: 2,
                            textTransform: 'none',
                            fontWeight: 600,
                            backgroundImage: `linear-gradient(135deg, rgba(33, 150, 243, 0.8), ${theme.palette.primary.main})`,
                            fontSize: '12px',
                            py: 1,
                            boxShadow: 2,
                            '&:hover': {
                                backgroundImage: `linear-gradient(135deg, rgba(33, 150, 243, 0.9), ${theme.palette.primary.dark})`,
                                boxShadow: 3,
                                transform: 'translateY(-1px)',
                                transition: 'all 0.2s ease',
                            },
                        }}
                        aria-label="add event button"
                    >
                        Add Event
                    </Button>
                </Stack>
            </Box>

            {/* Content Section */}
            {loading ?
                <Loader loadingText='Loading your events...' />
                : events.length === 0 ?
                    <EmptyList 
                        icon={<EventNoteIcon />} 
                        title={searchQuery ? "No Matching Events" : "No Events Available"} 
                        subtitle={searchQuery 
                            ? `No events found matching "${searchQuery}"` 
                            : "There are currently no events managed by you."
                        } 
                        info={searchQuery 
                            ? "Try adjusting your search terms or browse all events." 
                            : "Events that you create will appear here. You can manage, edit, and track all your events from this dashboard."
                        }
                    />
                    : (
                        <>
                            <Fade in={true}>
                                <Box>
                                    <EventListState events={events} />
                                </Box>
                            </Fade>

                            {/* Only show pagination if there are results and no active search */}
                            {!searchQuery && (
                                <Box sx={{
                                    display: 'flex',
                                    justifyContent: 'flex-end',
                                    position: 'fixed',
                                    bottom: 30,
                                    right: 30,
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
    );
};

export default EventListingPage;