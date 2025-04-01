import React, { useState, useEffect } from "react";
import { Layout, Menu, Form, Input, Button, Row, Col, message, Breadcrumb } from "antd";
import AppHeader from "../../components/Header/Header";
import FooterComponent from "../../components/Footer/Footer";
import {
  getAccountById, 
  updateAccount,
  changePassword,
  getAllRegistrationsByAccountId,
} from "../../config/axios";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { Box, Typography, CircularProgress } from "@mui/material";
import "./UserProfile.css";

const { Header, Content, Sider } = Layout;

const UserProfile = () => {
  const [form] = Form.useForm();
  const [selectedMenuItem, setSelectedMenuItem] = useState("1");
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [registrations, setRegistrations] = useState([]);
  const [registrationLoading, setRegistrationLoading] = useState(false);
  const [registrationError, setRegistrationError] = useState("");

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    setLoading(true);
    try {
      const accountId = localStorage.getItem("accountId"); 
      if (!accountId) {
        throw new Error("Không tìm thấy accountId trong localStorage.");
      }
      const user = await getAccountById(accountId);
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
      message.error("Không thể tải thông tin người dùng.");
      setLoading(false);
    }
  };

  const fetchRegistrations = async () => {
    setRegistrationLoading(true);
    setRegistrationError("");
    try {
      const accountId = localStorage.getItem("accountId");
      if (accountId) {
        const data = await getAllRegistrationsByAccountId(accountId);
        setRegistrations(data);
      } else {
        setRegistrationError("Không tìm thấy accountId trong localStorage.");
      }
    } catch (error) {
      setRegistrationError("Không thể tải lịch sử đăng ký.");
    } finally {
      setRegistrationLoading(false);
    }
  };

  useEffect(() => {
    if (selectedMenuItem === "3" && userData) {
      fetchRegistrations();
    }
  }, [selectedMenuItem, userData]);

  const handleMenuClick = (e) => {
    setSelectedMenuItem(e.key);
  };

  const handleEditClick = () => {
    setEditing(true);
  };

  const handleCancelEdit = () => {
    setEditing(false);
    form.setFieldsValue({
      name: userData?.name,
      phone: userData?.phone,
      address: userData?.address,
      email: userData?.email,
    });
  };

  const onFinish = async (values) => {
    try {
      setLoading(true);
      const accountId = localStorage.getItem("accountId");
      const email = localStorage.getItem("email");

      const dataToSend = {
        name: values.name,
        phone: values.phone,
        address: values.address,
        roleId: 2,
      };

      await updateAccount(accountId, dataToSend);

      await fetchUserData();
      setEditing(false);
      message.success("Thông tin cá nhân đã được cập nhật thành công.");

      const updatedUserData = await getAccountById(accountId); 
      localStorage.setItem("user", JSON.stringify(updatedUserData));
      window.dispatchEvent(new CustomEvent("userProfileUpdated", { detail: updatedUserData }));
    } catch (error) {
      console.error("Error updating profile:", error);
      message.error(`Lỗi cập nhật thông tin: ${error.message || "Không xác định"}`);
    } finally {
      setLoading(false);
    }
  };

  const onPasswordChange = async (values) => {
    try {
      setLoading(true);
      const accountId = localStorage.getItem("accountId");

      const passwordData = {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      };

      await changePassword(accountId, passwordData);

      message.success("Đổi mật khẩu thành công.");
      form.resetFields(["currentPassword", "newPassword", "confirmPassword"]);
    } catch (error) {
      console.error("Error changing password:", error);
      message.error(`Lỗi đổi mật khẩu: ${error.message || "Không xác định"}`);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN");
  };

  const formatCurrency = (amount) => {
    if (amount != null && typeof amount === "number") {
      return `${amount.toLocaleString("vi-VN")} VNĐ`;
    }
    return "N/A";
  };

  const renderContent = () => {
    if (loading) {
      return <div style={{ textAlign: "center", padding: "20px" }}>Đang tải...</div>;
    }
    switch (selectedMenuItem) {
      case "1":
        return (
          <>
            {!editing ? (
              <div className="user-profile-info">
                <p>
                  <strong>Họ và tên:</strong> {userData?.name || "N/A"}
                </p>
                <p>
                  <strong>Email:</strong> {userData?.email || "N/A"}
                </p>
                <p>
                  <strong>Số điện thoại:</strong> {userData?.phone || "N/A"}
                </p>
                <p>
                  <strong>Địa chỉ:</strong> {userData?.address || "N/A"}
                </p>
                <Button type="primary" onClick={handleEditClick} className="user-profile-form-button">
                  Chỉnh sửa thông tin
                </Button>
              </div>
            ) : (
              <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                initialValues={{
                  name: userData?.name,
                  phone: userData?.phone,
                  address: userData?.address,
                  email: userData?.email,
                }}
                className="user-profile-form"
              >
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="name"
                      label={<span>Họ và tên <span style={{ color: "red" }}>*</span></span>}
                      rules={[{ required: true, message: "Vui lòng nhập họ và tên" }]}
                    >
                      <Input
                        style={{
                          height: "36px",
                          borderRadius: "6px",
                          border: "none",
                          fontSize: "14px",
                          boxShadow: "none",
                          backgroundColor: "#f5f5f5",
                          padding: "0px",
                        }}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="phone"
                      label={<span>Số điện thoại <span style={{ color: "red" }}>*</span></span>}
                      rules={[{ required: true, message: "Vui lòng nhập số điện thoại" }]}
                    >
                      <Input
                        style={{
                          height: "36px",
                          borderRadius: "6px",
                          border: "none",
                          fontSize: "14px",
                          boxShadow: "none",
                          backgroundColor: "#f5f5f5",
                          padding: "0px",
                        }}
                      />
                    </Form.Item>
                  </Col>
                </Row>
                <Form.Item
                  name="address"
                  label={<span>Địa chỉ <span style={{ color: "red" }}>*</span></span>}
                  rules={[{ required: true, message: "Vui lòng nhập địa chỉ" }]}
                >
                  <Input
                    style={{
                      height: "36px",
                      borderRadius: "6px",
                      border: "none",
                      fontSize: "14px",
                      boxShadow: "none",
                      backgroundColor: "#f5f5f5",
                      padding: "0px",
                    }}
                  />
                </Form.Item>
                <Form.Item
                  name="email"
                  label={<span>Email <span style={{ color: "red" }}>*</span></span>}
                >
                  <Input
                    disabled
                    className="custom-disabled-input"
                    style={{
                      height: "36px",
                      borderRadius: "6px",
                      fontSize: "14px",
                      boxShadow: "none",
                      border: "none",
                      padding: "0px",
                    }}
                  />
                </Form.Item>
                <Form.Item>
                  <Button type="primary" htmlType="submit" className="user-profile-form-button">
                    Lưu thay đổi
                  </Button>
                  <Button
                    htmlType="button"
                    onClick={handleCancelEdit}
                    className="user-profile-cancel-button"
                  >
                    Hủy
                  </Button>
                </Form.Item>
              </Form>
            )}
          </>
        );
      case "2":
        return (
          <Form
            form={form}
            layout="vertical"
            onFinish={onPasswordChange}
            className="user-profile-form"
            style={{ marginTop: "16px" }}
          >
            <Form.Item
              name="currentPassword"
              label={<span>Mật khẩu hiện tại <span style={{ color: "red" }}>*</span></span>}
              rules={[{ required: true, message: "Vui lòng nhập mật khẩu hiện tại" }]}
              style={{ marginBottom: "16px" }}
            >
              <Input.Password
                placeholder="Nhập mật khẩu hiện tại"
                style={{
                  height: "36px",
                  borderRadius: "6px",
                  border: "none",
                  fontSize: "14px",
                  boxShadow: "none",
                  backgroundColor: "#f5f5f5",
                  padding: "0px",
                }}
              />
            </Form.Item>
            <Form.Item
              name="newPassword"
              label={<span>Mật khẩu mới <span style={{ color: "red" }}>*</span></span>}
              rules={[
                { required: true, message: "Vui lòng nhập mật khẩu mới" },
                { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự" },
              ]}
              style={{ marginBottom: "16px" }}
            >
              <Input.Password
                placeholder="Nhập mật khẩu mới"
                style={{
                  height: "36px",
                  borderRadius: "6px",
                  border: "none",
                  fontSize: "14px",
                  boxShadow: "none",
                  backgroundColor: "#f5f5f5",
                  padding: "0px",
                }}
              />
            </Form.Item>
            <Form.Item
              name="confirmPassword"
              label={<span>Xác nhận mật khẩu mới <span style={{ color: "red" }}>*</span></span>}
              dependencies={["newPassword"]}
              rules={[
                { required: true, message: "Vui lòng xác nhận mật khẩu mới" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("newPassword") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error("Mật khẩu xác nhận không khớp!"));
                  },
                }),
              ]}
              style={{ marginBottom: "16px" }}
            >
              <Input.Password
                placeholder="Xác nhận mật khẩu mới"
                style={{
                  height: "36px",
                  borderRadius: "6px",
                  border: "none",
                  fontSize: "14px",
                  boxShadow: "none",
                  backgroundColor: "#f5f5f5",
                  padding: "0px",
                }}
              />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" className="password-change-button">
                Đổi mật khẩu
              </Button>
            </Form.Item>
          </Form>
        );
      case "3":
        if (registrationLoading) {
          return (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: 200 }}>
              <CircularProgress size={60} thickness={4} />
            </Box>
          );
        }
        if (registrationError) {
          return <p style={{ color: "red" }}>Lỗi: {registrationError}</p>;
        }
        return (
          <Box style={{ marginTop: "16px" }}>
            <Typography variant="h4" style={{ marginBottom: "16px", color: "#2c3e50" }}>
              Lịch Sử Đăng Ký Tiêm
            </Typography>
            <TableContainer component={Paper} style={{ borderRadius: "8px" }}>
              <Table aria-label="registration history table">
                <TableHead>
                  <TableRow>
                    <TableCell style={{ fontWeight: "bold", color: "#2c3e50" }}>Ngày Đăng Ký</TableCell>
                    <TableCell style={{ fontWeight: "bold", color: "#2c3e50" }}>Tổng Tiền</TableCell>
                    <TableCell style={{ fontWeight: "bold", color: "#2c3e50" }}>Trạng Thái</TableCell>
                    <TableCell style={{ fontWeight: "bold", color: "#2c3e50" }}>Ngày Mong Muốn</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {registrations.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4}>
                        <Box sx={{ textAlign: "center", padding: "20px" }}>
                          <Typography variant="h6" color="textSecondary">
                            Bạn chưa bao giờ đăng ký tiêm chủng ở Vaccine Care
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ) : (
                    registrations.map((registration) => (
                      <TableRow key={registration.registrationID}>
                        <TableCell>{formatDate(registration.registrationDate)}</TableCell>
                        <TableCell>{formatCurrency(registration.totalAmount)}</TableCell>
                        <TableCell>{registration.status || "N/A"}</TableCell>
                        <TableCell>{formatDate(registration.desiredDate)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <Layout className="user-profile-layout">
      <AppHeader />
      <Row justify="center" align="middle" className="user-profile-row">
        <Col
          xs={{ span: 24 }}
          sm={{ span: 22 }}
          md={{ span: 20 }}
          lg={{ span: 18 }}
          xl={{ span: 16 }}
          xxl={{ span: 14 }}
        >
          <Breadcrumb className="user-profile-breadcrumb">
            <Breadcrumb.Item>Trang chủ</Breadcrumb.Item>
            <Breadcrumb.Item>Tài khoản</Breadcrumb.Item>
            <Breadcrumb.Item>
              {selectedMenuItem === "1"
                ? "Thông tin cá nhân"
                : selectedMenuItem === "2"
                ? "Cài đặt tài khoản"
                : "Lịch sử đăng ký"}
            </Breadcrumb.Item>
          </Breadcrumb>
          <Layout>
            <Sider width={250} className="user-profile-sider">
              <Menu
                mode="inline"
                defaultSelectedKeys={["1"]}
                selectedKeys={[selectedMenuItem]}
                onClick={handleMenuClick}
                className="user-profile-menu"
              >
                <Menu.Item key="1">Thông tin cá nhân</Menu.Item>
                <Menu.Item key="2">Cài đặt tài khoản</Menu.Item>
                <Menu.Item key="3">Lịch sử đăng ký</Menu.Item>
              </Menu>
            </Sider>
            <Layout>
              <Content className="user-profile-content">{renderContent()}</Content>
            </Layout>
          </Layout>
        </Col>
      </Row>
      <FooterComponent />
    </Layout>
  );
};

export default UserProfile;