import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Box,
    Typography,
    InputAdornment,
    Divider,
    Paper,
    Chip,
    Stack
} from '@mui/material';
import {
    AccessTime as AccessTimeIcon,
    ConnectWithoutContact as ConnectWithoutContactIcon,
    EmojiEvents as EmojiEventsIcon,
    Groups as GroupsIcon,
    QuestionAnswer as QuestionAnswerIcon,
    Quiz as QuizIcon,
    TipsAndUpdates as TipsAndUpdatesIcon
} from '@mui/icons-material';

// Assuming these images are available in your assets
import Diamond from '../../../assets/icons/diamond.png';
import Point from '../../../assets/icons/point.png';

const QuestEditForm = ({ open, onClose, quest, questIndex, onSave }) => {
    // Initialize form state with quest data or defaults
    const [formData, setFormData] = useState({
        questName: '',
        description: '',
        questType: '',
        diamondsRewards: 0,
        pointsRewards: 0,
        maxEarlyBird: 0,      // For earlyBird quest
        question: '',         // For q&a quest
        correctAnswer: '',    // For q&a quest
        completionNum: 0      // For networking quest
    });

    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (quest) {
            setFormData({
                ...formData,
                questName: quest.questName || '',
                description: quest.description || '',
                questType: quest.questType || '',
                diamondsRewards: quest.diamondsRewards || 0,
                pointsRewards: quest.pointsRewards || 0,
                ...(quest.questType === 'earlyBird' && { maxEarlyBird: quest.maxEarlyBird || 0 }),
                ...(quest.questType === "q&a" && {
                    question: quest.question || '',
                    correctAnswer: quest.correctAnswer || ''
                }),
                ...(quest.questType === 'networking' && {
                    completionNum: quest.completionNum || 0
                })
            });
        }
    }, [quest]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: name === 'diamondsRewards' || name === 'pointsRewards' ||
                name === 'maxEarlyBird' || name === 'completionNum'
                ? parseInt(value, 10) || 0
                : value
        });

        // Clear error for this field if it exists
        if (errors[name]) {
            setErrors({ ...errors, [name]: null });
        }
    };

    const validate = () => {
        const newErrors = {};

        if (!formData.questName.trim()) {
            newErrors.questName = 'Quest name is required';
        }

        if (!formData.description.trim()) {
            newErrors.description = 'Description is required';
        }

        if (formData.diamondsRewards < 0) {
            newErrors.diamondsRewards = 'Diamonds must be a positive number';
        }

        if (formData.pointsRewards < 0) {
            newErrors.pointsRewards = 'Points must be a positive number';
        }

        // Quest-specific validation
        if (quest.questType === 'earlyBird' && formData.maxEarlyBird <= 0) {
            newErrors.maxEarlyBird = 'Early bird limit must be greater than 0';
        }

        if (quest.questType === 'q&a') {
            if (!formData.question.trim()) {
                newErrors.question = 'Question is required';
            }
            if (!formData.correctAnswer.trim()) {
                newErrors.correctAnswer = 'Answer is required';
            }
        }

        if (quest.questType === 'networking' && formData.completionNum <= 0) {
            newErrors.completionNum = 'Connections must be greater than 0';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        if (validate()) {
            // Create updated quest object
            const updatedQuest = {
                ...quest,
                questName: formData.questName,
                description: formData.description,
                diamondsRewards: formData.diamondsRewards,
                pointsRewards: formData.pointsRewards,
            };

            // Add quest-specific fields
            if (quest.questType === 'earlyBird') {
                updatedQuest.maxEarlyBird = formData.maxEarlyBird;
            } else if (quest.questType === 'q&a') {
                updatedQuest.question = formData.question;
                updatedQuest.correctAnswer = formData.correctAnswer;
            } else if (quest.questType === 'networking') {
                updatedQuest.completionNum = formData.completionNum;
            } else {
                console.error("Something went wrong when submitting changes");
            }

            onSave(updatedQuest, questIndex);
            onClose();
        }
    };

    // Helper function to display quest type icon
    const getQuestTypeIcon = () => {
        switch (formData.questType) {
            case 'earlyBird':
                return <AccessTimeIcon size={24} />;
            case 'q&a':
                return <QuestionAnswerIcon size={24} />;
            case 'networking':
                return <ConnectWithoutContactIcon size={24} />;
            default:
                return <EmojiEventsIcon size={24} />;
        }
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 3,
                    boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
                }
            }}
        >
            <DialogTitle sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'linear-gradient(135deg, #4661c1 0%,rgb(125, 170, 237) 100%)',
                color: 'primary.contrastText',
                py: 2
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    {getQuestTypeIcon()}
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {quest ? `Edit ${quest.questName}` : 'Edit Quest'}
                    </Typography>

                    <Chip
                        label={formData.questType}
                        size="small"
                        color="secondary"
                        sx={{ ml: 1, textTransform: 'capitalize' }}
                    />
                </Box>
            </DialogTitle>

            <DialogContent sx={{ px: 3, pt: 3, pb: 1 }}>
                <Stack spacing={3} pt={2}>
                    {/* Quest Name Section */}
                    <Paper elevation={0} sx={{ bgcolor: 'grey.50', p: 2, borderRadius: 2 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'text.primary', mb: 1 }}>
                            Quest Name
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                            Pre-defined name based on quest type (cannot be edited)
                        </Typography>

                        <TextField
                            fullWidth
                            disabled
                            id='questName'
                            name="questName"
                            value={formData.questName}
                            InputProps={{
                                sx: { borderRadius: 2 }
                            }}
                            size="small"
                        />
                    </Paper>

                    {/* Quest Description */}
                    <Paper elevation={0} sx={{ bgcolor: 'grey.50', p: 2, borderRadius: 2 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'text.primary', mb: 1 }}>
                            Quest Description
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                            Pre-defined description based on the quest type (cannot be edited)
                        </Typography>

                        <TextField
                            fullWidth
                            value={formData.description}
                            disabled
                            multiline
                            rows={4}
                            variant="outlined"
                            InputProps={{
                                sx: { borderRadius: 2 }
                            }}
                            size="small"
                        />
                    </Paper>

                    {/* Quest Type Specific Settings */}
                    {formData.questType && (
                        <Paper elevation={0} sx={{ bgcolor: 'grey.50', p: 2, borderRadius: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                                <TipsAndUpdatesIcon color="primary" sx={{ mr: 1 }} />
                                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'text.primary' }}>
                                    Quest Parameters
                                </Typography>
                            </Box>

                            {formData.questType === "earlyBird" && (
                                <Box sx={{ mt: 2 }}>
                                    <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
                                        Maximum Early Bird Attendees
                                        <Box component="span" sx={{ color: 'error.main', ml: 0.5 }}>*</Box>
                                    </Typography>

                                    <TextField
                                        fullWidth
                                        placeholder="Set the limit for how many early bird attendees can receive a reward"
                                        value={formData.maxEarlyBird}
                                        name="maxEarlyBird"
                                        onChange={handleChange}
                                        error={!!errors.maxEarlyBird}
                                        helperText={errors.maxEarlyBird}
                                        type="number"
                                        size="small"
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <GroupsIcon color="action" />
                                                </InputAdornment>
                                            ),
                                            sx: {
                                                borderRadius: 2,
                                                '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button': {
                                                    display: 'none'
                                                },
                                                '& input[type=number]': {
                                                    MozAppearance: 'textfield'
                                                },
                                            },
                                        }}
                                    />
                                </Box>
                            )}

                            {formData.questType === "q&a" && (
                                <>
                                    <Box sx={{ mt: 2 }}>
                                        <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
                                            Question
                                            <Box component="span" sx={{ color: 'error.main', ml: 0.5 }}>*</Box>
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                                            Feel free to add a hint after the question while editing.
                                        </Typography>

                                        <TextField
                                            fullWidth
                                            name='question'
                                            placeholder='Type your question here...'
                                            value={formData.question}
                                            onChange={handleChange}
                                            error={!!errors.question}
                                            helperText={errors.question}
                                            variant="outlined"
                                            size="small"
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <QuizIcon color="action" sx={{ mr: 1 }} />
                                                    </InputAdornment>
                                                ),
                                                sx: { borderRadius: 2 }
                                            }}
                                        />
                                    </Box>

                                    <Box sx={{ mt: 2 }}>
                                        <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
                                            Answer
                                            <Box component="span" sx={{ color: 'error.main', ml: 0.5 }}>*</Box>
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                                            Let's keep it simple! Please provide your answer in just a few words.
                                        </Typography>

                                        <TextField
                                            fullWidth
                                            name='correctAnswer'
                                            placeholder='Type the correct answer here...'
                                            value={formData.correctAnswer}
                                            onChange={handleChange}
                                            error={!!errors.correctAnswer}
                                            helperText={errors.correctAnswer}
                                            variant="outlined"
                                            size="small"
                                            InputProps={{
                                                sx: { borderRadius: 2 }
                                            }}
                                        />
                                    </Box>
                                </>
                            )}

                            {formData.questType === "networking" && (
                                <Box sx={{ mt: 2 }}>
                                    <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
                                        Number of Connections to Make
                                        <Box component="span" sx={{ color: 'error.main', ml: 0.5 }}>*</Box>
                                    </Typography>

                                    <TextField
                                        fullWidth
                                        name='completionNum'
                                        placeholder="Input the connections needed for rewards"
                                        value={formData.completionNum}
                                        onChange={handleChange}
                                        error={!!errors.completionNum}
                                        helperText={errors.completionNum}
                                        type="number"
                                        size="small"
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <ConnectWithoutContactIcon color="action" />
                                                </InputAdornment>
                                            ),
                                            sx: {
                                                borderRadius: 2,
                                                '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button': {
                                                    display: 'none'
                                                },
                                                '& input[type=number]': {
                                                    MozAppearance: 'textfield'
                                                },
                                            },
                                        }}
                                    />
                                </Box>
                            )}
                        </Paper>
                    )}

                    {/* Rewards Section */}
                    <Paper elevation={0} sx={{ bgcolor: 'grey.50', p: 2, borderRadius: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                            <EmojiEventsIcon color="primary" sx={{ mr: 1 }} />
                            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'text.primary' }}>
                                Rewards
                            </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                            {/* Points */}
                            <Box sx={{ flex: 1, minWidth: '200px' }}>
                                <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
                                    Point Rewards
                                    <Box component="span" sx={{ color: 'error.main', ml: 0.5 }}>*</Box>
                                </Typography>

                                <TextField
                                    fullWidth
                                    name="pointsRewards"
                                    placeholder="Enter points to award"
                                    value={formData.pointsRewards}
                                    onChange={handleChange}
                                    error={!!errors.pointsRewards}
                                    helperText={errors.pointsRewards}
                                    type="number"
                                    size="small"
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                    <img src={Point} alt="Points" style={{ height: 20, width: 20 }} />
                                                </Box>
                                            </InputAdornment>
                                        ),
                                        sx: {
                                            borderRadius: 2,
                                            '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button': {
                                                display: 'none'
                                            },
                                            '& input[type=number]': {
                                                MozAppearance: 'textfield'
                                            },
                                        },
                                    }}
                                />
                            </Box>

                            {/* Diamonds */}
                            <Box sx={{ flex: 1, minWidth: '200px' }}>
                                <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
                                    Diamond Rewards
                                    <Box component="span" sx={{ color: 'error.main', ml: 0.5 }}>*</Box>
                                </Typography>

                                <TextField
                                    fullWidth
                                    name="diamondsRewards"
                                    placeholder="Enter diamonds to award"
                                    value={formData.diamondsRewards}
                                    onChange={handleChange}
                                    error={!!errors.diamondsRewards}
                                    helperText={errors.diamondsRewards}
                                    type="number"
                                    size="small"
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                    <img src={Diamond} alt="Diamonds" style={{ height: 20, width: 20 }} />
                                                </Box>
                                            </InputAdornment>
                                        ),
                                        sx: {
                                            borderRadius: 2,
                                            '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button': {
                                                display: 'none'
                                            },
                                            '& input[type=number]': {
                                                MozAppearance: 'textfield'
                                            },
                                        },
                                    }}
                                />
                            </Box>
                        </Box>
                    </Paper>
                </Stack>
            </DialogContent>

            <Divider sx={{ my: 1 }} />

            <DialogActions sx={{ px: 3, py: 2, justifyContent: 'flex-end', gap: 2 }}>
                <Button
                    onClick={onClose}
                    variant='outlined'
                    color="inherit"
                    sx={{
                        borderRadius: 2,
                        px: 3,
                        textTransform: 'none'
                    }}
                >
                    Cancel
                </Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    color="primary"
                    sx={{
                        borderRadius: 2,
                        px: 3,
                        boxShadow: 2,
                        textTransform: 'none'
                    }}
                >
                    Save Changes
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default QuestEditForm;