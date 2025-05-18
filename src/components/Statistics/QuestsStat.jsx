import { useEffect, useState } from 'react';
import { Box, Grid, Typography, useTheme } from "@mui/material";
import { Celebration as CelebrationIcon, IncompleteCircle as IncompleteCircleIcon } from "@mui/icons-material";
import { collection, getDocs, onSnapshot, query, where } from 'firebase/firestore';

import { db } from '../../utils/firebaseConfig';
import { getItem } from '../../utils/localStorage';

import QuestSatisfactionStat from "./QuestSatisfactionStat";
import QuestTypesStat from "./QuestTypesStat";
import QuestCompletionStatusStat from "./QuestCompletionStatusStat";
import Loader from "../General/Loader";

const QuestsStat = ({ averageQuestSatisfactionRating }) => {
    const [questTypeCounts, setQuestTypeCounts] = useState({});
    const [questCompletionStats, setQuestCompletionStats] = useState({});
    const [isLoading, setIsLoading] = useState(true);

    const theme = useTheme();

    useEffect(() => {
        const fetchQuestStats = async () => {
            const adminData = await getItem("admin");
            const { facultyID } = JSON.parse(adminData);

            const eventQuery = query(collection(db, 'event'), where('organiserID', '==', facultyID), where('status', "!=", "Cancelled"));

            const unsubEvent = onSnapshot(eventQuery, async (eventsSnapshot) => {
                setIsLoading(true);

                const questTypeCounter = {
                    attendance: 0,
                    earlyBird: 0,
                    'q&a': 0,
                    networking: 0,
                    feedback: 0,
                };

                const completionCounter = {
                    attendance: { completed: 0, notCompleted: 0 },
                    earlyBird: { completed: 0, notCompleted: 0 },
                    'q&a': { completed: 0, notCompleted: 0 },
                    networking: { completed: 0, notCompleted: 0 },
                    feedback: { completed: 0, notCompleted: 0 },
                };

                const questMap = {};
                const unsubListeners = [];

                for (const eventDoc of eventsSnapshot.docs) {
                    const eventID = eventDoc.id;

                    const questRef = query(collection(db, 'quest'), where("eventID", "==", eventID));
                    const questSnapshot = await getDocs(questRef);

                    const questDocID = questSnapshot.docs[0].id;
                    const questListRef = collection(db, "quest", questDocID, "questList");
                    const questListSnapshot = await getDocs(questListRef);

                    questMap[eventID] = {};

                    questListSnapshot.forEach((questDoc) => {
                        const questData = questDoc.data();
                        const questType = questData.questType;
                        const questID = questDoc.id;

                        if (questTypeCounter[questType] !== undefined) {
                            questTypeCounter[questType]++;
                        }

                        questMap[eventID][questID] = questType;
                    });

                    const questProgressQuery = query(
                        collection(db, 'questProgress'),
                        where('eventID', '==', eventID)
                    );

                    const questProgressSnapshot = await getDocs(questProgressQuery);

                    for (const progressDoc of questProgressSnapshot.docs) {
                        const progressDocID = progressDoc.id;
                        const questProgressListRef = collection(db, 'questProgress', progressDocID, 'questProgressList');

                        const unsub = onSnapshot(questProgressListRef, (progressListSnapshot) => {
                            progressListSnapshot.forEach((progressItem) => {
                                const progressData = progressItem.data();
                                const questID = progressData.questID;
                                const isCompleted = progressData.isCompleted;

                                const questType = questMap[eventID]?.[questID];
                                if (questType) {
                                    if (isCompleted) {
                                        completionCounter[questType].completed++;
                                    } else {
                                        completionCounter[questType].notCompleted++;
                                    }
                                }
                            });

                            setQuestCompletionStats((prev) => ({
                                ...prev,
                                ...completionCounter,
                            }));
                        });

                        unsubListeners.push(unsub);
                    }
                }

                setQuestTypeCounts(questTypeCounter);
                setIsLoading(false);

                // Cleanup listeners for quest progress
                return () => {
                    unsubListeners.forEach((unsub) => unsub());
                };
            });

            // Cleanup event listener
            return () => unsubEvent();
        };

        const cleanupPromise = fetchQuestStats();

        return () => {
            cleanupPromise.then((cleanup) => {
                if (typeof cleanup === 'function') {
                    cleanup();
                }
            });
        };
    }, []);

    if (isLoading) (
        <Loader loadingText="Loading quest statistics..." />
    )

    return (
        <Box sx={{ width: '100%', maxWidth: '100%' }}>
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    pt: 1.5,
                    pb: 3
                }}
            >
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
                        <CelebrationIcon fontSize="small" />
                    </Box>
                    <Typography variant='h5' fontWeight="700" sx={{ lineHeight: 1.5, fontSize: "18px" }}>
                        Summary
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
                    <QuestSatisfactionStat averageQuestSatisfactionRating={averageQuestSatisfactionRating} />
                </Grid>
                <Grid size={{ xs: 12, sm: 12, md: 6 }}>
                    <QuestTypesStat questTypeCounts={questTypeCounts} />
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
                        <IncompleteCircleIcon fontSize="small" />
                    </Box>
                    <Typography variant='h5' fontWeight="700" sx={{ lineHeight: 1.5, fontSize: "18px" }}>
                        Total Quest Completion Status by Type
                    </Typography>
                </Box>
            </Box>

            <Grid
                container
                spacing={2}
                columns={12}
                sx={{ mb: (theme) => theme.spacing(1) }}
            >
                {Object.entries(questCompletionStats).map(([questType, stats]) => (
                    <Grid key={questType} size={{ xs: 12, sm: 6, lg: 3 }}>
                        <QuestCompletionStatusStat questType={questType} stats={stats} />
                    </Grid>
                ))}
            </Grid>
        </Box>
    )
}

export default QuestsStat;