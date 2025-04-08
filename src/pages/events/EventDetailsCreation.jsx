import React, { useEffect } from 'react';
import { Box, Button, Chip, FormControl, FormControlLabel, FormHelperText, Grid, IconButton, MenuItem, Paper, Select, Stack, Switch, TextField, Tooltip, Typography } from '@mui/material'
import { DateTimePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import ReceiptIcon from '@mui/icons-material/Receipt';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import TouchAppIcon from '@mui/icons-material/TouchApp';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import LocationSearchingIcon from '@mui/icons-material/LocationSearching';
import ImageIcon from '@mui/icons-material/Image';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

import RequiredAsterisk from '../../components/General/RequiredAsterisk';

import { useNavigate } from 'react-router-dom';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const EventDetailsCreation = ({
    name, setName,
    description, setDescription,
    category, setCategory,
    startDateTime, setStartDateTime,
    endDateTime, setEndDateTime,
    registrationDate, setRegistrationDate,
    location, setLocation,
    pinpoint, setPinpoint,
    images, setImages,
    requiresCapacity, setRequiresCapacity,
    capacity, setCapacity,
    requiresPaymentProof, setRequiresPaymentProof,
    errors, setErrors,
    handleImageChange, handleRemoveImage, handleReplaceImage,
    handleDetailsSubmit
}) => {
    // Current date time in dayjs
    const now = dayjs();

    // Navigation
    const navigate = useNavigate();

    useEffect(() => {
        const currentErrors = { ...errors };

        currentErrors.pinpoint = "";

        setErrors(currentErrors);
    }, [requiresCapacity]);

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
                    setPinpoint(null);
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
        <Box component="form" onSubmit={handleDetailsSubmit} noValidate sx={{ width: '100%', paddingBottom: '250px' }}>
            <Box sx={{ width: '100%', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 550 }}>
                    Event Name <RequiredAsterisk />
                </Typography>
            </Box>

            <Box sx={{ width: '100%', mb: 3 }}>
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
                        sx: { borderRadius: 2 }
                    }}
                />
            </Box>

            <Box sx={{ width: '100%', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 550 }}>
                    Event Description <RequiredAsterisk />
                </Typography>
            </Box>

            {/* Description Field - Full width row */}
            <Box sx={{ width: '100%', mb: 3 }}>
                <TextField
                    fullWidth
                    placeholder="Enter event details (e.g. info, payment details, speaker info etc.)"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    error={!!errors.description}
                    helperText={errors.description}
                    multiline
                    rows={3}
                    required
                    variant="outlined"
                    InputProps={{
                        sx: { borderRadius: 2 }
                    }}
                />
            </Box>

            <Box sx={{ width: '100%', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 550 }}>
                    Event Category <RequiredAsterisk />
                </Typography>
            </Box>

            {/* Category Field - Full width row */}
            <Box sx={{ width: '100%', mb: 3 }}>
                <FormControl fullWidth error={!!errors.category} required>
                    <Select
                        displayEmpty
                        renderValue={(selected) => {
                            if (selected.length === 0) {
                                return <div style={{ color: '#a9a9a9' }}>Select an event category</div>
                            }

                            return selected;
                        }}
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
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
                    {errors.category && <FormHelperText>{errors.category}</FormHelperText>}
                </FormControl>
            </Box>

            <Box sx={{ width: '100%', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 550 }}>
                    Event Start Date & Time <RequiredAsterisk />
                </Typography>
            </Box>

            <Box sx={{ width: '100%', mb: 3 }}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DateTimePicker
                        {...commonPickerProps}
                        value={startDateTime}
                        onChange={handleStartDateChange}
                        onError={handleStartDateError}
                        minDateTime={now}
                        shouldDisableDate={(date) => date.isBefore(now)}
                    />
                </LocalizationProvider>

                {errors.startDateTime && (
                    <FormHelperText sx={{ mt: 1 }} error>{errors.startDateTime}</FormHelperText>
                )}
            </Box>

            <Box sx={{ width: '100%', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 550 }}>
                    Event End Date & Time <RequiredAsterisk />
                </Typography>
            </Box>

            <Box sx={{ width: '100%', mb: 3 }}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DateTimePicker
                        {...commonPickerProps}
                        value={endDateTime}
                        onChange={handleEndDateChange}
                        onError={handleEndDateError}
                        minDateTime={startDateTime ? startDateTime.add(1, 'hour') : now}
                        disabled={!startDateTime}
                        shouldDisableDate={(date) => startDateTime && date.isBefore(startDateTime)}
                    />
                </LocalizationProvider>

                {errors.endDateTime && (
                    <FormHelperText sx={{ mt: 1 }} error>{errors.endDateTime}</FormHelperText>
                )}
            </Box>

            <Box sx={{ width: '100%', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 550 }}>
                    Event Registration Closing Date <RequiredAsterisk />
                </Typography>
            </Box>

            <Box sx={{ width: '100%', mb: 3 }}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DateTimePicker
                        {...commonPickerProps}
                        value={registrationDate}
                        onChange={setRegistrationDate}
                        onError={handleRegistrationDateError}
                        minDateTime={now}
                        maxDateTime={startDateTime ? startDateTime.subtract(1, 'hour') : now}
                        disabled={!startDateTime}
                        shouldDisableDate={(date) => (startDateTime && date.isAfter(startDateTime)) || date.isBefore(now)}
                    />
                </LocalizationProvider>

                {errors.registrationDate && (
                    <FormHelperText sx={{ mt: 1 }} error>{errors.registrationDate}</FormHelperText>
                )}
            </Box>

            <Box sx={{ width: '100%', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 550 }}>
                    Event Location <RequiredAsterisk />
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Use the format: Building/Faculty - Room/Hall (e.g., FCSIT - AI Lab) to help students easily identify the location.
                </Typography>
            </Box>

            <Box sx={{ width: '100%', mb: 3 }}>
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
                        sx: { borderRadius: 2 }
                    }}
                />
            </Box>

            <Box sx={{ width: '100%', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 550 }}>
                    Location Pinpoint <RequiredAsterisk />
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    IMPORTANT: Set the location pinpoint for student attendance accuracy and quest verification
                </Typography>
            </Box>

            <Box
                sx={{
                    maxWidth: "85%",
                    mx: "auto",
                    mb: 4,
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
                    {pinpoint && (
                        <Typography
                            variant="body2"
                            sx={{
                                ml: 'auto',
                                color: 'success.main',
                                display: 'flex',
                                alignItems: 'center',
                                fontSize: '0.85rem'
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
                                    label={`Lat: ${parseFloat(pinpoint.lat.toFixed(4))}`}
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
                                    label={`Long: ${parseFloat(pinpoint.lng.toFixed(4))}`}
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
                    <FormHelperText sx={{ mt: 2 }} error>{errors.pinpoint}</FormHelperText>
                )}
            </Box>

            <Box sx={{ width: '100%', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 550 }}>
                    Event Images <RequiredAsterisk />
                </Typography>
                <Typography variant="body2" color='text.secondary'>
                    Upload up to 4 merchandise images (max 50KB each)
                </Typography>
            </Box>

            {/* Event Poster Images Field - Full width row */}
            <Box sx={{ width: '100%', mb: 2 }}>
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

                {images.length > 0 && (
                    <Box sx={{ mt: 3, width: '100%' }}>
                        <Grid container spacing={3}>
                            {images.map((img, index) => (
                                <Grid key={index}>
                                    <Box
                                        sx={{
                                            position: 'relative',
                                            height: "300px",
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
                                                pt: '100%',
                                                overflow: 'hidden',
                                                bgcolor: '#f5f5f5'
                                            }}
                                        >
                                            <Box
                                                component="img"
                                                src={`data:image/jpeg;base64,${img.preview}`}
                                                alt={`Merchandise ${index + 1}`}
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
                                                onClick={() => handleRemoveImage(index)}
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
                                                    onChange={(e) => handleReplaceImage(index, e)}
                                                />
                                            </IconButton>
                                        </Box>
                                        <Box sx={{ p: 2, bgcolor: 'white' }}>
                                            <Typography
                                                variant="body2"
                                                noWrap
                                                sx={{
                                                    color: 'text.secondary',
                                                    fontSize: '0.75rem'
                                                }}
                                            >
                                                {img.name}
                                            </Typography>
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
                                checked={requiresCapacity}
                                onChange={() => setRequiresCapacity(!requiresCapacity)}
                                name="requiresCapacitySwitch"
                                color="primary"
                                size="medium"
                            />
                        }
                        label=""
                    />
                    <Box sx={{ ml: 1 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
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
                        <InfoOutlinedIcon sx={{ ml: 2, color: 'text.secondary', cursor: 'pointer' }} />
                    </Tooltip>
                </Box>

                {requiresCapacity && (
                    <Box sx={{ width: '100%', mb: 3 }}>
                        <TextField
                            fullWidth
                            placeholder="Enter attendance capacity"
                            value={capacity}
                            onChange={(e) => {
                                const val = e.target.value;

                                setCapacity(val === "" ? "" : Number(val))
                            }}
                            type='number'
                            error={!!errors.capacity}
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
                        {errors.capacity && (
                            <FormHelperText error sx={{ ml: 1 }}>{errors.capacity}</FormHelperText>
                        )}
                    </Box>
                )}
            </Box>

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
                    mb: 2,
                    borderRadius: 1,
                }}
            >
                <ReceiptIcon sx={{ mr: 2, color: 'primary.main' }} />
                <FormControlLabel
                    control={
                        <Switch
                            checked={requiresPaymentProof}
                            onChange={() => setRequiresPaymentProof(!requiresPaymentProof)}
                            name="paymentProofSwitch"
                            color="primary"
                            size="medium"
                        />
                    }
                    label=""
                />
                <Box sx={{ ml: 1 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
                        {requiresPaymentProof ? "Payment Verification Required" : "No Payment Verification"}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {requiresPaymentProof
                            ? "Students must upload payment proof (max 50KB)"
                            : "No payment documentation needed for registration"
                        }
                    </Typography>
                </Box>
                <Tooltip title="When enabled, students will be prompted to upload payment receipts (JPEG or PNG format, maximum 50KB)" arrow>
                    <InfoOutlinedIcon sx={{ ml: 2, color: 'text.secondary', cursor: 'pointer' }} />
                </Tooltip>
            </Box>

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
                    zIndex: 1100,
                }}
            >
                <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    spacing={1.5}
                    paddingRight={3}
                >
                    <Button
                        onClick={() => navigate('/event')}
                        variant="outlined"
                        color="inherit"
                        sx={{
                            borderRadius: 1.5,
                            py: 1,
                            px: 2.5,
                            borderWidth: 1,
                            '&:hover': {
                                borderWidth: 1,
                                bgcolor: 'rgba(0, 0, 0, 0.04)'
                            }
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        size="small"
                        sx={{
                            borderRadius: 1.5,
                            py: 1,
                            px: 2.5,
                            fontWeight: 500,
                            boxShadow: '0 2px 8px rgba(33, 150, 243, 0.3)',
                            background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                            '&:hover': {
                                boxShadow: '0 3px 10px rgba(33, 150, 243, 0.4)',
                            }
                        }}
                    >
                        Next Step: Quest Creation
                    </Button>
                </Stack>
            </Box>
        </Box>
    )
}

export default EventDetailsCreation;