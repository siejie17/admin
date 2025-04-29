import React from 'react';
import {
    AccessTime as AccessTimeIcon,
    QuestionAnswer as QuestionAnswerIcon,
    People as PeopleIcon,
    Checklist as ChecklistIcon,
    Feedback as FeedbackIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    StarBorder as StarBorderIcon
} from '@mui/icons-material';
import {
    alpha,
    Box,
    Card,
    Chip,
    Divider,
    IconButton,
    Paper,
    Stack,
    Tooltip,
    Typography,
    useTheme
} from '@mui/material';

// Imported as references - use actual paths in your project
import Diamond from '../../../assets/icons/diamond.png';
import Point from '../../../assets/icons/point.png';

const QuestCard = ({ quest, onEdit = () => { }, onDelete = () => { } }) => {
    const theme = useTheme();

    const QUEST_TYPES = {
        "attendance": {
            color: theme.palette.success.main,
            lightColor: alpha(theme.palette.success.main, 0.1),
            icon: ChecklistIcon,
            label: "Attendance",
            editable: false,
            removable: false,
            compulsory: true
        },
        "earlyBird": {
            color: theme.palette.primary.main,
            lightColor: alpha(theme.palette.primary.main, 0.1),
            icon: AccessTimeIcon,
            label: "Early Bird",
            editable: true,
            removable: true,
            compulsory: false
        },
        "q&a": {
            color: theme.palette.warning.main,
            lightColor: alpha(theme.palette.warning.main, 0.1),
            icon: QuestionAnswerIcon,
            label: "Q&A",
            editable: true,
            removable: true,
            compulsory: false
        },
        "networking": {
            color: theme.palette.secondary.main,
            lightColor: alpha(theme.palette.secondary.main, 0.1),
            icon: PeopleIcon,
            label: "Networking",
            editable: true,
            removable: true,
            compulsory: false
        },
        "feedback": {
            color: theme.palette.error.main,
            lightColor: alpha(theme.palette.error.main, 0.1),
            icon: FeedbackIcon,
            label: "Feedback",
            editable: false,
            removable: false,
            compulsory: true
        }
    };

    const questTypeConfig = QUEST_TYPES[quest.questType];
    const QuestIcon = questTypeConfig.icon;

    return (
        <Card
            elevation={2}
            sx={{
                mb: 3,
                borderRadius: 2,
                overflow: 'visible',
                position: 'relative',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: theme.shadows[5],
                },
            }}
        >
            {/* Quest Type Badge */}
            <Box
                sx={{
                    position: 'absolute',
                    top: -12,
                    left: 20,
                    zIndex: 1,
                }}
            >
                <Chip
                    icon={<QuestIcon fontSize="small" />}
                    label={questTypeConfig.label}
                    size="medium"
                    sx={{
                        fontWeight: 600,
                        bgcolor: questTypeConfig.color,
                        color: '#fff',
                        px: 2.5,
                        py: 1.5,
                        boxShadow: theme.shadows[2],
                        '& .MuiChip-icon': {
                            color: '#fff',
                        },
                    }}
                />
            </Box>

            {/* Compulsory Tag */}
            {questTypeConfig.compulsory && (
                <Box
                    sx={{
                        position: 'absolute',
                        top: -8,
                        right: 16,
                        zIndex: 1,
                    }}
                >
                    <Tooltip title="Compulsory Quest">
                        <Chip
                            icon={<StarBorderIcon fontSize="small" />}
                            label="Required"
                            size="small"
                            variant="outlined"
                            sx={{
                                fontWeight: 500,
                                px: 1.5,
                                bgcolor: theme.palette.background.paper,
                                color: theme.palette.text.secondary,
                                borderColor: theme.palette.divider,
                                '& .MuiChip-icon': {
                                    color: theme.palette.warning.main,
                                },
                            }}
                        />
                    </Tooltip>
                </Box>
            )}

            {/* Card Content */}
            <Box sx={{ p: 3, pt: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Typography variant="h6" fontWeight="700" sx={{ mb: 1.5 }}>
                        {quest.questName}
                    </Typography>

                    {(questTypeConfig.editable || questTypeConfig.removable) && (
                        <Box>
                            {questTypeConfig.editable && (
                                <Tooltip title="Edit Quest">
                                    <IconButton
                                        size="small"
                                        onClick={() => onEdit(quest)}
                                        sx={{
                                            color: 'text.secondary',
                                            '&:hover': { color: theme.palette.primary.main }
                                        }}
                                    >
                                        <EditIcon fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                            )}
                            {questTypeConfig.removable && (
                                <Tooltip title="Delete Quest">
                                    <IconButton
                                        size="small"
                                        onClick={onDelete}
                                        sx={{
                                            color: 'text.secondary',
                                            '&:hover': { color: theme.palette.error.main }
                                        }}
                                    >
                                        <DeleteIcon fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                            )}
                        </Box>
                    )}
                </Box>

                <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                        mb: 2.5,
                        lineHeight: 1.6,
                        maxWidth: '95%'
                    }}
                >
                    {quest.description}
                </Typography>

                {/* Quest specific details */}
                {quest.questType === 'earlyBird' && (
                    <Paper
                        elevation={0}
                        sx={{
                            bgcolor: questTypeConfig.lightColor,
                            p: 1.5,
                            borderRadius: 1.5,
                            mb: 2.5,
                            display: 'flex',
                            alignItems: 'center',
                            border: `1px solid ${alpha(questTypeConfig.color, 0.2)}`
                        }}
                    >
                        <AccessTimeIcon fontSize="small" sx={{ mr: 1.5, color: questTypeConfig.color }} />
                        <Typography variant="body2" fontWeight="500">
                            Maximum Early Bird Attendees: <strong>{quest.maxEarlyBird}</strong>
                        </Typography>
                    </Paper>
                )}

                {quest.questType === "q&a" && quest.question && quest.correctAnswer && (
                    <Paper
                        elevation={0}
                        sx={{
                            bgcolor: questTypeConfig.lightColor,
                            borderRadius: 2,
                            p: 2,
                            mb: 2.5,
                            border: `1px solid ${alpha(questTypeConfig.color, 0.2)}`
                        }}
                    >
                        <Typography
                            variant="subtitle2"
                            fontWeight={600}
                            sx={{ mb: 1.5, color: theme.palette.text.primary }}
                        >
                            Question: {quest.question}
                        </Typography>

                        <Box sx={{
                            pl: 1.5,
                            borderLeft: `3px solid ${alpha(questTypeConfig.color, 0.5)}`,
                            py: 0.5
                        }}>
                            <Typography
                                variant="body2"
                                sx={{
                                    color: theme.palette.text.secondary,
                                    fontStyle: 'italic'
                                }}
                            >
                                Answer: {quest.correctAnswer}
                            </Typography>
                        </Box>
                    </Paper>
                )}

                {quest.questType === 'networking' && (
                    <Paper
                        elevation={0}
                        sx={{
                            bgcolor: questTypeConfig.lightColor,
                            p: 1.5,
                            borderRadius: 1.5,
                            mb: 2.5,
                            display: 'flex',
                            alignItems: 'center',
                            border: `1px solid ${alpha(questTypeConfig.color, 0.2)}`
                        }}
                    >
                        <PeopleIcon fontSize="small" sx={{ mr: 1.5, color: questTypeConfig.color }} />
                        <Typography variant="body2" fontWeight="500">
                            Connection Required to Make: <strong>{quest.completionNum}</strong>
                        </Typography>
                    </Paper>
                )}

                <Divider
                    sx={{
                        my: 2,
                        borderStyle: 'dashed'
                    }}
                />

                {/* Rewards section */}
                <Stack
                    direction="row"
                    spacing={3}
                    sx={{
                        mt: 2,
                        // justifyContent: 'center'
                    }}
                >
                    <Paper
                        elevation={0}
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            py: 1,
                            px: 2,
                            borderRadius: 2,
                            bgcolor: alpha(theme.palette.info.main, 0.05),
                            border: `1px solid ${alpha(theme.palette.info.main, 0.1)}`
                        }}
                    >
                        <img src={Diamond} style={{ height: 24, width: 24, marginRight: 8 }} alt="Diamonds" />
                        <Typography variant="body2" fontWeight="600" color="text.primary">
                            {quest.diamondsRewards} diamonds
                        </Typography>
                    </Paper>

                    <Paper
                        elevation={0}
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            py: 1,
                            px: 2,
                            borderRadius: 2,
                            bgcolor: alpha(theme.palette.success.main, 0.05),
                            border: `1px solid ${alpha(theme.palette.success.main, 0.1)}`
                        }}
                    >
                        <img src={Point} style={{ height: 24, width: 24, marginRight: 8 }} alt="Points" />
                        <Typography variant="body2" fontWeight="600" color="text.primary">
                            {quest.pointsRewards} points
                        </Typography>
                    </Paper>
                </Stack>
            </Box>
        </Card>
    );
};

export default QuestCard;