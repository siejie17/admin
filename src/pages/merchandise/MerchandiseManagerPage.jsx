import React, { useEffect, useState } from 'react';
import {
    Box,
    Button,
    Card,
    IconButton,
    Stack,
    Tab,
    Tabs,
    Tooltip,
    Typography,
    useMediaQuery,
    useTheme
} from '@mui/material';
import {
    ArrowBack as ArrowBackIcon,
    Check as CheckIcon,
    Clear as ClearIcon,
    InfoOutlined as InfoOutlinedIcon,
    RedeemOutlined as RedeemOutlinedIcon
} from '@mui/icons-material';

import CryptoJS from 'crypto-js';
import { useLocation, useNavigate } from 'react-router-dom';

import MerchandiseDetailsManager from '../../components/Merchandises/MerchandiseDetailsManager';
import { doc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../../utils/firebaseConfig';
import Loader from '../../components/General/Loader';
import ActionsDialog from '../../components/General/ActionsDialog';
import RedemptionTabs from '../../components/Merchandises/RedemptionTabs';

const MerchandiseManagerPage = () => {
    const [activeTab, setActiveTab] = useState(0);
    const [merchandiseID, setMerchandiseID] = useState('');
    const [merchandiseName, setMerchandiseName] = useState('');
    const [merchandiseAvailability, setMerchandiseAvailability] = useState(true);
    const [isLoading, setIsLoading] = useState(true);

    const secretKey = import.meta.env.VITE_ADMIN_SECRET_KEY;

    const location = useLocation();
    const navigate = useNavigate();

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isExtraSmall = useMediaQuery(theme.breakpoints.down('xs'));

    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogContent, setDialogContent] = useState({ title: "", context: "", action: null });

    const tabs = [
        {
            label: "Details",
            icon: <InfoOutlinedIcon sx={{ fontSize: isMobile ? 16 : 18 }} />
        },
        {
            label: "Redemptions",
            icon: <RedeemOutlinedIcon sx={{ fontSize: isMobile ? 16 : 18 }} />
        }
    ];

    const tabSx = {
        textTransform: 'none',
        fontWeight: 550,
        color: 'text.secondary',
        borderRight: '1px solid rgba(169, 169, 169, 0.3)',
        fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.8rem' },
        minWidth: { xs: 'auto', sm: '80px', md: '100px' },
        px: { xs: 1, sm: 1.5, md: 2 },
        '&.Mui-selected': {
            color: 'primary.main',
            fontWeight: 600,
            backgroundColor: 'rgba(25, 118, 210, 0.04)',
        },
        '&:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.03)',
            color: 'primary.dark',
        }
    };

    const getTabFromUrl = () => {
        const params = new URLSearchParams(location.search);
        const tab = params.get('tab');
        return tab === 'redemption' ? 1 : 0;
    };

    const getDecryptedID = () => {
        const params = new URLSearchParams(location.search);
        let merchandiseID = params.get('id');
        return CryptoJS.AES.decrypt(merchandiseID, secretKey).toString(CryptoJS.enc.Utf8);
    }

    useEffect(() => {
        const tab = activeTab === 1 ? 'redemption' : 'details';

        const searchParams = new URLSearchParams(location.search);
        searchParams.set('tab', tab);

        navigate({
            pathname: location.pathname,
            search: searchParams.toString()
        }, { replace: true });
    }, [activeTab, location.pathname, navigate]);

    useEffect(() => {
        setActiveTab(getTabFromUrl());
        setMerchandiseID(getDecryptedID());
    }, [location.search]);

    useEffect(() => {
        if (!merchandiseID) return;

        let unsub = null;

        const fetchMerchandiseDetails = async () => {
            try {
                const merchandiseRef = doc(db, "merchandise", merchandiseID);

                const unsubscribeMerchandise = onSnapshot(merchandiseRef, merchandiseSnap => {
                    if (!merchandiseSnap.exists()) {
                        throw new Error("This merchandise's details cannot be retrieved at the moment.");
                    }

                    setIsLoading(true);

                    const merchandiseData = merchandiseSnap.data();
                    setMerchandiseName(merchandiseData.name);
                    setMerchandiseAvailability(merchandiseData.available);
                    setIsLoading(false);
                })

                unsub = unsubscribeMerchandise;
            } catch (error) {
                console.error("Something went wrong when retrieving the merchandise details:", error);
            }
        }

        fetchMerchandiseDetails();

        return () => {
            if (unsub) {
                unsub();
            }
        };
    }, [merchandiseID]);

    const handleToggleAvailability = async () => {
        try {
            const merchandiseRef = doc(db, "merchandise", merchandiseID);
            const merchandiseSnap = await getDoc(merchandiseRef);

            if (merchandiseSnap.exists()) {
                await updateDoc(merchandiseRef, {
                    available: !merchandiseAvailability,
                })
            }

            setDialogOpen(false);
        } catch (error) {
            console.error("Something went wrong when updating merchandise availability:", error);
            return;
        }
    }

    const openAvailabilityDialog = () => {
        setDialogOpen(true);
        setDialogContent({
            title: merchandiseAvailability ? "Mark as Unavailable" : "Mark as Available",
            context: merchandiseAvailability
                ? "Are you sure you want to mark this merchandise item as unavailable? It will no longer be visible to users."
                : "Are you sure you want to make this merchandise item available again? It will be visible to users.",
            action: handleToggleAvailability
        })
    }

    if (isLoading) {
        return (
            <Loader loadingText='Loading the merchandise related details' />
        )
    }

    return (
        <Box
            sx={{
                width: '100%',
                height: '100%',
            }}
        >
            <Card
                sx={{
                    borderRadius: { xs: 0, md: 3 },
                    backgroundColor: '#ffffff',
                    width: '100%',
                    height: '100%',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: isExtraSmall ? 'column' : 'row',//{ xs: 'column', sm: 'row' },
                        alignItems: isExtraSmall ? 'flex-start' : 'center',
                        py: { xs: 1, sm: 1.5 },
                        px: { xs: 2, sm: 3.5 },
                        gap: { xs: 2, sm: 0 },
                        borderBottom: '1px solid rgba(0, 0, 0, 0.06)'
                    }}
                >
                    {/* Header with Back Button */}
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            flexGrow: 1,
                            minWidth: 0,
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Tooltip title="Back to Merchandises" arrow>
                                <IconButton
                                    edge="start"
                                    onClick={() => navigate('/merchandise')}
                                    sx={{
                                        mr: 1.5,
                                        color: 'text.primary',
                                        transition: 'all 0.2s ease',
                                        '&:hover': {
                                            bgcolor: 'rgba(25, 118, 210, 0.08)',
                                            transform: 'translateX(-1px)',
                                        }
                                    }}
                                    aria-label="Back to merchandises"
                                >
                                    <ArrowBackIcon fontSize={isMobile ? "small" : "medium"} />
                                </IconButton>
                            </Tooltip>

                            <Typography
                                variant="h6"
                                component="h1"
                                sx={{
                                    flexGrow: 1,
                                    fontWeight: 600,
                                    fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' },
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    maxWidth: { xs: '200px', sm: '250px', md: '100%' }
                                }}
                            >
                                {merchandiseName}
                            </Typography>
                        </Box>
                    </Box>

                    {/* Action Buttons */}
                    <Stack
                        direction={isExtraSmall ? "column" : "row"}
                        spacing={1.5}
                        sx={{
                            flexShrink: 0,
                            mb: { xs: 1, sm: 0 },
                            ml: { xs: 0, sm: 2 },
                            width: { xs: '100%', sm: 'auto' }
                        }}
                    >
                        <Button
                            fullWidth={isExtraSmall}
                            variant="contained"
                            startIcon={merchandiseAvailability ? <ClearIcon /> : <CheckIcon />}
                            onClick={openAvailabilityDialog}
                            size={isMobile ? "small" : "medium"}
                            sx={{
                                borderRadius: 2,
                                textTransform: 'none',
                                fontWeight: 600,
                                backgroundImage: merchandiseAvailability
                                    ? `linear-gradient(135deg, rgba(244, 67, 54, 0.6), ${theme.palette.error.main})`
                                    : `linear-gradient(135deg, rgba(76, 175, 80, 0.6), ${theme.palette.success.main})`,
                                fontSize: '12px',
                                boxShadow: 2,
                                '&:hover': {
                                    backgroundImage: merchandiseAvailability
                                        ? `linear-gradient(135deg, rgba(244, 67, 54, 0.8), ${theme.palette.error.dark})`
                                        : `linear-gradient(135deg, rgba(76, 175, 80, 0.8), ${theme.palette.success.dark})`,
                                    boxShadow: 3,
                                    transform: 'translateY(-1px)',
                                    transition: 'all 0.2s ease',
                                },
                            }}
                            aria-label="toggle merchandise availability"
                        >
                            {merchandiseAvailability ? "Mark as Unavailable" : "Mark as Available"}
                        </Button>
                    </Stack>
                </Box>

                <Box sx={{ width: '100%', borderBottom: '1px solid rgba(176, 174, 174, 0)' }}>
                    <Tabs
                        value={activeTab}
                        onChange={(event, newValue) => {
                            setActiveTab(newValue);
                        }}
                        variant={isMobile ? "scrollable" : "fullWidth"}
                        scrollButtons={isMobile ? "auto" : false}
                        aria-label="event-details-tabs"
                        sx={{
                            '& .MuiTabs-indicator': {
                                backgroundColor: 'primary.main',
                                height: 3,
                                borderRadius: '3px 3px 0 0',
                            },
                            minHeight: { xs: '40px', sm: '45px' },
                            borderBottom: '1px solid rgba(169, 169, 169, 0.3)',
                            '& .MuiButtonBase-root': {
                                minHeight: { xs: '40px', sm: '45px' },
                                py: 0.5,
                                transition: 'all 0.2s ease',
                            }
                        }}
                    >
                        {tabs.map((tab, index) => (
                            <Tab
                                key={tab.label}
                                icon={tab.icon}
                                iconPosition="start"
                                label={tab.label}
                                sx={{
                                    ...tabSx,
                                    // Remove border from last tab
                                    ...(index === tabs.length - 1 && { borderRight: 'none' })
                                }}
                            />
                        ))}
                    </Tabs>
                </Box>

                <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
                    <Box
                        role="tabpanel"
                        hidden={activeTab !== 0}
                        id={`merchandise-tabpanel-0`}
                        aria-labelledby={`merchandise-tab-0`}
                        sx={{ px: 1, minHeight: '100%', height: '100%', overflowY: 'auto' }}
                    >
                        {activeTab === 0 && <MerchandiseDetailsManager merchandiseID={merchandiseID} />}
                    </Box>

                    <Box
                        role="tabpanel"
                        hidden={activeTab !== 1}
                        id={`merchandise-tabpanel-1`}
                        aria-labelledby={`merchandise-tab-1`}
                        sx={{ px: 3, minHeight: '100%', height: '100%', overflowY: 'auto' }}
                    >
                        {activeTab === 1 && <RedemptionTabs merchandiseID={merchandiseID} />}
                    </Box>
                </Box>

                <ActionsDialog dialogOpen={dialogOpen} setDialogOpen={setDialogOpen} dialogContent={dialogContent} />
            </Card>
        </Box>
    )
}

export default MerchandiseManagerPage;