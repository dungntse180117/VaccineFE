import React, { useState, useEffect } from "react";
import {
  Typography,
  Box,
  Paper,
  Table,
  TableContainer,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { Edit, Delete, Visibility } from "@mui/icons-material";
import LayoutStaff from "../../components/Layout/LayoutStaff";
import "./ManageFeedback.css";
import {
  getAllFeedbacks,
  updateFeedback,
  deleteFeedback,
} from "../../config/axios";

function ManageFeedback() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [filteredFeedbacks, setFilteredFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [formData, setFormData] = useState({
    status: "",
  });
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const fetchFeedbacks = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllFeedbacks();
      if (data && Array.isArray(data)) {
        setFeedbacks(data);
        setFilteredFeedbacks(data);
      } else {
        setError("Dữ liệu phản hồi từ API không hợp lệ.");
      }
    } catch (err) {
      console.error("Lỗi khi tải phản hồi:", err);
      setError("Không thể tải danh sách phản hồi.");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusFilterChange = (event) => {
    const selectedStatus = event.target.value;
    setStatusFilter(selectedStatus);

    if (selectedStatus === "") {
      setFilteredFeedbacks(feedbacks);
    } else {
      const filtered = feedbacks.filter(
        (feedback) => feedback.status === selectedStatus
      );
      setFilteredFeedbacks(filtered);
    }
  };

  const handleOpenDialog = (feedback) => {
    setSelectedFeedback(feedback);
    setFormData({
      status: feedback.status || "Pending", // Default remains "Pending" or adjust as needed
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleUpdateFeedbackStatus = async () => {
    if (!selectedFeedback) return;

    try {
      await updateFeedback(selectedFeedback.feedbackId, formData);
      fetchFeedbacks();
      handleCloseDialog();
    } catch (err) {
      console.error("Lỗi khi cập nhật trạng thái phản hồi:", err);
      setError("Không thể cập nhật trạng thái phản hồi.");
    }
  };

  const handleDeleteFeedback = async (id) => {
    if (window.confirm("Bạn có chắc muốn xóa phản hồi này không?")) {
      try {
        await deleteFeedback(id);
        fetchFeedbacks();
      } catch (err) {
        console.error("Lỗi khi xóa phản hồi:", err);
        setError("Không thể xóa phản hồi.");
      }
    }
  };

  return (
    <LayoutStaff>
      <Box sx={{ padding: "40px 20px", backgroundColor: "#f4f6f8", minHeight: "100vh" }}>
        <Typography
          variant="h4"
          align="center"
          gutterBottom
          className="feedback-manager-title"
        >
          Quản lý Phản hồi
        </Typography>

        <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 3 }}>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel id="status-filter-label">Lọc theo trạng thái</InputLabel>
            <Select
              labelId="status-filter-label"
              value={statusFilter}
              label="Lọc theo trạng thái"
              onChange={handleStatusFilterChange}
            >
              <MenuItem value="">Tất cả</MenuItem>
              <MenuItem value="Pending">Pending</MenuItem>
              <MenuItem value="Approved">Approved</MenuItem> {/* Changed to Approved */}
              <MenuItem value="Reject">Reject</MenuItem>    {/* Changed to Reject */}
            </Select>
          </FormControl>
        </Box>

        {error && (
          <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <TableContainer component={Paper} className="feedback-manager-table-container">
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: 200 }}>
              <CircularProgress size={50} />
            </Box>
          ) : (
            <Table sx={{ minWidth: 800 }} aria-label="feedback table">
              <TableHead>
                <TableRow>
                  <TableCell className="feedback-manager-table-header">Người Gửi</TableCell>
                  <TableCell className="feedback-manager-table-header">Bình luận</TableCell>
                  <TableCell className="feedback-manager-table-header">Đánh giá</TableCell>
                  <TableCell className="feedback-manager-table-header">Trạng thái</TableCell>
                  <TableCell className="feedback-manager-table-header">Ngày Phản hồi</TableCell>
                  <TableCell className="feedback-manager-table-header">Ngày Khám</TableCell>
                  <TableCell className="feedback-manager-table-header">Hành Động</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredFeedbacks.map((feedback) => (
                  <TableRow key={feedback.feedbackId}>
                    <TableCell className="feedback-manager-table-cell">{feedback.accountName || "N/A"}</TableCell>
                    <TableCell className="feedback-manager-table-cell">{feedback.comment || "Không có"}</TableCell>
                    <TableCell className="feedback-manager-table-cell">{feedback.rating}</TableCell>
                    <TableCell className="feedback-manager-table-cell">
                      <Box
                        sx={{
                          display: "inline-block",
                          px: 1,
                          py: 0.5,
                          borderRadius: "12px",
                          bgcolor:
                            feedback.status === "Pending"
                              ? "#e67e22" // Orange - Pending
                              : feedback.status === "Approved"    // Added Approved Status
                              ? "#27ae60" // Green - Approved
                              : "#e74c3c",  // Red - Reject (Used to be "#3498db" for Reviewed, now for Reject)
                          color: "#fff",
                          fontSize: "0.85rem",
                        }}
                      >
                        {feedback.status}
                      </Box>
                    </TableCell>
                    <TableCell className="feedback-manager-table-cell">
                      {feedback.feedbackDate
                        ? new Date(feedback.feedbackDate).toLocaleDateString("vi-VN")
                        : "N/A"}
                    </TableCell>
                     <TableCell className="feedback-manager-table-cell">
                      {feedback.visitDate
                        ? new Date(feedback.visitDate).toLocaleDateString("vi-VN")
                        : "N/A"}
                    </TableCell>
                    <TableCell className="feedback-manager-table-cell">
                      <Tooltip title="Chỉnh sửa trạng thái">
                        <IconButton
                          className="feedback-manager-edit-button"
                          onClick={() => handleOpenDialog(feedback)}
                        >
                          <Edit />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Xóa">
                        <IconButton
                          className="feedback-manager-delete-button"
                          onClick={() => handleDeleteFeedback(feedback.feedbackId)}
                        >
                          <Delete />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </TableContainer>

        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="xs" fullWidth>
          <DialogTitle sx={{ bgcolor: "#3498db", color: "#fff", fontWeight: 600 }}>
            Cập nhật Trạng thái Phản hồi
          </DialogTitle>
          <DialogContent sx={{ mt: 2 }}>
            <FormControl fullWidth>
              <InputLabel id="feedback-status-label">Trạng thái</InputLabel>
              <Select
                labelId="feedback-status-label"
                id="status"
                name="status"
                value={formData.status}
                label="Trạng thái"
                onChange={handleInputChange}
              >
                <MenuItem value="Pending">Pending</MenuItem>
                <MenuItem value="Approved">Approved</MenuItem> {/* Changed to Approved */}
                <MenuItem value="Reject">Reject</MenuItem>    {/* Changed to Reject */}
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={handleCloseDialog} variant="outlined" color="primary">
              Hủy
            </Button>
            <Button onClick={handleUpdateFeedbackStatus} variant="contained" color="primary">
              Cập Nhật
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </LayoutStaff>
  );
}

export default ManageFeedback;