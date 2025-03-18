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
import {
    getVisitDayChangeRequests,
    updateVisitDayChangeRequest,
    deleteVisitDayChangeRequest,
    createVisitDayChangeRequest,
    getVisitDayChangeRequestsByVisitId,
} from "../../config/axios";
import "./ManageVisitDayChangeRequest.css"; // Import CSS file
import LayoutStaff from "../../components/Layout/LayoutStaff";

const { Option } = Select;
const { Text } = Typography;

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
                filteredRequests = allRequests.filter(
                    (request) => request.status === statusFilter
                );
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

            message.success("Yêu cầu đổi lịch hẹn đã được chấp nhận");
            fetchVisitDayChangeRequests();
            handleEditCancel();
        } catch (error) {
            console.error("Error approving visit day change request:", error);
            message.error(
                `Error approving visit day change request: ${error.message}`
            );
        } finally {
            setLoading(false);
        }
    };

    const handleRejectRequest = () => {
        setRejectReasonVisible(true);
        setIsRejectButtonClicked(true);
    };

    const handleRejectSubmit = async (values) => {
        console.log("handleRejectSubmit called", values); // Debug log: Function called
        setLoading(true);
        try {
            console.log("changeRequestId to update:", selectedRequest.changeRequestId); // Debug log: changeRequestId
            console.log("Data being sent to API:", {
                status: "Rejected",
                staffNotes: values.staffNotes,
            }); // Debug log: Data payload
            await updateVisitDayChangeRequest(selectedRequest.changeRequestId, {
                status: "Rejected",
                staffNotes: values.staffNotes,
            });

            message.success("Yêu cầu đổi lịch hẹn đã bị từ chối");
            fetchVisitDayChangeRequests();
            handleEditCancel();
        } catch (error) {
            console.error("Error rejecting visit day change request:", error);
            message.error(
                `Error rejecting visit day change request: ${error.message}`
            );
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
            message.error(
                `Error deleting visit day change request: ${error.message}`
            );
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
            render: (text) => (text ? moment(text).format("YYYY-MM-DD") : "N/A"),
        },
        { title: "Reason", dataIndex: "reason", key: "reason" },
        { title: "Status", dataIndex: "status", key: "status" },
        { title: "Staff Notes", dataIndex: "staffNotes", key: "staffNotes" },
        {
            title: "Requested At",
            dataIndex: "requestedDateAt",
            key: "requestedDateAt",
            render: (text) =>
                text ? moment(text).format("YYYY-MM-DD HH:mm:ss") : "N/A",
        },
        {
             title: "Actions",
             key: "actions",
             render: (text, record) => (
                 <TableCell className="manage-visit-day-change-request-table-cell">
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
                 </TableCell>
             ),
        },
    ];

    return (
        <LayoutStaff>
            <Box>
                <Breadcrumb
                    className="manage-visit-day-change-request-breadcrumb"
                    items={[
                        {
                            title: "Trang chủ",
                        },
                        {
                            title: "Quản lý Yêu Cầu Đổi Lịch Hẹn",
                        },
                    ]}
                />
            </Box>

            <MainContent className="manage-visit-day-change-request-content">
                <h2 className="manage-visit-day-change-request-header">
                    Quản lý Yêu Cầu Đổi Lịch Hẹn Tiêm
                </h2>

                <div>
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
                </div>

                {requests.length === 0 ? (
                    <Box className="manage-visit-day-change-request-no-requests-message">
                        <Typography variant="h6" color="textSecondary">
                            Không có yêu cầu đổi lịch hẹn nào
                        </Typography>
                    </Box>
                ) : (
                    <TableContainer
                        component={Paper}
                        className="manage-visit-day-change-request-table-container"
                    >
                        <Table
                            sx={{ minWidth: 750 }}
                            aria-label="simple table"
                            className="manage-visit-day-change-request-table"
                        >
                            <TableHead>
                                <TableRow>
                                    {requestColumns.map((column) => (
                                        <TableCell
                                            key={column.key}
                                            className="manage-visit-day-change-request-table-header"
                                        >
                                            {column.title}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {requests.map((request, index) => (
                                    <TableRow
                                        key={request.changeRequestId}
                                        sx={{
                                            "&:last-child td, &:last-child th": {
                                                border: 0,
                                            },
                                        }}
                                        className={
                                            index % 2 === 1
                                                ? "manage-visit-day-change-request-table-row-even"
                                                : ""
                                        }
                                    >
                                        {requestColumns.slice(0, requestColumns.length - 1).map((column) => ( // Exclude 'Actions' column from default rendering
                                            <TableCell
                                                key={`${request.changeRequestId}-${column.key}`}
                                                className="manage-visit-day-change-request-table-cell"
                                            >
                                                {typeof column.render === "function"
                                                    ? column.render(
                                                          request[column.dataIndex],
                                                          request
                                                      )
                                                    : request[column.dataIndex]}
                                            </TableCell>
                                        ))}
                                        {requestColumns[requestColumns.length - 1].render(null, request)} {/* Render 'Actions' column */}
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
                    className="manage-visit-day-change-request-modal"
                >
                    <Form
                        form={editRequestForm}
                        layout="vertical"
                        onFinish={handleRejectSubmit} // Form submit will call handleRejectSubmit
                    >
                        {rejectReasonVisible && (
                            <Form.Item
                                name="staffNotes"
                                label="Lý do từ chối"
                                rules={[
                                    {
                                        required: rejectReasonVisible,
                                        message: "Vui lòng nhập lý do từ chối",
                                    },
                                ]}
                                className="manage-visit-day-change-request-form-item"
                            >
                                <Input.TextArea className="manage-visit-day-change-request-input" />
                            </Form.Item>
                        )}

                        <Form.Item style={{ marginBottom: 0 }}>
                            <div style={{ textAlign: "right" }}>
                                <AntButton
                                    key="reject"
                                    onClick={handleRejectRequest}
                                    className="manage-visit-day-change-request-button manage-visit-day-change-request-modal-footer-button"
                                >
                                    Từ chối
                                </AntButton>
                                {rejectReasonVisible && ( // Show "Đồng ý (Từ chối)" button only when reject reason is visible
                                    <AntButton
                                        key="submitReject"
                                        type="primary"
                                        htmlType="submit" // This button will submit the Form and call onFinish={handleRejectSubmit}
                                        className="manage-visit-day-change-request-primary-button manage-visit-day-change-request-button manage-visit-day-change-request-modal-footer-button"
                                    >
                                        Đồng ý (Từ chối)
                                    </AntButton>
                                )}
                                {!isRejectButtonClicked && ( // Show "Đồng ý (Chấp nhận)" button only when reject button is NOT clicked
                                    <AntButton
                                        key="approve"
                                        type="primary"
                                        onClick={handleApproveRequest}
                                        className="manage-visit-day-change-request-primary-button manage-visit-day-change-request-button manage-visit-day-change-request-modal-footer-button"
                                    >
                                        Đồng ý (Chấp nhận)
                                    </AntButton>
                                )}
                                <AntButton
                                    key="cancel"
                                    onClick={handleEditCancel}
                                    className="manage-visit-day-change-request-button manage-visit-day-change-request-modal-footer-button"
                                >
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