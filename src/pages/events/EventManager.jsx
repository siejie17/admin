import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box, Tabs, Tab, Typography, IconButton, Tooltip, Card, Button, useTheme, useMediaQuery, Stack } from '@mui/material';
import {
    ArrowBack as ArrowBackIcon, BoyOutlined as BoyOutlinedIcon,
    Cancel as CancelIcon, EventBusy as EventBusyIcon,
    FeedOutlined as FeedOutlinedIcon, InfoOutlined as InfoOutlinedIcon,
    PlayArrow as PlayArrowIcon, QrCode as QrCodeIcon,
    QrCode2Outlined as QrCode2OutlinedIcon, SportsEsportsOutlined as SportsEsportsOutlinedIcon
} from '@mui/icons-material';

import ActionsDialog from '../../components/General/ActionsDialog';
import EventDetailsManager from '../../components/Events/Details/EventDetailsManager';
import QuestManager from '../../components/Events/QuestManager';
import ParticipantManager from '../../components/Events/ParticipantManager';
import AttendanceManager from '../../components/Events/AttendanceManager';
import FeedbackManager from '../../components/Events/Feedback/FeedbackManager';

import CryptoJS from 'crypto-js';

import { doc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../../utils/firebaseConfig';

const EventManager = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isExtraSmall = useMediaQuery('(max-width:480px)');

    // Menu state for mobile dropdown
    const [mobileMenuAnchor, setMobileMenuAnchor] = useState(null);
    const menuOpen = Boolean(mobileMenuAnchor);

    const [eventName, setEventName] = useState('');
    const [eventStatus, setEventStatus] = useState('');

    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogContent, setDialogContent] = useState({ title: "", context: "", action: null });

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

    const [activeTab, setActiveTab] = useState(getTabFromUrl());
    const [encryptedID, setEncryptedID] = useState(getEncryptedID());
    const [eventID, setEventID] = useState(getDecryptedID());

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
    }, [location.search]);

    useEffect(() => {
        if (!eventID) return;

        let unsub = null;

        const fetchEventNameAndStatus = async () => {
            try {
                const eventRef = doc(db, "event", eventID);

                const unsubscribeEvent = onSnapshot(eventRef, eventSnap => {
                    if (!eventSnap.exists()) {
                        throw new Error("This event's details cannot be retrieved at the moment.");
                    }

                    const eventData = eventSnap.data();
                    setEventName(eventData.eventName);
                    setEventStatus(eventData.status);
                });

                unsub = unsubscribeEvent;
            } catch (error) {
                console.error("Something went wrong when retrieving the event details:", error);
            }
        };

        fetchEventNameAndStatus();

        return () => {
            if (unsub) {
                unsub();
            }
        };
    }, [eventID]);

    const tabs = [
        {
            label: "Details",
            icon: <InfoOutlinedIcon sx={{ fontSize: isMobile ? 16 : 18 }} />
        },
        {
            label: "Quest",
            icon: <SportsEsportsOutlinedIcon sx={{ fontSize: isMobile ? 16 : 18 }} />
        },
        {
            label: "Participant",
            icon: <BoyOutlinedIcon sx={{ fontSize: isMobile ? 16 : 18 }} />
        },
        {
            label: "Attendance",
            icon: <QrCode2OutlinedIcon sx={{ fontSize: isMobile ? 16 : 18 }} />
        },
        {
            label: "Feedback",
            icon: <FeedOutlinedIcon sx={{ fontSize: isMobile ? 16 : 18 }} />
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

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    const handleQRShowing = async () => {
        window.open(`/event/attendance_QR?id=${encodeURIComponent(encryptedID)}&name=${encodeURIComponent(eventName)}`, '_blank')

        if (eventStatus === "Scheduled" || eventStatus === "Postponed") {
            try {
                const eventRef = doc(db, "event", eventID);
                const eventSnap = await getDoc(eventRef);

                if (eventSnap.exists()) {
                    await updateDoc(eventRef, {
                        status: "Ongoing"
                    });
                }

                setDialogOpen(false);
            } catch (error) {
                console.error("Something went wrong when updating event status:", error);
                return;
            }
        }
    }

    const openStartDialog = () => {
        setDialogOpen(true);
        setDialogContent({
            title: "Start the Adventurous Event",
            context: "Ready to start? You'll be redirected to the attendance QR code page.",
            action: handleQRShowing
        })
    }

    const handleEventCancel = async () => {
        try {
            if (!eventID) throw new Error("This event does not existed.");
            const eventRef = doc(db, "event", eventID);
            await updateDoc(eventRef, {
                status: "Cancelled"
            });

            setDialogOpen(false);
        } catch (error) {
            console.error("Something went wrong when updating the event status to cancelled:", error);
        }
    }

    const openCancelDialog = () => {
        setDialogOpen(true);
        setDialogContent({
            title: "Confirm Event Cancellation",
            context: "This action cannot be undone. Are you sure you want to cancel the event?",
            action: handleEventCancel
        })
    }

    const handleEventEnded = async () => {
        try {
            const eventRef = doc(db, "event", eventID);
            const eventSnap = await getDoc(eventRef);

            if (eventSnap.exists()) {
                await updateDoc(eventRef, {
                    status: "Completed"
                });
            }

            setDialogOpen(false);
        } catch (error) {
            console.error("Something went wrong when updating event status:", error);
            return;
        }
    }

    const openEndedDialog = () => {
        setDialogOpen(true);
        setDialogContent({
            title: "End the Epic Journey?",
            context: "Once you end it, there's no going back! Are you *really* sure you want to wrap up this legendary event?",
            action: handleEventEnded
        })
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
                                            transform: 'translateX(-1px)',
                                        }
                                    }}
                                    aria-label="back to events"
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
                                {eventName}
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
                        {/* Not Ongoing or Completed or Cancelled */}
                        {eventStatus && eventStatus !== "Completed" && eventStatus !== "Cancelled" && eventStatus !== "Ongoing" && (
                            <>
                                <Button
                                    fullWidth={isExtraSmall}
                                    variant="contained"
                                    startIcon={<PlayArrowIcon fontSize='small' />}
                                    onClick={openStartDialog}
                                    size={isMobile ? "small" : "medium"}
                                    sx={{
                                        borderRadius: 2,
                                        textTransform: 'none',
                                        fontWeight: 600,
                                        backgroundImage: `linear-gradient(135deg, rgba(156, 39, 176, 0.7), ${theme.palette.primary.main})`,
                                        fontSize: '12px',
                                        boxShadow: 2,
                                        '&:hover': {
                                            backgroundImage: `linear-gradient(135deg, rgba(156, 39, 176, 0.8), ${theme.palette.primary.dark})`,
                                            boxShadow: 3,
                                            transform: 'translateY(-1px)',
                                            transition: 'all 0.2s ease',
                                        },
                                    }}
                                    aria-label="start event button"
                                >
                                    Start Event
                                </Button>

                                <Button
                                    fullWidth={isExtraSmall}
                                    variant="contained"
                                    startIcon={<CancelIcon fontSize='small' />}
                                    onClick={openCancelDialog}
                                    size={isMobile ? "small" : "medium"}
                                    sx={{
                                        borderRadius: 2,
                                        textTransform: 'none',
                                        fontWeight: 600,
                                        fontSize: '12px',
                                        backgroundImage: `linear-gradient(135deg, rgba(255, 152, 0, 0.7), ${theme.palette.warning.main})`,
                                        boxShadow: 2,
                                        '&:hover': {
                                            backgroundImage: `linear-gradient(135deg, rgba(255, 152, 0, 0.8), ${theme.palette.warning.dark})`,
                                            boxShadow: 3,
                                            transform: 'translateY(-1px)',
                                            transition: 'all 0.2s ease',
                                        },
                                    }}
                                    aria-label="cancel event button"
                                >
                                    Cancel Event
                                </Button>
                            </>
                        )}

                        {/* Ongoing Event */}
                        {eventStatus === "Ongoing" && (
                            <>
                                <Button
                                    fullWidth={isExtraSmall}
                                    variant="contained"
                                    startIcon={<QrCodeIcon fontSize='small' />}
                                    onClick={handleQRShowing}
                                    size={isMobile ? "small" : "medium"}
                                    sx={{
                                        borderRadius: 2,
                                        textTransform: 'none',
                                        fontWeight: 600,
                                        fontSize: '12px',
                                        backgroundImage: `linear-gradient(135deg, rgba(156, 39, 176, 0.7), ${theme.palette.primary.main})`,
                                        boxShadow: 2,
                                        '&:hover': {
                                            backgroundImage: `linear-gradient(135deg, rgba(156, 39, 176, 0.8), ${theme.palette.primary.dark})`,
                                            boxShadow: 3,
                                            transform: 'translateY(-1px)',
                                            transition: 'all 0.2s ease',
                                        },
                                    }}
                                    aria-label="show qr code"
                                >
                                    Show QR
                                </Button>

                                <Button
                                    fullWidth={isExtraSmall}
                                    variant="contained"
                                    startIcon={<EventBusyIcon fontSize='small' />}
                                    onClick={openEndedDialog}
                                    size={isMobile ? "small" : "medium"}
                                    sx={{
                                        borderRadius: 2,
                                        textTransform: 'none',
                                        fontWeight: 600,
                                        fontSize: '12px',
                                        backgroundImage: `linear-gradient(135deg, rgba(244, 67, 54, 0.7), ${theme.palette.error.main})`,
                                        boxShadow: 2,
                                        '&:hover': {
                                            backgroundImage: `linear-gradient(135deg, rgba(244, 67, 54, 0.8), ${theme.palette.error.main})`,
                                            boxShadow: 3,
                                            transform: 'translateY(-1px)',
                                            transition: 'all 0.2s ease',
                                        },
                                    }}
                                    aria-label="end the event"
                                >
                                    End Event
                                </Button>
                            </>
                        )}
                    </Stack>
                </Box>

                {/* Tabs section */}
                <Box sx={{ width: '100%', borderBottom: '1px solid rgba(176, 174, 174, 0)' }}>
                    <Tabs
                        value={activeTab}
                        onChange={handleTabChange}
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
                        id={`event-tabpanel-0`}
                        aria-labelledby={`merchandise-tab-0`}
                        sx={{ px: 3, minHeight: '100%', height: '100%', overflowY: 'auto' }}
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
                <ActionsDialog dialogOpen={dialogOpen} setDialogOpen={setDialogOpen} dialogContent={dialogContent} />
            </Card>
        </Box>
    )
}

export default EventManager;