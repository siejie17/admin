import { alpha, Box, Button, Card, Chip, Divider, IconButton, InputAdornment, Paper, Tab, Tabs, TextField, Tooltip, Typography, useTheme } from '@mui/material';
import {
    ArrowBack as ArrowBackIcon,
    HelpOutline as HelpOutlineIcon,
    GroupRounded as GroupRoundedIcon,
    QrCode2 as QrCode2Icon,
    SettingsRounded as SettingsRoundedIcon,
    LocationOn as LocationOnIcon,
    Alarm as AlarmIcon,
    Group as GroupIcon,
    QuestionAnswer as QuestionAnswerIcon,
    RateReview as RateReviewIcon,
    AutoMode as AutoModeIcon,
    Lock as LockIcon,
    Save as SaveIcon
} from '@mui/icons-material';
import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import CryptoJS from 'crypto-js';
import { collection, doc, getDoc, getDocs, onSnapshot, query, updateDoc, where } from 'firebase/firestore';

import { db } from '../../../utils/firebaseConfig';

import Loader from '../../General/Loader';
import RequiredAsterisk from '../../General/RequiredAsterisk';

import Diamond from '../../../assets/icons/diamond.png';
import Point from '../../../assets/icons/point.png';
import SnackbarComponent from '../../General/SnackbarComponent';
import QuestProgressTable from './QuestProgressTable';

