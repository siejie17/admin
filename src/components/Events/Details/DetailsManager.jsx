import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    alpha,
    Box,
    Button,
    Chip,
    FormControl,
    FormHelperText,
    Grid,
    IconButton,
    MenuItem,
    Paper,
    Select,
    Switch,
    TextField,
    Tooltip,
    Typography,
    useTheme
} from '@mui/material';
import {
    CheckCircle as CheckCircleIcon,
    ChevronLeft as ChevronLeftIcon,
    ChevronRight as ChevronRightIcon,
    Delete as DeleteIcon,
    Done as DoneIcon,
    Edit as EditIcon,
    EventAvailable as EventAvailableIcon,
    EventBusy as EventBusyIcon,
    Image as ImageIcon,
    Info as InfoIcon,
    LocationOn as LocationOnIcon,
    LocationSearching as LocationSearchingIcon,
    PlayArrow as PlayArrowIcon,
    Save as SaveIcon,
    Schedule as ScheduleIcon,
    TouchApp as TouchAppIcon,
    ZoomIn as ZoomInIcon
} from '@mui/icons-material';
import { DateTimePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

import { db } from '../../../utils/firebaseConfig';
import { collection, doc, getDocs, onSnapshot, query, Timestamp, updateDoc, where } from 'firebase/firestore';

import dayjs from 'dayjs';
import imageCompression from 'browser-image-compression';

import Loader from '../../General/Loader';
import RequiredAsterisk from '../../General/RequiredAsterisk';
import SnackbarComponent from '../../General/SnackbarComponent';

import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapContainer, Marker, TileLayer, useMapEvents } from 'react-leaflet';
import { getItem } from '../../../utils/localStorage';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const DetailsManager = ({ eventID }) => {
    const theme = useTheme();

    const [facultyID, setFacultyID] = useState("");

    const [originalData, setOriginalData] = useState({});
    const [formData, setFormData] = useState({
        eventName: '',
        eventDescription: '',
        status: '',
        category: '',
        eventStartDateTime: dayjs(),
        eventEndDateTime: dayjs().add(1, 'hour'),
        registrationClosingDate: dayjs().subtract(1, 'hour'),
        locationName: '',
        locationLatitude: 0,
        locationLongitude: 0,
        requiresCapacity: false,
        isFacultyRestrict: false,
        isYearRestrict: false,
        yearsRestricted: [],
        capacity: '',
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
        yearsRestricted: '',
        capacity: '',
        images: '',
    });
    const [isLoading, setIsLoading] = useState(true);

    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [zoomedImage, setZoomedImage] = useState(null);

    // Snackbar
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarContent, setSnackbarContent] = useState({ msg: '', type: '' });

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

    const FACULTY_MAPPING = {
        "1": "FACA",
        "2": "FBE",
        "3": "FCSHD",
        "4": "FCSIT",
        "5": "FEB",
        "6": "FELC",
        "7": "FENG",
        "8": "FMHS",
        "9": "FRST",
        "10": "FSSH",
    };

    const statusConfig = {
        Scheduled: {
            icon: <EventAvailableIcon fontSize="small" />,
            color: theme.palette.info.main,
            textColor: theme.palette.info.dark,
            bgColor: theme.palette.info.light,
            gradientColors: ['rgba(33, 150, 243, 0.05)', 'rgba(33, 150, 243, 0.15)'],
        },
        Ongoing: {
            icon: <PlayArrowIcon fontSize="small" />,
            color: theme.palette.success.main,
            textColor: theme.palette.success.dark,
            bgColor: theme.palette.success.light,
            gradientColors: ['rgba(76, 175, 80, 0.05)', 'rgba(76, 175, 80, 0.15)'],
        },
        Postponed: {
            icon: <ScheduleIcon fontSize="small" />,
            color: theme.palette.warning.main,
            textColor: theme.palette.warning.dark,
            bgColor: theme.palette.warning.light,
            gradientColors: ['rgba(255, 152, 0, 0.05)', 'rgba(255, 152, 0, 0.15)'],
        },
        Completed: {
            icon: <DoneIcon fontSize="small" />,
            color: theme.palette.success.dark,
            textColor: theme.palette.success.dark,
            bgColor: theme.palette.success.light,
            gradientColors: ['rgba(56, 142, 60, 0.05)', 'rgba(56, 142, 60, 0.15)'],
        },
        Cancelled: {
            icon: <EventBusyIcon fontSize="small" />,
            color: theme.palette.error.main,
            textColor: theme.palette.error.dark,
            bgColor: theme.palette.error.light,
            gradientColors: ['rgba(244, 67, 54, 0.05)', 'rgba(244, 67, 54, 0.15)'],
        }
    };

    const currentStatus = statusConfig[formData.status] || statusConfig.Scheduled;

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
                handleChange('locationLatitude', parseFloat(lat.toFixed(4)));
                handleChange('locationLongitude', parseFloat(lng.toFixed(4)));
            }
        });
        return null;
    };

    const fetchSelectedEvent = useCallback(() => {
        if (!eventID) return () => { };

        let unsubscribeEventImages = () => { };
        const eventRef = doc(db, "event", eventID);

        const unsubscribeEvent = onSnapshot(eventRef, (eventSnap) => {
            if (!eventSnap.exists()) return;

            const eventData = eventSnap.data();
            const imagesQuery = query(collection(db, "eventImages"), where("eventID", "==", eventID));

            unsubscribeEventImages = onSnapshot(imagesQuery, (imagesSnap) => {
                const images = imagesSnap.docs.flatMap(doc =>
                    Array.isArray(doc.data().images) ? doc.data().images : []
                );

                const completedEventData = {
                    ...eventData,
                    category: CATEGORY_MAPPING[eventData.category],
                    eventStartDateTime: dayjs(eventData.eventStartDateTime.toDate?.() ?? new Date(eventData.eventStartDateTime.seconds * 1000)),
                    eventEndDateTime: dayjs(eventData.eventEndDateTime.toDate?.() ?? new Date(eventData.eventEndDateTime.seconds * 1000)),
                    registrationClosingDate: dayjs(eventData.registrationClosingDate.toDate?.() ?? new Date(eventData.registrationClosingDate.seconds * 1000)),
                    images
                };

                setOriginalData(completedEventData);
                setFormData(completedEventData);
                setIsLoading(false);
            });
        });

        return () => {
            unsubscribeEvent();
            unsubscribeEventImages();
        };
    }, [eventID]);

    useEffect(() => {
        const unsubscribe = fetchSelectedEvent();
        return () => unsubscribe();
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

        const getFacultyID = async () => {
            const adminData = await getItem("admin");
            const parsedAdminData = JSON.parse(adminData);

            setFacultyID((parsedAdminData.facultyID).toString());
        }

        getFacultyID();
    }, []);

    const hasChanges = useMemo(() => {
        if (!originalData || !formData) return false;

        return Object.keys(formData).some(key => {
            if (Array.isArray(formData[key])) {
                const originalArray = originalData[key] || [];
                const formArray = formData[key];

                if (key === "yearsRestricted") {
                    // Compare as unordered sets (sorted)
                    const sortedOriginal = [...originalArray].sort();
                    const sortedForm = [...formArray].sort();

                    if (sortedOriginal.length !== sortedForm.length) return true;

                    return !sortedForm.every((item, index) => item === sortedOriginal[index]);
                }

                // Default array comparison (order-sensitive)
                if (formArray.length !== originalArray.length) return true;
                return !formArray.every((item, index) => item === originalArray[index]);
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
        if (field === "yearsRestrcited") {
            setFormData(prev => ({
                ...prev,
                yearsRestricted: value
            }));
        } else {
            setFormData(prev => {
                const updated = {
                    ...prev,
                    [field]: value
                };

                if (field === "isYearRestrict" && value === false) {
                    updated.yearsRestricted = [];
                }

                if (field === "requiresCapacity" && value === false) {
                    delete updated.capacity;
                }

                return updated;
            });
        }

        if (value instanceof Date || dayjs.isDayjs(value)) {
            changedFields.includes(field);
        }
    };

    const handleImageChange = async (e) => {
        const files = Array.from(e.target.files);
        e.target.value = '';
        setFormErrors({ ...formErrors, images: '' });

        if (formData.images.length + files.length > 4) {
            setFormErrors({ ...formErrors, images: 'Maximum 4 images allowed' });
            return;
        }

        let hasError = false;

        const options = {
            maxSizeMB: 0.1, // 100KB
            maxWidthOrHeight: 1024,
            useWebWorker: true,
        };

        try {
            const newImages = [];

            for (const file of files) {
                const compressedFile = await imageCompression(file, options);

                const base64Data = await new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => {
                        const fullBase64 = reader.result;
                        const base64 = fullBase64.split(',')[1];
                        resolve(base64);
                    };
                    reader.onerror = reject;
                    reader.readAsDataURL(compressedFile);
                });

                newImages.push(base64Data)
            };

            if (!hasError) {
                setFormData(prev => ({
                    ...prev,
                    images: [...prev.images, ...newImages]
                }));

                changedFields.includes('images');
            }
        } catch (error) {
            console.error('Compression or preview error:', error);
            setFormErrors(prev => ({ ...prev, images: 'Failed to process image(s)' }));
        }
    };

    const handleImageRemove = (index) => {
        if (index !== 0 && formData.images.length !== 1) {
            const updatedImages = [...formData.images];
            updatedImages.splice(index, 1);

            setFormData({
                ...formData,
                images: updatedImages
            });

            setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : formData.images.length - 1));

            // Adjust current index if needed
            if (currentImageIndex >= updatedImages.length) {
                setCurrentImageIndex(Math.max(0, updatedImages.length - 1));
            }

            changedFields.includes('images');
        } else {
            const newError = "You cannot delete image when there is only one image.";
            setFormErrors({ ...formErrors, images: newError });
        }
    };

    const handleReplaceImage = async (index, e) => {
        const file = e.target.files[0];
        if (!file || !file.size) return;

        const options = {
            maxSizeMB: 0.1, // 100KB
            maxWidthOrHeight: 1024,
            useWebWorker: true,
        };

        setFormErrors({ ...formErrors, images: '' });

        try {
            const compressedFile = await imageCompression(file, options);

            const base64Data = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const fullBase64 = event.target.result;
                    const base64 = fullBase64.split(',')[1];
                    resolve(base64);
                };
                reader.onerror = reject;
                reader.readAsDataURL(compressedFile);
            });

            setFormData(prev => {
                const updatedImages = [...prev.images];
                updatedImages[index] = base64Data;
                return { ...prev, images: updatedImages };
            });
        } catch (error) {
            console.error('Image replace error:', error);
            setFormErrors(prev => ({ ...prev, images: 'Failed to replace image' }));
        }
    };

    // Navigation handlers
    const handlePrevImage = () => {
        setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : formData.images.length - 1));
    };

    const handleNextImage = () => {
        setCurrentImageIndex((prev) => (prev < formData.images.length - 1 ? prev + 1 : 0));
    };

    const handleZoomImage = (index) => {
        setZoomedImage(index);
    };

    const handleCloseZoom = () => {
        setZoomedImage(null);
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
                    ...(eventData.category && { category: CATEGORY_NUM_MAPPING[eventData.category] }),
                    ...((eventData.eventStartDateTime && eventData.eventStartDateTime.isAfter(originalData.eventStartDateTime)) && { status: "Postponed" }),
                    ...(eventData.eventStartDateTime && { eventStartDateTime: Timestamp.fromDate(eventData.eventStartDateTime.toDate()) }),
                    ...(eventData.eventEndDateTime && { eventEndDateTime: Timestamp.fromDate(eventData.eventEndDateTime.toDate()) }),
                    ...(eventData.registrationClosingDate && { registrationClosingDate: Timestamp.fromDate(eventData.registrationClosingDate.toDate()) }),
                    ...(eventData.requiresCapacity && eventData.capacity && { capacity: Number(eventData.capacity) })
                }

                await updateDoc(doc(db, "event", eventID), formattedEventData);

                if (changedFields.includes("images")) {
                    const updateImagesQuery = query(collection(db, "eventImages"), where("eventID", "==", eventID));
                    const updateImagesSnapshot = await getDocs(updateImagesQuery);

                    if (!updateImagesSnapshot.empty) {
                        const updateImagesDoc = updateImagesSnapshot.docs[0];
                        const imagesRef = doc(db, "eventImages", updateImagesDoc.id);

                        await updateDoc(imagesRef, { images });
                    }
                }

                setOriginalData(JSON.parse(JSON.stringify(formData)));

                setSnackbarOpen(true);
                setSnackbarContent({
                    msg: 'The event is edited successfully.',
                    type: 'success'
                })
            } catch (error) {
                console.error("Error updating event:", error);
            }
        }
    }

    if (isLoading) {
        return (
            <Loader loadingText="Loading event details..." />
        )
    }

    return (
        <Box component="form" onSubmit={handleEditSubmit} noValidate sx={{ width: '100%', pt: 1, pb: 8 }}>
            <Box width="100%" mb={3}>
                <Grid container spacing={2.5} py={1.5}>
                    <Grid width="100%">
                        <Box sx={{ mb: 1 }}>
                            <Typography variant="h6" sx={{
                                fontSize: "16px",
                                fontWeight: 600,
                                display: 'flex',
                                alignItems: 'center'
                            }}>
                                🚨 Event Status <RequiredAsterisk />
                            </Typography>
                        </Box>
                        <Chip
                            icon={currentStatus.icon}
                            label={
                                <Typography
                                    variant="body2"
                                    sx={{
                                        fontWeight: 600,
                                        fontSize: '0.7rem',
                                        letterSpacing: '0.01em',
                                        padding: '0 6px'
                                    }}
                                >
                                    {formData.status}
                                </Typography>
                            }
                            variant="filled"
                            sx={{
                                borderRadius: 5,
                                px: 2,
                                py: 1,
                                height: 'auto',
                                width: '100%',
                                color: currentStatus.textColor,
                                backgroundColor: theme.palette.background.paper,
                                border: `0.5px solid ${currentStatus.color}20`,
                                boxShadow: `0 2px 8px ${currentStatus.color}20`,
                                '& .MuiChip-icon': {
                                    color: currentStatus.color,
                                    marginRight: 1
                                },
                                transition: 'all 0.3s ease',
                                position: 'relative',
                                overflow: 'hidden',
                            }}
                        />
                    </Grid>
                </Grid>
            </Box>

            <Box sx={{ width: '100%', mb: 1 }}>
                <Box sx={{ width: '100%', mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                        <Typography variant="h5" sx={{
                            fontSize: "16px",
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center'
                        }}>
                            🖼️ Event Poster <RequiredAsterisk />
                        </Typography>
                        <Typography variant="body2" color='text.secondary' fontSize="12px" mt={0.5}>
                            ⚠️ Upload up to 4 event posters. The first poster will be used as the thumbnail.
                        </Typography>
                    </Box>
                </Box>

                {formData.images.length > 0 && (
                    <Box sx={{ my: 2, width: '100%' }}>
                        <Box sx={{ width: '100%', position: 'relative' }}>
                            <Paper
                                elevation={2}
                                sx={{
                                    p: 1.5,
                                    borderRadius: 3,
                                    overflow: 'hidden',
                                    position: 'relative',
                                    height: 300,
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    background: `linear-gradient(135deg, rgba(250, 250, 250, 0.5), ${theme.palette.common.white})`
                                }}
                            >
                                <Box
                                    component="img"
                                    src={`data:image/jpeg;base64,${formData.images[currentImageIndex]}`}
                                    alt={`Event Poster ${currentImageIndex + 1}`}
                                    sx={{
                                        maxWidth: '100%',
                                        maxHeight: '90%',
                                        objectFit: 'contain',
                                    }}
                                />

                                {currentImageIndex !== 0 && (
                                    <IconButton
                                        sx={{
                                            position: 'absolute',
                                            left: 10,
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            bgcolor: 'background.paper',
                                            boxShadow: 2,
                                            '&:hover': { bgcolor: 'background.paper', opacity: 0.9 }
                                        }}
                                        onClick={handlePrevImage}
                                    >
                                        <ChevronLeftIcon />
                                    </IconButton>
                                )}

                                {(formData.images.length !== 1 && currentImageIndex !== formData.images.length - 1) && (
                                    <IconButton
                                        sx={{
                                            position: 'absolute',
                                            right: 10,
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            bgcolor: 'background.paper',
                                            boxShadow: 2,
                                            '&:hover': { bgcolor: 'background.paper', opacity: 0.9 }
                                        }}
                                        onClick={handleNextImage}
                                    >
                                        <ChevronRightIcon />
                                    </IconButton>
                                )}

                                <Box
                                    sx={{
                                        position: 'absolute',
                                        top: 10,
                                        right: 10,
                                        display: 'flex',
                                        gap: 1
                                    }}
                                >
                                    <IconButton
                                        size="small"
                                        onClick={() => handleImageRemove(currentImageIndex)}
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
                                            hidden
                                            onChange={(e) => handleReplaceImage(currentImageIndex, e)}
                                        />
                                    </IconButton>
                                    <IconButton
                                        size="small"
                                        onClick={() => handleZoomImage(currentImageIndex)}
                                        sx={{
                                            bgcolor: 'success.main',
                                            color: 'white',
                                            '&:hover': {
                                                bgcolor: 'success.dark'
                                            }
                                        }}
                                    >
                                        <ZoomInIcon fontSize="small" />
                                    </IconButton>
                                </Box>

                                <Box
                                    sx={{
                                        position: 'absolute',
                                        bottom: 16,
                                        left: '50%',
                                        transform: 'translateX(-50%)',
                                        display: 'flex',
                                        gap: 1
                                    }}
                                >
                                    {formData.images.length !== 1 && formData.images.map((_, index) => (
                                        <Box
                                            key={index}
                                            sx={{
                                                width: 7,
                                                height: 7,
                                                borderRadius: '50%',
                                                bgcolor: index === currentImageIndex ? 'primary.main' : 'grey.300',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s',
                                                '&:hover': {
                                                    transform: 'scale(1.2)',
                                                    bgcolor: index === currentImageIndex ? 'primary.dark' : 'grey.400'
                                                }
                                            }}
                                            onClick={() => setCurrentImageIndex(index)}
                                        />
                                    ))}
                                </Box>
                            </Paper>

                            <Typography
                                variant="body2"
                                sx={{
                                    fontSize: "12px",
                                    textAlign: 'center',
                                    mt: 2,
                                    color: 'text.secondary',
                                    fontStyle: 'italic'
                                }}
                            >
                                Image {currentImageIndex + 1} of {formData.images.length}
                            </Typography>
                        </Box>
                    </Box>
                )}

                <Button
                    variant="contained"
                    component="label"
                    startIcon={<ImageIcon />}
                    sx={{
                        width: '100%',
                        mb: 1.5,
                        borderRadius: 3,
                        py: 1.5,
                        px: 4,
                        background: 'linear-gradient(90deg, #3a7bd5, #3a6073)',
                        boxShadow: '0 4px 10px rgba(58, 123, 213, 0.2)',
                        transition: 'all 0.3s ease',
                        fontWeight: 500,
                        textTransform: 'none',
                        fontSize: '0.875rem',
                        '&:hover': {
                            background: 'linear-gradient(90deg, #3a7bd5, #4a7b93)',
                            transform: 'translateY(-1px)',
                            boxShadow: '0 8px 15px rgba(58, 123, 213, 0.3)',
                        },
                        '&:disabled': {
                            background: '#e0e0e0',
                            color: '#9e9e9e',
                            boxShadow: 'none',
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

                {formErrors?.images && <FormHelperText error>{formErrors.images}</FormHelperText>}
            </Box>

            {/* Zoomed Image Overlay */}
            {zoomedImage !== null && (
                <Box
                    sx={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        bgcolor: 'rgba(0,0,0,0.85)',
                        zIndex: 9999,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                    onClick={handleCloseZoom}
                >
                    <Box
                        sx={{
                            position: 'relative',
                            maxWidth: '90%',
                            maxHeight: '90%',
                            overflow: 'hidden'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <Box
                            component="img"
                            src={`data:image/jpeg;base64,${formData.images[zoomedImage]}`}
                            alt={`Event ${zoomedImage + 1}`}
                            sx={{
                                maxWidth: '100%',
                                maxHeight: '90vh',
                                objectFit: 'contain',
                                borderRadius: 2
                            }}
                        />
                        <IconButton
                            sx={{
                                position: 'absolute',
                                top: 10,
                                right: 10,
                                bgcolor: 'rgba(255,255,255,0.3)',
                                color: 'white',
                                '&:hover': {
                                    bgcolor: 'rgba(255,255,255,0.5)'
                                }
                            }}
                            onClick={handleCloseZoom}
                        >
                            <DeleteIcon />
                        </IconButton>
                    </Box>
                </Box>
            )}

            <Grid container spacing={2.5}>
                <Grid width="100%">
                    <Box sx={{ mb: 1 }}>
                        <Typography variant="h6" sx={{
                            fontSize: "16px",
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center'
                        }}>
                            🎉 Event Name <RequiredAsterisk />
                        </Typography>
                    </Box>
                    <TextField
                        fullWidth
                        placeholder="Enter event name..."
                        value={formData.eventName}
                        onChange={(e) => handleChange('eventName', e.target.value)}
                        error={formErrors.eventName}
                        helperText={formErrors.eventName}
                        required
                        variant="outlined"
                        InputProps={{
                            sx: { borderRadius: 2, fontSize: "13px" }
                        }}
                    />
                </Grid>

                <Grid width="100%">
                    <Box sx={{ mb: 1 }}>
                        <Typography variant="h6" sx={{
                            fontSize: "16px",
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center'
                        }}>
                            📄 Description <RequiredAsterisk />
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
                            sx: { borderRadius: 2, fontSize: "13px" }
                        }}
                    />
                </Grid>


                <Grid width="100%">
                    <Box sx={{ mb: 1 }}>
                        <Typography variant="h6" sx={{
                            fontSize: "16px",
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center'
                        }}>
                            🗃️ Event Category <RequiredAsterisk />
                        </Typography>
                    </Box>
                    <FormControl fullWidth error={Boolean(formErrors.category)} required>
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
                            sx={{ borderRadius: 2, fontSize: "13px" }}
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
                </Grid>
            </Grid>

            <Grid container spacing={3} py={3}>
                {/* Event Start Date & Time */}
                <Grid width="100%">
                    <Box sx={{ mb: 2 }}>
                        <Typography variant="h6" sx={{
                            fontSize: "16px",
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center'
                        }}>
                            🕐 Event Start Date & Time <RequiredAsterisk />
                        </Typography>
                        <Typography variant="body2" sx={{
                            fontSize: "12px",
                            color: 'text.secondary',
                            display: 'flex',
                            alignItems: 'center',
                            mt: 0.5
                        }}>
                            ⚠️ Use the calendar icon to pick date & time
                        </Typography>
                    </Box>

                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DateTimePicker
                            {...commonPickerProps}
                            value={formData.eventStartDateTime}
                            onChange={(newDate) => handleChange('eventStartDateTime', newDate)}
                            minDateTime={now}
                            shouldDisableDate={(date) => date.isBefore(now)}
                            slotProps={{
                                textField: {
                                    error: false,
                                },
                            }}
                            sx={{
                                width: '100%',
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 2,
                                    '& fieldset': {
                                        borderColor: formErrors.eventStartDateTime ? 'red' : undefined,
                                    },
                                    '& input': {
                                        fontSize: '13px',
                                    },
                                },
                            }}
                        />
                    </LocalizationProvider>
                    {formErrors.eventStartDateTime && (
                        <FormHelperText error sx={{ ml: 1, mt: 1 }}>
                            {formErrors.eventStartDateTime}
                        </FormHelperText>
                    )}
                </Grid>

                {/* Event End Date & Time */}
                <Grid width="100%">
                    <Box sx={{ mb: 2 }}>
                        <Typography variant="h6" sx={{
                            fontSize: "16px",
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center'
                        }}>
                            🕤 Event End Date & Time <RequiredAsterisk />
                        </Typography>
                        <Typography variant="body2" sx={{
                            fontSize: "12px",
                            color: 'text.secondary',
                            display: 'flex',
                            alignItems: 'center',
                            mt: 0.5
                        }}>
                            ⚠️ Must be in the future after event start
                        </Typography>
                    </Box>

                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DateTimePicker
                            {...commonPickerProps}
                            value={formData.eventEndDateTime}
                            onChange={(newDate) => handleChange('eventEndDateTime', newDate)}
                            minDateTime={formData.eventStartDateTime?.add(1, "hour")}
                            disabled={!formData.eventStartDateTime}
                            sx={{
                                width: '100%',
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 2,
                                    '& fieldset': {
                                        borderColor: formErrors.eventEndDateTime ? 'red' : undefined,
                                    },
                                    '& input': {
                                        fontSize: '13px',
                                    },
                                },
                            }}
                        />
                    </LocalizationProvider>
                    {formErrors.eventEndDateTime && (
                        <FormHelperText error sx={{ ml: 1, mt: 1 }}>
                            {formErrors.eventEndDateTime}
                        </FormHelperText>
                    )}
                </Grid>

                {/* Registration Closing Date */}
                <Grid width="100%">
                    <Box sx={{ mb: 2 }}>
                        <Typography variant="h6" sx={{
                            fontSize: "16px",
                            fontWeight: 550,
                            display: 'flex',
                            alignItems: 'center'
                        }}>
                            🕘Registration Closing Date <RequiredAsterisk />
                        </Typography>
                        <Typography variant="body2" sx={{
                            fontSize: "12px",
                            color: 'text.secondary',
                            display: 'flex',
                            alignItems: 'center',
                            mt: 0.5
                        }}>
                            ⚠️ Must be in the future and ≥ 1 hour before event start
                        </Typography>
                    </Box>

                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DateTimePicker
                            {...commonPickerProps}
                            value={formData.registrationClosingDate}
                            onChange={(newDate) => handleChange('registrationClosingDate', newDate)}
                            minDateTime={now}
                            maxDateTime={formData.eventStartDateTime?.subtract(1, "hour")}
                            disabled={originalData.eventStartDateTime === formData.eventStartDateTime && formData.registrationClosingDate.isBefore(now)}
                            shouldDisableDate={(date) => formData.eventStartDateTime && date.isAfter(formData.eventStartDateTime)}
                            slotProps={{
                                textField: {
                                    error: false,
                                },
                            }}
                            sx={{
                                width: '100%',
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 2,
                                    '& fieldset': {
                                        borderColor: formErrors.registrationClosingDate ? 'red' : undefined,
                                        fontSize: "13px"
                                    },
                                    '& input': {
                                        fontSize: '13px',
                                    },
                                },
                            }}
                        />
                    </LocalizationProvider>
                    {formErrors.registrationClosingDate && (
                        <FormHelperText error sx={{ ml: 1, mt: 1 }}>
                            {formErrors.registrationClosingDate}
                        </FormHelperText>
                    )}
                </Grid>
            </Grid>

            <Box sx={{ width: '100%', mb: 3 }}>
                <Box sx={{ width: '100%', mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 550, fontSize: "16px" }}>
                        🗺️ Event Location <RequiredAsterisk />
                    </Typography>
                    <Typography variant="body2" color="text.secondary" fontSize="12px">
                        ⚠️ Suggested Format: Building/Faculty - Room/Hall (e.g., FCSIT - AI Lab)
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
                        sx: { borderRadius: 2, fontSize: "13px" }
                    }}
                />
            </Box>

            <Box sx={{ width: '100%', mb: 3 }}>
                <Box sx={{ width: '100%', mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 550, fontSize: "16px" }}>
                        📍 Location Pinpoint <RequiredAsterisk />
                    </Typography>
                    <Typography variant="body2" color="text.secondary" fontSize="12px">
                        ⚠️ Important: Accurate location setting is required for student attendance and quest verification.
                    </Typography>
                </Box>

                <Box
                    sx={{
                        maxWidth: "95%",
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
                            px: 2.5,
                            py: 1.5,
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
                                mr: 1.5
                            }}
                        >
                            <LocationOnIcon fontSize="small" />
                        </Box>
                        <Typography variant="subtitle1" fontWeight={600} fontSize={14}>
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
                                <CheckCircleIcon fontSize="small" sx={{ mr: 0.75, fontSize: '16px' }} />
                                Location Selected
                            </Typography>
                        )}
                    </Box>

                    <Box
                        sx={{
                            height: '500px',
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
                                <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                                    Coordinates:
                                </Typography>
                                <Box
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center'
                                    }}
                                >
                                    <Chip
                                        label={`Latitude: ${parseFloat(formData.locationLatitude.toFixed(4))}`}
                                        size="small"
                                        sx={{
                                            mr: 1,
                                            fontFamily: 'monospace',
                                            fontWeight: 500,
                                            fontSize: "10px",
                                            backgroundColor: 'rgba(33,150,243,0.1)',
                                            color: 'primary.dark'
                                        }}
                                    />
                                    <Chip
                                        label={`Longitude: ${parseFloat(formData.locationLongitude.toFixed(4))}`}
                                        size="small"
                                        sx={{
                                            fontFamily: 'monospace',
                                            fontSize: "10px",
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
                                    fontSize: '0.75rem'
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

                <Box sx={{ mb: 1 }}>
                    <Box sx={{ mb: 3 }}>
                        <Typography
                            variant="h5"
                            sx={{
                                fontWeight: 700,
                                fontSize: '20px',
                                mb: 2,
                                display: 'flex',
                                alignItems: 'center',
                            }}
                        >
                            🎯 Registration Restrictions
                        </Typography>
                    </Box>

                    <Box sx={{ border: `2px dotted ${alpha(theme.palette.divider, 0.4)}`, p: 4 }}>
                        <Grid container spacing={2}>
                            {/* Attendance Capacity */}
                            <Grid size={{ xs: 12, md: 6 }}>
                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="h6" sx={{
                                        fontSize: "16px",
                                        fontWeight: 600,
                                        display: 'flex',
                                        alignItems: 'center'
                                    }}>
                                        👥 Attendance Capacity <RequiredAsterisk />
                                    </Typography>
                                </Box>

                                <Box
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        p: 2,
                                        borderRadius: 2,
                                        bgcolor: alpha(theme.palette.background.default, 0.6),
                                        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
                                    }}
                                >
                                    <Switch
                                        checked={formData.requiresCapacity}
                                        onChange={() => handleChange('requiresCapacity', !formData.requiresCapacity)}
                                        color="primary"
                                    />
                                    <Box sx={{ ml: 2 }}>
                                        <Typography variant="subtitle1" fontWeight={500}>
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
                                        <InfoIcon sx={{ ml: 'auto', color: 'text.secondary' }} />
                                    </Tooltip>
                                </Box>

                                {formData.requiresCapacity && (
                                    <Box sx={{ mt: 2 }}>
                                        <TextField
                                            fullWidth
                                            placeholder="Enter attendance capacity"
                                            value={formData.capacity ? formData.capacity : ''}
                                            onChange={(e) => handleChange('capacity', e.target.value)}
                                            type="number"
                                            error={Boolean(formErrors.capacity)}
                                            helperText={formErrors.capacity}
                                            required
                                            variant="outlined"
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
                                                }
                                            }}
                                        />
                                    </Box>
                                )}
                            </Grid>

                            <Grid size={{ xs: 12, md: 6 }}>
                                <Box sx={{ mb: 2 }}>
                                    <Typography
                                        variant="h6"
                                        sx={{
                                            fontSize: "16px",
                                            fontWeight: 600,
                                            display: 'flex',
                                            alignItems: 'center'
                                        }}
                                    >
                                        🎓 Year of Study Restriction <RequiredAsterisk />
                                    </Typography>
                                </Box>

                                <Box
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        p: 2,
                                        borderRadius: 2,
                                        bgcolor: alpha(theme.palette.background.default, 0.6),
                                        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
                                    }}
                                >
                                    <Switch
                                        checked={formData.isYearRestrict}
                                        onChange={() => handleChange("isYearRestrict", !formData.isYearRestrict)}
                                        color="primary"
                                    />
                                    <Box sx={{ ml: 2 }}>
                                        <Typography variant="subtitle1" fontWeight={500} fontSize={15}>
                                            {formData.isYearRestrict ? "Year Restriction Enabled" : "No Year Restriction"}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" fontSize={12}>
                                            {formData.isYearRestrict
                                                ? "Only students in the selected years will be allowed to register"
                                                : "Students from all years can participate"
                                            }
                                        </Typography>
                                    </Box>
                                    <Tooltip
                                        title="Toggle this to restrict event participation to specific years of study"
                                        arrow
                                    >
                                        <InfoIcon sx={{ ml: 'auto', color: 'text.secondary' }} />
                                    </Tooltip>
                                </Box>

                                {formData.isYearRestrict && (
                                    <Box sx={{ pt: 2 }}>
                                        <FormControl fullWidth required>
                                            <Select
                                                multiple
                                                displayEmpty
                                                value={formData.yearsRestricted}
                                                onChange={(e) => handleChange("yearsRestricted", e.target.value)}
                                                renderValue={(selected = []) => {
                                                    if (selected.length == 0) {
                                                        return <div style={{ color: '#a9a9a9', fontSize: '13px' }}>Select year(s)</div>; // 👈 Placeholder text
                                                    }
                                                    return (
                                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                            {selected.map((value) => (
                                                                <Chip key={value} label={`Year ${value}`} />
                                                            ))}
                                                        </Box>
                                                    );
                                                }}
                                                sx={{ minHeight: 56 }}
                                            >
                                                {[1, 2, 3, 4, 5].map((year) => (
                                                    <MenuItem key={year} value={year}>
                                                        Year {year}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Box>
                                )}
                            </Grid>

                            <Grid size={{ xs: 12, md: 6 }}>
                                <Box sx={{ mb: 2 }}>
                                    <Typography
                                        variant="h6"
                                        sx={{
                                            fontSize: "16px",
                                            fontWeight: 600,
                                            display: 'flex',
                                            alignItems: 'center'
                                        }}
                                    >
                                        🏫 Faculty Restriction <RequiredAsterisk />
                                    </Typography>
                                </Box>

                                <Box
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        p: 2,
                                        borderRadius: 2,
                                        bgcolor: alpha(theme.palette.background.default, 0.6),
                                        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
                                    }}
                                >
                                    <Switch
                                        checked={formData.isFacultyRestrict}
                                        onChange={() => handleChange("isFacultyRestrict", !formData.isFacultyRestrict)}
                                        color="primary"
                                    />
                                    <Box sx={{ ml: 2 }}>
                                        <Typography variant="subtitle1" fontWeight={500} fontSize={15}>
                                            {formData.isFacultyRestrict ? "Faculty Restriction Enabled" : "No Faculty Restriction"}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" fontSize={12}>
                                            {formData.isFacultyRestrict
                                                ? `Only students from ${FACULTY_MAPPING[facultyID]} will be allowed to register`
                                                : "Students from all faculties can participate"}
                                        </Typography>
                                    </Box>
                                    <Tooltip
                                        title={`Toggle this to restrict event participation to students from ${FACULTY_MAPPING[facultyID]}`}
                                        arrow
                                    >
                                        <InfoIcon sx={{ ml: 'auto', color: 'text.secondary' }} />
                                    </Tooltip>
                                </Box>
                            </Grid>

                            <Grid size={{ xs: 12, md: 6 }}>
                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="h6" sx={{
                                        fontSize: "16px",
                                        fontWeight: 600,
                                        display: 'flex',
                                        alignItems: 'center'
                                    }}>
                                        🧾 Payment Proof Requirement <RequiredAsterisk />
                                    </Typography>
                                </Box>

                                <Box
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        p: 2,
                                        borderRadius: 2,
                                        bgcolor: alpha(theme.palette.background.default, 0.6),
                                        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
                                    }}
                                >
                                    <Switch
                                        checked={formData.paymentProofRequired}
                                        onChange={() => handleChange('paymentProofRequired', !formData.paymentProofRequired)}
                                        color="primary"
                                    />
                                    <Box sx={{ ml: 2 }}>
                                        <Typography variant="subtitle1" fontWeight={500} fontSize={15}>
                                            {formData.paymentProofRequired ? "Payment Verification Required" : "No Payment Verification"}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" fontSize={12}>
                                            {formData.paymentProofRequired
                                                ? "Students must upload payment proof (max 50KB)"
                                                : "No payment documentation needed for registration"
                                            }
                                        </Typography>
                                    </Box>
                                    <Tooltip title="When enabled, students will be prompted to upload payment receipts (JPEG or PNG format, maximum 50KB)" arrow>
                                        <InfoIcon sx={{ ml: 'auto', color: 'text.secondary' }} />
                                    </Tooltip>
                                </Box>
                            </Grid>
                        </Grid>
                    </Box>
                </Box>

                <SnackbarComponent snackbarOpen={snackbarOpen} setSnackbarOpen={setSnackbarOpen} snackbarContent={snackbarContent} />

                <Box
                    sx={{
                        position: 'fixed',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        padding: '12px 20px',
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(8px)',
                        borderTop: '1px solid rgba(0, 0, 0, 0.1)',
                        display: 'flex',
                        justifyContent: 'flex-end',
                        alignItems: 'center',
                        zIndex: 100,
                        boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.05)',
                        transition: 'transform 0.3s ease-in-out',
                    }}
                >
                    <Box sx={{ display: 'flex' }}>
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            disabled={!hasChanges}
                            startIcon={<SaveIcon />}
                            sx={{
                                borderRadius: 2,
                                py: 1,
                                px: 2,
                                fontWeight: 600,
                                fontSize: "12px",
                                textTransform: 'none',
                                backgroundColor: '#1976d2',
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                    backgroundColor: '#1565c0',
                                    transform: 'translateY(-2px)',
                                    boxShadow: '0 4px 8px rgba(21, 101, 192, 0.3)'
                                },
                                '&:disabled': {
                                    backgroundColor: '#e0e0e0',
                                    color: '#9e9e9e'
                                }
                            }}
                        >
                            Save Changes
                        </Button>
                    </Box>
                </Box>
            </Box>
        </Box>
    )
}

export default DetailsManager;