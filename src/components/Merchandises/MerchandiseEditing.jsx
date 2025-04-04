import { deleteField, doc, onSnapshot, updateDoc } from 'firebase/firestore';
import React, { useEffect, useMemo, useState } from 'react'
import { db } from '../../utils/firebaseConfig';
import { Alert, Box, Button, Chip, CircularProgress, FormControl, FormHelperText, Grid, IconButton, InputAdornment, MenuItem, Select, Snackbar, TextField, Typography } from '@mui/material';
import RequiredAsterisk from '../General/RequiredAsterisk';
import AddIcon from '@mui/icons-material/Add';
import ImageIcon from '@mui/icons-material/Image';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

import Diamond from '../../assets/icons/diamond.png';

const MerchandiseEditing = ({ merchandiseID }) => {
    const [originalData, setOriginalData] = useState({});
    const [formData, setFormData] = useState({});
    const [size, setSize] = useState('');
    const [errors, setErrors] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // Snackbar
    const [successOpen, setSuccessOpen] = useState(false);
    const [failedOpen, setFailedOpen] = useState(false);

    useEffect(() => {
        let unsub;

        fetchCurrentMerchandise()
            .then(result => {
                unsub = result;
            })
            .catch(error => {
                console.error("Error in listener setup:", error);
                // setError("Failed to initialize merchandise listeners.");
                // setLoading(false);
            });;

        return unsub;
    }, []);

    const fetchCurrentMerchandise = async () => {
        try {
            const merchRef = doc(db, "merchandise", merchandiseID);
            const unsubscribeMerch = onSnapshot(merchRef, (merchSnap) => {
                if (merchSnap.exists()) {
                    const merchData = merchSnap.data();
                    setOriginalData(merchData);
                    setFormData(merchData);
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

        // Use the same detailed comparison logic as changedFields
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
                return formData[key].every((item, index) => item !== originalData[key][index]);
            }

            if (key === "diamondsToRedeem") {
                return Number(formData[key]) !== Number(originalData[key]);
            }

            return formData[key] !== originalData[key];
        });
    }, [originalData, formData]);

    const handleChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // Handle array field additions (tags, sizes, colors)
    const handleArrayAdd = (field, value) => {
        if (!value.trim()) return;
        if (formData[field].includes(value)) return;

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
    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        console.log(files);

        if (formData.images.length + files.length > 4) {
            // setErrors({ ...errors, images: 'Maximum 4 images allowed' });
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

                setFormData(prev => ({
                    ...prev,
                    images: [...prev.images, base64Data]
                }));

            };
            reader.readAsDataURL(file);
        });
    };

    // Handle image removal
    const handleImageRemove = (index) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
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

            const replaceImage = [...formData.images];

            replaceImage[index] = base64Data;

            setFormData(prev => ({
                ...prev,
                images: replaceImage
            }));

            setErrors({ ...errors, images: null });
        }
        reader.readAsDataURL(file);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

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

            setSuccessOpen(true);
        } catch (error) {
            console.error("Server error: Merchandise changes could not be saved.", error);
            setFailedOpen(true);
        }
    }

    const handleSuccessClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }

        setSuccessOpen(false);
    };

    const handleFailedClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }

        setFailedOpen(false);
    };

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
                    Loading merchandise details...
                </Typography>
            </Box>
        )
    }

    return (
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ width: '100%', paddingBottom: "280px" }}>
            {/* Product Information Section */}
            <Box sx={{ width: '100%', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 550 }}>
                    Merchandise Name <RequiredAsterisk />
                </Typography>
            </Box>

            <Box sx={{ width: '100%', mb: 3 }}>
                <TextField
                    fullWidth
                    placeholder="Enter merchandise name"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    error={changedFields.includes('name')}
                    helperText={changedFields.includes('name') ? "This field has been modified" : ""}
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
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    error={changedFields.includes('description')}
                    helperText={changedFields.includes('description') ? "This field has been modified" : ""}
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
                <FormControl fullWidth error={changedFields.includes('category')} required>
                    <Select
                        displayEmpty
                        renderValue={(selected) => {
                            if (selected.length === 0) {
                                return <div style={{ color: '#a9a9a9' }}>Select a category</div>
                            }

                            return selected;
                        }}
                        value={formData.category}
                        onChange={(e) => handleChange('category', e.target.value)}
                        sx={{ borderRadius: 2 }}
                    >
                        <MenuItem value="Clothing">Clothing</MenuItem>
                        <MenuItem value="Non-Clothing">Non-Clothing</MenuItem>
                    </Select>
                    {changedFields.includes('category') && <FormHelperText>This field has been modified</FormHelperText>}
                </FormControl>
            </Box>

            {/* Sizes Field - Only shown for Clothing category - Full width row */}
            {formData.category === 'Clothing' && (
                <>
                    <Box sx={{ width: '100%', mb: 2 }}>
                        <Typography variant="h6" sx={{ fontWeight: 550 }}>
                            Merchandise Sizes (S, M, L, XL, Free Size, etc.) <RequiredAsterisk />
                        </Typography>
                    </Box>
                    <Box sx={{ width: '100%', mb: 2 }}>
                        <FormControl fullWidth error={changedFields.includes('sizes')}>
                            <TextField
                                fullWidth
                                value={size}
                                onChange={(e) => setSize(e.target.value)}
                                placeholder="Type a size and click add"
                                error={changedFields.includes('sizes')}
                                helperText={changedFields.includes('description') && ""}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                onClick={(e) => {
                                                    handleArrayAdd('sizes', size);
                                                    setSize('');
                                                }}
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
                        {formData.sizes.length > 0 && (
                            <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                {formData.sizes.map((s, index) => (
                                    <Chip
                                        key={index}
                                        label={s}
                                        onDelete={() => handleArrayRemove("sizes", index)}
                                        color="primary"
                                        sx={{ borderRadius: 2, fontWeight: 500 }}
                                    />
                                ))}
                            </Box>
                        )}
                    </Box>
                </>
            )}

            <Box sx={{ width: '100%', mt: 3, mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 550 }}>
                    Diamonds Cost <RequiredAsterisk />
                </Typography>
            </Box>

            {/* Diamonds Needed Field - Full width row */}
            <Box sx={{ width: '100%', mb: 3 }}>
                <TextField
                    fullWidth
                    placeholder="Enter diamonds required"
                    value={formData.diamondsToRedeem}
                    onChange={(e) => handleChange("diamondsToRedeem", e.target.value)}
                    error={changedFields.includes('diamondsToRedeem')}
                    helperText={changedFields.includes('diamondsToRedeem')}
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
                    value={formData.collectionLocationName}
                    onChange={(e) => handleChange("collectionLocationName", e.target.value)}
                    error={changedFields.includes('collectionLocationName')}
                    helperText={changedFields.includes('collectionLocationName')}
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
                    disabled={formData.images.length >= 4}
                    color="primary"
                >
                    {formData.images.length > 0 ? 'Add Another Image' : 'Upload Merchandise Images'}
                    <input
                        type="file"
                        accept="image/*"
                        hidden
                        onChange={handleImageUpload}
                    />
                </Button>

                {errors?.images && (
                    <FormHelperText error>{errors.images}</FormHelperText>
                )}

                {/* Images Preview - This can be multi-column */}
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

            {/* Action Buttons - Full width row */}
            <Box
                sx={{
                    position: 'fixed',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    padding: 3,
                    paddingRight: 6,
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

            <Snackbar
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                open={successOpen}
                autoHideDuration={4000}
                onClose={handleSuccessClose}
            >
                <Alert
                    severity="success"
                    variant="filled"
                    sx={{ width: '100%' }}
                >
                    Merchandise changes saved successfully!
                </Alert>
            </Snackbar>

            <Snackbar
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                open={failedOpen}
                autoHideDuration={4000}
                onClose={handleFailedClose}
            >
                <Alert
                    severity="error"
                    variant="filled"
                    sx={{ width: '100%' }}
                >
                    Server error: Merchandise changes could not be saved.
                </Alert>
            </Snackbar>
        </Box>
    )
}

export default MerchandiseEditing