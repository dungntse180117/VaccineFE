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
import { ManageAccounts } from '@mui/icons-material';

const drawerWidth = 200;

const DashboardSidebar = () => {
  const location = useLocation();
  const headerHeight = 73;
  const menuItems = [
    { text: "Dashboard", icon: <DashboardIcon />, path: "/dashboard" },
    { text: "Manage User", icon: <ManageAccounts />, path: "/manageaccount" },
    { text: "Vaccine", icon: <ManageAccounts />, path: "/managevaccine" },
    { text: "Disease", icon: <ManageAccounts />, path: "/diseasemanager" },
    { text: "Gói tiêm", icon: <ManageAccounts />, path: "/managevaccinationservice" },
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
      classes={{ paper: "sidebar-container" }} // Áp dụng class CSS
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