import { collection, doc, getDoc, onSnapshot, query, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react'
import { db } from '../../../utils/firebaseConfig';
import { Box, Grid, Typography, useTheme, Paper, alpha, Tabs, Tab } from '@mui/material';
import { NumbersOutlined, PeopleAlt } from '@mui/icons-material';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

import MetricCard from '../../General/MetricCard';
import ParticipantsListTable from './ParticipantsListTable';
import Loader from '../../General/Loader';
import ExcelExportButton from '../../General/ExcelExportButton';

const ParticipantManager = ({ eventID, eventName }) => {
    const [totalParticipants, setTotalParticipants] = useState(0);
    const [paymentProofRequired, setPaymentProofRequirement] = useState(false);
    const [verifiedParticipants, setVerifiedParticipants] = useState([]);
    const [unverifiedParticipants, setUnverifiedParticipants] = useState([]);
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

        const init = async () => {
            setIsLoading(true);
            try {
                const [unsubResult] = await Promise.all([
                    fetchParticipantsInfo(),
                    fetchEventPaymentRequirement()
                ]);
                unsubscribe = unsubResult;
            } catch (error) {
                console.error("Error during initial fetch:", error);
            } finally {
                setIsLoading(false);
            }
        };

        init();

        return () => {
            if (typeof unsubscribe === 'function') unsubscribe();
        };
    }, [eventID]);

    const fetchEventPaymentRequirement = async () => {
        try {
            const eventRef = doc(db, "event", eventID);
            const eventSnap = await getDoc(eventRef);
            if (eventSnap.exists()) {
                setPaymentProofRequirement(eventSnap.data().paymentProofRequired);
            }
        } catch (error) {
            console.error("Failed to fetch event payment requirement:", error);
        }
    };

    const fetchParticipantsInfo = async () => {
        try {
            const participantQuery = query(
                collection(db, "registration"),
                where("eventID", "==", eventID)
            );

            const unsubscribeParticipant = onSnapshot(participantQuery, async (snap) => {
                const enrichedDataPromises = snap.docs.map(async (docSnap) => {
                    const data = docSnap.data();
                    try {
                        const userDoc = await getDoc(doc(db, "user", data.studentID));
                        if (!userDoc.exists()) return null;

                        const userData = userDoc.data();

                        return {
                            id: docSnap.id,
                            ...data,
                            fullName: `${userData.firstName} ${userData.lastName}`,
                            email: userData.email,
                            facultyID: userData.facultyID,
                            yearOfStudy: userData.yearOfStudy,
                            profilePicture: userData.profilePicture
                        };
                    } catch (error) {
                        console.error("Error fetching user data:", error);
                        return null;
                    }
                });

                const enrichedData = (await Promise.all(enrichedDataPromises)).filter(Boolean);

                const verified = [];
                const unverified = [];

                enrichedData.forEach((item) => {
                    (item.isVerified ? verified : unverified).push(item);
                });

                const addIndex = (arr) => arr.map((item, index) => ({ ...item, bil: index + 1 }));

                setTotalParticipants(snap.size);
                setVerifiedParticipants(addIndex(verified));
                setUnverifiedParticipants(addIndex(unverified));
            });

            return unsubscribeParticipant;
        } catch (error) {
            console.error("Error fetching participants data:", error);
        }
    };

    const handleExport = () => {
        const formattedData = verifiedParticipants.map((p, index) => ({
            "No": index + 1,
            "Name": p.fullName,
            "Email": p.email,
            "Year of Study": p.yearOfStudy,
            "Faculty": FACULTY_MAPPING[p.facultyID],
        }));

        console.log(formattedData);

        const worksheet = XLSX.utils.json_to_sheet(formattedData);
        const workbook = XLSX.utils.book_new();

        worksheet['!cols'] = [
            { wch: 5 },  // No
            { wch: 50 }, // Name
            { wch: 30 }, // Email
            { wch: 15 }, // Matric
            { wch: 20 }, // Faculty
        ];

        XLSX.utils.book_append_sheet(workbook, worksheet, 'Confirmed Participants');

        const excelBuffer = XLSX.write(workbook, {
            bookType: 'xlsx',
            type: 'array',
        });

        const data = new Blob([excelBuffer], {
            type: 'application/octet-stream',
        });

        saveAs(data, `${eventName}-Participants.xlsx`);
    }

    if (isLoading) {
        return (
            <Loader loadingText='Loading participants...' />
        )
    }

    return (
        <Box
            sx={{
                px: 2,
            }}
        >
            <Paper
                elevation={0}
                sx={{
                    pb: 1.5,
                    mb: 1.5,
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

            {/* Dashboard metrics grid */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid>
                    <MetricCard
                        title="Total Number of"
                        subtitle="Registered Participants"
                        value={totalParticipants.toLocaleString()}
                        icon={<PeopleAlt />}
                        color={alpha(theme.palette.primary.main, 0.75)}
                    />
                </Grid>
            </Grid>

            {paymentProofRequired ? (
                <>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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
                                <PeopleAlt fontSize="small" />
                            </Box>
                            <Typography variant='h5' fontWeight="700" sx={{ lineHeight: 1.5, fontSize: "18px" }}>
                                Participants List
                            </Typography>
                        </Box>

                        {activeTab === 0 && verifiedParticipants.length > 0 && <ExcelExportButton handleExport={handleExport} />}
                    </Box>

                    <Box sx={{ py: 2 }}>
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
                                    minHeight: '40px',
                                    py: 1,
                                    px: 3,
                                    borderRadius: '12px',
                                    transition: 'all 0.2s ease-in-out',
                                }
                            }}
                        >
                            <Tab
                                label="Verified"
                                sx={{
                                    textTransform: 'none',
                                    fontWeight: 500,
                                    fontSize: '0.75rem',
                                    color: 'text.secondary',
                                    backgroundColor: (theme) =>
                                        activeTab === 0
                                            ? alpha(theme.palette.primary.main, 0.08)
                                            : 'transparent',
                                    border: (theme) =>
                                        activeTab === 0
                                            ? `1px solid ${alpha(theme.palette.primary.main, 0.3)}`
                                            : `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                                    minWidth: '120px',
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
                                label="Unverified"
                                sx={{
                                    textTransform: 'none',
                                    fontWeight: 500,
                                    fontSize: '0.75rem',
                                    color: 'text.secondary',
                                    backgroundColor: (theme) =>
                                        activeTab === 1
                                            ? alpha(theme.palette.primary.main, 0.08)
                                            : 'transparent',
                                    border: (theme) =>
                                        activeTab === 1
                                            ? `1px solid ${alpha(theme.palette.primary.main, 0.3)}`
                                            : `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                                    minWidth: '120px',
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
                        id={`participant-tabpanel-0`}
                        aria-labelledby={`participant-tab-0`}
                        sx={{ maxHeight: '100%' }}
                    >
                        {activeTab === 0 && <ParticipantsListTable participants={verifiedParticipants} activeTab={activeTab} isLoading={isLoading} />}
                    </Box>

                    <Box
                        role="tabpanel"
                        hidden={activeTab !== 1}
                        id={`participant-tabpanel-1`}
                        aria-labelledby={`participant-tab-1`}
                        sx={{ maxHeight: '100%' }}
                    >
                        {activeTab === 1 && <ParticipantsListTable participants={unverifiedParticipants} activeTab={activeTab} isLoading={isLoading} />}
                    </Box>
                </>
            ) : (
                <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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
                                <PeopleAlt fontSize="small" />
                            </Box>
                            <Typography variant='h5' fontWeight="700" sx={{ lineHeight: 1.1, fontSize: "16px" }}>
                                List of Confirmed Participants
                            </Typography>
                        </Box>

                        {verifiedParticipants.length > 0 && <ExcelExportButton handleExport={handleExport} />}
                    </Box>

                    <Box sx={{ mt: 2.5 }}>
                        <ParticipantsListTable participants={verifiedParticipants} activeTab={activeTab} isLoading={isLoading} />
                    </Box>
                </Box>
            )}
        </Box>
    )
}

export default ParticipantManager;