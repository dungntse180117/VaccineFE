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
import { ManageAccounts } from '@mui/icons-material'; // Corrected Import



const drawerWidth = 200; // Reduced width

const DashboardSidebar = () => {
  const location = useLocation();
  const headerHeight = 73; 
  const menuItems = [
    { text: "Dashboard", icon: <DashboardIcon />, path: "/dashboard" },
    {text: "Manage User",icon: <ManageAccounts />,  path: "/manageaccount"},
    {text: "Manage Vaccine",icon: <ManageAccounts />,  path: "/managevaccine",}
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
          position: 'fixed',
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

export default DashboardSidebar;