import React from 'react';
import {
    Box,
    Card,
    CardMedia,
    CardContent,
    Typography,
    Grid,
    Stack,
    Chip,
    Link
} from '@mui/material';
import {
    CalendarToday as CalendarTodayIcon,
    LocationOn as LocationOnIcon,
    ArrowRightAlt as ArrowRightAltIcon
} from '@mui/icons-material';

import CryptoJS from "crypto-js";
import { Link as RouterLink } from 'react-router-dom';
import { format } from 'date-fns';

const EventListState = ({ events }) => {
    // Format Firebase timestamp to readable date
    const formatTimestamp = (timestamp) => {
        if (!timestamp) return 'TBA';

        const date = timestamp.toDate();
        return format(date, 'MMM dd, yyyy • h:mm a');
    };

    return (
        <Grid
            container
            width="100%"
            spacing={{ xs: 2, sm: 3, md: 8 }}
            alignItems="center"
            sx={{
                px: 5,
                justifyContent: { xs: 'center', lg: 'flex-start' }
            }}
        >
            {events.map((event) => {
                const encryptedID = CryptoJS.AES.encrypt(event.id, "UniEXP_Admin").toString();

                return (
                    <Grid key={event.id}>
                        <Link
                            component={RouterLink}
                            to={`/event/details?id=${encodeURIComponent(encryptedID)}&name=${encodeURIComponent(event.eventName)}&tab=details`}
                            underline="none"
                            sx={{ display: 'block' }}
                        >
                            <Card
                                elevation={0}
                                sx={{
                                    height: '100%',
                                    width: { xs: 325, sm: 425, md: 450 },
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
                                <Box sx={{ position: 'relative', height: { xs: 100, sm: 125, md: 175 } }}>
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
                                        image={`data:image/png;base64,${event.imagesData[0]}`}
                                        alt={event.eventName}
                                    />
                                    <Chip
                                        label={event.status}
                                        size="small"
                                        color={
                                            event.status === 'Upcoming' ? 'primary' :
                                                event.status === 'Ongoing' ? 'success' :
                                                    event.status === 'Cancelled' ? 'error' :
                                                        event.status === 'Completed' ? 'info' : 'default'
                                        }
                                        sx={{
                                            position: 'absolute',
                                            top: 12,
                                            right: 12,
                                            fontWeight: 600,
                                            fontSize: { xs: '0.65rem', sm: '0.7rem' },
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.5px',
                                            backgroundColor: 'primary.main',
                                            color: "#fff",
                                            boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                                        }}
                                    />
                                </Box>

                                <CardContent sx={{
                                    p: { xs: 1, sm: 1.5, md: 2 },
                                    flexGrow: 1,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'space-between',
                                    background: 'transparent'
                                }}>
                                    <Box>
                                        <Box>
                                            <Typography
                                                variant="h5"
                                                component="h1"
                                                fontWeight="600"
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
                                                {event.eventName}
                                            </Typography>
                                        </Box>

                                        <Stack spacing={2}>
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <Box
                                                    sx={{
                                                        bgcolor: 'primary.lighter',
                                                        borderRadius: 1.5,
                                                        px: 1,
                                                        display: 'flex',
                                                        justifyContent: 'center',
                                                        alignItems: 'center',
                                                    }}
                                                >
                                                    <CalendarTodayIcon
                                                        sx={{
                                                            color: 'primary.main',
                                                            fontSize: { xs: 18, sm: 20 }
                                                        }}
                                                    />
                                                </Box>
                                                <Box sx={{ ml: 2, display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
                                                    <Box>
                                                        <Typography
                                                            variant='caption'
                                                            sx={{
                                                                color: 'text.secondary',
                                                                display: 'block'
                                                            }}
                                                        >
                                                            Starts
                                                        </Typography>
                                                        <Typography
                                                            variant='body2'
                                                            sx={{
                                                                color: 'text.primary',
                                                                fontWeight: 600,
                                                                fontSize: { xs: '0.7rem', sm: '0.8rem' }
                                                            }}
                                                        >
                                                            {formatTimestamp(event.eventStartDateTime)}
                                                        </Typography>
                                                    </Box>

                                                    <>
                                                        <ArrowRightAltIcon
                                                            sx={{
                                                                mx: { xs: 1, sm: 2 },
                                                                color: 'text.secondary',
                                                                fontSize: { xs: 20, sm: 24 }
                                                            }}
                                                        />
                                                        <Box>
                                                            <Typography
                                                                variant='caption'
                                                                sx={{
                                                                    color: 'text.secondary',
                                                                    display: 'block'
                                                                }}
                                                            >
                                                                Ends
                                                            </Typography>
                                                            <Typography
                                                                variant='body2'
                                                                sx={{
                                                                    color: 'text.primary',
                                                                    fontWeight: 600,
                                                                    fontSize: { xs: '0.7rem', sm: '0.8rem' }
                                                                }}
                                                            >
                                                                {formatTimestamp(event.eventEndDateTime)}
                                                            </Typography>
                                                        </Box>
                                                    </>
                                                </Box>
                                            </Box>

                                            <Box sx={{ display: 'flex', alignItems: 'center', mt: "12px" }}>
                                                <Box
                                                    sx={{
                                                        bgcolor: 'primary.lighter',
                                                        borderRadius: 1.5,
                                                        px: 1,
                                                        display: 'flex',
                                                        justifyContent: 'center',
                                                        alignItems: 'center'
                                                    }}
                                                >
                                                    <LocationOnIcon
                                                        sx={{
                                                            color: 'primary.main',
                                                            fontSize: { xs: 18, sm: 20 }
                                                        }}
                                                    />
                                                </Box>
                                                <Box sx={{ ml: 2 }}>
                                                    <Typography
                                                        variant='caption'
                                                        sx={{
                                                            color: 'text.secondary',
                                                            display: 'block'
                                                        }}
                                                    >
                                                        Location
                                                    </Typography>
                                                    <Typography
                                                        variant='body2'
                                                        sx={{
                                                            color: 'text.primary',
                                                            fontWeight: 600,
                                                            fontSize: { xs: '0.7rem', sm: '0.8rem' }
                                                        }}
                                                    >
                                                        {event.locationName || 'No location speacified'}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </Stack>
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

export default EventListState