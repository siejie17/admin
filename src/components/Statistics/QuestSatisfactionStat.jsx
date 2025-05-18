import React, { useEffect, useState } from 'react';
import { PieChart } from '@mui/x-charts/PieChart';
import { Paper, Typography, Box, styled } from '@mui/material';
import { useDrawingArea } from '@mui/x-charts';

const StyledText = styled('text', {
    shouldForwardProp: (prop) => prop !== 'variant',
})(({ theme }) => ({
    textAnchor: 'middle',
    dominantBaseline: 'central',
    variants: [
        {
            props: {
                variant: 'primary',
            },
            style: {
                fontSize: theme.typography.h5.fontSize,
                fontWeight: "bold"
            },
        },
        {
            props: ({ variant }) => variant !== 'primary',
            style: {
                fontSize: theme.typography.body2.fontSize,
            },
        },
        {
            props: {
                variant: 'primary',
            },
        },
        {
            props: ({ variant }) => variant !== 'primary',
        },
    ],
}));

const PieCenterLabel = ({ primaryText, secondaryText }) => {
    const { width, height, left, top } = useDrawingArea();
    const primaryY = top + height / 2.35;
    const secondaryY = primaryY + 24;

    return (
        <React.Fragment>
            <StyledText variant="primary" x={left + width / 2.15} y={primaryY}>
                {primaryText}
            </StyledText>
            <StyledText variant="secondary" x={left + width / 2.15} y={secondaryY}>
                {secondaryText}
            </StyledText>
        </React.Fragment>
    );
}

const QuestSatisfactionStat = ({ averageQuestSatisfactionRating }) => {
    const [currentValue, setCurrentValue] = useState(0);
    const [animationComplete, setAnimationComplete] = useState(false);

    useEffect(() => {
        const animationDuration = 2000; // 1.5 seconds
        const steps = 8;
        const stepValue = averageQuestSatisfactionRating / steps;
        let currentStep = 0;

        const interval = setInterval(() => {
            if (currentStep < steps) {
                setCurrentValue(prev => Math.min(prev + stepValue, averageQuestSatisfactionRating));
                currentStep++;
            } else {
                clearInterval(interval);
                setAnimationComplete(true);
            }
        }, animationDuration / steps);

        return () => clearInterval(interval);
    }, [averageQuestSatisfactionRating]);

    const getColor = (value) => {
        if (value < 2) return '#f44336'; // Red for low satisfaction
        if (value < 3) return '#ff9800'; // Orange for medium satisfaction
        if (value < 4) return '#2196f3'; // Blue for good satisfaction
        return '#4caf50'; // Green for excellent satisfaction
    };

    const maxValue = 5.0;

    const remainingValue = maxValue - currentValue;

    // Data for the pie chart
    const data = [
        { id: 0, value: currentValue, color: getColor(currentValue), label: 'Satisfaction' },
        { id: 1, value: remainingValue, color: '#e0e0e0', label: 'Ramaining' }
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
            }}
        >
            <Typography variant="h6" align="center" fontWeight="bold">
                Average Quest Satisfaction Rating
            </Typography>

            <Box sx={{ position: 'relative', height: 250, width: '100%' }}>
                <PieChart
                    series={[
                        {
                            data,
                            innerRadius: 80,
                            outerRadius: 120,
                            paddingAngle: 0,
                            cornerRadius: 0,
                            startAngle: 90,
                            endAngle: 450,
                            cx: 120,
                            cy: 120,
                        }
                    ]}
                    height={275}
                    width={275}
                    slotProps={{
                        legend: { hidden: true },
                    }}
                    sx={{
                        '& .MuiChartsLegend-root': {
                            display: 'none'
                        }
                    }}
                >
                    <PieCenterLabel primaryText={currentValue.toFixed(2)} secondaryText={`out of ${maxValue.toFixed(2)}`} />
                </PieChart>
            </Box>
        </Paper>
    )
}

export default QuestSatisfactionStat;