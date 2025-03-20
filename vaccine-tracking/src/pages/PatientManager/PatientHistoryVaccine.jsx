import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  getVaccinationHistoriesByPatientId, 
  getPatientById 
} from '../../config/axios';
import {
  Layout,
  Breadcrumb,
  message,
  Spin
} from 'antd';
import AppHeader from "../../components/Header/Header";
import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";
import {
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
} from "@mui/material";
import './PatientHistoryVaccine.css';

const { Content } = Layout;
const drawerWidth = 200;

const MainContent = styled(Box)(({ theme }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  overflow: "auto",
}));

const PatientHistoryVaccine = () => {
  const { patientId } = useParams();
  const [vaccinationHistory, setVaccinationHistory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [patientName, setPatientName] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchPatientData();
    fetchVaccinationHistory();
  }, [patientId]);

  const fetchPatientData = async () => {
    try {
      const response = await getPatientById(patientId);
      setPatientName(response.data.patientName);
    } catch (error) {
      console.error("Error fetching patient data:", error);
      message.error("Failed to load patient information");
    }
  };

  const fetchVaccinationHistory = async () => {
    setLoading(true);
    try {
      const response = await getVaccinationHistoriesByPatientId(patientId);
      console.log('API Response data:', response.data);
      setVaccinationHistory(response.data);
    } catch (error) {
      console.error("Error fetching vaccination history:", error);
      message.error("Failed to load vaccination history");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout className="patient-history-vaccine-layout" style={{ minHeight: '100vh' }}>
      <AppHeader />
      <Layout>
        <Content
          style={{
            padding: '24px',
            marginLeft: drawerWidth,
          }}
        >
          <MainContent>
            <Paper className="content-container">
              <Breadcrumb items={[
                { title: 'Trang chủ' },
                { title: 'Quản lý hồ sơ tiêm chủng' },
                { title: 'Lịch sử tiêm chủng' },
              ]} style={{ margin: '16px 0' }} />
              <h2>Lịch sử tiêm chủng bệnh nhân: {patientName || "Đang tải..."}</h2>

              <TableContainer>
                <Table sx={{ minWidth: 650 }} aria-label="vaccination history table">
                  <TableHead>
                    <TableRow>
                      <TableCell>Reaction</TableCell>
                      <TableCell>Notes</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={2} style={{ textAlign: 'center' }}>
                          <Spin tip="Đang tải lịch sử tiêm chủng..." />
                        </TableCell>
                      </TableRow>
                    ) : vaccinationHistory && vaccinationHistory.length > 0 ? (
                      vaccinationHistory.map(history => (
                        <TableRow
                          key={history.vaccinationHistoryID}
                          sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                        >
                          <TableCell>{history.reaction || "N/A"}</TableCell>
                          <TableCell>{history.notes || "N/A"}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={2} style={{ textAlign: 'center' }}></TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </MainContent>
        </Content>
      </Layout>
    </Layout>
  );
};

export default PatientHistoryVaccine;