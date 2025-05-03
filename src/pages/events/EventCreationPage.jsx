import { Box, Card, Fade, Tab, Tabs, Typography, useMediaQuery, useTheme, IconButton, Tooltip } from '@mui/material';
import {
    ArrowBack as ArrowBackIcon,
    EmojiEvents as EmojiEventsIcon,
    Event as EventIcon
} from '@mui/icons-material';
import React, { useState } from 'react';
import { addDoc, collection, getDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../utils/firebaseConfig';
import QuestCreation from '../../components/Events/Creation/QuestCreation';
import { getItem } from '../../utils/localStorage';
import { useNavigate } from 'react-router-dom';
import SnackbarComponent from '../../components/General/SnackbarComponent';
import DetailsCreation from '../../components/Events/Creation/DetailsCreation';

const EventCreationPage = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const [activeTab, setActiveTab] = useState(0);
    const [tabsEnabled, setTabsEnabled] = useState([true, false]);

    // Event Creation: Details
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [startDateTime, setStartDateTime] = useState(null);
    const [endDateTime, setEndDateTime] = useState(null);
    const [registrationDate, setRegistrationDate] = useState(null);
    const [location, setLocation] = useState('');
    const [pinpoint, setPinpoint] = useState();
    const [requiresCapacity, setRequiresCapacity] = useState(false);
    const [images, setImages] = useState([]);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [capacity, setCapacity] = useState('');
    const [requiresPaymentProof, setRequiresPaymentProof] = useState(false);
    const [errors, setErrors] = useState({});

    // Event Creation: Quest
    const [attendanceQuest, setAttendanceQuest] = useState({
        questName: "Go! Go! Go! Attend the event, warrior!",
        questType: 'attendance',
        description: "To complete this quest, make sure you attend the event in person. Scan the event’s QR code using the in-app scanner while being within 150 meters of the event location. Your quest will only be marked as complete once your check-in is successful.",
        diamondsRewards: 50,
        pointsRewards: 150,
    });
    const [earlyBirdQuest, setEarlyBirdQuest] = useState({});
    const [questionAnswerQuest, setQuestionAnswerQuest] = useState([]);
    const [networkingQuest, setNetworkingQuest] = useState({});
    const [feedbackQuest, setFeedbackQuest] = useState({
        questName: "Your Voice Matters!",
        questType: "feedback",
        description: "Thanks for joining the event! Now it's your turn to help us improve. Complete a short feedback form about your experience, the gamification elements, and any suggestions you have. Every insight helps us create better, more exciting events — and yes, you’ll earn rewards for it too!",
        diamondsRewards: 50,
        pointsRewards: 150,
    });
    const [questErrors, setQuestErrors] = useState({});

    // Snackbar
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarContent, setSnackbarContent] = useState({});

    // Navigation
    const navigate = useNavigate();

    const CATEGORY_MAPPING = {
        "Academic": 1,
        "Volunteering": 2,
        "Entertainment": 3,
        "Cultural": 4,
        "Sports": 5,
        "Health & Wellness": 6,
        "Others": 7,
    };

    const tabSx = {
        textTransform: 'none',
        fontWeight: 550,
        color: 'text.secondary',
        borderRight: '1px solid rgba(169, 169, 169, 0.3)',
        fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.8rem' },
        width: '100%',
        px: { xs: 1, sm: 1.5, md: 2 },
        '&.Mui-selected': {
            color: 'primary.main',
            fontWeight: 600,
            backgroundColor: 'rgba(25, 118, 210, 0.04)',
        },
        '&:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.03)',
            color: 'primary.dark',
        }
    };

    const handleTabChange = (event, newValue) => {
        if (tabsEnabled[newValue]) {
            setActiveTab(newValue);
        }
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);

        e.target.value = '';

        if (images.length + files.length > 4) {
            setErrors({ ...errors, images: 'Maximum 4 images allowed' });
            return;
        }

        const newImages = [];
        let hasError = false;

        files.forEach(file => {
            if (file.size > 100 * 1024) { // 100KB limit
                setErrors({ ...errors, images: 'Images must be 100KB or less' });
                hasError = true;
                return;
            }

            const reader = new FileReader();
            reader.onload = (event) => {
                const fullBase64 = event.target.result;

                const base64Data = fullBase64.split(',')[1];

                newImages.push({
                    file: file,
                    preview: base64Data,
                    name: file.name
                });

                if (newImages.length === files.length && !hasError) {
                    setImages([...images, ...newImages]);
                    setErrors({ ...errors, images: null });
                }
            };
            reader.readAsDataURL(file);
        });
    };

    const handleRemoveImage = (index) => {
        const newImages = [...images];
        newImages.splice(index, 1);
        setImages(newImages);
        setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));

        if (newImages.length <= 4) {
            setErrors({ ...errors, images: null });
        }
    };

    const handleReplaceImage = (index, e) => {
        const file = e.target.files[0];
    
        if (file.size > 100 * 1024) {
            setErrors({ ...errors, images: 'Image must be 100KB or less' });
            return;
        }
    
        const existingImage = images[index];
    
        // Check if the selected image is the same (by name and size)
        if (existingImage && file.preview === existingImage && file.size === existingImage.file.size) {
            setErrors({ ...errors, images:'You have selected the same image.'});
            return;
        }
    
        const reader = new FileReader();
        reader.onload = (event) => {
            const fullBase64 = event.target.result;
            const base64Data = fullBase64.split(',')[1];
    
            const newImages = [...images];
            newImages[index] = {
                file: file,
                preview: base64Data,
                name: file.name
            };
    
            setImages(newImages);
            setErrors({ ...errors, images: null });
        };
        reader.readAsDataURL(file);
    };    

    const handleDetailsSubmit = (e) => {
        e.preventDefault();

        const formErrors = {};

        if (!name) formErrors.name = 'Name is required';
        if (!description) formErrors.description = 'Description is required';
        if (!category) formErrors.category = 'Category is required';
        if (!startDateTime) formErrors.startDateTime = 'Event start date time is required';
        if (!endDateTime) formErrors.endDateTime = 'Event end date time is required';
        if (!registrationDate) formErrors.registrationDate = 'Registration closing date time is required';
        if (!location) formErrors.location = 'Location name is required';
        if (!pinpoint) formErrors.pinpoint = 'Location pinpoint is required';
        if (requiresCapacity && (capacity === "" || capacity === 0)) formErrors.capacity = 'Capacity is required';
        if (images.length === 0) formErrors.images = 'At least one image is required';

        setErrors(formErrors);

        if (Object.keys(formErrors).length === 0) {
            setTabsEnabled([false, true]);
            setActiveTab(1);
        }
    }

    const handleBack = () => {
        setTabsEnabled([true, false]);
        setActiveTab(0);
    }

    const handleEventCreation = async (e) => {
        e.preventDefault();

        try {
            const adminData = await getItem("admin");
            const parsedAdminData = JSON.parse(adminData);

            const event = {
                eventName: name,
                eventDescription: description,
                category: CATEGORY_MAPPING[category],
                eventStartDateTime: Timestamp.fromDate(startDateTime.toDate()),
                eventEndDateTime: Timestamp.fromDate(endDateTime.toDate()),
                registrationClosingDate: Timestamp.fromDate(registrationDate.toDate()),
                locationName: location,
                locationLatitude: parseFloat((pinpoint.lat).toFixed(4)),
                locationLongitude: parseFloat((pinpoint.lng).toFixed(4)),
                organiserID: parsedAdminData.facultyID,
                requiresCapacity,
                paymentProofRequired: requiresPaymentProof,
                lastAdded: Timestamp.now(),
                status: "Scheduled"
            };

            if (event.requiresCapacity) {
                event.capacity = Number(capacity);
            }

            const eventRef = await addDoc(collection(db, "event"), event);

            // ✅ Validate inserted data after saving
            const insertedDoc = await getDoc(eventRef);
            const insertedData = insertedDoc.data();

            if (!insertedData && !insertedData.eventName && !insertedData.organisedID) {
                setSnackbarContent({
                    msg: "Event was saved, but required data is missing.",
                    severity: "error",
                });
                setSnackbarOpen(true);
                return;
            }

            // Continue saving related collections only if validation passes
            await addDoc(collection(db, "eventImages"), {
                eventID: eventRef.id,
                images: images.map(item => item.preview),
            });

            const questRef = await addDoc(collection(db, "quest"), {
                eventID: eventRef.id,
            });

            await addDoc(collection(questRef, "questList"), {
                ...attendanceQuest,
                completionNum: 1
            });

            if (Object.keys(earlyBirdQuest).length > 0) {
                await addDoc(collection(questRef, "questList"), earlyBirdQuest);
            }

            if (questionAnswerQuest.length > 0) {
                for (const quest of questionAnswerQuest) {
                    await addDoc(collection(questRef, "questList"), quest);
                }
            }

            if (Object.keys(networkingQuest).length > 0) {
                await addDoc(collection(questRef, "questList"), networkingQuest);
            }

            await addDoc(collection(questRef, "questList"), {
                ...feedbackQuest,
                completionNum: 1
            });

            setSnackbarContent({
                msg: "Event successfully created!",
                severity: "success",
            });
            setSnackbarOpen(true);
            navigate('/event');
        } catch (error) {
            setSnackbarContent({
                msg: "Something went wrong. Please try again shortly.",
                severity: "warning",
            });
            setSnackbarOpen(true);
        }
    };

    const tabs = [
        {
            label: 'Step 1: Event Details',
            icon: <EventIcon />,
            description: 'Define your event basics',
            component: (
                <DetailsCreation
                    name={name}
                    setName={setName}
                    description={description}
                    setDescription={setDescription}
                    category={category}
                    setCategory={setCategory}
                    startDateTime={startDateTime}
                    setStartDateTime={setStartDateTime}
                    endDateTime={endDateTime}
                    setEndDateTime={setEndDateTime}
                    registrationDate={registrationDate}
                    setRegistrationDate={setRegistrationDate}
                    location={location}
                    setLocation={setLocation}
                    pinpoint={pinpoint}
                    setPinpoint={setPinpoint}
                    images={images}
                    currentImageIndex={currentImageIndex}
                    setCurrentImageIndex={setCurrentImageIndex}
                    requiresCapacity={requiresCapacity}
                    setRequiresCapacity={setRequiresCapacity}
                    capacity={capacity}
                    setCapacity={setCapacity}
                    requiresPaymentProof={requiresPaymentProof}
                    setRequiresPaymentProof={setRequiresPaymentProof}
                    errors={errors}
                    setErrors={setErrors}
                    handleImageChange={handleImageChange}
                    handleRemoveImage={handleRemoveImage}
                    handleReplaceImage={handleReplaceImage}
                    handleDetailsSubmit={handleDetailsSubmit}
                />
            )
        },
        {
            label: 'Step 2: Quests Management',
            icon: <EmojiEventsIcon />,
            description: 'Create interactive challenges',
            component: (
                <QuestCreation
                    attendanceQuest={attendanceQuest}
                    setAttendanceQuest={setAttendanceQuest}
                    earlyBirdQuest={earlyBirdQuest}
                    setEarlyBirdQuest={setEarlyBirdQuest}
                    questionAnswerQuest={questionAnswerQuest}
                    setQuestionAnswerQuest={setQuestionAnswerQuest}
                    networkingQuest={networkingQuest}
                    setNetworkingQuest={setNetworkingQuest}
                    feedbackQuest={feedbackQuest}
                    setFeedbackQuest={setFeedbackQuest}
                    questErrors={questErrors}
                    setQuestErrors={setQuestErrors}
                    handleEventCreation={handleEventCreation}
                    handleBack={handleBack}
                />
            )
        }
    ];

    return (
        <Box
            sx={{
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
                        flexDirection: 'column',//{ xs: 'column', sm: 'row' },
                        alignItems: 'flex-start',
                        py: { xs: 1, sm: 1.5 },
                        px: { xs: 2, sm: 3.5 },
                        gap: { xs: 2, sm: 0 },
                        borderBottom: '1px solid rgba(0, 0, 0, 0.06)'
                    }}
                >
                    {/* Header with Back Button */}
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            flexGrow: 1,
                            minWidth: 0,
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Tooltip title="Back to Events" arrow>
                                <IconButton
                                    edge="start"
                                    onClick={() => navigate('/event')}
                                    sx={{
                                        mr: 1.5,
                                        color: 'text.primary',
                                        transition: 'all 0.2s ease',
                                        '&:hover': {
                                            bgcolor: 'rgba(25, 118, 210, 0.08)',
                                            transform: 'translateX(-1px)',
                                        }
                                    }}
                                    aria-label="back to events"
                                >
                                    <ArrowBackIcon fontSize={isMobile ? "small" : "medium"} />
                                </IconButton>
                            </Tooltip>

                            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                <Typography
                                    variant="h6"
                                    component="h1"
                                    sx={{
                                        flexGrow: 1,
                                        fontWeight: 600,
                                        fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' },
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                        maxWidth: { xs: '200px', sm: '250px', md: '100%' }
                                    }}
                                >
                                    Create Your Event
                                </Typography>
                                <Typography
                                    variant="subtitle2"
                                    sx={{
                                        flexGrow: 1,
                                        fontSize: { xs: '8px', sm: '10px', md: '12px' },
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                        maxWidth: { xs: '200px', sm: '500px', md: '100%' }
                                    }}
                                >
                                    Design an unforgettable event with interactive challenges that engage your audience
                                </Typography>
                            </Box>
                        </Box>
                    </Box>
                </Box>

                <Box sx={{ width: '100%', borderBottom: '1px solid rgba(176, 174, 174, 0)' }}>
                    <Tabs
                        value={activeTab}
                        onChange={handleTabChange}
                        variant="fullWidth"
                        scrollButtons={isMobile ? "auto" : false}
                        aria-label="event-details-tabs"
                        sx={{
                            '& .MuiTabs-indicator': {
                                backgroundColor: 'primary.main',
                                height: 3,
                                borderRadius: '3px 3px 0 0',
                            },
                            minHeight: { xs: '40px', sm: '45px' },
                            borderBottom: '1px solid rgba(169, 169, 169, 0.3)',
                            '& .MuiButtonBase-root': {
                                minHeight: { xs: '40px', sm: '45px' },
                                py: 0.5,
                                transition: 'all 0.2s ease',
                            },
                            '& .Mui-disabled': {
                                opacity: 0.6,
                            },
                        }}
                    >
                        {tabs.map((tab, index) => (
                            <Tab
                                key={tab.label}
                                icon={tab.icon}
                                iconPosition="start"
                                label={tab.label}
                                disabled={index > 0}
                                sx={{
                                    ...tabSx,
                                    // Remove border from last tab
                                    ...(index === tabs.length - 1 && { borderRight: 'none' })
                                }}
                            />
                        ))}
                    </Tabs>
                </Box>

                {/* Tab/Step Content */}
                <Box sx={{ p: { xs: 2, md: 4 }, minHeight: '500px' }}>
                    {tabs.map((tab, index) => (
                        <div
                            key={index}
                            role="tabpanel"
                            hidden={activeTab !== index}
                        >
                            {activeTab === index && (
                                <Fade in={activeTab === index} timeout={500}>
                                    <Box>{tab.component}</Box>
                                </Fade>
                            )}
                        </div>
                    ))}
                    <SnackbarComponent snackbarOpen={snackbarOpen} setSnackbarOpen={setSnackbarOpen} snackbarContent={snackbarContent} />
                </Box>
            </Card>
        </Box>
    )
}

export default EventCreationPage;