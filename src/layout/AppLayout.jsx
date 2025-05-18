import { useState, useEffect } from "react";
import {
    Box,
    Drawer,
    List,
    Typography,
    IconButton,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Fade,
    useMediaQuery,
    useTheme,
    alpha,
    Button,
    Avatar,
    Tooltip,
} from "@mui/material";
import {
    ChevronLeft as ChevronLeftIcon,
    Event as EventIcon,
    Leaderboard as LeaderboardIcon,
    ShoppingBag as MerchandiseIcon,
    ShowChart as ShowChartIcon,
    Summarize as SummarizeIcon,
    Logout as LogoutIcon,
    Menu as MenuIcon
} from "@mui/icons-material";
import { Outlet, useNavigate, useLocation } from "react-router-dom";

import Logo from '../assets/logo.png';

import { signOut } from "firebase/auth";
import { auth } from "../utils/firebaseConfig";
import { getItem, removeItem } from '../utils/localStorage';

const AppLayout = () => {
    const theme = useTheme();
    const location = useLocation();
    const navigate = useNavigate();

    const [admin, setAdmin] = useState({});
    const [isLoading, setIsLoading] = useState(true);

    // Responsive breakpoints
    const isExtraSmall = useMediaQuery('(max-width:600px)');
    const isSmall = useMediaQuery(theme.breakpoints.down('sm'));

    // Drawer states
    const [isDrawerOpen, setIsDrawerOpen] = useState(!isSmall);
    const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
    const [showFloatingMenu, setShowFloatingMenu] = useState(false);

    // Drawer width based on screen size
    const drawerWidth = isExtraSmall ? 250 : 270;

    const menuItems = [
        { text: "Statistics", path: "/statistics", icon: <ShowChartIcon /> },
        { text: "Events", path: "/event", icon: <EventIcon /> },
        { text: "Merchandises", path: "/merchandise", icon: <MerchandiseIcon /> },
        { text: "Leaderboard", path: "/leaderboard", icon: <LeaderboardIcon /> },
        { text: "Student Participation", path: "/overview", icon: <SummarizeIcon /> },
    ];

    // Control drawer visibility on screen resize
    useEffect(() => {
        setIsDrawerOpen(!isSmall);
    }, [isSmall]);

    // Show/hide floating menu button on scroll (mobile only)
    useEffect(() => {
        if (!isSmall) return;

        let lastScrollY = window.scrollY;
        const controlFloatingMenu = () => {
            if (window.scrollY < lastScrollY || window.scrollY < 100) {
                setShowFloatingMenu(true);
            } else {
                setShowFloatingMenu(false);
            }
            lastScrollY = window.scrollY;
        };

        window.addEventListener('scroll', controlFloatingMenu);
        setShowFloatingMenu(true); // Show by default

        return () => {
            window.removeEventListener('scroll', controlFloatingMenu);
        };
    }, [isSmall]);

    useEffect(() => {
        const fetchAdminProfile = async () => {
            setIsLoading(true);
            const adminData = await getItem("admin");
            const parsedAdminData = JSON.parse(adminData);
            setAdmin(parsedAdminData);
            setIsLoading(false);
        };

        fetchAdminProfile();
    }, []);

    const handleDrawerToggle = () => {
        if (isSmall) {
            setIsMobileDrawerOpen(!isMobileDrawerOpen);
        } else {
            setIsDrawerOpen(!isDrawerOpen);
        }
    };

    const handleNavigation = (path) => {
        navigate(path);
        if (isSmall) {
            setIsMobileDrawerOpen(false);
        }
    };

    const handleSignOut = async () => {
        removeItem("admin");
        await signOut(auth);
        navigate("/login");
    }

    // Drawer content component to avoid duplication
    const DrawerContent = () => (
        <>
            <Box
                sx={{
                    p: { xs: 2, sm: 3 },
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box
                        sx={{
                            width: { xs: 36, sm: 40 },
                            height: { xs: 36, sm: 40 },
                            fontWeight: 800,
                            boxShadow: theme => `0 0 0 2px ${theme.palette.background.paper}`,
                            transition: 'all 0.3s ease',
                            '&:hover': {
                                transform: 'scale(1.05)'
                            }
                        }}
                    >
                        <Box
                            component="img"
                            src={Logo}
                            alt="UniEXP Logo"
                            sx={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                            }}
                        />
                    </Box>
                    <Box>
                        <Typography
                            variant="h6"
                            sx={{
                                fontWeight: '800',
                                color: '#243861',
                                letterSpacing: '-0.5px',
                                fontSize: { xs: '1.1rem', sm: '1.25rem' }
                            }}
                        >
                            UniEXP
                        </Typography>
                        <Typography
                            variant="caption"
                            sx={{
                                color: 'text.secondary',
                                display: 'block',
                                mt: -0.3,
                                fontWeight: 500,
                                fontSize: { xs: '0.65rem', sm: '0.7rem' }
                            }}
                        >
                            Gamified Event System
                        </Typography>
                    </Box>
                </Box>

                <IconButton
                    onClick={handleDrawerToggle}
                    sx={{
                        bgcolor: theme => alpha(theme.palette.primary.main, 0.08),
                        borderRadius: '12px',
                        '&:hover': {
                            bgcolor: theme => alpha(theme.palette.primary.main, 0.15),
                        }
                    }}
                >
                    <ChevronLeftIcon fontSize="small" sx={{ color: 'primary.main' }} />
                </IconButton>
            </Box>

            {/* Navigation menu */}
            <Box
                sx={{
                    px: { xs: 2, sm: 2.5 },
                    py: 2,
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
                <Typography
                    variant="overline"
                    sx={{
                        px: 1,
                        mb: 1,
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        color: 'text.secondary',
                        letterSpacing: '0.08em',
                        opacity: 0.8,
                    }}
                >
                    Navigation
                </Typography>

                <List sx={{ p: 0.5 }}>
                    {menuItems.map((item) => {
                        const isActive = location.pathname === item.path;

                        return (
                            <ListItem key={item.text} disablePadding sx={{ mb: 0.75 }}>
                                <ListItemButton
                                    onClick={() => handleNavigation(item.path)}
                                    sx={{
                                        borderRadius: '12px',
                                        py: { xs: 1, sm: 1.25 },
                                        position: 'relative',
                                        transition: 'all 0.2s ease-in-out',
                                        overflow: 'hidden',
                                        bgcolor: isActive ?
                                            alpha('#4361ee', 0.08) :
                                            'transparent',
                                        '&:hover': {
                                            bgcolor: isActive ?
                                                alpha('#4361ee', 0.12) :
                                                alpha('#4361ee', 0.04),
                                            pl: 2.5,
                                        },
                                        '&::before': isActive ? {
                                            content: '""',
                                            position: 'absolute',
                                            left: 0,
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            width: 4,
                                            height: '60%',
                                            bgcolor: 'primary.main',
                                            borderRadius: '0 4px 4px 0',
                                        } : {},
                                    }}
                                >
                                    <ListItemIcon
                                        sx={{
                                            color: isActive ? 'primary.main' : 'text.secondary',
                                            minWidth: { xs: 32, sm: 36 },
                                            fontSize: { xs: '0.8rem', sm: '1rem' },
                                        }}
                                    >
                                        {item.icon}
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={item.text}
                                        primaryTypographyProps={{
                                            fontWeight: isActive ? 700 : 500,
                                            fontSize: { xs: '0.75rem', sm: '0.85rem' },
                                            color: isActive ? 'primary.main' : 'text.primary',
                                        }}
                                    />

                                    {isActive && (
                                        <Box
                                            sx={{
                                                width: 6,
                                                height: 6,
                                                borderRadius: '50%',
                                                bgcolor: 'primary.main',
                                                mr: 0.5,
                                            }}
                                        />
                                    )}
                                </ListItemButton>
                            </ListItem>
                        );
                    })}
                </List>
            </Box>

            <Box sx={{ flexGrow: 1 }} />

            {/* Profile Overview Section */}
            {!isLoading && (
                <Box
                    sx={{
                        p: { xs: 1, sm: 1.5 },
                        mx: { xs: 2, sm: 2.5 },
                        border: '1px solid',
                        borderRadius: '12px',
                        borderColor: theme => alpha(theme.palette.divider, 0.1),
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.25,
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar
                            src={`data:image/png;base64,${admin.profilePicture}`}
                            alt={admin.adminName}
                            sx={{
                                width: { xs: 24, sm: 30 },
                                height: { xs: 24, sm: 30 },
                            }}
                        />
                        <Box sx={{ flex: 1, overflow: 'hidden' }}>
                            <Typography
                                variant="body2"
                                sx={{
                                    fontWeight: 600,
                                    fontSize: { xs: '0.65rem', sm: '0.75rem' },
                                    color: 'text.primary',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis'
                                }}
                            >
                                {admin.adminName}
                            </Typography>
                            <Typography
                                variant="caption"
                                sx={{
                                    color: 'text.secondary',
                                    fontSize: { xs: '0.55rem', sm: '0.6rem' },
                                    display: 'block',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis'
                                }}
                            >
                                {admin.email}
                            </Typography>
                        </Box>
                    </Box>
                </Box>
            )}

            {/* Logout section */}
            <Box sx={{ p: { xs: 2, sm: 2.5 }, pb: 3 }}>
                <Button
                    variant="outlined"
                    color="error"
                    onClick={handleSignOut}
                    startIcon={<LogoutIcon sx={{ mr: 1 }} />}
                    fullWidth
                    sx={{
                        borderRadius: '12px',
                        py: { xs: 1, sm: 1.25 },
                        justifyContent: 'flex-start',
                        pl: { xs: 2, sm: 4 },
                        borderColor: alpha('#ff4d6d', 0.2),
                        color: '#ff4d6d',
                        fontWeight: 600,
                        fontSize: { xs: '0.75rem', sm: '0.8rem' },
                        '&:hover': {
                            borderColor: alpha('#ff4d6d', 0.5),
                            bgcolor: alpha('#ff4d6d', 0.05),
                        }
                    }}
                >
                    Logout
                </Button>
            </Box>
        </>
    );

    return (
        <Box
            sx={{
                display: "flex",
                minHeight: "100vh",
                bgcolor: "background.default",
            }}
        >
            {/* Permanent drawer for larger screens */}
            {!isSmall && (
                <Drawer
                    variant="persistent"
                    open={isDrawerOpen}
                    sx={{
                        width: isDrawerOpen ? drawerWidth : 0,
                        flexShrink: 0,
                        "& .MuiDrawer-paper": {
                            width: drawerWidth,
                            bgcolor: 'rgba(255, 255, 255, 0.95)',
                            backdropFilter: 'blur(10px)',
                            borderRight: 0,
                            boxShadow: '10px 0 25px rgba(145, 158, 171, 0.08)',
                            overflow: 'hidden',
                            transition: theme.transitions.create(['width', 'box-shadow', 'background-color'], {
                                easing: theme.transitions.easing.sharp,
                                duration: theme.transitions.duration.enteringScreen,
                            }),
                        }
                    }}
                >
                    <DrawerContent />
                </Drawer>
            )}

            {/* Temporary drawer for mobile devices */}
            <Drawer
                variant="temporary"
                open={isMobileDrawerOpen}
                onClose={() => setIsMobileDrawerOpen(false)}
                ModalProps={{
                    keepMounted: true, // Better mobile performance
                }}
                sx={{
                    display: { xs: 'block', md: 'none' },
                    '& .MuiDrawer-paper': {
                        width: drawerWidth,
                        bgcolor: 'rgba(255, 255, 255, 0.98)',
                        backdropFilter: 'blur(10px)',
                        borderRight: 0,
                        boxShadow: '10px 0 25px rgba(145, 158, 171, 0.15)',
                    },
                }}
            >
                <DrawerContent />
            </Drawer>

            {/* Main Content Area */}
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    width: { sm: isDrawerOpen ? `calc(100% - ${drawerWidth}px)` : '100%' },
                    transition: theme.transitions.create(['width', 'margin'], {
                        easing: theme.transitions.easing.easeOut,
                        duration: theme.transitions.duration.enteringScreen,
                    }),
                    overflow: 'auto',
                    bgcolor: 'background.default',
                }}
            >
                {/* Desktop Menu Toggle (visible when drawer is closed) */}
                {!isSmall && !isDrawerOpen && (
                    <Tooltip title="Open Sidebar" arrow placement="right">
                        <IconButton
                            onClick={() => setIsDrawerOpen(true)}
                            sx={{
                                position: 'fixed',
                                left: 20,
                                bottom: 15,
                                zIndex: 1100,
                                background: `linear-gradient(90deg, #3a7bd5, #3a6073)`,
                                color: '#fff',
                                width: 40,
                                height: 40,
                                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)',
                                '&:hover': {
                                    transform: 'translateX(1px)',
                                },
                                transition: 'all 0.3s ease',
                            }}
                            aria-label="open sidebar"
                        >
                            <MenuIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                )}

                {/* Floating Menu Button (Mobile Only) */}
                <Fade in={showFloatingMenu && isSmall}>
                    <IconButton
                        onClick={() => setIsMobileDrawerOpen(true)}
                        sx={{
                            position: 'fixed',
                            bottom: 20,
                            left: 20,
                            zIndex: 1299,
                            bgcolor: theme.palette.primary.main,
                            color: '#fff',
                            width: 56,
                            height: 56,
                            boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
                            '&:hover': {
                                bgcolor: theme.palette.primary.dark,
                            },
                            transition: 'all 0.3s ease',
                        }}
                        aria-label="open menu"
                    >
                        <MenuIcon />
                    </IconButton>
                </Fade>

                {/* Content wrapper */}
                <Box sx={{ position: 'relative', minHeight: '100%' }}>
                    <Outlet />
                </Box>
            </Box>
        </Box>
    );
};

export default AppLayout;