const QuestDetails = () => {
    const [eventID, setEventID] = useState("");
    const [eventName, setEventName] = useState("");
    const [questID, setQuestID] = useState("");
    const [questName, setQuestName] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    const [questData, setQuestData] = useState({
        questName: '',
        description: '',
        questType: '',
        diamondsRewards: '',
        pointsRewards: '',
        completionNum: ''
    });
    const [formData, setFormData] = useState({
        questName: '',
        description: '',
        questType: '',
        diamondsRewards: '',
        pointsRewards: '',
        completionNum: ''
    });
    const [errors, setErrors] = useState({});
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarContent, setSnackbarContent] = useState({
        msg: '',
        type: ''
    })

    const [activeTab, setActiveTab] = useState(0);
    const [completedProgress, setCompletedProgress] = useState([]);
    const [inProgress, setInProgress] = useState([]);

    const [disabledQuestBool, setDisabledQuestBool] = useState(false);

    const location = useLocation();
    const navigate = useNavigate();

    const theme = useTheme();
    const navigateBackTab = "quests";

    useEffect(() => {
        let unsubscribes = [];
        let unsubscribeAllQuestProgress = [];

        setIsLoading(true);
        setCompletedProgress([]);
        setInProgress([]); // 💡 Clean quest progress before re-fetching

        const getEncryptedEventID = () => {
            const params = new URLSearchParams(location.search);
            return params.get('eventID');
        }

        const getDecryptedQuestID = () => {
            const params = new URLSearchParams(location.search);
            const questID = params.get('questID');
            return CryptoJS.AES.decrypt(questID, "UniEXP_Admin").toString(CryptoJS.enc.Utf8);
        }

        const getQuestName = () => {
            const params = new URLSearchParams(location.search);
            return params.get('questName');
        }

        const getEventName = () => {
            const params = new URLSearchParams(location.search);
            return params.get('eventName');
        }

        const decryptedEventID = getDecryptedEventID();
        const decryptedQuestID = getDecryptedQuestID();

        fetchQuestDetails(decryptedEventID, decryptedQuestID, unsubscribes, unsubscribeAllQuestProgress);

        setEventID(getEncryptedEventID());
        setEventName(getEventName());
        setQuestID(decryptedQuestID);
        setQuestName(getQuestName());

        setIsLoading(false);

        // Cleanup function
        return () => {
            unsubscribes.forEach(unsub => unsub());
            unsubscribeAllQuestProgress.forEach(unsub => unsub());
        };

    }, []);

    const getDecryptedEventID = () => {
        const params = new URLSearchParams(location.search);
        const eventID = params.get('eventID');
        return CryptoJS.AES.decrypt(eventID, "UniEXP_Admin").toString(CryptoJS.enc.Utf8);
    }

    const fetchQuestDetails = async (eventID, questID, unsubscribes, unsubscribeAllQuestProgress) => {
        try {
            const eventQuestQuery = query(collection(db, "quest"), where("eventID", "==", eventID));
            const eventQuestSnapshot = await getDocs(eventQuestQuery);

            const eventQuestDoc = eventQuestSnapshot.docs[0];
            const eventQuestID = eventQuestDoc.id;

            const selectedQuestRef = doc(db, "quest", eventQuestID, "questList", questID);

            const unsubscribeSelectedQuest = onSnapshot(selectedQuestRef, selectedQuestSnap => {
                if (!selectedQuestSnap.exists()) {
                    console.error("Something went wrong when fetching event quest details");
                    return;
                }
                setQuestData(selectedQuestSnap.data());
                setFormData(selectedQuestSnap.data());
            });

            unsubscribes.push(unsubscribeSelectedQuest); // Store unsubscribe function

            const selectedQuestProgressQuery = query(
                collection(db, "questProgress"),
                where("eventID", "==", eventID)
            );
            const selectedQuestProgressSnapshot = await getDocs(selectedQuestProgressQuery);

            for (const questProgress of selectedQuestProgressSnapshot.docs) {
                const questProgressData = questProgress.data();
                const studentID = questProgressData.studentID;

                const studentRef = doc(db, "user", studentID);
                const studentSnap = await getDoc(studentRef);

                if (!studentSnap.exists()) {
                    console.error("Something went wrong when retrieving student information.");
                    return;
                }

                const studentData = studentSnap.data();
                const questProgressID = questProgress.id;

                const questProgressQuery = query(
                    collection(db, "questProgress", questProgressID, "questProgressList"),
                    where("questID", "==", questID)
                );

                const unsubscribeQuestProgress = onSnapshot(questProgressQuery, questProgressSnap => {
                    for (const q of questProgressSnap.docs) {
                        const questData = {
                            id: questProgressID,
                            fullName: studentData.firstName + " " + studentData.lastName,
                            facultyID: studentData.facultyID,
                            profilePicture: studentData.profilePicture,
                            ...q.data()
                        };

                        if (q.data().isCompleted) {
                            setCompletedProgress(prev => {
                                let updated;
                                const isExisting = prev.some(
                                    entry => entry.questID === questData.questID && entry.fullName === questData.fullName
                                );

                                if (isExisting) {
                                    updated = prev.map(entry =>
                                        entry.questID === questData.questID && entry.fullName === questData.fullName
                                            ? { ...entry, rewardsClaimed: questData.rewardsClaimed }
                                            : entry
                                    );
                                } else {
                                    updated = [...prev, questData];
                                }

                                // Assign index as `bil.` here
                                return updated.map((entry, index) => ({ ...entry, bil: index + 1 }));
                            });

                            // Remove from inProgress
                            setInProgress(prev => prev.filter(
                                entry => !(entry.questID === questData.questID && entry.fullName === questData.fullName)
                            ));
                        } else {
                            setInProgress(prev => {
                                let updated;
                                const isExisting = prev.some(
                                    entry => entry.questID === questData.questID && entry.fullName === questData.fullName
                                );

                                if (isExisting) {
                                    updated = prev.map(entry =>
                                        entry.questID === questData.questID && entry.fullName === questData.fullName
                                            ? { ...entry, progress: questData.progress }
                                            : entry
                                    );
                                } else {
                                    updated = [...prev, questData];
                                }

                                // Assign index as `bil.` here
                                return updated.map((entry, index) => ({ ...entry, bil: index + 1 }));
                            });

                            // Remove from completedProgress
                            setCompletedProgress(prev => prev.filter(
                                entry => !(entry.questID === questData.questID && entry.fullName === questData.fullName)
                            ));
                        }
                    }
                });

                unsubscribeAllQuestProgress.push(unsubscribeQuestProgress); // Store listener
            }
        } catch (error) {
            console.error("Error in fetchQuestDetails: ", error);
        }
    };

    useEffect(() => {
        setDisabledQuestBool(questData.questType === "attendance" || questData.questType === "feedback");
    }, [questData.questType]);

    const handleChange = (field, value) => {
        if (field === "diamondsRewards" || field === "pointsRewards" || field === "completionNum") {
            if (value === '' || /^[0-9\b]+$/.test(value)) {
                setFormData(prev => ({
                    ...prev,
                    [field]: Number(value)
                }));
            }
        } else {
            setFormData(prev => ({
                ...prev,
                [field]: value
            }));
        }
    }

    const changedFields = useMemo(() => {
        if (!questData || !formData) return [];

        return Object.keys(formData).filter(key => {
            return formData[key] !== questData[key];
        });
    }, [questData, formData]);

    const hasChanges = useMemo(() => {
        if (!questData || !formData) return false;

        return Object.keys(formData).some(key => {
            return formData[key] !== questData[key];
        });
    }, [questData, formData]);

    const saveChanges = async () => {
        const formErrors = {};

        if (!formData.description) formErrors.description = "Quest description is required.";
        if (Number(formData.pointsRewards) <= 0) formErrors.pointsRewards = "Point rewards must be greater than 0 and not empty.";
        if (Number(formData.diamondsRewards) <= 0) formErrors.diamondsRewards = "Diamond rewards must be greater than 0 and not empty.";
        if (formData.questType === "networking" || formData.questType === "earlyBird") {
            if (Number(formData.completionNum) <= 0) {
                formErrors.completionNum =
                    formData.questType === "networking"
                        ? "Number of connections to make field is required."
                        : "Maximum number of early bird attendees field is required.";
            }
        }
        if (formData.questType === "q&a") {
            if (!formData.question) formErrors.question = "Question is required.";
            if (!formData.correctAnswer) formErrors.correctAnswer = "Answer is required.";
        }

        setErrors(formErrors);

        if (Object.keys(formErrors).length === 0) {
            try {
                const updates = {};
                changedFields.forEach(field => {
                    updates[field] = formData[field];
                });

                if (Object.keys(updates).length > 0) {
                    const questListQuery = query(collection(db, "quest"), where("eventID", "==", getDecryptedEventID()));
                    const questListSnapshot = await getDocs(questListQuery);

                    const questListDoc = questListSnapshot.docs[0];
                    const questListID = questListDoc.id;

                    const selectedQuestRef = doc(db, "quest", questListID, "questList", questID);
                    await updateDoc(selectedQuestRef, updates);

                    setSnackbarOpen(true);
                    setSnackbarContent({
                        msg: 'The quest is edited successfully.',
                        type: 'success'
                    })
                }
            } catch (error) {

            }
        }
    }

    if (isLoading) {
        return (
            <Loader loadingText="Loading quest details" />
        );
    }

    return (
        <Box
            sx={{
                position: 'relative',
                width: '100%',
                height: '100%',
            }}
        >
            <Card
                sx={{
                    borderRadius: { xs: 0, md: 3 },
                    backgroundColor: '#ffffff',
                    width: '100%',
                    height: '100%',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        py: 2.5,
                        px: 3.5,
                        borderBottom: '1px solid rgba(0, 0, 0, 0.06)'
                    }}
                >
                    <Tooltip title={`Back to ${eventName}`} arrow>
                        <IconButton
                            edge="start"
                            onClick={() => navigate(`/event/details?id=${encodeURIComponent(eventID)}&name=${encodeURIComponent(eventName)}&tab=${encodeURIComponent(navigateBackTab)}`)}
                            sx={{
                                mr: 1.5,
                                color: 'text.primary',
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                    bgcolor: 'rgba(25, 118, 210, 0.08)',
                                    transform: 'translateX(-1px)',
                                }
                            }}
                        >
                            <ArrowBackIcon />
                        </IconButton>
                    </Tooltip>
                    <Typography
                        variant="h6"
                        component="h1"
                        sx={{
                            flexGrow: 1,
                            fontWeight: 600,
                            fontSize: { xs: '1.1rem', sm: '1.2rem' }
                        }}
                    >
                        Quest "{questName}"
                    </Typography>
                </Box>

                <Box sx={{
                    px: 4,
                    overflowY: 'auto', // Enable vertical scrolling
                    flexGrow: 1, // Allow the box to grow and take available space
                }}>
                    <Paper
                        elevation={0}
                        sx={{
                            pt: 3,
                            mb: 2,
                            borderRadius: 2,
                            display: 'flex',
                            flexDirection: { xs: 'column', sm: 'row' },
                            justifyContent: 'space-between',
                            alignItems: { xs: 'flex-start', sm: 'center' },
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', zIndex: 1, mb: 1 }}>
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    borderRadius: 2,
                                    width: 42,
                                    height: 42,
                                    mr: 2,
                                    background: `linear-gradient(135deg, ${theme.palette.primary.light}, ${theme.palette.primary.main})`,
                                    color: 'white',
                                    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.15)',
                                }}
                            >
                                <SettingsRoundedIcon fontSize="medium" />
                            </Box>
                            <Typography variant='h5' fontWeight="700" sx={{ lineHeight: 1.5 }}>
                                {(formData.questType === "attendance" || formData.questType == "feedback") ?
                                    "Quest Information - View Mode" : "Quest Information - View/Edit Mode"}
                            </Typography>
                        </Box>
                    </Paper>

                    <Box sx={{ my: 1, px: 1 }}>
                        <Box sx={{
                            width: '100%',
                            mb: 3,
                            pb: 2,
                            borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
                            position: 'relative',
                        }}>
                            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                                Quest Type
                            </Typography>

                            <Box sx={{ display: 'flex', flexDirection: 'column', mb: 1 }}>
                                {(() => {
                                    // Define quest type properties with enhanced styling
                                    const questTypes = {
                                        'attendance': {
                                            icon: <LocationOnIcon fontSize="small" />,
                                            label: 'Attendance',
                                            color: '#4CAF50',//'#2196F3',
                                            gradient: 'linear-gradient(45deg, rgba(76, 175, 80, 0.5), rgba(139, 195, 74, 0.5))'
                                        },
                                        'earlyBird': {
                                            icon: <AlarmIcon fontSize="small" />,
                                            label: 'Early Bird',
                                            color:  '#2196F3',//'#FF9800',
                                            gradient: 'linear-gradient(45deg, rgba(33, 150, 243, 0.5), rgba(33, 203, 243, 0.5))'
                                        },
                                        'networking': {
                                            icon: <GroupIcon fontSize="small" />,
                                            label: 'Networking',
                                            color: '#9C27B0',//'#4CAF50',
                                            gradient: 'linear-gradient(45deg, rgba(156, 39, 176, 0.5), rgba(186, 104, 200, 0.5))'
                                        },
                                        'q&a': {
                                            icon: <QuestionAnswerIcon fontSize="small" />,
                                            label: 'Q&A',
                                            color:  '#FF9800',//'#9C27B0',
                                            gradient: 'linear-gradient(45deg, rgba(255, 152, 0, 0.5), rgba(255, 171, 64, 0.5))'
                                        },
                                        'feedback': {
                                            icon: <RateReviewIcon fontSize="small" />,
                                            label: 'Feedback',
                                            color: '#E91E63',
                                            gradient: 'linear-gradient(45deg, rgba(233, 30, 99, 0.5), rgba(244, 143, 177, 0.5))'
                                        }
                                    };

                                    const type = formData.questType;
                                    const typeProps = questTypes[type] || {
                                        icon: <HelpOutlineIcon fontSize="small" />,
                                        label: 'Unknown',
                                        color: '#757575',
                                        gradient: 'linear-gradient(45deg, #757575, #BDBDBD)'
                                    };

                                    return (
                                        <Chip
                                            icon={typeProps.icon}
                                            label={typeProps.label}
                                            variant="filled"
                                            sx={{
                                                borderRadius: 2,
                                                px: 1.5,
                                                py: 2.5,
                                                fontSize: '0.95rem',
                                                fontWeight: 600,
                                                height: 'auto',
                                                background: typeProps.gradient,
                                                color: 'text.secondary',
                                                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)',
                                                '& .MuiChip-icon': {
                                                    color: 'text.secondary'
                                                }
                                            }}
                                        />
                                    );
                                })()}
                            </Box>

                            <Box sx={{
                                display: 'block',
                                mt: 2,
                                p: 2,
                                bgcolor: 'rgba(0, 0, 0, 0.03)',
                                borderRadius: 2,
                                border: '1px solid rgba(0, 0, 0, 0.06)'
                            }}>
                                <Typography variant="body2" color="text.secondary">
                                    {formData.questType === 'attendance' && '📍 Scan QR code and be within 150m of the location to complete'}
                                    {formData.questType === 'earlyBird' && '⏰ Complete attendance quest within the early birdies range to earn rewards'}
                                    {formData.questType === 'networking' && '👥 Scan unique attendees\' QR codes to progress and complete'}
                                    {formData.questType === 'q&a' && '❓ Answer questions correctly with unlimited attempts to complete'}
                                    {formData.questType === 'feedback' && '📝 Submit feedback form to earn rewards'}
                                </Typography>
                            </Box>
                        </Box>

                        <Box sx={{ width: '100%', mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                Description {(formData.questType !== "attendance" || formData.questType !== "feedback") && <RequiredAsterisk />}
                            </Typography>
                            {disabledQuestBool && (
                                <Chip
                                    size="small"
                                    label="View Only"
                                    icon={<LockIcon fontSize="small" />}
                                    sx={{
                                        bgcolor: 'rgba(0, 0, 0, 0.06)',
                                        borderRadius: 1.5,
                                        '& .MuiChip-label': {
                                            fontWeight: 500
                                        }
                                    }}
                                />
                            )}
                        </Box>

                        <TextField
                            fullWidth
                            name="description"
                            value={formData.description}
                            disabled={disabledQuestBool}
                            onChange={(e) => handleChange("description", e.target.value)}
                            error={!!errors.description}
                            helperText={errors.description}
                            multiline
                            rows={3}
                            variant="outlined"
                            placeholder="Provide a clear description of what this quest involves..."
                            InputProps={{
                                sx: {
                                    mb: 3,
                                    borderRadius: 2,
                                    backgroundColor: disabledQuestBool ? 'rgba(0, 0, 0, 0.02)' : 'white',
                                    boxShadow: disabledQuestBool ? 'none' : '0 2px 8px rgba(0, 0, 0, 0.04) inset',
                                    '& .MuiOutlinedInput-notchedOutline': {
                                        borderColor: 'rgba(0, 0, 0, 0.12)'
                                    }
                                }
                            }}
                        />

                        {formData.questType === "networking" && (
                            <>
                                <Box sx={{ width: '100%', mb: 2 }}>
                                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                        Number of Connections to Make <RequiredAsterisk />
                                    </Typography>
                                </Box>

                                <TextField
                                    fullWidth
                                    name='completionNum'
                                    placeholder="Input the connections needed for rewards"
                                    value={formData.completionNum}
                                    onChange={(e) => handleChange("completionNum", e.target.value)}
                                    error={!!errors.completionNum}
                                    helperText={errors.completionNum}
                                    type="number"
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start" sx={{ marginRight: 1.5 }}>
                                                <Box sx={{
                                                    display: 'flex',
                                                    p: 0.5,
                                                    borderRadius: 1.5,
                                                    bgcolor: 'rgba(156, 39, 176, 0.1)',
                                                }}>
                                                    <GroupRoundedIcon sx={{ height: 18, width: 18, color: '#9C27B0' }} />
                                                </Box>
                                            </InputAdornment>
                                        ),
                                        sx: {
                                            borderRadius: 2,
                                            mb: 3,
                                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04) inset',
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

                        {formData.questType === "earlyBird" && (
                            <>
                                <Box sx={{ width: '100%', mb: 2 }}>
                                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                        Maximum Early Bird Attendees <RequiredAsterisk />
                                    </Typography>
                                </Box>

                                <TextField
                                    fullWidth
                                    name='completionNum'
                                    placeholder="Set the limit for how many early bird attendees can receive a reward"
                                    value={formData.completionNum}
                                    onChange={(e) => handleChange("completionNum", e.target.value)}
                                    error={!!errors.completionNum}
                                    helperText={errors.completionNum}
                                    type="number"
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start" sx={{ marginRight: 1.5 }}>
                                                <Box sx={{
                                                    display: 'flex',
                                                    p: 0.5,
                                                    borderRadius: 1.5,
                                                    bgcolor: 'rgba(33, 150, 243, 0.1)',
                                                }}>
                                                    <QrCode2Icon sx={{ height: 18, width: 18, color: '#2196F3' }} />
                                                </Box>
                                            </InputAdornment>
                                        ),
                                        sx: {
                                            borderRadius: 2,
                                            mb: 3,
                                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04) inset',
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

                        {formData.questType === "q&a" && (
                            <>
                                <Box sx={{ mb: 3, p: 3, bgcolor: 'rgba(156, 39, 176, 0.04)', borderRadius: 3, border: '1px dashed rgba(156, 39, 176, 0.2)' }}>
                                    <Box sx={{ width: '100%', mb: 2 }}>
                                        <Typography variant="h6" sx={{ fontWeight: 600, color: '#9C27B0' }}>
                                            Question <RequiredAsterisk />
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            ❓ Feel free to add a hint after the question while editing.
                                        </Typography>
                                    </Box>

                                    <TextField
                                        fullWidth
                                        name='question'
                                        placeholder='Type your question here...'
                                        value={formData.question}
                                        onChange={(e) => handleChange("question", e.target.value)}
                                        error={!!errors.question}
                                        helperText={errors.question}
                                        multiline
                                        rows={2}
                                        variant="outlined"
                                        InputProps={{
                                            sx: {
                                                borderRadius: 2,
                                                mb: 3,
                                                bgcolor: 'white',
                                                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04) inset',
                                            }
                                        }}
                                    />

                                    <Box sx={{ width: '100%', mb: 2 }}>
                                        <Typography variant="h6" sx={{ fontWeight: 600, color: '#9C27B0' }}>
                                            Answer <RequiredAsterisk />
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            💡 Please provide your answer in just a few words while editing.
                                        </Typography>
                                    </Box>

                                    <TextField
                                        fullWidth
                                        name='correctAnswer'
                                        placeholder='Type the correct answer here...'
                                        value={formData.correctAnswer}
                                        onChange={(e) => handleChange("correctAnswer", e.target.value)}
                                        error={!!errors.correctAnswer}
                                        helperText={errors.correctAnswer}
                                        required
                                        variant="outlined"
                                        InputProps={{
                                            sx: {
                                                borderRadius: 2,
                                                bgcolor: 'white',
                                                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04) inset',
                                            }
                                        }}
                                    />
                                </Box>
                            </>
                        )}

                        <Box sx={{ mt: 4, mb: 3 }}>
                            <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
                                Rewards
                            </Typography>
                            <Divider sx={{ mb: 3 }} />

                            <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                                {/* Points Rewards */}
                                <Box sx={{ flex: '1 1 280px', mb: 3 }}>
                                    <Box sx={{ width: '100%', mb: 1.5 }}>
                                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                            Point Rewards <RequiredAsterisk />
                                        </Typography>
                                    </Box>

                                    <TextField
                                        fullWidth
                                        name="pointsRewards"
                                        placeholder="Enter the number of leaderboard points to award for this task"
                                        disabled={disabledQuestBool}
                                        value={formData.pointsRewards}
                                        onChange={(e) => handleChange("pointsRewards", e.target.value)}
                                        error={!!errors.pointsRewards}
                                        helperText={errors.pointsRewards}
                                        type="number"
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start" sx={{ marginRight: 2 }}>
                                                    <Box sx={{
                                                        display: 'flex',
                                                        p: 1,
                                                        borderRadius: 1.5,
                                                        bgcolor: 'rgba(33, 150, 243, 0.1)',
                                                    }}>
                                                        <img src={Point} style={{ height: 24, width: 24 }} alt="Points" />
                                                    </Box>
                                                </InputAdornment>
                                            ),
                                            sx: {
                                                borderRadius: 2,
                                                boxShadow: disabledQuestBool ? 'none' : '0 2px 8px rgba(0, 0, 0, 0.04) inset',
                                                backgroundColor: disabledQuestBool ? 'rgba(0, 0, 0, 0.02)' : 'white',
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

                                {/* Diamonds Rewards */}
                                <Box sx={{ flex: '1 1 280px', mb: 3 }}>
                                    <Box sx={{ width: '100%', mb: 1.5 }}>
                                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                            Diamonds Rewards <RequiredAsterisk />
                                        </Typography>
                                    </Box>

                                    <TextField
                                        fullWidth
                                        name="diamondsRewards"
                                        placeholder="Enter the number of diamonds to award for completing this task"
                                        disabled={disabledQuestBool}
                                        value={formData.diamondsRewards}
                                        onChange={(e) => handleChange("diamondsRewards", e.target.value)}
                                        error={!!errors.diamondsRewards}
                                        helperText={errors.diamondsRewards}
                                        type="number"
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start" sx={{ marginRight: 2 }}>
                                                    <Box sx={{
                                                        display: 'flex',
                                                        p: 1,
                                                        borderRadius: 1.5,
                                                        bgcolor: 'rgba(233, 30, 99, 0.1)',
                                                    }}>
                                                        <img src={Diamond} style={{ height: 24, width: 24 }} alt="Diamonds" />
                                                    </Box>
                                                </InputAdornment>
                                            ),
                                            sx: {
                                                borderRadius: 2,
                                                boxShadow: disabledQuestBool ? 'none' : '0 2px 8px rgba(0, 0, 0, 0.04) inset',
                                                backgroundColor: disabledQuestBool ? 'rgba(0, 0, 0, 0.02)' : 'white',
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
                            </Box>
                        </Box>

                        {(formData.questType !== "attendace" || formData.questType !== "feedback") && (
                            <Box
                                sx={{
                                    py: 3,
                                    mt: 2,
                                    display: 'flex',
                                    justifyContent: 'flex-end',
                                    borderTop: '1px solid rgba(0, 0, 0, 0.05)',
                                }}
                            >
                                <Button
                                    onClick={saveChanges}
                                    variant="contained"
                                    color="primary"
                                    disabled={!hasChanges}
                                    startIcon={<SaveIcon />}
                                    sx={{
                                        borderRadius: 2,
                                        py: 1.5,
                                        px: 4,
                                        fontWeight: 600,
                                        boxShadow: hasChanges ? '0 4px 12px rgba(33,150,243,0.3)' : 'none',
                                        background: hasChanges ? 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)' : undefined,
                                        '&:hover': {
                                            boxShadow: '0 6px 16px rgba(33,150,243,0.4)',
                                        },
                                        '&:disabled': {
                                            background: '#a9a9a9',
                                            color: 'white'
                                        },
                                        transition: 'all 0.2s ease'
                                    }}
                                >
                                    Save Changes
                                </Button>
                            </Box>
                        )}
                    </Box>

                    <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        mt: 3
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
                                <AutoModeIcon />
                            </Box>
                            <Typography variant='h5' fontWeight="700" sx={{ lineHeight: 1.1 }}>
                                Participants' Progress List
                            </Typography>
                        </Box>
                    </Box>

                    <Box sx={{ mt: 3 }}>
                        <Tabs
                            value={activeTab}
                            onChange={(event, changedTab) => setActiveTab(changedTab)}
                            variant='standard'
                            aria-label="quest-progress-list-tabs"
                            sx={{
                                minHeight: '48px',
                                position: 'relative',
                                '& .MuiTabs-flexContainer': {
                                    gap: 2,
                                },
                                '& .MuiTabs-indicator': {
                                    display: 'none',
                                },
                                '& .MuiButtonBase-root': {
                                    minHeight: '48px',
                                    py: 1,
                                    px: 3,
                                    borderRadius: '12px',
                                    transition: 'all 0.2s ease-in-out',
                                }
                            }}
                        >
                            <Tab
                                label="Completed"
                                sx={{
                                    textTransform: 'none',
                                    fontWeight: 500,
                                    fontSize: '0.95rem',
                                    color: 'text.secondary',
                                    backgroundColor: (theme) =>
                                        activeTab === 0
                                            ? alpha(theme.palette.primary.main, 0.08)
                                            : 'transparent',
                                    border: (theme) =>
                                        activeTab === 0
                                            ? `1px solid ${alpha(theme.palette.primary.main, 0.3)}`
                                            : `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                                    minWidth: '140px',
                                    boxShadow: (theme) =>
                                        activeTab === 0
                                            ? `0 4px 12px ${alpha(theme.palette.primary.main, 0.12)}`
                                            : 'none',
                                    '&.Mui-selected': {
                                        color: 'primary.main',
                                        fontWeight: 600,
                                    },
                                    '&:hover': {
                                        backgroundColor: (theme) =>
                                            activeTab === 0
                                                ? alpha(theme.palette.primary.main, 0.12)
                                                : alpha(theme.palette.background.default, 0.6),
                                    }
                                }}
                            />
                            <Tab
                                label="In Progress"
                                sx={{
                                    textTransform: 'none',
                                    fontWeight: 500,
                                    fontSize: '0.95rem',
                                    color: 'text.secondary',
                                    backgroundColor: (theme) =>
                                        activeTab === 1
                                            ? alpha(theme.palette.primary.main, 0.08)
                                            : 'transparent',
                                    border: (theme) =>
                                        activeTab === 1
                                            ? `1px solid ${alpha(theme.palette.primary.main, 0.3)}`
                                            : `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                                    minWidth: '140px',
                                    boxShadow: (theme) =>
                                        activeTab === 1
                                            ? `0 4px 12px ${alpha(theme.palette.primary.main, 0.12)}`
                                            : 'none',
                                    '&.Mui-selected': {
                                        color: 'primary.main',
                                        fontWeight: 600,
                                    },
                                    '&:hover': {
                                        backgroundColor: (theme) =>
                                            activeTab === 1
                                                ? alpha(theme.palette.primary.main, 0.12)
                                                : alpha(theme.palette.background.default, 0.6),
                                    }
                                }}
                            />
                        </Tabs>
                    </Box>

                    <Box
                        role="tabpanel"
                        hidden={activeTab !== 0}
                        id={'quest-progress-tabpanel-0'}
                        aria-labelledby={'quest-progress-tab-0'}
                        sx={{ py: 3, maxHeight: '100%' }}
                    >
                        {activeTab === 0 && <QuestProgressTable activeTab={activeTab} progress={completedProgress} isLoading={isLoading} />}
                    </Box>

                    <Box
                        role="tabpanel"
                        hidden={activeTab !== 1}
                        id={'quest-progress-tabpanel-1'}
                        aria-labelledby={'quest-progress-tab-1'}
                        sx={{ py: 3, maxHeight: '100%' }}
                    >
                        {activeTab === 1 && <QuestProgressTable activeTab={activeTab} progress={inProgress} questType={questData.questType} completionTarget={questData.completionNum} isLoading={isLoading} />}
                    </Box>
                </Box>
            </Card>
            <SnackbarComponent snackbarOpen={snackbarOpen} setSnackbarOpen={setSnackbarOpen} snackbarContent={snackbarContent} />
        </Box>
    )
}

export default QuestDetails;