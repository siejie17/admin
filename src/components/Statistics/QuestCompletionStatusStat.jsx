import React from 'react';
import { Box, Paper, styled, Typography, useTheme } from '@mui/material';
import { PieChart, useDrawingArea } from '@mui/x-charts';

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
                fontSize: theme.typography.h6.fontSize,
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

const QuestCompletionStatusStat = ({ questType, stats }) => {
    const theme = useTheme();

    const QUEST_TYPE_MAPPING = {
        attendance: "Attendance",
        earlyBird: "Early Bird",
        "q&a": "Question & Answer",
        networking: "Networking",
        feedback: "Feedback"
    }

    const data = [
        { id: 0, value: stats.completed, color: theme.palette.success.main, label: 'Completed' },
        { id: 1, value: stats.notCompleted, color: theme.palette.error.main, label: 'Not Completed' }
    ];

    const completedStat = (stats.completed + stats.notCompleted) !== 0 ? ((stats.completed / (stats.completed + stats.notCompleted)) * 100).toFixed(2).toString() : "0"

    return (
        <Paper
            elevation={2}
            sx={{
                p: 1.5,
                borderRadius: 3,
                background: 'linear-gradient(135deg, #ffffff, #f7f7f7)',
                maxWidth: 320,
                mx: 'auto',
                boxShadow: '0 6px 12px rgba(0,0,0,0.05)'
            }}
        >
            <Typography
                variant="subtitle1"
                align="center"
                fontWeight="bold"
                sx={{ mb: 1 }}
            >
                {QUEST_TYPE_MAPPING[questType]}
            </Typography>

            <Box sx={{ position: 'relative', height: 200, width: '100%', display: 'flex', justifyContent: 'center' }}>
                <PieChart
                    series={[
                        {
                            data,
                            innerRadius: 60,
                            paddingAngle: 1,
                            cornerRadius: 4,
                            startAngle: 90,
                            endAngle: 450,
                            cx: 100,
                            cy: 100,
                        }
                    ]}
                    height={200}
                    width={200}
                    slotProps={{
                        legend: { hidden: true },
                    }}
                    sx={{
                        '& .MuiChartsLegend-root': {
                            display: 'none'
                        }
                    }}
                >
                    <PieCenterLabel
                        primaryText={`${completedStat}%`}
                        secondaryText={`completed`}
                    />
                </PieChart>
            </Box>
        </Paper>
    )
}

export default QuestCompletionStatusStat;