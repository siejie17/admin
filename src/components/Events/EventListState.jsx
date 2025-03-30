import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardMedia,
    CardContent,
    Typography,
    Grid,
    Container,
    Pagination,
    Stack,
    Chip,
    useMediaQuery,
    alpha,
    useTheme,
    CircularProgress,
    Paper
} from '@mui/material';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { styled } from '@mui/material/styles';
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
            spacing={{ xs: 2, sm: 3, md: 4 }}
            justifyContent={{ xs: 'center', sm: 'center', lg: "flex-start" }}
            alignItems="center"
        >
            {events.map((event) => (
                <Grid key={event.id}>
                    <Card
                        elevation={0}
                        sx={{
                            height: { xs: 'auto', sm: 'auto' },
                            width: '100%',
                            minWidth: { xs: 325, sm: 450, md: 450, lg: 450 },
                            display: 'flex',
                            flexDirection: 'column',
                            borderRadius: 2,
                            overflow: 'hidden',
                            border: '1px solid',
                            borderColor: 'divider',
                            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                            '&:hover': {
                                transform: { xs: 'none', sm: 'translateY(-4px)' },
                                boxShadow: { xs: 'none', sm: '0 8px 16px rgba(0,0,0,0.08)' },
                                cursor: 'pointer'
                            }
                        }}
                    >
                        <Box sx={{ position: 'relative', height: { xs: 140, sm: 160, md: 180 } }}>
                            <CardMedia
                                component="img"
                                sx={{
                                    height: '100%',
                                    width: '100%',
                                    objectFit: 'cover',
                                    transition: 'transform 0.3s ease',
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
                                    boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
                                }}
                            />
                        </Box>

                        <CardContent sx={{
                            p: { xs: 1.5, sm: 2, md: 2.5 },
                            mb: { xs: 1, sm: 2 },
                            flexGrow: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between'
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
                                        lineHeight: 1.3,
                                        fontSize: { xs: '0.95rem', sm: '1.1rem', md: '1.25rem' }
                                    }}
                                >
                                    {event.eventName}
                                </Typography>

                                <Box sx={{ mt: { xs: 1, sm: 2 } }}>
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
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            ))}
        </Grid>
    )
}

export default EventListState