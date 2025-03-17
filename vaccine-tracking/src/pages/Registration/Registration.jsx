import React, { useState, useEffect } from 'react';
import {
    getAllVaccinationRegistration,
    getAllVaccinationServicesRegistration,
    getPatientsByPhone,
    createRegistration,
    getDiseaseByVaccinationId,
    createPayment,
} from '../../config/axios';
import { format } from 'date-fns';
import Box from "@mui/joy/Box";
import Button from "@mui/joy/Button";
import Checkbox from "@mui/joy/Checkbox";
import FormControl from "@mui/joy/FormControl";
import FormLabel from "@mui/joy/FormLabel";
import IconButton from "@mui/joy/IconButton";
import Input from "@mui/joy/Input";
import Typography from "@mui/joy/Typography";
import List from '@mui/joy/List';
import ListItem from '@mui/joy/ListItem';
import ListItemDecorator from '@mui/joy/ListItemDecorator';
import ListItemButton from '@mui/joy/ListItemButton';
import DeleteIcon from '@mui/icons-material/Delete';
import Card from '@mui/joy/Card';
import CardContent from '@mui/joy/CardContent';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import Table from '@mui/joy/Table';
import "./Registration.css" // Import CSS file

function Registration() {
    // ... (Các state và useEffect giữ nguyên)
    const [step, setStep] = useState(1);
    const [vaccinations, setVaccinations] = useState([]);
    const [vaccinationServices, setVaccinationServices] = useState([]);
    const [selectedVaccinations, setSelectedVaccinations] = useState([]);
    const [selectedService, setSelectedService] = useState(null);
    const [searchPhone, setSearchPhone] = useState('');
    const [foundPatients, setFoundPatients] = useState([]);
    const [selectedPatientIds, setSelectedPatientIds] = useState([]);
    const [newPatientData, setNewPatientData] = useState({
        dob: '',
        patientName: '',
        gender: '',
        guardianPhone: '',
        address: '',
        relationshipToAccount: '',
        phone: '',
        accountId: null,
    });
    const [desiredDate, setDesiredDate] = useState('');
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const [showVaccines, setShowVaccines] = useState(true);
    const [displaySelectedPatients, setDisplaySelectedPatients] = useState([]);
    const [registrationId, setRegistrationId] = useState(null);
    const [registrationDetails, setRegistrationDetails] = useState(null);
    const [selectedVaccineNames, setSelectedVaccineNames] = useState([]); // State for names
    const [selectedServiceName, setSelectedServiceName] = useState(""); // State for service name


    useEffect(() => {
        const accountId = localStorage.getItem('accountId');
        if (accountId) {
            setNewPatientData(prev => ({ ...prev, accountId: parseInt(accountId, 10) }));
        }
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const vaccinationsData = await getAllVaccinationRegistration();
                const servicesData = await getAllVaccinationServicesRegistration();

                const vaccinationsWithDiseases = await Promise.all(
                    vaccinationsData.map(async (vaccine) => {
                        try {
                            const diseasesResponse = await getDiseaseByVaccinationId(vaccine.vaccinationId);
                            const diseases = Array.isArray(diseasesResponse) ? diseasesResponse : [];
                            return { ...vaccine, diseases: diseases };
                        } catch (diseaseError) {
                            console.error(`Error fetching diseases for vaccine ${vaccine.vaccinationId}:`, diseaseError);
                            return { ...vaccine, diseases: [] };
                        }
                    })
                );
                setVaccinations(vaccinationsWithDiseases);
                setVaccinationServices(servicesData);

            } catch (error) {
                console.error("useEffect error:", error);
                setErrors({ fetch: error.message || 'Failed to fetch data.' });
                setVaccinations([]);
                setVaccinationServices([]);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
    }, []);

    const handleVaccineSelection = (vaccinationId, vaccinationName) => {
        if (selectedService !== null) {
            setErrors({ selection: 'You cannot select individual vaccines when a service is selected.' });
            return;
        }
        if (selectedVaccinations.includes(vaccinationId)) {
            setSelectedVaccinations(selectedVaccinations.filter((id) => id !== vaccinationId));
             setSelectedVaccineNames(selectedVaccineNames.filter(name => name !== vaccinationName));
        } else {
            setSelectedVaccinations([...selectedVaccinations, vaccinationId]);
            setSelectedVaccineNames([...selectedVaccineNames, vaccinationName]);
        }
        setErrors({ selection: '' });
    };

   const handleServiceSelection = (serviceId, serviceName) => {
        if (selectedVaccinations.length > 0) {
            setErrors({ selection: 'You cannot select a service when individual vaccines are selected.' });
            return;
        }
        setSelectedService(serviceId === selectedService ? null : serviceId);
        setSelectedServiceName(serviceId === selectedService ? "" : serviceName);
        setErrors({ selection: '' });
    };


    const handleSearchPatient = async () => {
        setLoading(true);
        setErrors({});
        try {
            const patients = await getPatientsByPhone(searchPhone);
            if (patients.length === 0) {
                setNewPatientData(prev => ({ ...prev, phone: searchPhone }));
                setFoundPatients([]);
            } else {
                setFoundPatients(patients);
            }
        } catch (error) {
            setErrors({ search: error.message || 'Failed to search for patients.' });
            setFoundPatients([]);
        } finally {
            setLoading(false);
        }
    };

    const handlePatientSelection = (patientId) => {
        const patient = foundPatients.find(p => p.patientId === patientId);
        if (!patient) return;

        if (selectedPatientIds.includes(patientId)) {
            setSelectedPatientIds(selectedPatientIds.filter((id) => id !== patientId));
            setDisplaySelectedPatients(prev => prev.filter((p) => p.patientId !== patientId));
        } else {
            setSelectedPatientIds([...selectedPatientIds, patientId]);
            setDisplaySelectedPatients([...displaySelectedPatients, patient]);
        }
    };

    const handleRemoveSelectedPatient = (patientId) => {
        setSelectedPatientIds(selectedPatientIds.filter((id) => id !== patientId));
        setDisplaySelectedPatients(prev => prev.filter((p) => p.patientId !== patientId));
    };

    const handleCreateRegistration = async () => {
        setLoading(true);
        setErrors({});
        if (!desiredDate) {
            setErrors({ desiredDate: 'Please select a desired vaccination date.' });
            setLoading(false);
            return;
        }
        try {
            const requestData = {
                accountId: localStorage.getItem('accountId') ? parseInt(localStorage.getItem('accountId'), 10) : null,
                registrationDate: format(new Date(), 'yyyy-MM-dd'),
                patientIds: selectedPatientIds,
                vaccinationIds: selectedVaccinations,
                serviceId: selectedService,
                desiredDate: format(new Date(desiredDate), 'yyyy-MM-dd'),
                status: 'Pending',
            };

            const response = await createRegistration(requestData);
            console.log("Response from createRegistration:", response);
            setSuccessMessage(`Registration created successfully!`);
            setRegistrationId(response.registrationID);
            setRegistrationDetails(response);
            setStep(4);
        } catch (error) {
            if (error.response) {
                setErrors({ createRegistration: error.response.data });
                console.error("Error data:", error.response.data);
                console.error("Error status:", error.response.status);
                console.error("Error headers:", error.response.headers);
            } else if (error.request) {
                setErrors({ createRegistration: "No response received from the server." });
                console.error("Error request:", error.request);
            } else {
                setErrors({ createRegistration: error.message || "An unexpected error occurred." });
                console.error("Error message:", error.message);
            }
        } finally {
            setLoading(false);
        }
    };

    const handlePayment = async () => {
        setLoading(true);
        setErrors({});

        try {
            if (!registrationId) {
                setErrors({ payment: "Registration ID is missing." });
                return;
            }
            const paymentResponse = await createPayment(registrationId);

            const paymentUrl = paymentResponse.paymentUrl;
            if (!paymentUrl) {
                setErrors({ payment: "Payment URL is missing." });
                return;
            }

            window.location.href = paymentUrl;
        } catch (error) {
            console.error("Payment error:", error);
            setErrors({ payment: error.message || 'Failed to process payment.' });
        } finally {
            setLoading(false);
        }
    };

    const handleDateChange = (event) => {
        const selectedDate = event.target.value;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const selected = new Date(selectedDate);

        if (selected < today) {
            setErrors({ desiredDate: 'Please select a future date.' });
        } else {
            setErrors({ desiredDate: '' });
            setDesiredDate(selectedDate);
        }
    };

    const handleNextStepToStep2 = () => {
        if ((selectedVaccinations.length === 0 && selectedService === null)) {
            setErrors({ selection: 'Please select at least one vaccine or a service.' });
            return;
        }
        setStep(2);
    };

    const handleNextStepToStep3 = () => {
        if (selectedPatientIds.length === 0) {
            setErrors({ patientSelection: 'Please select or create at least one patient.' });
            return;
        }
        setStep(3);
    };
    return (
       <Box>
            <Header />
             {/* Thêm tiêu đề "Đăng Ký Tiêm Chủng" */}
            <Typography
                level="h2"
                component="h1" // Semantic HTML
                sx={{ textAlign: 'center', marginTop: '20px', marginBottom: '0px' }}
            >
                Đăng Ký Tiêm Chủng
            </Typography>
            <Box className="RegistrationContainer">

                {
                    step === 1 && (
                        <Box sx={{ marginBottom: '24px' }}>
                            <Typography
                                variant="h4"
                                component="h2"
                                className="RegistrationStepHeading"
                            >
                                Bước 1: Chọn Vaccine hoặc gói
                            </Typography>
                            {errors.selection && (
                                <Typography
                                    className="RegistrationErrorMessage"
                                >
                                    {errors.selection}
                                </Typography>
                            )}

                            <Box className="RegistrationButtonGroup">
                                <Button
                                    onClick={() => setShowVaccines(true)}
                                    variant={showVaccines ? 'soft' : 'plain'}
                                >
                                    Vaccines
                                </Button>
                                <Button
                                    onClick={() => setShowVaccines(false)}
                                    variant={!showVaccines ? 'soft' : 'plain'}
                                >
                                    Gói tiêm
                                </Button>
                            </Box>

                           <Box className="RegistrationStepContent">
                                <Box className="RegistrationSelectionList">
                                {showVaccines ? (
                                        <Box className = "RegistrationVaccinationListContainer">
                                            {loading && <Box className="RegistrationLoadingIndicator">Loading vaccines...</Box>}
                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
                                                {vaccinations.map((vaccine) => (
                                                    <Card
                                                        key={vaccine.vaccinationId}
                                                        variant="outlined"
                                                        className={`${selectedVaccinations.includes(vaccine.vaccinationId)
                                                            ? 'RegistrationCardSelected'
                                                            : 'RegistrationCard'}`}  /* Thêm class động */

                                                        onClick={() => handleVaccineSelection(vaccine.vaccinationId, vaccine.vaccinationName)}
                                                    >
                                                        <CardContent>
                                                            <Typography level="h6" component="h3">
                                                                {vaccine.vaccinationName}
                                                            </Typography>
                                                            <Typography level="body-sm">
                                                                <strong>Nguồn gốc:</strong> {vaccine.manufacturer}
                                                            </Typography>
                                                            <Typography level="body-sm">
                                                                <strong>Giá:</strong> {vaccine.price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                                                            </Typography>
                                                            <Typography level="body-sm">
                                                                <strong>Phòng bệnh:</strong>
                                                                {vaccine.diseases.length > 0 ? (
                                                                    <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
                                                                        {vaccine.diseases.map((disease) => (
                                                                            <li key={disease.diseaseId} style={{ display: 'inline-block', marginRight: '8px' }}>
                                                                                {disease.diseaseName},
                                                                            </li>
                                                                        ))}
                                                                    </ul>
                                                                ) : (
                                                                    'None'
                                                                )}
                                                            </Typography>
                                                        </CardContent>
                                                    </Card>
                                                ))}
                                            </Box>
                                        </Box>
                                    ) : (
                                     <Box className = "RegistrationServiceListContainer">
                                            {loading && <Box className="RegistrationLoadingIndicator">Loading services...</Box>}
                                             <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
                                                {vaccinationServices.map((service) => (
                                                    <Card
                                                        key={service.serviceID}
                                                        variant="outlined"
                                                        className={`${selectedService === service.serviceID ? 'RegistrationCardSelected' : 'RegistrationCard'}`}
                                                        onClick={() => handleServiceSelection(service.serviceID, service.serviceName)}
                                                    >
                                                        <CardContent>
                                                            <Typography level="h6" component="h3">
                                                                {service.serviceName}
                                                            </Typography>
                                                            <Typography level="body-sm">
                                                                <strong>Price:</strong> {service.price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                                                            </Typography>
                                                        </CardContent>
                                                    </Card>
                                                ))}
                                            </Box>
                                        </Box>
                                    )}
                                </Box>

                                <Box className="RegistrationSelectedTable">
                                    <Typography level="h6" component="h3" gutterBottom>
                                        Vaccine/Gói đã chọn:
                                    </Typography>
                                    {selectedVaccineNames.length > 0 && (
                                        <Table>
                                            <thead>
                                                <tr>
                                                    <th>Tên Vaccine</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {selectedVaccineNames.map((name) => (
                                                    <tr key={name}>
                                                        <td>{name}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </Table>
                                    )}

                                    {selectedServiceName && (
                                         <Table>
                                         <thead>
                                            <tr>
                                                 <th>Tên Gói</th>
                                              </tr>
                                          </thead>
                                          <tbody>
                                                <tr>
                                                <td>{selectedServiceName}</td>
                                                   </tr>
                                                </tbody>
                                            </Table>
                                    )}
                                     <Button onClick={handleNextStepToStep2} variant="solid" color="primary" sx={{ marginTop: 2 }}>
                                        Xác nhận
                                      </Button>
                                </Box>
                            </Box>
                        </Box>
                    )
                }

                {
                    step === 2 && (
                         <Box sx={{ padding: '10px', marginBottom: '0px' }}>
                           <Typography
                                variant="h4"
                                component="h2"
                                className="RegistrationStepHeading"
                            >
                                Bước 2: Chọn hồ sơ tiêm
                            </Typography>
                             {errors.patientSelection &&  <Typography className="RegistrationErrorMessage">

                                    {errors.patientSelection}
                                </Typography>}
                             <FormControl >
                                <FormLabel>Nhập số điện thoại của người tiêm để đăng kí</FormLabel>
                                <Input
                                    type="text"
                                    value={searchPhone}
                                    onChange={(e) => setSearchPhone(e.target.value)}
                                    placeholder="Nhập số điện thoại của người tiêm"

                                    sx={{ marginBottom: 0 }}

                                    endDecorator={
                                        <Button onClick={handleSearchPatient} disabled={loading}  className='RegistrationSearchButton'>
                                            {loading ? "Searching..." : "Kiếm hồ sơ người tiêm"}
                                        </Button>
                                    }
                                />
                            </FormControl>

                            {errors.search &&   <Typography className="RegistrationErrorMessage">
                                    {errors.search}
                                </Typography>}

                            {foundPatients.length > 0 && (
                                 <Box  className = "RegistrationPatientListContainer">
                                    <h3>Hồ sơ người tiêm:</h3>
                                    {foundPatients.map((patient) => (
                                         <Box  className='RegistrationCheckboxContainer'>
                                            <Checkbox
                                                label={String(`${patient.patientName} - ${patient.phone}`)}
                                                checked={selectedPatientIds.includes(patient.patientId)}
                                                onChange={() => handlePatientSelection(patient.patientId)}
                                            >
                                            </Checkbox>
                                        </Box>
                                    ))}
                                </Box>
                            )}
                            {displaySelectedPatients.length > 0 && (
                                <Box className="RegistrationSelectedPatients">
                                     <Typography variant="h6" component="h3">
                                        Hồ sơ người tiêm đã được chọn:
                                    </Typography>
                                    <List>
                                         {displaySelectedPatients.map((patient) => (
                                            <ListItem key={patient.patientId} secondaryAction={
                                                <IconButton edge="end" aria-label="delete" onClick={() => handleRemoveSelectedPatient(patient.patientId)}>
                                                    <DeleteIcon />
                                                </IconButton>
                                            }>
                                                <ListItemButton>
                                                    <ListItemDecorator>
                                                        {/* Add a user avatar here if you have one */}
                                                    </ListItemDecorator>
                                                    {patient.patientName} - {patient.phone}
                                                </ListItemButton>
                                            </ListItem>
                                        ))}
                                    </List>
                                </Box>
                            )}

                            <Button onClick={handleNextStepToStep3} variant="solid" color="primary" className="RegistrationNextButton">Next</Button>
                        </Box>
                    )
                }

                {
                   step === 3 && (
                        <Box sx={{ padding: '24px', marginBottom: '24px' }}>
                            <Typography
                                variant="h4"
                                component="h2"
                                 className="RegistrationStepHeading"
                            >
                                Bước 3: Xác nhận thông tin đăng kí
                            </Typography>
                            <Typography variant="h6" component="h3" gutterBottom>
                                Vaccine/Gói tiêm đã chọn:
                            </Typography>

                            {selectedService && (
                               <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
                                    {vaccinationServices
                                        .filter((service) => service.serviceID === selectedService)
                                        .map((service) => (
                                            <Card
                                                key={service.serviceID}
                                                variant="outlined"
                                                 className='RegistrationCardSelected'
                                            >
                                                <CardContent>
                                                    <Typography level="h6" component="h3">
                                                        {service.serviceName}
                                                    </Typography>
                                                    <Typography level="body-sm">
                                                        <strong>Price:</strong> {service.price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                                                    </Typography>
                                                </CardContent>
                                            </Card>
                                        ))}
                                </Box>
                            )}

                            {selectedVaccinations.length > 0 && (
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
                                    {vaccinations
                                        .filter((vaccine) => selectedVaccinations.includes(vaccine.vaccinationId))
                                        .map((vaccine) => (
                                            <Card
                                                key={vaccine.vaccinationId}
                                                variant="outlined"
                                                 className='RegistrationCardSelected'
                                            >
                                                <CardContent>
                                                    <Typography level="h6" component="h3">
                                                        {vaccine.vaccinationName}
                                                    </Typography>
                                                    <Typography level="body-sm">
                                                        <strong>Nguồn gốc:</strong> {vaccine.manufacturer}
                                                    </Typography>
                                                    <Typography level="body-sm">
                                                        <strong>Giá:</strong> {vaccine.price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                                                    </Typography>
                                                </CardContent>
                                            </Card>
                                        ))}
                                </Box>
                            )}

                            {!selectedService && selectedVaccinations.length === 0 && (
                                <p>No vaccinations or service selected.</p>
                            )}

                            <Typography level="body-md" sx={{ marginTop: '15px' }}>Người tiêm được đăng kí:</Typography>

                            {displaySelectedPatients.length > 0 ? (
                                <ul>
                                    {displaySelectedPatients.map((patient) => (
                                        <li key={patient.patientId}>{patient.patientName} - {patient.phone}</li>
                                    ))}
                                </ul>
                            ) : (
                                <p>No patients selected.</p>
                            )}

                            <FormControl required  className = "RegistrationFormControlGroup">
                                <FormLabel>Ngày tiêm mong muốn:</FormLabel>
                                <Input
                                    type="date"
                                    value={desiredDate}
                                    onChange={handleDateChange}
                                />
                                 {errors.desiredDate &&   <Typography className="RegistrationErrorMessage">
                                        {errors.desiredDate}
                                    </Typography>}
                            </FormControl>
                            {errors.createRegistration ? (
                                <Typography className="RegistrationErrorMessage">
                                    {errors.createRegistration}
                                </Typography>
                            ) : null}
                            <Button
                                onClick={handleCreateRegistration}
                                variant="solid"
                                color="primary"
                                className='RegistrationCreateButton'
                                disabled={loading || !desiredDate}
                            >
                                {loading ? 'Creating Registration...' : 'Xác nhận thông tin đăng kí'}
                            </Button>
                        </Box>
                    )
                }

                {
                    step === 4 && (
                         <Box sx={{ padding: '24px', marginBottom: '24px' }}>
                            <Typography
                                variant="h4"
                                component="h2"
                                 className="RegistrationStepHeading"
                            >
                                Bước 4: Xác nhận thông tin thanh toán
                            </Typography>
                            {registrationDetails && (
                                <div>
                                    <Typography variant="body1">
                                        <strong>Ngày đăng kí:</strong> {registrationDetails.registrationDate}
                                    </Typography>
                                    <Typography variant="body1">
                                        <strong>Trạng thái:</strong> {registrationDetails.status}
                                    </Typography>
                                    <Typography variant="body1">
                                        <strong>Giá tiền:</strong> {registrationDetails?.totalAmount?.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                                    </Typography>
                                </div>
                            )}

                            <Button
                                onClick={handlePayment}
                                variant="solid"
                                color="primary"
                               className="RegistrationPaymentButton"
                                disabled={loading}
                            >
                                {loading ? 'Processing Payment...' : 'Thanh toán'}
                            </Button>
                        </Box>
                    )
                }
            </Box>
            <Footer />
        </Box>
    );
}
export default Registration;