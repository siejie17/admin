import { collection, doc, getDocs, onSnapshot, query, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { db } from '../../utils/firebaseConfig';
import { Box, Grid, Paper, Typography, useTheme } from '@mui/material';
import { NumbersOutlined as NumbersOutlinedIcon, Task as TaskIcon } from '@mui/icons-material';
import MetricCard from '../General/MetricCard';
import QuestList from './Quest/QuestList';
import Loader from '../General/Loader';
import QuestAddButton from './Quest/QuestAddButton';

const QuestManager = ({ eventID, eventName }) => {
    const [quests, setQuests] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [questExist, setQuestExist] = useState({
        earlyBird: false,
        networking: false
    });

    const theme = useTheme();

    useEffect(() => {
        let unsubscribe = () => { };

        setIsLoading(true);

        fetchQuestProgress().then(result => {
            if (Array.isArray(result)) {
                unsubscribe = () => result.forEach(fn => fn && fn());
            }
        }).catch(err => {
            console.error("Something went wrong when setting up real-time listener", err);
        }).finally(() => setIsLoading(false));

        return () => unsubscribe();
    }, []);

    const fetchQuestProgress = async () => {
        try {
            let eventQuests = [];

            const questsQuery = query(collection(db, "quest"), where("eventID", "==", eventID));
            const questsSnapshot = await getDocs(questsQuery);

            if (questsSnapshot.empty) return [];

            const questsDoc = questsSnapshot.docs[0];
            const questsID = questsDoc.id;

            const questListRef = collection(db, "quest", questsID, "questList");
            const questListSnapshot = await getDocs(questListRef);

            if (questListSnapshot.empty) return [];

            for (const quest of questListSnapshot.docs) {
                eventQuests.push({
                    id: quest.id,
                    ...quest.data(),
                    totalCompleted: 0
                });
            }

            const questTypes = eventQuests.map(quest => quest.questType);

            setQuestExist({
                earlyBird: questTypes.includes("earlyBird"),
                networking: questTypes.includes("networking")
            })

            const questsProgressQuery = query(collection(db, "questProgress"), where("eventID", "==", eventID));
            const questsProgressSnapshot = await getDocs(questsProgressQuery);

            let unsubscribes = [];

            for (const questsProgressDoc of questsProgressSnapshot.docs) {
                const id = questsProgressDoc.id;
                const userQuestProgressRef = collection(db, "questProgress", id, "questProgressList");

                const unsubscribeUserQuestProgress = onSnapshot(userQuestProgressRef, userQuestProgressSnapshot => {
                    for (const userQuestProgress of userQuestProgressSnapshot.docs) {
                        const userQuestData = userQuestProgress.data();
                        const index = eventQuests.findIndex(e => e.id === userQuestData.questID);

                        if (index !== -1 && userQuestData.isCompleted) {
                            const updatedQuest = {
                                ...eventQuests[index],
                                totalCompleted: eventQuests[index].totalCompleted + 1
                            };

                            eventQuests = [
                                ...eventQuests.slice(0, index),
                                updatedQuest,
                                ...eventQuests.slice(index + 1)
                            ];
                        }
                    }

                    setQuests(eventQuests);
                });

                unsubscribes.push(unsubscribeUserQuestProgress);
            }

            return unsubscribes;
        } catch (err) {
            console.error("Error in fetchQuestProgress:", err);
            return [];
        }
    }

    if (isLoading) {
        return (
            <Loader loadingText="Loading event quests..." />
        )
    }

    return (
        <Box sx={{ px: 1, minHeight: '100vh' }}>
            <Paper
                elevation={0}
                sx={{
                    pb: 2,
                    mb: 2,
                    borderRadius: 2,
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    justifyContent: 'space-between',
                    alignItems: { xs: 'flex-start', sm: 'center' },
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: 1.5,
                            width: 40,
                            height: 40,
                            mr: 3,
                            background: `linear-gradient(135deg, ${theme.palette.primary.light}, ${theme.palette.primary.main})`,
                            color: 'white',
                        }}
                    >
                        <NumbersOutlinedIcon />
                    </Box>
                    <Typography variant='h5' fontWeight="700" sx={{ lineHeight: 1.5 }}>
                        Overview
                    </Typography>
                </Box>
            </Paper>

            <Grid container spacing={{ xs: 2, lg: 5 }}>
                {quests.map((quest, index) => (
                    <Grid key={quest.id}>
                        <MetricCard
                            title={`Total Participants Completed Quest ${index + 1}`}
                            value={quest.totalCompleted.toLocaleString()}
                            icon={<TaskIcon />}
                            color={theme.palette.primary.main}
                        />
                    </Grid>
                ))}
            </Grid>

            <Box sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                mt: 5
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: 1.5,
                            width: 40,
                            height: 40,
                            mr: 3,
                            background: `linear-gradient(135deg, ${theme.palette.primary.light}, ${theme.palette.primary.main})`,
                            color: 'white',
                        }}
                    >
                        <TaskIcon />
                    </Box>
                    <Typography variant='h5' fontWeight="700" sx={{ lineHeight: 1.1 }}>
                        Event Quest List
                    </Typography>
                </Box>
                <QuestAddButton />
            </Box>

            <Box sx={{ mt: 3 }}>
                {quests.map((quest, index) => (
                    <QuestList key={quest.id} quest={quest} index={index + 1} eventID={eventID} eventName={eventName} />
                ))}
            </Box>
        </Box>
    )
}

export default QuestManager;