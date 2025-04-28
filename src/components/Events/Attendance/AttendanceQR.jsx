import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Box, Card, Chip, CircularProgress, Container, Fade, Grid, Typography, useTheme } from '@mui/material';
import QRCode from 'react-qr-code';
import { AccessTime as AccessTimeIcon, Event as EventIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import CryptoJS from 'crypto-js';
import { format } from 'date-fns';

import Loader from '../../General/Loader';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../utils/firebaseConfig';

const AttendanceQR = () => {
    const theme = useTheme();
    const location = useLocation();

    const [eventID, setEventID] = useState('');
    const [eventName, setEventName] = useState('');
    const [eventTime, setEventTime] = useState({
        start: 'TBA',
        end: 'TBA',
    });
    const [eventQRData, setEventQRData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshCounter, setRefreshCounter] = useState(0);
    const [countdownTime, setCountdownTime] = useState(3);

    const formatTimestamp = (timestamp) => {
        if (!timestamp) return 'TBA';
        if (typeof timestamp === 'string') return timestamp;

        const date = timestamp.toDate();
        return format(date, 'MMM dd, yyyy • h:mm a');
    };

    // Function to generate encrypted QR data
    const generateEncryptedData = () => {
        const timestamp = new Date().getTime();

        const dataToEncrypt = {
            "eventID": eventID,
            "timestamp": timestamp
        };

        const jsonString = JSON.stringify(dataToEncrypt);
        const encrypted = CryptoJS.AES.encrypt(
            jsonString,
            "UniEXP_Admin"
        ).toString();

        return encrypted;
    };

    // Update QR code data every 3 seconds
    useEffect(() => {
        if (!eventID) return;

        const updateQRCode = () => {
            const newEncryptedData = generateEncryptedData();
            setEventQRData(newEncryptedData);
            setRefreshCounter(prev => prev + 1);
            setCountdownTime(3);
        };

        // Initial generation
        updateQRCode();

        // Set interval to update every 3 seconds
        const intervalId = setInterval(updateQRCode, 3000);

        // Cleanup interval on component unmount
        return () => clearInterval(intervalId);
    }, [eventID]);

    useEffect(() => {
        if (countdownTime <= 0) return;

        const timer = setInterval(() => {
            setCountdownTime(prev => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [countdownTime, refreshCounter]);

    useEffect(() => {
        setIsLoading(true);
        const params = new URLSearchParams(location.search);
        const encryptedId = params.get('id');
        const eventName = params.get('name');

        if (encryptedId && eventName) {
            try {
                const bytes = CryptoJS.AES.decrypt(encryptedId, "UniEXP_Admin");
                const decryptedID = bytes.toString(CryptoJS.enc.Utf8);

                setEventID(decryptedID);
                setEventName(eventName);
                fetchEventTime(decryptedID).then(() => {
                    setIsLoading(false);
                });
            } catch (err) {
                console.error("Failed to decrypt Event ID:", err);
                setIsLoading(false);
            }
        } else {
            console.warn("No ID in URL query string.");
            setIsLoading(false);
        }
    }, [location.search]);

    const fetchEventTime = async (id) => {
        try {
            const eventRef = doc(db, "event", id);
            const eventSnap = await getDoc(eventRef);

            if (!eventSnap.exists()) {
                console.error("The event ID was not found.");
                return;
            }

            const eventData = eventSnap.data();

            setEventTime({
                start: formatTimestamp(eventData.eventStartDateTime),
                end: formatTimestamp(eventData.eventEndDateTime),
            })
        } catch (error) {
            console.error("Something went wrong when fetching event data", error);
        }
    }

    if (isLoading) {
        return (
            <Loader loadingText="Loading Event QR Code..." />
        )
    }

    return (
        <Box sx={{
            display: 'flex',
            width: '100vw',
            height: '100vh',
            overflow: 'auto',
            background: 'linear-gradient(135deg, #f5f7fa 0%, #e5e9f0 25%, #dce3ee 50%, #c2cfe3 75%, #d8dee9 100%)',
            alignItems: 'center',
            justifyContent: 'center'
        }}>
            <Container maxWidth="lg" sx={{ px: 2, py: 2.5 }}>
                <Typography
                    variant="h5"
                    component="h1"
                    fontWeight="bold"
                    align="center"
                    gutterBottom
                    color="#434c5e"
                    sx={{
                        textShadow: '0 2px 10px rgba(255, 255, 255, 0.5)',
                        mb: 2,
                        fontSize: '28px'
                    }}
                >
                    {eventName}
                </Typography>

                <Card elevation={2} sx={{
                    borderRadius: 3,
                    position: 'relative',
                    width: '100%',
                    border: `1px solid rgba(67, 76, 94, 0.06)`,
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(8px)',
                    boxShadow: '0 6px 20px rgba(0, 0, 0, 0.04)',
                    overflow: 'hidden'
                }}>
                    <Grid container spacing={0} sx={{
                        display: 'flex',
                        width: '100%',
                        justifyContent: 'center',
                    }}>
                        <Grid item xs={12} md={8} sx={{ p: { xs: 2, md: 3 } }}>
                            <Box sx={{ textAlign: 'center', mb: 2 }}>
                                <Grid container spacing={1} justifyContent="center">
                                    <Grid item>
                                        <Chip
                                            icon={<EventIcon fontSize="small" />}
                                            label={`Start Time: ${eventTime.start}`}
                                            sx={{
                                                px: 1,
                                                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                                fontSize: 12,
                                                fontWeight: 'medium',
                                                color: '#5e81ac',
                                                borderColor: 'rgba(94, 129, 172, 0.3)'
                                            }}
                                            variant="outlined"
                                        />
                                    </Grid>
                                    <Grid item>
                                        <Chip
                                            icon={<AccessTimeIcon fontSize="small" />}
                                            label={`End Time: ${eventTime.end}`}
                                            sx={{
                                                px: 1,
                                                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                                fontSize: 12,
                                                fontWeight: 'medium',
                                                color: '#5e81ac',
                                                borderColor: 'rgba(94, 129, 172, 0.3)'
                                            }}
                                            variant="outlined"
                                        />
                                    </Grid>
                                </Grid>
                            </Box>

                            <Typography variant="subtitle1" gutterBottom color="#5e81ac" align="center" sx={{ fontWeight: "bold", fontSize: '0.95rem', mb: 0.5 }}>
                                Scan QR Code for Attendance
                            </Typography>

                            <Box sx={{
                                position: 'relative',
                                my: 1.75,
                                p: { xs: 2, sm: 3 },
                                border: `1px dashed rgba(94, 129, 172, 0.3)`,
                                borderRadius: 2,
                                mx: 'auto',
                                backgroundColor: 'rgba(255, 255, 255, 0.7)',
                                maxWidth: '400px'
                            }}>
                                <Box sx={{
                                    width: '100%',
                                    height: { xs: '375px', sm: '400px' },
                                    mx: 'auto',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)',
                                    bgcolor: '#FFF',
                                    borderRadius: 1
                                }}>
                                    <Fade key={refreshCounter} in={true} timeout={300}>
                                        <Box>
                                            {eventQRData ? (
                                                <QRCode
                                                    value={eventQRData}
                                                    size={375}
                                                    level="H"
                                                    style={{ maxWidth: '100%', height: 'auto' }}
                                                    bgColor={"#ffffff"}
                                                />
                                            ) : (
                                                <Box
                                                    sx={{
                                                        display: 'flex',
                                                        justifyContent: 'center',
                                                        alignItems: 'center',
                                                        height: { xs: '250px', sm: '280px' },
                                                        width: '100%'
                                                    }}
                                                >
                                                    <CircularProgress size={40} color="primary" />
                                                </Box>
                                            )}
                                        </Box>
                                    </Fade>
                                </Box>
                            </Box>

                            <Box sx={{
                               display: 'flex',
                               alignItems: 'center',
                               justifyContent: 'center',
                               color: 'text.secondary',
                               backgroundColor: 'rgba(94, 129, 172, 0.06)',
                               px: 1.5,
                               py: 1,
                               borderRadius: 1.5,
                               maxWidth: '320px',
                               mx: 'auto'
                            }}>
                                <RefreshIcon sx={{ mr: 0.5, fontSize: '0.85rem', color: '#5e81ac' }} />
                                <Typography variant="caption" sx={{ fontWeight: 'medium', fontSize: 12 }}>
                                    QR code refreshes automatically every 3 seconds
                                </Typography>
                            </Box>
                        </Grid>
                    </Grid>
                </Card>
            </Container>
        </Box>
    )
}

export default AttendanceQR;