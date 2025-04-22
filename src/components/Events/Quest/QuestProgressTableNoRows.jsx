import { SearchOffOutlined as SearchOffOutlinedIcon, EmojiEventsOutlined as EmojiEventsOutlinedIcon } from '@mui/icons-material';
import { alpha, Box, Typography } from '@mui/material'
import React from 'react'

const QuestProgressTableNoRows = ({ activeTab }) => {
    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                width: '100%',
                padding: 3,
                borderRadius: '12px',
                backdropFilter: 'blur(8px)',
                backgroundColor: (theme) => alpha(theme.palette.background.paper, 0.6),
            }}
        >
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.08),
                    marginBottom: 2,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                        transform: 'scale(1.05)',
                        backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.12),
                    }
                }}
            >
                {activeTab === 0 ? (
                    <SearchOffOutlinedIcon
                        sx={{
                            fontSize: '2.5rem',
                            color: (theme) => alpha(theme.palette.primary.main, 0.8)
                        }}
                    />
                ) : (
                    <EmojiEventsOutlinedIcon
                        sx={{
                            fontSize: '2.5rem',
                            color: (theme) => alpha(theme.palette.success.main, 0.8)
                        }}
                    />
                )}
            </Box>

            <Typography
                variant="h6"
                sx={{
                    fontWeight: 600,
                    color: (theme) => theme.palette.text.primary,
                    mb: 1
                }}
            >
                {activeTab === 0 ? 'No Progress Yet' : 'All Quests Completed!'}
            </Typography>

            <Typography
                variant="body2"
                sx={{
                    color: (theme) => alpha(theme.palette.text.secondary, 0.8),
                    textAlign: 'center',
                    maxWidth: '280px',
                    lineHeight: 1.6
                }}
            >
                {activeTab === 0
                    ? 'No one has started this quest yet. Be the first to embark on this journey!'
                    : 'Everyone has successfully completed this quest. Great teamwork!'}
            </Typography>
        </Box>
    )
}

export default QuestProgressTableNoRows;