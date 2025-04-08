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
  Divider
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
    <Container maxWidth="100%" sx={{ py: 4 }}>
      {/* Header Section */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
          px: 1
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <EventIcon
            color="primary"
            sx={{
              fontSize: { xs: 28, sm: 36 },
              mr: 1.5,
              opacity: 0.9
            }}
          />
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
              ml: 2,
              fontWeight: 600,
              height: 24,
              borderRadius: 1.5
            }}
          />
        </Box>

        <Link
          component={RouterLink}
          to="/event/create-event"
          variant="body2"
          underline="none"
          sx={{
            transition: 'all 0.3s',
            order: { xs: -1, sm: 0 },
            width: { xs: '100%', sm: 'auto' },
            display: { xs: 'flex', sm: 'inline-flex' },
            justifyContent: { xs: 'flex-end', sm: 'center' }
          }}
        >
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon sx={{ fontSize: { xs: 18, sm: 20 } }} />}
            sx={{
              borderRadius: 2.5,
              px: { xs: 2, sm: 3 },
              py: { xs: 1, sm: 1.25 },
              textTransform: 'none',
              fontWeight: 600,
              fontSize: { xs: '0.9rem', sm: '0.95rem' },
              boxShadow: '0 4px 12px rgba(25, 118, 210, 0.2)',
              background: 'linear-gradient(45deg, #1976d2, #2196f3)',
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: '0 6px 16px rgba(25, 118, 210, 0.3)',
                transform: 'translateY(-2px)',
                background: 'linear-gradient(45deg, #1565c0, #1976d2)'
              },
              width: { xs: 'auto', sm: 'auto' }
            }}
          >
            Create Event
          </Button>
        </Link>
      </Box>

      <Divider sx={{ mb: 4, opacity: 0.6 }} />

      {/* Content Section */}
      {loading ? (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'column',
            py: 10
          }}
        >
          <CircularProgress
            size={48}
            thickness={3}
            sx={{ color: 'primary.main' }}
          />
          <Typography
            variant="body1"
            sx={{ mt: 2, color: 'text.secondary' }}
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
          <Box sx={{ mb: 1 }}>
            <EventListState events={events} />
          </Box>

          <Box sx={{
            display: 'flex',
            justifyContent: 'center',
            mt: { xs: 4, sm: 5, md: 6 }
          }}>
            <Paper
              elevation={0}
              sx={{
                py: 1.5,
                px: 2,
                borderRadius: 2,
                backgroundColor: 'background.paper'
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
                    borderRadius: 2,
                    mx: { xs: 0.2, sm: 0.5 },
                    fontWeight: 500,
                    fontSize: { xs: '0.875rem', sm: '1rem' }
                  },
                  '& .Mui-selected': {
                    fontWeight: 700,
                    boxShadow: '0px 2px 4px rgba(0,0,0,0.1)'
                  }
                }}
              />
            </Paper>
          </Box>
        </>
      )}
    </Container>
  );
};

export default EventListingPage;