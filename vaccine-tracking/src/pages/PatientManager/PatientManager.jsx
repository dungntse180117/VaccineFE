import React, { useState, useEffect } from "react";
import {
  Layout,
  Form,
  Input,
  Button as AntButton,
  message,
  Breadcrumb,
  Modal,
  DatePicker,
} from "antd";
import moment from "moment";
import AppHeader from "../../components/Header/Header";
import api, {
  createPatient,
  updatePatient,
  deletePatient,
  getAllPatientsByAccountId,
} from "../../config/axios";
import "./PatientManager.css";
import UserSidebar from "../../components/Sidebar/UserSideBar";
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
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from '@mui/icons-material/Visibility'; // Import VisibilityIcon
import { useNavigate } from 'react-router-dom'; // Import useNavigate

const { Content } = Layout;

const drawerWidth = 200;

const MainContent = styled(Box)(({ theme }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  overflow: "auto",
}));

const PatientManager = () => {
  const [form] = Form.useForm();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [addPatientForm] = Form.useForm();
  const [editPatientForm] = Form.useForm();
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate(); // Initialize useNavigate

  useEffect(() => {
    fetchUserData();
  }, []);

  useEffect(() => {
    if (userData) {
      fetchPatients();
    }
  }, [userData]);

  const fetchUserData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const email = localStorage.getItem("email");
      const response = await api.get(`api/Account/email/${email}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      let user = response.data;

      setUserData(user);
      form.setFieldsValue({
        name: user.name,
        phone: user.phone,
        address: user.address,
        email: user.email,
      });
      setLoading(false);
    } catch (error) {
      console.error("Error fetching user data:", error);
      message.error("Error fetching user data");
      setLoading(false);
    }
  };

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const accountId = userData?.accountId;

      if (accountId) {
        const response = await getAllPatientsByAccountId(accountId);
        setPatients(response.data);
      }
    } catch (error) {
      console.error("Error fetching patients:", error);
      message.error("Error fetching patients");
    } finally {
      setLoading(false);
    }
  };

  const showAddModal = () => {
    setIsAddModalVisible(true);
  };

  const handleAddCancel = () => {
    setIsAddModalVisible(false);
    addPatientForm.resetFields();
  };

  const handleAddPatient = async (values) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const accountId = userData.accountId;

      await createPatient({
        ...values,
        accountId: accountId,
        dob: values.dob.format("YYYY-MM-DD"),
      });

      message.success("Patient created successfully");
      fetchPatients();
      handleAddCancel();
    } catch (error) {
      console.error("Error adding patient:", error);
      message.error(`Error adding patient: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const showEditModal = (record) => {
    setSelectedPatient(record);
    setIsEditModalVisible(true);
    editPatientForm.setFieldsValue({
      dob: moment(record.dob, "YYYY-MM-DD"),
      patientName: record.patientName,
      gender: record.gender,
      guardianPhone: record.guardianPhone,
      address: record.address,
      relationshipToAccount: record.relationshipToAccount,
      phone: record.phone, 
    });
  };

  const handleEditCancel = () => {
    setIsEditModalVisible(false);
    setSelectedPatient(null);
    editPatientForm.resetFields();
  };

  const handleEditPatient = async (values) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      await updatePatient(selectedPatient.patientId, {
        ...values,
        dob: values.dob.format("YYYY-MM-DD"),
      });

      message.success("Patient updated successfully");
      fetchPatients();
      handleEditCancel();
    } catch (error) {
      console.error("Error updating patient:", error);
      message.error(`Error updating patient: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePatient = async (record) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      await deletePatient(record.patientId);

      message.success("Patient deleted successfully");
      fetchPatients();
    } catch (error) {
      console.error("Error deleting patient:", error);
      message.error(`Error deleting patient: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const patientColumns = [
    {
      title: "Họ và tên",
      dataIndex: "patientName",
      key: "patientName",
    },
    {
      title: "Ngày sinh",
      dataIndex: "dob",
      key: "dob",
    },
    {
      title: "Giới tính",
      dataIndex: "gender",
      key: "gender",
    },
    {
      title: "Số điện thoại người thân",
      dataIndex: "guardianPhone",
      key: "guardianPhone",
    },
    {
      title: "Địa chỉ",
      dataIndex: "address",
      key: "address",
    },
    {
      title: "Quan hệ",
      dataIndex: "relationshipToAccount",
      key: "relationshipToAccount",
    },
    {
      title: "Số điện thoại",
      dataIndex: "phone",
      key: "phone",
    },
    // ADD NEW "Xem Lịch Hẹn" COLUMN HERE:
    {
      title: "Lịch hẹn tiêm",
      key: "visitsAction",
      render: (text, record) => ( // render function for the new column
        <IconButton
          aria-label="view-visits"
          onClick={() => navigate(`/patient-visits/${record.patientId}`)} // Navigate to PatientVisitManager
        >
          <VisibilityIcon />  {/* VisibilityIcon for "view" */}
        </IconButton>
      ),
    },
    {
      title: "Hành động",
      key: "action",
      render: (text, record) => (
        <>
          <IconButton aria-label="edit" onClick={() => showEditModal(record)}>
            <EditIcon />
          </IconButton>
          <IconButton
            aria-label="delete"
            onClick={() => handleDeletePatient(record)}
          >
            <DeleteIcon />
          </IconButton>
        </>
      ),
    },
  ];

  return (
    <Layout
      className="patient-manager-layout"
      style={{ minHeight: "100vh" }} // Added minHeight
    >
      <AppHeader />
      <Layout>
        <UserSidebar />

        <Content
          style={{
            padding: "24px",
            marginLeft: drawerWidth,
            display: "flex", // Added flex display
            flexDirection: "column", // Added flex direction
          }}
        >
          <Box>
            <Breadcrumb style={{ margin: "16px 0" }}>
              <Breadcrumb.Item>Trang chủ</Breadcrumb.Item>
              <Breadcrumb.Item>Quản lý hồ sơ tiêm chủng</Breadcrumb.Item>
            </Breadcrumb>
          </Box>

          <MainContent>
            <h2>Quản lý hồ sở tiêm chủng</h2>

            <Box sx={{ mb: 2 }}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={showAddModal}
              >
                Thêm hồ sơ
              </Button>
            </Box>

            <TableContainer component={Paper}>
              <Table sx={{ minWidth: 650 }} aria-label="simple table">
                <TableHead>
                  <TableRow>
                    <TableCell>Họ và tên</TableCell>
                    <TableCell>Ngày sinh</TableCell>
                    <TableCell>Giới tính</TableCell>
                    <TableCell>Số điện thoại người thân</TableCell>
                    <TableCell>Địa chỉ</TableCell>
                    <TableCell>Quan hệ</TableCell>
                    <TableCell>Số điện thoại</TableCell>
                    <TableCell>Lịch hẹn tiêm</TableCell> {/* New Column Header */}
                    <TableCell>Hành động</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {patients.map((patient) => (
                    <TableRow
                      key={patient.patientId}
                      sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                    >
                      <TableCell component="th" scope="row">
                        {patient.patientName}
                      </TableCell>
                      <TableCell>{patient.dob}</TableCell>
                      <TableCell>{patient.gender}</TableCell>
                      <TableCell>{patient.guardianPhone}</TableCell>
                      <TableCell>{patient.address}</TableCell>
                      <TableCell>{patient.relationshipToAccount}</TableCell>
                      <TableCell>{patient.phone}</TableCell>
                      <TableCell> {/* New "Xem Lịch Hẹn" Button Cell */}
                        <IconButton
                          aria-label="view-visits"
                          onClick={() => navigate(`/patient-visits/${patient.patientId}`)} // Navigate function call
                        >
                          <VisibilityIcon /> {/* Visibility Icon */}
                        </IconButton>
                      </TableCell>
                      <TableCell>
                        <IconButton
                          aria-label="edit"
                          onClick={() => showEditModal(patient)}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          aria-label="delete"
                          onClick={() => handleDeletePatient(patient)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Modal
              title="Tạo Hồ Sơ Tiêm Chủng"
              visible={isAddModalVisible}
              onCancel={handleAddCancel}
            >
              <Form
                form={addPatientForm}
                layout="vertical"
                onFinish={handleAddPatient}
              >
                <Form.Item
                  name="patientName"
                  label="Họ và tên"
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng nhập họ và tên",
                    },
                  ]}
                >
                  <Input />
                </Form.Item>
                <Form.Item
                  name="dob"
                  label="Ngày sinh"
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng nhập ngày sinh",
                    },
                  ]}
                >
                  <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD" />
                </Form.Item>
                <Form.Item name="gender" label="Giới tính">
                  <Input />
                </Form.Item>
                <Form.Item
                  name="guardianPhone"
                  label="Số điện thoại người thân"
                >
                  <Input />
                </Form.Item>
                <Form.Item name="address" label="Địa chỉ">
                  <Input />
                </Form.Item>
                <Form.Item
                  name="relationshipToAccount"
                  label="Mối quan hệ"
                >
                  <Input />
                </Form.Item>
                <Form.Item name="phone" label="Số điện thoại">
                  <Input />
                </Form.Item>
                <Form.Item>
                  <AntButton type="primary" htmlType="submit">
                    Lưu
                  </AntButton>
                  <AntButton htmlType="button" onClick={handleAddCancel}>
                    Hủy
                  </AntButton>
                </Form.Item>
              </Form>
            </Modal>

            <Modal
              title="Chỉnh sửa người thân"
              visible={isEditModalVisible}
              onCancel={handleEditCancel}
            >
              <Form
                form={editPatientForm}
                layout="vertical"
                onFinish={handleEditPatient}
              >
                <Form.Item
                  name="patientName"
                  label="Họ và tên"
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng nhập họ và tên",
                    },
                  ]}
                >
                  <Input />
                </Form.Item>
                <Form.Item
                  name="dob"
                  label="Ngày sinh"
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng nhập ngày sinh",
                    },
                  ]}
                >
                  <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD" />
                </Form.Item>
                <Form.Item name="gender" label="Giới tính">
                  <Input />
                </Form.Item>
                <Form.Item
                  name="guardianPhone"
                  label="Số điện thoại người thân"
                >
                  <Input />
                </Form.Item>
                <Form.Item name="address" label="Địa chỉ">
                  <Input />
                </Form.Item>
                <Form.Item
                  name="relationshipToAccount"
                  label="Mối quan hệ"
                >
                  <Input />
                </Form.Item>
                <Form.Item name="phone" label="Số điện thoại">
                  <Input />
                </Form.Item>
                <Form.Item>
                  <AntButton type="primary" htmlType="submit">
                    Lưu
                  </AntButton>
                  <AntButton htmlType="button" onClick={handleEditCancel}>
                    Hủy
                  </AntButton>
                </Form.Item>
              </Form>
            </Modal>
          </MainContent>
        </Content>
      </Layout>
      
    </Layout>
  );
};

export default PatientManager;