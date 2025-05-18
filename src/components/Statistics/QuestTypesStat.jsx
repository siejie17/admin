import { PieChart } from '@mui/x-charts/PieChart';
import { Box, Paper, Typography, useTheme } from '@mui/material';

const QuestTypesStat = ({ questTypeCounts }) => {
    const theme = useTheme();

    const data = [
        { id: 0, value: questTypeCounts.attendance, color: theme.palette.primary.light, label: 'Attendance' },
        { id: 1, value: questTypeCounts.earlyBird, color: theme.palette.secondary.light, label: 'Early Bird' },
        { id: 2, value: questTypeCounts["q&a"], color: theme.palette.warning.light, label: 'Question & Answer' },
        { id: 3, value: questTypeCounts.networking, color: theme.palette.error.light, label: 'Networking' },
        { id: 4, value: questTypeCounts.feedback, color: theme.palette.success.light, label: 'Feedback' }
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
                Total Number of Quests by Type
            </Typography>

            <Box sx={{ position: 'relative', height: 250, width: '100%' }}>
                <PieChart
                    series={[
                        {
                            data,
                            outerRadius: 100,
                            paddingAngle: 0,
                            cornerRadius: 0,
                            startAngle: 0,
                            endAngle: 360,
                        }
                    ]}
                    height={275}
                    width={275}
                    slotProps={{
                        legend: { hidden: true },
                    }}
                />
            </Box>
        </Paper>
    )
}

export default QuestTypesStat