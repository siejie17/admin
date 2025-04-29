import { alpha, Box, Card, CardContent, Stack, Typography, useTheme, Link, Chip } from '@mui/material';
import React, { useEffect, useState } from 'react';
import {
    ChevronRightRounded as ChevronRightRoundedIcon,
    AccessTime as EarlyBirdIcon,
    QuestionAnswer as QAIcon,
    People as NetworkingIcon,
    Checklist as AttendanceIcon,
    Feedback as FeedbackIcon,
    SportsEsports as SportsEsportsIcon
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import CryptoJS from "crypto-js";

import Diamond from '../../../assets/icons/diamond.png';
import Point from '../../../assets/icons/point.png'

const QuestList = ({ quest, index, eventID, eventName }) => {
    const [participantsProgress, setParticipantsProgress] = useState([]);
    const [encryptedEventID, setEncryptedEventID] = useState("");
    const [encryptedQuestID, setEncryptedQuestID] = useState("");

    const theme = useTheme();

    // Quest type definitions with their respective colors and icons
    const QUEST_TYPES = {
        "attendance": {
            color: "rgba(76, 175, 80, 0.3)", // Green
            chipColor: theme.palette.success.main,
            label: "Attendance",
            icon: AttendanceIcon,
            editable: false,
            removable: false,
            compulsory: true
        },
        "earlyBird": {
            color: "rgba(33, 150, 243, 0.3)", // Blue
            chipColor: theme.palette.primary.main,
            label: "Early Bird",
            icon: EarlyBirdIcon,
            editable: true,
            removable: true,
            compulsory: false
        },
        "q&a": {
            color: "rgba(255, 152, 0, 0.3)", // Orange
            chipColor: theme.palette.warning.main,
            label: "Question & Answer",
            icon: QAIcon,
            editable: true,
            removable: true,
            compulsory: false
        },
        "networking": {
            color: "rgba(156, 39, 176, 0.3)", // Purple
            chipColor: theme.palette.secondary.main,
            label: "Networking",
            icon: NetworkingIcon,
            editable: true,
            removable: true,
            compulsory: false
        },
        "feedback": {
            color: "rgba(244, 67, 54, 0.3)", // Red
            chipColor: theme.palette.error.main,
            label: "Feedback",
            icon: FeedbackIcon,
            editable: false,
            removable: false,
            compulsory: true
        }
    };

    const questTypeConfig = QUEST_TYPES[quest.questType];
    const QuestIcon = questTypeConfig.icon;

    useEffect(() => {
        setEncryptedEventID(CryptoJS.AES.encrypt(eventID, "UniEXP_Admin").toString());
        setEncryptedQuestID(CryptoJS.AES.encrypt(quest.id, "UniEXP_Admin").toString());
    }, [quest.id, eventID]);

    return (
        <Box
            component={RouterLink}
            to={`/event/details/quest?questID=${encodeURIComponent(encryptedQuestID)}&questName=${encodeURIComponent(quest.questName)}&eventID=${encodeURIComponent(encryptedEventID)}&eventName=${encodeURIComponent(eventName)}`}
            sx={{
                textDecoration: 'none'
            }}
        >
            <Card
                sx={{
                    mb: 3,
                    borderRadius: 2,
                    borderLeft: `6px solid ${questTypeConfig.color}`,
                    boxShadow: 2,
                    overflow: 'visible',
                    position: 'relative',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                        transform: 'translateY(-1px)',
                        boxShadow: 6,
                        cursor: 'pointer'
                    }
                }}
            >
                <CardContent>
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
                            size="small"
                            sx={{
                                fontWeight: 600,
                                bgcolor: questTypeConfig.chipColor,
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
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%', pt: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, flexGrow: 1 }}>
                            <Box
                                sx={{
                                    height: '24px',
                                    width: '24px',
                                    mr: 2,
                                    borderRadius: '8px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    backgroundColor: alpha(`${questTypeConfig.color}`, 0.08),
                                    transition: 'all 0.2s ease',
                                }}
                            >
                                <Typography
                                    variant="body2"
                                    fontWeight="600"
                                    color={alpha(theme.palette.text.primary, 0.9)}
                                    fontSize="0.75rem"
                                >
                                    {index}
                                </Typography>
                            </Box>
                            <Typography variant="h6" fontWeight="600" fontSize="0.85rem">
                                {quest.questName}
                            </Typography>
                        </Box>
                        <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            alignSelf: 'center',
                            height: '30px',
                            width: '30px',
                            borderRadius: '50%',
                            backgroundColor: alpha(theme.palette.text.primary, 0.1),
                        }}>
                            <ChevronRightRoundedIcon sx={{ height: 20, width: 20, color: alpha(theme.palette.text.primary, 0.5) }} />
                        </Box>
                    </Box>
                    <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <img src={Diamond} style={{ height: 18, width: 18, marginRight: 6 }} />
                            <Typography variant="body2" fontWeight="bold" fontSize="0.85rem">
                                {quest.diamondsRewards} diamonds
                            </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <img src={Point} style={{ height: 18, width: 18, marginRight: 6 }} />
                            <Typography variant="body2" fontWeight="bold" fontSize="0.85rem">
                                {quest.pointsRewards} leaderboard points
                            </Typography>
                        </Box>
                    </Stack>
                </CardContent>
            </Card>
        </Box>
    )
}

export default QuestList;