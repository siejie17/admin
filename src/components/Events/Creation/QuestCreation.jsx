import React, { useState } from 'react';
import { Box, Button, Grid, Paper, Stack, Typography, useTheme } from '@mui/material';
import { NumbersOutlined as NumbersOutlinedIcon, SportsEsports as SportsEsportsIcon, Task as TaskIcon, NoteAdd as NoteAddIcon } from '@mui/icons-material';

import QuestCreationForm from './QuestCreationForm';
import MetricCard from '../../General/MetricCard';
import AddButton from '../../General/AddButton';
import QuestList from './QuestList';

const QuestCreation = ({
    attendanceQuest,
    earlyBirdQuest,
    setEarlyBirdQuest,
    questionAnswerQuest,
    setQuestionAnswerQuest,
    networkingQuest,
    setNetworkingQuest,
    feedbackQuest,
    questErrors,
    setQuestErrors,
    handleEventCreation,
    handleBack
}) => {
    const theme = useTheme();

    const [questCreationFormOpen, setQuestCreationFormOpen] = useState(false);

    const QUEST_COLOR = {
        "attendance": "rgba(76, 175, 80, 0.7)", // Green
        "earlyBird": "rgba(33, 150, 243, 0.7)", // Blue
        "q&a": "rgba(255, 152, 0, 0.7)", // Orange
        "networking": "rgba(156, 39, 176, 0.7)", // Purple
        "feedback": "rgba(244, 67, 54, 0.7)", // Red
    };

    return (
        <Box sx={{ pt: 1.5, px: 1.5 }}>
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
                <Grid key="attendance">
                    <MetricCard
                        title={"Total Number of"}
                        subtitle={"Attendance Quest"}
                        value={Object.keys(attendanceQuest).length === 0 ? 0 : 1}
                        icon={<TaskIcon />}
                        color={QUEST_COLOR["attendance"]}
                    />
                </Grid>
                <Grid key="earlyBird">
                    <MetricCard
                        title={"Total Number of"}
                        subtitle={"Early Bird Attendance Quest"}
                        value={Object.keys(earlyBirdQuest).length === 0 ? 0 : 1}
                        icon={<TaskIcon />}
                        color={QUEST_COLOR["earlyBird"]}
                    />
                </Grid>
                <Grid key="networking">
                    <MetricCard
                        title={"Total Number of"}
                        subtitle={"Networking Quest"}
                        value={Object.keys(networkingQuest).length === 0 ? 0 : 1}
                        icon={<TaskIcon />}
                        color={QUEST_COLOR["networking"]}
                    />
                </Grid>
                <Grid key="q&a">
                    <MetricCard
                        title={"Total Number of"}
                        subtitle={"Question & Answer Quest"}
                        value={questionAnswerQuest.length}
                        icon={<TaskIcon />}
                        color={QUEST_COLOR["q&a"]}
                    />
                </Grid>
                <Grid key="feedback">
                    <MetricCard
                        title={"Total Number of"}
                        subtitle={"Feedback-Driven Quest"}
                        value={Object.keys(feedbackQuest).length === 0 ? 0 : 1}
                        icon={<TaskIcon />}
                        color={QUEST_COLOR["feedback"]}
                    />
                </Grid>
            </Grid>

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pt: 4 }}>
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
                        <SportsEsportsIcon fontSize="small" />
                    </Box>
                    <Typography variant='h5' fontWeight="700" sx={{ lineHeight: 1.5, fontSize: "18px" }}>
                        Current Quests List
                    </Typography>
                </Box>
                <AddButton title="Add New Quest" addFunction={() => setQuestCreationFormOpen(true)} />
            </Box>

            {/* Quest Creation Form */}
            <QuestCreationForm
                questCreationFormOpen={questCreationFormOpen}
                setQuestCreationFormOpen={setQuestCreationFormOpen}
                earlyBirdQuest={earlyBirdQuest}
                setEarlyBirdQuest={setEarlyBirdQuest}
                questionAnswerQuest={questionAnswerQuest}
                setQuestionAnswerQuest={setQuestionAnswerQuest}
                networkingQuest={networkingQuest}
                setNetworkingQuest={setNetworkingQuest}
                questErrors={questErrors}
                setQuestErrors={setQuestErrors}
            />

            {/* Quest List */}
            <Box sx={{ py: 5 }}>
                <QuestList
                    attendanceQuest={attendanceQuest}
                    earlyBirdQuest={earlyBirdQuest} setEarlyBirdQuest={setEarlyBirdQuest}
                    questionAnswerQuest={questionAnswerQuest} setQuestionAnswerQuest={setQuestionAnswerQuest}
                    networkingQuest={networkingQuest} setNetworkingQuest={setNetworkingQuest}
                    feedbackQuest={feedbackQuest}
                />
            </Box>

            {/* Bottom Navigation Bar */}
            <Box
                sx={{
                    position: 'fixed',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    padding: '12px',
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(8px)',
                    borderTop: '1px solid rgba(0, 0, 0, 0.1)',
                    display: 'flex',
                    justifyContent: 'flex-end',
                    alignItems: 'center',
                    zIndex: 100,
                    boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.05)',
                    transition: 'transform 0.3s ease-in-out',
                }}
            >
                <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    spacing={1.5}
                    paddingRight={3}
                >
                    <Button
                        onClick={handleBack}
                        variant="outlined"
                        color="inherit"
                        sx={{
                            borderRadius: 2,
                            py: 1,
                            px: 2,
                            fontWeight: 600,
                            fontSize: "12px",
                            textTransform: 'none',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                                backgroundColor: '#1565c0',
                                transform: 'translateY(-2px)',
                                boxShadow: '0 4px 8px rgba(21, 101, 192, 0.3)'
                            },
                            '&:disabled': {
                                backgroundColor: '#e0e0e0',
                                color: '#9e9e9e'
                            }
                        }}
                    >
                        Back
                    </Button>
                    <Button
                        onClick={handleEventCreation}
                        startIcon={<NoteAddIcon />}
                        variant="contained"
                        color="primary"
                        sx={{
                            borderRadius: 2,
                            py: 1,
                            px: 2,
                            fontWeight: 600,
                            fontSize: "12px",
                            textTransform: 'none',
                            backgroundColor: '#1976d2',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                                backgroundColor: '#1565c0',
                                transform: 'translateY(-2px)',
                                boxShadow: '0 4px 8px rgba(21, 101, 192, 0.3)'
                            },
                            '&:disabled': {
                                backgroundColor: '#e0e0e0',
                                color: '#9e9e9e'
                            }
                        }}
                    >
                        Create Event
                    </Button>
                </Stack>
            </Box>
        </Box>
    );
};

export default QuestCreation;