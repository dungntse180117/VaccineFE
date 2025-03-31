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
import VaccinesIcon from '@mui/icons-material/Vaccines'; 
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'; 
import EventIcon from '@mui/icons-material/Event'; 
import ChangeCircleIcon from '@mui/icons-material/ChangeCircle'; 
import FeedbackIcon from '@mui/icons-material/Feedback';
import './StaffSidebar.css';

const drawerWidth = 200;

const StaffSideBar = () => {
  const location = useLocation();
  const headerHeight = 73;
  const menuItems = [
    {
      text: "Quản lí đăng kí tiêm",
      icon: <VaccinesIcon />, 
      path: "/registrationdetail",
    },
    {
      text: "Quản lí lịch tiêm tổng quát",
      icon: <CalendarTodayIcon />, 
      path: "/manageappointment",
    },
    {
      text: "Quản lí lịch tiêm",
      icon: <EventIcon />,
      path: "/managevisit",
    },
    {
      text: "Quản lí yêu cầu thay đổi ngày tiêm",
      icon: <ChangeCircleIcon />, 
      path: "/managevisitdaychangerequest",
    },
    {
      text: "Quản lí phản hồi",
      icon: <FeedbackIcon />, 
      path: "/managefeedback",
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
          top: `${headerHeight}px`,
          left: 0,
          bottom: 0,
          height: `calc(100% - ${headerHeight}px)`,
        },
      }}
      classes={{ paper: "sidebar-container" }}
    >
      <Box sx={{ overflow: "auto" }}>
        <List>
          {menuItems.map((item) => (
            <ListItem
              button
              key={item.text}
              component={Link}
              to={item.path}
              className={`sidebar-item ${location.pathname === item.path ? "active" : ""}`}
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