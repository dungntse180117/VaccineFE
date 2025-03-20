import React, { useState, useEffect } from "react";
import {
    Layout,
    Breadcrumb,
    message,
    Modal,
    Button,
    Form,
    Input,
    DatePicker,
    Table,
    Select,
} from "antd";
import moment from "moment";
import AppHeader from "../../components/Header/Header";
import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper"; // Thêm import Paper
import { useParams } from 'react-router-dom';
import "./PatientVisitManager.css";
import {
    getVisitsByPatientId,
    createVisitDayChangeRequest,
    getVisitDayChangeRequestsByVisitId,
} from "../../config/axios";

// FullCalendar Imports
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import "@fullcalendar/core/index.js";
import "@fullcalendar/daygrid/index.js";

const { Content } = Layout;
const { TextArea } = Input;
const { Option } = Select;
const drawerWidth = 200;

const MainContent = styled(Box)(({ theme }) => ({
    flexGrow: 1,
    padding: theme.spacing(3),
    overflow: "auto",
    width: '100%',
}));

const PatientVisitManager = () => {
    const [visits, setVisits] = useState([]);
    const [loading, setLoading] = useState(true);
    const { patientId } = useParams();
    const [selectedDate, setSelectedDate] = useState(moment());
    const [selectedVisit, setSelectedVisit] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isChangeDateModalVisible, setIsChangeDateModalVisible] = useState(false);
    const [changeRequests, setChangeRequests] = useState([]);
    const [form] = Form.useForm();

    useEffect(() => {
        fetchVisits();
    }, [selectedDate, patientId]);

    const fetchVisits = async () => {
        setLoading(true);
        try {
            const response = await getVisitsByPatientId(patientId);
            setVisits(response.data);
            console.log("Visits after fetch:", response.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching visits:", error);
            message.error("Error fetching visits");
            setLoading(false);
        }
    };

    const fetchChangeRequests = async (visitId) => {
        try {
            const response = await getVisitDayChangeRequestsByVisitId(visitId);
            setChangeRequests(response.data);
        } catch (error) {
            console.error("Error fetching change requests:", error);
            message.error("Không thể tải danh sách yêu cầu thay đổi ngày tiêm");
        }
    };

    // Tạo sự kiện cho FullCalendar
    const calendarEvents = visits.map((visit) => {
        if (!visit || !visit.status || !visit.visitDate) {
            console.error("Invalid visit data:", visit);
            return null;
        }
        return {
            title: `${visit.status} ${visit.notes || ""}`,
            start: visit.visitDate,
            extendedProps: {
                visitId: visit.visitID,
            },
        };
    }).filter(event => event !== null);

    const handleDayCellClassNames = (args) => {
        if (!args || !args.date) return [];

        const cellDate = moment(args.date).format("YYYY-MM-DD");
        const visitForCell = visits.find((visit) => moment(visit.visitDate).format("YYYY-MM-DD") === cellDate);

        if (visitForCell) {
            if (visitForCell.status === "Đã tiêm") {
                return ["fc-day-green"];
            } else if (visitForCell.status === "Chưa tiêm") {
                return ["fc-day-red"];
            }
        }
        return [];
    };

    // Xử lý khi click vào sự kiện trên calendar
    const handleEventClick = (eventInfo) => {
        const visitIdFromEvent = eventInfo.event.extendedProps.visitId;
        const visit = visits.find(v => v.visitID === visitIdFromEvent);

        if (visit) {
            setSelectedVisit(visit);
            setIsModalVisible(true);
            fetchChangeRequests(visitIdFromEvent);
        } else {
            console.error("Visit not found for event:", eventInfo.event);
            message.error("Không tìm thấy thông tin thăm khám");
        }
    };

    // Xử lý khi nhấn nút "Thay đổi ngày tiêm"
    const handleChangeDateClick = () => {
        setIsChangeDateModalVisible(true);
    };

    // Xử lý khi gửi yêu cầu thay đổi ngày tiêm
    const handleSubmitChangeDate = async (values) => {
        const { visitId, requestedDate, reason } = values;

        if (!visitId) {
            message.error("Vui lòng chọn lần thăm khám");
            return;
        }

        try {
            await createVisitDayChangeRequest({
                VisitID: visitId,
                PatientId: patientId,
                RequestedDate: values.requestedDate.format("YYYY-MM-DD"),
                Reason: values.reason,
            });
            message.success("Yêu cầu thay đổi ngày tiêm đã được gửi thành công");
            setIsChangeDateModalVisible(false);
            form.resetFields();
            fetchChangeRequests(visitId);
        } catch (error) {
            console.error("Error creating change request:", error);
            message.error("Gửi yêu cầu thay đổi ngày tiêm thất bại");
        }
    };

    // Hiển thị thông tin chi tiết của lần thăm khám
    const renderVisitDetails = (visit) => {
        if (!visit) return null;
        return (
            <div>
                <h3>Thông tin thăm khám</h3>
                <p><strong>Bệnh nhân:</strong> {visit.patientName || "N/A"}</p>
                <p><strong>Số điện thoại:</strong> {visit.patientPhone || "N/A"}</p>
                <p><strong>Ngày thăm khám:</strong> {moment(visit.visitDate).format('DD/MM/YYYY')}</p>
                <p><strong>Trạng thái:</strong> {visit.status || "N/A"}</p>
                <p><strong>Ghi chú:</strong> {visit.notes || "N/A"}</p>
            </div>
        );
    };

    // Cột cho bảng hiển thị yêu cầu thay đổi ngày tiêm
    const columns = [
        {
            title: "Ngày yêu cầu",
            dataIndex: "requestedDateAt",
            key: "requestedDateAt",
            render: (date) => moment(date).format("DD/MM/YYYY HH:mm"),
        },
        {
            title: "Ngày muốn thay đổi",
            dataIndex: "requestedDate",
            key: "requestedDate",
            render: (date) => moment(date).format("DD/MM/YYYY"),
        },
        {
            title: "Lý do",
            dataIndex: "reason",
            key: "reason",
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
        },
        {
            title: "Phản hồi",
            dataIndex: "staffNotes",
            key: "staffNotes",
        },
    ];

    return (
        <Layout
            className="patient-visit-manager-layout"
            style={{ minHeight: "100vh" }}
        >
            <AppHeader />
            <Layout>
                <Content
                    className="patient-visit-manager-content"
                    style={{
                        padding: "24px",
                        marginLeft: drawerWidth,
                        display: "flex",
                        flexDirection: "column",
                    }}
                >
                    <MainContent>
                        <Paper className="content-container">
                            <Breadcrumb
                                items={[
                                    { title: 'Trang chủ' },
                                    { title: 'Lịch Hẹn Tiêm của Bệnh Nhân' },
                                ]}
                            />
                            <h2>Lịch hẹn tiêm</h2>
                            <Button
                                type="primary"
                                onClick={handleChangeDateClick}
                                className="change-date-button"
                            >
                                Thay đổi ngày tiêm
                            </Button>
                            <div className="calendar-container">
                                <FullCalendar
                                    plugins={[dayGridPlugin, interactionPlugin]}
                                    initialView="dayGridMonth"
                                    events={calendarEvents}
                                    eventContent={(eventInfo) => (
                                        <div>
                                            <strong>{eventInfo.event.title}</strong>
                                            <br />
                                            <small>{moment(eventInfo.event.start).format("DD/MM/YYYY")}</small>
                                        </div>
                                    )}
                                    eventClick={handleEventClick}
                                    dayCellClassNames={handleDayCellClassNames}
                                />
                            </div>
                        </Paper>
                    </MainContent>
                </Content>
            </Layout>

            {/* Modal hiển thị thông tin chi tiết */}
            <Modal
                title="Thông tin thăm khám"
                visible={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={[
                    <Button key="close" onClick={() => setIsModalVisible(false)}>
                        Đóng
                    </Button>,
                ]}
            >
                {renderVisitDetails(selectedVisit)}
                <h3>Yêu cầu thay đổi ngày tiêm đã được phản hồi</h3>
                <Table
                    columns={columns}
                    dataSource={changeRequests.filter(request => request.status !== "Pending")}
                    rowKey="changeRequestId"
                    pagination={false}
                />
            </Modal>

            {/* Modal thay đổi ngày tiêm */}
            <Modal
                title="Thay đổi ngày tiêm"
                visible={isChangeDateModalVisible}
                onCancel={() => setIsChangeDateModalVisible(false)}
                footer={null}
            >
                <Form form={form} onFinish={handleSubmitChangeDate}>
                    <Form.Item
                        name="visitId"
                        label="Chọn lần thăm khám"
                        rules={[{ required: true, message: "Vui lòng chọn lần thăm khám" }]}
                    >
                        <Select placeholder="Chọn lần thăm khám">
                            {visits.map((visit) => (
                                <Option key={visit.visitID} value={visit.visitID}>
                                    {moment(visit.visitDate).format("DD/MM/YYYY")} - {visit.status}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="requestedDate"
                        label="Ngày muốn thay đổi"
                        rules={[{ required: true, message: "Vui lòng chọn ngày" }]}
                    >
                        <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} />
                    </Form.Item>

                    <Form.Item
                        name="reason"
                        label="Lý do"
                        rules={[{ required: true, message: "Vui lòng nhập lý do" }]}
                    >
                        <TextArea rows={4} />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit">
                            Gửi yêu cầu
                        </Button>
                        <Button htmlType="button" onClick={() => setIsChangeDateModalVisible(false)} style={{ marginLeft: 8 }}>
                            Hủy
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </Layout>
    );
};

export default PatientVisitManager;