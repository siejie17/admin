import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Pagination,
  useMediaQuery,
  useTheme,
  CircularProgress,
} from '@mui/material';
import { collection, getDocs, query, orderBy, limit, startAfter, where } from 'firebase/firestore';
import EmptyEventState from '../../components/Events/EmptyEventState';
import ErrorEventState from '../../components/Events/ErrorEventState';
import { db } from '../../utils/firebaseConfig'; // Make sure to create this file for your Firebase config
import EventListState from '../../components/Events/EventListState';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(2);
  const [lastVisible, setLastVisible] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const eventsPerPage = 6;

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Load events from Firestore
  const fetchEvents = async (isFirstPage = false) => {
    try {
      setLoading(true);
      let eventsQuery;

      if (isFirstPage) {
        eventsQuery = query(
          collection(db, "event"),
          where("organiserID", "==", 4),
          orderBy("eventStartDateTime", "desc"),
          limit(eventsPerPage)
        );
      } else if (lastVisible) {
        eventsQuery = query(
          collection(db, "event"),
          where("organiserID", "==", 4),
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

        // Estimate total pages (this is an approximation)
        const countQuery = await getDocs(query(collection(db, "events"), where("organiserID", "==", 4)));
        const totalEvents = countQuery.size;
        setTotalPages(Math.ceil(totalEvents / eventsPerPage));

        setLoading(false);
    } catch (err) {
      console.error("Error fetching events:", err);
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
    <Container maxWidth="xl">
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
          <CircularProgress size={48} thickness={3} />
        </Box>
      ) : error ? (
        <ErrorEventState error={error} fetchEvents={fetchEvents} />
      ) : events.length === 0 ? (
        <EmptyEventState />
      ) : (
        <>
          <EventListState events={events} />

          <Box sx={{ display: 'flex', justifyContent: 'center', mt: { xs: 3, sm: 4, md: 6 } }}>
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
                  borderRadius: 1,
                  mx: { xs: 0.1, sm: 0.25 },
                  fontWeight: 500
                },
                '& .Mui-selected': {
                  fontWeight: 600
                }
              }}
            />
          </Box>
        </>
      )}
    </Container>
  );
};

export default Events;