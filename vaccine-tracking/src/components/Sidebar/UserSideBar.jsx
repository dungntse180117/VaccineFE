import React from "react";
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Box,
} from "@mui/material";
import { Link, useLocation } from "react-router-dom";
import DashboardIcon from "@mui/icons-material/Dashboard";
import HelpIcon from "@mui/icons-material/Help";
import AccountBoxIcon from '@mui/icons-material/AccountBox';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import './UserSidebar.css';


const drawerWidth = 200; 

const UserSidebar = () => {
  const location = useLocation();
  const headerHeight = 73; 
  const menuItems = [
    
    {
      text: "Quản Lí Hồ Sơ Tiêm Chủng",
      icon: <LocalHospitalIcon />,
      path: "/patientmanager",
    },
    {
      text: "Lịch Tiêm",
      icon: <EventAvailableIcon />,
      path: "#", // Tạm thời chưa có link
    },
  ];

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          width: drawerWidth,
          boxSizing: "border-box",
          top: `${headerHeight}px`, // Adjust the top position
          left: 0,
          bottom: 0,
          height: `calc(100% - ${headerHeight}px)`, // Adjust the height
        },
      }}
    >
      <Box sx={{ overflow: "auto" }}>
        <List>
          {menuItems.map((item) => (
            <ListItem
              button
              key={item.text}
              component={Link}
              to={item.path}
              selected={location.pathname === item.path}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          ))}
        </List>
      </Box>
    </Drawer>
  );
};

export default UserSidebar;