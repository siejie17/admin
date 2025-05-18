import { useState } from 'react';
import {
    Box,
    Card,
    CardContent,
    Chip,
    Stack,
    Typography,
    useTheme,
    alpha,
} from '@mui/material';
import { SparkLineChart } from '@mui/x-charts';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat';

// Helper function to get last 12 months
function getLast12Month() {
    const now = new Date();
    const months = [];

    for (let i = 11; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const label = date.toLocaleString('default', { month: 'short', year: 'numeric' });
        months.push(label);
    }

    return months;
}

// Custom Area Gradient for charts
function AreaGradient({ color, id }) {
    return (
        <defs>
            <linearGradient id={id} x1="50%" y1="0%" x2="50%" y2="100%">
                <stop offset="0%" stopColor={color} stopOpacity={0.4} />
                <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
        </defs>
    );
}

const StatCard = ({
    eventType,
    total,
    interval,
    trend,
    trendValues,
    monthly
}) => {
    const theme = useTheme();
    const [hover, setHover] = useState(false);
    const last12Months = getLast12Month();

    // Define trend properties
    const trendConfig = {
        up: {
            color: theme.palette.success.main,
            icon: <TrendingUpIcon sx={{ fontSize: 16 }} />,
        },
        down: {
            color: theme.palette.error.main,
            icon: <TrendingDownIcon sx={{ fontSize: 16 }} />,
        },
        same: {
            color: theme.palette.primary.main,
            icon: <TrendingFlatIcon sx={{ fontSize: 16 }} />,
        }
    };

    // Get correct trend properties
    const trendColor = trendConfig[trend].color;
    const trendIcon = trendConfig[trend].icon;

    // Format chart data for SparkLineChart
    const chartData = monthly.map(val => Number(val));

    return (
        <Card
            elevation={hover ? 4 : 1}
            sx={{
                height: '100%',
                borderRadius: 2,
                transition: theme.transitions.create(['box-shadow', 'transform'], {
                    duration: theme.transitions.duration.standard,
                }),
                transform: hover ? 'translateY(-4px)' : 'none',
                overflow: 'visible',
                position: 'relative',
                '&:hover': {
                    '& .indicator-dot': {
                        transform: 'scale(1.2)',
                    }
                }
            }}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
        >
            {/* Indicator dot - absolute positioned */}
            <Box
                className="indicator-dot"
                sx={{
                    position: 'absolute',
                    top: 16,
                    left: 16,
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor: trendColor,
                    transition: theme.transitions.create('transform', {
                        duration: theme.transitions.duration.shorter,
                    }),
                    boxShadow: `0 0 0 3px ${alpha(trendColor, 0.2)}`,
                }}
            />

            <CardContent sx={{ p: 3, py: 2 }}>
                {/* Header with event type */}
                <Stack direction="row" alignItems="center" spacing={1.5} sx={{ ml: 2.5, mb: 1.5 }}>
                    <Typography
                        variant="body2"
                        color="textPrimary"
                        sx={{
                            fontWeight: 600,
                            letterSpacing: '0.02em',
                        }}
                    >
                        {eventType}
                    </Typography>
                </Stack>

                {/* Main stats with trend indicator */}
                <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="flex-start"
                    sx={{ mb: 1 }}
                >
                    <Stack spacing={0.5}>
                        <Typography
                            variant="h5"
                            sx={{
                                fontWeight: 600,
                                letterSpacing: '-0.02em'
                            }}
                        >
                            {total}
                        </Typography>
                        <Typography
                            variant="caption"
                            color="textSecondary"
                            sx={{
                                fontSize: '0.7rem',
                                opacity: 0.7
                            }}
                        >
                            {interval}
                        </Typography>
                    </Stack>

                    <Chip
                        label={
                            <Stack direction="row" spacing={0.5} alignItems="center">
                                {trendIcon}
                                <Typography variant="caption" sx={{ fontWeight: 'bold', fontSize: 9 }}>
                                    {trendValues} %
                                </Typography>
                            </Stack>
                        }
                        sx={{
                            height: 28,
                            bgcolor: alpha(trendColor, 0.12),
                            color: trendColor,
                            '& .MuiChip-label': {
                                px: 1,
                            },
                            borderRadius: 4
                        }}
                    />
                </Stack>

                {/* Chart */}
                <Box sx={{ height: 50, mt: 0.5, mb: -1 }}>
                    <SparkLineChart
                        data={chartData}
                        colors={[trendColor]}
                        showHighlight
                        showTooltip
                        area
                        height={50}
                        xAxis={{
                            scaleType: 'band',
                            data: last12Months,
                        }}
                        sx={{
                            '& .MuiChartsAxis-tickLabel': {
                                display: 'none',
                            },
                            '& .MuiAreaElement-root': {
                                strokeWidth: 2,
                                fill: `url(#area-gradient-${eventType})`,
                            },
                            '& .MuiLineElement-root': {
                                stroke: trendColor,
                            },
                            '& .MuiHighlightElement-root': {
                                stroke: trendColor,
                                fill: trendColor,
                                strokeWidth: 2,
                            },
                            '& .MuiChartsTooltip-table': {
                                boxShadow: theme.shadows[3],
                                borderRadius: 1,
                                p: 1,
                            },
                            '& .MuiChartsTooltip-mark': {
                                backgroundColor: trendColor,
                            }
                        }}
                    >
                        <AreaGradient color={trendColor} id={`area-gradient-${eventType}`} />
                    </SparkLineChart>
                </Box>

                {/* Time period indicators */}
                <Stack
                    direction="row"
                    justifyContent="space-between"
                    sx={{
                        mt: 1,
                        mx: 1,
                        opacity: 0.7,
                    }}
                >
                    <Typography variant="caption" color="textSecondary" sx={{ fontSize: '0.65rem' }}>
                        {last12Months[0]}
                    </Typography>
                    <Typography variant="caption" color="textSecondary" sx={{ fontSize: '0.65rem' }}>
                        {last12Months[last12Months.length - 1]}
                    </Typography>
                </Stack>
            </CardContent>
        </Card>
    );
};

export default StatCard;