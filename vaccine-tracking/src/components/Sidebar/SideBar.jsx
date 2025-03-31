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
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts"; 
import VaccinesIcon from "@mui/icons-material/Vaccines"; 
import BugReportIcon from "@mui/icons-material/BugReport"; 
import MedicalServicesIcon from "@mui/icons-material/MedicalServices"; 

const drawerWidth = 200;

const DashboardSidebar = () => {
  const location = useLocation();
  const headerHeight = 73;
  const menuItems = [
    { text: "Dashboard", icon: <DashboardIcon />, path: "/dashboard" },
    { text: "Manage User", icon: <ManageAccountsIcon />, path: "/manageaccount" },
    { text: "Vaccine", icon: <VaccinesIcon />, path: "/managevaccine" },
    { text: "Disease", icon: <BugReportIcon />, path: "/diseasemanager" },
    { text: "Gói tiêm", icon: <MedicalServicesIcon />, path: "/managevaccinationservice" },
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
          position: "fixed",
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

export default DashboardSidebar;