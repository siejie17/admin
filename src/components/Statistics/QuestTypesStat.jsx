import { PieChart } from '@mui/x-charts/PieChart';
import { Box, Paper, Typography, useTheme } from '@mui/material';
import AssignmentIcon from '@mui/icons-material/Assignment';

const QuestTypesStat = ({ questTypeCounts = {} }) => {
    const theme = useTheme();

    // Check if there are no quest statistics
    const hasNoData = !questTypeCounts || 
        Object.values(questTypeCounts).every(count => !count || count === 0);

    if (hasNoData) {
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
                    Total Number of Quests by Type
                </Typography>
                <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column',
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    height: 220,
                    gap: 2
                }}>
                    <AssignmentIcon 
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
                        No quest data available
                    </Typography>
                    <Typography 
                        variant="body2" 
                        sx={{ 
                            color: theme.palette.text.secondary,
                            textAlign: 'center',
                            opacity: 0.7
                        }}
                    >
                        Create quests to see statistics
                    </Typography>
                </Box>
            </Paper>
        );
    }

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