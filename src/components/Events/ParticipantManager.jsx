import { collection, doc, getDoc, onSnapshot, query, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react'
import { db } from '../../utils/firebaseConfig';
import { Box, Grid, Typography, useTheme, Paper, alpha, Tabs, Tab } from '@mui/material';
import { NumbersOutlined, PeopleAlt } from '@mui/icons-material';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

import MetricCard from '../General/MetricCard';
import ParticipantsListTable from './ParticipantsListTable';
import Loader from '../General/Loader';
import ExcelExportButton from '../General/ExcelExportButton';

const ParticipantManager = ({ eventID }) => {
  const [totalParticipants, setTotalParticipants] = useState(0);
  const [paymentProofRequired, setPaymentProofRequirement] = useState(false);
  const [verifiedParticipants, setVerifiedParticipants] = useState([]);
  const [unverifiedParticipants, setUnverifiedParticipants] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);

  const [activeParticipantTab, setActiveParticipantTab] = useState(0);

  const theme = useTheme();

  const FACULTY_MAPPING = {
    1: "FACA",
    2: "FBE",
    3: "FCSHD",
    4: "FCSIT",
    5: "FEB",
    6: "FELC",
    7: "FENG",
    8: "FMSH",
    9: "FRST",
    10: "FSSH",
  };

  useEffect(() => {
    let unsub;

    setIsLoading(true);

    fetchParticipantsInfo().
      then(result =>
        unsub = result
      ).catch(error =>
        console.error(error)
      );

    fetchEventPaymentRequirement();

    setIsLoading(false);

    return unsub;
  }, [eventID]);

  const fetchEventPaymentRequirement = async () => {
    try {
      const eventRef = doc(db, "event", eventID);
      const eventSnap = await getDoc(eventRef);

      setPaymentProofRequirement(eventSnap.data().paymentProofRequired);
    } catch (error) {
      console.error("Something went wrong when fetching event's payment proof requirement:", error);
    }
  }

  const fetchParticipantsInfo = async () => {
    try {
      const participantQuery = query(collection(db, "registration"), where("eventID", "==", eventID));

      const unsubscribeParticipant = onSnapshot(participantQuery, async (snap) => {
        const verified = [];
        const unverified = [];

        for (const docSnap of snap.docs) {
          const data = docSnap.data();
          const studentID = data.studentID;

          try {
            const userDoc = await getDoc(doc(db, "user", studentID));

            if (userDoc.exists()) {
              const userData = userDoc.data();
              const enrichedData = {
                id: docSnap.id,
                ...data,
                fullName: userData.firstName + " " + userData.lastName,
                email: userData.email,
                facultyID: userData.facultyID,
                yearOfStudy: userData.yearOfStudy,
                profilePicture: userData.profilePicture
              };

              if (data.isVerified) {
                verified.push(enrichedData);
              } else {
                unverified.push(enrichedData);
              }
            }
          } catch (error) {
            console.error("Error fetching user data:", err);
          }
        }

        setLastUpdated(new Date());
        setTotalParticipants(snap.size);

        if (verified && verified.length > 0) {
          const verifiedDataWithIds = verified.map((item, index) => ({
            ...item,
            bil: index + 1
          }));
          setVerifiedParticipants(verifiedDataWithIds);
        } else {
          setVerifiedParticipants([]);
        }

        if (unverified && unverified.length > 0) {
          const unverifiedDataWithIds = unverified.map((item, index) => ({
            ...item,
            bil: index + 1
          }));
          setUnverifiedParticipants(unverifiedDataWithIds);
        } else {
          setUnverifiedParticipants([]);
        }
      })

      return unsubscribeParticipant;
    } catch (error) {
      console.error("Error fetching participants data:", err);
    }
  };

  const handleExport = () => {
    const formattedData = verifiedParticipants.map((p, index) => ({
      "No": index + 1,
      "Name": p.fullName,
      "Email": p.email,
      "Year of Study": p.yearOfStudy,
      "Faculty": FACULTY_MAPPING[p.facultyID],
    }));

    console.log(formattedData);

    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();

    worksheet['!cols'] = [
      { wch: 5 },  // No
      { wch: 50 }, // Name
      { wch: 30 }, // Email
      { wch: 15 }, // Matric
      { wch: 20 }, // Faculty
    ];

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Confirmed Participants');

    const excelBuffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    });

    const data = new Blob([excelBuffer], {
      type: 'application/octet-stream',
    });

    saveAs(data, 'Participants.xlsx');
  }

  if (isLoading) {
    return (
      <Loader loadingText='Loading participants...' />
    )
  }

  return (
    <Box
      sx={{
        px: 2,
        minHeight: '100vh',
      }}
    >
      <Paper
        elevation={0}
        sx={{
          pb: 2,
          mb: 3,
          borderRadius: 2,
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 1.5,
              width: 40,
              height: 40,
              mr: 2,
              background: `linear-gradient(135deg, ${theme.palette.primary.light}, ${theme.palette.primary.main})`,
              color: 'white',
            }}
          >
            <NumbersOutlined />
          </Box>
          <Typography variant='h5' fontWeight="700" sx={{ lineHeight: 1.1 }}>
            Overview
          </Typography>
        </Box>
      </Paper>

      {/* Dashboard metrics grid */}
      <Grid container spacing={3} sx={{ mb: 5 }}>
        <Grid>
          <MetricCard
            title="Total Registered Participants"
            value={totalParticipants.toLocaleString()}
            icon={<PeopleAlt />}
            color={theme.palette.primary.main}
          />
        </Grid>
      </Grid>

      {paymentProofRequired ? (
        <>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 1.5,
                  width: 40,
                  height: 40,
                  mr: 2,
                  background: `linear-gradient(135deg, ${theme.palette.primary.light}, ${theme.palette.primary.main})`,
                  color: 'white',
                }}
              >
                <PeopleAlt />
              </Box>
              <Typography variant='h5' fontWeight="700" sx={{ lineHeight: 1.1 }}>
                Participants List
              </Typography>
            </Box>

            {activeParticipantTab === 0 && <ExcelExportButton handleExport={handleExport} />}
          </Box>

          <Box sx={{ mt: 2 }}>
            <Tabs
              value={activeParticipantTab}
              onChange={(event, changedTab) => setActiveParticipantTab(changedTab)}
              variant='standard'
              aria-label="participant-list-tabs"
              sx={{
                minHeight: '48px',
                position: 'relative',
                '& .MuiTabs-flexContainer': {
                  gap: 2,
                },
                '& .MuiTabs-indicator': {
                  display: 'none',
                },
                '& .MuiButtonBase-root': {
                  minHeight: '48px',
                  py: 1,
                  px: 3,
                  borderRadius: '12px',
                  transition: 'all 0.2s ease-in-out',
                }
              }}
            >
              <Tab
                label="Verified"
                sx={{
                  textTransform: 'none',
                  fontWeight: 500,
                  fontSize: '0.95rem',
                  color: 'text.secondary',
                  backgroundColor: (theme) =>
                    activeParticipantTab === 0
                      ? alpha(theme.palette.primary.main, 0.08)
                      : 'transparent',
                  border: 'none',
                  minWidth: '140px',
                  boxShadow: (theme) =>
                    activeParticipantTab === 0
                      ? `0 4px 12px ${alpha(theme.palette.primary.main, 0.12)}`
                      : 'none',
                  '&.Mui-selected': {
                    color: 'primary.main',
                    fontWeight: 600,
                  },
                  '&:hover': {
                    backgroundColor: (theme) =>
                      activeParticipantTab === 0
                        ? alpha(theme.palette.primary.main, 0.12)
                        : alpha(theme.palette.background.default, 0.6),
                  }
                }}
              />
              <Tab
                label="Unverified"
                sx={{
                  textTransform: 'none',
                  fontWeight: 500,
                  fontSize: '0.95rem',
                  color: 'text.secondary',
                  backgroundColor: (theme) =>
                    activeParticipantTab === 1
                      ? alpha(theme.palette.primary.main, 0.08)
                      : 'transparent',
                  border: 'none',
                  minWidth: '140px',
                  boxShadow: (theme) =>
                    activeParticipantTab === 1
                      ? `0 4px 12px ${alpha(theme.palette.primary.main, 0.12)}`
                      : 'none',
                  '&.Mui-selected': {
                    color: 'primary.main',
                    fontWeight: 600,
                  },
                  '&:hover': {
                    backgroundColor: (theme) =>
                      activeParticipantTab === 1
                        ? alpha(theme.palette.primary.main, 0.12)
                        : alpha(theme.palette.background.default, 0.6),
                  }
                }}
              />
            </Tabs>
          </Box>

          <Box
            role="tabpanel"
            hidden={activeParticipantTab !== 0}
            id={`participant-tabpanel-0`}
            aria-labelledby={`participant-tab-0`}
            sx={{ py: 3, maxHeight: '100%', overflow: 'auto', marginBottom: '100px' }}
          >
            {activeParticipantTab === 0 && <ParticipantsListTable participants={verifiedParticipants} isLoading={isLoading} />}
          </Box>

          <Box
            role="tabpanel"
            hidden={activeParticipantTab !== 1}
            id={`participant-tabpanel-1`}
            aria-labelledby={`participant-tab-1`}
            sx={{ py: 3, height: '100%', overflow: 'auto', marginBottom: '100px' }}
          >
            {activeParticipantTab === 1 && <ParticipantsListTable participants={unverifiedParticipants} isLoading={isLoading} />}
          </Box>
        </>
      ) : (
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 1.5,
                  width: 40,
                  height: 40,
                  mr: 2,
                  background: `linear-gradient(135deg, ${theme.palette.primary.light}, ${theme.palette.primary.main})`,
                  color: 'white',
                }}
              >
                <PeopleAlt />
              </Box>
              <Typography variant='h5' fontWeight="700" sx={{ lineHeight: 1.1 }}>
                List of Confirmed Participants
              </Typography>
            </Box>

            <ExcelExportButton handleExport={handleExport} />
          </Box>

          <Box sx={{ mt: 3 }}>
            <ParticipantsListTable participants={verifiedParticipants} isLoading={isLoading} />
          </Box>
        </Box>
      )}
    </Box>
  )
}

export default ParticipantManager;