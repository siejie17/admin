import { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  Drawer,
  AppBar,
  List,
  Typography,
  Divider,
  IconButton,
  Toolbar,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  useMediaQuery,
  useTheme,
  Paper,
  Tooltip,
} from "@mui/material";
import {
  ChevronLeft as ChevronLeftIcon,
  Event as EventIcon,
  ShoppingBag as MerchandiseIcon,
  Logout as LogoutIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
} from "@mui/icons-material";
import { signOut } from "firebase/auth";
import { auth } from "../utils/firebaseConfig";
import { removeItem } from '../utils/localStorage';

const drawerWidth = 270;

const AppLayout = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [isDrawerOpen, setIsDrawerOpen] = useState(!isMobile);
  const [darkMode, setDarkMode] = useState(theme.palette.mode === 'dark');

  // Close drawer by default on mobile screens
  useEffect(() => {
    setIsDrawerOpen(!isMobile);
  }, [isMobile]);

  const handleDrawerToggle = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  const menuItems = [
    { text: "Events", path: "/event", icon: <EventIcon /> },
    { text: "Merchandise", path: "/merchandise", icon: <MerchandiseIcon /> },
  ];

  const handleNavigation = (path) => {
    navigate(path);
    if (isMobile) {
      setIsDrawerOpen(false);
    }
  };

  const handleSignOut = async () => {
    await removeItem("admin");
    await signOut(auth);
  }

  return (
    <Box sx={{
      display: "flex",
      height: "100vh",
      bgcolor: "rgba(229, 228, 226, 0.1)",
      fontFamily: "'Comic Sans MS', 'Chalkboard SE', sans-serif"
    }}>
      {/* Sidebar / Drawer */}
      <Drawer
        variant={isMobile ? "temporary" : "persistent"}
        open={isDrawerOpen}
        onClose={handleDrawerToggle}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            // boxSizing: "border-box",
            bgcolor: darkMode ? '#2d3250' : '#ffffff',
            borderRight: `3px solid ${darkMode ? '#3d4271' : '#e9ecff'}`,
            borderRadius: { xs: 0, md: 0 },
            // overflow: 'visible'
          }
        }}
      >
        <Box
          sx={{
            p: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'relative'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar
              sx={{
                bgcolor: '#4361ee',
                width: 45,
                height: 45,
                border: '3px solid',
                borderColor: darkMode ? '#7e93ff' : '#c7d2fe',
                boxShadow: '0 5px 10px rgba(0,0,0,0.2)',
                animation: 'pulse 2s infinite',
                '@keyframes pulse': {
                  '0%': { transform: 'scale(1)' },
                  '50%': { transform: 'scale(1.05)' },
                  '100%': { transform: 'scale(1)' },
                }
              }}
            >
              U
            </Avatar>
            <Box>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 'bold',
                  color: darkMode ? '#7e93ff' : '#4361ee',
                  textShadow: darkMode ? '0px 2px 4px rgba(0,0,0,0.3)' : '0px 2px 4px rgba(67,97,238,0.2)',
                }}
              >
                UniEXP
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: darkMode ? '#a1a8d9' : '#6c7bbd',
                  display: 'block',
                  mt: -0.5
                }}
              >
                Gamified Event System
              </Typography>
            </Box>
          </Box>
          {isMobile && (
            <IconButton
              onClick={handleDrawerToggle}
              sx={{
                bgcolor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                '&:hover': {
                  bgcolor: darkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)',
                }
              }}
            >
              <ChevronLeftIcon sx={{ color: darkMode ? '#a1a8d9' : '#6c7bbd' }} />
            </IconButton>
          )}

          {/* Decorative element */}
          <Box
            sx={{
              position: 'absolute',
              top: -5,
              right: -5,
              width: 10,
              height: 10,
              bgcolor: '#4361ee',
              borderRadius: '50%',
              boxShadow: '0 0 10px #4361ee',
              display: { xs: 'none' }
            }}
          />
        </Box>

        <Divider sx={{
          borderColor: darkMode ? '#3d4271' : '#e9ecff',
          borderWidth: 2,
          mx: 2,
          borderRadius: 2
        }} />

        {/* Navigation menu */}
        <Box
          sx={{
            px: 2,
            py: 3,
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
          }}
        >
          <Typography
            variant="subtitle2"
            sx={{
              px: 1,
              mb: 1,
              fontWeight: 'bold',
              color: darkMode ? '#a1a8d9' : '#6c7bbd',
              textTransform: 'uppercase',
              letterSpacing: 1
            }}
          >
            Main Menu
          </Typography>

          <List sx={{ p: 1 }}>
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;

              return (
                <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
                  <ListItemButton
                    onClick={() => handleNavigation(item.path)}
                    sx={{
                      borderRadius: 2,
                      py: 1.5,
                      position: 'relative',
                      bgcolor: isActive ? (darkMode ? '#4361ee' : '#e4e9ff') : 'transparent',
                      '&:hover': {
                        bgcolor: isActive
                          ? (darkMode ? '#5472ff' : '#d4deff')
                          : (darkMode ? 'rgba(126,147,255,0.15)' : 'rgba(67,97,238,0.08)'),
                        transform: 'translateX(5px)',
                        transition: 'all 0.2s'
                      }
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        color: isActive
                          ? (darkMode ? '#ffffff' : '#4361ee')
                          : (darkMode ? '#7e93ff' : '#6c7bbd'),
                        minWidth: 40
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.text}
                      primaryTypographyProps={{
                        fontWeight: isActive ? 'bold' : 'medium',
                        color: isActive
                          ? (darkMode ? '#ffffff' : '#4361ee')
                          : (darkMode ? '#e0e4ff' : '#5b5b5b'),
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>
        </Box>

        <Box sx={{ flexGrow: 1 }} />

        {/* Logout section */}
        <Paper
          elevation={4}
          sx={{
            mx: 2,
            mb: 2,
            borderRadius: 3,
            overflow: 'hidden',
            bgcolor: darkMode ? '#232742' : '#f6f9ff',
            border: `2px solid ${darkMode ? '#3d4271' : '#e9ecff'}`,
          }}
        >
          <List sx={{ p: 1 }}>
            <ListItem disablePadding>
              <ListItemButton
                sx={{
                  borderRadius: 2,
                  py: 1.5,
                  '&:hover': {
                    bgcolor: darkMode ? 'rgba(255,77,109,0.15)' : 'rgba(255,77,109,0.08)',
                    transform: 'translateX(5px)',
                    transition: 'all 0.2s'
                  }
                }}
                onClick={handleSignOut}
              >
                <ListItemIcon sx={{ color: '#ff4d6d', minWidth: 40 }}>
                  <LogoutIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Logout"
                  primaryTypographyProps={{
                    fontWeight: 'medium',
                    color: darkMode ? '#e0e4ff' : '#5b5b5b',
                  }}
                />
              </ListItemButton>
            </ListItem>
          </List>
        </Paper>
      </Drawer>

      {/* Main Content Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: isDrawerOpen ? `calc(100% - ${drawerWidth}px)` : '100%' },
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          overflow: 'auto',
          bgcolor: 'rgba(240, 244, 255, 0.1)',
          position: 'relative'
        }}
      >
        {/* Content wrapper */}
        <Box sx={{ position: 'relative', zIndex: 1, height: '100%' }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default AppLayout;