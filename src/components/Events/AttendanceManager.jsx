import { collection, doc, getDoc, onSnapshot, query, where } from 'firebase/firestore';
import { CheckBox as CheckBoxIcon, Dangerous as DangerousIcon, NumbersOutlined as NumbersOutlinedIcon, EmojiPeople as EmojiPeopleIcon } from '@mui/icons-material';
import React, { useEffect, useState } from 'react';
import { db } from '../../utils/firebaseConfig';
import { alpha, Box, Grid, Paper, Tab, Tabs, Typography, useTheme } from '@mui/material';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

import MetricCard from '../General/MetricCard';
import ExcelExportButton from '../General/ExcelExportButton';
import AttendanceListTable from './Attendance/AttendanceListTable';

const AttendanceManager = ({ eventID }) => {
    const [attendees, setAttendees] = useState([]);
    const [attendeeSize, setAttendeeSize] = useState(0);
    const [absentees, setAbsentees] = useState([]);
    const [absenteeSize, setAbsenteeSize] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    const [activeTab, setActiveTab] = useState(0);

    const theme = useTheme();

    const FACULTY_MAPPING = {
        1: "FACA",
        2: "FBE",
        3: "FCSHD",
        4: "FCSIT",
        5: "FEB",
        6: "FELC",
        7: "FENG",
        8: "FMSH",
        9: "FRST",
        10: "FSSH",
    };

    useEffect(() => {
        let unsubscribe;

        setIsLoading(true);

        fetchParticipantsAttendanceInfo().then(
            result => unsubscribe = result
        ).catch(
            err => console.log("Something went wrong when setup real time listener:", err)
        );

        setIsLoading(false);

        return () => unsubscribe;
    }, [eventID]);

    const fetchParticipantsAttendanceInfo = async () => {
        try {
            const attendanceQuery = query(collection(db, "registration"), where("eventID", "==", eventID));

            const unsubscribeAttendance = onSnapshot(attendanceQuery, async (attendance) => {
                let attendees = [];
                let absentees = [];

                for (const attendanceDoc of attendance.docs) {
                    const attendanceData = attendanceDoc.data();
                    const studentID = attendanceData.studentID;

                    try {
                        const studentDoc = await getDoc(doc(db, "user", studentID));

                        if (studentDoc.exists()) {
                            const studentData = studentDoc.data();

                            const attendanceData = {
                                id: attendanceDoc.id,
                                studentID: attendanceDoc.data().studentID,
                                fullName: studentData.firstName + " " + studentData.lastName,
                                email: studentData.email,
                                facultyID: studentData.facultyID,
                                yearOfStudy: studentData.yearOfStudy,
                                profilePicture: studentData.profilePicture,
                                isAttended: attendanceDoc.data().isAttended
                            };

                            if (attendanceData.isAttended) {
                                attendees.push(attendanceData);
                            } else {
                                absentees.push(attendanceData);
                            }
                        }
                    } catch (err) {
                        console.error("Error fetching user data (name and profile picture):", err);
                    }
                }

                setAttendeeSize(attendees.length);
                setAbsenteeSize(absentees.length);

                if (attendees && attendees.length > 0) {
                    const attendeesWithBil = attendees.map((attendee, index) => ({
                        ...attendee,
                        bil: index + 1
                    }));

                    setAttendees(attendeesWithBil);
                } else {
                    setAttendees([]);
                }

                if (absentees && absentees.length > 0) {
                    const absenteesWithBil = absentees.map((absentee, index) => ({
                        ...absentee,
                        bil: index + 1
                    }));

                    setAbsentees(absenteesWithBil);
                } else {
                    setAbsentees([]);
                }
            })

            return unsubscribeAttendance;
        } catch (err) {
            console.log("Something went wrong when fetching attendance info for this event:", err)
        }
    }

    const handleExcelExport = () => {
        const formattedData = attendees.map((attendee, index) => ({
            "No": index + 1,
            "Name": attendee.fullName,
            "Email": attendee.email,
            "Year of Study": attendee.yearOfStudy,
            "Faculty": FACULTY_MAPPING[attendee.facultyID],
        }));

        const worksheet = XLSX.utils.json_to_sheet(formattedData);
        const workbook = XLSX.utils.book_new();

        worksheet['!cols'] = [
            { wch: 5 },  // No
            { wch: 50 }, // Name
            { wch: 30 }, // Email
            { wch: 15 }, // Matric
            { wch: 20 }, // Faculty
        ];

        XLSX.utils.book_append_sheet(workbook, worksheet, 'Attendees');

        const excelBuffer = XLSX.write(workbook, {
            bookType: 'xlsx',
            type: 'array',
        });

        const data = new Blob([excelBuffer], {
            type: 'application/octet-stream',
        });

        saveAs(data, `Attendees.xlsx`);
    }

    return (
        <Box sx={{ px: 1, py: 2.5 }}>
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
                            mr: 3,
                            background: `linear-gradient(135deg, ${theme.palette.primary.light}, ${theme.palette.primary.main})`,
                            color: 'white',
                        }}
                    >
                        <NumbersOutlinedIcon />
                    </Box>
                    <Typography variant='h5' fontWeight="700" sx={{ lineHeight: 1.5 }}>
                        Overview
                    </Typography>
                </Box>
            </Paper>

            <Grid container spacing={3}>
                <Grid item>
                    <MetricCard
                        title="Total Attendees"
                        value={attendeeSize.toLocaleString()}
                        icon={<CheckBoxIcon />}
                        color={theme.palette.primary.main}
                    />
                </Grid>

                <Grid item>
                    <MetricCard
                        title="Total Absentees"
                        value={absenteeSize.toLocaleString()}
                        icon={<DangerousIcon />}
                        color={theme.palette.primary.main}
                    />
                </Grid>
            </Grid>

            <Box sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                mt: 5
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: 1.5,
                            width: 40,
                            height: 40,
                            mr: 3,
                            background: `linear-gradient(135deg, ${theme.palette.primary.light}, ${theme.palette.primary.main})`,
                            color: 'white',
                        }}
                    >
                        <EmojiPeopleIcon />
                    </Box>
                    <Typography variant='h5' fontWeight="700" sx={{ lineHeight: 1.1 }}>
                        Attendees/Absentees List
                    </Typography>
                </Box>

                {activeTab === 0 && <ExcelExportButton handleExport={handleExcelExport} />}
            </Box>

            <Box sx={{ mt: 3 }}>
                <Tabs
                    value={activeTab}
                    onChange={(event, changedTab) => setActiveTab(changedTab)}
                    variant='standard'
                    aria-label="attendance-list-tabs"
                    sx={{
                        minHeight: '48px',
                        position: 'relative',
                        '& .MuiTabs-flexContainer': {
                            gap: 2,
                        },
                        '& .MuiTabs-indicator': {
                            display: 'none',
                        },
                        '& .MuiButtonBase-root': {
                            minHeight: '48px',
                            py: 1,
                            px: 3,
                            borderRadius: '12px',
                            transition: 'all 0.2s ease-in-out',
                        }
                    }}
                >
                    <Tab
                        label="Attendees"
                        sx={{
                            textTransform: 'none',
                            fontWeight: 500,
                            fontSize: '0.95rem',
                            color: 'text.secondary',
                            backgroundColor: (theme) =>
                                activeTab === 0
                                    ? alpha(theme.palette.primary.main, 0.08)
                                    : 'transparent',
                            border: (theme) =>
                                activeTab === 0
                                    ? `1px solid ${alpha(theme.palette.primary.main, 0.3)}`
                                    : `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                            minWidth: '140px',
                            boxShadow: (theme) =>
                                activeTab === 0
                                    ? `0 4px 12px ${alpha(theme.palette.primary.main, 0.12)}`
                                    : 'none',
                            '&.Mui-selected': {
                                color: 'primary.main',
                                fontWeight: 600,
                            },
                            '&:hover': {
                                backgroundColor: (theme) =>
                                    activeTab === 0
                                        ? alpha(theme.palette.primary.main, 0.12)
                                        : alpha(theme.palette.background.default, 0.6),
                            }
                        }}
                    />
                    <Tab
                        label="Absentees"
                        sx={{
                            textTransform: 'none',
                            fontWeight: 500,
                            fontSize: '0.95rem',
                            color: 'text.secondary',
                            backgroundColor: (theme) =>
                                activeTab === 1
                                    ? alpha(theme.palette.primary.main, 0.08)
                                    : 'transparent',
                            border: (theme) =>
                                activeTab === 1
                                    ? `1px solid ${alpha(theme.palette.primary.main, 0.3)}`
                                    : `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                            minWidth: '140px',
                            boxShadow: (theme) =>
                                activeTab === 1
                                    ? `0 4px 12px ${alpha(theme.palette.primary.main, 0.12)}`
                                    : 'none',
                            '&.Mui-selected': {
                                color: 'primary.main',
                                fontWeight: 600,
                            },
                            '&:hover': {
                                backgroundColor: (theme) =>
                                    activeTab === 1
                                        ? alpha(theme.palette.primary.main, 0.12)
                                        : alpha(theme.palette.background.default, 0.6),
                            }
                        }}
                    />
                </Tabs>
            </Box>

            <Box
                role="tabpanel"
                hidden={activeTab !== 0}
                id={'attendance-tabpanel-0'}
                aria-labelledby={'attendance-tab-0'}
                sx={{ py: 3, maxHeight: '100%' }}
            >
                {activeTab === 0 && <AttendanceListTable participants={attendees} isLoading={isLoading} />}
            </Box>

            <Box
                role="tabpanel"
                hidden={activeTab !== 1}
                id={'attendance-tabpanel-1'}
                aria-labelledby={'attendance-tab-1'}
                sx={{ py: 3, maxHeight: '100%' }}
            >
                {activeTab === 1 && <AttendanceListTable participants={absentees} eventID={eventID} isLoading={isLoading} />}
            </Box>
        </Box>
    )
}

export default AttendanceManager