import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getVaccinationHistoriesByVisitId, updateVaccinationHistory } from '../../config/axios';
import {
    TableContainer,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    Paper,
    Typography,
    CircularProgress,
    Box,
    Alert,
    Button,
    Modal,
    TextField,
} from '@mui/material';
import moment from 'moment';
import './VisitHistoryVaccine.css'; // Make sure this file exists and has the correct styles
import { Layout, Breadcrumb, message } from 'antd'; // Import message from antd
import AppHeader from "../../components/Header/Header";
import { styled } from "@mui/material/styles";

const { Content } = Layout;

const MainContent = styled(Box)(({ theme }) => ({
    flexGrow: 1,
    padding: theme.spacing(3),
    overflow: 'auto',
}));

const VisitHistoryVaccine = () => {
    const { visitId } = useParams();
    const [histories, setHistories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [openModal, setOpenModal] = useState(false);
    const [selectedHistoryId, setSelectedHistoryId] = useState(null);
    const [reactionInput, setReactionInput] = useState('');

    useEffect(() => {
        const fetchHistory = async () => {
            setLoading(true);
            setError(null); // Clear previous errors
            try {
                const data = await getVaccinationHistoriesByVisitId(visitId);
                setHistories(data);
            } catch (err) {
                setError(err.message || 'An error occurred while fetching data.');
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, [visitId]);

    const handleOpenModal = (historyId) => {
        setSelectedHistoryId(historyId);
        setReactionInput('');
        setOpenModal(true);
    };

    const handleCloseModal = () => {
        setOpenModal(false);
        setSelectedHistoryId(null);
        setReactionInput('');
    };

    const handleReactionChange = (event) => {
        setReactionInput(event.target.value);
    };

    const handleUpdateReaction = async () => {
        try {
            await updateVaccinationHistory(selectedHistoryId, { reaction: reactionInput });
            // Refresh the history list AFTER successful update:
            const updatedHistories = await getVaccinationHistoriesByVisitId(visitId);
            setHistories(updatedHistories);
            message.success("Phản ứng đã được cập nhật thành công!"); // AntD success message
            handleCloseModal(); // Close the modal AFTER successful update
        } catch (err) {
            console.error("Error updating reaction:", err);
            message.error("Cập nhật phản ứng thất bại.");  // AntD error message
            // Optionally, you might NOT want to close the modal on error,
            // so the user can see the error and try again.  If so, remove handleCloseModal() from here.
        }
    };


    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                <CircularProgress size={60} thickness={4} />
            </Box>
        );
    }

    if (error) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                <Alert severity="error">{error}</Alert>
            </Box>
        );
    }

    if (!histories || histories.length === 0) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px" flexDirection="column">
                <Typography variant="h6" color="textSecondary">
                    Không có lịch sử tiêm cho lần khám này.
                </Typography>
            </Box>
        );
    }
    const columns = [
        {
            title: 'Ngày tiêm',
            dataIndex: 'vaccinationDate',
            key: 'vaccinationDate',
            render: (date) => (date ? moment(date).format('DD/MM/YYYY') : 'N/A'),
        },
        {
            title: 'Vaccine',
            dataIndex: 'vaccineId',
            key: 'vaccineId',
            render: (text, record) => {
                return record.vaccineId || 'N/A';
            },
        },
        {
            title: 'Phản ứng',
            dataIndex: 'reaction',
            key: 'reaction',
            render: (text, record) =>
                text ? (
                    text
                ) : (
                    <Button variant="outlined" onClick={() => handleOpenModal(record.vaccinationHistoryID)}>
                        Ghi nhận
                    </Button>
                ),
        },
        {
            title: 'Ghi chú',
            dataIndex: 'notes',
            key: 'notes',
            render: (text) => text || 'N/A',
        },
    ];

    return (
        <Layout className="visit-history-vaccine-layout" style={{ minHeight: '100vh' }}>
            <AppHeader />
            <Layout>
                <Content style={{ padding: '24px', marginLeft: 200 }}>
                    <Breadcrumb style={{ margin: '16px 0' }}>
                        <Breadcrumb.Item>Trang chủ</Breadcrumb.Item>
                        <Breadcrumb.Item>Quản lý lịch hẹn tiêm</Breadcrumb.Item>
                        <Breadcrumb.Item>Lịch sử tiêm chủng</Breadcrumb.Item>
                    </Breadcrumb>

                    <MainContent>
                        <Typography variant="h4" gutterBottom component="div">
                            Lịch sử tiêm Vaccine
                        </Typography>

                        <TableContainer component={Paper} elevation={3}>
                            <Table aria-label="vaccination history table" size="medium">
                                <TableHead>
                                    <TableRow>
                                        {columns.map((column) => (
                                            <TableCell key={column.key} style={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>
                                                {column.title}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {histories.map((history) => (
                                        <TableRow key={history.vaccinationHistoryID} hover>
                                            <TableCell>
                                                {history.vaccinationDate
                                                    ? moment(history.vaccinationDate).format('DD/MM/YYYY')
                                                    : 'N/A'}
                                            </TableCell>
                                            <TableCell> {history.vaccineId}</TableCell>
                                            <TableCell>{columns.find(col => col.key === 'reaction').render(history.reaction, history)}</TableCell>
                                            <TableCell>{history.notes || 'N/A'}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </MainContent>

                </Content>
            </Layout>

            <Modal
                open={openModal}
                onClose={handleCloseModal}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 400,
                    bgcolor: 'background.paper',
                    border: '2px solid #000',
                    boxShadow: 24,
                    p: 4,
                }}>
                    <Typography id="modal-modal-title" variant="h6" component="h2">
                        Ghi nhận phản ứng
                    </Typography>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="reaction"
                        label="Phản ứng"
                        type="text"
                        fullWidth
                        variant="outlined"
                        value={reactionInput}
                        onChange={handleReactionChange}
                    />
                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                        <Button onClick={handleCloseModal} sx={{ mr: 1 }}>Hủy</Button>
                        <Button onClick={handleUpdateReaction} variant="contained">Cập nhật</Button>
                    </Box>
                </Box>
            </Modal>
        </Layout>
    );
};

export default VisitHistoryVaccine;