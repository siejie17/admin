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
  IconButton
} from '@mui/material';
import {
  Add as AddIcon,
  Event as EventIcon
} from '@mui/icons-material';
import { collection, getDocs, query, orderBy, limit, startAfter, where } from 'firebase/firestore';
import EmptyEventState from '../../components/Events/EmptyEventState';
import ErrorEventState from '../../components/Events/ErrorEventState';
import { getItem } from '../../utils/localStorage';
import { db } from '../../utils/firebaseConfig'; // Make sure to create this file for your Firebase config
import EventListState from '../../components/Events/EventListState';
import { useNavigate } from 'react-router-dom';
import Loader from '../../components/General/Loader';

const EventListingPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [lastVisible, setLastVisible] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  const navigate = useNavigate();
  const eventsPerPage = 6;

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isExtraSmall = useMediaQuery(theme.breakpoints.down('xs'));

  // Load events from Firestore
  const fetchEvents = async (isFirstPage = false) => {
    try {
      let eventsQuery;

      const adminData = await getItem("admin");
      const parsedAdminData = JSON.parse(adminData);

      if (isFirstPage) {
        eventsQuery = query(
          collection(db, "event"),
          where("organiserID", "==", parsedAdminData.facultyID),
          orderBy("eventStartDateTime", "desc"),
          limit(eventsPerPage)
        );
      } else if (lastVisible) {
        eventsQuery = query(
          collection(db, "event"),
          where("organiserID", "==", parsedAdminData.facultyID),
          orderBy("eventStartDateTime", "desc"),
          startAfter(lastVisible),
          limit(eventsPerPage)
        );
      } else {
        // Return if we're not on the first page and don't have a last document
        setLoading(false);
        return;
      }

      const snapshot = await getDocs(eventsQuery);

      if (snapshot.empty) {
        setHasMore(false);
        setLoading(false);
        return;
      }

      // Get the last visible document for pagination
      const lastDoc = snapshot.docs[snapshot.docs.length - 1];
      setLastVisible(lastDoc);

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

      setEvents(eventList);

      // Estimate total pages
      const countQuery = await getDocs(query(collection(db, "event"), where("organiserID", "==", parsedAdminData.facultyID)));
      const totalEvents = countQuery.size;
      setTotalPages(Math.ceil(totalEvents / eventsPerPage));

      setLoading(false);
    } catch (error) {
      console.error("Error fetching events:", error);
      setError("Failed to load events. Please try again later.");
      setLoading(false);
    }
  };

  // Fetch first page on component mount
  useEffect(() => {
    fetchEvents(true);
  }, []);

  // Handle page change
  const handlePageChange = (event, value) => {
    setPage(value);
    if (value === 1) {
      fetchEvents(true);
    } else {
      fetchEvents(false);
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
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: isExtraSmall ? 'flex-start' : 'center',
          py: { xs: 1, sm: 1.5 },
          px: { xs: 2, sm: 3 },
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
            width: { xs: '100%', sm: 'auto' },
            justifyContent: { xs: 'space-between', sm: 'flex-start' }
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
                  label={events.length}
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
      {loading ? <Loader loadingText='Loading your events...' />
        : error ? <ErrorEventState error={error} fetchEvents={fetchEvents} />
          : events.length === 0 ? <EmptyEventState />
            : (
              <>
                {/* Events List */}
                <EventListState events={events} />

                {/* Pagination - only if events exist */}
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
                      boxShadow: `0 4px 12px ${alpha(theme.palette.common.black, 0.08)}`, // Added shadow for floating effect
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
              </>
            )}
    </Box>
  );
};

export default EventListingPage;