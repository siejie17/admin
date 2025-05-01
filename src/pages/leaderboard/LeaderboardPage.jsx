import React, { useEffect, useRef, useState } from 'react';
import LeaderboardTable from '../../components/Leaderboard/LeaderboardTable';
import { AccessTime as AccessTimeIcon, CalendarToday as CalendarTodayIcon, EmojiEvents as EmojiEventsIcon, InfoOutlined as InfoOutlinedIcon, Leaderboard as LeaderboardIcon } from '@mui/icons-material';
import { alpha, Box, Divider, Typography, useMediaQuery, useTheme } from '@mui/material';
import { getItem } from '../../utils/localStorage';
import { collection, doc, onSnapshot, orderBy, query, Timestamp, where } from 'firebase/firestore';
import { db } from '../../utils/firebaseConfig';

const LeaderboardPage = () => {
    const [leaderboardList, setLeaderboardList] = useState([]);
    const [facultyName, setFacultyName] = useState('');
    const [currentMonthYear, setCurrentMonthYear] = useState('');
    const [refreshDateTime, setRefreshDateTime] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    const theme = useTheme();
    const isExtraSmall = useMediaQuery(theme.breakpoints.down('xs'));

    const unsubscribeLeaderboard = useRef(null);
    const unsubscribeLeaderboardRef = useRef(null);
    const unsubscribeEntriesRef = useRef(null);
    const usersUnsubscribersRef = useRef([]);

    const FACULTY_MAPPING = {
        1: "Faculty of Applied & Creative Arts",
        2: "Faculty of Built Environment",
        3: "Faculty of Cognitive Sciences & Human Development",
        4: "Faculty of Computer Science & Information Technology",
        5: "Faculty of Economics & Business",
        6: "Faculty of Education, Language & Communication",
        7: "Faculty of Engineering",
        8: "Faculty of Medicine & Health Sciences",
        9: "Faculty of Resource Science & Technology",
        10: "Faculty of Social Sciences & Humanities",
    };

    useEffect(() => {
        fetchLeaderboardList();

        return () => {
            if (unsubscribeLeaderboardRef.current) unsubscribeLeaderboardRef.current();
            if (unsubscribeEntriesRef.current) unsubscribeEntriesRef.current();
            usersUnsubscribersRef.current.forEach(unsub => unsub());
        };
    }, []);

    const fetchLeaderboardList = async () => {
        try {
            const adminData = await getItem("admin");
            if (!adminData) return;

            const { facultyID } = JSON.parse(adminData);

            setFacultyName(FACULTY_MAPPING[facultyID]);

            const leaderboardQuery = query(
                collection(db, "leaderboard"),
                where("facultyID", "==", String(facultyID))
            );

            if (unsubscribeLeaderboard.current) unsubscribeLeaderboard.current();

            unsubscribeLeaderboard.current = onSnapshot(leaderboardQuery, (leaderboardSnapshot) => {
                if (!leaderboardSnapshot.empty) {
                    setIsLoading(true);
                    const leaderboardDoc = leaderboardSnapshot.docs[0];

                    const timestampNow = Timestamp.now();
                    const dateNow = new Date(timestampNow.toDate());

                    const month = dateNow.toLocaleString('en-US', { month: 'long' });
                    const year = String(dateNow.getFullYear());
                    const monthYear = `${month} ${year}`;

                    setCurrentMonthYear(monthYear);

                    const leaderboardDocData = leaderboardDoc.data();
                    const { refreshDateTime } = leaderboardDocData;
                    const refreshDateTimeObj = new Date(refreshDateTime.toDate());

                    setRefreshDateTime(refreshDateTimeObj.toLocaleDateString());

                    const leaderboardDocRef = leaderboardDoc.ref;

                    if (unsubscribeLeaderboardRef.current) unsubscribeLeaderboardRef.current();

                    unsubscribeLeaderboardRef.current = onSnapshot(leaderboardDocRef, (leaderboardDocSnap) => {
                        if (leaderboardDocSnap.exists()) {
                            if (unsubscribeEntriesRef.current) unsubscribeEntriesRef.current();
                            usersUnsubscribersRef.current.forEach(unsub => unsub());
                            usersUnsubscribersRef.current = [];

                            const entriesRef = query(collection(leaderboardDocRef, "leaderboardEntries"), orderBy("points", "desc"));

                            unsubscribeEntriesRef.current = onSnapshot(entriesRef, (entriesSnapshot) => {
                                const tempLeaderboard = [];

                                let processedCount = 0;
                                const totalEntries = entriesSnapshot.size;

                                if (totalEntries === 0) {
                                    setLeaderboardList([]);
                                    setIsLoading(false);
                                    return;
                                }

                                entriesSnapshot.forEach((entryDoc) => {
                                    const entryData = entryDoc.data();
                                    const { studentID, points, lastUpdated } = entryData;

                                    const userDocRef = doc(db, "user", studentID);
                                    const userUnsub = onSnapshot(userDocRef, (userDoc) => {
                                        if (userDoc.exists()) {
                                            const userData = userDoc.data();
                                            const { firstName, lastName, profilePicture, yearOfStudy } = userData;

                                            const studentEntry = {
                                                id: entryDoc.id,
                                                fullName: `${firstName} ${lastName}`,
                                                profilePicture,
                                                yearOfStudy,
                                                points,
                                                lastUpdated: lastUpdated.toDate().toLocaleString()
                                            }

                                            tempLeaderboard.push(studentEntry);
                                        }

                                        processedCount++;
                                        if (processedCount === totalEntries) {
                                            tempLeaderboard.forEach((entry, idx) => {
                                                entry.rank = idx + 1;
                                            });
                                            setLeaderboardList(tempLeaderboard);
                                            setIsLoading(false);
                                        }
                                    });

                                    usersUnsubscribersRef.current.push(userUnsub);
                                });
                            });
                        } else {
                            setLeaderboardList([]);
                            setIsLoading(false);
                        }
                    });
                    setIsLoading(false);
                }
            });

        } catch (error) {
            console.error("Error in fetchLeaderboardList:", error);
            setIsLoading(false);
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
                            <LeaderboardIcon
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
                                Leaderboard
                            </Typography>
                        </Box>
                    </Box>
                </Box>
            </Box>
            <Box
                sx={{
                    px: { xs: 2, sm: 3 },
                    py: 1
                }}
            >
                <Box
                    sx={{
                        p: 2,
                        borderRadius: "12px",
                        mb: 2,
                        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.light, 0.12)} 0%, ${alpha(theme.palette.primary.light, 0.05)} 100%)`,
                        border: "1px solid",
                        borderColor: alpha(theme.palette.primary.main, 0.08),
                        boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.06)}`
                    }}
                >
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                        {/* Header Row - Faculty Name and Month/Year */}
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            {/* Faculty Name */}
                            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                                <Box
                                    sx={{
                                        backgroundColor: alpha(theme.palette.primary.main, 0.15),
                                        color: theme.palette.primary.main,
                                        borderRadius: "8px",
                                        p: 0.6,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center"
                                    }}
                                >
                                    <EmojiEventsIcon sx={{ fontSize: 18 }} />
                                </Box>
                                <Typography
                                    variant="subtitle1"
                                    fontWeight={600}
                                    sx={{ fontSize: "0.95rem" }}
                                >
                                    {facultyName}
                                </Typography>
                            </Box>

                            {/* Month/Year Badge */}
                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                    color: theme.palette.primary.dark,
                                    borderRadius: "16px",
                                    px: 3,
                                    py: 0.5,
                                    gap: 1
                                }}
                            >
                                <CalendarTodayIcon sx={{ fontSize: 14 }} />
                                <Typography
                                    variant="caption"
                                    sx={{
                                        fontWeight: 600,
                                        letterSpacing: "0.01em",
                                        fontSize: "0.7rem"
                                    }}
                                >
                                    {currentMonthYear}
                                </Typography>
                            </Box>
                        </Box>

                        <Divider sx={{ opacity: 0.6 }} />

                        {/* Refresh info - Compact */}
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                                backgroundColor: alpha(theme.palette.background.default, 0.7),
                                borderRadius: "8px",
                                p: 1
                            }}
                        >
                            <AccessTimeIcon sx={{ fontSize: 16, color: theme.palette.text.secondary }} />
                            <Box>
                                <Typography
                                    variant="caption"
                                    fontWeight={600}
                                    sx={{ fontSize: "0.7rem" }}
                                >
                                    Next Refresh:
                                    <Box
                                        component="span"
                                        sx={{
                                            ml: 0.5,
                                            color: theme.palette.primary.main,
                                            fontWeight: 600
                                        }}
                                    >
                                        {refreshDateTime}
                                    </Box>
                                </Typography>
                            </Box>
                        </Box>
                    </Box>
                </Box>
            </Box>
            <Box sx={{ px: 2 }}>
                <LeaderboardTable leaderboardList={leaderboardList} isLoading={isLoading} />
            </Box>
        </Box>
    )
}

export default LeaderboardPage;