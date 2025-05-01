import React from 'react';
import {
    Box,
    Card,
    CardMedia,
    CardContent,
    Typography,
    Grid,
    Link,
    alpha,
    useTheme,
    Chip
} from '@mui/material';
import CryptoJS from "crypto-js";
import { Link as RouterLink } from 'react-router-dom';

import LocationOnIcon from '@mui/icons-material/LocationOn'

import Diamond from '../../assets/icons/diamond.png';

const MerchandiseListState = ({ merchandises }) => {
    const theme = useTheme();

    const secretKey = import.meta.env.VITE_ADMIN_SECRET_KEY;

    return (
        <Grid
            container
            width="100%"
            spacing={{ xs: 2, sm: 3, md: 4 }}
            sx={{
                px: 1,
                justifyContent: 'center'
            }}
        >
            {merchandises.map((merch) => {
                const encryptedID = CryptoJS.AES.encrypt(merch.id, secretKey).toString();

                return (
                    <Grid key={merch.id}>
                        <Link
                            component={RouterLink}
                            to={`/merchandise/details?id=${encodeURIComponent(encryptedID)}&name=${encodeURIComponent(merch.name)}&tab=details`}
                            underline="none"
                            sx={{ display: 'block' }}
                        >
                            <Card
                                elevation={1}
                                sx={{
                                    height: '100%',
                                    width: 350,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    borderRadius: 3,
                                    overflow: 'hidden',
                                    border: '1px solid',
                                    borderColor: alpha(theme.palette.divider, 0.1),
                                    transition: 'all 0.25s ease',
                                    position: 'relative',
                                    background: theme.palette.background.paper,
                                    '&:hover': {
                                        transform: { xs: 'none', sm: 'translateY(-4px)' },
                                        boxShadow: { xs: 'none', sm: '0 12px 20px rgba(0,0,0,0.06)' },
                                        borderColor: alpha(theme.palette.primary.main, 0.3),
                                        cursor: 'pointer',
                                    }
                                }}
                            >
                                <Box sx={{ position: 'relative', height: { xs: 125, sm: 140 } }}>
                                    <CardMedia
                                        component="img"
                                        sx={{
                                            height: '100%',
                                            width: '100%',
                                            objectFit: 'cover',
                                            transition: 'transform 0.5s ease',
                                            '&:hover': {
                                                transform: { xs: 'none', sm: 'scale(1.05)' },
                                            }
                                        }}
                                        image={`data:image/png;base64,${merch.images[0]}`}
                                        alt={merch.name}
                                    />
                                    <Chip
                                        label={merch.available ? "Available" : "Unavailable"}
                                        size="small"
                                        sx={{
                                            position: 'absolute',
                                            top: 12,
                                            right: 12,
                                            fontWeight: 700,
                                            fontSize: '0.65rem',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.6px',
                                            backgroundColor: merch.available ?
                                                alpha(theme.palette.success.main, 0.9) :
                                                alpha(theme.palette.error.main, 0.9),
                                            color: "#fff",
                                            height: 24,
                                            borderRadius: 6,
                                            backdropFilter: 'blur(8px)',
                                            boxShadow: `0 2px 10px ${alpha('#000', 0.2)}, 0 0 0 1px ${alpha('#fff', 0.1)}`,
                                            px: 1.2,
                                            py: 0.5,
                                            '&:before': {
                                                content: '""',
                                                position: 'absolute',
                                                top: '-1px',
                                                left: '-1px',
                                                right: '-1px',
                                                bottom: '-1px',
                                                borderRadius: 6,
                                                background: 'linear-gradient(135deg, rgba(255,255,255,0.25), rgba(255,255,255,0))',
                                                zIndex: -1,
                                            },
                                            transition: 'all 0.2s ease',
                                            '&:hover': {
                                                transform: 'translateY(-1px)',
                                                boxShadow: `0 4px 12px ${alpha('#000', 0.25)}, 0 0 0 1px ${alpha('#fff', 0.15)}`
                                            }
                                        }}
                                    />
                                </Box>

                                <CardContent sx={{
                                    p: 2,
                                    pt: 1.5,
                                    pb: "16px !important",
                                    flexGrow: 1,
                                    display: 'flex',
                                    flexDirection: 'column'
                                }}>
                                    <Box>
                                        <Typography
                                            variant="h6"
                                            component="h2"
                                            fontWeight="600"
                                            color="text.primary"
                                            sx={{
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                display: '-webkit-box',
                                                WebkitLineClamp: 2,
                                                WebkitBoxOrient: 'vertical',
                                                lineHeight: 1.3,
                                                fontSize: { xs: '0.75rem', sm: '0.85rem' },
                                                color: theme.palette.text.primary,
                                                height: '2em'
                                            }}
                                        >
                                            {merch.name}
                                        </Typography>

                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <Box
                                                sx={{
                                                    bgcolor: 'primary.lighter',
                                                    borderRadius: 1.5,
                                                    pr: 0.5,
                                                    display: 'flex',
                                                    justifyContent: 'center',
                                                    alignItems: 'center',
                                                }}
                                            >
                                                📍
                                            </Box>
                                            <Box sx={{ ml: 1, display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
                                                <Box>
                                                    <Typography
                                                        variant='caption'
                                                        sx={{
                                                            color: 'text.secondary',
                                                            display: 'block'
                                                        }}
                                                    >
                                                        Pickup Location
                                                    </Typography>
                                                    <Typography
                                                        variant='body2'
                                                        sx={{
                                                            color: 'text.primary',
                                                            fontWeight: 600,
                                                            fontSize: { xs: '0.5rem', sm: '0.65rem' }
                                                        }}
                                                    >
                                                        {merch.collectionLocationName}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <Box
                                                sx={{
                                                    bgcolor: 'primary.lighter',
                                                    borderRadius: 1.5,
                                                    pr: 0.5,
                                                    display: 'flex',
                                                    justifyContent: 'center',
                                                    alignItems: 'center',
                                                }}
                                            >
                                                💎
                                            </Box>
                                            <Box sx={{ ml: 1, mt: '12px', display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
                                                <Box>
                                                    <Typography
                                                        variant='caption'
                                                        sx={{
                                                            color: 'text.secondary',
                                                            display: 'block'
                                                        }}
                                                    >
                                                        Diamonds Needed for Redemption
                                                    </Typography>
                                                    <Typography
                                                        variant='body2'
                                                        sx={{
                                                            color: 'text.primary',
                                                            fontWeight: 600,
                                                            fontSize: { xs: '0.5rem', sm: '0.65rem' }
                                                        }}
                                                    >
                                                        {merch.diamondsToRedeem}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </Box>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Link>
                    </Grid>
                )
            })}
        </Grid>
    )
}

export default MerchandiseListState;