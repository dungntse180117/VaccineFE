import React, { useState, useEffect } from "react";
import { Link } from 'react-router-dom';
import {
    getAllVaccination,
    getVaccinationImage,
    getDiseaseByVaccinationId,
    getAllDiseases
} from "../../config/axios";
import {
    Typography,
    Card,
    CardContent,
    CardMedia,
    Grid,
    Chip,
    Box,
    CardActionArea,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Checkbox,
    ListItemText,
    Button,
    Paper
} from '@mui/material';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import "./VaccineList.css";  
import NoImage from "../../assets/NoImage.png";

function VaccinationList() {
    const [vaccines, setVaccines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // State cho tìm kiếm và lọc
    const [searchTerm, setSearchTerm] = useState("");
    const [minAgeFilter, setMinAgeFilter] = useState("");
    const [maxAgeFilter, setMaxAgeFilter] = useState("");
    const [ageUnitFilter, setAgeUnitFilter] = useState("");
    const [availableDiseases, setAvailableDiseases] = useState([]);
    const [selectedDiseaseIds, setSelectedDiseaseIds] = useState([]);

    // State cho input (không lọc ngay lập tức)
    const [searchTermInput, setSearchTermInput] = useState("");
    const [minAgeFilterInput, setMinAgeFilterInput] = useState("");
    const [maxAgeFilterInput, setMaxAgeFilterInput] = useState("");
    const [ageUnitFilterInput, setAgeUnitFilterInput] = useState("");
    const [selectedDiseaseIdsInput, setSelectedDiseaseIdsInput] = useState([]);

    useEffect(() => {
        fetchVaccines();
        fetchAvailableDiseases();
    }, []);

    const fetchVaccines = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await getAllVaccination();
            if (response && response.data && Array.isArray(response.data)) {
                const vaccinesWithData = await Promise.all(
                    response.data.map(async (vaccine) => {
                        try {
                            const diseasesResponse = await getDiseaseByVaccinationId(vaccine.vaccinationId);
                            let imageUrl = null;
                            try {
                                const imageResponse = await getVaccinationImage(vaccine.vaccinationId);
                                imageUrl = imageResponse.data ? imageResponse.data : null;
                            } catch (imageError) {
                                console.warn(`Could not fetch image for vaccine ${vaccine.vaccinationId}:`, imageError);
                            }
                            return {
                                ...vaccine,
                                diseases: diseasesResponse || [],
                                imageUrl: imageUrl ||NoImage,
                            };
                        } catch (diseaseError) {
                            console.error(`Error fetching data for vaccine ${vaccine.vaccinationId}:`, diseaseError);
                            return { ...vaccine, diseases: [], imageUrl: null };
                        }
                    })
                );
                setVaccines(vaccinesWithData);
            } else {
                setError("Không thể tải danh sách vaccine.");
            }
        } catch (error) {
            console.error("Error fetching vaccinations:", error);
            setError("Có lỗi xảy ra khi lấy dữ liệu vaccine.");
        } finally {
            setLoading(false);
        }
    };

    const fetchAvailableDiseases = async () => {
        try {
            const response = await getAllDiseases();
            setAvailableDiseases(response);
        } catch (error) {
            console.error("Lỗi khi tải danh sách bệnh:", error);
            setError("Lỗi khi tải danh sách bệnh.");
        }
    };

    const getAgeUnitText = (ageUnitId) => {
        switch (ageUnitId) {
            case 1: return "ngày tuổi";
            case 2: return "tháng tuổi";
            case 3: return "năm tuổi";
            default: return "tuổi";
        }
    };

    const filteredVaccines = vaccines.filter((vaccine) => {
        const nameMatch = vaccine.vaccinationName.toLowerCase().includes(searchTerm.toLowerCase());
        let minAgeMatch = true;
        let maxAgeMatch = true;
        if (minAgeFilter) {
            minAgeMatch = vaccine.maxAge >= parseInt(minAgeFilter);
        }
        if (maxAgeFilter) {
            maxAgeMatch = vaccine.minAge <= parseInt(maxAgeFilter);
        }
        const ageUnitMatch = !ageUnitFilter || vaccine.ageUnitId === parseInt(ageUnitFilter);
        const diseaseMatch = selectedDiseaseIds.length === 0 || selectedDiseaseIds.every(diseaseId =>
            vaccine.diseases.some(disease => disease.diseaseId === diseaseId)
        );
        return nameMatch && minAgeMatch && maxAgeMatch && ageUnitMatch && diseaseMatch;
    });

    const handleSearch = () => {
        setSearchTerm(searchTermInput);
        setMinAgeFilter(minAgeFilterInput);
        setMaxAgeFilter(maxAgeFilterInput);
        setAgeUnitFilter(ageUnitFilterInput);
        setSelectedDiseaseIds(selectedDiseaseIdsInput);
    };

    if (loading) {
        return (
            <Box sx={{ background: "#ecf0f1", minHeight: "100vh" }}>
                <Header />
                <Typography variant="h6" align="center" sx={{ py: 5 }}>Đang tải...</Typography>
                <Footer />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ background: "#ecf0f1", minHeight: "100vh" }}>
                <Header />
                <Typography variant="h6" color="error" align="center" sx={{ py: 5 }}>{error}</Typography>
                <Footer />
            </Box>
        );
    }

    return (
        <Box sx={{ background: "#ecf0f1", minHeight: "100vh" }}>
            <Header />
            <Grid container spacing={3} padding={3} className="vaccination-list-container">
                <Grid item xs={12} md={3}>
                    <Paper className="search-form-container">
                        <Typography variant="h6" sx={{ color: "#2c3e50", mb: 1 }}>
                            Tìm kiếm và lọc
                        </Typography>
                        <TextField
                            label="Tìm kiếm theo tên"
                            value={searchTermInput}
                            onChange={(e) => setSearchTermInput(e.target.value)}
                            variant="outlined"
                            fullWidth
                        />
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <TextField
                                label="Tuổi tối thiểu"
                                type="number"
                                value={minAgeFilterInput}
                                onChange={(e) => setMinAgeFilterInput(e.target.value)}
                                variant="outlined"
                                sx={{ flex: 1 }}
                            />
                            <TextField
                                label="Tuổi tối đa"
                                type="number"
                                value={maxAgeFilterInput}
                                onChange={(e) => setMaxAgeFilterInput(e.target.value)}
                                variant="outlined"
                                sx={{ flex: 1 }}
                            />
                        </Box>
                        <FormControl variant="outlined" fullWidth>
                            <InputLabel>Đơn vị tuổi</InputLabel>
                            <Select
                                value={ageUnitFilterInput}
                                label="Đơn vị tuổi"
                                onChange={(e) => setAgeUnitFilterInput(e.target.value)}
                                renderValue={(selected) => selected ? getAgeUnitText(parseInt(selected)) : "Tất cả"}
                            >
                                <MenuItem value=""><em>Tất cả</em></MenuItem>
                                <MenuItem value="1">Ngày</MenuItem>
                                <MenuItem value="2">Tháng</MenuItem>
                                <MenuItem value="3">Năm</MenuItem>
                            </Select>
                        </FormControl>
                        <FormControl variant="outlined" fullWidth>
                            <InputLabel>Bệnh</InputLabel>
                            <Select
                                multiple
                                value={selectedDiseaseIdsInput}
                                onChange={(e) => setSelectedDiseaseIdsInput(
                                    typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value
                                )}
                                renderValue={(selected) => {
                                    const selectedNames = selected.map(id => {
                                        const disease = availableDiseases.find(d => d.diseaseId === id);
                                        return disease ? disease.diseaseName : "";
                                    });
                                    return selectedNames.join(", ");
                                }}
                            >
                                {availableDiseases.map((disease) => (
                                    <MenuItem key={disease.diseaseId} value={disease.diseaseId}>
                                        <Checkbox checked={selectedDiseaseIdsInput.indexOf(disease.diseaseId) > -1} />
                                        <ListItemText primary={disease.diseaseName} />
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <Button variant="contained" onClick={handleSearch}>
                            Tìm kiếm
                        </Button>
                    </Paper>
                </Grid>

                <Grid item xs={12} md={9} className="vaccine-list-section">
                    <Typography variant="h5" align="left" style={{ paddingLeft: 50 }} gutterBottom sx={{ color: "#2c3e50", fontWeight: 600 }}>
                        Danh sách Vaccine
                    </Typography>
                    <Grid container spacing={2} style={{ paddingLeft: 50 }}>
                        {filteredVaccines.map((vaccine) => {
                            const ageUnitText = getAgeUnitText(vaccine.ageUnitId);
                            return (
                                <Grid item xs={12} sm={6} md={4} key={vaccine.vaccinationId}>
                                    <Card className="vaccination-card">
                                        <CardActionArea component={Link} to={`/vaccinedetail/${vaccine.vaccinationId}`}>
                                            {vaccine.imageUrl && (
                                                <CardMedia
                                                    component="img"
                                                    image={vaccine.imageUrl}
                                                    alt={vaccine.vaccinationName}
                                                    className="vaccination-image"
                                                />
                                            )}
                                            <CardContent className="card-content">
                                                <Typography variant="h6" component="div" className="vaccination-name-link">
                                                    {vaccine.vaccinationName}
                                                </Typography>
                                                <Typography variant="body2">
                                                    Nhà sản xuất: {vaccine.manufacturer}
                                                </Typography>
                                                <Typography variant="body2">
                                                    Số mũi tiêm: {vaccine.totalDoses}
                                                </Typography>
                                                <Typography variant="body2">
                                                    Tuổi: {vaccine.minAge} - {vaccine.maxAge} {ageUnitText}
                                                </Typography>
                                                <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                    {vaccine.diseases && vaccine.diseases.length > 0 ? (
                                                        vaccine.diseases.map((disease) => (
                                                            <Chip
                                                                key={disease.diseaseId}
                                                                label={disease.diseaseName}
                                                                size="small"
                                                                className="disease-chip"
                                                            />
                                                        ))
                                                    ) : (
                                                        <Typography variant="body2" className="no-diseases">
                                                            Không có bệnh liên quan
                                                        </Typography>
                                                    )}
                                                </Box>
                                            </CardContent>
                                        </CardActionArea>
                                    </Card>
                                </Grid>
                            );
                        })}
                    </Grid>
                </Grid>
            </Grid>
            <Footer />
        </Box>
    );
}

export default VaccinationList;