import React, { useState } from 'react';
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
    Snackbar,
    Alert
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ImageIcon from '@mui/icons-material/Image';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

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

    // Snackbar
    const [successOpen, setSuccessOpen] = useState(false);

    // Navigation
    const navigate = useNavigate();

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
        // setImages(images.filter((_, i) => i !== index));
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

    const handleSubmit = async (e) => {
        e.preventDefault();

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
                images: images.map(image => image.preview)
            }

            if (category === "Clothing") {
                merchMergedData.sizes = sizes;
            }

            try {
                const merchandiseRef = collection(db, "merchandise");

                await addDoc(merchandiseRef, merchMergedData);

                setSuccessOpen(true);
                setTimeout(() => {
                    navigate("/merchandise");
                }, 1500)
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

    return (
        <Box sx={{ py: 4, px: 6 }}>
            <Typography
                variant="h4"
                component="h1"
                sx={{
                    mb: 4,
                    fontWeight: 700,
                    background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                    backgroundClip: 'text',
                    textFillColor: 'transparent',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                }}
            >
                Create New Merchandise
            </Typography>

            <Box component="form" onSubmit={handleSubmit} noValidate sx={{ width: '100%', paddingBottom: '80px' }}>
                {/* Product Information Section */}
                <Box sx={{ width: '100%', mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 550 }}>
                        Merchandise Name <RequiredAsterisk />
                    </Typography>
                </Box>

                {/* Name Field - Full width row */}
                <Box sx={{ width: '100%', mb: 3 }}>
                    <TextField
                        fullWidth
                        placeholder="Enter merchandise name"
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
                        Merchandise Description <RequiredAsterisk />
                    </Typography>
                </Box>

                {/* Description Field - Full width row */}
                <Box sx={{ width: '100%', mb: 3 }}>
                    <TextField
                        fullWidth
                        placeholder="Enter merchandise details"
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
                        Merchandise Category <RequiredAsterisk />
                    </Typography>
                </Box>

                {/* Category Field - Full width row */}
                <Box sx={{ width: '100%', mb: 2 }}>
                    <FormControl fullWidth error={!!errors.category} required>
                        <Select
                            displayEmpty
                            renderValue={(selected) => {
                                if (selected.length === 0) {
                                    return <div style={{ color: '#a9a9a9' }}>Select a category</div>
                                }

                                return selected;
                            }}
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            sx={{ borderRadius: 2 }}
                        >
                            <MenuItem value="Clothing">Clothing</MenuItem>
                            <MenuItem value="Non-Clothing">Non-Clothing</MenuItem>
                        </Select>
                        {errors.category && <FormHelperText>{errors.category}</FormHelperText>}
                    </FormControl>
                </Box>

                {/* Sizes Field - Only shown for Clothing category - Full width row */}
                {category === 'Clothing' && (
                    <>
                        <Box sx={{ width: '100%', mb: 2 }}>
                            <Typography variant="h6" sx={{ fontWeight: 550 }}>
                                Merchandise Sizes (S, M, L, XL, Free Size, etc.) <RequiredAsterisk />
                            </Typography>
                        </Box>
                        <Box sx={{ width: '100%', mb: 2 }}>
                            <FormControl fullWidth error={!!errors.sizes}>
                                <TextField
                                    fullWidth
                                    value={size}
                                    onChange={(e) => setSize(e.target.value)}
                                    placeholder="Type a size and click add"
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
                                                    <AddIcon />
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                        sx: { borderRadius: 2 }
                                    }}
                                />
                            </FormControl>

                            {/* Sizes Preview */}
                            {sizes.length > 0 && (
                                <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                    {sizes.map((s, index) => (
                                        <Chip
                                            key={index}
                                            label={s}
                                            onDelete={() => handleRemoveSize(s)}
                                            color="primary"
                                            sx={{ borderRadius: 2, fontWeight: 500 }}
                                        />
                                    ))}
                                </Box>
                            )}
                        </Box>
                    </>
                )}

                <Box sx={{ width: '100%', mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 550 }}>
                        Diamonds Cost <RequiredAsterisk />
                    </Typography>
                </Box>

                {/* Diamonds Needed Field - Full width row */}
                <Box sx={{ width: '100%', mb: 3 }}>
                    <TextField
                        fullWidth
                        placeholder="Enter diamonds required"
                        value={diamondsNeeded}
                        onChange={(e) => setDiamondsNeeded(e.target.value.replace(/[^0-9]/g, ''))}
                        error={!!errors.diamondsNeeded}
                        helperText={errors.diamondsNeeded}
                        type="number"
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start" sx={{ marginRight: 2 }}>
                                    <img src={Diamond} style={{ height: 24, width: 24 }} />
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

                <Box sx={{ width: '100%', mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 550 }}>
                        Pickup Location <RequiredAsterisk />
                    </Typography>

                </Box>

                {/* Collection Location Field - Full width row */}
                <Box sx={{ width: '100%', mb: 3 }}>
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
                            sx: { borderRadius: 2 }
                        }}
                    />
                </Box>

                {/* Media Section */}
                <Box sx={{ width: '100%' }}>
                    <Typography variant="h6" sx={{ fontWeight: 550 }}>
                        Merchandise Images <RequiredAsterisk />
                    </Typography>
                </Box>

                {/* Merchandise Images Field - Full width row */}
                <Box sx={{ width: '100%', mb: 2 }}>
                    <Typography variant="subtitle1" gutterBottom sx={{ mb: 2 }}>
                        Upload up to 4 merchandise images (max 50KB each)
                    </Typography>

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
                        {images.length > 0 ? 'Add Another Image' : 'Upload Product Images'}
                        <input
                            type="file"
                            accept="image/*"
                            hidden
                            onChange={handleImageChange}
                        />
                    </Button>

                    {errors.images && (
                        <FormHelperText error>{errors.images}</FormHelperText>
                    )}

                    {/* Images Preview - This can be multi-column */}
                    {images.length > 0 && (
                        <Box sx={{ mt: 3, width: '100%' }}>
                            <Grid container spacing={3}>
                                {images.map((img, index) => (
                                    <Grid item xs={12} sm={6} md={3} key={index}>
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
                                                    pt: '100%', // 1:1 Aspect Ratio
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

                {/* Action Buttons - Full width row */}
                <Box
                    sx={{
                        position: 'fixed',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        padding: 3,
                        backgroundColor: 'transparent',
                        display: 'flex',
                        justifyContent: 'flex-end',
                        zIndex: 1100, // To ensure buttons appear above other content
                    }}
                >
                    <Stack
                        direction={{ xs: 'column', sm: 'row' }}
                        spacing={2}
                        paddingRight={6}
                    >
                        <Button
                            onClick={() => navigate('/merchandise')}
                            variant="outlined"
                            color="inherit"
                            sx={{
                                borderRadius: 2,
                                py: 1.5,
                                px: 4,
                                borderWidth: 2,
                                '&:hover': {
                                    borderWidth: 2,
                                    bgcolor: 'rgba(0,0,0,0.04)'
                                }
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            sx={{
                                borderRadius: 2,
                                py: 1.5,
                                px: 4,
                                fontWeight: 600,
                                boxShadow: '0 4px 12px rgba(33,150,243,0.3)',
                                background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                                '&:hover': {
                                    boxShadow: '0 6px 12px rgba(33,150,243,0.4)',
                                }
                            }}
                        >
                            Create
                        </Button>
                    </Stack>
                </Box>
            </Box>

            <Snackbar
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                open={successOpen}
                autoHideDuration={4000}
                onClose={handleClose}
            >
                <Alert
                    severity="success"
                    variant="filled"
                    sx={{ width: '100%' }}
                >
                    Merchandise created successfully!
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default MerchandiseCreationPage;