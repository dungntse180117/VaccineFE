import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getAllRegistrationsByAccountId } from "../../config/axios";
import Layout from "../../components/Layout/Layout";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { Box, Typography, CircularProgress } from "@mui/material";
import "./HistoryRegistration.css";

const HistoryRegistration = () => {
  const { accountId } = useParams();
  const [registrations, setRegistrations] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRegistrations = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await getAllRegistrationsByAccountId(accountId);
        setRegistrations(data);
      } catch (err) {
        setError(err.message || "Không thể tải lịch sử đăng ký.");
      } finally {
        setLoading(false);
      }
    };

    if (accountId) {
      fetchRegistrations();
    } else {
      setError("Thiếu ID tài khoản.");
      setLoading(false);
    }
  }, [accountId]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN"); // Format as DD/MM/YYYY
  };

  if (loading) {
    return (
      <Layout>
        <Box className="history-registration-container">
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: 200 }}>
            <CircularProgress size={60} thickness={4} />
          </Box>
        </Box>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <Box className="history-registration-container">
          <p className="history-registration-error">Lỗi: {error}</p>
        </Box>
      </Layout>
    );
  }

  return (
    <Layout>
      <Box className="history-registration-container">
        <Typography variant="h4" className="history-registration-title">
          Lịch Sử Đăng Ký Tiêm
        </Typography>

        <TableContainer component={Paper} className="history-registration-table-container">
          <Table aria-label="registration history table">
            <TableHead>
              <TableRow>
                <TableCell className="history-registration-table-header">Ngày Đăng Ký</TableCell>
                <TableCell className="history-registration-table-header">Tổng Tiền</TableCell>
                <TableCell className="history-registration-table-header">Trạng Thái</TableCell>
                <TableCell className="history-registration-table-header">Ngày Mong Muốn</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {registrations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="history-registration-table-cell">
                    <Box className="history-registration-no-data">
                      <Typography variant="h6" color="textSecondary">
                        Không tìm thấy lịch sử đăng ký cho tài khoản này.
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                registrations.map((registration) => (
                  <TableRow key={registration.registrationID} className="history-registration-table-row">
                    <TableCell className="history-registration-table-cell">
                      {formatDate(registration.registrationDate)}
                    </TableCell>
                    <TableCell className="history-registration-table-cell">
                      {registration.totalAmount ? `${registration.totalAmount} vnđ` : "N/A"}
                    </TableCell>
                    <TableCell className="history-registration-table-cell">
                      {registration.status || "N/A"}
                    </TableCell>
                    <TableCell className="history-registration-table-cell">
                      {formatDate(registration.desiredDate)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Layout>
  );
};

export default HistoryRegistration;