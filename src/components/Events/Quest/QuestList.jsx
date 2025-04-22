import { alpha, Box, Card, CardContent, Stack, Typography, useTheme, Link } from '@mui/material';
import React, { useEffect, useState } from 'react';
import {
    ChevronRightRounded as ChevronRightRoundedIcon,
    AccessTime as EarlyBirdIcon,
    QuestionAnswer as QAIcon,
    People as NetworkingIcon,
    Checklist as AttendanceIcon,
    Feedback as FeedbackIcon,
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import CryptoJS from "crypto-js";

import Diamond from '../../../assets/icons/diamond.png';
import Point from '../../../assets/icons/point.png'

// Quest type definitions with their respective colors and icons
const QUEST_TYPES = {
    "attendance": {
        color: "rgba(76, 175, 80, 0.3)", // Green
        icon: AttendanceIcon,
        editable: false,
        removable: false,
        compulsory: true
    },
    "earlyBird": {
        color: "rgba(33, 150, 243, 0.3)", // Blue
        icon: EarlyBirdIcon,
        editable: true,
        removable: true,
        compulsory: false
    },
    "q&a": {
        color: "rgba(255, 152, 0, 0.3)", // Orange
        icon: QAIcon,
        editable: true,
        removable: true,
        compulsory: false
    },
    "networking": {
        color: "rgba(156, 39, 176, 0.3)", // Purple
        icon: NetworkingIcon,
        editable: true,
        removable: true,
        compulsory: false
    },
    "feedback": {
        color: "rgba(244, 67, 54, 0.3)", // Red
        icon: FeedbackIcon,
        editable: false,
        removable: false,
        compulsory: true
    }
};

const QuestList = ({ quest, index, eventID, eventName }) => {
    const [participantsProgress, setParticipantsProgress] = useState([]);
    const [encryptedEventID, setEncryptedEventID] = useState("");
    const [encryptedQuestID, setEncryptedQuestID] = useState("");

    const theme = useTheme();

    const questTypeConfig = QUEST_TYPES[quest.questType];

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
                    mb: 2,
                    borderRadius: 2,
                    borderLeft: `6px solid ${questTypeConfig.color}`,
                    boxShadow: 2,
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                        transform: 'translateY(-1px)',
                        boxShadow: 6,
                        cursor: 'pointer'
                    }
                }}
            >
                <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, flexGrow: 1 }}>
                            <Box
                                sx={{
                                    height: '32px',
                                    width: '32px',
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
                                    fontWeight="700"
                                    color={alpha(theme.palette.text.primary, 0.9)}
                                    fontSize="0.8rem"
                                >
                                    {index}
                                </Typography>
                            </Box>
                            <Typography variant="h6" fontWeight="600">
                                {quest.questName}
                            </Typography>
                        </Box>
                        <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            alignSelf: 'center',
                            height: '40px',
                            width: '40px',
                            borderRadius: '50%',
                            backgroundColor: alpha(theme.palette.text.primary, 0.1),
                        }}>
                            <ChevronRightRoundedIcon sx={{ height: 28, width: 28, color: alpha(theme.palette.text.primary, 0.5) }} />
                        </Box>
                    </Box>
                    <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <img src={Diamond} style={{ height: 24, width: 24, marginRight: 6 }} />
                            <Typography variant="body2" fontWeight="bold">
                                {quest.diamondsRewards} diamonds
                            </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <img src={Point} style={{ height: 24, width: 24, marginRight: 6 }} />
                            <Typography variant="body2" fontWeight="bold">
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