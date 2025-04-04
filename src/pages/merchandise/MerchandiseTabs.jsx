import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  Box,
  Tabs,
  Tab,
  Typography,
  IconButton,
  Tooltip,
  Card
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import RedeemOutlinedIcon from '@mui/icons-material/RedeemOutlined';

import CryptoJS from 'crypto-js';
import MerchandiseEditing from '../../components/Merchandises/MerchandiseEditing';
import MerchandiseRedemption from '../../components/Merchandises/MerchandiseRedemption';

const MerchandiseTabs = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Get tab from URL query param or default to 'details'
  const getTabFromUrl = () => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    return tab === 'redemption' ? 1 : 0;
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
  const [decryptedID, setDecryptedID] = useState(getDecryptedID());
  const [merchName, setMerchName] = useState(getNameFromUrl());

  // Update URL when tab changes
  useEffect(() => {
    const tab = activeTab === 1 ? 'redemption' : 'details';
    const searchParams = new URLSearchParams(location.search);
    searchParams.set('tab', tab);
    navigate({
      pathname: location.pathname,
      search: searchParams.toString()
    }, { replace: true });
  }, [activeTab, location.pathname, navigate]);

  // Update tab if URL changes
  useEffect(() => {
    setActiveTab(getTabFromUrl());
    setDecryptedID(getDecryptedID());
    setMerchName(getNameFromUrl())
  }, [location.search]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleBack = () => {
    navigate('/merchandise');
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
          // transition: 'all 0.3s ease-in-out',
          // '&:hover': {
          //   boxShadow: '0 10px 30px rgba(0, 0, 0, 0.12)'
          // },
          width: '100%',
          height: '100%',
          // mb: 4,
          // border: '1px solid rgba(0, 0, 0, 0.06)'
        }}
      >
        {/* Header with back button and title */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            py: 2,
            px: 3,
            borderBottom: '1px solid rgba(0, 0, 0, 0.06)'
          }}
        >
          <Tooltip title="Back to Merchandise">
            <IconButton
              edge="start"
              onClick={handleBack}
              sx={{
                mr: 2,
                color: 'text.primary',
                '&:hover': {
                  bgcolor: 'rgba(25, 118, 210, 0.08)'
                }
              }}
              aria-label="back to merchandise"
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
            {merchName}
          </Typography>
        </Box>

        {/* Tabs section */}
        <Box sx={{ width: '100%', borderBottom: '1px solid rgba(176, 174, 174, 0)' }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="fullWidth"
            aria-label="merchandise details tabs"
            sx={{
              '& .MuiTabs-indicator': {
                backgroundColor: 'primary.main',
                height: 3
              },
              borderBottom: '1px solid rgba(169, 169, 169, 0.3)'
            }}
          >
            <Tab
              icon={<InfoOutlinedIcon sx={{ fontSize: 20, mr: 1 }} />}
              iconPosition="start"
              label="Details"
              sx={{
                textTransform: 'none',
                fontWeight: 500,
                color: 'text.secondary',
                borderRight: '1px solid rgba(169, 169, 169, 0.3)',
                '&.Mui-selected': {
                  color: 'primary.main',
                  fontWeight: 600
                }
              }}
            />
            <Tab
              icon={<RedeemOutlinedIcon sx={{ fontSize: 20, mr: 1 }} />}
              iconPosition="start"
              label="Redemption"
              sx={{
                textTransform: 'none',
                fontWeight: 500,
                color: 'text.secondary',
                '&.Mui-selected': {
                  color: 'primary.main',
                  fontWeight: 600
                }
              }}
            />
          </Tabs>
        </Box>

        {/* Tab content */}
        <Box
          role="tabpanel"
          hidden={activeTab !== 0}
          id={`merchandise-tabpanel-0`}
          aria-labelledby={`merchandise-tab-0`}
          sx={{ p: 3, height: '100%', overflow: 'auto', marginBottom: '180px' }}
        >
          {activeTab === 0 && (
            /* Tab Component */
            <MerchandiseEditing merchandiseID={decryptedID} />
          )}
        </Box>

        <Box
          role="tabpanel"
          hidden={activeTab !== 1}
          id={`merchandise-tabpanel-1`}
          aria-labelledby={`merchandise-tab-1`}
          sx={{ p: 3 }}
        >
          {activeTab === 1 && (
            /* Tab Component */
            <MerchandiseRedemption merchandiseID={decryptedID} />
          )}
        </Box>

      </Card>
    </Box>
  );
};

export default MerchandiseTabs;