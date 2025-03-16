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
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import './StaffSidebar.css';


const drawerWidth = 200; 

const StaffSideBar = () => {
  const location = useLocation();
  const headerHeight = 73; 
  const menuItems = [
    
    {
      text: "Quản lí đăng kí tiêm",
      icon: <LocalHospitalIcon />,
      path: "/registrationdetail",
    },
    {
      text: "Quản lí lịch tiêm tổng quát",
      icon: <EventAvailableIcon />,
      path: "/manageappointment", 
    },
    {
        text: "Quản lí lịch tiêm",
        icon: <EventAvailableIcon />,
        path: "/managevisit", 
      },
      {
        text: "Quản lí yêu cầu thay đổi ngày tiêm",
        icon: <EventAvailableIcon />,
        path: "/managevisitdaychangerequest", 
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

export default StaffSideBar;