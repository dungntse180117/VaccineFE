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
import { DatePicker } from 'antd';
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
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import DoneIcon from '@mui/icons-material/Done';
import HistoryIcon from '@mui/icons-material/History';
import api, { getVisits, createVisit, updateVisit, deleteVisit, updateVisitStatus } from "../../config/axios";
import "./ManageVisit.css";
import { useNavigate } from 'react-router-dom';

const { Content } = Layout;
const drawerWidth = 200;

const MainContent = styled(Box)(({ theme }) => ({
    flexGrow: 1,
    padding: theme.spacing(3),
    overflow: "auto",
    width: '100%',
}));

const ManageVisit = () => {
    const [visits, setVisits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(moment());
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [addVisitForm] = Form.useForm();
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
            let allVisits = response.data;

            const filteredVisits = allVisits.filter((visit) => {
                if (!visit.visitDate) return false;
                return moment(visit.visitDate).isSame(selectedDate, 'day');
            });

            setVisits(filteredVisits);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching visits:", error);
            message.error("Error fetching visits");
            setLoading(false);
        }
    };

    const handleDateChange = (date) => {
        setSelectedDate(date);
        setIsDatePickerVisible(false);
    };

    const showAddModal = () => {
        setIsAddModalOpen(true);
    };

    const handleAddCancel = () => {
        setIsAddModalOpen(false);
        addVisitForm.resetFields();
    };

    const handleAddVisit = async (values) => {
        try {
            setLoading(true);
            await createVisit({
                ...values,
                visitDate: values.visitDate.format("YYYY-MM-DD"),
            });

            message.success("Visit created successfully");
            fetchVisits();
            handleAddCancel();
        } catch (error) {
            console.error("Error adding visit:", error);
            message.error(`Error adding visit: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const showEditModal = (record) => {
        setSelectedVisit(record);
        setIsEditModalOpen(true);
        editVisitForm.setFieldsValue({
            visitDate: moment(record.visitDate),
            notes: record.notes,
            status: record.status,
            appointmentID: record.appointmentID
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
                visitID: selectedVisit.visitID
            });

            message.success("Visit updated successfully");
            fetchVisits();
            handleEditCancel();
        } catch (error) {
            console.error("Error updating visit:", error);
            message.error(`Error updating visit: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteVisit = async (record) => {
        Modal.confirm({
            title: 'Xác nhận xóa',
            content: 'Bạn có chắc chắn muốn xóa lịch hẹn này không?',
            onOk: async () => {
                try {
                    setLoading(true);
                    await deleteVisit(record.visitID);

                    message.success("Visit deleted successfully");
                    fetchVisits();
                } catch (error) {
                    console.error("Error deleting visit:", error);
                    message.error(`Error deleting visit: ${error.message}`);
                } finally {
                    setLoading(false);
                }
            },
            onCancel() {
                // Không làm gì nếu người dùng hủy bỏ
            },
        });
    };

    const handleUpdateVisitStatus = (record) => {
        console.log("handleUpdateVisitStatus function called for visit ID:", record.visitID);
        Modal.confirm({
            title: 'Xác nhận cập nhật trạng thái',
            content: 'Bạn có muốn cập nhật trạng thái thành "Đã tiêm"?',
            onOk: async () => {
                setLoading(true);
                try {
                    await updateVisitStatus(record.visitID, { status: "Đã tiêm" });
                    message.success("Cập nhật trạng thái thành công");
                    fetchVisits();
                } catch (error) {
                    console.error("Error updating visit status:", error);
                    message.error("Cập nhật trạng thái thất bại");
                } finally {
                    setLoading(false);
                }
            },
            onCancel() { },
        });
    };

    const visitColumns = [
        {
            title: "Visit Date",
            dataIndex: "visitDate",
            key: "visitDate",
            render: (text) => text ? moment(text).format("YYYY-MM-DD") : "N/A",
        },
        { title: "Notes", dataIndex: "notes", key: "notes" },
        { title: "Status", dataIndex: "status", key: "status" },
        {
            title: "Tên Người tiêm",
            dataIndex: "patientName",
            key: "patientName",
        },
        {
            title: "Số điện thoại",
            dataIndex: "patientPhone",
            key: "patientPhone",
        },
        {
            title: "Lịch sử tiêm vaccine",
            key: "vaccinationHistoryAction",
            render: (text, record) => (
                <IconButton
                    aria-label="view-vaccination-history"
                    onClick={() => navigate(`/visit-history-vaccine/${record.visitID}`)}
                >
                    <HistoryIcon />
                </IconButton>
            ),
        },
        {
            title: "Hành động",
            key: "action",
            render: (text, record) => (
                <TableCell>
                    <IconButton aria-label="edit" onClick={() => showEditModal(record)}>
                        <EditIcon />
                    </IconButton>
                    <IconButton aria-label="delete" onClick={() => handleDeleteVisit(record)}>
                        <DeleteIcon />
                    </IconButton>
                    <IconButton
                        aria-label="vaccinated"
                        onClick={() => handleUpdateVisitStatus(record)}
                    >
                        <DoneIcon />
                    </IconButton>
                </TableCell>
            ),
        },
    ];

    const goToPreviousDay = () => {
        setSelectedDate(moment(selectedDate).subtract(1, 'day'));
    };

    const goToNextDay = () => {
        setSelectedDate(moment(selectedDate).add(1, 'day'));
    };

    const handleOpenDatePicker = () => {
        setIsDatePickerVisible(true);
    };

    const handleCloseDatePicker = () => {
        setIsDatePickerVisible(false);
    };

    const datePickerContent = (
        <DatePicker
            value={selectedDate}
            format="YYYY-MM-DD"
            onChange={handleDateChange}
            onOpenChange={(open) => {
                if (!open) handleCloseDatePicker();
            }}
        />
    );

    return (
        <Layout
            className="manage-visit-layout"
            style={{ minHeight: "100vh" }}
        >
            <AppHeader />
            <Layout>
                <StaffSideBar />
                <Content
                    className="manage-visit-content"
                    style={{
                        padding: "24px",
                        marginLeft: drawerWidth,
                        display: "flex",
                        flexDirection: "column",
                    }}
                >
                    <Box>
                        <Breadcrumb style={{ margin: "16px 0" }}>
                            <Breadcrumb.Item>Trang chủ</Breadcrumb.Item>
                            <Breadcrumb.Item>Quản lý Lịch Hẹn Tiêm</Breadcrumb.Item>
                        </Breadcrumb>
                    </Box>

                    <MainContent>
                        <h2>Quản lý Lịch Hẹn Tiêm</h2>

                        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box display="flex" alignItems="center">
                                <Button onClick={goToPreviousDay}>Ngày trước</Button>
                                <Popover
                                    content={datePickerContent}
                                    trigger="click"
                                    open={isDatePickerVisible}
                                    onOpenChange={handleOpenDatePicker}
                                >
                                    <Button style={{ margin: '0 10px' }}>
                                        {selectedDate.format("YYYY-MM-DD")}
                                    </Button>
                                </Popover>
                                <Button onClick={goToNextDay}>Ngày sau</Button>
                            </Box>
                        </Box>

                        {visits.length === 0 ? (
                            <Box display="flex" justifyContent="center" alignItems="center" height={200} flexDirection="column">
                                <Typography variant="h6" color="textSecondary">
                                    Không có lịch tiêm nào hôm nay
                                </Typography>
                            </Box>
                        ) : (
                            <TableContainer component={Paper}>
                                <Table sx={{ minWidth: 650 }} aria-label="simple table">
                                    <TableHead>
                                        <TableRow>
                                            {visitColumns.map((column) => (
                                                <TableCell key={column.key}>{column.title}</TableCell>
                                            ))}
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {visits.map((visit) => (
                                            <TableRow
                                                key={visit.visitID}
                                                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                                            >
                                                {visitColumns.map((column) => (
                                                    <TableCell key={`${visit.visitID}-${column.key}`}>
                                                        {typeof column.render === 'function' ? column.render(visit[column.dataIndex], visit) : visit[column.dataIndex]}
                                                    </TableCell>
                                                ))}
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        )}

                        <Modal
                            title="Chỉnh sửa Lịch Hẹn Tiêm"
                            open={isEditModalOpen}
                            onCancel={handleEditCancel}
                            footer={null}
                        >
                            <Form
                                form={editVisitForm}
                                layout="vertical"
                                onFinish={handleEditVisit}
                            >
                                <Form.Item
                                    name="appointmentID"
                                    label="Mã Lịch Hẹn (Appointment ID)"
                                    rules={[{ required: true, message: "Vui lòng nhập Mã Lịch Hẹn" }]}
                                >
                                    <Input type="number" disabled />
                                </Form.Item>
                                <Form.Item
                                    name="visitDate"
                                    label="Ngày Hẹn Tiêm"
                                    rules={[{ required: true, message: "Vui lòng chọn Ngày Hẹn Tiêm" }]}
                                >
                                    <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD" />
                                </Form.Item>
                                <Form.Item name="notes" label="Ghi Chú">
                                    <Input.TextArea />
                                </Form.Item>
                                <Form.Item name="status" label="Trạng Thái">
                                    <Input />
                                </Form.Item>

                                <Form.Item style={{ marginBottom: 0 }}>
                                    <div style={{ textAlign: 'right' }}>
                                        <AntButton type="primary" htmlType="submit" style={{ marginRight: 8 }}>
                                            Lưu
                                        </AntButton>
                                        <AntButton htmlType="button" onClick={handleEditCancel}>
                                            Hủy
                                        </AntButton>
                                    </div>
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