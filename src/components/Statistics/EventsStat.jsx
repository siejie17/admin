import { useState, useEffect } from 'react';
import { Box, Grid, Typography, useTheme } from '@mui/material';
import { Numbers as NumbersIcon, ThumbUpAlt as ThumbUpAltIcon } from '@mui/icons-material';
import { collection, onSnapshot, query, where } from 'firebase/firestore';

import { getItem } from '../../utils/localStorage';
import { db } from '../../utils/firebaseConfig';

import Loader from '../General/Loader';
import StatCard from './StatCard';
import EventSatisfactionStat from './EventSatisfactionStat';
import AttendanceStat from './AttendanceStat';

const EventsStat = ({ averageSatisfactionRating }) => {
    const [totalEventsStat, setTotalEventsStat] = useState({});
    const [eventTypesStat, setEventTypesStat] = useState([]);
    const [totalAttendees, setTotalAttendees] = useState(0);
    const [totalAbsentees, setTotalAbsentees] = useState(0);

    const [isLoading, setIsLoading] = useState(true);

    const theme = useTheme();

    const CATEGORIES_MAPPING = {
        1: "Academic",
        2: "Volunteering",
        3: "Entertainment",
        4: "Cultural",
        5: "Sports",
        6: "Health & Wellness",
        7: "Others",
    };

    useEffect(() => {
        const unsubscribers = [];

        const init = async () => {
            const unsubscribeStat = await fetchEventTypesStat();

            unsubscribers.push(unsubscribeStat);
        };

        init();

        return () => {
            unsubscribers.forEach(unsub => {
                if (typeof unsub === 'function') unsub();
            });
        };
    }, []);

    const fetchEventTypesStat = async () => {
        const adminData = await getItem("admin");
        const { facultyID } = JSON.parse(adminData);

        const unsubs = [];

        const now = new Date();
        const twelveMonthsAgo = new Date();
        twelveMonthsAgo.setMonth(now.getMonth() - 11);

        const months = [];
        for (let i = 0; i < 12; i++) {
            const date = new Date();
            date.setMonth(now.getMonth() - 11 + i);
            const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            months.push(key);
        }

        const eventTypesQuery = query(
            collection(db, 'event'),
            where('organiserID', '==', facultyID),
            where('eventStartDateTime', '>=', twelveMonthsAgo)
        );

        const unsub = onSnapshot(eventTypesQuery, (events) => {
            setIsLoading(true);

            let eventIDs = [];

            const eventMap = {};
            for (let id = 1; id <= 7; id++) {
                eventMap[id] = {
                    id,
                    eventType: CATEGORIES_MAPPING[id],
                    interval: 'Last 12 months',
                    trend: 'up',
                    trendValues: 0,
                    total: 0,
                    monthly: Array(12).fill(0)
                };
            }

            const monthlyTotals = Array(12).fill(0); // total events per month
            let totalEvents = 0; // total events in last 12 months

            events.forEach((event) => {
                eventIDs.push(event.id);
                const data = event.data();
                const ts = data.eventStartDateTime?.toDate();
                const eventTypeId = data.category;

                if (!ts || !eventTypeId || !eventMap[eventTypeId]) return;

                const monthKey = `${ts.getFullYear()}-${String(ts.getMonth() + 1).padStart(2, '0')}`;
                const index = months.indexOf(monthKey);
                if (index !== -1) {
                    eventMap[eventTypeId].monthly[index]++;
                    eventMap[eventTypeId].total++;
                    monthlyTotals[index]++;
                    totalEvents++;
                }
            });

            const eventTypeArray = Object.values(eventMap);

            const currentMonthTotal = monthlyTotals[monthlyTotals.length - 1] ?? 0;
            const lastMonthTotal = monthlyTotals[monthlyTotals.length - 2] ?? 0;

            const diffTotal = currentMonthTotal - lastMonthTotal;

            const totalTrend = diffTotal > 0 ? 'up' : diffTotal < 0 ? 'down' : 'same';
            let totalTrendValues = 0;

            if (lastMonthTotal === 0) {
                totalTrendValues = currentMonthTotal === 0 ? 0 : 100;
            } else {
                totalTrendValues = Math.round((diffTotal / lastMonthTotal) * 100)
            }

            let totalStat = { eventType: "All", interval: "Last 12 months", total: totalEvents, monthly: monthlyTotals, trend: totalTrend, trendValues: totalTrendValues }

            setTotalEventsStat(totalStat)

            // Calculate trend
            eventTypeArray.forEach((eventType) => {
                const monthly = eventType.monthly;
                const current = monthly[monthly.length - 1] ?? 0;
                const last = monthly[monthly.length - 2] ?? 0;

                const diff = current - last;

                eventType.trend = diff > 0 ? 'up' : diff < 0 ? 'down' : 'same';

                // Calculate percentage change
                if (last === 0) {
                    // Avoid division by zero
                    eventType.trendValues = current === 0 ? 0 : 100;
                } else {
                    eventType.trendValues = Math.round((diff / last) * 100);
                }
            });

            setEventTypesStat(eventTypeArray);

            if (eventIDs.length === 0) return;

            const batchSize = 10;

            const batches = [];
            for (let i = 0; i < eventIDs.length; i += batchSize) {
                batches.push(eventIDs.slice(i, i + batchSize));
            }

            let registrationUnsubs = [];

            batches.forEach((batch) => {
                const registrationQuery = query(
                    collection(db, 'registration'),
                    where('eventID', 'in', batch)
                );

                const registrationUnsub = onSnapshot(registrationQuery, (registrationSnap) => {
                    let attendees = 0;
                    let absentees = 0;
                    
                    registrationSnap.forEach((doc) => {
                        const data = doc.data();

                        if (data.isAttended && data.attendanceScannedTime) attendees +=1;
                        else absentees += 1 
                    })

                    setTotalAttendees(attendees);
                    setTotalAbsentees(absentees);
                });

                registrationUnsubs.push(registrationUnsub);
            });

            unsubs.push(...registrationUnsubs);

            setIsLoading(false);
        });

        unsubs.push(unsub);
        return unsubs;
    }

    if (isLoading) (
        <Loader loadingText='Loading event statistic...' />
    )

    return (
        <Box sx={{ width: '100%', maxWidth: '100%' }}>
            <Box sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                pt: 1.5,
                pb: 3
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: 2,
                            width: 30,
                            height: 30,
                            mr: 2,
                            background: `linear-gradient(135deg, ${theme.palette.primary.light}, ${theme.palette.primary.main})`,
                            color: 'white',
                            boxShadow: '0 4px 10px rgba(0, 0, 0, 0.15)',
                        }}
                    >
                        <ThumbUpAltIcon fontSize="small" />
                    </Box>
                    <Typography variant='h5' fontWeight="700" sx={{ lineHeight: 1.5, fontSize: "18px" }}>
                        Event Engagement & Satisfaction
                    </Typography>
                </Box>
            </Box>

            <Grid
                container
                spacing={2}
                columns={12}
                sx={{ mb: (theme) => theme.spacing(1) }}
            >
                <Grid size={{ xs: 12, sm: 12, md: 6 }}>
                    <EventSatisfactionStat averageSatisfactionRating={averageSatisfactionRating} />
                </Grid>
                <Grid size={{ xs: 12, sm: 12, md: 6 }}>
                    <AttendanceStat totalAttendees={totalAttendees} totalAbsentees={totalAbsentees} />
                </Grid>
            </Grid>

            <Box sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                pt: 1.5,
                pb: 3
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: 2,
                            width: 30,
                            height: 30,
                            mr: 2,
                            background: `linear-gradient(135deg, ${theme.palette.primary.light}, ${theme.palette.primary.main})`,
                            color: 'white',
                            boxShadow: '0 4px 10px rgba(0, 0, 0, 0.15)',
                        }}
                    >
                        <NumbersIcon fontSize="small" />
                    </Box>
                    <Typography variant='h5' fontWeight="700" sx={{ lineHeight: 1.5, fontSize: "18px" }}>
                        Yearly Event Statistics
                    </Typography>
                </Box>
            </Box>

            <Grid
                container
                spacing={2}
                columns={12}
                sx={{ mb: (theme) => theme.spacing(1) }}
            >
                <Grid width={"100%"}>
                    {totalEventsStat?.total !== undefined && (
                        <StatCard {...totalEventsStat} />
                    )}
                </Grid>
                {eventTypesStat.map((card, index) => (
                    <Grid key={index} size={{ xs: 12, sm: 6, lg: 3 }}>
                        <StatCard {...card} />
                    </Grid>
                ))}
            </Grid>
        </Box>
    )
}

export default EventsStat;