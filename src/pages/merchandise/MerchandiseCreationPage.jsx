import React, { useMemo, useState } from 'react';
import {
    Box,
    Typography,
    TextField,
    Button,
    Grid,
    FormControl,
    Select,
    MenuItem,
    Chip,
    InputAdornment,
    IconButton,
    FormHelperText,
    Stack,
    useMediaQuery,
    useTheme,
    Tooltip,
    Card,
    Paper,
    Zoom,
} from '@mui/material';
import {
    Add as AddIcon,
    ArrowBack as ArrowBackIcon,
    Checkroom as CheckroomIcon,
    ChevronLeft as ChevronLeftIcon,
    ChevronRight as ChevronRightIcon,
    Delete as DeleteIcon,
    Edit as EditIcon,
    Image as ImageIcon,
    Inventory2 as Inventory2Icon,
    Publish as PublishIcon
} from '@mui/icons-material';

import SnackbarComponent from '../../components/General/SnackbarComponent';

import Diamond from '../../assets/icons/diamond.png';
import RequiredAsterisk from '../../components/General/RequiredAsterisk';

import { addDoc, collection } from 'firebase/firestore';
import { db } from '../../utils/firebaseConfig';
import { useNavigate } from 'react-router-dom';
import { getItem } from '../../utils/localStorage';

