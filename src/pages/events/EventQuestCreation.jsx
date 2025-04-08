import React, { useState } from 'react';
import { Box, Button, Stack, Typography, Divider, Container, alpha } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import QuestCreationForm from '../../components/Events/QuestCreationForm';
import QuestCardReviewList from '../../components/Events/QuestCardReviewList';

const EventQuestCreation = ({
    attendanceQuest, setAttendanceQuest,
    earlyBirdQuest, setEarlyBirdQuest,
    questionAnswerQuest, setQuestionAnswerQuest,
    networkingQuest, setNetworkingQuest,
    feedbackQuest, setFeedbackQuest,
    questErrors, setQuestErrors,
    handleEventCreation, handleBack
}) => {
    const [questCreationFormOpen, setQuestCreationFormOpen] = useState(false);

    return (
        <Box sx={{ px: 2 }}>
            {/* Header Section */}
            <Box sx={{
                width: '100%',
                mb: 4,
                display: 'flex',
                alignItems: 'center',
                py: 1,
                borderBottom: '2px solid',
                borderColor: "rgba(169, 169, 169, 0.3)"
            }}>
                <EmojiEventsIcon sx={{ fontSize: 24, color: 'text.secondary', mr: 2 }} />
                <Typography variant="h6" sx={{
                    fontWeight: 600,
                    color: 'text.primary',
                }}>
                    Quest Management
                </Typography>
            </Box>

            {/* Add Quest Button */}
            <Box sx={{ width: '100%', mb: 4 }}>
                <Button
                    variant="contained"
                    component="label"
                    startIcon={<AddIcon />}
                    sx={{
                        width: '100%',
                        borderRadius: 3,
                        py: 1.5,
                        px: 3,
                        fontWeight: 600,
                        boxShadow: '0 4px 12px rgba(33,150,243,0.3)',
                        background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                        '&:hover': {
                            background: 'linear-gradient(45deg, #1e88e5 30%, #00b8d4 90%)',
                            boxShadow: '0 6px 14px rgba(33,150,243,0.4)',
                            transform: 'translateY(-2px)',
                            transition: 'all 0.3s ease'
                        },
                        transition: 'all 0.3s ease'
                    }}
                    onClick={() => setQuestCreationFormOpen(true)}
                >
                    Create New Quest
                </Button>
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

            {/* Quest List Section */}
            <Box sx={{
                width: '100%',
                mb: 3,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                pb: 1,
                borderBottom: '2px solid',
                borderColor: "rgba(169, 169, 169, 0.3)"
            }}>
                <Typography variant="h6" sx={{
                    fontWeight: 600,
                    color: 'text.primary',
                }}>
                    Active Quests
                </Typography>
            </Box>

            {/* Quest List */}
            <Box sx={{ mb: 4 }}>
                <QuestCardReviewList
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
                    py: 1.5,
                    backgroundColor: 'white',
                    borderTop: '1px solid rgba(169, 169, 169, 0.5)',
                    display: 'flex',
                    justifyContent: 'flex-end',
                    zIndex: 1100,
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
                            borderRadius: 1.5,
                            py: 1,
                            px: 2.5,
                            borderWidth: 1,
                            '&:hover': {
                                borderWidth: 1,
                                bgcolor: 'rgba(0, 0, 0, 0.04)'
                            }
                        }}
                    >
                        Previous Step
                    </Button>
                    <Button
                        onClick={handleEventCreation}
                        variant="contained"
                        color="primary"
                        sx={{
                            borderRadius: 1.5,
                            py: 1,
                            px: 2.5,
                            fontWeight: 500,
                            boxShadow: '0 2px 8px rgba(33, 150, 243, 0.3)',
                            background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                            '&:hover': {
                                boxShadow: '0 3px 10px rgba(33, 150, 243, 0.4)',
                            }
                        }}
                    >
                        Complete Setup
                    </Button>
                </Stack>
            </Box>
        </Box>
    );
};

export default EventQuestCreation;