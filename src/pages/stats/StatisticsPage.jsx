import { alpha, Box, Card, Tab, Tabs, Typography, useMediaQuery, useTheme } from "@mui/material";
import { Event as EventIcon, ShowChart as ShowChartIcon, SportsEsportsOutlined as SportsEsportsOutlinedIcon } from '@mui/icons-material';
import { useEffect, useState } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";

import { db } from "../../utils/firebaseConfig";
import { getItem } from "../../utils/localStorage";

import EventsStat from "../../components/Statistics/EventsStat";
import Loader from "../../components/General/Loader";
import QuestsStat from "../../components/Statistics/QuestsStat";

const StatisticsPage = () => {
    const [activeTab, setActiveTab] = useState(0);
    const [averageSatisfactionRating, setAverageSatisfactionRating] = useState(0);
    const [averageQuestSatisfactionRating, setAverageQuestSatisfactionRating] = useState(0);

    const [isLoading, setIsLoading] = useState(true);

    const theme = useTheme();
    const isExtraSmall = useMediaQuery(theme.breakpoints.down('xs'));

    const tabs = [
        {
            label: "Event Stats",
            icon: <EventIcon sx={{ fontSize: isExtraSmall ? 16 : 18 }} />
        },
        {
            label: "Quest Stats",
            icon: <SportsEsportsOutlinedIcon sx={{ fontSize: isExtraSmall ? 16 : 18 }} />
        },
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

    useEffect(() => {
        const unsubscribers = [];

        const init = async () => {
            const unsubscribeStat = await fetchEventRatingsStat();

            unsubscribers.push(unsubscribeStat);
        };

        init();

        return () => {
            unsubscribers.forEach(unsub => {
                if (typeof unsub === 'function') unsub();
            });
        };
    }, []);

    const fetchEventRatingsStat = async () => {
        const adminData = await getItem("admin");
        const { facultyID } = JSON.parse(adminData);

        const unsubs = [];

        const eventQuery = query(
            collection(db, 'event'),
            where('organiserID', '==', facultyID),
        );

        const unsub = onSnapshot(eventQuery, (events) => {
            setIsLoading(true);

            let eventIDs = [];

            events.forEach((event) => {
                eventIDs.push(event.id);
            });

            if (eventIDs.length === 0) return;

            const batchSize = 10;
            const feedbackUnsubs = [];

            let totalEventFb = 0;
            let totalGamificationFb = 0;
            let totalCount = 0;

            const batches = [];
            for (let i = 0; i < eventIDs.length; i += batchSize) {
                batches.push(eventIDs.slice(i, i + batchSize));
            }

            batches.forEach((batch) => {
                const feedbackQuery = query(
                    collection(db, 'feedback'),
                    where('eventID', 'in', batch)
                );

                const feedbackUnsub = onSnapshot(feedbackQuery, (feedbackSnap) => {
                    let batchEventFb = 0;
                    let batchGamificationFb = 0;
                    let batchCount = 0;

                    feedbackSnap.forEach(doc => {
                        const data = doc.data();
                        const eventFb = parseInt(data.eventFeedback);
                        const gamificationFb = parseInt(data.gamificationFeedback);

                        if (!isNaN(eventFb)) batchEventFb += eventFb;
                        if (!isNaN(gamificationFb)) batchGamificationFb += gamificationFb;
                        batchCount++;
                    });

                    totalEventFb += batchEventFb;
                    totalGamificationFb += batchGamificationFb;
                    totalCount += batchCount;

                    setAverageSatisfactionRating(totalCount > 0 ? (totalEventFb / totalCount).toFixed(2) : "0.00");
                    setAverageQuestSatisfactionRating(totalCount > 0 ? (totalGamificationFb / totalCount).toFixed(2) : "0.00");
                });

                feedbackUnsubs.push(feedbackUnsub);
            });

            unsubs.push(...feedbackUnsubs);

            setIsLoading(false);
        });

        unsubs.push(unsub);
        return unsubs;
    }

    if (isLoading) (
        <Loader loadingText='Loading event statistic...' />
    )

    return (
        <Box sx={{
            width: '100%',
            height: '100vh',
        }}>
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
                        flexDirection: { xs: 'column', sm: 'row' },
                        alignItems: isExtraSmall ? 'flex-start' : 'center',
                        py: { xs: 1, sm: 2 },
                        px: { xs: 2, sm: 3 },
                        gap: { xs: 2, sm: 0 },
                        borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
                        flexShrink: 0
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
                                <ShowChartIcon
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
                                    Statistics
                                </Typography>
                            </Box>
                        </Box>
                    </Box>
                </Box>

                <Box
                    sx={{
                        width: '100%',
                        borderBottom: '1px solid rgba(176, 174, 174, 0)',
                        flexShrink: 0,
                    }}
                >
                    <Tabs
                        value={activeTab}
                        onChange={(event, newValue) => setActiveTab(newValue)}
                        variant={isExtraSmall ? "scrollable" : "fullWidth"}
                        scrollButtons={isExtraSmall ? "auto" : false}
                        aria-label="stats-tabs"
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

                <Box
                    sx={{
                        flexGrow: 1, // this grows to fill remaining height
                        overflowY: 'auto',
                        px: 3,
                        py: 2,
                    }}
                >
                    <Box
                        role="tabpanel"
                        hidden={activeTab !== 0}
                        id={`stats-tabpanel-0`}
                        aria-labelledby={`stats-tab-0`}
                        sx={{ minHeight: '100%' }}
                    >
                        {activeTab === 0 && <EventsStat averageSatisfactionRating={averageSatisfactionRating} />}
                    </Box>

                    <Box
                        role="tabpanel"
                        hidden={activeTab !== 1}
                        id={`stats-tabpanel-1`}
                        aria-labelledby={`stats-tab-1`}
                        sx={{ minHeight: '100%' }}
                    >
                        {activeTab === 1 && <QuestsStat averageQuestSatisfactionRating={averageQuestSatisfactionRating} />}
                    </Box>
                </Box>
            </Card>
        </Box>
    )
}

export default StatisticsPage;