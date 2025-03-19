import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAllRegistrationsByAccountId } from '../../config/axios'; // MAKE SURE THIS IS CORRECT PATH!
import Layout from '../../components/Layout/Layout';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { Box } from '@mui/material';

const HistoryRegistration = () => {
    const { accountId } = useParams();
    const [registrations, setRegistrations] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchRegistrations = async () => {
            setLoading(true);
            setError('');
            try {
                const data = await getAllRegistrationsByAccountId(accountId);
                setRegistrations(data);
            } catch (err) {
                setError(err.message || 'Failed to load registration history.');
            } finally {
                setLoading(false);
            }
        };

        if (accountId) {
            fetchRegistrations();
        } else {
            setError('Account ID is missing.');
            setLoading(false);
        }
    }, [accountId]);

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString(); // Format as DD/MM/YYYY or similar
    };

    if (loading) {
        return <Layout>Loading registration history...</Layout>;
    }

    if (error) {
        return (
            <Layout>
                <p style={{ color: 'red' }}>Error: {error}</p>
                {/* Removed Back Button */}
            </Layout>
        );
    }

    return (
        <Layout>
            <Box display="flex" justifyContent="center" alignItems="center" mb={2} textAlign="center"> {/* Center heading */}
                <h2>Lịch sử đăng kí tiêm</h2>
            </Box>

            <TableContainer component={Paper}>
                <Table aria-label="registration history table">
                    <TableHead>
                        <TableRow>
                            {/* Updated Table Headers to match desired fields */}
                            <TableCell>Registration Date</TableCell>
                            <TableCell>Total Amount</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Desired Date</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {registrations.map((registration) => (
                            <TableRow key={registration.registrationID}>
                                <TableCell>{formatDate(registration.registrationDate)}</TableCell>
                                <TableCell>{registration.totalAmount} vnđ</TableCell>
                                <TableCell>{registration.status}</TableCell>
                                <TableCell>{formatDate(registration.desiredDate)}</TableCell>
                            </TableRow>
                        ))}
                        {registrations.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={4} align="center">No registration history found for this account.</TableCell> {/* Updated colspan */}
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Layout>
    );
};

export default HistoryRegistration;