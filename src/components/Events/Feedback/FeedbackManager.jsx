import { collection, doc, getDoc, onSnapshot, query, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { alpha, Box, Grid, Paper, Typography, useTheme } from '@mui/material';
import { NumbersOutlined, Assignment, InfoOutlined as InfoOutlinedIcon, SentimentDissatisfiedOutlined, SentimentVeryDissatisfiedOutlined, SentimentNeutralOutlined, SentimentSatisfiedOutlined, SentimentVerySatisfiedOutlined } from '@mui/icons-material';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

import { db } from '../../../utils/firebaseConfig';

import MetricCard from '../../General/MetricCard';
import ExcelExportButton from '../../General/ExcelExportButton';
import FeedbackListTable from './FeedbackListTable';
import LikertScaleItem from './LikertScaleItem';

const FeedbackManager = ({ eventID, eventName }) => {
  const [feedbackList, setFeedbackList] = useState([]);
  const [feedbackNumber, setFeedbackNumber] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const theme = useTheme();

  const scaleItems = [
    {
      value: 1,
      label: "Strongly Disagreed",
      icon: <SentimentVeryDissatisfiedOutlined sx={{ fontSize: 'small' }} />,
      color: theme.palette.error.main
    },
    {
      value: 2,
      label: "Disagreed",
      icon: <SentimentDissatisfiedOutlined sx={{ fontSize: 'small' }} />,
      color: theme.palette.error.light
    },
    {
      value: 3,
      label: "Neutral",
      icon: <SentimentNeutralOutlined sx={{ fontSize: 'small' }} />,
      color: theme.palette.warning.main
    },
    {
      value: 4,
      label: "Agreed",
      icon: <SentimentSatisfiedOutlined sx={{ fontSize: 'small' }} />,
      color: theme.palette.success.light
    },
    {
      value: 5,
      label: "Strongly Agreed",
      icon: <SentimentVerySatisfiedOutlined sx={{ fontSize: 'small' }} />,
      color: theme.palette.success.main
    }
  ];

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
              eventSatisfaction: data.eventFeedback,
              gamificationSatisfaction: data.gamificationFeedback,
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
              borderRadius: 2,
              width: 30,
              height: 30,
              mr: 2,
              background: `linear-gradient(135deg, ${theme.palette.primary.light}, ${theme.palette.primary.main})`,
              color: 'white',
              boxShadow: '0 4px 10px rgba(0, 0, 0, 0.15)',
            }}
          >
            <NumbersOutlined fontSize="small" />
          </Box>
          <Typography variant='h5' fontWeight="700" sx={{ lineHeight: 1.5, fontSize: "18px" }}>
            Overview
          </Typography>
        </Box>
      </Paper>

      <Grid container spacing={3}>
        <Grid>
          <MetricCard
            title="Total Participants Who Submitted"
            subtitle="Feedback Form"
            value={feedbackNumber.toLocaleString()}
            icon={<Assignment />}
            color={alpha(theme.palette.primary.main, 0.75)}
          />
        </Grid>
      </Grid>

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 2,
              width: 30,
              height: 30,
              mr: 2,
              background: `linear-gradient(135deg, ${theme.palette.primary.light}, ${theme.palette.primary.main})`,
              color: 'white',
              boxShadow: '0 4px 10px rgba(0, 0, 0, 0.15)',
            }}
          >
            <Assignment fontSize="small" />
          </Box>
          <Typography variant='h5' fontWeight="700" sx={{ lineHeight: 1.5, fontSize: "18px" }}>
            Feedback List
          </Typography>
        </Box>
        <ExcelExportButton handleExport={handleExport} />
      </Box>

      <Paper
        elevation={1}
        sx={{
          borderRadius: 3,
          overflow: 'hidden',
          mb: 4,
          border: `1px solid ${theme.palette.divider}`,
          transition: 'box-shadow 0.3s ease',
          '&:hover': {
            boxShadow: theme.shadows[2]
          }
        }}
      >
        <Box
          sx={{
            px: 3,
            py: 2,
            bgcolor: theme.palette.mode === 'dark'
              ? 'rgba(41, 98, 255, 0.1)'
              : 'rgba(41, 98, 255, 0.05)',
            borderBottom: `1px solid ${theme.palette.divider}`
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <InfoOutlinedIcon sx={{ color: theme.palette.info.main, mr: 1, fontSize: '1.5rem' }} />
            <Typography variant="h6" fontWeight="600" color="info.main" sx={{ fontSize: "1rem" }}>
              Feedback Rating Scale
            </Typography>
          </Box>

          <Box sx={{ px: 3, py: 1 }}>
            <Grid
              container
              spacing={3}
              justifyContent="space-between"
            >
              {scaleItems.map((item) => (
                <Grid item xs={6} sm={4} md={2.4} key={item.value}>
                  <LikertScaleItem {...item} />
                </Grid>
              ))}
            </Grid>
          </Box>
        </Box>
      </Paper>

      <FeedbackListTable feedbackList={feedbackList} isLoading={isLoading} />
    </Box>
  )
}

export default FeedbackManager