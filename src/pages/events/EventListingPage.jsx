import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Pagination,
  useMediaQuery,
  useTheme,
  CircularProgress,
  Typography,
  Button,
  Paper,
  Link,
  Chip,
  Divider,
  alpha
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
import { Link as RouterLink } from 'react-router-dom';

const EventListingPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [lastVisible, setLastVisible] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const eventsPerPage = 6;

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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
        py: 5,
        px: { xs: 2, sm: 4 },
      }}
    >
      {/* Header Section */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          mb: 4,
          gap: { xs: 3, sm: 0 }
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box
            sx={{
              backgroundColor: alpha(theme.palette.primary.main, 0.1),
              borderRadius: 2,
              p: 1.5,
              mr: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <EventIcon
              color="primary"
              sx={{ fontSize: { xs: 24, sm: 28 } }}
            />
          </Box>

          <Typography
            variant="h4"
            component="h1"
            fontWeight="800"
            sx={{
              color: theme.palette.text.primary,
              fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' },
              lineHeight: 1.2,
              letterSpacing: '-0.01em'
            }}
          >
            My Events
          </Typography>
          <Chip
            label={events?.length || 0}
            size="small"
            color="primary"
            variant="outlined"
            sx={{
              fontWeight: 600,
              height: 24,
              borderRadius: 1,
              ml: 1.5
            }}
          />
        </Box>

        <Button
          component={RouterLink}
          to="/event/create-event"
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          sx={{
            borderRadius: 2,
            px: 3,
            py: 1.25,
            textTransform: 'none',
            fontWeight: 600,
            boxShadow: 'none',
            bgcolor: theme.palette.primary.main,
            '&:hover': {
              boxShadow: `0 8px 16px ${alpha(theme.palette.primary.main, 0.25)}`,
              bgcolor: theme.palette.primary.dark,
            },
            transition: 'all 0.2s ease',
            alignSelf: { xs: 'stretch', sm: 'auto' },
            width: { xs: '100%', sm: 'auto' }
          }}
        >
          Create Event
        </Button>
      </Box>

      {/* Content Section */}
      {loading ? (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'column',
            py: 10,
            bgcolor: alpha(theme.palette.background.paper, 0.6),
            borderRadius: 3,
            backdropFilter: 'blur(8px)',
          }}
        >
          <Box sx={{ position: 'relative' }}>
            <CircularProgress
              size={48}
              thickness={4}
              sx={{
                color: 'primary.main',
                opacity: 0.3
              }}
            />
            <CircularProgress
              size={48}
              thickness={4}
              sx={{
                color: 'primary.main',
                position: 'absolute',
                left: 0,
                animationDuration: '1s'
              }}
            />
          </Box>
          <Typography
            variant="body1"
            sx={{
              mt: 3,
              color: 'text.primary',
              fontWeight: 500
            }}
          >
            Loading your events...
          </Typography>
        </Box>
      ) : error ? (
        <ErrorEventState error={error} fetchEvents={fetchEvents} />
      ) : events.length === 0 ? (
        <EmptyEventState />
      ) : (
        <>
          <EventListState events={events} />

          <Box sx={{
            display: 'flex',
            justifyContent: 'center',
            mt: 3
          }}>
            <Paper
              elevation={0}
              sx={{
                py: 1,
                px: 1.5,
                borderRadius: 3,
                backgroundColor: theme.palette.background.paper,
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                backdropFilter: 'blur(8px)',
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