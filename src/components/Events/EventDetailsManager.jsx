import { collection, doc, getDocs, onSnapshot, query, Timestamp, updateDoc, where } from 'firebase/firestore';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { db } from '../../utils/firebaseConfig';
import dayjs from 'dayjs';
import { Box, Button, Chip, CircularProgress, FormControl, FormControlLabel, FormHelperText, Grid, IconButton, MenuItem, Select, Switch, TextField, Tooltip, Typography } from '@mui/material';
import RequiredAsterisk from '../General/RequiredAsterisk';
import { DateTimePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

import LocationOnIcon from '@mui/icons-material/LocationOn';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import TouchAppIcon from '@mui/icons-material/TouchApp';
import LocationSearchingIcon from '@mui/icons-material/LocationSearching';
import ImageIcon from '@mui/icons-material/Image';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import ReceiptIcon from '@mui/icons-material/Receipt';

import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapContainer, Marker, TileLayer, useMapEvents } from 'react-leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const EventDetailsManager = ({ eventID }) => {
  const [originalData, setOriginalData] = useState({});
  const [formData, setFormData] = useState({
    eventName: '',
    eventDescription: '',
    category: '',
    eventStartDateTime: dayjs(),
    eventEndDateTime: dayjs().add(1, 'hour'),
    registrationClosingDate: dayjs().subtract(1, 'hour'),
    locationName: '',
    locationLatitude: 0,
    locationLongitude: 0,
    requiresCapacity: false,
    capacity: 0,
    paymentProofRequired: false,
    images: []
  });
  const [formErrors, setFormErrors] = useState({
    eventName: '',
    eventDescription: '',
    category: '',
    eventStartDateTime: '',
    eventEndDateTime: '',
    registrationClosingDate: '',
    locationName: '',
    pinpoint: '',
    capacity: '',
    images: '',
  });
  const [isLoading, setIsLoading] = useState(true);

  // Snackbar
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  // Current date time in dayjs
  const now = dayjs();

  const CATEGORY_MAPPING = {
    1: "Academic",
    2: "Volunteering",
    3: "Entertainment",
    4: "Cultural",
    5: "Sports",
    6: "Health & Wellness",
    7: "Others",
  }

  const CATEGORY_NUM_MAPPING = {
    "Academic": 1,
    "Volunteering": 2,
    "Entertainment": 3,
    "Cultural": 4,
    "Sports": 5,
    "Health & Wellness": 6,
    "Others": 7,
  }

  const commonPickerProps = {
    sx: { width: '100%' },
    slotProps: {
      textField: {
        fullWidth: true,
        variant: 'outlined'
      }
    }
  };

  const MapEvents = () => {
    useMapEvents({
      click: (e) => {
        const { lat, lng } = e.latlng;
        const currentErrors = { ...formErrors };

        const minLat = 1.4581;
        const maxLat = 1.4737;
        const minLng = 110.4187;
        const maxLng = 110.4557;

        if (lat >= minLat && lat <= maxLat && lng >= minLng && lng <= maxLng) {
          handleChange('locationLatitude', parseFloat(lat.toFixed(4)));
          handleChange('locationLongitude', parseFloat(lng.toFixed(4)));
        } else {
          currentErrors.pinpoint = "Please select a location within UNIMAS area.";
        }

        setFormErrors(currentErrors);
      }
    });
    return null;
  };

  const fetchSelectedEvent = useCallback(() => {
    if (!eventID) return () => { };

    try {
      const eventRef = doc(db, "event", eventID);

      const unsubscribeEvent = onSnapshot(eventRef, (eventSnap) => {
        if (eventSnap.exists()) {
          const eventData = eventSnap.data();

          const imagesQuery = query(collection(db, "eventImages"), where("eventID", "==", eventID));

          const unsubscribeEventImages = onSnapshot(imagesQuery, (imagesSnap) => {
            const images = imagesSnap.docs.flatMap(doc =>
              doc.data().images ? doc.data().images : []
            );

            const completedEventData = {
              ...eventData,
              category: CATEGORY_MAPPING[eventData.category],
              eventStartDateTime: dayjs(new Date((eventData.eventStartDateTime).seconds * 1000)),
              eventEndDateTime: dayjs(new Date((eventData.eventEndDateTime).seconds * 1000)),
              registrationClosingDate: dayjs(new Date((eventData.registrationClosingDate).seconds * 1000)),
              images
            };

            setOriginalData(completedEventData);
            setFormData(completedEventData);
            setIsLoading(false);
          })

          return () => { unsubscribeEventImages(); }
        }

        return () => { unsubscribeEvent(); }
      });
    } catch (error) {

    }
  }, [eventID]);

  useEffect(() => {
    const unsubs = fetchSelectedEvent();
    return unsubs;
  }, [fetchSelectedEvent]);

  useEffect(() => {
    setFormErrors({
      eventName: '',
      eventDescription: '',
      category: '',
      eventStartDateTime: '',
      eventEndDateTime: '',
      registrationClosingDate: '',
      locationName: '',
      pinpoint: '',
      capacity: '',
      images: '',
    });
  }, [])

  const hasChanges = useMemo(() => {
    if (!originalData || !formData) return false;

    // Use the same detailed comparison logic as changedFields
    return Object.keys(formData).some(key => {
      if (Array.isArray(formData[key])) {
        if (formData[key].length !== originalData[key]?.length) return true;
        return !formData[key].every((item, index) => item === originalData[key][index]);
      }

      if (key === "capacity") {
        return Number(formData[key]) !== Number(originalData[key]);
      }

      if (formData[key] instanceof Date || dayjs.isDayjs(formData[key])) {
        return dayjs(formData[key]).valueOf() !== dayjs(originalData[key]).valueOf();
      }

      return formData[key] !== originalData[key];
    });
  }, [originalData, formData]);

  const changedFields = useMemo(() => {
    if (!originalData || !formData) return [];

    return Object.keys(formData).filter(key => {
      if (Array.isArray(formData[key])) {
        if (formData[key].length !== originalData[key]?.length) return true;
        return formData[key].every((item, index) => item !== originalData[key][index]);
      }

      if (key === "capacity") {
        return Number(formData[key]) !== Number(originalData[key]);
      }

      if (formData[key] instanceof Date || dayjs.isDayjs(formData[key])) {
        return dayjs(formData[key]).valueOf() !== dayjs(originalData[key]).valueOf();
      }

      return formData[key] !== originalData[key];
    });
  }, [originalData, formData]);

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    if (value instanceof Date || dayjs.isDayjs(value)) {
      changedFields.includes(field);
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);

    e.target.value = '';

    if (formData.images.length + files.length > 4) {
      setFormErrors({ ...formErrors, images: 'Maximum 4 images allowed' });
      return;
    }

    let hasError = false;

    files.forEach(file => {
      if (file.size > 50 * 1024) { // 50KB limit
        setFormErrors({ ...formErrors, images: 'Image must be 50KB or less' });
        hasError = true;
        return;
      }

      setFormErrors({ ...formErrors, images: '' });

      const reader = new FileReader();
      reader.onload = (event) => {
        const fullBase64 = event.target.result;

        const base64Data = fullBase64.split(',')[1];

        if (!hasError) {
          setFormData(prev => ({
            ...prev,
            images: [...prev.images, base64Data]
          }));

          changedFields.includes('images');
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleImageRemove = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));

    changedFields.includes('images');
  };

  const handleReplaceImage = (index, e) => {
    const file = e.target.files[0];

    if (file.size > 50 * 1024) {
      setFormErrors({ ...formErrors, images: 'Image must be 50KB or less' });
      return;
    }

    setFormErrors({ ...formErrors, images: '' });

    const reader = new FileReader();
    reader.onload = (event) => {
      const fullBase64 = event.target.result;

      const base64Data = fullBase64.split(',')[1];

      const replaceImage = [...formData.images];

      replaceImage[index] = base64Data;

      setFormData(prev => ({
        ...prev,
        images: replaceImage
      }));

      changedFields.includes('images');
    }
    reader.readAsDataURL(file);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();

    const formErrors = {};

    if (!formData.eventName) formErrors.eventName = 'Event name is required';
    if (!formData.eventDescription) formErrors.eventDescription = 'Event description is required';
    if (!formData.category) formErrors.category = 'Event category is required';
    if (!formData.eventStartDateTime) formErrors.eventStartDateTime = 'Event start date time is required';
    if (!formData.eventEndDateTime) formErrors.eventEndDateTime = 'Event end date time is required';
    if (!formData.registrationClosingDate) formErrors.registrationClosingDate = 'Event registration closing date time is required';
    if (!formData.locationName) formErrors.locationName = 'Event location name is required';
    if (formData.requiresCapacity && (!formData.capacity || formData.capacity === 0)) formErrors.capacity = 'Capacity is required';
    if (formData.images.length === 0) formErrors.images = 'At least one image is required';

    setFormErrors(formErrors);

    if (Object.keys(formErrors).length === 0) {
      try {
        const updates = {};
        changedFields.forEach(field => {
          updates[field] = formData[field];
        })

        const { images, ...eventData } = updates;

        const formattedEventData = {
          ...eventData,
          ...(eventData.category && {
            category: CATEGORY_NUM_MAPPING[eventData.category]
          }),
          ...((eventData.eventStartDateTime).isAfter(originalData.eventStartDateTime) && {
            status: "Postponed",
          }),
          ...(eventData.eventStartDateTime && {
            eventStartDateTime: Timestamp.fromDate(eventData.eventStartDateTime.toDate()),
          }),
          ...(eventData.eventEndDateTime && {
            eventEndDateTime: Timestamp.fromDate(eventData.eventEndDateTime.toDate()),
          }),
          ...(eventData.registrationClosingDate && {
            registrationClosingDate: Timestamp.fromDate(eventData.registrationClosingDate.toDate()),
          }),
          ...(eventData.requiresCapacity && eventData.capacity && {
            capacity: Number(eventData.capacity),
          })
        }

        await updateDoc(doc(db, "event", eventID), formattedEventData);

        if (images) {
          const updateImagesQuery = query(collection(db, "eventImages"), where("eventID", "==", eventID));
          const updateImagesSnapshot = await getDocs(updateImagesQuery);

          if (!updateImagesSnapshot.empty) {
            const updateImagesDoc = updateImagesSnapshot.docs[0];
            const imagesRef = doc(db, "eventImages", updateImagesDoc.id);
            
            await updateDoc(imagesRef, { images });
            console.log(`Updated event with eventID: ${eventID}`);
          } else {
            console.log("No matching event found.");
          }
        }
      } catch (error) {
        console.error("Error updating event:", error);
      }
    }
  }

  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          py: 10,
          opacity: 0.8
        }}
      >
        <CircularProgress
          size={48}
          thickness={4}
          color="primary"
        />
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mt: 2, fontWeight: 500 }}
        >
          Loading event details...
        </Typography>
      </Box>
    )
  }

  return (
    <Box component="form" onSubmit={handleEditSubmit} noValidate sx={{ width: '100%', maxHeight: '100%', mb: '250px' }}>
      <Box sx={{ width: '100%', mb: 3 }}>
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 550 }}>
            Event Name <RequiredAsterisk />
          </Typography>
        </Box>

        <TextField
          fullWidth
          placeholder="Enter event name"
          value={formData.eventName}
          onChange={(e) => handleChange('eventName', e.target.value)}
          error={formErrors.eventName}
          helperText={formErrors.eventName}
          required
          variant="outlined"
          InputProps={{
            sx: { borderRadius: 2 }
          }}
        />
      </Box>

      <Box sx={{ width: '100%', mb: 3 }}>
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 550 }}>
            Event Description <RequiredAsterisk />
          </Typography>
        </Box>

        <TextField
          fullWidth
          placeholder="Enter event details (e.g. info, payment details, speaker info etc.)"
          value={formData.eventDescription}
          onChange={(e) => handleChange('eventDescription', e.target.value)}
          error={formErrors.eventDescription}
          helperText={formErrors.eventDescription}
          multiline
          rows={5}
          required
          variant="outlined"
          InputProps={{
            sx: { borderRadius: 2 }
          }}
        />
      </Box>

      <Box sx={{ width: '100%', mb: 3 }}>
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 550 }}>
            Event Category <RequiredAsterisk />
          </Typography>
        </Box>

        <FormControl fullWidth error={formErrors.category} required>
          <Select
            displayEmpty
            renderValue={(selected) => {
              if (selected.length === 0) {
                return <div style={{ color: '#a9a9a9' }}>Select an event category</div>
              }

              return selected;
            }}
            value={formData.category}
            onChange={(e) => handleChange('category', e.target.value)}
            sx={{ borderRadius: 2 }}
          >
            <MenuItem value="Academic">Academic</MenuItem>
            <MenuItem value="Volunteering">Volunteering</MenuItem>
            <MenuItem value="Entertainment">Entertainment</MenuItem>
            <MenuItem value="Cultural">Cultural</MenuItem>
            <MenuItem value="Sports">Sports</MenuItem>
            <MenuItem value="Health & Wellness">Health & Wellness</MenuItem>
            <MenuItem value="Others">Others</MenuItem>
          </Select>
          {formErrors.category && <FormHelperText>{formErrors.category}</FormHelperText>}
        </FormControl>
      </Box>

      <Box sx={{ width: '100%', mb: 3 }}>
        <Box sx={{ width: '100%', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 550 }}>
            Event Start Date & Time <RequiredAsterisk />
          </Typography>
          <Typography variant="body2" color="text.secondary">
            ⚠️ Tip: Use the calendar icon to pick date & time.
          </Typography>
        </Box>

        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DateTimePicker
            {...commonPickerProps}
            value={formData.eventStartDateTime}
            onChange={(newDate) => handleChange('eventStartDateTime', newDate)}
            minDateTime={now}
            shouldDisableDate={(date) => date.isBefore(now)}
            sx={{
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: formErrors.eventStartDateTime ? 'red' : undefined,
                },
                '&:hover fieldset': {
                  borderColor: formErrors.eventStartDateTime ? 'red' : undefined,
                },
                '&.Mui-focused fieldset': {
                  borderColor: formErrors.eventStartDateTime ? 'red' : undefined,
                },
              },
            }}
          />
        </LocalizationProvider>
        {formErrors.eventStartDateTime && <FormHelperText error sx={{ ml: 1 }}>{formErrors.eventStartDateTime}</FormHelperText>}
      </Box>

      <Box sx={{ width: '100%', mb: 3 }}>
        <Box sx={{ width: '100%', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 550 }}>
            Event End Date & Time <RequiredAsterisk />
          </Typography>
          <Typography variant="body2" color="text.secondary">
            ⚠️ Note: Must be in the future after event start. (Tip: Use calendar icon.)
          </Typography>
        </Box>

        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DateTimePicker
            {...commonPickerProps}
            value={formData.eventEndDateTime}
            onChange={(newDate) => handleChange('eventEndDateTime', newDate)}
            minDateTime={formData.eventStartDateTime.add(1, "hour")}
            disabled={!formData.eventStartDateTime}
            shouldDisableDate={(date) => formData.eventStartDateTime && date.isBefore(formData.eventStartDateTime)}
            sx={{
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: formErrors.eventEndDateTime ? 'red' : undefined,
                },
                '&:hover fieldset': {
                  borderColor: formErrors.eventEndDateTime ? 'red' : undefined,
                },
                '&.Mui-focused fieldset': {
                  borderColor: formErrors.eventEndDateTime ? 'red' : undefined,
                },
              },
            }}
          />
        </LocalizationProvider>
        {formErrors.eventEndDateTime && <FormHelperText error sx={{ ml: 1 }}>{formErrors.eventEndDateTime}</FormHelperText>}
      </Box>

      <Box sx={{ width: '100%', mb: 3 }}>
        <Box sx={{ width: '100%', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 550 }}>
            Event Registration Closing Date <RequiredAsterisk />
          </Typography>
          <Typography variant="body2" color="text.secondary">
            ⚠️ Must be in the future and ≥ 1 hour before event start. (Tip: Use calendar icon.)
          </Typography>
        </Box>

        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DateTimePicker
            {...commonPickerProps}
            value={formData.registrationClosingDate}
            onChange={(newDate) => handleChange('registrationClosingDate', newDate)}
            minDateTime={now}
            maxDateTime={formData.eventStartDateTime.subtract(1, "hour")}
            disabled={!formData.eventStartDateTime}
            shouldDisableDate={(date) => formData.eventStartDateTime && date.isAfter(formData.eventStartDateTime)}
            sx={{
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: formErrors.registrationClosingDate ? 'red' : undefined,
                },
                '&:hover fieldset': {
                  borderColor: formErrors.registrationClosingDate ? 'red' : undefined,
                },
                '&.Mui-focused fieldset': {
                  borderColor: formErrors.registrationClosingDate ? 'red' : undefined,
                },
              },
            }}
          />
        </LocalizationProvider>
        {formErrors.registrationClosingDate && <FormHelperText error sx={{ ml: 1 }}>{formErrors.registrationClosingDate}</FormHelperText>}
      </Box>

      <Box sx={{ width: '100%', mb: 3 }}>
        <Box sx={{ width: '100%', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 550 }}>
            Event Location <RequiredAsterisk />
          </Typography>
          <Typography variant="body2" color="text.secondary">
            📍 Suggested Format: Building/Faculty - Room/Hall (e.g., FCSIT - AI Lab)
          </Typography>
        </Box>

        <TextField
          fullWidth
          placeholder="Enter event location"
          value={formData.locationName}
          onChange={(e) => handleChange('locationName', e.target.value)}
          error={formErrors.locationName}
          helperText={formErrors.locationName}
          required
          variant="outlined"
          InputProps={{
            sx: { borderRadius: 2 }
          }}
        />
      </Box>

      <Box sx={{ width: '100%', mb: 3 }}>
        <Box sx={{ width: '100%', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 550 }}>
            Location Pinpoint <RequiredAsterisk />
          </Typography>
          <Typography variant="body2" color="text.secondary">
            ⚠️ Important: Accurate location setting is required for student attendance and quest verification.
          </Typography>
        </Box>

        <Box
          sx={{
            maxWidth: "85%",
            mx: "auto",
            overflow: "hidden",
            borderRadius: 3,
            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.08)",
            border: "1px solid rgba(0, 0, 0, 0.05)",
            backgroundColor: "#ffffff"
          }}
        >
          <Box
            sx={{
              px: 3,
              py: 2,
              borderBottom: '1px solid rgba(0,0,0,0.06)',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <Box
              sx={{
                color: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                mr: 2
              }}
            >
              <LocationOnIcon fontSize="small" />
            </Box>
            <Typography variant="subtitle1" fontWeight={600}>
              Event Location
            </Typography>

            {formData.locationLatitude && formData.locationLongitude && (
              <Typography
                variant="body2"
                sx={{
                  ml: 'auto',
                  color: 'success.main',
                  display: 'flex',
                  alignItems: 'center',
                  fontSize: '0.875rem'
                }}
              >
                <CheckCircleIcon fontSize="small" sx={{ mr: 0.75, fontSize: '18px' }} />
                Location Selected
              </Typography>
            )}
          </Box>

          <Box
            sx={{
              height: '320px',
              position: 'relative',
              '& .leaflet-container': {
                height: '100%',
                width: '100%',
                zIndex: 1
              }
            }}
          >
            <MapContainer
              center={{ lat: formData.locationLatitude, lng: formData.locationLongitude }}
              zoom={16}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
              />
              {formData.locationLatitude && formData.locationLongitude && (
                <Marker position={{ lat: formData.locationLatitude, lng: formData.locationLongitude }} />
              )}
              <MapEvents />
            </MapContainer>

            {!formData.locationLatitude && !formData.locationLongitude && (
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 20,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  backgroundColor: 'rgba(255,255,255,0.9)',
                  padding: '8px 16px',
                  borderRadius: 8,
                  boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
                  zIndex: 500,
                  border: '1px solid rgba(0,0,0,0.05)',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <TouchAppIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">
                  Click on the map to set event location
                </Typography>
              </Box>
            )}
          </Box>

          {formData.locationLatitude && formData.locationLongitude && (
            <Box
              sx={{
                padding: '16px 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: 'rgba(0,0,0,0.01)',
                borderTop: '1px solid rgba(0,0,0,0.06)'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary" sx={{ mr: 2 }}>
                  Coordinates:
                </Typography>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  <Chip
                    label={`Lat: ${parseFloat(formData.locationLatitude.toFixed(4))}`}
                    size="small"
                    sx={{
                      mr: 1,
                      fontFamily: 'monospace',
                      fontWeight: 500,
                      backgroundColor: 'rgba(33,150,243,0.1)',
                      color: 'primary.dark'
                    }}
                  />
                  <Chip
                    label={`Long: ${parseFloat(formData.locationLongitude.toFixed(4))}`}
                    size="small"
                    sx={{
                      fontFamily: 'monospace',
                      fontWeight: 500,
                      backgroundColor: 'rgba(33,150,243,0.1)',
                      color: 'primary.dark'
                    }}
                  />
                </Box>
              </Box>

              <Button
                size="small"
                startIcon={<LocationSearchingIcon fontSize="small" />}
                sx={{
                  textTransform: 'none',
                  fontSize: '0.8rem'
                }}
                onClick={() => {
                  setFormData({
                    ...formData,
                    locationLatitude: originalData.locationLatitude,
                    locationLongitude: originalData.locationLongitude
                  })
                }}
              >
                Reset Location
              </Button>
            </Box>
          )}
        </Box>

        <Box sx={{ mb: 3 }}>
          {formErrors.pinpoint && <FormHelperText sx={{ mt: 2 }} error>{formErrors.pinpoint}</FormHelperText>}
        </Box>

        <Box sx={{ width: '100%', mb: 3 }}>
          <Box sx={{ width: '100%', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 550 }}>
              Event Images <RequiredAsterisk />
            </Typography>
            <Typography variant="body2" color='text.secondary'>
              Upload up to 4 merchandise images (max 50KB each)
            </Typography>
          </Box>

          <Button
            variant="outlined"
            component="label"
            startIcon={<ImageIcon />}
            sx={{
              width: '100%',
              mb: 2,
              borderRadius: 2,
              py: 1,
              px: 3,
              borderWidth: 2,
              '&:hover': {
                borderWidth: 2
              }
            }}
            disabled={formData.images.length >= 4}
            color="primary"
          >
            {formData.images.length > 0 ? 'Add Another Poster' : 'Upload Event Poster'}
            <input
              type="file"
              accept="image/*"
              multiple
              hidden
              onChange={handleImageChange}
            />
          </Button>

          {formErrors?.images && <FormHelperText sx={{ ml: 1 }} error>{formErrors.images}</FormHelperText>}

          {formData.images.length > 0 && (
            <Box sx={{ mt: 3, width: '100%' }}>
              <Grid container spacing={3}>
                {formData.images.map((img, index) => (
                  <Grid key={index}>
                    <Box
                      sx={{
                        position: 'relative',
                        width: "250px",
                        borderRadius: 3,
                        overflow: 'hidden',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        transition: 'transform 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-4px)'
                        }
                      }}
                    >
                      <Box
                        sx={{
                          position: 'relative',
                          pt: '100%', // 1:1 Aspect Ratio
                          overflow: 'hidden',
                          bgcolor: '#f5f5f5'
                        }}
                      >
                        <Box
                          component="img"
                          src={`data:image/jpeg;base64,${img}`}
                          alt={`Event ${index + 1}`}
                          sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            objectFit: 'contain',
                          }}
                        />
                      </Box>
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          display: 'flex',
                          gap: 1
                        }}
                      >
                        <IconButton
                          size="small"
                          onClick={() => handleImageRemove(index)}
                          sx={{
                            bgcolor: 'error.main',
                            color: 'white',
                            '&:hover': {
                              bgcolor: 'error.dark'
                            }
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          component="label"
                          sx={{
                            bgcolor: 'info.main',
                            color: 'white',
                            '&:hover': {
                              bgcolor: 'info.dark'
                            }
                          }}
                        >
                          <EditIcon fontSize="small" />
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            hidden
                            onChange={(e) => handleReplaceImage(index, e)}
                          />
                        </IconButton>
                      </Box>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
        </Box>

        <Box sx={{ width: '100%', mb: 3 }}>
          <Box sx={{ width: '100%', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 550 }}>
              Attendance Capacity <RequiredAsterisk />
            </Typography>
          </Box>

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              p: 2,
              mb: 1,
              borderRadius: 1,
            }}
          >
            <PeopleAltIcon sx={{ mr: 2, color: 'primary.main' }} />
            <FormControlLabel
              control={
                <Switch
                  checked={formData.requiresCapacity}
                  onChange={() => handleChange('requiresCapacity', !formData.requiresCapacity)}
                  name="requiresCapacitySwitch"
                  color="primary"
                  size="medium"
                />
              }
              label=""
            />
            <Box sx={{ ml: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
                {formData.requiresCapacity ? "Set Capacity Limit" : "Unlimited Capacity"}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {formData.requiresCapacity
                  ? "Restrict maximum number of attendees"
                  : "Allow unlimited attendees to register"
                }
              </Typography>
            </Box>
            <Tooltip title="Setting a capacity limit will prevent registration once the maximum number of attendees is reached." arrow>
              <InfoOutlinedIcon sx={{ ml: 2, color: 'text.secondary', cursor: 'pointer' }} />
            </Tooltip>
          </Box>

          {formData.requiresCapacity && (
            <Box sx={{ width: '100%', mb: 3 }}>
              <TextField
                fullWidth
                placeholder="Enter attendance capacity"
                value={formData.capacity}
                onChange={(e) => handleChange('capacity', e.target.value)}
                type='number'
                error={formErrors.capacity}
                helperText={formErrors.capacity}
                defaultValue=''
                required
                variant="outlined"
                InputProps={{
                  sx: {
                    borderRadius: 2,
                    '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button': {
                      display: 'none'
                    },
                    '& input[type=number]': {
                      MozAppearance: 'textfield'
                    },
                  }
                }}
              />
            </Box>
          )}
        </Box>

        <Box sx={{ width: '100%', mb: 3 }}>
          <Box sx={{ width: '100%', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 550 }}>
              Payment Proof Requirement <RequiredAsterisk />
            </Typography>
          </Box>

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              p: 2,
              borderRadius: 1,
            }}
          >
            <ReceiptIcon sx={{ mr: 2, color: 'primary.main' }} />
            <FormControlLabel
              control={
                <Switch
                  checked={formData.paymentProofRequired}
                  onChange={() => handleChange('paymentProofRequired', !formData.paymentProofRequired)}
                  name="paymentProofSwitch"
                  color="primary"
                  size="medium"
                />
              }
              label=""
            />
            <Box sx={{ ml: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
                {formData.paymentProofRequired ? "Payment Verification Required" : "No Payment Verification"}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {formData.paymentProofRequired
                  ? "Students must upload payment proof (max 50KB)"
                  : "No payment documentation needed for registration"
                }
              </Typography>
            </Box>
            <Tooltip title="When enabled, students will be prompted to upload payment receipts (JPEG or PNG format, maximum 50KB)" arrow>
              <InfoOutlinedIcon sx={{ ml: 2, color: 'text.secondary', cursor: 'pointer' }} />
            </Tooltip>
          </Box>
        </Box>

        <Box
          sx={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            padding: 2,
            paddingRight: 4,
            backgroundColor: 'white',
            borderTop: '1px solid rgba(0, 0, 0, 0.2)',
            display: 'flex',
            justifyContent: 'flex-end',
            zIndex: 1100, // To ensure buttons appear above other content
          }}
        >
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={!hasChanges}
            sx={{
              borderRadius: 2,
              py: 1.5,
              px: 4,
              fontWeight: 600,
              boxShadow: '0 4px 12px rgba(33,150,243,0.3)',
              background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
              '&:hover': {
                boxShadow: '0 6px 12px rgba(33,150,243,0.4)',
              },
              '&:disabled': {
                background: '#a9a9a9',
                color: 'white'
              }
            }}
          >
            Save
          </Button>
        </Box>
      </Box>
    </Box>
  )
}

export default EventDetailsManager;