const MerchandiseCreationPage = () => {
    // State management
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [diamondsNeeded, setDiamondsNeeded] = useState('');
    const [locationName, setLocationName] = useState('');
    const [category, setCategory] = useState('');
    const [size, setSize] = useState('');
    const [sizes, setSizes] = useState([]);
    const [images, setImages] = useState([]);
    const [errors, setErrors] = useState({});

    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [hoveredIndex, setHoveredIndex] = useState(null);

    const [submitted, setSubmitted] = useState(false);

    // Snackbar
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarContent, setSnackbarContent] = useState({ msg: '', type: '' });

    // Navigation
    const navigate = useNavigate();

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    // Handlers
    const handleAddSize = () => {
        if (size && !sizes.includes(size)) {
            setSizes([...sizes, size]);
            setSize('');
        }
    };

    const handleRemoveSize = (sizeToRemove) => {
        setSizes(sizes.filter((s) => s !== sizeToRemove));
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);

        e.target.value = '';

        console.log(files);

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
        if (index !== 0 && images.length !== 1) {
            const newImages = [...images];
            newImages.splice(index, 1);
            setImages(newImages);
            setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));

            if (newImages.length <= 4) {
                setErrors({ ...errors, images: null });
            }
        } else {
            const newError = "You cannot delete image when there is only one image.";
            setErrors({ ...errors, images: newError });
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

    const handleSubmit = async (e) => {
        e.preventDefault();

        setSubmitted(true);

        const formErrors = {};

        if (!name) formErrors.name = 'Name is required';
        if (!description) formErrors.description = 'Description is required';
        if (!diamondsNeeded) formErrors.diamondsNeeded = 'Diamonds needed is required';
        if (!locationName) formErrors.locationName = 'Collection location is required';
        if (!category) formErrors.category = 'Category is required';
        if (category === 'Clothing' && sizes.length === 0) formErrors.sizes = 'At least one size is required';
        if (images.length === 0) formErrors.images = 'At least one image is required';

        setErrors(formErrors);

        if (Object.keys(formErrors).length === 0) {
            const adminData = await getItem("admin");
            const parsedAdminData = JSON.parse(adminData);

            const merchMergedData = {
                name,
                description,
                adminID: parsedAdminData.facultyID,
                diamondsToRedeem: Number(diamondsNeeded),
                collectionLocationName: locationName,
                category,
                images: images.map(image => image.preview),
                available: true,
            }

            if (category === "Clothing") {
                merchMergedData.sizes = sizes;
            }

            try {
                const merchandiseRef = collection(db, "merchandise");

                await addDoc(merchandiseRef, merchMergedData);

                setSnackbarOpen(true);
                setSnackbarContent({ msg: 'Merchandise created successfully!', type: 'success' });
                setTimeout(() => {
                    navigate("/merchandise");
                }, 2500)
            } catch (error) {

            }
        }
    };

    const handleClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }

        setSuccessOpen(false);
    };

    // Navigation handlers
    const handlePrevImage = () => {
        setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
    };

    const handleNextImage = () => {
        setCurrentImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
    };

    const hasAllFieldsFilled = useMemo(() => {
        const fieldsFilled = name && description && category && locationName && images.length > 0;
        const sizeValid = (category !== "Clothing") || (sizes.length > 0);

        return fieldsFilled && sizeValid;
    }, [name, description, category, locationName, images, sizes]);

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
                        flexDirection: { xs: 'column', sm: 'row' },
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
                            <Tooltip title="Back to Merchandises" arrow>
                                <IconButton
                                    edge="start"
                                    onClick={() => navigate('/merchandise')}
                                    sx={{
                                        mr: 1.5,
                                        color: 'text.primary',
                                        transition: 'all 0.2s ease',
                                        '&:hover': {
                                            bgcolor: 'rgba(25, 118, 210, 0.08)',
                                            transform: 'translateX(-1px)',
                                        }
                                    }}
                                    aria-label="back to merchandises"
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
                                    Create Your Own Merchandise
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
                                    Drop cool merch for students to redeem with their hard-earned diamonds!
                                </Typography>
                            </Box>
                        </Box>
                    </Box>
                </Box>

                <Box component="form" onSubmit={handleSubmit} noValidate sx={{ width: 'auto', minHeight: '500px', px: { xs: 2, md: 4 }, pt: { xs: 3, md: 5 }, pb: { xs: 8, sm: 10 } }}>
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
                                    ⚠️ Upload up to 4 images (max 50KB each). The first uploaded image will be used as the thumbnail.
                                </Typography>
                            </Box>
                        </Box>
                    </Box>

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
                                        alt={`Merchandise Image ${currentImageIndex + 1}`}
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

                    <Box sx={{ width: '100%', my: 2 }}>
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
                            {images.length > 0 ? 'Add Another Image' : 'Upload Image'}
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
                                    🛍️ Merchandise Name <RequiredAsterisk />
                                </Typography>
                            </Box>
                            <TextField
                                fullWidth
                                placeholder="Enter a merchandise name for the reward catalog..."
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

                        <Grid width="100%">
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
                                placeholder="Enter an informative description for this merchandise item..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                error={!!errors.description}
                                helperText={errors.description}
                                multiline
                                rows={3}
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
                                value={diamondsNeeded ? diamondsNeeded : ''}
                                onChange={(e) => setDiamondsNeeded(e.target.value)}
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

                                        if (selected === "Non-Clothing" && sizes.length > 0) {
                                            setSizes([]);
                                        }

                                        return (
                                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                                {selected === "Clothing" && <CheckroomIcon sx={{ mr: 1, fontSize: 16 }} />}
                                                {selected === "Non-Clothing" && <Inventory2Icon sx={{ mr: 1, fontSize: 16 }} />}
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

                        {category === 'Clothing' && (
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
                                {sizes.length > 0 && (
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            flexWrap: 'wrap',
                                            gap: 1.2,
                                            mt: 1.5,
                                            maxHeight: sizes.length > 8 ? '120px' : 'auto',
                                            overflowY: sizes.length > 8 ? 'auto' : 'visible',
                                            pb: sizes.length > 8 ? 1 : 0,
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
                                        {sizes.map((size, index) => (
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
                                                        onDelete={() => handleRemoveSize(size)}
                                                        onMouseEnter={() => setHoveredIndex(index)}
                                                        onMouseLeave={() => setHoveredIndex(null)}
                                                        onClick={() => handleRemoveSize(size)}
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
                                value={locationName}
                                onChange={(e) => setLocationName(e.target.value)}
                                error={!!errors.locationName}
                                helperText={errors.locationName}
                                required
                                variant="outlined"
                                InputProps={{
                                    sx: { borderRadius: 2, fontSize: "13px" }
                                }}
                            />
                        </Grid>
                    </Grid>

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
                            disabled={!hasAllFieldsFilled || submitted}
                            startIcon={<PublishIcon />}
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
                            Submit
                        </Button>
                    </Box>
                </Box>
            </Card>
            <SnackbarComponent snackbarOpen={snackbarOpen} setSnackbarOpen={setSnackbarOpen} snackbarContent={snackbarContent} />
        </Box>
    );
};

export default MerchandiseCreationPage;