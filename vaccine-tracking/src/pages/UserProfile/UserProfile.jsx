import React, { useState, useEffect } from "react";
import {
  Layout,
  Menu,
  Form,
  Input,
  Button,
  Row,
  Col,
  message,
  Breadcrumb,
} from "antd";
import AppHeader from "../../components/Header/Header";
import FooterComponent from "../../components/Footer/Footer";
import api from "../../config/axios";
import "./UserProfile.css";

const { Header, Content, Sider } = Layout;

const UserProfile = () => {
  const [form] = Form.useForm();
  const [selectedMenuItem, setSelectedMenuItem] = useState("1");
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    fetchUserData();
  }, []);

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
        email: user.email, // Load email
      }); 
      setLoading(false);
    } catch (error) {
      console.error("Error fetching user data:", error);
      message.error("Error fetching user data");
      setLoading(false);
    }
  };

  const handleMenuClick = (e) => {
    setSelectedMenuItem(e.key);
  };

  const handleEditClick = () => {
    setEditing(true);
  };

  const handleCancelEdit = () => {
    setEditing(false); // Hủy chế độ chỉnh sửa
    form.setFieldsValue({
      name: userData?.name,
      phone: userData?.phone,
      address: userData?.address,
      email: userData?.email,
    });//Load lại giá trị cũ từ data
  };

  const onFinish = async (values) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const email = localStorage.getItem("email");

      const userResponse = await api.get(`api/Account/email/${email}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const accountId = userResponse.data.accountId;

      const dataToSend = {
        name: values.name,
        phone: values.phone,
        address: values.address,
        roleId: 2, // Mặc định roleId = 2
      };

      await api.put(`api/Account/${accountId}`, dataToSend, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Fetch updated user data
      await fetchUserData();
      setEditing(false);

      message.success("Thông tin cá nhân đã được cập nhật thành công");

      // Update local storage
      const updatedUserData = await api.get(`api/Account/email/${email}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      localStorage.setItem("user", JSON.stringify(updatedUserData.data));

      window.dispatchEvent(
        new CustomEvent("userProfileUpdated", { detail: updatedUserData.data })
      );
    } catch (error) {
      console.error(
        "Error updating profile:",
        error.response?.data || error.message
      );
      message.error(
        `Lỗi cập nhật thông tin: ${
          error.response?.data?.message || error.message
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  const onPasswordChange = async (values) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const email = localStorage.getItem("email");

      const userResponse = await api.get(`api/Account/email/${email}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const accountId = userResponse.data.accountId;

      await api.put(
        `api/Account/${accountId}/change-password`,
        {
          currentPassword: values.currentPassword,
          newPassword: values.newPassword,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      message.success("Password changed successfully");
      form.resetFields(["currentPassword", "newPassword", "confirmPassword"]);
    } catch (error) {
      console.error(
        "Error changing password:",
        error.response?.data || error.message
      );
      message.error(
        `Error changing password: ${
          error.response?.data?.message || error.message
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    if (loading) {
      return <div>Loading...</div>;
    }
    switch (selectedMenuItem) {
      case "1":
        return (
          <>
            {/* Hiển thị thông tin nếu không ở trạng thái chỉnh sửa */}
            {!editing ? (
              <div>
                <p>
                  <strong>Họ và tên:</strong> {userData?.name}
                </p>
                <p>
                  <strong>Email:</strong> {userData?.email}
                </p>
                <p>
                  <strong>Số điện thoại:</strong> {userData?.phone}
                </p>
                <p>
                  <strong>Địa chỉ:</strong> {userData?.address}
                </p>
                <Button type="primary" onClick={handleEditClick}>
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
              >
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="name"
                      label="Họ và tên"
                      rules={[
                        { required: true, message: "Vui lòng nhập họ và tên" },
                      ]}
                    >
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="phone"
                      label="Số điện thoại"
                      rules={[
                        {
                          required: true,
                          message: "Vui lòng nhập số điện thoại",
                        },
                      ]}
                    >
                      <Input />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item
                  name="address"
                  label="Địa chỉ"
                  rules={[
                    { required: true, message: "Vui lòng nhập địa chỉ" },
                  ]}
                >
                  <Input />
                </Form.Item>
                 <Form.Item
                  name="email"
                  label="Email"
                 >
                  <Input disabled />
                </Form.Item>

                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    className="user-profile-form-button"
                  >
                    Lưu thay đổi
                  </Button>
                   <Button htmlType="button" onClick={handleCancelEdit}>
                    Hủy
                   </Button>
                </Form.Item>
              </Form>
            )}
          </>
        );
        case "2":
            return (
              <Form form={form} layout="vertical" onFinish={onPasswordChange}>
                <Form.Item
                  name="currentPassword"
                  label="Mật khẩu hiện tại"
                  rules={[
                    { required: true, message: "Vui lòng nhập mật khẩu hiện tại" },
                  ]}
                >
                  <Input.Password />
                </Form.Item>
                <Form.Item
                  name="newPassword"
                  label="Mật khẩu mới"
                  rules={[
                    { required: true, message: "Vui lòng nhập mật khẩu mới" },
                    { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự" },
                  ]}
                >
                  <Input.Password />
                </Form.Item>
                <Form.Item
                  name="confirmPassword"
                  label="Xác nhận mật khẩu mới"
                  dependencies={["newPassword"]}
                  rules={[
                    { required: true, message: "Vui lòng xác nhận mật khẩu mới" },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue("newPassword") === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(
                          new Error("Mật khẩu xác nhận không khớp!")
                        );
                      },
                    }),
                  ]}
                >
                  <Input.Password />
                </Form.Item>
                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    className="password-change-button"
                  >
                    Đổi mật khẩu
                  </Button>
                </Form.Item>
              </Form>
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
          xs={{ flex: "0 0 100%" }}
          sm={{ flex: "0 0 90%" }}
          md={{ flex: "0 0 80%" }}
          lg={{ flex: "0 0 70%" }}
          xl={{ flex: "0 0 60%" }}
          xxl={{ flex: "0 0 50%" }}
        >
          <Breadcrumb className="user-profile-breadcrumb">
            <Breadcrumb.Item>Trang chủ</Breadcrumb.Item>
            <Breadcrumb.Item>Tài khoản</Breadcrumb.Item>
            <Breadcrumb.Item>
              {selectedMenuItem === "1"
                ? "Thông tin cá nhân"
                : "Cài đặt tài khoản"}
            </Breadcrumb.Item>
          </Breadcrumb>
          <Header className="user-profile-header">
            <h2>Thông tin cá nhân</h2>
          </Header>
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
              </Menu>
            </Sider>
            <Layout>
              <Content className="user-profile-content">
                {renderContent()}
              </Content>
            </Layout>
          </Layout>
        </Col>
      </Row>
      <FooterComponent />
    </Layout>
  );
};

export default UserProfile;