import React, { useState } from 'react';
import { Alert, alpha, Box, Card, CardContent, Divider, IconButton, Snackbar, Stack, Typography } from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  AccessTime as EarlyBirdIcon,
  QuestionAnswer as QAIcon,
  People as NetworkingIcon,
  Checklist as AttendanceIcon,
  Feedback as FeedbackIcon,
} from '@mui/icons-material';

import Diamond from '../../assets/icons/diamond.png';
import Point from '../../assets/icons/point.png'
import QuestEditForm from './QuestEditForm';

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

const QuestCardReviewList = ({
  attendanceQuest,
  earlyBirdQuest, setEarlyBirdQuest,
  questionAnswerQuest, setQuestionAnswerQuest,
  networkingQuest, setNetworkingQuest,
  feedbackQuest
}) => {
  const [editFormOpen, setEditFormOpen] = useState(false);
  const [currentEditQuest, setCurrentEditQuest] = useState(null);
  const [currentEditQuestIndex, setCurrentEditQuestIndex] = useState(null);
  const [editSuccessOpen, setEditSuccessOpen] = useState(false);

  const handleEditSuccessClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setEditSuccessOpen(false);
  };

  const QuestCard = ({ quest, onEdit = () => { }, onDelete = () => { } }) => {
    const questTypeConfig = QUEST_TYPES[quest.questType];
    const QuestIcon = questTypeConfig.icon;

    return (
      <Card
        sx={{
          mb: 2,
          borderLeft: `6px solid ${questTypeConfig.color}`,
          boxShadow: 3,
          transition: 'transform 0.2s, box-shadow 0.2s',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: 6,
          }
        }}
      >
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <QuestIcon sx={{ color: "#a9a9a9", mr: 1 }} />
              <Typography variant="h6" fontWeight="600">
                {quest.questName}
              </Typography>
            </Box>

            {(questTypeConfig.editable || questTypeConfig.removable) && (
              <Box>
                {questTypeConfig.editable && (
                  <IconButton size="small" onClick={() => onEdit(quest)} sx={{ color: 'text.secondary' }}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                )}
                {questTypeConfig.removable && (
                  <IconButton size="small" onClick={onDelete} sx={{ color: 'text.secondary' }}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                )}
              </Box>
            )}
          </Box>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {quest.description}
          </Typography>

          {/* Quest specific details */}
          {quest.questType === 'earlyBird' && (
            <Box sx={{
              bgcolor: alpha(questTypeConfig.color, 0.1),
              p: 1,
              borderRadius: 1,
              mb: 2,
              display: 'flex',
              alignItems: 'center'
            }}>
              <EarlyBirdIcon fontSize="small" sx={{ mr: 1 }} />
              <Typography variant="body2" fontWeight="500">
                Maximum Early Bird Attendees: {quest.maxEarlyBird} attendees
              </Typography>
            </Box>
          )}

          {quest.questType === "q&a" && quest.question && quest.correctAnswer && (
            <Box
              sx={{
                bgcolor: alpha(questTypeConfig.color, 0.08),
                borderRadius: 2,
                p: 2,
                mb: 3,
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
              }}
            >
              <Box sx={{ pl: 0.5 }}>
                <Typography
                  variant="body2"
                  fontWeight="600"
                  sx={{ mb: 1 }}
                >
                  Question: {quest.question}
                </Typography>

                <Typography
                  variant="body2"
                  sx={{
                    color: 'text.secondary',
                    pl: 1,
                    borderLeft: '2px solid',
                    borderColor: 'divider'
                  }}
                >
                  Answer: {quest.correctAnswer}
                </Typography>
              </Box>
            </Box>
          )}

          <Divider sx={{ my: 1 }} />

          {/* Rewards section */}
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
    )
  }

  const handleEditQuest = (quest, index) => {
    setCurrentEditQuest(quest);
    setCurrentEditQuestIndex(index);
    setEditFormOpen(true);
  };

  const handleDeleteQuest = (questType, index) => {
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

    setEditSuccessOpen(true);
  }

  return (
    <Box sx={{ pt: 2, pb: "250px" }}>
      {/* Always rendered quests */}
      <QuestCard quest={attendanceQuest} />

      {/* Conditionally rendered quests with shared rendering logic */}
      {Object.keys(earlyBirdQuest).length > 0 && (
        <QuestCard
          quest={earlyBirdQuest}
          onEdit={() => handleEditQuest(earlyBirdQuest)}
          onDelete={() => handleDeleteQuest(earlyBirdQuest.questType)}
        />
      )}

      {/* Map through question-answer quests */}
      {questionAnswerQuest.map((quest, index) => (
        <QuestCard
          key={`qa-${index}`}
          quest={quest}
          onEdit={() => handleEditQuest(quest, index)}
          onDelete={() => handleDeleteQuest(quest.questType, index)}
        />
      ))}

      {/* Networking quest */}
      {Object.keys(networkingQuest).length > 0 && (
        <QuestCard
          quest={networkingQuest}
          onEdit={() => handleEditQuest(networkingQuest)}
          onDelete={() => handleDeleteQuest(networkingQuest.questType)}
        />
      )}

      {/* Always rendered feedback quest */}
      <QuestCard quest={feedbackQuest} />

      {/* Edit form modal */}
      {editFormOpen && (
        <QuestEditForm
          open={editFormOpen}
          onClose={() => setEditFormOpen(false)}
          quest={currentEditQuest}
          questIndex={currentEditQuestIndex}
          onSave={handleSaveQuestEdit}
        />
      )}

      {/* Success notification */}
      <Snackbar
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        open={editSuccessOpen}
        autoHideDuration={4000}
        onClose={handleEditSuccessClose}
      >
        <Alert severity="success" variant="filled" sx={{ width: '100%' }}>
          Quest edited successfully!
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default QuestCardReviewList