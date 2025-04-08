import React, { useState, useEffect } from 'react';
import {
  Container, Box, Typography, Button, Link, CircularProgress, Pagination,
  Paper, Divider, Chip, useMediaQuery, useTheme, Fade
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import StorefrontIcon from '@mui/icons-material/Storefront';

import { Link as RouterLink } from 'react-router-dom';
import { collection, query, orderBy, limit, startAfter, where, onSnapshot } from 'firebase/firestore';

import { getItem } from '../../utils/localStorage';
import { db } from '../../utils/firebaseConfig';
import MerchandiseListState from '../../components/Merchandises/MerchandiseListState';

const Merchandise = () => {
  const [merchandises, setMerchandises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [lastVisible, setLastVisible] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const merchandisesPerPage = 6;

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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
        } else {
          // Get the last visible document for pagination
          const lastDoc = snapshot.docs[snapshot.docs.length - 1];
          setLastVisible(lastDoc);

          const merchList = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data()
          }));

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
          <StorefrontIcon
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
            My Merchandise
          </Typography>
          <Chip
            label={merchandises?.length || 0}
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

        <Fade in={true}>
          <Link
            component={RouterLink}
            to="/merchandise/create-merchandise"
            variant="body2"
            underline="none"
            sx={{
              transition: 'all 0.2s',
            }}
          >
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              disableElevation
              sx={{
                borderRadius: 2.5,
                px: { xs: 2, sm: 3 },
                py: 1.25,
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.9rem',
                transition: 'all 0.3s ease',
                background: theme.palette.primary.main,
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: theme.shadows[4],
                  background: theme.palette.primary.dark,
                }
              }}
            >
              Create Merchandise
            </Button>
          </Link>
        </Fade>
      </Box>

      <Divider sx={{ mb: 4, opacity: 0.6 }} />

      {/* Content Area */}
      {loading ? (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            py: 10,
            opacity: 0.8
          }}
        >
          <CircularProgress
            size={48}
            thickness={4}
            color="primary"
          />
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 2, fontWeight: 500 }}
          >
            Loading merchandise...
          </Typography>
        </Box>
      ) : merchandises.length === 0 ? (
        <>
          <StorefrontIcon
            sx={{
              fontSize: 56,
              mb: 2,
              color: theme.palette.text.disabled
            }}
          />
          <Typography variant="h6" gutterBottom>
            No merchandise items yet
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Create your first merchandise item to get started
          </Typography>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<AddIcon />}
            component={RouterLink}
            to="/merchandise/create-merchandise"
            sx={{
              mt: 1,
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600
            }}
          >
            Create Merchandise
          </Button>
        </>
      ) : (
        <>
          <Fade in={true}>
            <Box>
              <MerchandiseListState merchandises={merchandises} />
            </Box>
          </Fade>

          <Box sx={{
            display: 'flex',
            justifyContent: 'center',
            mt: { xs: 4, sm: 5 },
            mb: 1
          }}>
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
                  mx: { xs: 0.2, sm: 0.3 },
                  fontWeight: 500,
                  transition: 'all 0.2s'
                },
                '& .Mui-selected': {
                  fontWeight: 700,
                  boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
                },
                '& .MuiPaginationItem-page:hover': {
                  backgroundColor: theme.palette.action.hover
                }
              }}
            />
          </Box>
        </>
      )}
    </Container>
  )
}

export default Merchandise