import { deleteField, doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { useEffect, useMemo, useState } from 'react'
import { db } from '../../utils/firebaseConfig';
import { Box, Button, Chip, FormControl, FormHelperText, Grid, IconButton, InputAdornment, MenuItem, Paper, Select, TextField, Tooltip, Typography, useTheme, Zoom } from '@mui/material';
import RequiredAsterisk from '../General/RequiredAsterisk';
import imageCompression from 'browser-image-compression';

import {
    Add as AddIcon,
    Checkroom as CheckroomIcon,
    ChevronLeft as ChevronLeftIcon,
    ChevronRight as ChevronRightIcon,
    Delete as DeleteIcon,
    Edit as EditIcon,
    Image as ImageIcon,
    Inventory2 as Inventory2Icon,
    Save as SaveIcon
} from '@mui/icons-material';

import Loader from '../General/Loader';
import SnackbarComponent from '../General/SnackbarComponent';

const MerchandiseDetailsManager = ({ merchandiseID }) => {
    const [originalData, setOriginalData] = useState({});
    const [formData, setFormData] = useState({});
    const [size, setSize] = useState('');
    const [errors, setErrors] = useState({ 
        name: '', 
        description: '', 
        diamondsToRedeem: '',
        category: '',
        collectionLocationName: '',
        sizes: '',
        images: ''
    });
    const [isLoading, setIsLoading] = useState(true);

    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [hoveredIndex, setHoveredIndex] = useState(null);

    // Snackbar
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarContent, setSnackbarContent] = useState({ msg: '', type: '' });

    const theme = useTheme();

    useEffect(() => {
        let unsub;

        fetchCurrentMerchandise()
            .then(result => {
                unsub = result;
            })
            .catch(error => {
                console.error("Error in listener setup:", error);
            });;

        return unsub;
    }, []);

    const fetchCurrentMerchandise = async () => {
        try {
            const merchRef = doc(db, "merchandise", merchandiseID);
            const unsubscribeMerch = onSnapshot(merchRef, (merchSnap) => {
                if (merchSnap.exists()) {
                    const merchData = merchSnap.data();
                    const { createdAt, ...restMerchData } = merchData;
                    setOriginalData(restMerchData);
                    setFormData(restMerchData);
                } else {
                    console.log("No such merchandise document!");
                }
                setIsLoading(false);
            })

            return unsubscribeMerch;
        } catch (error) {
            console.error("Server error: Merchandise details cannot be retrieved.", error);
        }
    }

    const hasChanges = useMemo(() => {
        if (!originalData || !formData) return false;

        return Object.keys(formData).some(key => {
            if (Array.isArray(formData[key])) {
                if (formData[key].length !== originalData[key]?.length) return true;
                return !formData[key].every((item, index) => item === originalData[key][index]);
            }

            if (key === "diamondsToRedeem") {
                return Number(formData[key]) !== Number(originalData[key]);
            }

            return formData[key] !== originalData[key];
        });
    }, [originalData, formData]);

    const changedFields = useMemo(() => {
        if (!originalData || !formData) return [];

        return Object.keys(formData).filter(key => {
            if (Array.isArray(formData[key])) {
                if (formData[key].length !== originalData[key]?.length) return true;
                return !formData[key].every((item, index) => item === originalData[key][index]);
            }

            if (key === "diamondsToRedeem") {
                return Number(formData[key]) !== Number(originalData[key]);
            }

            return formData[key] !== originalData[key];
        });
    }, [originalData, formData]);

    useEffect(() => {
        console.log(changedFields);
    }, [changedFields]);

    const validateFields = () => {
        const newErrors = {};
        let isValid = true;

        // Validate name
        if (!formData.name?.trim()) {
            newErrors.name = 'Merchandise name cannot be empty';
            isValid = false;
        }

        // Validate description
        if (!formData.description?.trim()) {
            newErrors.description = 'Description cannot be empty';
            isValid = false;
        }

        // Validate diamonds to redeem
        if (!formData.diamondsToRedeem || formData.diamondsToRedeem <= 0) {
            newErrors.diamondsToRedeem = 'Diamonds required must be greater than 0';
            isValid = false;
        }

        // Validate category
        if (!formData.category) {
            newErrors.category = 'Please select a category';
            isValid = false;
        }

        // Validate collection location
        if (!formData.collectionLocationName?.trim()) {
            newErrors.collectionLocationName = 'Pickup location cannot be empty';
            isValid = false;
        }

        // Validate sizes for clothing category
        if (formData.category === 'Clothing' && (!formData.sizes || formData.sizes.length === 0)) {
            newErrors.sizes = 'At least one size must be added for clothing items';
            isValid = false;
        }

        // Validate images
        if (!formData.images || formData.images.length === 0) {
            newErrors.images = 'At least one image must be uploaded';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleChange = (field, value) => {
        // Clear error for the field being changed
        setErrors(prev => ({
            ...prev,
            [field]: ''
        }));

        if (field === "category") {
            if (value === "Clothing") {
                setFormData(prev => ({
                    ...prev,
                    [field]: value,
                    sizes: []
                }));
            } else {
                const { sizes, ...rest } = formData; // remove `sizes`
                setFormData({
                    ...rest,
                    [field]: value
                });
            }
        } else {
            setFormData(prev => ({
                ...prev,
                [field]: value
            }));
        }
    };

    // Handle array field additions (sizes)
    const handleArrayAdd = (field, value) => {
        if (!value.trim()) return;

        setFormData(prev => ({
            ...prev,
            [field]: [...prev[field], value]
        }));
    };

    // Handle array field removals
    const handleArrayRemove = (field, index) => {
        setFormData(prev => ({
            ...prev,
            [field]: prev[field].filter((_, i) => i !== index)
        }));
    };

    // Handle image upload and convert to base64
    const handleImageUpload = async (e) => {
        const files = Array.from(e.target.files);

        if (formData.images.length + files.length > 4) {
            setErrors({ ...errors, images: 'Maximum 4 images allowed' });
            return;
        }

        const options = {
            maxSizeMB: 0.1, // 100KB
            maxWidthOrHeight: 1024,
            useWebWorker: true,
        };

        try {
            for (const file of files) {
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

                setFormData(prev => ({
                    ...prev,
                    images: [...prev.images, base64Data]
                }));
            }

            setErrors(prev => ({ ...prev, images: null }));

        } catch (error) {
            console.error('Image compression or reading failed:', error);
            setErrors(prev => ({ ...prev, images: 'Failed to process one or more images' }));
        }
    };

    // Handle image removal
    const handleImageRemove = (index) => {
        if (index !== 0 && formData.images.length !== 1) {
            const newImages = [...formData.images];
            newImages.splice(index, 1);

            setFormData(prev => ({
                ...prev,
                images: newImages
            }));
            setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : formData.images.length - 1))
        } else {
            const newError = "You cannot delete image when there is only one image.";
            setErrors({ ...errors, images: newError });
        }
    };

    const handleReplaceImage = async (index, e) => {
        const file = e.target.files[0];
        if (!file) return;

        const options = {
            maxSizeMB: 0.1, // 100KB
            maxWidthOrHeight: 1024,
            useWebWorker: true,
        };

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

            const replaceImage = [...formData.images];
            replaceImage[index] = base64Data;

            setFormData(prev => ({
                ...prev,
                images: replaceImage
            }));

            setErrors(prev => ({ ...prev, images: null }));

        } catch (error) {
            console.error('Image compression or reading failed:', error);
            setErrors(prev => ({ ...prev, images: 'Failed to process image' }));
        }
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();

        // Validate all fields before proceeding
        if (!validateFields()) {
            setSnackbarOpen(true);
            setSnackbarContent({ 
                msg: 'Please fill in all required fields correctly', 
                type: 'error' 
            });
            return;
        }

        try {
            const updates = {};
            changedFields.forEach(field => {
                updates[field] = formData[field];
            });

            const merchRef = doc(db, "merchandise", merchandiseID);

            // Only update if there are changes
            if (Object.keys(updates).length > 0) {
                await updateDoc(merchRef, updates);
            }

            // Check category change before updating Firestore
            if (updates.category && originalData.category === "Clothing" && updates.category === "Non-Clothing") {
                await updateDoc(merchRef, {
                    sizes: deleteField(),
                });
            }

            // Update originalData with the new form data
            const newOriginalData = {
                ...formData,
                diamondsToRedeem: Number(formData.diamondsToRedeem)
            };
            setOriginalData(newOriginalData);

            setSnackbarOpen(true);
            setSnackbarContent({ msg: 'Your merchandise updates were saved!', type: 'success' });
        } catch (error) {
            console.error("Server error: Merchandise changes could not be saved.", error);
            setSnackbarOpen(true);
            setSnackbarContent({ msg: 'Server error: Merchandise changes could not be saved.', type: 'error' });
        }
    }

    const handleAddSize = (e) => {
        handleArrayAdd("sizes", size);
        setSize('');
    }

    // Navigation handlers
    const handlePrevImage = () => {
        setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : formData.images.length - 1));
    };

    const handleNextImage = () => {
        setCurrentImageIndex((prev) => (prev < formData.images.length - 1 ? prev + 1 : 0));
    };

    if (isLoading) {
        return (
            <Loader loadingText='Loading selected merchandise details...' />
        )
    }

    return (
        <Box component="form" onSubmit={handleEditSubmit} noValidate sx={{ width: 'auto', minHeight: '500px', px: { xs: 2, md: 4 }, pt: { xs: 3, md: 5 }, pb: { xs: 8, sm: 10 } }}>
            <Box sx={{ width: '100%', mb: 1 }}>
                <Box sx={{ width: '100%', mb: 1 }}>
                    <Box sx={{ width: '100%', mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                            <Typography variant="h5" sx={{
                                fontSize: "16px",
                                fontWeight: 600,
                                display: 'flex',
                                alignItems: 'center'
                            }}>
                                📸 Merchandise Image <RequiredAsterisk />
                            </Typography>
                            <Typography variant="body2" color='text.secondary' fontSize="12px" mt={0.5}>
                                ⚠️ Upload up to 4 images. The first uploaded image will be used as the thumbnail.
                            </Typography>
                        </Box>
                    </Box>

                    <Box sx={{ mb: 2 }}>
                        {formData.images.length > 0 && (
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
                                            src={`data:image/jpeg;base64,${formData.images[currentImageIndex]}`}
                                            alt={`Merchandise Image ${currentImageIndex + 1}`}
                                            sx={{
                                                maxWidth: '100%',
                                                maxHeight: formData.images.length > 1 ? '90%' : '100%',
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
                                                right: 15,
                                                display: 'flex',
                                                gap: 1,
                                            }}
                                        >
                                            {formData.images.length > 1 && (
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
                                            )}
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
                    </Box>

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
                        {formData.images.length > 0 ? 'Add Another Image' : 'Upload Merchandise Image'}
                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            hidden
                            onChange={handleImageUpload}
                        />
                    </Button>
                    {errors?.images && <FormHelperText error>{errors.images}</FormHelperText>}
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
                                🛍️ Merchandise Name <RequiredAsterisk />
                            </Typography>
                        </Box>
                        <TextField
                            fullWidth
                            placeholder="Enter merchandise item name..."
                            value={formData.name}
                            onChange={(e) => handleChange('name', e.target.value)}
                            error={errors.name}
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
                                📝 Description <RequiredAsterisk />
                            </Typography>
                        </Box>
                        <TextField
                            fullWidth
                            placeholder="Enter merchandise details (e.g. introduction to this item.)"
                            value={formData.description}
                            onChange={(e) => handleChange('description', e.target.value)}
                            error={errors.description}
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

                    <Grid width="100%">
                        <Box sx={{ mb: 1 }}>
                            <Typography sx={{
                                fontSize: "16px",
                                fontWeight: 600,
                                display: 'flex',
                                alignItems: 'center'
                            }}>
                                💎 Diamonds Required per Redemption <RequiredAsterisk />
                            </Typography>
                            <Typography variant="body2" color='text.secondary' fontSize="12px" mt={0.5}>
                                ⚠️ Enter the number of diamonds students must use to redeem this merchandise.
                            </Typography>
                        </Box>
                        <TextField
                            fullWidth
                            placeholder='Enter the number of diamonds required for redemption...'
                            value={formData.diamondsToRedeem ? formData.diamondsToRedeem : ''}
                            onChange={(e) => handleChange("diamondsToRedeem", e.target.value)}
                            error={!!errors.diamondsToRedeem}
                            helperText={errors.diamondsToRedeem}
                            type="number"
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
                                },
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
                                📦 Merchandise Category <RequiredAsterisk />
                            </Typography>
                        </Box>
                        <FormControl fullWidth error={Boolean(errors.category)} required>
                            <Select
                                displayEmpty
                                renderValue={(selected) => {
                                    if (selected.length === 0) {
                                        return <div style={{ color: '#a9a9a9', fontSize: '13px' }}>Select a merchandise category</div>
                                    }

                                    return (
                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                            {selected === "Clothing" && <CheckroomIcon sx={{ mr: 1, fontSize: 16 }} />}
                                            {selected === "Non-Clothing" && <Inventory2Icon sx={{ mr: 1, fontSize: 16 }} />}
                                            {selected}
                                        </div>
                                    );
                                }}
                                value={formData.category}
                                onChange={(e) => handleChange("category", e.target.value)}
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
                            >
                                <MenuItem disabled value="" sx={{ display: 'none', fontSize: '13px' }}>
                                    <em>Select a merchandise category</em>
                                </MenuItem>
                                <MenuItem value="Clothing" sx={{ fontSize: '13px', py: 1.2 }}>
                                    <CheckroomIcon sx={{ mr: 2, fontSize: 16, color: '#1565c0' }} /> Clothing
                                </MenuItem>
                                <MenuItem value="Non-Clothing" sx={{ fontSize: '13px', py: 1.2 }}>
                                    <Inventory2Icon sx={{ mr: 2, fontSize: 16, color: '#4caf50' }} /> Non-Clothing
                                </MenuItem>
                            </Select>
                            {errors.category && <FormHelperText>{errors.category}</FormHelperText>}
                        </FormControl>
                    </Grid>

                    {formData.category === 'Clothing' && (
                        <Grid width="100%">
                            <Box sx={{ mb: 1 }}>
                                <Typography sx={{
                                    fontSize: "16px",
                                    fontWeight: 600,
                                    display: 'flex',
                                    alignItems: 'center'
                                }}>
                                    📏 Merchandise Sizes <RequiredAsterisk />
                                </Typography>
                                <Typography variant="body2" color='text.secondary' fontSize="12px" mt={0.5}>
                                    ⚠️ Example: Free Size, M, S, XL, L.
                                </Typography>
                            </Box>
                            <FormControl fullWidth error={Boolean(errors.sizes)}>
                                <TextField
                                    fullWidth
                                    value={size}
                                    onChange={(e) => setSize(e.target.value)}
                                    placeholder="Type a size and click the add icon..."
                                    error={!!errors.sizes}
                                    helperText={errors.sizes}
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    onClick={handleAddSize}
                                                    edge="end"
                                                    color="primary"
                                                >
                                                    <AddIcon sx={{ color: '#777776' }} />
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                        sx: { borderRadius: 2, fontSize: "13px" }
                                    }}
                                />
                            </FormControl>

                            {/* Sizes Preview */}
                            {formData.sizes && (
                                <Box
                                    sx={{
                                        display: 'flex',
                                        flexWrap: 'wrap',
                                        gap: 1.2,
                                        mt: 1.5,
                                        maxHeight: formData.sizes.length > 8 ? '120px' : 'auto',
                                        overflowY: formData.sizes.length > 8 ? 'auto' : 'visible',
                                        pb: formData.sizes.length > 8 ? 1 : 0,
                                        scrollbarWidth: 'thin',
                                        '&::-webkit-scrollbar': {
                                            width: '6px',
                                        },
                                        '&::-webkit-scrollbar-track': {
                                            backgroundColor: 'rgba(0,0,0,0.05)',
                                            borderRadius: 10,
                                        },
                                        '&::-webkit-scrollbar-thumb': {
                                            backgroundColor: 'rgba(0,0,0,0.15)',
                                            borderRadius: 10,
                                            '&:hover': {
                                                backgroundColor: 'rgba(0,0,0,0.25)',
                                            },
                                        },
                                    }}
                                >
                                    {formData.sizes.map((size, index) => (
                                        <Zoom
                                            key={index}
                                            in={true}
                                            style={{
                                                transitionDelay: `${index * 50}ms`
                                            }}
                                        >
                                            <Tooltip title="Click to remove" arrow>
                                                <Chip
                                                    label={size}
                                                    onDelete={() => handleArrayRemove("sizes", index)}
                                                    onMouseEnter={() => setHoveredIndex(index)}
                                                    onMouseLeave={() => setHoveredIndex(null)}
                                                    onClick={() => handleArrayRemove("sizes", index)}
                                                    color="primary"
                                                    variant="filled"
                                                    sx={{
                                                        borderRadius: 3,
                                                        fontWeight: 500,
                                                        fontSize: '0.85rem',
                                                        px: 0.5,
                                                        transition: 'all 0.2s ease',
                                                        transform: hoveredIndex === index ? 'scale(1.05)' : 'scale(1)',
                                                        '&:hover': {
                                                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.12)',
                                                        },
                                                        '& .MuiChip-deleteIcon': {
                                                            color: hoveredIndex === index ? 'white' : 'primary.main',
                                                            '&:hover': {
                                                                color: hoveredIndex === index ? 'white' : 'error.main',
                                                            },
                                                        },
                                                    }}
                                                />
                                            </Tooltip>
                                        </Zoom>
                                    ))}
                                </Box>
                            )}
                        </Grid>
                    )}

                    <Grid width="100%">
                        <Box sx={{ mb: 1 }}>
                            <Typography sx={{
                                fontSize: "16px",
                                fontWeight: 600,
                                display: 'flex',
                                alignItems: 'center'
                            }}>
                                📌 Pickup Location <RequiredAsterisk />
                            </Typography>
                            <Typography variant="body2" color='text.secondary' fontSize="12px" mt={0.5}>
                                ⚠️ Specify where students can collect their redeemed merchandise.
                            </Typography>
                        </Box>
                        <TextField
                            fullWidth
                            placeholder='Enter pickup location'
                            value={formData.collectionLocationName}
                            onChange={(e) => handleChange("collectionLocationName", e.target.value)}
                            error={!!errors.collectionLocationName}
                            helperText={errors.collectionLocationName}
                            required
                            variant="outlined"
                            InputProps={{
                                sx: { borderRadius: 2, fontSize: "13px" }
                            }}
                        />
                    </Grid>
                </Grid>

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

export default MerchandiseDetailsManager;