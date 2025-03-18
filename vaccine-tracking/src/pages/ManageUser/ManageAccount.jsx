import React, { useState, useEffect, useCallback, useMemo } from 'react';
import api from '../../config/axios';
import './ManageAccount.css';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import Layout from '../../components/Layout/Layout';
import { Box, Grid, styled } from '@mui/material';

const ManageAccount = () => {
    const [users, setUsers] = useState([]);
    const [error, setError] = useState('');
    const [open, setOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        roleId: 2,
        phone: '',
        address: '',
    });

    const [editFormData, setEditFormData] = useState({
        accountId: '',
        name: '',
        email: '',
        roleId: 2,
        phone: '',
        address: '',
    });

    const [selectedRoleId, setSelectedRoleId] = useState('');
    const [searchKeyword, setSearchKeyword] = useState('');

    const handleOpen = useCallback(() => {
        setOpen(true);
    }, []);

    const handleClose = useCallback(() => {
        setOpen(false);
    }, []);

    const handleEditOpen = useCallback((user) => {
        setEditFormData({
            accountId: user.accountId,
            name: user.name,
            email: user.email,
            roleId: user.roleId,
            phone: user.phone || '',
            address: user.address || '',
        });
        setSelectedUser(user);
        setEditOpen(true);
    }, []);

    const handleEditClose = useCallback(() => {
        setEditOpen(false);
    }, []);

    const fetchUsers = useCallback(async () => {
        try {
            const response = await api.get('/api/Account');
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
            fetchUsers(); // Refresh user list
        } catch (err) {
            setError(err.message);
        }
    };

    const handleInputChange = useCallback((event) => {
        const { name, value } = event.target;
        setFormData(prevFormData => ({ ...prevFormData, [name]: value }));
    }, [setFormData]);

    const handleEditInputChange = useCallback((event) => {
        const { name, value } = event.target;
        setEditFormData(prevEditFormData => ({ ...prevEditFormData, [name]: value }));
    }, [setEditFormData]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            await api.post('/api/Account/CreateAccount', formData);
            handleClose();
            fetchUsers(); // Refresh user list
            setFormData({
                name: '',
                email: '',
                password: '',
                roleId: 2,
                phone: '',
                address: '',
            });
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
            fetchUsers(); // Refresh user list
        } catch (err) {
            setError(err.response?.data?.message || err.message);
        }
    };

    const roleLabel = (roleId) => {
        switch (roleId) {
            case 1: return 'Admin';
            case 2: return 'Staff';
            case 3: return 'User';
            default: return 'Unknown';
        }
    };

    const handleSearchChange = (event) => {
        setSearchKeyword(event.target.value);
    };

    const filteredUsers = useMemo(() => {
        return users.filter(user => {
            const roleMatch = selectedRoleId ? user.roleId === parseInt(selectedRoleId, 10) : true;
            const searchMatch = searchKeyword
                ? user.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
                user.email.toLowerCase().includes(searchKeyword.toLowerCase())
                : true;
            return roleMatch && searchMatch;
        });
    }, [users, selectedRoleId, searchKeyword]);

    return (
        <Layout>
            <h2 className="manage-account-title">User Management</h2>
            {error && <p className="manage-account-error">{error}</p>}
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }} className="manage-account-filter-container">
                {/* Bộ lọc theo Role */}
                <FormControl variant="standard" sx={{ m: 1, minWidth: 120 }}>
                    <InputLabel id="role-filter-label">Show only</InputLabel>
                    <Select
                        labelId="role-filter-label"
                        id="role-filter"
                        value={selectedRoleId}
                        label="Filter by Role"
                        onChange={(e) => setSelectedRoleId(e.target.value)}
                        className="manage-account-select"
                    >
                        <MenuItem value="">All</MenuItem>
                        <MenuItem value="1">Admin</MenuItem>
                        <MenuItem value="2">Staff</MenuItem>
                        <MenuItem value="3">User</MenuItem>
                    </Select>
                </FormControl>
                {/*Search Account  */}
                <TextField
                    label="Search by Name or Email"
                    variant="outlined"
                    size="small"
                    value={searchKeyword}
                    onChange={handleSearchChange}
                />
            </Box>
            <Box display="flex" justifyContent="flex-start" mb={2}>
                <Button variant="contained" onClick={handleOpen} className="manage-account-create-button">Tạo tài khoản</Button>
            </Box>


            <TableContainer component={Paper} className="manage-account-table-container">
                <Table sx={{ minWidth: 650 }} aria-label="simple table" className="manage-account-table">
                    <TableHead>
                        <TableRow>
                            <TableCell className="manage-account-table-header">Name</TableCell>
                            <TableCell className="manage-account-table-header">Email</TableCell>
                            <TableCell className="manage-account-table-header">Role</TableCell>
                            <TableCell className="manage-account-table-header">Phone</TableCell>
                            <TableCell className="manage-account-table-header">Address</TableCell>
                            <TableCell className="manage-account-table-header">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredUsers.map((user) => (
                            <TableRow
                                key={user.accountId}
                                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                className="manage-account-table-row"
                            >
                                <TableCell component="th" scope="row" className="manage-account-table-cell">
                                    {user.name}
                                </TableCell>
                                <TableCell className="manage-account-table-cell">{user.email}</TableCell>
                                <TableCell className="manage-account-table-cell">{roleLabel(user.roleId)}</TableCell>
                                <TableCell className="manage-account-table-cell">{user.phone}</TableCell>
                                <TableCell className="manage-account-table-cell">{user.address}</TableCell>
                                <TableCell className="manage-account-table-cell">
                                    <IconButton aria-label="edit" onClick={() => handleEditOpen(user)} className="manage-account-edit-button">
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton aria-label="delete" onClick={() => handleDelete(user.accountId)} className="manage-account-delete-button">
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={open} onClose={handleClose} className="manage-account-dialog-container">
                <DialogTitle>Create New User</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        name="name"
                        label="Name"
                        type="text"
                        fullWidth
                        variant="standard"
                        onChange={handleInputChange}
                    />
                    <TextField
                        margin="dense"
                        name="email"
                        label="Email Address"
                        type="email"
                        fullWidth
                        variant="standard"
                        onChange={handleInputChange}
                    />
                    <TextField
                        margin="dense"
                        name="password"
                        label="Password"
                        type="password"
                        fullWidth
                        variant="standard"
                        onChange={handleInputChange}
                    />
                    <FormControl variant="standard" fullWidth margin="dense">
                        <InputLabel id="role-select-label">Role</InputLabel>
                        <Select
                            labelId="role-select-label"
                            name="roleId"
                            value={formData.roleId}
                            onChange={handleInputChange}
                            label="Role"
                        >
                            <MenuItem value={1}>Admin</MenuItem>
                            <MenuItem value={2}>Staff</MenuItem>
                            <MenuItem value={3}>User</MenuItem>
                        </Select>
                    </FormControl>
                    <TextField
                        margin="dense"
                        name="phone"
                        label="Phone Number"
                        type="text"
                        fullWidth
                        variant="standard"
                        onChange={handleInputChange}
                    />
                    <TextField
                        margin="dense"
                        name="address"
                        label="Address"
                        type="text"
                        fullWidth
                        variant="standard"
                        onChange={handleInputChange}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button onClick={handleSubmit}>Create</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={editOpen} onClose={handleEditClose} className="manage-account-dialog-container">
                <DialogTitle>Edit User</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        name="name"
                        label="Name"
                        type="text"
                        fullWidth
                        variant="standard"
                        value={editFormData.name}
                        onChange={handleEditInputChange}
                    />
                    <TextField
                        margin="dense"
                        name="email"
                        label="Email Address"
                        type="email"
                        fullWidth
                        variant="standard"
                        value={editFormData.email}
                        onChange={handleEditInputChange}
                        disabled
                    />
                    <FormControl variant="standard" fullWidth margin="dense">
                        <InputLabel id="role-select-label">Role</InputLabel>
                        <Select
                            labelId="role-select-label"
                            name="roleId"
                            value={editFormData.roleId}
                            onChange={handleEditInputChange}
                            label="Role"
                        >
                            <MenuItem value={1}>Admin</MenuItem>
                            <MenuItem value={2}>Staff</MenuItem>
                            <MenuItem value={3}>User</MenuItem>
                        </Select>
                    </FormControl>
                    <TextField
                        margin="dense"
                        name="phone"
                        label="Phone Number"
                        type="text"
                        fullWidth
                        variant="standard"
                        value={editFormData.phone}
                        onChange={handleEditInputChange}
                    />
                    <TextField
                        margin="dense"
                        name="address"
                        label="Address"
                        type="text"
                        fullWidth
                        variant="standard"
                        value={editFormData.address}
                        onChange={handleEditInputChange}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleEditClose}>Cancel</Button>
                    <Button onClick={handleEditSubmit}>Update</Button>
                </DialogActions>
            </Dialog>
        </Layout>
    );
};

export default ManageAccount;