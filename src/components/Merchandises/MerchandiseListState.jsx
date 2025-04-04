import React from 'react';
import {
    Box,
    Card,
    CardMedia,
    CardContent,
    Typography,
    Grid,
    Link
} from '@mui/material';
import CryptoJS from "crypto-js";
import { Link as RouterLink } from 'react-router-dom';

import LocationOnIcon from '@mui/icons-material/LocationOn'

import Diamond from '../../assets/icons/diamond.png';

const MerchandiseListState = ({ merchandises }) => {
    return (
        <Grid
            container
            width="100%"
            spacing={{ xs: 2, sm: 3, md: 5 }}
            justifyContent="center"
            alignItems="center"
        >
            {merchandises.map((merch) => {
                const encryptedID = CryptoJS.AES.encrypt(merch.id, "UniEXP_Admin").toString();

                return (
                    <Grid item key={merch.id} xs={9} sm={6} md={4} lg={3}>
                        <Link
                            component={RouterLink}
                            to={`/merchandise/details?id=${encodeURIComponent(encryptedID)}&name=${encodeURIComponent(merch.name)}&tab=details`}
                            underline="none"
                            sx={{ display: 'block', height: '100%' }}
                        >
                            <Card
                                elevation={0}
                                sx={{
                                    height: '100%',
                                    width: { xs: 325, sm: 450, md: 500, lg: 500 },
                                    display: 'flex',
                                    flexDirection: 'column',
                                    borderRadius: 3,
                                    overflow: 'hidden',
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    transition: 'all 0.3s ease',
                                    position: 'relative',
                                    background: 'linear-gradient(to bottom, #ffffff, #f8f9fa)',
                                    '&:hover': {
                                        transform: { xs: 'none', sm: 'translateY(-4px)' },
                                        boxShadow: { xs: 'none', sm: '0 8px 16px rgba(0,0,0,0.08)' },
                                        cursor: 'pointer',
                                        borderColor: 'primary.light'
                                    }
                                }}
                            >
                                {/* Diamond badge */}
                                <Box
                                    sx={{
                                        position: 'absolute',
                                        top: 12,
                                        right: 12,
                                        backgroundColor: 'primary.main',
                                        color: 'white',
                                        borderRadius: '50px',
                                        padding: '4px 12px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 0.5,
                                        zIndex: 1,
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                                    }}
                                >
                                    <img src={Diamond} style={{ height: '15px', width: '15px' }} />
                                    <Typography variant="subtitle2" fontWeight="700">
                                        {merch.diamondsToRedeem}
                                    </Typography>
                                </Box>

                                <Box sx={{ position: 'relative', height: { xs: 180, sm: 200, md: 240 } }}>
                                    <CardMedia
                                        component="img"
                                        sx={{
                                            height: '100%',
                                            width: '100%',
                                            objectFit: 'cover',
                                            transition: 'transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                                            '&:hover': {
                                                transform: { xs: 'none', sm: 'scale(1.08)' },
                                            }
                                        }}
                                        image={`data:image/png;base64,${merch.images[0]}`}
                                        alt={merch.name}
                                    />
                                    {/* Gradient overlay */}
                                    <Box
                                        sx={{
                                            position: 'absolute',
                                            bottom: 0,
                                            left: 0,
                                            right: 0,
                                            height: '30%',
                                            background: 'linear-gradient(to top, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0) 100%)',
                                        }}
                                    />
                                </Box>

                                <CardContent sx={{
                                    p: { xs: 2, sm: 2.5, md: 3 },
                                    flexGrow: 1,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'space-between',
                                    background: 'transparent'
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
                                                lineHeight: 1.4,
                                                fontSize: { xs: '1rem', sm: '1.15rem', md: '1.25rem' },
                                                mb: 1
                                            }}
                                        >
                                            {merch.name}
                                        </Typography>

                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                            sx={{
                                                fontSize: { xs: '0.8rem', sm: '0.85rem' },
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 0.5
                                            }}
                                        >
                                            <LocationOnIcon fontSize="small" />
                                            Pickup Location: {merch.collectionLocationName}
                                        </Typography>
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