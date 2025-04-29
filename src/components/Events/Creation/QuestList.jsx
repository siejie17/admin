import React, { useState } from 'react';
import { Box } from '@mui/material';

import QuestEditForm from './QuestEditForm';
import QuestCard from './QuestCard';
import SnackbarComponent from '../../General/SnackbarComponent';

const QuestList = ({
    attendanceQuest,
    earlyBirdQuest,
    setEarlyBirdQuest,
    questionAnswerQuest,
    setQuestionAnswerQuest,
    networkingQuest,
    setNetworkingQuest,
    feedbackQuest
}) => {
    const [editFormOpen, setEditFormOpen] = useState(false);
    const [currentEditQuest, setCurrentEditQuest] = useState(null);
    const [currentEditQuestIndex, setCurrentEditQuestIndex] = useState(null);

    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarContent, setSnackbarContent] = useState({ msg: '', type: '' });

    const handleEditQuest = (quest, index = '') => {
        setCurrentEditQuest(quest);

        if (!index) setCurrentEditQuestIndex(index);

        setEditFormOpen(true);
    };

    const handleDeleteQuest = (questType, index = '') => {
        if (questType === "q&a") {
            const updatedQuests = [...questionAnswerQuest];
            updatedQuests.splice(index, 1);
            setQuestionAnswerQuest(updatedQuests);
        } else if (questType === "networking") {
            setNetworkingQuest({});
        } else if (questType === "earlyBird") {
            setEarlyBirdQuest({});
        } else {
            console.error("Invalid quest deletion.");
        }
    };

    const handleSaveQuestEdit = (updatedQuest) => {
        switch (currentEditQuest.questType) {
            case "earlyBird":
                setEarlyBirdQuest(updatedQuest);
                break;
            case "q&a":
                const updatedQuests = [...questionAnswerQuest];
                updatedQuests[currentEditQuestIndex] = updatedQuest;
                setQuestionAnswerQuest(updatedQuests);
                break;
            case "networking":
                setNetworkingQuest(updatedQuest);
                break;
            default:
                console.warn(`Unhandled quest type: ${currentEditQuest.questType}`);
                return;
        }

        setSnackbarOpen(true);
        setSnackbarContent({ msg: 'The selected quest is edited successfully!', type: 'success' });
    }

    return (
        <Box sx={{ pb: 3 }}>
            {/* Attendance Quest */}
            <QuestCard quest={attendanceQuest} />

            {/* Early Bird Quest */}
            {Object.keys(earlyBirdQuest).length > 0 && (
                <QuestCard
                    quest={earlyBirdQuest}
                    onEdit={() => handleEditQuest(earlyBirdQuest)}
                    onDelete={() => handleDeleteQuest(earlyBirdQuest.questType)}
                />
            )}

            {/* Question and Answer Quest(s) */}
            {questionAnswerQuest.map((quest, index) => (
                <QuestCard
                    key={`qa-${index}`}
                    quest={quest}
                    onEdit={() => handleEditQuest(quest, index)}
                    onDelete={() => handleDeleteQuest(quest.questType, index)}
                />
            ))}

            {/* Networking Quest */}
            {Object.keys(networkingQuest).length > 0 && (
                <QuestCard
                    quest={networkingQuest}
                    onEdit={() => handleEditQuest(networkingQuest)}
                    onDelete={() => handleDeleteQuest(networkingQuest.questType)}
                />
            )}

            {/* Feedback Driven Quest */}
            <QuestCard quest={feedbackQuest} />

            {/* Edit form modal */}
            <QuestEditForm
                open={editFormOpen}
                onClose={() => setEditFormOpen(false)}
                quest={currentEditQuest}
                questIndex={currentEditQuestIndex}
                onSave={handleSaveQuestEdit}
            />

            <SnackbarComponent snackbarOpen={snackbarOpen} snackbarContent={snackbarContent} setSnackbarOpen={setSnackbarOpen} />
        </Box>
    )
}

export default QuestList;