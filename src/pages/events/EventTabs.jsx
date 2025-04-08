import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import CryptoJS from 'crypto-js';
import { Box, Tabs, Tab, Typography, IconButton, Tooltip, Card } from '@mui/material';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import QrCode2OutlinedIcon from '@mui/icons-material/QrCode2Outlined';
import BoyOutlinedIcon from '@mui/icons-material/BoyOutlined';
import SportsEsportsOutlinedIcon from '@mui/icons-material/SportsEsportsOutlined';
import FeedOutlinedIcon from '@mui/icons-material/FeedOutlined';

import EventDetailsManager from '../../components/Events/EventDetailsManager';
import EventQuestManager from '../../components/Events/EventQuestManager';
import ParticipantManager from '../../components/Events/ParticipantManager';
import AttendanceManager from '../../components/Events/AttendanceManager';
import FeedbackManager from '../../components/Events/FeedbackManager';

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
  const [eventID, setEventID] = useState(getDecryptedID());
  const [eventName, setEventName] = useState(getNameFromUrl());

  useEffect(() => {
    let tab = 1;

    switch (activeTab) {
      case 'details':
        tab = 0;
        break;
      case 'quests':
        tab = 1;
        break;
      case 'participant':
        tab = 2;
        break;
      case 'attendance':
        tab = 3;
        break;
      case 'feedback':
        tab = 4;
        break;
      default:
        tab = 0;
    }

    const searchParams = new URLSearchParams(location.search);
    searchParams.set('tab', tab);

    navigate({
      pathname: location.pathname,
      search: searchParams.toString()
    }, { replace: true });
  }, [activeTab, location.pathname, navigate]);

  useEffect(() => {
    setActiveTab(getTabFromUrl());
    setEventID(getDecryptedID());
    setEventName(getNameFromUrl())
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
          borderRadius: { xs: 0, md: 3 },
          overflow: 'hidden',
          backgroundColor: '#ffffff',
          width: '100%',
          height: '100%',
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
          <Tooltip title="Back to Events">
            <IconButton
              edge="start"
              onClick={() => navigate('/event')}
              sx={{
                mr: 1.5,
                color: 'text.primary',
                '&:hover': {
                  bgcolor: 'rgba(25, 118, 210, 0.08)'
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
                height: 2
              },
              minHeight: '55px',
              borderBottom: '1px solid rgba(169, 169, 169, 0.3)',
              '& .MuiButtonBase-root': {
                minHeight: '55px',
                py: 0.5,
              }
            }}
          >
            <Tab
              icon={<InfoOutlinedIcon sx={{ fontSize: 20, mr: 1 }} />}
              iconPosition="start"
              label="Details"
              sx={{
                textTransform: 'none',
                fontWeight: 550,
                color: 'text.secondary',
                borderRight: '1px solid rgba(169, 169, 169, 0.3)',
                '&.Mui-selected': {
                  color: 'primary.main',
                  fontWeight: 700
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
                '&.Mui-selected': {
                  color: 'primary.main',
                  fontWeight: 700
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
                '&.Mui-selected': {
                  color: 'primary.main',
                  fontWeight: 700
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
                '&.Mui-selected': {
                  color: 'primary.main',
                  fontWeight: 700
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
                '&.Mui-selected': {
                  color: 'primary.main',
                  fontWeight: 700
                }
              }}
            />
          </Tabs>
        </Box>

        <Box
          role="tabpanel"
          hidden={activeTab !== 0}
          id={`event-tabpanel-0`}
          aria-labelledby={`merchandise-tab-0`}
          sx={{ p: 3, height: '100%', overflow: 'auto', marginBottom: '100px' }}
        >
          {activeTab === 0 && <EventDetailsManager eventID={eventID} />}
        </Box>

        <Box
          role="tabpanel"
          hidden={activeTab !== 1}
          id={`event-tabpanel-1`}
          aria-labelledby={`merchandise-tab-1`}
          sx={{ p: 3, height: '100%', overflow: 'auto', marginBottom: '100px' }}
        >
          {activeTab === 1 && <EventQuestManager eventID={eventID} />}
        </Box>

        <Box
          role="tabpanel"
          hidden={activeTab !== 2}
          id={`event-tabpanel-2`}
          aria-labelledby={`merchandise-tab-2`}
          sx={{ p: 3 }}
        >
          {activeTab === 2 && <ParticipantManager eventID={eventID} />}
        </Box>

        <Box
          role="tabpanel"
          hidden={activeTab !== 3}
          id={`event-tabpanel-3`}
          aria-labelledby={`merchandise-tab-3`}
          sx={{ p: 3 }}
        >
          {activeTab === 3 && <AttendanceManager eventID={eventID} />}
        </Box>

        <Box
          role="tabpanel"
          hidden={activeTab !== 4}
          id={`event-tabpanel-4`}
          aria-labelledby={`merchandise-tab-4`}
          sx={{ p: 3 }}
        >
          {activeTab === 4 && <FeedbackManager eventID={eventID} />}
        </Box>
      </Card>
    </Box>
  )
}

export default EventTabs;