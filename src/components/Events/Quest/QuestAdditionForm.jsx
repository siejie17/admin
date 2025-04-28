import { Close as CloseIcon, ConnectWithoutContact as ConnectWithoutContactIcon, EmojiEvents as EmojiEventsIcon, Groups as GroupsIcon } from '@mui/icons-material';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Divider, FormControl, Grid, InputAdornment, MenuItem, Select, Stack, TextField, Typography } from '@mui/material';
import React, { useState } from 'react';

import Diamond from '../../../assets/icons/diamond.png';
import Point from '../../../assets/icons/point.png';
import RequiredAsterisk from '../../General/RequiredAsterisk';
import { addDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../../utils/firebaseConfig';

const QuestAdditionForm = ({ questAdditionFormOpen, setQuestAdditionFormOpen, questExist, qaIndex, eventID }) => {
    // General Fields
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState('');
    const [pointsRewards, setPointsRewards] = useState(0);
    const [diamondsRewards, setDiamondsRewards] = useState(0);

    // Quest-specific Fields
    const [maxEarlyBird, setMaxEarlyBird] = useState(0);
    const [question, setQuestion] = useState('');
    const [correctAnswer, setCorrectAnswer] = useState('');
    const [requiredNetwork, setRequiredNetwork] = useState(0);

    const [questErrors, setQuestErrors] = useState({});

    const handleChangedType = (e) => {
        const questType = e.target.value;
        setType(questType);

        if (questType === "Early Bird Attendance Quest") {
            setName("Let's Go, Early Bird Warrior!");
            setDescription("Want to be one of the first to earn extra rewards? Be quick! This quest is tied to the main attendance quest — just show up early, scan the event's QR code, and make sure you're within 150m of the event location. Only the first few attendees who successfully check in will unlock this bonus, so don't be late!");
        } else if (questType === "Question & Answer (Q&A) Quest") {
            setName(`Crack the Question! [#${qaIndex + 1}]`);
            setDescription("Ready to put your brain to the test? Just answer the event question correctly to complete this quest and earn your reward. One right answer is all it takes — so read carefully and give it your best shot!");
        } else if (questType === "Networking Quest") {
            setName("Connect & Conquer!")
            setDescription("Ready to expand your network? During this event, make meaningful connections by scanning the QR codes of fellow attendees. Just remember: no repeats! Complete this quest by scanning the required number of unique attendees’ QR codes, and watch your network grow while earning rewards along the way!")
        } else {
            console.error("Something went wrong when handling type changes");
        }
    }

    const handleClose = () => {
        setName('');
        setDescription('');
        setType('');
        setPointsRewards(null);
        setDiamondsRewards(null);
        setMaxEarlyBird(null);
        setQuestion('');
        setCorrectAnswer('');
        setRequiredNetwork(null);
        setQuestErrors({});
        setQuestAdditionFormOpen(false);
    };

    const handleAdd = async (e) => {
        e.preventDefault();

        const QUEST_TYPES = {
            "Early Bird Attendance Quest": "earlyBird",
            "Question & Answer (Q&A) Quest": "q&a",
            "Networking Quest": "networking",
        };

        // Select validation function based on quest type
        let validationErrors = {};

        switch (type) {
            case "Early Bird Attendance Quest":
                validationErrors = validateEarlyBirdQuest();
                break;
            case "Question & Answer (Q&A) Quest":
                validationErrors = validateQAQuest();
                break;
            case "Networking Quest":
                validationErrors = validateNetworkingQuest();
                break;
            default:
                validationErrors = { type: "Please select a quest type" };
        }

        setQuestErrors(validationErrors);

        // If no errors, proceed with creation
        if (Object.keys(validationErrors).length === 0) {
            // Create the quest object based on type
            const questData = {
                questName: name,
                description,
                questType: QUEST_TYPES[type],
                pointsRewards: Number(pointsRewards),
                diamondsRewards: Number(diamondsRewards)
            };

            switch (type) {
                case "Early Bird Attendance Quest":
                    questData.completionNum = 1;
                    questData.maxEarlyBird = Number(maxEarlyBird);
                    break;
                case "Question & Answer (Q&A) Quest":
                    questData.completionNum = 1;
                    questData.question = question;
                    questData.correctAnswer = correctAnswer;
                    break;
                case "Networking Quest":
                    questData.completionNum = Number(requiredNetwork);
                    break;
            }

            try {
                const eventQuestColQuery = query(collection(db, "quest"), where("eventID", "==", eventID));
                const eventQuestColSnapshot = await getDocs(eventQuestColQuery);

                if (eventQuestColSnapshot.empty) {
                    console.error("Something went wrong when retrieving the event quest collection");
                    return;
                }

                const eventQuestColDoc = eventQuestColSnapshot.docs[0];
                const eventQuestColID = eventQuestColDoc.id;

                const eventQuestListRef = collection(db, "quest", eventQuestColID, "questList");
                const addedEventQuest = await addDoc(eventQuestListRef, questData);

                const addedEventQuestID = addedEventQuest.id;
                const participantsQuestProgressQuery = query(collection(db, "questProgress"), where("eventID", "==", eventID));
                const participantsQuestProgressSnapshot = await getDocs(participantsQuestProgressQuery);
                
                const newlyAddedQuestProgress = {
                    questID: addedEventQuestID,
                    progress: 0,
                    isCompleted: false,
                    rewardsClaimed: false
                };

                for (const participantQuestList of participantsQuestProgressSnapshot.docs) {
                    const participantQuestListID = participantQuestList.id;

                    const questListRef = collection(db, "questProgress", participantQuestListID, "questProgressList");
                    await addDoc(questListRef, newlyAddedQuestProgress);
                }

                handleClose();
            } catch (error) {
                console.error("Error occurred when adding quest:", error);
            }
        }
    }

    const validateEarlyBirdQuest = () => {
        const newErrors = {};

        if (!maxEarlyBird || maxEarlyBird <= 0) {
            newErrors.maxEarlyBird = "Please enter a valid number of early bird attendees";
        }

        return validateCommonFields(newErrors);
    }

    const validateQAQuest = () => {
        const newErrors = {};

        if (!question || question.trim() === '') {
            newErrors.question = "Question is required";
        }

        if (!correctAnswer || correctAnswer.trim() === '') {
            newErrors.correctAnswer = "Answer is required";
        }

        return validateCommonFields(newErrors);
    };

    const validateNetworkingQuest = () => {
        const newErrors = {};

        if (!requiredNetwork || requiredNetwork <= 0) {
            newErrors.requiredNetwork = "Please enter a valid number of connections";
        }

        return validateCommonFields(newErrors);
    };

    // Common validation for all quest types
    const validateCommonFields = (currentErrors) => {
        const newErrors = { ...currentErrors };

        if (!pointsRewards || pointsRewards <= 0) {
            newErrors.pointsRewards = "Please enter a valid point reward";
        }

        if (!diamondsRewards || diamondsRewards <= 0) {
            newErrors.diamondsRewards = "Please enter a valid diamond reward";
        }

        return newErrors;
    };

    return (
        <Dialog
            open={questAdditionFormOpen}
            disableEscapeKeyDown
            onClose={() => { }}
            fullWidth
            maxWidth="lg"
            PaperProps={{
                elevation: 5,
                sx: { borderRadius: 2 }
            }}
        >
            <DialogTitle sx={{
                backgroundColor: 'primary.main',
                color: 'primary.contrastText',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                p: 2
            }}>
                <Box display="flex" alignItems="center">
                    <EmojiEventsIcon sx={{ mr: 1 }} />
                    <Typography variant="h6" component="div">
                        Add New Quest
                    </Typography>
                </Box>
            </DialogTitle>
            <DialogContent sx={{ p: 3, mt: 1 }}>
                <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                    Fill in the details below to add a new quest into the list.
                </Typography>

                <Box sx={{ mt: 2 }}>
                    <Grid container spacing={3}>
                        <Grid sx={{ width: '100%' }}>
                            <Typography variant="h6" sx={{ fontWeight: 600, pb: 1 }}>
                                Quest Type <RequiredAsterisk />
                            </Typography>
                            <FormControl fullWidth required>
                                <Select
                                    displayEmpty
                                    renderValue={(selected) => {
                                        if (selected.length === 0) {
                                            return <div style={{ color: '#a9a9a9' }}>Select a quest type</div>
                                        }

                                        return selected;
                                    }}
                                    value={type}
                                    onChange={handleChangedType}
                                    sx={{ borderRadius: 2 }}
                                >
                                    {!questExist.earlyBird && (
                                        <MenuItem value="Early Bird Attendance Quest">Early Bird Attendance Quest</MenuItem>
                                    )}
                                    <MenuItem value="Question & Answer (Q&A) Quest">Question & Answer (Q&A) Quest</MenuItem>
                                    {!questExist.networking && (
                                        <MenuItem value="Networking Quest">Networking Quest</MenuItem>
                                    )}
                                </Select>
                            </FormControl>
                        </Grid>

                        {type && (
                            <>
                                <Grid width="100%">
                                    <Box sx={{ width: '100%', mb: 1.5 }}>
                                        <Typography variant="h6" sx={{ fontWeight: 550 }}>
                                            Event Name
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Predefined name based on the quest type
                                        </Typography>
                                    </Box>

                                    {/* Name Field - Full width row */}
                                    <Box sx={{ width: '100%' }}>
                                        <TextField
                                            fullWidth
                                            value={name}
                                            disabled
                                            required
                                            variant="outlined"
                                            InputProps={{
                                                sx: { borderRadius: 2 }
                                            }}
                                        />
                                    </Box>
                                </Grid>

                                <Grid sx={{ width: '100%' }}>
                                    <Box sx={{ width: '100%', mb: 1.5 }}>
                                        <Typography variant="h6" sx={{ fontWeight: 550 }}>
                                            Quest Description
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Predefined description based on the quest type
                                        </Typography>
                                    </Box>

                                    {/* Description Field - Full width row */}
                                    <Box sx={{ width: '100%' }}>
                                        <TextField
                                            fullWidth
                                            value={description}
                                            disabled
                                            multiline
                                            rows={3}
                                            variant="outlined"
                                            InputProps={{
                                                sx: {
                                                    borderRadius: 2,
                                                }
                                            }}
                                        />
                                    </Box>
                                </Grid>
                            </>
                        )}

                        {type === "Early Bird Attendance Quest" && (
                            <>
                                <Grid width="100%">
                                    <Box sx={{ width: '100%', mb: 1 }}>
                                        <Typography variant="h6" sx={{ fontWeight: 550 }}>
                                            Maximum Early Bird Attendees <RequiredAsterisk />
                                        </Typography>
                                    </Box>

                                    <Box sx={{ width: '100%', mb: 2 }}>
                                        <TextField
                                            fullWidth
                                            placeholder="Set the limit for how many early bird attendees can receive a reward"
                                            value={maxEarlyBird ? maxEarlyBird : ''}
                                            onChange={(e) => setMaxEarlyBird(e.target.value.replace(/[^0-9]/g, ''))}
                                            error={!!questErrors.maxEarlyBird}
                                            helperText={questErrors.maxEarlyBird}
                                            type="number"
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start" sx={{ marginRight: 2 }}>
                                                        <GroupsIcon sx={{ height: 24, width: 24 }} />
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
                                </Grid>
                            </>
                        )}

                        {type === "Question & Answer (Q&A) Quest" && (
                            <>
                                <Grid sx={{ width: '100%' }}>
                                    <Box sx={{ width: '100%', mb: 1.5 }}>
                                        <Typography variant="h6" sx={{ fontWeight: 550 }}>
                                            Question <RequiredAsterisk />
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Feel free to add a hint after the question to keep it simple and helpful!
                                        </Typography>
                                    </Box>

                                    <Box sx={{ width: '100%' }}>
                                        <TextField
                                            fullWidth
                                            placeholder='Type your question here...'
                                            value={question}
                                            onChange={(e) => setQuestion(e.target.value)}
                                            error={!!questErrors.question}
                                            helperText={questErrors.question}
                                            multiline
                                            rows={3}
                                            variant="outlined"
                                            InputProps={{
                                                sx: {
                                                    borderRadius: 2,
                                                }
                                            }}
                                        />
                                    </Box>
                                </Grid>

                                <Grid sx={{ width: '100%' }}>
                                    <Box sx={{ width: '100%', mb: 1 }}>
                                        <Typography variant="h6" sx={{ fontWeight: 550 }}>
                                            Answer <RequiredAsterisk />
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Let's keep it simple! Please provide your answer in just a few words.
                                        </Typography>
                                    </Box>

                                    <Box sx={{ width: '100%', mb: 2 }}>
                                        <TextField
                                            fullWidth
                                            placeholder='Type the correct answer here...'
                                            value={correctAnswer}
                                            onChange={(e) => setCorrectAnswer(e.target.value)}
                                            error={!!questErrors.correctAnswer}
                                            helperText={questErrors.correctAnswer}
                                            required
                                            variant="outlined"
                                            InputProps={{
                                                sx: {
                                                    borderRadius: 2,
                                                }
                                            }}
                                        />
                                    </Box>
                                </Grid>
                            </>
                        )}

                        {type === "Networking Quest" && (
                            <>
                                <Grid width="100%">
                                    <Box sx={{ width: '100%', mb: 1 }}>
                                        <Typography variant="h6" sx={{ fontWeight: 550 }}>
                                            Number of Connections to Make <RequiredAsterisk />
                                        </Typography>
                                    </Box>

                                    <Box sx={{ width: '100%', mb: 2 }}>
                                        <TextField
                                            fullWidth
                                            placeholder="Input the connections needed for rewards..."
                                            value={requiredNetwork ? requiredNetwork : ''}
                                            onChange={(e) => setRequiredNetwork(e.target.value.replace(/[^0-9]/g, ''))}
                                            error={!!questErrors.requiredNetwork}
                                            helperText={questErrors.requiredNetwork}
                                            type="number"
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start" sx={{ marginRight: 2 }}>
                                                        <ConnectWithoutContactIcon sx={{ height: 24, width: 24 }} />
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
                                </Grid>
                            </>
                        )}

                        {type && (
                            <Box sx={{ mt: 1, mb: 3, width: '100%' }}>
                                <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
                                    Rewards
                                </Typography>
                                <Divider sx={{ mb: 2 }} />

                                {/* Flex container for both rewards */}
                                <Box
                                    sx={{
                                        display: 'flex',
                                        gap: 3,
                                        flexWrap: 'nowrap', // prevents wrapping
                                        flexDirection: { xs: 'column', sm: 'row' }, // stack on small screens
                                    }}
                                >
                                    {/* Points Rewards */}
                                    <Box sx={{ flex: 1 }}>
                                        <Box sx={{ mb: 1.5 }}>
                                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                                Point Rewards <RequiredAsterisk />
                                            </Typography>
                                        </Box>
                                        <TextField
                                            fullWidth
                                            name="pointsRewards"
                                            placeholder="Enter points awarded upon quest completion..."
                                            value={pointsRewards ? pointsRewards : ''}
                                            onChange={(e) => setPointsRewards(e.target.value.replace(/[^0-9]/g, ''))}
                                            error={!!questErrors.pointsRewards}
                                            helperText={questErrors.pointsRewards}
                                            type="number"
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start" sx={{ marginRight: 2 }}>
                                                        <Box
                                                            sx={{
                                                                display: 'flex',
                                                                p: 1,
                                                                borderRadius: 1.5,
                                                                bgcolor: 'rgba(33, 150, 243, 0.1)',
                                                            }}
                                                        >
                                                            <img src={Point} style={{ height: 24, width: 24 }} alt="Points" />
                                                        </Box>
                                                    </InputAdornment>
                                                ),
                                                sx: {
                                                    borderRadius: 2,
                                                    '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button': {
                                                        display: 'none',
                                                    },
                                                    '& input[type=number]': {
                                                        MozAppearance: 'textfield',
                                                    },
                                                },
                                            }}
                                            required
                                        />
                                    </Box>

                                    {/* Diamonds Rewards */}
                                    <Box sx={{ flex: 1 }}>
                                        <Box sx={{ mb: 1.5 }}>
                                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                                Diamonds Rewards <RequiredAsterisk />
                                            </Typography>
                                        </Box>
                                        <TextField
                                            fullWidth
                                            name="diamondsRewards"
                                            placeholder="Enter diamonds awarded upon quest completion..."
                                            value={diamondsRewards ? diamondsRewards : ''}
                                            onChange={(e) => setDiamondsRewards(e.target.value.replace(/[^0-9]/g, ''))}
                                            error={!!questErrors.diamondsRewards}
                                            helperText={questErrors.diamondsRewards}
                                            type="number"
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start" sx={{ marginRight: 2 }}>
                                                        <Box
                                                            sx={{
                                                                display: 'flex',
                                                                p: 1,
                                                                borderRadius: 1.5,
                                                                bgcolor: 'rgba(233, 30, 99, 0.1)',
                                                            }}
                                                        >
                                                            <img src={Diamond} style={{ height: 24, width: 24 }} alt="Diamonds" />
                                                        </Box>
                                                    </InputAdornment>
                                                ),
                                                sx: {
                                                    borderRadius: 2,
                                                    '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button': {
                                                        display: 'none',
                                                    },
                                                    '& input[type=number]': {
                                                        MozAppearance: 'textfield',
                                                    },
                                                },
                                            }}
                                            required
                                        />
                                    </Box>
                                </Box>
                            </Box>
                        )}
                    </Grid>
                </Box>
            </DialogContent>
            <DialogActions sx={{ p: 3, gap: 2, justifyContent: 'flex-end' }}>
                <Button
                    onClick={handleClose}
                    variant="outlined"
                    startIcon={<CloseIcon />}
                >
                    Cancel
                </Button>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleAdd}
                >
                    Create Quest
                </Button>
            </DialogActions>
        </Dialog>
    )
}

export default QuestAdditionForm