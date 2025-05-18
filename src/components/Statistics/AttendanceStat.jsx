import { PieChart } from '@mui/x-charts/PieChart';
import { Paper, Typography, Box, useTheme } from '@mui/material';

// Custom Full Circle Gauge Component
const AttendanceStat = ({ totalAttendees, totalAbsentees }) => {
    const theme = useTheme();

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