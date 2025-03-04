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
import Header from '../../components/Header/Header';
import SideBar from '../../components/Sidebar/SideBar';
import { Box, Grid, styled } from '@mui/material';

const MainContent = styled(Box)(({ theme }) => ({
    flexGrow: 1,
    padding: theme.spacing(3),
   
}));

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
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
            <Header />
            <Box sx={{ display: 'flex', flex: '1' }}>
                <SideBar />
                <MainContent>
                    <h2>User Management</h2>
                    {error && <p className="error">{error}</p>}
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
                        {/* Bộ lọc theo Role */}
                        <FormControl variant="standard" sx={{ m: 1, minWidth: 120 }}>
                            <InputLabel id="role-filter-label">Show only</InputLabel>
                            <Select
                                labelId="role-filter-label"
                                id="role-filter"
                                value={selectedRoleId}
                                label="Filter by Role"
                                onChange={(e) => setSelectedRoleId(e.target.value)}
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

                    <Button variant="contained" onClick={handleOpen}>Create New User</Button>

                    <TableContainer component={Paper}>
                        <Table sx={{ minWidth: 650 }} aria-label="simple table">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Name</TableCell>
                                    <TableCell>Email</TableCell>
                                    <TableCell>Role</TableCell>
                                    <TableCell>Phone</TableCell>
                                    <TableCell>Address</TableCell>
                                    <TableCell>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredUsers.map((user) => (
                                    <TableRow
                                        key={user.accountId}
                                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                    >
                                        <TableCell component="th" scope="row">
                                            {user.name}
                                        </TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>{roleLabel(user.roleId)}</TableCell>
                                        <TableCell>{user.phone}</TableCell>
                                        <TableCell>{user.address}</TableCell>
                                        <TableCell>
                                            <IconButton aria-label="edit" onClick={() => handleEditOpen(user)}>
                                                <EditIcon />
                                            </IconButton>
                                            <IconButton aria-label="delete" onClick={() => handleDelete(user.accountId)}>
                                                <DeleteIcon />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    <Dialog open={open} onClose={handleClose}>
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

                <Dialog open={editOpen} onClose={handleEditClose}>
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
            </MainContent>
        </Box>
    </Box>
    );
};

export default ManageAccount;