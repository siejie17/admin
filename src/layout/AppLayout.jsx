import { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
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
  Avatar,
  useMediaQuery,
  useTheme,
  alpha,
  Button,
} from "@mui/material";
import {
  ChevronLeft as ChevronLeftIcon,
  Event as EventIcon,
  ShoppingBag as MerchandiseIcon,
  Logout as LogoutIcon,
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
    <Box
      sx={{
        display: "flex",
        height: "100vh",
        bgcolor: "background.default",
      }}
    >
      <Drawer
        variant={isMobile ? "temporary" : "persistent"}
        open={isDrawerOpen}
        onClose={handleDrawerToggle}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            bgcolor: darkMode ? 'rgba(30, 32, 44, 0.95)' : 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            borderRight: 0,
            boxShadow: darkMode
              ? '10px 0 25px rgba(0, 0, 0, 0.2)'
              : '10px 0 25px rgba(145, 158, 171, 0.08)',
            overflow: 'hidden',
            transition: 'box-shadow 0.25s ease-in-out, background-color 0.25s ease-in-out',
          }
        }}
      >
        <Box
          sx={{
            p: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar
              sx={{
                bgcolor: 'primary.main',
                width: 40,
                height: 40,
                fontWeight: 800,
                boxShadow: theme => `0 0 0 2px ${theme.palette.background.paper}`,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'scale(1.05)'
                }
              }}
            >
              U
            </Avatar>
            <Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: '800',
                  color: 'primary.main',
                  letterSpacing: '-0.5px'
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
                bgcolor: theme => alpha(theme.palette.primary.main, 0.08),
                borderRadius: '12px',
                '&:hover': {
                  bgcolor: theme => alpha(theme.palette.primary.main, 0.15),
                }
              }}
            >
              <ChevronLeftIcon fontSize="small" sx={{ color: 'primary.main' }} />
            </IconButton>
          )}
        </Box>

        {/* Navigation menu */}
        <Box
          sx={{
            px: 2.5,
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
                      py: 1.25,
                      position: 'relative',
                      transition: 'all 0.2s ease-in-out',
                      overflow: 'hidden',
                      bgcolor: isActive ?
                        (darkMode ? alpha('#4361ee', 0.15) : alpha('#4361ee', 0.08)) :
                        'transparent',
                      '&:hover': {
                        bgcolor: isActive ?
                          (darkMode ? alpha('#4361ee', 0.2) : alpha('#4361ee', 0.12)) :
                          (darkMode ? alpha('#4361ee', 0.08) : alpha('#4361ee', 0.04)),
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
                        minWidth: 36,
                        fontSize: '1.25rem',
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.text}
                      primaryTypographyProps={{
                        fontWeight: isActive ? 700 : 500,
                        fontSize: '0.95rem',
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

        {/* Logout section */}
        <Box sx={{ p: 2.5, pb: 3 }}>
          <Button
            variant="outlined"
            color="error"
            onClick={handleSignOut}
            startIcon={<LogoutIcon sx={{ mr: 1.5 }} />}
            fullWidth
            sx={{
              borderRadius: '12px',
              py: 1.25,
              justifyContent: 'flex-start',
              pl: 4,
              borderColor: alpha('#ff4d6d', 0.2),
              color: darkMode ? '#ff6b8b' : '#ff4d6d',
              fontWeight: 600,
              '&:hover': {
                borderColor: alpha('#ff4d6d', 0.5),
                bgcolor: alpha('#ff4d6d', 0.05),
              }
            }}
          >
            Logout
          </Button>
        </Box>
      </Drawer>

      {/* Main Content Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: isDrawerOpen ? `calc(100% - ${drawerWidth}px)` : '100%' },
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.enteringScreen,
          }),
          overflow: 'auto',
          bgcolor: 'background.default',
          position: 'relative'
        }}
      >
        {/* Content wrapper */}
        <Box sx={{ position: 'relative', height: '100%' }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default AppLayout;