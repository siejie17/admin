import React, { useEffect, useState } from 'react';

import { db } from '../../utils/firebaseConfig';
import { collection, query, where, orderBy, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { alpha, Box, Paper, Tab, Tabs, Typography, useTheme } from '@mui/material';
import { Redeem as RedeemIcon } from '@mui/icons-material';
import RedemptionListTable from './RedemptionListTable';

const RedemptionTabs = ({ merchandiseID }) => {
    const theme = useTheme();

    const [merchandiseCategory, setMerchandiseCategory] = useState('');
    const [collectedRedemptionList, setCollectedRedemptionList] = useState([]);
    const [uncollectedRedemptionList, setUncollectedRedemptionList] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const [activeTab, setActiveTab] = useState(0);

    useEffect(() => {
        let unsub = () => { };

        fetchRedemptions()
            .then(result => {
                unsub = result;
            })
            .catch(error => {
                console.error("Error in listener setup:", error);
                setIsLoading(false);
            });

        return () => unsub();
    }, []);

    const fetchRedemptions = async () => {
        setIsLoading(true);
        try {
            const merchandiseCategoryRef = doc(db, "merchandise", merchandiseID);
            const merchandiseCategorySnap = await getDoc(merchandiseCategoryRef);

            if (merchandiseCategorySnap.exists()) {
                setMerchandiseCategory(merchandiseCategorySnap.data().category);
            } else {
                console.error("No such merchandise exists");
                setMerchandiseCategory('');
            }

            const redemptionQuery = query(
                collection(db, "redemption"),
                where("merchandiseID", "==", merchandiseID),
            );

            const unsubscribeRedemption = onSnapshot(redemptionQuery, async (redemptionSnapshots) => {
                const redemptionData = redemptionSnapshots.docs.map((redemption, index) => ({
                    bil: index + 1,
                    id: redemption.id,
                    ...redemption.data(),
                }));

                const collectedList = [];
                const uncollectedList = [];

                await Promise.all(
                    redemptionData.map(async (redemption) => {
                        const studentData = await fetchStudentData(redemption.studentID);

                        const enrichedRedemption = {
                            ...redemption,
                            studentName: `${studentData?.firstName ?? ''} ${studentData?.lastName ?? ''}`.trim(),
                            profilePicture: studentData?.profilePicture || ''
                        };

                        // Split directly while building
                        if (enrichedRedemption.collected) {
                            collectedList.push(enrichedRedemption);
                        } else {
                            uncollectedList.push(enrichedRedemption);
                        }

                        return enrichedRedemption;
                    })
                );

                setCollectedRedemptionList(collectedList);
                setUncollectedRedemptionList(uncollectedList);
                setIsLoading(false);
            });

            return unsubscribeRedemption;
        } catch (error) {
            console.error("Error when fetching redemption list:", error);
            setIsLoading(false);
            return () => { }; // fallback cleanup
        }
    };

    const fetchStudentData = async (studentID) => {
        const studentRef = doc(db, "user", studentID);

        const studentSnap = await getDoc(studentRef);
        if (studentSnap.exists()) {
            return studentSnap.data(); // Assuming studentID is unique
        }
        return {}; // Return empty object if no student found
    };

    return (
        <Box sx={{ px: 1, py: 2.5 }}>
            <Paper
                elevation={0}
                sx={{
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
                        <RedeemIcon fontSize="small" />
                    </Box>
                    <Typography variant='h5' fontWeight="700" sx={{ lineHeight: 1.5, fontSize: "18px" }}>
                        Redemption List
                    </Typography>
                </Box>
            </Paper>
            <Box sx={{ pb: 2 }}>
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
                        label="Uncollect"
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
                        label="Collected"
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
                id={'redemption-tabpanel-0'}
                aria-labelledby={'redemption-tab-0'}
                sx={{ maxHeight: '100%' }}
            >
                {activeTab === 0 && <RedemptionListTable redemptionList={uncollectedRedemptionList} merchandiseCategory={merchandiseCategory} activeTab={activeTab} isLoading={isLoading} />}
            </Box>

            <Box
                role="tabpanel"
                hidden={activeTab !== 1}
                id={'redemption-tabpanel-1'}
                aria-labelledby={'redemption-tab-1'}
                sx={{ maxHeight: '100%' }}
            >
                {activeTab === 1 && <RedemptionListTable redemptionList={collectedRedemptionList} merchandiseCategory={merchandiseCategory} activeTab={activeTab} isLoading={isLoading} />}
            </Box>
        </Box>
    )
}

export default RedemptionTabs;