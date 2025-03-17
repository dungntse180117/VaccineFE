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
import "./PatientManager.css"; // Make sure this CSS file exists and styles are applied correctly
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
import VisibilityIcon from '@mui/icons-material/Visibility';
import HistoryIcon from '@mui/icons-material/History';
import { useNavigate } from 'react-router-dom';

const { Content } = Layout;

const drawerWidth = 200; // Adjust as needed

const MainContent = styled(Box)(({ theme }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  overflow: "auto",
}));

const PatientManager = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [addPatientForm] = Form.useForm();  // Form instance for Add
  const [editPatientForm] = Form.useForm(); // Form instance for Edit
  const navigate = useNavigate();

  // Fetch patients on component mount
  useEffect(() => {
    const fetchPatients = async () => {
      setLoading(true);
      try {
        const accountId = localStorage.getItem("accountId");
        if (accountId) {
          const response = await getAllPatientsByAccountId(accountId);
          setPatients(response.data);
        } else {
          console.warn("accountId not found in localStorage."); // Add a warning
        }
      } catch (error) {
        console.error("Error fetching patients:", error);
        message.error(
          error.response?.data?.message ||
          error.message ||
          "An error occurred while fetching patients."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, []);

  const showAddModal = () => {
    setIsAddModalOpen(true);
  };

  const handleAddCancel = () => {
    setIsAddModalOpen(false);
    addPatientForm.resetFields(); // Reset form fields
  };

  const handleAddPatient = async () => {
    try {
      setLoading(true);
      const values = await addPatientForm.validateFields(); // Validate
      const accountId = localStorage.getItem("accountId");

      if (!accountId) {
        message.error("AccountId not found in localStorage.");
        return; // Exit if accountId is missing
      }

      await createPatient({
        ...values,
        accountId: parseInt(accountId, 10), // Ensure accountId is an integer
        dob: values.dob.format("YYYY-MM-DD"), // Format date
      });

      message.success("Patient created successfully");

      // Refetch patients
      const response = await getAllPatientsByAccountId(accountId);
      console.log("Patients after create:", response.data); // Debug: Check fetched data
      setPatients(response.data);

      handleAddCancel(); // Close and reset

    } catch (error) {
      console.error("Error adding patient:", error);
      message.error(
        error.response?.data?.message || error.message || "An error occurred while adding patient"
      );
    } finally {
      setLoading(false);
    }
  };

  const showEditModal = (record) => {
    setSelectedPatient(record);
    setIsEditModalOpen(true);
    editPatientForm.setFieldsValue({ // Set initial values
      ...record,
      dob: moment(record.dob, 'YYYY-MM-DD'), // Convert to Moment object
    });
  };

  const handleEditCancel = () => {
    setIsEditModalOpen(false);
    setSelectedPatient(null);
    editPatientForm.resetFields(); // Reset
  };

  const handleEditPatient = async () => {
    try {
      setLoading(true);
      const values = await editPatientForm.validateFields(); // Validate
      await updatePatient(selectedPatient.patientId, {
        ...values,
        dob: values.dob.format('YYYY-MM-DD'), // Format
      });

      message.success("Patient updated successfully");

      // Refetch patients
      const accountId = localStorage.getItem("accountId");
      if (accountId) {
        const response = await getAllPatientsByAccountId(accountId);
        console.log("Patients after update:", response.data); // Debug: Check fetched data
        setPatients(response.data);
      }

      handleEditCancel();
    } catch (error) {
      console.error("Error updating patient:", error);
      message.error(
        error.response?.data?.message || error.message || "An error occurred while updating patient."
      );
    } finally {
      setLoading(false);
    }
  };
    const handleDeletePatient = (record) => {
        Modal.confirm({
            title: "Confirm Delete",
            content: `Are you sure you want to delete ${record.patientName}?`,
            okText: "Yes",
            okType: "danger",
            cancelText: "No",
            onOk: async () => {
                try {
                    setLoading(true);
                    await deletePatient(record.patientId);
                    message.success("Patient deleted successfully");

                    // Refetch
                    const accountId = localStorage.getItem("accountId");
                    if (accountId) {
                        const response = await getAllPatientsByAccountId(accountId);
                         console.log("Patients after delete:", response.data); // Debug: Check fetched data
                        setPatients(response.data);
                    }
                } catch (error) {
                    console.error("Error Deleting patient:", error);
                    message.error(
                        error.response?.data?.message || error.message || "An error occurred while deleting patient."
                    );
                } finally {
                    setLoading(false);
                }
            },
        });
    };

  return (
    <Layout className="patient-manager-layout" style={{ minHeight: "100vh" }}>
      <AppHeader />
      <Layout>
        <Content
          style={{
            padding: "24px",
            marginLeft: drawerWidth,
            display: "flex",
            flexDirection: "column",
          }}
        >
            <Box>
                <Breadcrumb items={[
                { title: 'Trang chủ' },
                { title: 'Quản lý hồ sơ tiêm chủng' },
                ]}
                style={{ margin: "16px 0" }}
            />
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
                    <TableCell>Lịch hẹn tiêm</TableCell>
                    <TableCell>Lịch sử tiêm</TableCell>
                    <TableCell>Hành động</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={10} style={{ textAlign: 'center' }}>
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : (
                  patients.map((patient) => (
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
                      <TableCell>
                        <IconButton
                          aria-label="view-visits"
                          onClick={() => navigate(`/patient-visits/${patient.patientId}`)}
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </TableCell>
                      <TableCell>
                        <IconButton
                          aria-label="view-vaccination-history"
                          onClick={() => navigate(`/patient-history-vaccine/${patient.patientId}`)}
                        >
                          <HistoryIcon />
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
                  )))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Add Patient Modal */}
            <Modal
              title="Tạo Hồ Sơ Tiêm Chủng"
              open={isAddModalOpen}
              onCancel={handleAddCancel}
              footer={[
                <AntButton key="cancel" onClick={handleAddCancel}>
                  Hủy
                </AntButton>,
                <AntButton key="submit" type="primary" onClick={handleAddPatient}>
                  Lưu
                </AntButton>,
              ]}
            >
              <Form form={addPatientForm} layout="vertical">
                <Form.Item
                  name="patientName"
                  label="Họ và tên"
                  rules={[{ required: true, message: "Vui lòng nhập họ và tên" }]}
                >
                  <Input />
                </Form.Item>
                <Form.Item
                  name="dob"
                  label="Ngày sinh"
                  rules={[{ required: true, message: "Vui lòng nhập ngày sinh" }]}
                >
                  <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD" />
                </Form.Item>
                <Form.Item name="gender" label="Giới tính">
                  <Input />
                </Form.Item>
                <Form.Item name="guardianPhone" label="Số điện thoại người thân">
                  <Input />
                </Form.Item>
                <Form.Item name="address" label="Địa chỉ">
                  <Input />
                </Form.Item>
                <Form.Item name="relationshipToAccount" label="Mối quan hệ">
                  <Input />
                </Form.Item>
                <Form.Item name="phone" label="Số điện thoại">
                  <Input />
                </Form.Item>
              </Form>
            </Modal>

            {/* Edit Patient Modal */}
            <Modal
              title="Chỉnh sửa thông tin bệnh nhân"
              open={isEditModalOpen}
              onCancel={handleEditCancel}
              footer={[
                <AntButton key="cancel" onClick={handleEditCancel}>
                  Hủy
                </AntButton>,
                <AntButton key="submit" type="primary" onClick={handleEditPatient}>
                  Lưu
                </AntButton>,
              ]}
            >

              <Form form={editPatientForm} layout="vertical">
                    <Form.Item
                        name="patientName"
                        label="Họ và tên"
                        rules={[{ required: true, message: 'Vui lòng nhập họ và tên' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="dob"
                        label="Ngày sinh"
                        rules={[{ required: true, message: 'Vui lòng nhập ngày sinh' }]}
                    >
                        <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
                    </Form.Item>
                    <Form.Item name="gender" label="Giới tính">
                        <Input />
                    </Form.Item>
                    <Form.Item name="guardianPhone" label="Số điện thoại người thân">
                        <Input />
                    </Form.Item>
                    <Form.Item name="address" label="Địa chỉ">
                        <Input />
                    </Form.Item>
                    <Form.Item name="relationshipToAccount" label="Mối quan hệ">
                        <Input />
                    </Form.Item>
                    <Form.Item name="phone" label="Số điện thoại">
                        <Input />
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