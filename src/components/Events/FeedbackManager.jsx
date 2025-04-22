import { collection, doc, getDoc, onSnapshot, query, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { Box, Grid, Paper, Typography, useTheme } from '@mui/material';
import { NumbersOutlined, Assignment } from '@mui/icons-material';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

import { db } from '../../utils/firebaseConfig';

import MetricCard from '../General/MetricCard';
import ExcelExportButton from '../General/ExcelExportButton';
import FeedbackListTable from './Feedback/FeedbackListTable';

const FeedbackManager = ({ eventID, eventName }) => {
  const [feedbackList, setFeedbackList] = useState([]);
  const [feedbackNumber, setFeedbackNumber] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const theme = useTheme();

  const LIKERT_SCALE = {
    "1": "Strongly Disagreed",
    "2": "Disagreed",
    "3": "Neutral",
    "4": "Agreed",
    "5": "Strongly Agreed"
  };

  useEffect(() => {
    let unsubscribe;

    fetchFeedbackList().then(
      result => {
        unsubscribe = result;
      }
    ).catch(
      error => {
        console.error(error);
      }
    );

    return unsubscribe;
  }, [eventID]);

  const fetchFeedbackList = async () => {
    setIsLoading(true);
    try {
      const feedbackQuery = query(collection(db, "feedback"), where("eventID", "==", eventID));

      const unsubscribeFeedback = onSnapshot(feedbackQuery, async (snap) => {
        let feedback = [];

        for (const docSnap of snap.docs) {
          const data = docSnap.data();
          const registrationID = data.registrationID;

          try {
            const registrationDoc = await getDoc(doc(db, "registration", registrationID));
            const studentID = registrationDoc.data().studentID;

            const studentDoc = await getDoc(doc(db, "user", studentID));
            const studentData = studentDoc.data();

            const participantFeedback = {
              id: docSnap.id,
              participantName: studentData.firstName + " " + studentData.lastName,
              profilePicture: studentData.profilePicture,
              eventSatisfaction: LIKERT_SCALE[data.eventFeedback],
              gamificationSatisfaction: LIKERT_SCALE[data.gamificationFeedback],
              improvement: data.overallImprovement
            }

            feedback.push(participantFeedback);
          } catch (error) {
            console.error("Error fetching registration and user data:", error);
          }
        }

        if (feedback && feedback.length > 0) {
          const feedbackDataWithID = feedback.map((feedback, index) => ({
            bil: index + 1,
            ...feedback,
          }));

          console.log(feedbackDataWithID);
          setFeedbackList(feedbackDataWithID);
        } else {
          setFeedbackList([]);
        }

        setFeedbackNumber(feedback.length);
      });

      setIsLoading(false);

      return unsubscribeFeedback;
    } catch (error) {
      console.error("Error fetching feedback data:", error);
      setIsLoading(false);
    }
  }

  const handleExport = () => {
    const formattedFeedbackData = feedbackList.map((feedback, index) => ({
      "No": index + 1,
      "Participant Name": feedback.participantName,
      "Event Satisfaction": feedback.eventSatisfaction,
      "Gamification Satisfaction": feedback.gamificationSatisfaction,
      "Overall Improvement": feedback.improvement
    }));

    const worksheet = XLSX.utils.json_to_sheet(formattedFeedbackData);
    const workbook = XLSX.utils.book_new();

    worksheet['!cols'] = [
      { wch: 5 },  // No
      { wch: 50 }, // Name
      { wch: 25 }, // Event Feedback
      { wch: 25 }, // Gamification Feedback
      { wch: 50 }, // Overall Improvement
    ];

    Object.keys(worksheet).forEach((key) => {
      if (key[0] === '!') return;
      worksheet[key].s = {
        alignment: {
          wrapText: true,
          vertical: 'top',
        }
      }
    });

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Feedback');

    const excelBuffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    });

    const data = new Blob([excelBuffer], {
      type: 'application/octet-stream',
    });

    saveAs(data, `${eventName}_Feedback.xlsx`);
  }

  return (
    <Box sx={{ px: 1, py: 2 }}>
      <Paper
        elevation={0}
        sx={{
          pb: 2,
          mb: 2,
          borderRadius: 2,
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 1.5,
              width: 40,
              height: 40,
              mr: 2,
              background: `linear-gradient(135deg, ${theme.palette.primary.light}, ${theme.palette.primary.main})`,
              color: 'white',
            }}
          >
            <NumbersOutlined />
          </Box>
          <Typography variant='h5' fontWeight="700" sx={{ lineHeight: 1.1 }}>
            Overview
          </Typography>
        </Box>
      </Paper>

      <Grid container spacing={3}>
        <Grid>
          <MetricCard
            title="Total Participants Submitted"
            value={feedbackNumber.toLocaleString()}
            icon={<Assignment />}
            color={theme.palette.primary.main}
          />
        </Grid>
      </Grid>

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', my: 5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 1.5,
              width: 40,
              height: 40,
              mr: 2,
              background: `linear-gradient(135deg, ${theme.palette.primary.light}, ${theme.palette.primary.main})`,
              color: 'white',
            }}
          >
            <Assignment />
          </Box>
          <Typography variant='h5' fontWeight="700" sx={{ lineHeight: 1.1 }}>
            Feedback List
          </Typography>
        </Box>
        <ExcelExportButton handleExport={handleExport} />
      </Box>

      <FeedbackListTable feedbackList={feedbackList} isLoading={isLoading} />
    </Box>
  )
}

export default FeedbackManager