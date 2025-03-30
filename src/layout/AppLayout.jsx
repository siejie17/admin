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
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText, 
  Avatar,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {  
  ChevronLeft as ChevronLeftIcon,
  Event as EventIcon,
  ShoppingBag as MerchandiseIcon,
  Logout as LogoutIcon
} from "@mui/icons-material";
import { signOut } from "firebase/auth";
import { auth } from "../utils/firebaseConfig";
import { getItem, removeItem } from '../utils/localStorage';

const drawerWidth = 260;

const AppLayout = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [isDrawerOpen, setIsDrawerOpen] = useState(!isMobile);

  // Close drawer by default on mobile screens
  useEffect(() => {
    setIsDrawerOpen(!isMobile);
  }, [isMobile]);

  const handleDrawerToggle = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  const menuItems = [
    { text: "Events", path: "/events", icon: <EventIcon /> },
    { text: "Merchandise", path: "/merchandise", icon: <MerchandiseIcon /> },
  ];

  const handleNavigation = (path) => {
    navigate(path);
    if (isMobile) {
      setIsDrawerOpen(false);
    }
  };

  const handleSignOut = async () => {
    const adminData = await getItem("admin");
    await signOut(auth);
    await removeItem("admin");
  }

  return (
    <Box sx={{ display: "flex", height: "100vh", bgcolor: "background.default" }}>
      {/* App Bar */}
      <AppBar 
        position="fixed" 
        elevation={0}
        sx={{ 
          width: { md: isDrawerOpen ? `calc(100% - ${drawerWidth}px)` : '100%' },
          ml: { md: isDrawerOpen ? `${drawerWidth}px` : 0 },
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          bgcolor: 'white',
          color: 'text.primary',
          borderBottom: `1px solid ${theme.palette.divider}`
        }}
      >
        {/* <Toolbar sx={{ justifyContent: 'space-between' }}> */}
          {/* <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton> */}
            {/* <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 'bold' }}>
              UniEXP
            </Typography> */}
          {/* </Box> */}
          
          {/* <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            
            <Avatar 
              sx={{ 
                cursor: 'pointer',
                bgcolor: theme.palette.primary.main
              }}
              onClick={() => navigate('/profile')}
            >
              U
            </Avatar>
          </Box> */}
        {/* </Toolbar> */}
      </AppBar>

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
            boxSizing: "border-box",
            bgcolor: theme.palette.mode === 'dark' ? 'background.paper' : '#f8f9fa',
            borderRight: `1px solid ${theme.palette.divider}`,
            boxShadow: isMobile ? theme.shadows[8] : 'none'
          }
        }}
      >
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar sx={{ bgcolor: theme.palette.primary.main, width: 40, height: 40 }}>U</Avatar>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>UniEXP</Typography>
          </Box>
          {isMobile && (
            <IconButton onClick={handleDrawerToggle}>
              <ChevronLeftIcon />
            </IconButton>
          )}
        </Box>

        <Divider />

        {/* Navigation menu */}
        <List sx={{ px: 1, py: 2 }}>
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            
            return (
              <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton 
                  onClick={() => handleNavigation(item.path)}
                  sx={{
                    borderRadius: 2,
                    bgcolor: isActive ? 'primary.main' : 'transparent',
                    color: isActive ? 'white' : 'inherit',
                    '&:hover': {
                      bgcolor: isActive ? 'primary.dark' : 'rgba(0, 0, 0, 0.04)'
                    }
                  }}
                >
                  <ListItemIcon sx={{ color: isActive ? 'white' : 'inherit', minWidth: 40 }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>

        <Box sx={{ flexGrow: 1 }} />

        <Divider />
        
        {/* Logout section */}
        <List sx={{ px: 1, py: 2 }}>
          <ListItem disablePadding>
            <ListItemButton 
              sx={{ 
                borderRadius: 2,
                '&:hover': {
                  bgcolor: 'rgba(255, 0, 0, 0.04)'
                }
              }}
              onClick={handleSignOut}
            >
              <ListItemIcon sx={{ color: 'error.main', minWidth: 40 }}>
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText 
                primary="Logout" 
                sx={{ color: 'error.main' }}
              />
            </ListItemButton>
          </ListItem>
        </List>
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
          mt: '64px', // Toolbar height
          overflow: 'auto',
          height: 'calc(100vh - 64px)',
          bgcolor: theme.palette.mode === 'dark' ? 'background.default' : '#ffffff'
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default AppLayout;