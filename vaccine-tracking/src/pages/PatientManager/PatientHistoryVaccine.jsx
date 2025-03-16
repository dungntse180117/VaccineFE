import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
getVaccinationHistoriesByPatientId, 
getPatientById } from '../../config/axios';
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
  const [patientName, setPatientName] = useState(""); // State for patient name
  const navigate = useNavigate();

  useEffect(() => {
    fetchPatientData(); // Fetch patient data to get name
    fetchVaccinationHistory();
  }, [patientId]);

  const fetchPatientData = async () => {
    try {
      const response = await getPatientById(patientId);
      setPatientName(response.data.patientName); // Set patient name from response
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

  const historyColumns = [
    { title: 'Reaction', dataIndex: 'reaction', key: 'reaction' },
    { title: 'Notes', dataIndex: 'notes', key: 'notes' },
  ];

  console.log('vaccinationHistory before render:', vaccinationHistory);

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
          <Box>
            <Breadcrumb items={[
              { title: 'Trang chủ' },
              { title: 'Quản lý hồ sơ tiêm chủng' },
              { title: 'Lịch sử tiêm chủng' },
            ]} style={{ margin: '16px 0' }} />
          </Box>

          <MainContent>
            <h2>Lịch sử tiêm chủng bệnh nhân: {patientName}</h2> {/* Display Patient Name */}

            {/* REMOVED "Quay lại danh sách bệnh nhân" BUTTON */}

            <TableContainer component={Paper}>
              <Table sx={{ minWidth: 650 }} aria-label="vaccination history table">
                <TableHead>
                  <TableRow>
                    <TableCell>Reaction</TableCell>
                    <TableCell>Notes</TableCell>
                    {/* Removed headers for "Vaccination Date" and "Vaccine ID" */}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={2} style={{ textAlign: 'center' }}> {/* Updated colSpan */}
                        <Spin tip="Loading..." />
                      </TableCell>
                    </TableRow>
                  ) : vaccinationHistory ? (
                    (() => {
                      console.log('vaccinationHistory inside conditional render:', vaccinationHistory);
                      return vaccinationHistory.map(history => (
                        <TableRow
                          key={history.vaccinationHistoryID}
                          sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                        >
                          <TableCell>{history.reaction}</TableCell>
                          <TableCell>{history.notes}</TableCell>
                           {/* Removed cells for "Vaccination Date" and "Vaccine ID" */}
                        </TableRow>
                      ));
                    })()
                  ) : (
                    <TableRow>
                      <TableCell colSpan={2} style={{ textAlign: 'center' }}> {/* Updated colSpan */}
                        No vaccination history found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </MainContent>
        </Content>
      </Layout>
    </Layout>
  );
};3

export default PatientHistoryVaccine;