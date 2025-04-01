import React, { useState, useEffect } from "react";
import { Breadcrumb, message, Modal, Form, Input, Button as AntButton, Select } from "antd";
import moment from "moment";
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
  IconButton,
  Typography,
  CircularProgress,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  getVisitDayChangeRequests,
  updateVisitDayChangeRequest,
  deleteVisitDayChangeRequest,
} from "../../config/axios";
import "./ManageVisitDayChangeRequest.css";
import LayoutStaff from "../../components/Layout/LayoutStaff";

const { Option } = Select;

const MainContent = styled(Box)(({ theme }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  overflow: "auto",
  width: "100%",
}));

const ManageVisitDayChangeRequest = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editRequestForm] = Form.useForm();
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [rejectReasonVisible, setRejectReasonVisible] = useState(false);
  const [isRejectButtonClicked, setIsRejectButtonClicked] = useState(false);
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    fetchVisitDayChangeRequests();
  }, [statusFilter]);

  const fetchVisitDayChangeRequests = async () => {
    setLoading(true);
    try {
      const response = await getVisitDayChangeRequests();
      let allRequests = response.data;
      let filteredRequests = allRequests;
      if (statusFilter !== "All") {
        filteredRequests = allRequests.filter((request) => request.status === statusFilter);
      }
      setRequests(filteredRequests);
    } catch (error) {
      console.error("Error fetching visit day change requests:", error);
      message.error("Không thể tải danh sách yêu cầu đổi lịch.");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusFilterChange = (value) => {
    setStatusFilter(value);
  };

  const showEditModal = (record) => {
    setSelectedRequest(record);
    setIsEditModalOpen(true);
    setRejectReasonVisible(false);
    setIsRejectButtonClicked(false);
    editRequestForm.resetFields();
  };

  const handleEditCancel = () => {
    setIsEditModalOpen(false);
    setSelectedRequest(null);
    editRequestForm.resetFields();
    setRejectReasonVisible(false);
    setIsRejectButtonClicked(false);
  };

  const handleApproveRequest = async () => {
    setLoading(true);
    try {
      await updateVisitDayChangeRequest(selectedRequest.changeRequestId, {
        status: "Approved",
        staffNotes: "",
      });
      message.success("Yêu cầu đổi lịch hẹn đã được chấp nhận.");
      fetchVisitDayChangeRequests();
      handleEditCancel();
    } catch (error) {
      console.error("Error approving visit day change request:", error);
      message.error(`Lỗi khi chấp nhận yêu cầu: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRejectRequest = () => {
    setRejectReasonVisible(true);
    setIsRejectButtonClicked(true);
  };

  const handleRejectSubmit = async (values) => {
    setLoading(true);
    try {
      await updateVisitDayChangeRequest(selectedRequest.changeRequestId, {
        status: "Rejected",
        staffNotes: values.staffNotes,
      });
      message.success("Yêu cầu đổi lịch hẹn đã bị từ chối.");
      fetchVisitDayChangeRequests();
      handleEditCancel();
    } catch (error) {
      console.error("Error rejecting visit day change request:", error);
      message.error(`Lỗi khi từ chối yêu cầu: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRequest = async (record) => {
    Modal.confirm({
      title: "Xác nhận xóa",
      content: "Bạn có chắc chắn muốn xóa yêu cầu đổi lịch này không?",
      onOk: async () => {
        try {
          setLoading(true);
          await deleteVisitDayChangeRequest(record.changeRequestId);
          message.success("Xóa yêu cầu đổi lịch thành công.");
          fetchVisitDayChangeRequests();
        } catch (error) {
          console.error("Error deleting visit day change request:", error);
          message.error(`Lỗi khi xóa yêu cầu: ${error.message}`);
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const requestColumns = [
    {
      title: "Ngày Yêu Cầu",
      dataIndex: "requestedDate",
      key: "requestedDate",
      render: (text) => (text ? moment(text).format("DD/MM/YYYY") : "N/A"),
    },
    { title: "Lý Do", dataIndex: "reason", key: "reason" },
    { title: "Trạng Thái", dataIndex: "status", key: "status" },
    { title: "Ghi Chú Nhân Viên", dataIndex: "staffNotes", key: "staffNotes" },
    {
      title: "Thời Gian Yêu Cầu",
      dataIndex: "requestedDateAt",
      key: "requestedDateAt",
      render: (text) => (text ? moment(text).format("DD/MM/YYYY HH:mm:ss") : "N/A"),
    },
    {
      title: "Hành Động",
      key: "actions",
      render: (text, record) => (
        <>
          <IconButton
            aria-label="edit"
            onClick={() => showEditModal(record)}
            className="manage-visit-day-change-request-icon-button"
          >
            <EditIcon />
          </IconButton>
          <IconButton
            aria-label="delete"
            onClick={() => handleDeleteRequest(record)}
            className="manage-visit-day-change-request-icon-button"
          >
            <DeleteIcon />
          </IconButton>
        </>
      ),
    },
  ];

  return (
    <LayoutStaff>
      <Box>
        <Breadcrumb className="manage-visit-day-change-request-breadcrumb">
          <Breadcrumb.Item>Trang chủ</Breadcrumb.Item>
          <Breadcrumb.Item>Quản lý Yêu Cầu Đổi Lịch Hẹn</Breadcrumb.Item>
        </Breadcrumb>
      </Box>

      <MainContent className="manage-visit-day-change-request-content">
        <Typography variant="h4" className="manage-visit-day-change-request-header">
          Quản lý Yêu Cầu Đổi Lịch Hẹn Tiêm
        </Typography>

        <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 3 }}>
          <Select
            defaultValue="All"
            className="manage-visit-day-change-request-select-filter"
            onChange={handleStatusFilterChange}
          >
            <Option value="All">Tất cả</Option>
            <Option value="Pending">Chờ xử lý</Option>
            <Option value="Approved">Đã chấp nhận</Option>
            <Option value="Rejected">Đã từ chối</Option>
          </Select>
        </Box>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: 200 }}>
            <CircularProgress size={50} />
          </Box>
        ) : requests.length === 0 ? (
          <Box className="manage-visit-day-change-request-no-requests-message">
            <Typography variant="h6" color="textSecondary">
              Không có yêu cầu đổi lịch hẹn nào
            </Typography>
          </Box>
        ) : (
          <TableContainer component={Paper} className="manage-visit-day-change-request-table-container">
            <Table sx={{ minWidth: 750 }} aria-label="visit day change request table">
              <TableHead>
                <TableRow>
                  {requestColumns.map((column) => (
                    <TableCell key={column.key} className="manage-visit-day-change-request-table-header">
                      {column.title}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {requests.map((request) => (
                  <TableRow key={request.changeRequestId}>
                    {requestColumns.map((column) => (
                      <TableCell
                        key={`${request.changeRequestId}-${column.key}`}
                        className="manage-visit-day-change-request-table-cell"
                      >
                        {column.render
                          ? column.render(request[column.dataIndex], request)
                          : request[column.dataIndex] || "N/A"}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Modal Xử lý Yêu Cầu */}
        <Modal
          title="Xử lý Yêu Cầu Đổi Lịch Hẹn"
          open={isEditModalOpen}
          onCancel={handleEditCancel}
          footer={null}
        >
          <Form form={editRequestForm} layout="vertical" onFinish={handleRejectSubmit}>
            {selectedRequest && (
              <>
                <Typography component="span" fontWeight="bold">ID Yêu Cầu: </Typography>
                <Typography component="span">{selectedRequest.changeRequestId}</Typography>
                <br />
                <Typography component="span" fontWeight="bold">Ngày Yêu Cầu: </Typography>
                <Typography component="span">
                  {selectedRequest.requestedDate
                    ? moment(selectedRequest.requestedDate).format("DD/MM/YYYY")
                    : "N/A"}
                </Typography>
                <br />
                <Typography component="span" fontWeight="bold">Lý Do: </Typography>
                <Typography component="span">{selectedRequest.reason || "N/A"}</Typography>
                <br />
              </>
            )}
            {rejectReasonVisible && (
              <Form.Item
                name="staffNotes"
                label="Lý do từ chối"
                rules={[{ required: true, message: "Vui lòng nhập lý do từ chối" }]}
              >
                <Input.TextArea className="manage-visit-day-change-request-input" rows={3} />
              </Form.Item>
            )}
            <Form.Item style={{ marginBottom: 0 }}>
              <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
                <AntButton
                  onClick={handleRejectRequest}
                  className="manage-visit-day-change-request-button"
                >
                  Từ Chối
                </AntButton>
                {rejectReasonVisible && (
                  <AntButton
                    type="primary"
                    htmlType="submit"
                    className="manage-visit-day-change-request-primary-button"
                  >
                    Ok
                  </AntButton>
                )}
                {!isRejectButtonClicked && (
                  <AntButton
                    type="primary"
                    onClick={handleApproveRequest}
                    className="manage-visit-day-change-request-primary-button"
                  >
                    Đồng Ý (Chấp Nhận)
                  </AntButton>
                )}
                <AntButton
                  onClick={handleEditCancel}
                  className="manage-visit-day-change-request-button"
                >
                  Hủy
                </AntButton>
              </Box>
            </Form.Item>
          </Form>
        </Modal>
      </MainContent>
    </LayoutStaff>
  );
};

export default ManageVisitDayChangeRequest;