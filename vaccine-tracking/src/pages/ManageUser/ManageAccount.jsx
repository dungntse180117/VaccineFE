import React, { useState, useEffect, useCallback, useMemo } from "react";
import api from "../../config/axios";
import "./ManageAccount.css";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import Layout from "../../components/Layout/Layout";
import { Box, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

const ManageAccount = () => {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    roleId: 2,
    phone: "",
    address: "",
  });
  const [editFormData, setEditFormData] = useState({
    accountId: "",
    name: "",
    email: "",
    roleId: 2,
    phone: "",
    address: "",
  });
  const [selectedRoleId, setSelectedRoleId] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");
  const navigate = useNavigate();

  const handleOpen = useCallback(() => setOpen(true), []);
  const handleClose = useCallback(() => setOpen(false), []);
  const handleEditOpen = useCallback((user) => {
    setEditFormData({
      accountId: user.accountId,
      name: user.name,
      email: user.email,
      roleId: user.roleId,
      phone: user.phone || "",
      address: user.address || "",
    });
    setSelectedUser(user);
    setEditOpen(true);
  }, []);
  const handleEditClose = useCallback(() => setEditOpen(false), []);

  const fetchUsers = useCallback(async () => {
    try {
      const response = await api.get("/api/Account");
      setUsers(response.data);
    } catch (err) {
      setError(err.message);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleDelete = async (accountId) => {
    try {
      await api.delete(`/api/Account/${accountId}`);
      fetchUsers();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleInputChange = useCallback((event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleEditInputChange = useCallback((event) => {
    const { name, value } = event.target;
    setEditFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await api.post("/api/Account/CreateAccount", formData);
      handleClose();
      fetchUsers();
      setFormData({ name: "", email: "", password: "", roleId: 2, phone: "", address: "" });
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  const handleEditSubmit = async (event) => {
    event.preventDefault();
    try {
      const { accountId, ...updateData } = editFormData;
      await api.put(`/api/Account/${accountId}`, updateData);
      handleEditClose();
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  const roleLabel = (roleId) => {
    switch (roleId) {
      case 1: return "Admin";
      case 2: return "Staff";
      case 3: return "User";
      default: return "Unknown";
    }
  };

  const handleSearchChange = (event) => {
    setSearchKeyword(event.target.value);
  };

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const roleMatch = selectedRoleId ? user.roleId === parseInt(selectedRoleId, 10) : true;
      const searchMatch = searchKeyword
        ? user.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
          user.email.toLowerCase().includes(searchKeyword.toLowerCase())
        : true;
      return roleMatch && searchMatch;
    });
  }, [users, selectedRoleId, searchKeyword]);

  const handleViewHistory = useCallback((accountId) => {
    navigate(`/history-registration/${accountId}`);
  }, [navigate]);

  return (
    <Layout>
      <Box className="manage-account-container">
        <Typography variant="h4" className="manage-account-title">
          Quản lý Tài Khoản
        </Typography>

        {error && <p className="manage-account-error">{error}</p>}

        <Box className="manage-account-filter-container">
          <FormControl variant="outlined" sx={{ minWidth: 200 }}>
            <InputLabel>Lọc theo vai trò</InputLabel>
            <Select
              value={selectedRoleId}
              onChange={(e) => setSelectedRoleId(e.target.value)}
              label="Lọc theo vai trò"
            >
              <MenuItem value="">Tất cả</MenuItem>
              <MenuItem value="1">Admin</MenuItem>
              <MenuItem value="2">Staff</MenuItem>
              <MenuItem value="3">User</MenuItem>
            </Select>
          </FormControl>
          <TextField
            label="Tìm theo tên hoặc email"
            variant="outlined"
            size="small"
            value={searchKeyword}
            onChange={handleSearchChange}
          />
        </Box>

        <Box display="flex" justifyContent="flex-start" mb={3}>
          <Button variant="contained" onClick={handleOpen} className="manage-account-create-button">
            Tạo Tài Khoản
          </Button>
        </Box>

        <TableContainer component={Paper} className="manage-account-table-container">
          <Table sx={{ minWidth: 650 }} aria-label="user table">
            <TableHead>
              <TableRow>
                <TableCell className="manage-account-table-header">Tên</TableCell>
                <TableCell className="manage-account-table-header">Email</TableCell>
                <TableCell className="manage-account-table-header">Vai Trò</TableCell>
                <TableCell className="manage-account-table-header">Số Điện Thoại</TableCell>
                <TableCell className="manage-account-table-header">Địa Chỉ</TableCell>
                <TableCell className="manage-account-table-header">Hành Động</TableCell>
                <TableCell className="manage-account-table-header">Lịch Sử Đăng Ký</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.accountId} className="manage-account-table-row">
                  <TableCell className="manage-account-table-cell">{user.name}</TableCell>
                  <TableCell className="manage-account-table-cell">{user.email}</TableCell>
                  <TableCell className="manage-account-table-cell">{roleLabel(user.roleId)}</TableCell>
                  <TableCell className="manage-account-table-cell">{user.phone || "N/A"}</TableCell>
                  <TableCell className="manage-account-table-cell">{user.address || "N/A"}</TableCell>
                  <TableCell className="manage-account-table-cell">
                    <IconButton
                      aria-label="edit"
                      onClick={() => handleEditOpen(user)}
                      className="manage-account-edit-button"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      aria-label="delete"
                      onClick={() => handleDelete(user.accountId)}
                      className="manage-account-delete-button"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                  <TableCell className="manage-account-table-cell">
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => handleViewHistory(user.accountId)}
                    >
                      Xem Lịch Sử
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Dialog open={open} onClose={handleClose} className="manage-account-dialog-container">
          <DialogTitle className="manage-account-dialog-title">Tạo Tài Khoản Mới</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              name="name"
              label="Tên"
              type="text"
              fullWidth
              variant="outlined"
              onChange={handleInputChange}
            />
            <TextField
              margin="dense"
              name="email"
              label="Email"
              type="email"
              fullWidth
              variant="outlined"
              onChange={handleInputChange}
            />
            <TextField
              margin="dense"
              name="password"
              label="Mật Khẩu"
              type="password"
              fullWidth
              variant="outlined"
              onChange={handleInputChange}
            />
            <FormControl variant="outlined" fullWidth margin="dense">
              <InputLabel>Vai Trò</InputLabel>
              <Select
                name="roleId"
                value={formData.roleId}
                onChange={handleInputChange}
                label="Vai Trò"
              >
                <MenuItem value={1}>Admin</MenuItem>
                <MenuItem value={2}>Staff</MenuItem>
                <MenuItem value={3}>User</MenuItem>
              </Select>
            </FormControl>
            <TextField
              margin="dense"
              name="phone"
              label="Số Điện Thoại"
              type="text"
              fullWidth
              variant="outlined"
              onChange={handleInputChange}
            />
            <TextField
              margin="dense"
              name="address"
              label="Địa Chỉ"
              type="text"
              fullWidth
              variant="outlined"
              onChange={handleInputChange}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Hủy</Button>
            <Button variant="contained" onClick={handleSubmit} className="manage-account-create-button">
              Tạo
            </Button>
          </DialogActions>
        </Dialog>
     
        <Dialog open={editOpen} onClose={handleEditClose} className="manage-account-dialog-container">
          <DialogTitle className="manage-account-dialog-title">Sửa Tài Khoản</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              name="name"
              label="Tên"
              type="text"
              fullWidth
              variant="outlined"
              value={editFormData.name}
              onChange={handleEditInputChange}
            />
            <TextField
              margin="dense"
              name="email"
              label="Email"
              type="email"
              fullWidth
              variant="outlined"
              value={editFormData.email}
              onChange={handleEditInputChange}
              disabled
            />
            <FormControl variant="outlined" fullWidth margin="dense">
              <InputLabel>Vai Trò</InputLabel>
              <Select
                name="roleId"
                value={editFormData.roleId}
                onChange={handleEditInputChange}
                label="Vai Trò"
              >
                <MenuItem value={1}>Admin</MenuItem>
                <MenuItem value={2}>Staff</MenuItem>
                <MenuItem value={3}>User</MenuItem>
              </Select>
            </FormControl>
            <TextField
              margin="dense"
              name="phone"
              label="Số Điện Thoại"
              type="text"
              fullWidth
              variant="outlined"
              value={editFormData.phone}
              onChange={handleEditInputChange}
            />
            <TextField
              margin="dense"
              name="address"
              label="Địa Chỉ"
              type="text"
              fullWidth
              variant="outlined"
              value={editFormData.address}
              onChange={handleEditInputChange}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleEditClose}>Hủy</Button>
            <Button variant="contained" onClick={handleEditSubmit} className="manage-account-create-button">
              Cập Nhật
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Layout>
  );
};

export default ManageAccount;