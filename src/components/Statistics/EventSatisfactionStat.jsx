import React, { useState, useEffect } from 'react';
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
    const primaryY = top + height / 2 - 5;
    const secondaryY = primaryY + 24;

    return (
        <React.Fragment>
            <StyledText variant="primary" x={left + width / 2 + 6} y={primaryY}>
                {primaryText}
            </StyledText>
            <StyledText variant="secondary" x={left + width / 2 + 6} y={secondaryY}>
                {secondaryText}
            </StyledText>
        </React.Fragment>
    );
}

// Custom Full Circle Gauge Component
const EventSatisfactionStat = ({ averageSatisfactionRating }) => {
    // State for the current value and animation
    const [currentValue, setCurrentValue] = useState(0);
    const [animationComplete, setAnimationComplete] = useState(false);

    const maxValue = 5.0;

    // Animation effect
    useEffect(() => {
        const animationDuration = 2000; // 1.5 seconds
        const steps = 8;
        const stepValue = averageSatisfactionRating / steps;
        let currentStep = 0;

        const interval = setInterval(() => {
            if (currentStep < steps) {
                setCurrentValue(prev => Math.min(prev + stepValue, averageSatisfactionRating));
                currentStep++;
            } else {
                clearInterval(interval);
                setAnimationComplete(true);
            }
        }, animationDuration / steps);

        return () => clearInterval(interval);
    }, [averageSatisfactionRating]);

    // Calculate the remaining segment (empty part)
    const remainingValue = maxValue - currentValue;

    // Color function for the gauge
    const getColor = (value) => {
        if (value < 2) return '#f44336'; // Red for low satisfaction
        if (value < 3) return '#ff9800'; // Orange for medium satisfaction
        if (value < 4) return '#2196f3'; // Blue for good satisfaction
        return '#4caf50'; // Green for excellent satisfaction
    };

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
                Average Event Satisfaction Rating
            </Typography>

            <Box sx={{ position: 'relative', height: 250, width: '100%', pt: 2 }}>
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
                            cx: 125,
                            cy: 125,
                        }
                    ]}
                    height={250}
                    width={250}
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
    );
};

export default EventSatisfactionStat;