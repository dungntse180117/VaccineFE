import React, { useState, useEffect } from "react";
import {
    Breadcrumb,
    message,
    Modal,
    Form,
    Input,
    Button as AntButton,
    Select,
    Typography,
} from "antd";
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
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import  {
    getVisitDayChangeRequests,
    updateVisitDayChangeRequest,
    deleteVisitDayChangeRequest,
} from "../../config/axios";
import "./ManageVisitDayChangeRequest.css";
import LayoutStaff from "../../components/Layout/LayoutStaff";

const { Option } = Select;
const { Text } = Typography;

const MainContent = styled(Box)(({ theme }) => ({
    flexGrow: 1,
    padding: theme.spacing(3),
    overflow: "auto",
    width: '100%',
}));

const ManageVisitDayChangeRequest = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editRequestForm] = Form.useForm();
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [rejectReasonVisible, setRejectReasonVisible] = useState(false);
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
                filteredRequests = allRequests.filter(request => request.status === statusFilter);
            }

            setRequests(filteredRequests);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching visit day change requests:", error);
            message.error("Error fetching visit day change requests");
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
        editRequestForm.resetFields();
    };

    const handleEditCancel = () => {
        setIsEditModalOpen(false);
        setSelectedRequest(null);
        editRequestForm.resetFields();
        setRejectReasonVisible(false);
    };

    const handleApproveRequest = async () => {
        setLoading(true);
        try {
            await updateVisitDayChangeRequest(selectedRequest.changeRequestId, {
                status: "Approved",
                staffNotes: ""
            });

            message.success("Yêu cầu đổi lịch hẹn đã được chấp nhận");
            fetchVisitDayChangeRequests();
            handleEditCancel();
        } catch (error) {
            console.error("Error approving visit day change request:", error);
            message.error(`Error approving visit day change request: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleRejectRequest = () => {
        setRejectReasonVisible(true);
    };

    const handleRejectSubmit = async (values) => {
        setLoading(true);
        try {
            await updateVisitDayChangeRequest(selectedRequest.changeRequestId, {
                status: "Rejected",
                staffNotes: values.staffNotes
            });

            message.success("Yêu cầu đổi lịch hẹn đã bị từ chối");
            fetchVisitDayChangeRequests();
            handleEditCancel();
        } catch (error) {
            console.error("Error rejecting visit day change request:", error);
            message.error(`Error rejecting visit day change request: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };


    const handleDeleteRequest = async (record) => {
        try {
            setLoading(true);
            await deleteVisitDayChangeRequest(record.changeRequestId);

            message.success("Visit day change request deleted successfully");
            fetchVisitDayChangeRequests();
        } catch (error) {
            console.error("Error deleting visit day change request:", error);
            message.error(`Error deleting visit day change request: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const requestColumns = [
        {
            title: "Change Request ID",
            dataIndex: "changeRequestId",
            key: "changeRequestId",
        },
        {
            title: "Visit ID",
            dataIndex: "visitID",
            key: "visitID",
        },
        {
            title: "Patient ID",
            dataIndex: "patientId",
            key: "patientId",
        },
        {
            title: "Requested Date",
            dataIndex: "requestedDate",
            key: "requestedDate",
            render: (text) => text ? moment(text).format("YYYY-MM-DD") : "N/A",
        },
        { title: "Reason", dataIndex: "reason", key: "reason" },
        { title: "Status", dataIndex: "status", key: "status" },
        { title: "Staff Notes", dataIndex: "staffNotes", key: "staffNotes" },
        {
            title: "Requested At",
            dataIndex: "requestedDateAt",
            key: "requestedDateAt",
            render: (text) => text ? moment(text).format("YYYY-MM-DD HH:mm:ss") : "N/A",
        },
    ];

    return (
        <LayoutStaff> {/* Wrap the entire content with Layout component */}
            <Box>
                <Breadcrumb style={{ margin: "16px 0" }}
                    items={[
                        {
                            title: 'Trang chủ',
                        },
                        {
                            title: 'Quản lý Yêu Cầu Đổi Lịch Hẹn',
                        },
                    ]}
                />
            </Box>

            <MainContent>
                <h2>Quản lý Yêu Cầu Đổi Lịch Hẹn Tiêm</h2>

                <div>
                    <Select
                        defaultValue="All"
                        style={{ width: 150 }}
                        onChange={handleStatusFilterChange}
                    >
                        <Option value="All">Tất cả</Option>
                        <Option value="Pending">Chờ xử lý</Option>
                        <Option value="Approved">Đã chấp nhận</Option>
                        <Option value="Rejected">Đã từ chối</Option>
                    </Select>
                </div>

                {requests.length === 0 ? (
                    <Box display="flex" justifyContent="center" alignItems="center" height={200} flexDirection="column">
                        <Typography variant="h6" color="textSecondary">
                            Không có yêu cầu đổi lịch hẹn nào
                        </Typography>
                    </Box>
                ) : (
                    <TableContainer component={Paper}>
                        <Table sx={{ minWidth: 750 }} aria-label="simple table">
                            <TableHead>
                                <TableRow>
                                    {requestColumns.map((column) => (
                                        <TableCell key={column.key}>{column.title}</TableCell>
                                    ))}
                                    <TableCell>Hành động</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {requests.map((request) => (
                                    <TableRow
                                        key={request.changeRequestId}
                                        sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                                    >
                                        {requestColumns.map((column) => (
                                            <TableCell key={`${request.changeRequestId}-${column.key}`}>
                                                {typeof column.render === 'function' ? column.render(request[column.dataIndex], request) : request[column.dataIndex]}
                                            </TableCell>
                                        ))}
                                        <TableCell>
                                            <IconButton aria-label="edit" onClick={() => showEditModal(request)}>
                                                <EditIcon />
                                            </IconButton>
                                            <IconButton aria-label="delete" onClick={() => handleDeleteRequest(request)}>
                                                <DeleteIcon />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}

                {/* Edit Request Modal */}
                <Modal
                    title="Xử lý Yêu Cầu Đổi Lịch Hẹn"
                    open={isEditModalOpen}
                    onCancel={handleEditCancel}
                    footer={null}
                >
                    <Form
                        form={editRequestForm}
                        layout="vertical"
                        onFinish={handleRejectSubmit}
                    >
                        {rejectReasonVisible && (
                            <Form.Item
                                name="staffNotes"
                                label="Lý do từ chối"
                                rules={[{ required: rejectReasonVisible, message: "Vui lòng nhập lý do từ chối" }]}
                            >
                                <Input.TextArea />
                            </Form.Item>
                        )}

                        <Form.Item style={{ marginBottom: 0 }}>
                            <div style={{ textAlign: 'right' }}>
                                <AntButton key="reject" onClick={handleRejectRequest} style={{ marginRight: 8 }} >
                                    Từ chối
                                </AntButton>
                                <AntButton key="approve" type="primary" onClick={handleApproveRequest} style={{ marginRight: 8 }}>
                                    Đồng ý
                                </AntButton>
                                <AntButton key="cancel" onClick={handleEditCancel}>
                                    Hủy
                                </AntButton>
                            </div>
                        </Form.Item>
                    </Form>
                </Modal>
            </MainContent>
        </LayoutStaff>
    );
};

export default ManageVisitDayChangeRequest;