import React, { useEffect, useMemo, useState } from 'react';
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Typography,
    TextField,
    InputAdornment,
    Stepper,
    Step,
    StepLabel,
    Paper,
    Chip,
    alpha
} from '@mui/material';
import { 
    ConnectWithoutContact as ConnectWithoutContactIcon, 
    EmojiEvents as EmojiEventsIcon, 
    Groups as GroupsIcon, 
    Quiz as QuizIcon, 
    Star as StarIcon 
} from '@mui/icons-material';

import Diamond from '../../../assets/icons/diamond.png';
import Point from '../../../assets/icons/point.png';
import RequiredAsterisk from '../../General/RequiredAsterisk';

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

    const [activeStep, setActiveStep] = useState(0);

    // Check if quest types have data (completed)
    const hasEarlyBirdQuestData = earlyBirdQuest && Object.keys(earlyBirdQuest).length > 0;
    const hasNetworkingQuestData = networkingQuest && Object.keys(networkingQuest).length > 0;

    const getSteps = () => {
        return ['Quest Type', 'Quest Details', 'Rewards'];
    };

    const steps = getSteps();

    const getTypeIcon = () => {
        switch (type) {
            case "Early Bird Attendance Quest":
                return <StarIcon size={20} />;
            case "Question & Answer (Q&A) Quest":
                return <QuizIcon size={20} />;
            case "Networking Quest":
                return <ConnectWithoutContactIcon size={20} />;
            default:
                return null;
        }
    };

    // Reset type when form opens
    useEffect(() => {
        if (questCreationFormOpen) {
            setMaxEarlyBird(null);
            setQuestion('');
            setCorrectAnswer('');
            setRequiredNetwork(null);
            setPointsRewards(null);
            setDiamondsRewards(null);
        }
    }, [type]);

    useEffect(() => {
        if (questCreationFormOpen) {
            setType('');
            setName('');
            setDescription('');
            setMaxEarlyBird(null);
            setQuestion('');
            setCorrectAnswer('');
            setRequiredNetwork(null);
            setPointsRewards(null);
            setDiamondsRewards(null);
            setActiveStep(0);
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

    const handleNext = () => {
        setActiveStep((prevStep) => prevStep + 1);
    };

    const handleBack = () => {
        setActiveStep((prevStep) => prevStep - 1);
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

    const disabledNextButton = useMemo(() => {
        if (activeStep === 0) {
            return type;
        } else if (activeStep === 1) {
            if (type === "Early Bird Attendance Quest") {
                return maxEarlyBird;
            } else if (type === "Question & Answer (Q&A) Quest") {
                return question && correctAnswer;
            } else {
                return requiredNetwork;
            }
        } else {
            return diamondsRewards && pointsRewards;
        }
    }, [type, maxEarlyBird, question, correctAnswer, requiredNetwork, diamondsRewards, pointsRewards, type, activeStep]);

    return (
        <Dialog
            open={questCreationFormOpen}
            disableEscapeKeyDown
            onClose={() => { }}
            fullWidth
            maxWidth="lg"
            PaperProps={{
                sx: {
                    borderRadius: 3,
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
                    overflow: 'hidden'
                }
            }}
        >
            <DialogTitle sx={{
                px: 3,
                py: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'linear-gradient(135deg, #4661c1 0%,rgb(125, 170, 237) 100%)',
                color: 'white'
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <EmojiEventsIcon size={24} style={{ marginRight: 12 }} />
                    <Typography variant="h6" fontWeight="bold">Create New Quest</Typography>
                </Box>
            </DialogTitle>

            <Box sx={{ px: 3, pt: 3 }}>
                <Stepper activeStep={activeStep} alternativeLabel>
                    {steps.map((label) => (
                        <Step key={label}>
                            <StepLabel>{label}</StepLabel>
                        </Step>
                    ))}
                </Stepper>
            </Box>

            <DialogContent sx={{ mt: 2 }}>
                {activeStep === 0 && (
                    <Box sx={{ mt: 2 }}>
                        <Typography variant="h6" gutterBottom fontWeight="600">
                            Select Quest Type <RequiredAsterisk />
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            Choose the type of quest you want to create for your event attendees
                        </Typography>

                        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                            {!hasEarlyBirdQuestData && (
                                <Paper
                                    elevation={type === "Early Bird Attendance Quest" ? 4 : 1}
                                    onClick={() => handleChangedType({ target: { value: "Early Bird Attendance Quest" } })}
                                    sx={{
                                        p: 2,
                                        borderRadius: 2,
                                        flex: '1 0 30%',
                                        minWidth: '200px',
                                        cursor: 'pointer',
                                        border: type === "Early Bird Attendance Quest" ? '2px solid #4661c1' : '1px solid #e0e0e0',
                                        transition: 'all 0.2s',
                                        '&:hover': {
                                            transform: 'translateY(-2px)',
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                        }
                                    }}
                                >
                                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                width: 50,
                                                height: 50,
                                                mb: 1,
                                                borderRadius: '50%',
                                                backgroundColor: alpha('#4661c1', 0.1)
                                            }}
                                        >
                                            <StarIcon size={24} color="#4661c1" />
                                        </Box>
                                        <Typography variant="subtitle1" fontWeight="600">Early Bird Attendance</Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                            Reward attendees who arrive early to your event
                                        </Typography>
                                    </Box>
                                </Paper>
                            )}

                            <Paper
                                elevation={type === "Question & Answer (Q&A) Quest" ? 4 : 1}
                                onClick={() => handleChangedType({ target: { value: "Question & Answer (Q&A) Quest" } })}
                                sx={{
                                    p: 2,
                                    borderRadius: 2,
                                    flex: '1 0 30%',
                                    minWidth: '200px',
                                    cursor: 'pointer',
                                    border: type === "Question & Answer (Q&A) Quest" ? '2px solid #4661c1' : '1px solid #e0e0e0',
                                    transition: 'all 0.2s',
                                    '&:hover': {
                                        transform: 'translateY(-2px)',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                    }
                                }}
                            >
                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            width: 50,
                                            height: 50,
                                            mb: 1,
                                            borderRadius: '50%',
                                            backgroundColor: alpha('#4661c1', 0.1)
                                        }}
                                    >
                                        <QuizIcon size={24} color="#4661c1" />
                                    </Box>
                                    <Typography variant="subtitle1" fontWeight="600">Q&A Challenge</Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                        Test attendees' knowledge with a question
                                    </Typography>
                                </Box>
                            </Paper>

                            {!hasNetworkingQuestData && (
                                <Paper
                                    elevation={type === "Networking Quest" ? 4 : 1}
                                    onClick={() => handleChangedType({ target: { value: "Networking Quest" } })}
                                    sx={{
                                        p: 2,
                                        borderRadius: 2,
                                        flex: '1 0 30%',
                                        minWidth: '200px',
                                        cursor: 'pointer',
                                        border: type === "Networking Quest" ? '2px solid #4661c1' : '1px solid #e0e0e0',
                                        transition: 'all 0.2s',
                                        '&:hover': {
                                            transform: 'translateY(-2px)',
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                        }
                                    }}
                                >
                                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                width: 50,
                                                height: 50,
                                                mb: 1,
                                                borderRadius: '50%',
                                                backgroundColor: alpha('#4661c1', 0.1)
                                            }}
                                        >
                                            <ConnectWithoutContactIcon size={24} color="#4661c1" />
                                        </Box>
                                        <Typography variant="subtitle1" fontWeight="600">Networking Challenge</Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                            Encourage attendees to make connections
                                        </Typography>
                                    </Box>
                                </Paper>
                            )}
                        </Box>

                        {type && (
                            <Box sx={{ mt: 3, display: 'flex', alignItems: 'center' }}>
                                <Chip
                                    icon={getTypeIcon()}
                                    label={`Selected: ${type}`}
                                    color="primary"
                                    variant="outlined"
                                    sx={{
                                        borderRadius: 2,
                                        px: 1,
                                        fontWeight: 500
                                    }}
                                />
                            </Box>
                        )}
                    </Box>
                )}

                {activeStep === 1 && (
                    <Box sx={{ mt: 2 }}>
                        <Box sx={{ mb: 3 }}>
                            <Typography variant="h6" gutterBottom fontWeight="600">
                                Quest Name
                            </Typography>
                            <TextField
                                fullWidth
                                value={name}
                                disabled
                                required
                                variant="outlined"
                                InputProps={{
                                    sx: {
                                        borderRadius: 2,
                                        fontSize: "13px",
                                        bgcolor: alpha('#f5f5f5', 0.8)
                                    }
                                }}
                            />
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                Predefined name based on the quest type
                            </Typography>
                        </Box>

                        <Box sx={{ mb: 3 }}>
                            <Typography variant="h6" gutterBottom fontWeight="600">
                                Quest Description
                            </Typography>
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
                                        fontSize: "13px",
                                        bgcolor: alpha('#f5f5f5', 0.8)
                                    }
                                }}
                            />
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                Predefined description based on the quest type
                            </Typography>
                        </Box>

                        {type === "Early Bird Attendance Quest" && (
                            <Box sx={{ mb: 3 }}>
                                <Typography variant="h6" gutterBottom fontWeight="600">
                                    Maximum Early Bird Attendees <RequiredAsterisk />
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                    Set the limit for how many early bird attendees can receive rewards
                                </Typography>
                                <TextField
                                    fullWidth
                                    placeholder="Enter a number"
                                    value={maxEarlyBird}
                                    onChange={(e) => setMaxEarlyBird(e.target.value.replace(/[^0-9]/g, ''))}
                                    error={!!questErrors.maxEarlyBird}
                                    helperText={questErrors.maxEarlyBird}
                                    type="number"
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <GroupsIcon size={20} />
                                            </InputAdornment>
                                        ),
                                        sx: {
                                            borderRadius: 2,
                                            fontSize: "13px",
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

                        {type === "Question & Answer (Q&A) Quest" && (
                            <>
                                <Box sx={{ mb: 3 }}>
                                    <Typography variant="h6" gutterBottom fontWeight="600">
                                        Question <RequiredAsterisk />
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                        Feel free to add a hint after the question to keep it simple and helpful!
                                    </Typography>
                                    <TextField
                                        fullWidth
                                        placeholder="Type your question here..."
                                        value={question}
                                        onChange={(e) => setQuestion(e.target.value)}
                                        multiline
                                        rows={3}
                                        variant="outlined"
                                        InputProps={{
                                            sx: {
                                                borderRadius: 2,
                                                fontSize: "13px"
                                            }
                                        }}
                                    />
                                </Box>

                                <Box sx={{ mb: 3 }}>
                                    <Typography variant="h6" gutterBottom fontWeight="600">
                                        Answer <RequiredAsterisk />
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                        Let's keep it simple! Please provide your answer in just a few words.
                                    </Typography>
                                    <TextField
                                        fullWidth
                                        placeholder="Type the correct answer here..."
                                        value={correctAnswer}
                                        onChange={(e) => setCorrectAnswer(e.target.value)}
                                        required
                                        variant="outlined"
                                        InputProps={{
                                            sx: {
                                                borderRadius: 2,
                                                fontSize: "13px"
                                            }
                                        }}
                                    />
                                </Box>
                            </>
                        )}

                        {type === "Networking Quest" && (
                            <Box sx={{ mb: 3 }}>
                                <Typography variant="h6" gutterBottom fontWeight="600">
                                    Number of Connections to Make <RequiredAsterisk />
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                    Input the minimum connections needed for rewards
                                </Typography>
                                <TextField
                                    fullWidth
                                    placeholder="Enter a number"
                                    value={requiredNetwork}
                                    onChange={(e) => setRequiredNetwork(e.target.value.replace(/[^0-9]/g, ''))}
                                    error={!!questErrors.requiredNetwork}
                                    helperText={questErrors.requiredNetwork}
                                    type="number"
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <ConnectWithoutContactIcon size={20} />
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
                        )}
                    </Box>
                )}

                {activeStep === 2 && (
                    <Box sx={{ mt: 2 }}>
                        <Typography variant="h6" gutterBottom fontWeight="600">
                            Set Rewards
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                            Define the rewards participants will receive upon completing this quest
                        </Typography>

                        <Box sx={{
                            display: 'flex',
                            gap: 3,
                            flexDirection: { xs: 'column', sm: 'row' }
                        }}>
                            <Paper
                                elevation={2}
                                sx={{
                                    p: 3,
                                    borderRadius: 3,
                                    flex: 1,
                                    background: 'linear-gradient(135deg, #f5f5f5 0%, #ffffff 100%)'
                                }}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            width: 40,
                                            height: 40,
                                            mr: 2,
                                            borderRadius: '50%',
                                            backgroundColor: alpha('#4CAF50', 0.1)
                                        }}
                                    >
                                        <img src={Point} style={{ height: 20, width: 20 }} />
                                    </Box>
                                    <Typography variant="h6" fontWeight="600">Points</Typography>
                                </Box>
                                <TextField
                                    fullWidth
                                    placeholder="Enter points amount"
                                    value={pointsRewards}
                                    onChange={(e) => setPointsRewards(e.target.value.replace(/[^0-9]/g, ''))}
                                    error={!!questErrors.pointsRewards}
                                    helperText={questErrors.pointsRewards || "Leaderboard points to award"}
                                    type="number"
                                    required
                                    InputProps={{
                                        sx: {
                                            borderRadius: 2,
                                            fontSize: "13px",
                                            '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button': {
                                                display: 'none'
                                            },
                                            '& input[type=number]': {
                                                MozAppearance: 'textfield'
                                            },
                                        },
                                    }}
                                />
                            </Paper>

                            <Paper
                                elevation={2}
                                sx={{
                                    p: 3,
                                    borderRadius: 3,
                                    flex: 1,
                                    background: 'linear-gradient(135deg, #f5f5f5 0%, #ffffff 100%)'
                                }}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            width: 40,
                                            height: 40,
                                            mr: 2,
                                            borderRadius: '50%',
                                            backgroundColor: alpha('#2196F3', 0.1)
                                        }}
                                    >
                                        <img src={Diamond} style={{ height: 20, width: 20 }} />
                                    </Box>
                                    <Typography variant="h6" fontWeight="600">Diamonds</Typography>
                                </Box>
                                <TextField
                                    fullWidth
                                    placeholder="Enter diamonds amount"
                                    value={diamondsRewards}
                                    onChange={(e) => setDiamondsRewards(e.target.value.replace(/[^0-9]/g, ''))}
                                    error={!!questErrors.diamondsRewards}
                                    helperText={questErrors.diamondsRewards || "Diamonds to award for completion"}
                                    type="number"
                                    required
                                    InputProps={{
                                        sx: {
                                            borderRadius: 2,
                                            fontSize: "13px",
                                            '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button': {
                                                display: 'none'
                                            },
                                            '& input[type=number]': {
                                                MozAppearance: 'textfield'
                                            },
                                        },
                                    }}
                                />
                            </Paper>
                        </Box>
                    </Box>
                )}
            </DialogContent>
            <DialogActions sx={{ p: 3, justifyContent: 'space-between' }}>
                {activeStep === 0 ? (
                    <Button
                        onClick={() => setQuestCreationFormOpen(false)}
                        variant="outlined"
                        color="inherit"
                        sx={{
                            textTransform: 'none',
                            '&:disabled': {
                                backgroundColor: '#e0e0e0',
                                color: '#9e9e9e'
                            }
                        }}
                    >
                        Cancel
                    </Button>
                ) : (
                    <Button
                        onClick={handleBack}
                        variant="outlined"
                        color="inherit"
                        sx={{
                            textTransform: 'none',
                            '&:disabled': {
                                backgroundColor: '#e0e0e0',
                                color: '#9e9e9e'
                            }
                        }}
                    >
                        Back
                    </Button>
                )}

                {activeStep === steps.length - 1 ? (
                    <Button
                        variant="contained"
                        color="primary"
                        disabled={!type}
                        onClick={handleCreate}
                        sx={{
                            borderRadius: 2,
                            px: 4,
                            py: 1,
                            textTransform: 'none',
                            background: '#4661c1',
                            boxShadow: '0 4px 10px rgba(70, 82, 193, 0.3)',
                            '&:hover': {
                                boxShadow: '0 6px 15px rgba(70, 82, 193, 0.4)',
                            },
                            '&:disabled': {
                                backgroundColor: '#e0e0e0',
                                color: '#9e9e9e'
                            }
                        }}
                    >
                        Create Quest
                    </Button>
                ) : (
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleNext}
                        disabled={!disabledNextButton}
                        sx={{
                            borderRadius: 2,
                            px: 4,
                            py: 1,
                            textTransform: 'none',
                            background: '#4661c1',
                            boxShadow: '0 4px 10px rgba(70, 82, 193, 0.3)',
                            '&:hover': {
                                boxShadow: '0 6px 15px rgba(70, 82, 193, 0.4)',
                            },
                            '&:disabled': {
                                backgroundColor: '#e0e0e0',
                                color: '#9e9e9e'
                            }
                        }}
                    >
                        Next
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    )
}

export default QuestCreationForm