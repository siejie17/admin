import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import CryptoJS from 'crypto-js';
import { Box, Tabs, Tab, Typography, IconButton, Tooltip, Card, Button } from '@mui/material';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import QrCode2OutlinedIcon from '@mui/icons-material/QrCode2Outlined';
import BoyOutlinedIcon from '@mui/icons-material/BoyOutlined';
import SportsEsportsOutlinedIcon from '@mui/icons-material/SportsEsportsOutlined';
import FeedOutlinedIcon from '@mui/icons-material/FeedOutlined';

import EventDetailsManager from '../../components/Events/EventDetailsManager';
import QuestManager from '../../components/Events/QuestManager';
import ParticipantManager from '../../components/Events/ParticipantManager';
import AttendanceManager from '../../components/Events/AttendanceManager';
import FeedbackManager from '../../components/Events/FeedbackManager';
import { QrCode } from '@mui/icons-material';

const EventTabs = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const getTabFromUrl = () => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');

    switch (tab) {
      case 'details': return 0;
      case 'quests': return 1;
      case 'participant': return 2;
      case 'attendance': return 3;
      case 'feedback': return 4;
      default: return 0;
    }
  };

  const getEncryptedID = () => {
    const params = new URLSearchParams(location.search);
    return params.get('id');
  }

  const getDecryptedID = () => {
    const params = new URLSearchParams(location.search);
    let id = params.get('id');
    return CryptoJS.AES.decrypt(id, "UniEXP_Admin").toString(CryptoJS.enc.Utf8);
  }

  const getNameFromUrl = () => {
    const params = new URLSearchParams(location.search);
    return params.get('name');
  }

  const [activeTab, setActiveTab] = useState(getTabFromUrl());
  const [encryptedID, setEncryptedID] = useState(getEncryptedID());
  const [eventID, setEventID] = useState(getDecryptedID());
  const [eventName, setEventName] = useState(getNameFromUrl());

  useEffect(() => {
    const tabLabels = ['details', 'quests', 'participant', 'attendance', 'feedback'];
    const currentTab = tabLabels[activeTab] ?? 'details';

    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get('tab') !== currentTab) {
      searchParams.set('tab', currentTab);
      navigate({
        pathname: location.pathname,
        search: searchParams.toString()
      }, { replace: true });
    }
  }, [activeTab, location.pathname, navigate]);

  useEffect(() => {
    const newTab = getTabFromUrl();
    if (newTab !== activeTab) setActiveTab(newTab);

    const newEncryptedID = getEncryptedID();
    if (newEncryptedID !== encryptedID) setEncryptedID(newEncryptedID);

    const newEventID = getDecryptedID();
    if (newEventID !== eventID) setEventID(newEventID);

    const newName = getNameFromUrl();
    if (newName !== eventName) setEventName(newName);
  }, [location.search]);


  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        height: '100%',
      }}
    >
      <Card
        sx={{
          display: 'flex',
          flexDirection: 'column',
          borderRadius: { xs: 0, md: 3 },
          overflow: 'hidden',
          backgroundColor: '#ffffff',
          width: '100%',
          height: '100%',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
        }}
      >
        {/* Header with back button and title */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            py: 2.5,
            px: 3.5,
            borderBottom: '1px solid rgba(0, 0, 0, 0.06)'
          }}
        >
          <Tooltip title="Back to Events" arrow>
            <IconButton
              edge="start"
              onClick={() => navigate('/event')}
              sx={{
                mr: 1.5,
                color: 'text.primary',
                transition: 'all 0.2s ease',
                '&:hover': {
                  bgcolor: 'rgba(25, 118, 210, 0.08)',
                  transform: 'translateX(-2px)',
                }
              }}
              aria-label="back to events"
            >
              <ArrowBackIcon />
            </IconButton>
          </Tooltip>

          <Typography
            variant="h6"
            component="h1"
            sx={{
              flexGrow: 1,
              fontWeight: 600,
              fontSize: { xs: '1.1rem', sm: '1.25rem' }
            }}
          >
            {eventName}
          </Typography>

          <Button
            variant="contained"
            startIcon={<QrCode />}
            onClick={() => window.open(`/event/attendance_QR?id=${encodeURIComponent(encryptedID)}&name=${encodeURIComponent(eventName)}`, '_blank')}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              px: 1.5,
              py: 1,
              boxShadow: 2,
              fontSize: { xs: 8, md: 13 },
              backgroundColor: 'primary.main',
              '&:hover': {
                backgroundColor: 'primary.dark',
                boxShadow: 3,
                transform: 'translateY(-1px)',
                transition: 'all 0.2s ease',
              },
            }}
            aria-label="show event QR code"
          >
            Show Event QR
          </Button>
        </Box>

        {/* Tabs section */}
        <Box sx={{ width: '100%', borderBottom: '1px solid rgba(176, 174, 174, 0)' }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="fullWidth"
            aria-label="event-details-tabs"
            sx={{
              '& .MuiTabs-indicator': {
                backgroundColor: 'primary.main',
                height: 3,
                borderRadius: '3px 3px 0 0',
              },
              minHeight: '55px',
              borderBottom: '1px solid rgba(169, 169, 169, 0.3)',
              '& .MuiButtonBase-root': {
                minHeight: '55px',
                py: 0.5,
                transition: 'all 0.2s ease',
              }
            }}
          >
            <Tab
              icon={<InfoOutlinedIcon sx={{ fontSize: 22, mr: 0.5 }} />}
              iconPosition="start"
              label="Details"
              sx={{
                textTransform: 'none',
                fontWeight: 550,
                color: 'text.secondary',
                borderRight: '1px solid rgba(169, 169, 169, 0.3)',
                fontSize: '0.9rem',
                '&.Mui-selected': {
                  color: 'primary.main',
                  fontWeight: 600,
                  backgroundColor: 'rgba(25, 118, 210, 0.04)',
                },
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.03)',
                  color: 'primary.dark',
                }
              }}
            />
            <Tab
              icon={<SportsEsportsOutlinedIcon sx={{ fontSize: 20, mr: 1 }} />}
              iconPosition="start"
              label="Quest"
              sx={{
                textTransform: 'none',
                fontWeight: 550,
                color: 'text.secondary',
                borderRight: '1px solid rgba(169, 169, 169, 0.3)',
                fontSize: '0.9rem',
                '&.Mui-selected': {
                  color: 'primary.main',
                  fontWeight: 600,
                  backgroundColor: 'rgba(25, 118, 210, 0.04)',
                },
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.03)',
                  color: 'primary.dark',
                }
              }}
            />
            <Tab
              icon={<BoyOutlinedIcon sx={{ fontSize: 20, mr: 1 }} />}
              iconPosition="start"
              label="Participant"
              sx={{
                textTransform: 'none',
                fontWeight: 550,
                color: 'text.secondary',
                borderRight: '1px solid rgba(169, 169, 169, 0.3)',
                fontSize: '0.9rem',
                '&.Mui-selected': {
                  color: 'primary.main',
                  fontWeight: 600,
                  backgroundColor: 'rgba(25, 118, 210, 0.04)',
                },
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.03)',
                  color: 'primary.dark',
                }
              }}
            />
            <Tab
              icon={<QrCode2OutlinedIcon sx={{ fontSize: 20, mr: 1 }} />}
              iconPosition="start"
              label="Attendance"
              sx={{
                textTransform: 'none',
                fontWeight: 550,
                color: 'text.secondary',
                borderRight: '1px solid rgba(169, 169, 169, 0.3)',
                fontSize: '0.9rem',
                '&.Mui-selected': {
                  color: 'primary.main',
                  fontWeight: 600,
                  backgroundColor: 'rgba(25, 118, 210, 0.04)',
                },
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.03)',
                  color: 'primary.dark',
                }
              }}
            />
            <Tab
              icon={<FeedOutlinedIcon sx={{ fontSize: 20, mr: 1 }} />}
              iconPosition="start"
              label="Feedback"
              sx={{
                textTransform: 'none',
                fontWeight: 550,
                color: 'text.secondary',
                fontSize: '0.9rem',
                '&.Mui-selected': {
                  color: 'primary.main',
                  fontWeight: 600,
                  backgroundColor: 'rgba(25, 118, 210, 0.04)',
                },
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.03)',
                  color: 'primary.dark',
                }
              }}
            />
          </Tabs>
        </Box>

        <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
          <Box
            role="tabpanel"
            hidden={activeTab !== 0}
            id={`event-tabpanel-0`}
            aria-labelledby={`merchandise-tab-0`}
            sx={{ p: 3, maxHeight: '100%', overflow: 'auto', marginBottom: '100px' }}
          >
            {activeTab === 0 && <EventDetailsManager eventID={eventID} />}
          </Box>

          <Box
            role="tabpanel"
            hidden={activeTab !== 1}
            id={`event-tabpanel-1`}
            aria-labelledby={`event-tab-1`}
            sx={{ px: 3, minHeight: '100%', height: '100%', overflowY: 'auto' }}
          >
            {activeTab === 1 && <QuestManager eventID={eventID} eventName={eventName} />}
          </Box>

          <Box
            role="tabpanel"
            hidden={activeTab !== 2}
            id={`event-tabpanel-2`}
            aria-labelledby={`event-tab-2`}
            sx={{ p: 3 }}
          >
            {activeTab === 2 && <ParticipantManager eventID={eventID} />}
          </Box>

          <Box
            role="tabpanel"
            hidden={activeTab !== 3}
            id={`event-tabpanel-3`}
            aria-labelledby={`event-tab-3`}
            sx={{ px: 3, minHeight: '100%', height: '100%', overflowY: 'auto' }}
          >
            {activeTab === 3 && <AttendanceManager eventID={eventID} />}
          </Box>

          <Box
            role="tabpanel"
            hidden={activeTab !== 4}
            id={`event-tabpanel-4`}
            aria-labelledby={`event-tab-4`}
            sx={{ px: 3, minHeight: '100%', height: '100%', overflowY: 'auto' }}
          >
            {activeTab === 4 && <FeedbackManager eventID={eventID} eventName={eventName} />}
          </Box>
        </Box>
      </Card>
    </Box>
  )
}

export default EventTabs;