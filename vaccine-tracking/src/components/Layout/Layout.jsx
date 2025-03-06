import React from 'react';
import { Box, styled } from '@mui/material';
import Header from '../Header/Header';
import SideBar from '../Sidebar/SideBar';

const MainContent = styled(Box)(({ theme }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
}));

function Layout({ children }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <Header />
      <Box sx={{ display: 'flex', flex: '1' }}>
        <SideBar />
        <MainContent>
          {children}
        </MainContent>
      </Box>
    </Box>
  );
}

export default Layout;