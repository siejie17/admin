import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Avatar, Box, Card, CardContent, Chip, CircularProgress, Container, Divider, Fade, Grid, List, ListItem, ListItemAvatar, ListItemText, Paper, Typography, useTheme } from '@mui/material';
import QRCode from 'react-qr-code';
import { QrCode as QrCodeIcon, AccessTime as AccessTimeIcon, Event as EventIcon, Refresh as RefreshIcon } from '@mui/icons-material';
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
            overflow: 'hidden',
            background: 'linear-gradient(135deg, #f5f7fa 0%, #e5e9f0 25%, #dce3ee 50%, #c2cfe3 75%, #d8dee9 100%)',
            alignItems: 'center',
            justifyContent: 'center'
        }}>
            <Container maxWidth="lg" sx={{ textAlign: 'center' }}>
                <Typography
                    variant="h3"
                    component="h1"
                    fontWeight="bold"
                    align="center"
                    gutterBottom
                    color="#434c5e"
                    sx={{
                        textShadow: '0 2px 10px rgba(255, 255, 255, 0.6)',
                        mb: 4
                    }}
                >
                    {eventName}
                </Typography>

                <Card elevation={3} sx={{
                    borderRadius: 4,
                    position: 'relative',
                    width: '100%',
                    maxWidth: '100%',
                    border: `1px solid rgba(67, 76, 94, 0.1)`,
                    backgroundColor: 'rgba(255, 255, 255, 0.7)',
                    backdropFilter: 'blur(10px)',
                    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.06), 0 1px 8px rgba(0, 0, 0, 0.03)'
                }}>
                    <Grid container spacing={0} sx={{ 
                        display: 'flex', 
                        width: '100%', 
                        justifyContent: 'center',
                        alignItems: 'center' 
                    }}>
                        <Grid item xs={12} md={8} sx={{ p: 4 }}>
                            <Box sx={{ textAlign: 'center', mb: 3 }}>
                                <Grid container spacing={2} justifyContent="center">
                                    <Grid item>
                                        <Chip
                                            icon={<EventIcon />}
                                            label={`Start Time: ${eventTime.start}`}
                                            sx={{
                                                px: 1,
                                                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                                fontSize: 14,
                                                fontWeight: 'bold',
                                                color: '#5e81ac',
                                                borderColor: '#5e81ac'
                                            }}
                                            variant="outlined"
                                        />
                                    </Grid>
                                    <Grid item>
                                        <Chip
                                            icon={<AccessTimeIcon />}
                                            label={`End Time: ${eventTime.end}`}
                                            sx={{
                                                px: 1,
                                                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                                fontSize: 14,
                                                fontWeight: 'bold',
                                                color: '#5e81ac',
                                                borderColor: '#5e81ac'
                                            }}
                                            variant="outlined"
                                        />
                                    </Grid>
                                </Grid>
                            </Box>

                            <Typography variant="h6" gutterBottom color="#5e81ac" align="center" sx={{ fontWeight: "bold" }}>
                                Scan QR Code for Attendance
                            </Typography>

                            <Box sx={{
                                position: 'relative',
                                my: 3,
                                p: 4,
                                border: `2px dashed rgba(94, 129, 172, 0.4)`,
                                borderRadius: 2,
                                mx: 'auto',
                                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                maxWidth: '450px'
                            }}>
                                {/* Placeholder for QR Code - in real app this would be an actual QR code */}
                                <Box sx={{
                                    width: '100%',
                                    height: '450px',
                                    mx: 'auto',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)',
                                    bgcolor: '#FFF',
                                    borderRadius: 1
                                }}>
                                    <Fade key={refreshCounter} in={true} timeout={400}>
                                        <Box>
                                            {eventQRData ? (
                                                <QRCode
                                                    value={eventQRData}
                                                    size={600}
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
                                                        height: 600,
                                                        width: 600
                                                    }}
                                                >
                                                    <CircularProgress size={70} color="primary" />
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
                                color: theme.palette.text.secondary,
                                backgroundColor: 'rgba(94, 129, 172, 0.1)',
                                p: 2,
                                borderRadius: 2,
                                maxWidth: '450px',
                                mx: 'auto'
                            }}>
                                <RefreshIcon sx={{ mr: 1, fontSize: '1rem', color: '#5e81ac' }} />
                                <Typography variant="body2" sx={{ fontWeight: 'bold', fontSize: 14 }}>
                                    QR code refreshes automatically every 3 seconds
                                </Typography>
                            </Box>
                        </Grid>
                    </Grid>
                </Card>
            </Container>
        </Box>
        // <Container maxWidth="lg" sx={{ py: 5 }}>
        //     <Paper
        //         elevation={2}
        //         sx={{
        //             borderRadius: 2,
        //             overflow: "hidden",
        //             background: "linear-gradient(to bottom, #f9f9f9, #ffffff"
        //         }}
        //     >
        //         <Box
        //             sx={{
        //                 pt: 5,
        //                 width: "100%",
        //                 height: 100,
        //                 borderRadius: "50%",
        //                 bgcolor: 'rgba(255, 255, 255, 0.1)'
        //             }}
        //         >
        //             <Typography
        //                 variant="h4"
        //                 component="h1"
        //                 sx={{
        //                     fontWeight: 700,
        //                     textAlign: "center",
        //                     position: 'relative',
        //                     mb: 1,
        //                     textShadow: "0 2px 4px rgba(0, 0, 0, 0.1)"
        //                 }}
        //             >
        //                 Event Attendance
        //             </Typography>
        //             <Typography
        //                 variant="h6"
        //                 sx={{
        //                     textAlign: "center",
        //                     opacity: 0.9,
        //                     position: 'relative',
        //                     fontWeight: 600,
        //                 }}
        //             >
        //                 {eventName}
        //             </Typography>
        //         </Box>

        //         {/* QR Code Section */}
        //         <Box sx={{ p: 4 }}>
        //             <Card
        //                 elevation={0}
        //                 sx={{
        //                     bgcolor: theme.palette.grey[50],
        //                     borderRadius: 3,
        //                     border: `1px solid rgba(33, 150, 243, 0.15)`,
        //                     mb: 4,
        //                     overflow: "hidden",
        //                     transition: "transform 0.3s ease-in-out",
        //                     "&:hover": {
        //                         transform: "translateY(-5px)"
        //                     }
        //                 }}
        //             >
        //                 <CardContent sx={{ py: 4 }}>
        //                     <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        //                         <Box sx={{ display: 'flex', alignItems: 'center' }}>
        //                             <QrCodeIcon color="primary" sx={{ mr: 1.5, fontSize: 28 }} />
        //                             <Typography variant="h6" sx={{ fontWeight: 600 }}>
        //                                 Attendance QR Code
        //                             </Typography>
        //                         </Box>
        //                         <Chip
        //                             label={`Refreshes in ${countdownTime}s`}
        //                             color="primary"
        //                             size="small"
        //                             variant="outlined"
        //                             sx={{
        //                                 fontSize: '0.8rem',
        //                                 fontWeight: 500,
        //                                 borderRadius: 5,
        //                                 px: 1,
        //                                 background: "rgba(33, 150, 243, 0.08)"
        //                             }}
        //                         />
        //                     </Box>

        //                     <Divider sx={{ mb: 4, opacity: 0.6 }} />

        //                     <Box
        //                         sx={{
        //                             display: 'flex',
        //                             justifyContent: 'center',
        //                             background: 'white',
        //                             p: 4,
        //                             mx: 'auto',
        //                             borderRadius: 2,
        //                             border: `2px solid rgba(33, 150, 243, 0.2)`,
        //                             position: 'relative',
        //                             boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
        //                             maxWidth: "fit-content"
        //                         }}
        //                     >
        //                         <Fade key={refreshCounter} in={true} timeout={400}>
        //                             <Box>
        //                                 {eventQRData ? (
        //                                     <QRCode
        //                                         value={eventQRData}
        //                                         size={300}
        //                                         level="H"
        //                                         style={{ maxWidth: '100%', height: 'auto' }}
        //                                         bgColor={"#ffffff"}
        //                                     />
        //                                 ) : (
        //                                     <Box
        //                                         sx={{
        //                                             display: 'flex',
        //                                             justifyContent: 'center',
        //                                             alignItems: 'center',
        //                                             height: 300,
        //                                             width: 300
        //                                         }}
        //                                     >
        //                                         <CircularProgress size={60} color="primary" />
        //                                     </Box>
        //                                 )}
        //                             </Box>
        //                         </Fade>
        //                     </Box>

        //                     <Typography
        //                         variant="body2"
        //                         color="text.secondary"
        //                         sx={{
        //                             mt: 3,
        //                             textAlign: 'center',
        //                             fontSize: '0.85rem',
        //                             fontStyle: 'italic'
        //                         }}
        //                     >
        //                         QR code refreshes automatically for security purposes
        //                     </Typography>
        //                 </CardContent>
        //             </Card>

        //             {/* Event Time Information */}
        //             <Card
        //                 elevation={0}
        //                 sx={{
        //                     bgcolor: theme.palette.background.paper,
        //                     borderRadius: 3,
        //                     border: `1px solid ${theme.palette.grey[200]}`,
        //                     transition: "all 0.3s ease"
        //                 }}
        //             >
        //                 <CardContent>
        //                     <Typography
        //                         variant="h5"
        //                         sx={{
        //                             display: 'flex',
        //                             alignItems: 'center',
        //                             fontWeight: 600,
        //                             mb: 2,
        //                         }}
        //                     >
        //                         <EventIcon color="black" sx={{ mr: 1 }} />
        //                         Event Schedule
        //                     </Typography>

        //                     <Divider sx={{ mb: 3, opacity: 0.6 }} />

        //                     <Grid container spacing={3}>
        //                         <Grid>
        //                             <Box
        //                                 sx={{
        //                                     display: 'flex',
        //                                     alignItems: 'flex-start',
        //                                     p: 2,
        //                                     background: "rgba(76, 175, 80, 0.08)",
        //                                     borderRadius: 2,
        //                                 }}
        //                             >
        //                                 <AccessTimeIcon
        //                                     sx={{
        //                                         mt: 0.5,
        //                                         mr: 2,
        //                                         color: theme.palette.success.main,
        //                                         fontSize: 28
        //                                     }}
        //                                 />
        //                                 <Box>
        //                                     <Typography
        //                                         variant="subtitle1"
        //                                         sx={{
        //                                             color: theme.palette.text.primary,
        //                                             fontWeight: 700,
        //                                             mb: 0.5
        //                                         }}
        //                                     >
        //                                         Start Time
        //                                     </Typography>
        //                                     <Typography variant="h6" sx={{ color: "text.primary", fontWeight: 500 }}>
        //                                         {eventTime.start}
        //                                     </Typography>
        //                                 </Box>
        //                             </Box>
        //                         </Grid>

        //                         <Grid>
        //                             <Box
        //                                 sx={{
        //                                     display: 'flex',
        //                                     alignItems: 'flex-start',
        //                                     p: 2,
        //                                     background: "rgba(244, 67, 54, 0.08)",
        //                                     borderRadius: 2,
        //                                 }}
        //                             >
        //                                 <AccessTimeIcon
        //                                     sx={{
        //                                         mt: 0.5,
        //                                         mr: 2,
        //                                         color: theme.palette.error.main,
        //                                         fontSize: 28
        //                                     }}
        //                                     fontSize="small"
        //                                 />
        //                                 <Box>
        //                                     <Typography
        //                                         variant="subtitle1"
        //                                         sx={{
        //                                             color: theme.palette.error.dark,
        //                                             fontWeight: 700,
        //                                             mb: 0.5
        //                                         }}
        //                                     >
        //                                         End Time
        //                                     </Typography>
        //                                     <Typography variant="h6" sx={{ color: "text.primary", fontWeight: 500 }}>
        //                                         {eventTime.end}
        //                                     </Typography>
        //                                 </Box>
        //                             </Box>
        //                         </Grid>
        //                     </Grid>
        //                 </CardContent>
        //             </Card>
        //         </Box>
        //     </Paper>
        // </Container>
    )
}

export default AttendanceQR;