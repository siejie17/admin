import React, { useEffect } from 'react';
import {
    Box,
    Card,
    CardMedia,
    CardContent,
    Typography,
    Grid,
    Chip,
    Link,
    alpha,
    useTheme
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
    const theme = useTheme();
    const secretKey = import.meta.env.VITE_ADMIN_SECRET_KEY;

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
            spacing={{ xs: 2, sm: 3, md: 4 }}
            sx={{
                px: 1,
                justifyContent: 'center'
            }}
        >
            {events.map((event) => {
                const encryptedID = CryptoJS.AES.encrypt(event.id, secretKey).toString();

                return (
                    <Grid key={event.id}>
                        <Link
                            component={RouterLink}
                            to={`/event/details?id=${encodeURIComponent(encryptedID)}&name=${encodeURIComponent(event.eventName)}&tab=details`}
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
                                        image={`data:image/png;base64,${event.imagesData[0]}`}
                                        alt={event.eventName}
                                    />
                                    <Chip
                                        label={event.status}
                                        size="small"
                                        sx={{
                                            position: 'absolute',
                                            top: 12,
                                            right: 12,
                                            fontWeight: 700,
                                            fontSize: '0.65rem',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.6px',
                                            backgroundColor:
                                                event.status === 'Scheduled' ? alpha(theme.palette.primary.main, 0.9) :
                                                    event.status === 'Postponed' ? alpha(theme.palette.warning.main, 0.9) :
                                                        event.status === 'Ongoing' ? alpha(theme.palette.secondary.main, 0.9) :
                                                            event.status === 'Cancelled' ? alpha(theme.palette.error.main, 0.9) :
                                                                event.status === 'Completed' ? alpha(theme.palette.success.main, 0.9) :
                                                                    alpha(theme.palette.primary.main, 0.95),
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

                                <CardContent
                                    sx={{
                                        p: 2,
                                        pt: 1.5,
                                        pb: "16px !important",
                                        flexGrow: 1,
                                        display: 'flex',
                                        flexDirection: 'column'
                                    }}
                                >
                                    <Typography
                                        variant="h6"
                                        component="h2"
                                        fontWeight="650"
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
                                        {event.eventName}
                                    </Typography>

                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <Box
                                            sx={{
                                                bgcolor: 'primary.lighter',
                                                borderRadius: 1.5,
                                                px: 0.5,
                                                display: 'flex',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                            }}
                                        >
                                            <CalendarTodayIcon
                                                sx={{
                                                    color: 'primary.main',
                                                    fontSize: { xs: 14, sm: 16 }
                                                }}
                                            />
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
                                                    Starts
                                                </Typography>
                                                <Typography
                                                    variant='body2'
                                                    sx={{
                                                        color: 'text.primary',
                                                        fontWeight: 600,
                                                        fontSize: { xs: '0.5rem', sm: '0.65rem' }
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
                                                        fontSize: { xs: 16, sm: 18 }
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
                                                            fontSize: { xs: '0.5rem', sm: '0.65rem' }
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
                                                px: 0.5,
                                                display: 'flex',
                                                justifyContent: 'center',
                                                alignItems: 'center'
                                            }}
                                        >
                                            <LocationOnIcon
                                                sx={{
                                                    color: 'primary.main',
                                                    fontSize: { xs: 14, sm: 16 }
                                                }}
                                            />
                                        </Box>
                                        <Box sx={{ ml: 1 }}>
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
                                                    fontSize: { xs: '0.5rem', sm: '0.65rem' }
                                                }}
                                            >
                                                {event.locationName || 'No location speacified'}
                                            </Typography>
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

export default EventListState