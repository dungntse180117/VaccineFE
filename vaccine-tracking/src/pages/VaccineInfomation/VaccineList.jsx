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
            console.log("Response from API (getAllVaccination):", response);

            if (response && response.data && Array.isArray(response.data)) {
                // Fetch diseases and images for each vaccine
                const vaccinesWithData = await Promise.all(
                    response.data.map(async (vaccine) => {
                        try {
                            const diseasesResponse = await getDiseaseByVaccinationId(vaccine.vaccinationId);
                            let imageUrl = null;

                            try {
                                const imageResponse = await getVaccinationImage(vaccine.vaccinationId);
                                console.log(`Image response for vaccine ${vaccine.vaccinationId}:`, imageResponse);
                                imageUrl = imageResponse.data ? imageResponse.data : null;
                            } catch (imageError) {
                                console.warn(`Could not fetch image for vaccine ${vaccine.vaccinationId}:`, imageError);
                            }

                            return {
                                ...vaccine,
                                diseases: diseasesResponse || [],
                                imageUrl: imageUrl || "https://res.cloudinary.com/dzxkl9am6/image/upload/v1741271135/covid-vaccine-01_original_sf9of3.png",
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
    // data Diseases
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
            case 1:
                return "ngày tuổi";
            case 2:
                return "tháng tuổi";
            case 3:
                return "năm tuổi";
            default:
                return "tuổi";
        }
    };

    // Hàm lọc danh sách vaccine (sử dụng state bộ lọc)
    const filteredVaccines = vaccines.filter((vaccine) => {
        // Lọc theo tên
        const nameMatch = vaccine.vaccinationName.toLowerCase().includes(searchTerm.toLowerCase());

        let minAgeMatch = true;
        let maxAgeMatch = true;

        // Lọc theo tuổi, chỉ khi có giá trị
        if (minAgeFilter) {
            minAgeMatch = vaccine.maxAge >= parseInt(minAgeFilter);  // Lớn hơn hoặc bằng
        }

        if (maxAgeFilter) {
            maxAgeMatch = vaccine.minAge <= parseInt(maxAgeFilter);  // Bé hơn hoặc bằng
        }

        // Lọc theo đơn vị tuổi
        const ageUnitMatch = !ageUnitFilter || vaccine.ageUnitId === parseInt(ageUnitFilter);

        // Lọc theo bệnh
        const diseaseMatch = selectedDiseaseIds.length === 0 || selectedDiseaseIds.every(diseaseId =>
            vaccine.diseases.some(disease => disease.diseaseId === diseaseId)
        );

        return nameMatch && minAgeMatch && maxAgeMatch && ageUnitMatch && diseaseMatch;
    });

    // Hàm xử lý sự kiện khi nhấn nút Tìm
    const handleSearch = () => {
        setSearchTerm(searchTermInput);
        setMinAgeFilter(minAgeFilterInput);
        setMaxAgeFilter(maxAgeFilterInput);
        setAgeUnitFilter(ageUnitFilterInput);
        setSelectedDiseaseIds(selectedDiseaseIdsInput);
    };

    if (loading) {
        return (
            <Box>
                <Header />
                <Typography variant="h6" align="center">Đang tải...</Typography>
                <Footer />
            </Box>
        );
    }

    if (error) {
        return (
            <Box>
                <Header />
                <Typography variant="h6" color="error" align="center">{error}</Typography>
                <Footer />
            </Box>
        );
    }

    return (
        <Box>
            <Header />
            <Grid container spacing={2} padding={3} className="vaccination-list-container">

                <Grid item xs={12} md={4}>
                    <Paper sx={{ padding: 2, display: 'flex', flexDirection: 'column', gap: 2 }} className="search-form-container">
                        <Typography variant="h6">Tìm kiếm và lọc</Typography>
                        <TextField
                            label="Tìm kiếm theo tên"
                            value={searchTermInput}
                            onChange={(e) => setSearchTermInput(e.target.value)}
                        />
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <TextField
                                label="Tuổi tối thiểu"
                                type="number"
                                value={minAgeFilterInput}
                                onChange={(e) => setMinAgeFilterInput(e.target.value)}
                                sx={{ width: 160 }} // Đặt chiều rộng ở đây (điều chỉnh giá trị này)
                            />
                            <TextField
                                label="Tuổi tối đa"
                                type="number"
                                value={maxAgeFilterInput}
                                onChange={(e) => setMaxAgeFilterInput(e.target.value)}
                                sx={{ width: 160 }} // Đặt chiều rộng ở đây (điều chỉnh giá trị này)
                            />
                            <FormControl sx={{ width: '150px' }}>
                                <InputLabel id="age-unit-label">Đơn vị tuổi</InputLabel>
                                <Select
                                    labelId="age-unit-label"
                                    id="age-unit"
                                    value={ageUnitFilterInput}
                                    label="Đơn vị tuổi"
                                    onChange={(e) => setAgeUnitFilterInput(e.target.value)}
                                    renderValue={(selected) => {
                                        if (!selected) {
                                            return <em>Đơn vị tuổi</em>;
                                        }

                                        switch (selected) {
                                            case "1":
                                                return "Ngày";
                                            case "2":
                                                return "Tháng";
                                            case "3":
                                                return "Năm";
                                            default:
                                                return "";
                                        }
                                    }}
                                >
                                    <MenuItem value="">
                                        <em>Tất cả</em>
                                    </MenuItem>
                                    <MenuItem value="1">Ngày</MenuItem>
                                    <MenuItem value="2">Tháng</MenuItem>
                                    <MenuItem value="3">Năm</MenuItem>
                                </Select>
                            </FormControl>
                        </Box>
                        <FormControl>
                            <InputLabel id="disease-multiple-checkbox-label">Bệnh</InputLabel>
                            <Select
                                labelId="disease-multiple-checkbox-label"
                                id="disease-multiple-checkbox"
                                multiple
                                value={selectedDiseaseIdsInput}
                                onChange={(e) => setSelectedDiseaseIdsInput(
                                    typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value,
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
                        <Button variant="contained" onClick={handleSearch}>Tìm</Button>
                    </Paper>
                </Grid>

                <Grid item xs={12} md={8}>
                     <Typography variant="h5" align="left" gutterBottom>Danh sách Vaccine</Typography> 
                    <Grid container spacing={2}>
                        {filteredVaccines.map((vaccine) => {
                            console.log(`Image URL for vaccine ${vaccine.vaccinationId}:`, vaccine.imageUrl);
                            const ageUnitText = getAgeUnitText(vaccine.ageUnitId);

                            return (
                                <Grid item xs={12} sm={6} md={4} key={vaccine.vaccinationId}>
                                    <Card className="vaccination-card">
                                        <CardActionArea component={Link} to={`/vaccinedetail/${vaccine.vaccinationId}`}>
                                            <div className="image-container">
                                                {vaccine.imageUrl && (
                                                    <CardMedia
                                                        component="img"
                                                        image={vaccine.imageUrl}
                                                        alt={vaccine.vaccinationName}
                                                        className="vaccination-image"
                                                    />
                                                )}
                                            </div>
                                            <CardContent>
                                                <Typography variant="h6" component="div">
                                                    {vaccine.vaccinationName}
                                                </Typography>
                                                <Typography variant="body2" color="textSecondary">
                                                    Nhà sản xuất: {vaccine.manufacturer}
                                                </Typography>
                                                <Typography variant="body2" color="textSecondary">
                                                    Số mũi tiêm: {vaccine.totalDoses}
                                                </Typography>
                                                {/* HIỂN THỊ THÔNG TIN TUỔI */}
                                                <Typography variant="body2" color="textSecondary">
                                                    Độ tuổi phù hợp: {vaccine.minAge} đến {vaccine.maxAge} {ageUnitText}
                                                </Typography>
                                                <Box mt={1}>
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
                                                        <Typography variant="body2">Không có bệnh liên quan</Typography>
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