import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Typography,
    FormControl,
    Select,
    MenuItem,
    TextField,
    InputAdornment
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import GroupsIcon from '@mui/icons-material/Groups';
import ConnectWithoutContactIcon from '@mui/icons-material/ConnectWithoutContact';
import Diamond from '../../assets/icons/diamond.png';
import Point from '../../assets/icons/point.png';
import RequiredAsterisk from '../General/RequiredAsterisk';

const QuestCreationForm = ({
    questCreationFormOpen, setQuestCreationFormOpen,
    earlyBirdQuest, setEarlyBirdQuest,
    questionAnswerQuest, setQuestionAnswerQuest,
    networkingQuest, setNetworkingQuest,
    questErrors, setQuestErrors
}) => {
    // General Fields
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState('');
    const [pointsRewards, setPointsRewards] = useState(null);
    const [diamondsRewards, setDiamondsRewards] = useState(null);

    // Quest-specific Fields
    const [maxEarlyBird, setMaxEarlyBird] = useState(null);
    const [question, setQuestion] = useState('');
    const [correctAnswer, setCorrectAnswer] = useState('');
    const [requiredNetwork, setRequiredNetwork] = useState(0);

    // Check if quest types have data (completed)
    const hasEarlyBirdQuestData = earlyBirdQuest && Object.keys(earlyBirdQuest).length > 0;
    const hasNetworkingQuestData = networkingQuest && Object.keys(networkingQuest).length > 0;

    // Reset type when form opens
    useEffect(() => {
        if (questCreationFormOpen) {
            setType('');
            setName('');
            setDescription('');
            setMaxEarlyBird(null);
            setQuestion('');
            setCorrectAnswer('');
            setRequiredNetwork(0);
            setPointsRewards(null);
            setDiamondsRewards(null);
        }
    }, [questCreationFormOpen]);

    const handleChangedType = (e) => {
        const questType = e.target.value;
        setType(questType);

        if (questType === "Early Bird Attendance Quest") {
            setName("Let's Go, Early Bird Warrior!");
            setDescription("Want to be one of the first to earn extra rewards? Be quick! This quest is tied to the main attendance quest — just show up early, scan the event's QR code, and make sure you're within 150m of the event location. Only the first few attendees who successfully check in will unlock this bonus, so don't be late!");
        } else if (questType === "Question & Answer (Q&A) Quest") {
            setName(`Crack the Question! [#${questionAnswerQuest.length + 1}]`);
            setDescription("Ready to put your brain to the test? Just answer the event question correctly to complete this quest and earn your reward. One right answer is all it takes — so read carefully and give it your best shot!");
        } else if (questType === "Networking Quest") {
            setName("Connect & Conquer!")
            setDescription("Ready to expand your network? During this event, make meaningful connections by scanning the QR codes of fellow attendees. Just remember: no repeats! Complete this quest by scanning the required number of unique attendees’ QR codes, and watch your network grow while earning rewards along the way!")
        } else {
            console.error("Something went wrong when handling type changes");
        }
    }

    const handleClose = () => {
        setType('');
        setQuestCreationFormOpen(false);
    };

    const handleCreate = (e) => {
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
                    setEarlyBirdQuest(questData);
                    break;
                case "Question & Answer (Q&A) Quest":
                    questData.completionNum = 1;
                    questData.question = question;
                    questData.correctAnswer = correctAnswer;
                    setQuestionAnswerQuest([...questionAnswerQuest, questData]);
                    break;
                case "Networking Quest":
                    questData.completionNum = Number(requiredNetwork);
                    setNetworkingQuest(questData);
                    break;
            }

            handleClose();
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
            open={questCreationFormOpen}
            disableEscapeKeyDown
            onClose={() => { }}
            fullWidth
            maxWidth="lg"
        >
            <DialogTitle>Quest Creation Form</DialogTitle>
            <DialogContent sx={{ mt: 2 }}>
                <Box>
                    <Box sx={{ width: '100%', mb: 2 }}>
                        <Typography variant="h6" sx={{ fontWeight: 550 }}>
                            Quest Type <RequiredAsterisk />
                        </Typography>
                    </Box>

                    {/* Category Field - Full width row */}
                    <Box sx={{ mb: 2 }}>
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
                                {!hasEarlyBirdQuestData && (
                                    <MenuItem value="Early Bird Attendance Quest">Early Bird Attendance Quest</MenuItem>
                                )}
                                <MenuItem value="Question & Answer (Q&A) Quest">Question & Answer (Q&A) Quest</MenuItem>
                                {!hasNetworkingQuestData && (
                                    <MenuItem value="Networking Quest">Networking Quest</MenuItem>
                                )}
                            </Select>
                        </FormControl>
                    </Box>

                    {type === "Early Bird Attendance Quest" && (
                        <>
                            <Box sx={{ width: '100%', mb: 2 }}>
                                <Typography variant="h6" sx={{ fontWeight: 550 }}>
                                    Quest Name
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Predefined name based on the quest type
                                </Typography>
                            </Box>

                            {/* Name Field - Full width row */}
                            <Box sx={{ width: '100%', mb: 3 }}>
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

                            <Box sx={{ width: '100%', mb: 2 }}>
                                <Typography variant="h6" sx={{ fontWeight: 550 }}>
                                    Quest Description
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Predefined description based on the quest type
                                </Typography>
                            </Box>

                            {/* Description Field - Full width row */}
                            <Box sx={{ width: '100%', mb: 3 }}>
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

                            <Box sx={{ width: '100%', mb: 2 }}>
                                <Typography variant="h6" sx={{ fontWeight: 550 }}>
                                    Maximum Early Bird Attendees <RequiredAsterisk />
                                </Typography>
                            </Box>

                            <Box sx={{ width: '100%', mb: 3 }}>
                                <TextField
                                    fullWidth
                                    placeholder="Set the limit for how many early bird attendees can receive a reward"
                                    value={maxEarlyBird}
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

                            <Box sx={{ width: '100%', mb: 2 }}>
                                <Typography variant="h6" sx={{ fontWeight: 550 }}>
                                    Point Rewards <RequiredAsterisk />
                                </Typography>
                            </Box>

                            <Box sx={{ width: '100%', mb: 3 }}>
                                <TextField
                                    fullWidth
                                    placeholder="Enter the number of leaderboard points to award for this task"
                                    value={pointsRewards}
                                    onChange={(e) => setPointsRewards(e.target.value.replace(/[^0-9]/g, ''))}
                                    error={!!questErrors.pointsRewards}
                                    helperText={questErrors.pointsRewards}
                                    type="number"
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start" sx={{ marginRight: 2 }}>
                                                <img src={Point} style={{ height: 24, width: 24 }} />
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

                            <Box sx={{ width: '100%', mb: 2 }}>
                                <Typography variant="h6" sx={{ fontWeight: 550 }}>
                                    Diamonds Rewards <RequiredAsterisk />
                                </Typography>
                            </Box>

                            <Box sx={{ width: '100%', mb: 3 }}>
                                <TextField
                                    fullWidth
                                    placeholder="Enter the number of diamonds to award for completing this task"
                                    value={diamondsRewards}
                                    onChange={(e) => setDiamondsRewards(e.target.value.replace(/[^0-9]/g, ''))}
                                    error={!!questErrors.diamondsRewards}
                                    helperText={questErrors.diamondsRewards}
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
                        </>
                    )}

                    {type === "Question & Answer (Q&A) Quest" && (
                        <>
                            <Box sx={{ width: '100%', mb: 2 }}>
                                <Typography variant="h6" sx={{ fontWeight: 550 }}>
                                    Event Name
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Predefined name based on the quest type
                                </Typography>
                            </Box>

                            {/* Name Field - Full width row */}
                            <Box sx={{ width: '100%', mb: 3 }}>
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

                            <Box sx={{ width: '100%', mb: 2 }}>
                                <Typography variant="h6" sx={{ fontWeight: 550 }}>
                                    Quest Description
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Predefined description based on the quest type
                                </Typography>
                            </Box>

                            {/* Description Field - Full width row */}
                            <Box sx={{ width: '100%', mb: 3 }}>
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

                            <Box sx={{ width: '100%', mb: 2 }}>
                                <Typography variant="h6" sx={{ fontWeight: 550 }}>
                                    Question <RequiredAsterisk />
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Feel free to add a hint after the question to keep it simple and helpful!
                                </Typography>
                            </Box>

                            <Box sx={{ width: '100%', mb: 3 }}>
                                <TextField
                                    fullWidth
                                    placeholder='Type your question here...'
                                    value={question}
                                    onChange={(e) => setQuestion(e.target.value)}
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

                            <Box sx={{ width: '100%', mb: 2 }}>
                                <Typography variant="h6" sx={{ fontWeight: 550 }}>
                                    Answer <RequiredAsterisk />
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Let's keep it simple! Please provide your answer in just a few words.
                                </Typography>
                            </Box>

                            <Box sx={{ width: '100%', mb: 3 }}>
                                <TextField
                                    fullWidth
                                    placeholder='Type the correct answer here...'
                                    value={correctAnswer}
                                    onChange={(e) => setCorrectAnswer(e.target.value)}
                                    required
                                    variant="outlined"
                                    InputProps={{
                                        sx: {
                                            borderRadius: 2,
                                        }
                                    }}
                                />
                            </Box>

                            <Box sx={{ width: '100%', mb: 2 }}>
                                <Typography variant="h6" sx={{ fontWeight: 550 }}>
                                    Point Rewards <RequiredAsterisk />
                                </Typography>
                            </Box>

                            <Box sx={{ width: '100%', mb: 3 }}>
                                <TextField
                                    fullWidth
                                    placeholder="Enter the number of leaderboard points to award for this task"
                                    value={pointsRewards}
                                    onChange={(e) => setPointsRewards(e.target.value.replace(/[^0-9]/g, ''))}
                                    error={!!questErrors.pointsRewards}
                                    helperText={questErrors.pointsRewards}
                                    type="number"
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start" sx={{ marginRight: 2 }}>
                                                <img src={Point} style={{ height: 24, width: 24 }} />
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

                            <Box sx={{ width: '100%', mb: 2 }}>
                                <Typography variant="h6" sx={{ fontWeight: 550 }}>
                                    Diamonds Rewards <RequiredAsterisk />
                                </Typography>
                            </Box>

                            <Box sx={{ width: '100%', mb: 3 }}>
                                <TextField
                                    fullWidth
                                    placeholder="Enter the number of diamonds to award for completing this task"
                                    value={diamondsRewards}
                                    onChange={(e) => setDiamondsRewards(e.target.value.replace(/[^0-9]/g, ''))}
                                    error={!!questErrors.diamondsRewards}
                                    helperText={questErrors.diamondsRewards}
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
                        </>
                    )}

                    {type === "Networking Quest" && (
                        <>
                            <Box sx={{ width: '100%', mb: 2 }}>
                                <Typography variant="h6" sx={{ fontWeight: 550 }}>
                                    Quest Name
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Predefined name based on the quest type
                                </Typography>
                            </Box>

                            {/* Name Field - Full width row */}
                            <Box sx={{ width: '100%', mb: 3 }}>
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

                            <Box sx={{ width: '100%', mb: 2 }}>
                                <Typography variant="h6" sx={{ fontWeight: 550 }}>
                                    Quest Description
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Predefined description based on the quest type
                                </Typography>
                            </Box>

                            {/* Description Field - Full width row */}
                            <Box sx={{ width: '100%', mb: 3 }}>
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

                            <Box sx={{ width: '100%', mb: 2 }}>
                                <Typography variant="h6" sx={{ fontWeight: 550 }}>
                                    Number of Connections to Make <RequiredAsterisk />
                                </Typography>
                            </Box>

                            <Box sx={{ width: '100%', mb: 3 }}>
                                <TextField
                                    fullWidth
                                    placeholder="Input the connections needed for rewards"
                                    value={requiredNetwork}
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

                            <Box sx={{ width: '100%', mb: 2 }}>
                                <Typography variant="h6" sx={{ fontWeight: 550 }}>
                                    Point Rewards <RequiredAsterisk />
                                </Typography>
                            </Box>

                            <Box sx={{ width: '100%', mb: 3 }}>
                                <TextField
                                    fullWidth
                                    placeholder="Enter the number of leaderboard points to award for this task"
                                    value={pointsRewards}
                                    onChange={(e) => setPointsRewards(e.target.value.replace(/[^0-9]/g, ''))}
                                    error={!!questErrors.pointsRewards}
                                    helperText={questErrors.pointsRewards}
                                    type="number"
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start" sx={{ marginRight: 2 }}>
                                                <img src={Point} style={{ height: 24, width: 24 }} />
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

                            <Box sx={{ width: '100%', mb: 2 }}>
                                <Typography variant="h6" sx={{ fontWeight: 550 }}>
                                    Diamonds Rewards <RequiredAsterisk />
                                </Typography>
                            </Box>

                            {/* Diamonds Needed Field - Full width row */}
                            <Box sx={{ width: '100%', mb: 3 }}>
                                <TextField
                                    fullWidth
                                    placeholder="Enter the number of diamonds to award for completing this task"
                                    value={diamondsRewards}
                                    onChange={(e) => setDiamondsRewards(e.target.value.replace(/[^0-9]/g, ''))}
                                    error={!!questErrors.diamondsRewards}
                                    helperText={questErrors.diamondsRewards}
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
                        </>
                    )}
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => setQuestCreationFormOpen(false)}>Cancel</Button>
                <Button
                    variant="contained"
                    color="primary"
                    disabled={!type}
                    onClick={handleCreate}
                >
                    Create
                </Button>
            </DialogActions>
        </Dialog>
    )
}

export default QuestCreationForm