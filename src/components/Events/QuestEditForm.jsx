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
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Grid,
    FormHelperText,
    InputAdornment
} from '@mui/material';
import GroupsIcon from '@mui/icons-material/Groups';
import ConnectWithoutContactIcon from '@mui/icons-material/ConnectWithoutContact';
import RequiredAsterisk from '../General/RequiredAsterisk';

import Diamond from '../../assets/icons/diamond.png';
import Point from '../../assets/icons/point.png';

const QuestEditForm = ({ open, onClose, quest, questIndex, onSave }) => {
    // Initialize form state with quest data or defaults
    const [formData, setFormData] = useState({
        questName: '',
        description: '',
        questType: '',
        diamondsRewards: 0,
        pointsRewards: 0,
        // Fields for specific quest types
        maxEarlyBird: 0,      // For earlyBird quest
        question: '',         // For q&a quest
        correctAnswer: '',           // For q&a quest
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
        console.log(quest)
    }, [quest]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: name === 'diamondsRewards' || name === 'pointsRewards' || name === 'maxEarlyBird'
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

    return (
        <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
            <DialogTitle>
                {quest ? `Edit ${quest.questName} Quest` : 'Edit Quest'}
            </DialogTitle>

            <DialogContent>
                <Box sx={{ mt: 1 }}>
                    <Box sx={{ width: '100%', mb: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 550 }}>
                            Quest Name
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Pre-defined name based on quest type (cannot be edited)
                        </Typography>
                    </Box>

                    <TextField
                        fullWidth
                        disabled
                        margin='dense'
                        id='questName'
                        name="questName"
                        value={formData.questName}
                        InputProps={{
                            sx: { mb: 1, borderRadius: 2 }
                        }}
                    />
                </Box>

                <Box sx={{ mb: 1 }}>
                    <Box sx={{ width: '100%', mb: 2 }}>
                        <Typography variant="h6" sx={{ fontWeight: 550 }}>
                            Quest Description
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Pre-defined description based on the quest type (cannot be edited)
                        </Typography>
                    </Box>

                    <TextField
                        fullWidth
                        value={formData.description}
                        disabled
                        multiline
                        rows={3}
                        variant="outlined"
                        InputProps={{
                            sx: { mb: 1, borderRadius: 2 }
                        }}
                    />
                </Box>

                {formData.questType === "earlyBird" && (
                    <Box sx={{ mb: 1 }}>
                        <Box sx={{ width: '100%', mb: 1 }}>
                            <Typography variant="h6" sx={{ fontWeight: 550 }}>
                                Maximum Early Bird Attendees <RequiredAsterisk />
                            </Typography>
                        </Box>

                        <TextField
                            fullWidth
                            placeholder="Set the limit for how many early bird attendees can receive a reward"
                            value={formData.maxEarlyBird}
                            name="maxEarlyBird"
                            onChange={handleChange}
                            error={!!errors.maxEarlyBird}
                            helperText={errors.maxEarlyBird}
                            type="number"
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start" sx={{ marginRight: 2 }}>
                                        <GroupsIcon sx={{ height: 24, width: 24 }} />
                                    </InputAdornment>
                                ),
                                sx: {
                                    borderRadius: 2,
                                    mb: 1,
                                    '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button': {
                                        display: 'none'
                                    },
                                    '& input[type=number]': {
                                        MozAppearance: 'textfield'
                                    },
                                },
                            }}
                            required
                        />
                    </Box>
                )}

                {formData.questType === "q&a" && (
                    <>
                        <Box sx={{ mb: 1 }}>
                            <Box sx={{ width: '100%', mb: 1 }}>
                                <Typography variant="h6" sx={{ fontWeight: 550 }}>
                                    Question <RequiredAsterisk />
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Feel free to add a hint after the question while editing.
                                </Typography>
                            </Box>

                            <TextField
                                fullWidth
                                name='question'
                                placeholder='Type your question here...'
                                value={formData.question}
                                onChange={handleChange}
                                multiline
                                rows={3}
                                variant="outlined"
                                InputProps={{
                                    sx: {
                                        borderRadius: 2,
                                        mb: 1,
                                    }
                                }}
                            />
                        </Box>

                        <Box sx={{ mb: 1 }}>
                            <Box sx={{ width: '100%', mb: 1 }}>
                                <Typography variant="h6" sx={{ fontWeight: 550 }}>
                                    Answer <RequiredAsterisk />
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Let's keep it simple! Please provide your answer in just a few words.
                                </Typography>
                            </Box>

                            <TextField
                                fullWidth
                                name='correctAnswer'
                                placeholder='Type the correct answer here...'
                                value={formData.correctAnswer}
                                onChange={handleChange}
                                required
                                variant="outlined"
                                InputProps={{
                                    sx: {
                                        borderRadius: 2,
                                        mb: 1
                                    }
                                }}
                            />
                        </Box>
                    </>
                )}

                {formData.questType === "networking" && (
                    <>
                        <Box sx={{ width: '100%', mb: 1 }}>
                            <Typography variant="h6" sx={{ fontWeight: 550 }}>
                                Number of Connections to Make <RequiredAsterisk />
                            </Typography>
                        </Box>

                        <TextField
                            fullWidth
                            name='completionNum'
                            placeholder="Input the connections needed for rewards"
                            value={formData.completionNum}
                            onChange={handleChange}
                            error={!!errors.requiredNetwork}
                            helperText={errors.requiredNetwork}
                            type="number"
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start" sx={{ marginRight: 2 }}>
                                        <ConnectWithoutContactIcon sx={{ height: 24, width: 24 }} />
                                    </InputAdornment>
                                ),
                                sx: {
                                    borderRadius: 2,
                                    mb: 1,
                                    '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button': {
                                        display: 'none'
                                    },
                                    '& input[type=number]': {
                                        MozAppearance: 'textfield'
                                    },
                                },
                            }}
                            required
                        />
                    </>
                )}

                <Box sx={{ mb: 1 }}>
                    <Box sx={{ width: '100%', mb: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 550 }}>
                            Point Rewards <RequiredAsterisk />
                        </Typography>
                    </Box>

                    <TextField
                        fullWidth
                        name="pointsRewards"
                        placeholder="Enter the number of leaderboard points to award for this task"
                        value={formData.pointsRewards}
                        onChange={handleChange}
                        error={!!errors.pointsRewards}
                        helperText={errors.pointsRewards}
                        type="number"
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start" sx={{ marginRight: 2 }}>
                                    <img src={Point} style={{ height: 24, width: 24 }} />
                                </InputAdornment>
                            ),
                            sx: {
                                borderRadius: 2,
                                mb: 1,
                                '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button': {
                                    display: 'none'
                                },
                                '& input[type=number]': {
                                    MozAppearance: 'textfield'
                                },
                            },
                        }}
                        required
                    />
                </Box>

                <Box sx={{ mb: 1 }}>
                    <Box sx={{ width: '100%', mb: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 550 }}>
                            Diamonds Rewards <RequiredAsterisk />
                        </Typography>
                    </Box>

                    <TextField
                        fullWidth
                        name="diamondsRewards"
                        placeholder="Enter the number of diamonds to award for completing this task"
                        value={formData.diamondsRewards}
                        onChange={handleChange}
                        error={!!errors.diamondsRewards}
                        helperText={errors.diamondsRewards}
                        type="number"
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start" sx={{ marginRight: 2 }}>
                                    <img src={Diamond} style={{ height: 24, width: 24 }} />
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
                        required
                    />
                </Box>
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button onClick={onClose} color="text.secondary">
                    Cancel
                </Button>
                <Button onClick={handleSubmit} variant="contained" color="primary">
                    Save Changes
                </Button>
            </DialogActions>
        </Dialog>
    )
}

export default QuestEditForm