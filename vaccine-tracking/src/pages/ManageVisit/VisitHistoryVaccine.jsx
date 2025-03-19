import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getVaccinationHistoriesByVisitId, updateVaccinationHistory } from "../../config/axios";
import {
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Typography,
  CircularProgress,
  Box,
  Alert,
  Button,
  Modal,
  TextField,
} from "@mui/material";
import moment from "moment";
import "./VisitHistoryVaccine.css";
import { Layout, Breadcrumb, message } from "antd";
import AppHeader from "../../components/Header/Header";
import { styled } from "@mui/material/styles";

const { Content } = Layout;

const MainContent = styled(Box)(({ theme }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  overflow: "auto",
}));

const VisitHistoryVaccine = () => {
  const { visitId } = useParams();
  const [histories, setHistories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [selectedHistoryId, setSelectedHistoryId] = useState(null);
  const [reactionInput, setReactionInput] = useState("");

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getVaccinationHistoriesByVisitId(visitId);
        setHistories(data);
      } catch (err) {
        setError(err.message || "Đã xảy ra lỗi khi tải dữ liệu.");
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [visitId]);

  const handleOpenModal = (historyId) => {
    setSelectedHistoryId(historyId);
    setReactionInput("");
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedHistoryId(null);
    setReactionInput("");
  };

  const handleReactionChange = (event) => {
    setReactionInput(event.target.value);
  };

  const handleUpdateReaction = async () => {
    try {
      await updateVaccinationHistory(selectedHistoryId, { reaction: reactionInput });
      const updatedHistories = await getVaccinationHistoriesByVisitId(visitId);
      setHistories(updatedHistories);
      message.success("Phản ứng đã được cập nhật thành công!");
      handleCloseModal();
    } catch (err) {
      console.error("Lỗi khi cập nhật phản ứng:", err);
      message.error("Cập nhật phản ứng thất bại.");
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "200px" }}>
        <CircularProgress size={60} thickness={4} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "200px" }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!histories || histories.length === 0) {
    return (
      <Box className="visit-history-no-data">
        <Typography variant="h6" color="textSecondary">
          Không có lịch sử tiêm cho lần khám này.
        </Typography>
      </Box>
    );
  }

  const columns = [
    {
      title: "Ngày Tiêm",
      dataIndex: "vaccinationDate",
      key: "vaccinationDate",
      render: (date) => (date ? moment(date).format("DD/MM/YYYY") : "N/A"),
    },
    {
      title: "Vaccine",
      dataIndex: "vaccineId",
      key: "vaccineId",
      render: (text) => text || "N/A",
    },
    {
      title: "Phản Ứng",
      dataIndex: "reaction",
      key: "reaction",
      render: (text, record) =>
        text ? (
          text
        ) : (
          <Button variant="outlined" color="primary" onClick={() => handleOpenModal(record.vaccinationHistoryID)}>
            Ghi Nhận
          </Button>
        ),
    },
    {
      title: "Ghi Chú",
      dataIndex: "notes",
      key: "notes",
      render: (text) => text || "N/A",
    },
  ];

  return (
    <Layout className="visit-history-container">
      <AppHeader />
      <Layout>
        <Content>
          <Breadcrumb className="visit-history-breadcrumb">
            <Breadcrumb.Item>Trang chủ</Breadcrumb.Item>
            <Breadcrumb.Item>Quản lý Lịch Hẹn Tiêm</Breadcrumb.Item>
            <Breadcrumb.Item>Lịch Sử Tiêm Chủng</Breadcrumb.Item>
          </Breadcrumb>

          <MainContent>
            <Typography variant="h4" className="visit-history-title">
              Lịch Sử Tiêm Vaccine
            </Typography>

            <TableContainer component={Paper} className="visit-history-table-container">
              <Table aria-label="vaccination history table">
                <TableHead>
                  <TableRow>
                    {columns.map((column) => (
                      <TableCell key={column.key} className="visit-history-table-header">
                        {column.title}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {histories.map((history) => (
                    <TableRow key={history.vaccinationHistoryID} className="visit-history-table-row">
                      {columns.map((column) => (
                        <TableCell key={column.key} className="visit-history-table-cell">
                          {column.render(history[column.dataIndex], history)}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </MainContent>
        </Content>
      </Layout>

      <Modal open={openModal} onClose={handleCloseModal}>
        <Box className="visit-history-modal">
          <Typography className="visit-history-modal-title">Ghi Nhận Phản Ứng</Typography>
          <TextField
            autoFocus
            margin="dense"
            label="Phản Ứng"
            type="text"
            fullWidth
            variant="outlined"
            value={reactionInput}
            onChange={handleReactionChange}
            sx={{ mb: 2 }}
          />
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
            <Button variant="outlined" color="primary" onClick={handleCloseModal}>
              Hủy
            </Button>
            <Button variant="contained" color="primary" onClick={handleUpdateReaction}>
              Cập Nhật
            </Button>
          </Box>
        </Box>
      </Modal>
    </Layout>
  );
};

export default VisitHistoryVaccine;