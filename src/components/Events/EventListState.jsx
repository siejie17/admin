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
} from '@mui/material';
import {
    CalendarToday as CalendarTodayIcon,
    AccessTime as AccessTimeIcon,
    LocationOn as LocationOnIcon,
    EventNote as EventNoteIcon
} from '@mui/icons-material';
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
            spacing={{ xs: 2, sm: 3, md: 5 }}
            justifyContent='center'
            alignItems="center"
        >
            {events.map((event) => {
                return (
                    <Grid key={event.id} xs={9} sm={6} md={4} lg={3}>
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
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
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

                                    <Grid>
                                        <Stack>
                                            <Box>
                                                <Box
                                                    sx={{
                                                        bgcolor: 'primary.lighter',
                                                        borderRadius: 1.5
                                                    }}
                                                >

                                                </Box>
                                            </Box>
                                        </Stack>
                                    </Grid>

                                    {/* <Box sx={{ mt: { xs: 1, sm: 2 } }}>
                                        <Stack spacing={{ xs: 1, sm: 1.5 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <CalendarTodayIcon
                                                    sx={{ color: 'primary.main', fontSize: { xs: 16, sm: 18 } }}
                                                />
                                                <Typography
                                                    variant="body2"
                                                    sx={{
                                                        ml: { xs: 1, sm: 1.5 },
                                                        color: 'text.primary',
                                                        fontWeight: 500,
                                                        fontSize: { xs: '0.75rem', sm: '0.875rem' }
                                                    }}
                                                >
                                                    {formatTimestamp(event.eventStartDateTime)}
                                                </Typography>
                                            </Box>

                                            {event.eventEndDateTime && (
                                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                    <AccessTimeIcon
                                                        sx={{ color: 'primary.main', fontSize: { xs: 16, sm: 18 } }}
                                                    />
                                                    <Typography
                                                        variant="body2"
                                                        sx={{
                                                            ml: { xs: 1, sm: 1.5 },
                                                            color: 'text.primary',
                                                            fontWeight: 500,
                                                            fontSize: { xs: '0.75rem', sm: '0.875rem' }
                                                        }}
                                                    >
                                                        To: {formatTimestamp(event.eventEndDateTime)}
                                                    </Typography>
                                                </Box>
                                            )}
                                        </Stack>
                                    </Box> */}
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                )
            })}
        </Grid>
    )
}

export default EventListState