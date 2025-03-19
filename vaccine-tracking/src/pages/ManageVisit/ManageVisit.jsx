import React, { useState, useEffect } from "react";
import {
  Layout,
  Breadcrumb,
  message,
  Modal,
  Form,
  Input,
  Button as AntButton,
  Popover,
} from "antd";
import { DatePicker } from "antd";
import moment from "moment";
import AppHeader from "../../components/Header/Header";
import StaffSideBar from "../../components/Sidebar/StaffSideBar";
import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";
import {
  Button,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  IconButton,
  Typography,
  Chip,
  CircularProgress,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import DoneIcon from "@mui/icons-material/Done";
import HistoryIcon from "@mui/icons-material/History";
import { getVisits, updateVisit, deleteVisit, updateVisitStatus } from "../../config/axios";
import "./ManageVisit.css";
import { useNavigate } from "react-router-dom";

const { Content } = Layout;
const drawerWidth = 200;

const MainContent = styled(Box)(({ theme }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  overflow: "auto",
  width: "100%",
}));

const ManageVisit = () => {
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(moment());
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editVisitForm] = Form.useForm();
  const [selectedVisit, setSelectedVisit] = useState(null);
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchVisits();
  }, [selectedDate]);

  const fetchVisits = async () => {
    setLoading(true);
    try {
      const response = await getVisits();
      const allVisits = response.data;
      const filteredVisits = allVisits.filter((visit) =>
        moment(visit.visitDate).isSame(selectedDate, "day")
      );
      setVisits(filteredVisits);
    } catch (error) {
      console.error("Error fetching visits:", error);
      message.error("Không thể tải danh sách lượt thăm.");
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    setIsDatePickerVisible(false);
  };

  const showEditModal = (record) => {
    setSelectedVisit(record);
    setIsEditModalOpen(true);
    editVisitForm.setFieldsValue({
      visitDate: moment(record.visitDate),
      notes: record.notes,
      status: record.status,
      appointmentID: record.appointmentID,
    });
  };

  const handleEditCancel = () => {
    setIsEditModalOpen(false);
    setSelectedVisit(null);
    editVisitForm.resetFields();
  };

  const handleEditVisit = async (values) => {
    try {
      setLoading(true);
      await updateVisit(selectedVisit.visitID, {
        ...values,
        visitDate: values.visitDate.format("YYYY-MM-DD"),
        visitID: selectedVisit.visitID,
      });
      message.success("Cập nhật lượt thăm thành công.");
      fetchVisits();
      handleEditCancel();
    } catch (error) {
      console.error("Error updating visit:", error);
      message.error(`Lỗi khi cập nhật lượt thăm: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteVisit = async (record) => {
    Modal.confirm({
      title: "Xác nhận xóa",
      content: "Bạn có chắc chắn muốn xóa lượt thăm này không?",
      onOk: async () => {
        try {
          setLoading(true);
          await deleteVisit(record.visitID);
          message.success("Xóa lượt thăm thành công.");
          fetchVisits();
        } catch (error) {
          console.error("Error deleting visit:", error);
          message.error(`Lỗi khi xóa lượt thăm: ${error.message}`);
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const handleUpdateVisitStatus = (record) => {
    Modal.confirm({
      title: "Xác nhận cập nhật trạng thái",
      content: 'Bạn có muốn cập nhật trạng thái thành "Đã tiêm"?',
      onOk: async () => {
        setLoading(true);
        try {
          await updateVisitStatus(record.visitID, { status: "Đã tiêm" });
          message.success("Cập nhật trạng thái thành công.");
          fetchVisits();
        } catch (error) {
          console.error("Error updating visit status:", error);
          message.error("Cập nhật trạng thái thất bại.");
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const goToPreviousDay = () => {
    setSelectedDate(moment(selectedDate).subtract(1, "day"));
  };

  const goToNextDay = () => {
    setSelectedDate(moment(selectedDate).add(1, "day"));
  };

  const datePickerContent = (
    <DatePicker
      value={selectedDate}
      format="YYYY-MM-DD"
      onChange={handleDateChange}
      onOpenChange={(open) => !open && setIsDatePickerVisible(false)}
    />
  );

  return (
    <Layout className="manage-visit-layout">
      <AppHeader />
      <Layout>
        <StaffSideBar />
        <Content className="manage-visit-content">
          <Breadcrumb className="manage-visit-breadcrumb">
            <Breadcrumb.Item>Trang chủ</Breadcrumb.Item>
            <Breadcrumb.Item>Quản lý Lịch Hẹn Tiêm</Breadcrumb.Item>
          </Breadcrumb>

          <MainContent>
            <Typography variant="h4" className="manage-visit-header">
              Quản lý Lịch Hẹn Tiêm
            </Typography>

            <Box sx={{ mb: 3, display: "flex", justifyContent: "center", alignItems: "center" }}>
              <Box display="flex" alignItems="center" gap={2}>
                <Button variant="outlined" onClick={goToPreviousDay}>
                  Ngày Trước
                </Button>
                <Popover
                  content={datePickerContent}
                  trigger="click"
                  open={isDatePickerVisible}
                  onOpenChange={(open) => setIsDatePickerVisible(open)}
                >
                  <Button variant="contained" sx={{ minWidth: 120 }}>
                    {selectedDate.format("DD/MM/YYYY")}
                  </Button>
                </Popover>
                <Button variant="outlined" onClick={goToNextDay}>
                  Ngày Sau
                </Button>
              </Box>
            </Box>

            {loading ? (
              <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: 200 }}>
                <CircularProgress size={50} />
              </Box>
            ) : visits.length === 0 ? (
              <Box className="manage-visit-no-visits-message">
                <Typography variant="h6">Không có lịch tiêm nào hôm nay</Typography>
              </Box>
            ) : (
              <TableContainer component={Paper} className="manage-visit-table-container">
                <Table sx={{ minWidth: 650 }} aria-label="visits table">
                  <TableHead>
                    <TableRow>
                      <TableCell className="appointment-manager-table-header">Ngày Thăm</TableCell>
                      <TableCell className="appointment-manager-table-header">Ghi Chú</TableCell>
                      <TableCell className="appointment-manager-table-header">Trạng Thái</TableCell>
                      <TableCell className="appointment-manager-table-header">Tên Người Tiêm</TableCell>
                      <TableCell className="appointment-manager-table-header">Số Điện Thoại</TableCell>
                      <TableCell className="appointment-manager-table-header">Lịch Sử Tiêm</TableCell>
                      <TableCell className="appointment-manager-table-header">Hành Động</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {visits.map((visit) => (
                      <TableRow key={visit.visitID}>
                        <TableCell className="appointment-manager-table-cell">
                          {visit.visitDate ? moment(visit.visitDate).format("DD/MM/YYYY") : "N/A"}
                        </TableCell>
                        <TableCell className="appointment-manager-table-cell">
                          {visit.notes || "Không có"}
                        </TableCell>
                        <TableCell className="appointment-manager-table-cell">
                          <Chip
                            label={visit.status}
                            sx={{
                              bgcolor: visit.status === "Đã tiêm" ? "#27ae60" : "#e67e22",
                              color: "#fff",
                            }}
                          />
                        </TableCell>
                        <TableCell className="appointment-manager-table-cell">{visit.patientName}</TableCell>
                        <TableCell className="appointment-manager-table-cell">{visit.patientPhone}</TableCell>
                        <TableCell className="appointment-manager-table-cell">
                          <IconButton
                            className="manage-visit-icon-button"
                            onClick={() => navigate(`/visit-history-vaccine/${visit.visitID}`)}
                          >
                            <HistoryIcon />
                          </IconButton>
                        </TableCell>
                        <TableCell className="appointment-manager-table-cell">
                          <IconButton
                            className="manage-visit-icon-button"
                            onClick={() => showEditModal(visit)}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            className="manage-visit-icon-button"
                            onClick={() => handleDeleteVisit(visit)}
                          >
                            <DeleteIcon />
                          </IconButton>
                          <IconButton
                            className="manage-visit-icon-button"
                            onClick={() => handleUpdateVisitStatus(visit)}
                          >
                            <DoneIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            {/* Modal Chỉnh sửa Lượt Thăm */}
            <Modal
              title="Chỉnh sửa Lượt Thăm"
              open={isEditModalOpen}
              onCancel={handleEditCancel}
              footer={null}
            >
              <Form form={editVisitForm} layout="vertical" onFinish={handleEditVisit}>
                <Form.Item
                  name="appointmentID"
                  label="Mã Lịch Hẹn"
                  rules={[{ required: true, message: "Vui lòng nhập Mã Lịch Hẹn" }]}
                >
                  <Input type="number" disabled className="manage-visit-input" />
                </Form.Item>
                <Form.Item
                  name="visitDate"
                  label="Ngày Thăm"
                  rules={[{ required: true, message: "Vui lòng chọn Ngày Thăm" }]}
                >
                  <DatePicker
                    style={{ width: "100%" }}
                    format="DD/MM/YYYY"
                    className="manage-visit-input"
                  />
                </Form.Item>
                <Form.Item name="notes" label="Ghi Chú">
                  <Input.TextArea className="manage-visit-input" rows={3} />
                </Form.Item>
                <Form.Item name="status" label="Trạng Thái">
                  <Input className="manage-visit-input" />
                </Form.Item>
                <Form.Item style={{ marginBottom: 0 }}>
                  <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
                    <AntButton className="manage-visit-button" onClick={handleEditCancel}>
                      Hủy
                    </AntButton>
                    <AntButton
                      type="primary"
                      htmlType="submit"
                      className="manage-visit-primary-button"
                    >
                      Lưu
                    </AntButton>
                  </Box>
                </Form.Item>
              </Form>
            </Modal>
          </MainContent>
        </Content>
      </Layout>
    </Layout>
  );
};

export default ManageVisit;