import React, { useEffect, useMemo, useState } from 'react';
import { alpha, Box, Button, Chip, Fade, FormControl, FormControlLabel, FormHelperText, Grid, IconButton, MenuItem, Paper, Select, Stack, Switch, TextField, Tooltip, Typography, useTheme } from '@mui/material'
import { DateTimePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import {
    CheckCircle as CheckCircleIcon,
    ChevronLeft as ChevronLeftIcon,
    ChevronRight as ChevronRightIcon,
    Delete as DeleteIcon,
    Edit as EditIcon,
    Image as ImageIcon,
    Info as InfoIcon,
    LocationOn as LocationOnIcon,
    LocationSearching as LocationSearchingIcon,
    SkipNext as SkipNextIcon,
    TouchApp as TouchAppIcon,
    ZoomIn as ZoomInIcon
} from '@mui/icons-material';

import RequiredAsterisk from '../../components/General/RequiredAsterisk';

import { useNavigate } from 'react-router-dom';
import { FitnessCenter as FitnessCenterIcon, KeyboardArrowDown as KeyboardArrowDownIcon, MoreHoriz as MoreHorizIcon, Public as PublicIcon, School as SchoolIcon, SportsBasketball as SportsBasketballIcon, TheaterComedy as TheaterComedyIcon, VolunteerActivism as VolunteerActivismIcon } from '@mui/icons-material';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const EventDetailsCreation = ({
    name,
    setName,
    description,
    setDescription,
    category,
    setCategory,
    startDateTime,
    setStartDateTime,
    endDateTime,
    setEndDateTime,
    registrationDate,
    setRegistrationDate,
    location,
    setLocation,
    pinpoint,
    setPinpoint,
    images,
    setImages,
    requiresCapacity,
    setRequiresCapacity,
    capacity,
    setCapacity,
    requiresPaymentProof,
    setRequiresPaymentProof,
    errors,
    setErrors,
    handleImageChange,
    handleRemoveImage,
    handleReplaceImage,
    handleDetailsSubmit
}) => {
    const theme = useTheme();
    const now = dayjs();

    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    // Navigation
    const navigate = useNavigate();

    useEffect(() => {
        const currentErrors = { ...errors };

        currentErrors.pinpoint = "";

        setErrors(currentErrors);
    }, [requiresCapacity]);

    useEffect(() => {
        if (errors.pinpoint) {
            const timer = setTimeout(() => {
                // Clear the error after 3 seconds
                setErrors((prevErrors) => ({ ...prevErrors, pinpoint: '' }));
            }, 1000);

            // Cleanup in case the component unmounts or errors change
            return () => clearTimeout(timer);
        }
    }, [errors.pinpoint]);

    const MapEvents = ({ onMapClick }) => {
        useMapEvents({
            click: (e) => {
                const { lat, lng } = e.latlng;
                const newErrors = { ...errors };

                const minLat = 1.4581;
                const maxLat = 1.4737;
                const minLng = 110.4187;
                const maxLng = 110.4557;

                if (lat >= minLat && lat <= maxLat && lng >= minLng && lng <= maxLng) {
                    onMapClick(e.latlng);
                    newErrors.pinpoint = "";
                } else {
                    newErrors.pinpoint = "Please select a location within UNIMAS area.";
                }

                setErrors(newErrors);
            }
        });
        return null;
    };

    const handleStartDateChange = (newDate) => {
        setStartDateTime(newDate);

        if (newDate) {
            setEndDateTime(newDate.add(1, "hour"));
            setRegistrationDate(newDate.subtract(1, 'hour'));
        }
    }

    const handleEndDateChange = (newDate) => {
        setEndDateTime(newDate);
    }

    // Error handlers for each picker
    const handleStartDateError = (error) => {
        const newErrors = { ...errors };
        if (error) {
            newErrors.startDateTime = 'Please select a valid future date and time';
        } else {
            delete newErrors.startDateTime;
        }
        setErrors(newErrors);
    };

    const handleEndDateError = (error) => {
        const newErrors = { ...errors };
        if (error) {
            newErrors.endDateTime = 'Please select a valid date and time after the event start';
        } else {
            delete newErrors.endDateTime;
        }
        setErrors(newErrors);
    };

    const handleRegistrationDateError = (error) => {
        const newErrors = { ...errors };
        if (error) {
            newErrors.registrationDate = 'Please select a valid date and time before the event start';
        } else {
            delete newErrors.registrationDate;
        }
        setErrors(newErrors);
    };

    // Navigation handlers
    const handlePrevImage = () => {
        setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
    };

    const handleNextImage = () => {
        setCurrentImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
    };

    const hasAllFieldsFilled = useMemo(() => {
        const fieldsFilled = name && description && category && startDateTime && endDateTime && registrationDate && location && pinpoint && images.length > 0;
        const capacityValid = (requiresCapacity && !isNaN(capacity) && capacity > 0);

        return fieldsFilled && capacityValid;
    }, [name, description, category, startDateTime, endDateTime, registrationDate, location, pinpoint, images, requiresCapacity, capacity]);

    // Common props for all DateTimePickers
    const commonPickerProps = {
        sx: { width: '100%' },
        slotProps: {
            textField: {
                fullWidth: true,
                variant: 'outlined'
            }
        }
    };

    return (
        <Box component="form" onSubmit={handleDetailsSubmit} noValidate sx={{ width: '100%', pt: 1, pb: 8 }}>
            <Box sx={{ width: '100%' }}>
                {images.length > 0 && (
                    <Box sx={{ width: '100%', mb: 1 }}>
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
                                    background: `linear-gradient(135deg, rgba(250, 250, 250, 0.5), ${theme.palette.common.white})`
                                }}
                            >
                                <Box
                                    component="img"
                                    src={`data:image/jpeg;base64,${images[currentImageIndex].preview}`}
                                    alt={`Event Poster ${currentImageIndex + 1}`}
                                    sx={{
                                        maxWidth: '100%',
                                        maxHeight: '90%',
                                        objectFit: 'contain',
                                        borderRadius: '10px'
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

                                {(images.length !== 1 && currentImageIndex !== images.length - 1) && (
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
                                        right: 15,
                                        display: 'flex',
                                        gap: 1,
                                    }}
                                >
                                    <IconButton
                                        size="small"
                                        onClick={() => handleRemoveImage(currentImageIndex)}
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
                                    {images.length !== 1 && images.map((_, index) => (
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
                                Image {currentImageIndex + 1} of {images.length}
                            </Typography>
                        </Box>
                    </Box>
                )}

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
                            ⚠️ Upload up to 4 event posters (max 50KB each). The first uploaded image will be used as the event thumbnail.
                        </Typography>
                    </Box>
                </Box>
            </Box>

            {/* Event Poster Images Field - Full width row */}
            <Box sx={{ width: '100%', mb: 2 }}>
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
                    disabled={images.length >= 4}
                    color="primary"
                >
                    {images.length > 0 ? 'Add Another Poster' : 'Upload Event Poster'}
                    <input
                        type="file"
                        accept="image/*"
                        hidden
                        onChange={handleImageChange}
                    />
                </Button>

                {errors.images && (
                    <FormHelperText error sx={{ ml: 1 }}>{errors.images}</FormHelperText>
                )}
            </Box>

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
                        placeholder="Enter event name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        error={!!errors.name}
                        helperText={errors.name}
                        required
                        variant="outlined"
                        InputProps={{
                            sx: { borderRadius: 2, fontSize: "13px" }
                        }}
                    />
                </Grid>

                <Grid item xs={12} width="100%">
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
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        error={!!errors.description}
                        helperText={errors.description}
                        multiline
                        rows={5}
                        required
                        variant="outlined"
                        InputProps={{
                            sx: { borderRadius: 2, fontSize: "13px" }
                        }}
                    />
                </Grid>

                <Grid item xs={12} width="100%">
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
                    <FormControl fullWidth error={Boolean(errors.category)} required>
                        <Select
                            displayEmpty
                            renderValue={(selected) => {
                                if (selected.length === 0) {
                                    return <div style={{ color: '#a9a9a9', fontSize: '13px' }}>Select an event category</div>
                                }
                                return (
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                        {selected === "Academic" && <SchoolIcon sx={{ mr: 1, fontSize: 16 }} />}
                                        {selected === "Volunteering" && <VolunteerActivismIcon sx={{ mr: 1, fontSize: 16 }} />}
                                        {selected === "Entertainment" && <TheaterComedyIcon sx={{ mr: 1, fontSize: 16 }} />}
                                        {selected === "Cultural" && <PublicIcon sx={{ mr: 1, fontSize: 16 }} />}
                                        {selected === "Sports" && <SportsBasketballIcon sx={{ mr: 1, fontSize: 16 }} />}
                                        {selected === "Health & Wellness" && <FitnessCenterIcon sx={{ mr: 1, fontSize: 16 }} />}
                                        {selected === "Others" && <MoreHorizIcon sx={{ mr: 1, fontSize: 16 }} />}
                                        {selected}
                                    </div>
                                );
                            }}
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            sx={{
                                borderRadius: 2,
                                fontSize: "14px",
                                '& .MuiOutlinedInput-notchedOutline': {
                                    borderColor: '#e0e0e0',
                                },
                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                    borderColor: '#bdbdbd',
                                },
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                    borderColor: '#3f51b5',
                                    borderWidth: '2px',
                                },
                                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                                transition: 'all 0.2s ease-in-out',
                            }}
                            MenuProps={{
                                PaperProps: {
                                    sx: {
                                        borderRadius: 2,
                                        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                                        mt: 0.5,
                                    }
                                }
                            }}
                            IconComponent={(props) => (
                                <KeyboardArrowDownIcon
                                    {...props}
                                    sx={{
                                        color: '#757575',
                                        transition: 'transform 0.2s',
                                        transform: category ? 'rotate(180deg)' : 'rotate(0)',
                                    }}
                                />
                            )}
                        >
                            <MenuItem disabled value="" sx={{ display: 'none', fontSize: '13px' }}>
                                <em>Select an event category</em>
                            </MenuItem>
                            <MenuItem value="Academic" sx={{ fontSize: '13px', py: 1.2 }}>
                                <SchoolIcon sx={{ mr: 2, fontSize: 16, color: '#1565c0' }} /> Academic
                            </MenuItem>
                            <MenuItem value="Volunteering" sx={{ fontSize: '13px', py: 1.2 }}>
                                <VolunteerActivismIcon sx={{ mr: 2, fontSize: 16, color: '#4caf50' }} /> Volunteering
                            </MenuItem>
                            <MenuItem value="Entertainment" sx={{ fontSize: '13px', py: 1.2 }}>
                                <TheaterComedyIcon sx={{ mr: 2, fontSize: 16, color: '#f44336' }} /> Entertainment
                            </MenuItem>
                            <MenuItem value="Cultural" sx={{ fontSize: '13px', py: 1.2 }}>
                                <PublicIcon sx={{ mr: 2, fontSize: 16, color: '#9c27b0' }} /> Cultural
                            </MenuItem>
                            <MenuItem value="Sports" sx={{ fontSize: '13px', py: 1.2 }}>
                                <SportsBasketballIcon sx={{ mr: 2, fontSize: 16, color: '#ff9800' }} /> Sports
                            </MenuItem>
                            <MenuItem value="Health & Wellness" sx={{ fontSize: '13px', py: 1.2 }}>
                                <FitnessCenterIcon sx={{ mr: 2, fontSize: 16, color: '#2196f3' }} /> Health & Wellness
                            </MenuItem>
                            <MenuItem value="Others" sx={{ fontSize: '13px', py: 1.2 }}>
                                <MoreHorizIcon sx={{ mr: 2, fontSize: 16, color: '#757575' }} /> Others
                            </MenuItem>
                        </Select>
                        {errors.category && <FormHelperText>{errors.category}</FormHelperText>}
                    </FormControl>
                </Grid>
            </Grid>

            <Grid container spacing={3} py={3}>
                {/* Event Start Date & Time */}
                <Grid item xs={12} width="100%">
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
                            value={startDateTime}
                            onChange={handleStartDateChange}
                            onError={handleStartDateError}
                            minDateTime={now}
                            shouldDisableDate={(date) => date.isBefore(now)}
                            sx={{
                                width: '100%',
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 2,
                                    '& fieldset': {
                                        borderColor: errors.startDateTime ? 'red' : undefined,
                                    },
                                    '& input': {
                                        fontSize: '13px',
                                    },
                                },
                            }}
                        />
                    </LocalizationProvider>
                    {errors.startDateTime && (
                        <FormHelperText error sx={{ ml: 1, mt: 1 }}>
                            {errors.startDateTime}
                        </FormHelperText>
                    )}
                </Grid>

                {/* Event End Date & Time */}
                <Grid item xs={12} width="100%">
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
                            {!startDateTime ? "⚠️ Please select event start date & time first" : "⚠️ Must be in the future after event start (Use the calendar icon to pick date & time)"}
                        </Typography>
                    </Box>

                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DateTimePicker
                            {...commonPickerProps}
                            value={endDateTime}
                            onChange={handleEndDateChange}
                            onError={handleEndDateError}
                            minDateTime={startDateTime?.add(1, "hour")}
                            disabled={!startDateTime}
                            shouldDisableDate={(date) => startDateTime && date.isBefore(startDateTime)}
                            sx={{
                                width: '100%',
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 2,
                                    '& fieldset': {
                                        borderColor: errors.endDateTime ? 'red' : undefined,
                                    },
                                    '& input': {
                                        fontSize: '13px',
                                    },
                                },
                            }}
                        />
                    </LocalizationProvider>
                    {errors.endDateTime && (
                        <FormHelperText error sx={{ ml: 1, mt: 1 }}>
                            {errors.endDateTime}
                        </FormHelperText>
                    )}
                </Grid>

                {/* Registration Closing Date */}
                <Grid item xs={12} width="100%">
                    <Box sx={{ mb: 2 }}>
                        <Typography variant="h6" sx={{
                            fontSize: "16px",
                            fontWeight: 550,
                            display: 'flex',
                            alignItems: 'center'
                        }}>
                            🕘 Registration Closing Date <RequiredAsterisk />
                        </Typography>
                        <Typography variant="body2" sx={{
                            fontSize: "12px",
                            color: 'text.secondary',
                            display: 'flex',
                            alignItems: 'center',
                            mt: 0.5
                        }}>
                            {!startDateTime ? "⚠️ Please select event start date & time first" : "⚠️ Must be in the future and ≥ 1 hour before event start (Use the calendar icon to pick date & time)"}
                        </Typography>
                    </Box>

                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DateTimePicker
                            {...commonPickerProps}
                            value={registrationDate}
                            onChange={setRegistrationDate}
                            onError={handleRegistrationDateError}
                            minDateTime={now}
                            maxDateTime={startDateTime?.subtract(1, "hour")}
                            disabled={!startDateTime}
                            shouldDisableDate={(date) => startDateTime && date.isAfter(startDateTime)}
                            sx={{
                                width: '100%',
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 2,
                                    '& fieldset': {
                                        borderColor: errors.registrationDate ? 'red' : undefined,
                                        fontSize: "13px"
                                    },
                                    '& input': {
                                        fontSize: '13px',
                                    },
                                },
                            }}
                        />
                    </LocalizationProvider>
                    {errors.registrationDate && (
                        <FormHelperText error sx={{ ml: 1, mt: 1 }}>
                            {errors.registrationDate}
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
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    error={!!errors.location}
                    helperText={errors.location}
                    required
                    variant="outlined"
                    InputProps={{
                        sx: { borderRadius: 2, fontSize: "13px" }
                    }}
                />
            </Box>

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
                    maxWidth: "85%",
                    mx: "auto",
                    overflow: "hidden",
                    borderRadius: 3,
                    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.08)",
                    border: "1px solid rgba(0, 0, 0, 0.05)",
                    backgroundColor: "#ffffff"
                }}
            >
                {/* Map Header */}
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
                    {pinpoint && (
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
                            <CheckCircleIcon fontSize="small" sx={{ mr: 0.5, fontSize: '16px' }} />
                            Location Selected
                        </Typography>
                    )}
                </Box>

                {/* Map Container */}
                <Box
                    sx={{
                        height: '250px',
                        position: 'relative',
                        '& .leaflet-container': {
                            height: '100%',
                            width: '100%',
                            zIndex: 1
                        }
                    }}
                >
                    <MapContainer
                        center={{ lat: 1.4656, lng: 110.4277 }}
                        zoom={16}
                        style={{ height: '100%', width: '100%' }}
                    >
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                            url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
                        />
                        {pinpoint && (
                            <Marker position={pinpoint} />
                        )}
                        <MapEvents onMapClick={setPinpoint} />
                    </MapContainer>

                    {!pinpoint && (
                        <Box
                            sx={{
                                position: 'absolute',
                                bottom: 10,
                                left: '25%',
                                transform: 'translateX(-50%)',
                                backgroundColor: 'rgba(255,255,255,0.9)',
                                padding: '8px 16px',
                                borderRadius: 8,
                                boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
                                zIndex: 500,
                                border: '1px solid rgba(0,0,0,0.05)',
                                display: 'flex',
                                alignItems: 'center',
                            }}
                        >
                            <TouchAppIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                            <Typography variant="caption" color="text.secondary">
                                Click on the map to set event location
                            </Typography>
                        </Box>
                    )}
                </Box>

                {/* Coordinates Display */}
                {pinpoint && (
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
                                    label={`Lat: ${parseFloat(pinpoint.lat.toFixed(4))}`}
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
                                    label={`Long: ${parseFloat(pinpoint.lng.toFixed(4))}`}
                                    size="small"
                                    sx={{
                                        fontFamily: 'monospace',
                                        fontWeight: 500,
                                        fontSize: "10px",
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
                                const deleteError = { ...errors };

                                deleteError.pinpoint = "";
                                setPinpoint(null);
                                setErrors(deleteError);
                            }} // Assuming you want a reset function
                        >
                            Reset Location
                        </Button>
                    </Box>
                )}
            </Box>

            <Box sx={{ mb: 3 }}>
                {errors.pinpoint && (
                    <Fade in={!!errors.pinpoint} timeout={{ enter: 600, exit: 800 }}>
                        <FormHelperText sx={{ mt: 2 }} error>{errors.pinpoint}</FormHelperText>
                    </Fade>
                )}
            </Box>

            <Grid item xs={12} sx={{ mb: 2.5 }}>
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
                        checked={requiresCapacity}
                        onChange={() => {
                            if (!requiresCapacity) setCapacity('');
                            setRequiresCapacity(!requiresCapacity)
                        }}
                        color="primary"
                    />
                    <Box sx={{ ml: 2 }}>
                        <Typography variant="subtitle1" fontWeight={500}>
                            {requiresCapacity ? "Set Capacity Limit" : "Unlimited Capacity"}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {requiresCapacity
                                ? "Restrict maximum number of attendees"
                                : "Allow unlimited attendees to register"
                            }
                        </Typography>
                    </Box>
                    <Tooltip title="Setting a capacity limit will prevent registration once the maximum number of attendees is reached." arrow>
                        <InfoIcon sx={{ ml: 'auto', color: 'text.secondary' }} />
                    </Tooltip>
                </Box>

                {requiresCapacity && (
                    <Box sx={{ mt: 2 }}>
                        <TextField
                            fullWidth
                            placeholder="Enter attendance capacity"
                            value={capacity ? capacity : ''}
                            onChange={(e) => setCapacity(e.target.value)}
                            type="number"
                            error={Boolean(errors.capacity)}
                            helperText={errors.capacity}
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

            <Grid item xs={12}>
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
                        checked={requiresPaymentProof}
                        onChange={() => setRequiresPaymentProof(!requiresPaymentProof)}
                        color="primary"
                    />
                    <Box sx={{ ml: 2 }}>
                        <Typography variant="subtitle1" fontWeight={500} fontSize={15}>
                            {requiresPaymentProof ? "Payment Verification Required" : "No Payment Verification"}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" fontSize={12}>
                            {requiresPaymentProof
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

            {/* Action Buttons - Full width row */}
            <Box
                sx={{
                    position: 'fixed',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    py: 1.5,
                    backgroundColor: 'white',
                    borderTop: '1px solid rgba(169, 169, 169, 0.5)',
                    display: 'flex',
                    justifyContent: 'flex-end',
                    zIndex: 100,
                }}
            >
                <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={!hasAllFieldsFilled}
                    startIcon={<SkipNextIcon />}
                    sx={{
                        borderRadius: 2,
                        mr: 2,
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
                    Next
                </Button>
            </Box>
        </Box>
    )
}

export default EventDetailsCreation;