import { Alert, Box, Card, Snackbar, Tab, Tabs, Typography } from '@mui/material';
import {
  SportsEsportsOutlined as SportsEsportsOutlinedIcon,
  EventOutlined as EventOutlinedIcon
} from '@mui/icons-material';
import React, { useState } from 'react';
import EventDetailsCreation from './EventDetailsCreation';
import { addDoc, collection, getDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../utils/firebaseConfig';
import EventQuestCreation from './EventQuestCreation';
import { getItem } from '../../utils/localStorage';
import { useNavigate } from 'react-router-dom';

const EventCreationPage = () => {
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
  const [capacity, setCapacity] = useState(1);
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
  }

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
      if (file.size > 50 * 1024) { // 50KB limit
        setErrors({ ...errors, images: 'Images must be 50KB or less' });
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

    if (newImages.length <= 4) {
      setErrors({ ...errors, images: null });
    }
  };

  const handleReplaceImage = (index, e) => {
    const file = e.target.files[0];

    if (file.size > 50 * 1024) {
      setErrors({ ...errors, images: 'Image must be 50KB or less' });
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
    }
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
        status: "Scheduled"
      };
  
      if (event.requiresCapacity) {
        event.capacity = capacity;
      }
  
      const eventRef = await addDoc(collection(db, "event"), event);
  
      // ✅ Validate inserted data after saving
      const insertedDoc = await getDoc(eventRef);
      const insertedData = insertedDoc.data();
  
      if (!insertedData || !insertedData.eventName || !insertedData.organisedID) {
        setSnackbarContent({
          message: "Event was saved, but required data is missing.",
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
        message: "Event successfully created!",
        severity: "success",
      });
      setSnackbarOpen(true);
      navigate('/event');
    } catch (error) {
      setSnackbarContent({
        message: "Something went wrong. Please try again shortly.",
        severity: "warning",
      });
      setSnackbarOpen(true);
    }
  };  

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        height: '100%',
        bgcolor: 'f7f9fc'
      }}>
      <Card
        sx={{
          borderRadius: { xs: 0, md: 3 },
          overflow: 'hidden',
          backgroundColor: '#ffffff',
          width: '100%',
          height: '100%',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
        }}
      >
        {/* Header Section */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            pt: 3,
            px: { xs: 3, md: 5 },
            pb: 3,
            background: 'linear-gradient(to right, #f7f9fc, #ffffff)',
          }}
        >
          <Typography
            variant="h4"
            component="h1"
            sx={{
              fontWeight: 800,
              background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
              backgroundClip: 'text',
              textFillColor: 'transparent',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              position: 'relative',
              display: 'inline-block'
            }}
          >
            Design Your Event
          </Typography>
        </Box>

        {/* Tab Navigation */}
        <Box sx={{
          width: '100%',
          borderBottom: '1px solid rgba(176, 174, 174, 0)',
          backgroundColor: '#ffffff'
        }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="fullWidth"
            aria-label="event creation tabs"
            sx={{
              '& .MuiTabs-indicator': {
                height: 3,
                borderTopLeftRadius: 3,
                borderTopRightRadius: 3,
                background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
              },
              '& .Mui-disabled': {
                color: 'rgba(0, 0, 0, 0.38)',
                opacity: 0.6,
              },
              borderTop: '1px solid rgba(169, 169, 169, 0.2)',
              borderBottom: '1px solid rgba(169, 169, 169, 0.2)',
              '& .MuiTab-root': {
                transition: 'all 0.3s ease',
              }
            }}
          >
            <Tab
              icon={<EventOutlinedIcon sx={{ fontSize: 22, mr: 1 }} />}
              iconPosition="start"
              disabled={false}
              label="Step 1: Event Information"
              sx={{
                textTransform: 'none',
                fontWeight: 500,
                color: 'text.secondary',
                borderRight: '1px solid rgba(169, 169, 169, 0.3)',
                py: 2,
                '&.Mui-selected': {
                  color: 'primary.main',
                  fontWeight: 'bold'
                },
              }}
            />
            <Tab
              icon={<SportsEsportsOutlinedIcon sx={{ fontSize: 22, mr: 1 }} />}
              iconPosition="start"
              disabled={!tabsEnabled[1]}
              label="Step 2: Quest"
              sx={{
                textTransform: 'none',
                fontWeight: 500,
                fontSize: '0.95rem',
                color: 'text.secondary',
                py: 2,
                '&.Mui-selected': {
                  color: 'primary.main',
                  fontWeight: 'bold'
                },
                '&:hover:not(.Mui-disabled)': {
                  backgroundColor: 'rgba(33, 150, 243, 0.04)',
                }
              }}
            />
          </Tabs>
        </Box>

        {/* Tab content */}
        <Box
          role="tabpanel"
          hidden={activeTab !== 0}
          id={`eventcreation-tabpanel-0`}
          aria-labelledby={`eventcreation-details-tab-0`}
          sx={{
            p: { xs: 2, md: 4 },
            height: '100%',
            overflow: 'auto',
            marginBottom: '180px',
            backgroundColor: '#ffffff'
          }}
        >
          {activeTab === 0 && (
            <EventDetailsCreation
              name={name} setName={setName}
              description={description} setDescription={setDescription}
              category={category} setCategory={setCategory}
              startDateTime={startDateTime} setStartDateTime={setStartDateTime}
              endDateTime={endDateTime} setEndDateTime={setEndDateTime}
              registrationDate={registrationDate} setRegistrationDate={setRegistrationDate}
              location={location} setLocation={setLocation}
              pinpoint={pinpoint} setPinpoint={setPinpoint}
              images={images} setImages={setImages}
              requiresCapacity={requiresCapacity} setRequiresCapacity={setRequiresCapacity}
              capacity={capacity} setCapacity={setCapacity}
              requiresPaymentProof={requiresPaymentProof} setRequiresPaymentProof={setRequiresPaymentProof}
              errors={errors} setErrors={setErrors}
              handleImageChange={handleImageChange} handleRemoveImage={handleRemoveImage} handleReplaceImage={handleReplaceImage}
              handleDetailsSubmit={handleDetailsSubmit}
            />
          )}
        </Box>

        <Box
          role="tabpanel"
          hidden={activeTab !== 1}
          id={`eventcreation-tabpanel-1`}
          aria-labelledby={`eventcreation-quest-tab-1`}
          sx={{
            py: { xs: 2, md: 3 },
            px: { xs: 2, md: 4 },
            height: '100%',
            overflow: 'auto',
            backgroundColor: '#ffffff'
          }}
        >
          {activeTab === 1 && (
            <>
              <EventQuestCreation
                attendanceQuest={attendanceQuest} setAttendanceQuest={setAttendanceQuest}
                earlyBirdQuest={earlyBirdQuest} setEarlyBirdQuest={setEarlyBirdQuest}
                questionAnswerQuest={questionAnswerQuest} setQuestionAnswerQuest={setQuestionAnswerQuest}
                networkingQuest={networkingQuest} setNetworkingQuest={setNetworkingQuest}
                feedbackQuest={feedbackQuest} setFeedbackQuest={setFeedbackQuest}
                questErrors={questErrors} setQuestErrors={setQuestErrors}
                handleEventCreation={handleEventCreation} handleBack={handleBack}
              />

              <Snackbar
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                open={snackbarOpen}
                autoHideDuration={4000}
                onClose={() => setSnackbarOpen(false)}
              >
                <Alert
                  severity={snackbarContent.severity}
                  variant="filled"
                  sx={{ width: '100%' }}
                >
                  {snackbarContent.message}
                </Alert>
              </Snackbar>
            </>
          )}
        </Box>
      </Card>
    </Box>
  )
}

export default EventCreationPage