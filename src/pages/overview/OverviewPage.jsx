import React, { useEffect, useState } from 'react';
import { getItem } from '../../utils/localStorage';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../../utils/firebaseConfig';
import OverviewTable from '../../components/Overview/OverviewTable';
import { alpha, Box, Paper, Typography, useMediaQuery, useTheme } from '@mui/material';
import { AssessmentRounded as AssessmentRoundedIcon, School as SchoolIcon } from '@mui/icons-material';

const OverviewPage = () => {
    const [overviewData, setOverviewData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const theme = useTheme();
    const isExtraSmall = useMediaQuery(theme.breakpoints.down('xs'));

    let unsubscribeUsers = null;
    let registrationUnsubscribers = [];

    useEffect(() => {
        fetchOverviewData();

        // Cleanup on unmount
        return () => {
            if (unsubscribeUsers) unsubscribeUsers();
            registrationUnsubscribers.forEach(unsub => unsub());
        };
    }, []);

    const fetchOverviewData = async () => {
        try {
            const adminData = await getItem("admin");
            if (adminData) {
                const { facultyID } = JSON.parse(adminData);

                const userQuery = query(
                    collection(db, "user"),
                    where("facultyID", "==", String(facultyID))
                );

                unsubscribeUsers = onSnapshot(userQuery, (userSnapshot) => {
                    setIsLoading(true);
                    const users = userSnapshot.docs.map(doc => ({
                        id: doc.id,
                        fullName: doc.data().firstName + " " + doc.data().lastName,
                        profilePicture: doc.data().profilePicture,
                        yearOfStudy: doc.data().yearOfStudy,
                        totalPointsGained: doc.data().totalPointsGained,
                        registrations: 0
                    }));

                    setOverviewData(users); // Store initial list

                    // Cleanup old listeners
                    registrationUnsubscribers.forEach(unsub => unsub());
                    registrationUnsubscribers = [];

                    // Setup registration listeners
                    users.forEach((user) => {
                        const registrationQuery = query(
                            collection(db, "registration"),
                            where("studentID", "==", user.id),
                            where("isAttended", "==", true),
                            where("attendanceScannedTime", "!=", null)
                        );

                        const unsub = onSnapshot(registrationQuery, (registrationSnapshot) => {
                            const registrations = registrationSnapshot.docs.length;

                            setOverviewData(prev => {
                                // Update registrations
                                const updated = prev.map(u =>
                                    u.id === user.id ? { ...u, registrations } : u
                                );

                                // Sort by registrations desc, then totalPointsGained desc
                                const sorted = [...updated].sort((a, b) => {
                                    if (b.registrations !== a.registrations) {
                                        return b.registrations - a.registrations;
                                    }
                                    return b.totalPointsGained - a.totalPointsGained;
                                });

                                // Add bil (index starting from 1)
                                return sorted.map((u, i) => ({ ...u, bil: i + 1 }));
                            });
                        });

                        registrationUnsubscribers.push(unsub);
                    });
                    setIsLoading(false);
                });
            }
        } catch (error) {
            console.error("Error fetching overview data:", error);
        }
    };

    return (
        <Box
            sx={{
                maxWidth: "100%",
                pb: 3,
            }}
        >
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    alignItems: isExtraSmall ? 'flex-start' : 'center',
                    py: { xs: 1, sm: 2 },
                    px: { xs: 2, sm: 3 },
                    gap: { xs: 2, sm: 0 },
                    mb: 2,
                    borderBottom: '1px solid rgba(0, 0, 0, 0.06)'
                }}
            >
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        width: { xs: '100%', sm: 'auto' },
                        justifyContent: { xs: 'space-between', sm: 'flex-start' }
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box
                            sx={{
                                backgroundColor: alpha(theme.palette.primary.main, 0.08),
                                color: theme.palette.primary.dark,
                                borderRadius: 2,
                                p: 1.25,
                                mr: 2,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.2s ease',
                            }}
                        >
                            <SchoolIcon
                                sx={{
                                    fontSize: { xs: 18, sm: 22 },
                                    color: theme.palette.primary.dark
                                }}
                            />
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography
                                variant="h5"
                                component="h1"
                                fontWeight="700"
                                sx={{
                                    fontSize: { xs: '1.25rem', sm: '1.5rem' },
                                    letterSpacing: '-0.01em'
                                }}
                            >
                                Student Participation Overview
                            </Typography>
                        </Box>
                    </Box>
                </Box>
            </Box>
            <Box
                sx={{
                    maxWidth: "100%",
                    mb: 3,
                    mx: 2,
                    borderRadius: 2,
                    background: `linear-gradient(to right, ${alpha(theme.palette.primary.main, 0.03)}, ${alpha(theme.palette.primary.main, 0.01)})`,
                    overflow: 'hidden',
                    position: 'relative',
                }}
            >
                <Box
                    sx={{
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        bottom: 0,
                        width: 4,
                        background: `linear-gradient(to bottom, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
                    }}
                />
                <Box
                    sx={{
                        py: 2,
                        px: 3,
                    }}
                >
                    <Typography
                        variant="subtitle1"
                        fontWeight="600"
                        sx={{
                            fontSize: '0.9rem',
                            mb: 1.5,
                            color: theme.palette.primary.dark,
                            display: 'flex',
                            alignItems: 'center'
                        }}
                    >
                        <AssessmentRoundedIcon sx={{ fontSize: '1.25rem', mr: 1, opacity: 0.9 }} />
                        Student Participation Ranking
                    </Typography>
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                            fontSize: '0.8rem',
                            display: 'flex',
                            textAlign: 'justify',
                            mb: 1.5,
                            maxWidth: '800px',
                            lineHeight: 1.5
                        }}
                    >
                        This dashboard identifies active students for recognition and co-curricular leadership opportunities based on their campus engagement.
                    </Typography>
                    <Box
                        sx={{
                            display: 'flex',
                            gap: { xs: 1, sm: 3 },
                            flexWrap: 'wrap',
                            alignItems: 'center'
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Box
                                component="span"
                                sx={{
                                    width: 20,
                                    height: 20,
                                    borderRadius: '50%',
                                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                                    color: 'white',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '0.7rem',
                                    fontWeight: 'bold',
                                    mr: 1,
                                    boxShadow: `0 2px 4px ${alpha(theme.palette.primary.main, 0.3)}`
                                }}
                            >1</Box>
                            <Typography
                                variant="body2"
                                sx={{
                                    fontSize: '0.8rem',
                                    fontWeight: 500,
                                    color: 'text.primary'
                                }}
                            >
                                Primary: Events Attended
                            </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Box
                                component="span"
                                sx={{
                                    width: 20,
                                    height: 20,
                                    borderRadius: '50%',
                                    background: `linear-gradient(135deg, ${theme.palette.secondary.light}, ${theme.palette.secondary.main})`,
                                    color: 'white',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '0.7rem',
                                    fontWeight: 'bold',
                                    mr: 1,
                                    boxShadow: `0 2px 4px ${alpha(theme.palette.secondary.main, 0.3)}`
                                }}
                            >2</Box>
                            <Typography
                                variant="body2"
                                sx={{
                                    fontSize: '0.8rem',
                                    fontWeight: 500,
                                    color: 'text.primary'
                                }}
                            >
                                Secondary: Total Points
                            </Typography>
                        </Box>
                    </Box>
                </Box>
            </Box>
            <Box sx={{ px: 2 }}>
                <OverviewTable overviewList={overviewData} isLoading={isLoading} />
            </Box>
        </Box>
    )
}

export default OverviewPage;