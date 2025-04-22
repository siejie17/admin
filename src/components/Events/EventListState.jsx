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
            spacing={{ xs: 2, sm: 3, md: 5, lg: 8 }}
            sx={{
                px: { xs: 2, sm: 4 },
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
                                <Box sx={{ position: 'relative', height: { xs: 150, sm: 175 } }}>
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
                                            top: 10,
                                            right: 10,
                                            fontWeight: 600,
                                            fontSize: '0.65rem',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.5px',
                                            backgroundColor:
                                                event.status === 'Upcoming' ? alpha(theme.palette.primary.main, 0.95) :
                                                    event.status === 'Ongoing' ? alpha(theme.palette.success.main, 0.95) :
                                                        event.status === 'Cancelled' ? alpha(theme.palette.error.main, 0.95) :
                                                            event.status === 'Completed' ? alpha(theme.palette.info.main, 0.95) :
                                                                alpha(theme.palette.primary.main, 0.95),
                                            color: "#fff",
                                            height: 22,
                                            borderRadius: 1,
                                            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                                            px: 1
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
                                            fontSize: { xs: '0.95rem', sm: '1rem' },
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