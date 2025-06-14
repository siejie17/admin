import { PieChart } from '@mui/x-charts/PieChart';
import { Paper, Typography, Box, useTheme } from '@mui/material';
import EventBusyIcon from '@mui/icons-material/EventBusy';

// Custom Full Circle Gauge Component
const AttendanceStat = ({ totalAttendees = 0, totalAbsentees = 0 }) => {
    const theme = useTheme();

    // Check if there are no attendance statistics
    if (totalAttendees === 0 && totalAbsentees === 0) {
        return (
            <Paper
                elevation={3}
                sx={{
                    p: 3,
                    borderRadius: 4,
                    background: 'linear-gradient(145deg, #ffffff, #f5f5f5)',
                    maxWidth: 500,
                    mx: 'auto',
                    mb: 3,
                    transition: 'transform 0.2s ease-in-out',
                    '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: theme.shadows[6],
                    }
                }}
            >
                <Typography 
                    variant="h6" 
                    align="center" 
                    fontWeight="bold"
                    sx={{
                        mb: 2,
                        color: 'black',
                        textShadow: '1px 1px 2px rgba(0,0,0,0.1)'
                    }}
                >
                    Attendance Summary
                </Typography>
                <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column',
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    height: 235,
                    gap: 2
                }}>
                    <EventBusyIcon 
                        sx={{ 
                            fontSize: 80,
                            color: 'black',
                            opacity: 0.8,
                            animation: 'pulse 2s infinite',
                            '@keyframes pulse': {
                                '0%': {
                                    transform: 'scale(1)',
                                    opacity: 0.8,
                                },
                                '50%': {
                                    transform: 'scale(1.1)',
                                    opacity: 0.6,
                                },
                                '100%': {
                                    transform: 'scale(1)',
                                    opacity: 0.8,
                                },
                            },
                        }}
                    />
                    <Typography 
                        variant="h6" 
                        sx={{ 
                            color: theme.palette.text.secondary,
                            textAlign: 'center',
                            fontWeight: 500
                        }}
                    >
                        No attendance data available
                    </Typography>
                    <Typography 
                        variant="body2" 
                        sx={{ 
                            color: theme.palette.text.secondary,
                            textAlign: 'center',
                            opacity: 0.7
                        }}
                    >
                        Check back later for updates
                    </Typography>
                </Box>
            </Paper>
        );
    }

    // Data for the pie chart
    const data = [
        { id: 0, value: totalAttendees, color: theme.palette.primary.main, label: 'Total Attendees' },
        { id: 1, value: totalAbsentees, color: theme.palette.error.main, label: 'Total Absentees' }
    ];

    return (
        <Paper
            elevation={3}
            sx={{
                p: 2,
                borderRadius: 4,
                background: 'linear-gradient(145deg, #ffffff, #f5f5f5)',
                maxWidth: 500,
                mx: 'auto',
                mb: 3,
            }}
        >
            <Typography variant="h6" align="center" fontWeight="bold">
                Attendance Summary
            </Typography>

            <Box sx={{ position: 'relative', height: 270, width: '100%' }}>
                <PieChart
                    series={[
                        {
                            data,
                            innerRadius: 30,
                            outerRadius: 100,
                            paddingAngle: 0,
                            cornerRadius: 0,
                            startAngle: 0,
                            endAngle: 360,
                            cx: 125,
                            cy: 125,
                        }
                    ]}
                    height={300}
                    width={300}
                    slotProps={{
                        legend: { hidden: true },
                    }}
                />
            </Box>
        </Paper>
    );
};

export default AttendanceStat;