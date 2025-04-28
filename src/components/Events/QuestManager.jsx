import React, { useEffect, useState } from 'react';

import { Box, Grid, Paper, Typography, useTheme } from '@mui/material';
import { NumbersOutlined as NumbersOutlinedIcon, Task as TaskIcon } from '@mui/icons-material';

import { db } from '../../utils/firebaseConfig';
import { collection, getDocs, onSnapshot, query, where } from 'firebase/firestore';

import MetricCard from '../General/MetricCard';
import Loader from '../General/Loader';

import QuestList from './Quest/QuestList';
import QuestAddButton from './Quest/QuestAddButton';
import QuestAdditionForm from './Quest/QuestAdditionForm';

const QuestManager = ({ eventID, eventName }) => {
    const [quests, setQuests] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const [questAdditionFormOpen, setQuestAdditionFormOpen] = useState(false);
    const [questExist, setQuestExist] = useState({ earlyBird: false, networking: false });
    const [qaIndex, setQAIndex] = useState(0);

    const theme = useTheme();

    const QUEST_COLOR = {
        "attendance": "rgba(76, 175, 80, 0.7)", // Green
        "earlyBird": "rgba(33, 150, 243, 0.7)", // Blue
        "q&a": "rgba(255, 152, 0, 0.7)", // Orange
        "networking": "rgba(156, 39, 176, 0.7)", // Purple
        "feedback": "rgba(244, 67, 54, 0.7)", // Red
    };

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
            let unsubscribes = [];

            const questsQuery = query(collection(db, "quest"), where("eventID", "==", eventID));
            const questsSnapshot = await getDocs(questsQuery);

            if (questsSnapshot.empty) return [];

            const questsDoc = questsSnapshot.docs[0];
            const questsID = questsDoc.id;

            const questListRef = collection(db, "quest", questsID, "questList");

            const unsubscribeEventQuests = onSnapshot(questListRef, async (questListSnapshot) => {
                setQuests([]);
                let eventQuests = [];
                
                if (questListSnapshot.empty) return [];

                for (const quest of questListSnapshot.docs) {
                    eventQuests.push({
                        id: quest.id,
                        ...quest.data(),
                        totalCompleted: 0
                    });
                }

                const questTypes = eventQuests.map(quest => quest.questType);

                setQuestExist({ earlyBird: questTypes.includes("earlyBird"), networking: questTypes.includes("networking") })
                setQAIndex(questTypes.filter(type => type === "q&a").length);

                const questsProgressQuery = query(collection(db, "questProgress"), where("eventID", "==", eventID));
                const questsProgressSnapshot = await getDocs(questsProgressQuery);

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

                        eventQuests.sort((a, b) => {
                            const order = ["attendance", "earlyBird", "q&a", "networking", "feedback"];
                            const aIndex = order.indexOf(a.questType);
                            const bIndex = order.indexOf(b.questType);
                        
                            if (aIndex !== bIndex) return aIndex - bIndex;
                        
                            // If both are "q&a", sort by the number in the title
                            if (a.questType === "q&a" && b.questType === "q&a") {
                                const getNumber = (name) => {
                                    const match = name.match(/\[#(\d+)\]/);
                                    return match ? parseInt(match[1], 10) : 0;
                                };
                                return getNumber(a.questName) - getNumber(b.questName);
                            }
                        
                            return 0; // keep original order if not specifically sorted
                        });                        

                        setQuests(eventQuests);
                    });

                    unsubscribes.push(unsubscribeUserQuestProgress);
                }
                unsubscribes.push(unsubscribeEventQuests);
            })

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
        <Box sx={{ px: 1, py: 2.5 }}>
            <Paper
                elevation={0}
                sx={{
                    pb: 1.5,
                    mb: 1.5,
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
                            borderRadius: 2,
                            width: 30,
                            height: 30,
                            mr: 2,
                            background: `linear-gradient(135deg, ${theme.palette.primary.light}, ${theme.palette.primary.main})`,
                            color: 'white',
                            boxShadow: '0 4px 10px rgba(0, 0, 0, 0.15)',
                        }}
                    >
                        <NumbersOutlinedIcon fontSize="small" />
                    </Box>
                    <Typography variant='h5' fontWeight="700" sx={{ lineHeight: 1.5, fontSize: "18px" }}>
                        Overview
                    </Typography>
                </Box>
            </Paper>

            <Grid container spacing={{ xs: 2 }}>
                {quests.map(quest => (
                    <Grid key={quest.id}>
                        <MetricCard
                            title={"Number of Participants Completed"}
                            subtitle={quest.questName}
                            value={quest.totalCompleted.toLocaleString()}
                            icon={<TaskIcon />}
                            color={QUEST_COLOR[quest.questType]}
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
                            borderRadius: 2,
                            width: 30,
                            height: 30,
                            mr: 2,
                            background: `linear-gradient(135deg, ${theme.palette.primary.light}, ${theme.palette.primary.main})`,
                            color: 'white',
                            boxShadow: '0 4px 10px rgba(0, 0, 0, 0.15)',
                        }}
                    >
                        <TaskIcon fontSize="small" />
                    </Box>
                    <Typography variant='h5' fontWeight="700" sx={{ lineHeight: 1.5, fontSize: "18px" }}>
                        Event Quest List
                    </Typography>
                </Box>
                <QuestAddButton handleFormOpen={() => setQuestAdditionFormOpen(true)} />
            </Box>

            <QuestAdditionForm questAdditionFormOpen={questAdditionFormOpen} setQuestAdditionFormOpen={setQuestAdditionFormOpen} questExist={questExist} qaIndex={qaIndex} eventID={eventID} />

            <Box sx={{ mt: 3 }}>
                {quests.map((quest, index) => (
                    <QuestList key={quest.id} quest={quest} index={index + 1} eventID={eventID} eventName={eventName} />
                ))}
            </Box>
        </Box>
    )
}

export default QuestManager;