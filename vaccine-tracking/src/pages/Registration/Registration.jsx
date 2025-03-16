import React, { useState, useEffect } from 'react';
import {
    getAllVaccinationRegistration,
    getAllVaccinationServicesRegistration,
    getPatientsByPhone,
    createPatient,
    createRegistration,
    getDiseaseByVaccinationId,
    createPayment,
} from '../../config/axios';
import { format } from 'date-fns';
import Box from "@mui/joy/Box";
import Button from "@mui/joy/Button";
import Checkbox from "@mui/joy/Checkbox";
import Divider from "@mui/joy/Divider";
import FormControl from "@mui/joy/FormControl";
import FormLabel from "@mui/joy/FormLabel";
import IconButton from "@mui/joy/IconButton";
import Link from "@mui/joy/Link";
import Input from "@mui/joy/Input";
import Typography from "@mui/joy/Typography";
import Stack from "@mui/joy/Stack";
import Select from '@mui/joy/Select';
import Option from '@mui/joy/Option';
import List from '@mui/joy/List';
import ListItem from '@mui/joy/ListItem';
import ListItemDecorator from '@mui/joy/ListItemDecorator';
import ListItemButton from '@mui/joy/ListItemButton';
import DeleteIcon from '@mui/icons-material/Delete';
import Chip from '@mui/joy/Chip';
import Card from '@mui/joy/Card';
import CardContent from '@mui/joy/CardContent';

import './Registration.css';

function Registration() {
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
    const [showCreatePatientForm, setShowCreatePatientForm] = useState(false);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const [showVaccines, setShowVaccines] = useState(true);
    const [displaySelectedPatients, setDisplaySelectedPatients] = useState([]);
    const [registrationId, setRegistrationId] = useState(null);
    const [registrationDetails, setRegistrationDetails] = useState(null);
    const [paymentSuccess, setPaymentSuccess] = useState(false); // State để kiểm soát thông báo thanh toán thành công

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
        const queryParams = new URLSearchParams(window.location.search);
        const responseCode = queryParams.get('vnp_ResponseCode'); // Kiểm tra mã phản hồi từ VNPay

        if (responseCode === '00') { // '00' là mã thành công từ VNPay
            setPaymentSuccess(true);
        }
    }, []);

    const handleVaccineSelection = (vaccinationId) => {
        if (selectedService !== null) {
            setErrors({ selection: 'You cannot select individual vaccines when a service is selected.' });
            return;
        }
        if (selectedVaccinations.includes(vaccinationId)) {
            setSelectedVaccinations(selectedVaccinations.filter((id) => id !== vaccinationId));
        } else {
            setSelectedVaccinations([...selectedVaccinations, vaccinationId]);
        }
        setErrors({ selection: '' });
    };

    const handleServiceSelection = (serviceId) => {
        if (selectedVaccinations.length > 0) {
            setErrors({ selection: 'You cannot select a service when individual vaccines are selected.' });
            return;
        }
        setSelectedService(serviceId === selectedService ? null : serviceId);
        setErrors({ selection: '' });
    };

    const handleSearchPatient = async () => {
        setLoading(true);
        setErrors({});
        try {
            const patients = await getPatientsByPhone(searchPhone);
            if (patients.length === 0) {
                setShowCreatePatientForm(true);
                setNewPatientData(prev => ({ ...prev, phone: searchPhone }));
                setFoundPatients([]);
            } else {
                setFoundPatients(patients);
                setShowCreatePatientForm(false);
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

    const handleCreatePatient = async () => {
        const validationErrors = {};
        if (!newPatientData.dob) validationErrors.dob = 'Date of Birth is required.';
        if (!newPatientData.patientName) validationErrors.patientName = 'Patient Name is required.';
        if (!newPatientData.gender) validationErrors.gender = 'Gender is required.';
        if (!newPatientData.phone) validationErrors.phone = "Phone is required";

        if (Object.keys(validationErrors).length > 0) {
            setErrors({ ...errors, createPatient: validationErrors });
            return;
        }

        try {
            const createdPatient = await createPatient(newPatientData);
            setSelectedPatientIds([...selectedPatientIds, createdPatient.patientId]);
            setDisplaySelectedPatients([...displaySelectedPatients, createdPatient]);
            setShowCreatePatientForm(false);
            setNewPatientData({
                dob: '',
                patientName: '',
                gender: '',
                guardianPhone: '',
                address: '',
                relationshipToAccount: '',
                phone: '',
                accountId: localStorage.getItem('accountId') ? parseInt(localStorage.getItem('accountId'), 10) : null,
            });
            setFoundPatients([...foundPatients, createdPatient]);
        } catch (error) {
            setErrors({ ...errors, createPatient: { general: error.message || 'Failed to create patient.' } });
        }
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
        <div className="registration-container">
            {paymentSuccess && (
                <div style={{
                    position: 'fixed',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    backgroundColor: 'green',
                    color: 'white',
                    padding: '20px',
                    borderRadius: '10px',
                    zIndex: 1000
                }}>
                    Payment Successful!
                </div>
            )}

            {successMessage && <div className='registration-success-message'>{successMessage}</div>}

            {/* Step 1: Select Vaccinations or Service */}
            {step === 1 && (
                <>
                    <h2 className='registration-step-heading'>Step 1: Select Vaccinations or Service</h2>
                    {errors.selection && <p className="registration-error-message">{errors.selection}</p>}

                    <div className='registration-button-group'>
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
                            Vaccination Services
                        </Button>
                    </div>

                    {showVaccines ? (
                        <div className='registration-vaccination-list-container'>
                            {loading && <p className='registration-loading-indicator'>Loading vaccines...</p>}
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
                                {vaccinations.map((vaccination) => (
                                    <Card
                                        key={vaccination.vaccinationId}
                                        variant="outlined"
                                        sx={{
                                            width: '300px',
                                            cursor: 'pointer',
                                            backgroundColor: selectedVaccinations.includes(vaccination.vaccinationId)
                                                ? '#a5d6a7'
                                                : 'inherit',
                                            borderColor: selectedVaccinations.includes(vaccination.vaccinationId)
                                                ? '#4caf50'
                                                : 'inherit',
                                        }}
                                        onClick={() => handleVaccineSelection(vaccination.vaccinationId)}
                                    >
                                        <CardContent>
                                            <Typography level="h6" component="h3">
                                                {vaccination.vaccinationName}
                                            </Typography>
                                            <Typography level="body-sm">
                                                <strong>Manufacturer:</strong> {vaccination.manufacturer}
                                            </Typography>
                                            <Typography level="body-sm">
                                                <strong>Price:</strong> {vaccination.price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                                            </Typography>
                                            <Typography level="body-sm">
                                                <strong>Diseases:</strong>
                                                {vaccination.diseases.length > 0 ? (
                                                    <ul>
                                                        {vaccination.diseases.map((disease) => (
                                                            <li key={disease.diseaseId}>
                                                                {disease.diseaseName}: {disease.description}
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
                            </div>
                        </div>
                    ) : (
                        <div className='registration-service-list-container'>
                            {loading && <p className='registration-loading-indicator'>Loading services...</p>}
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
                                {vaccinationServices.map((service) => (
                                    <Card
                                        key={service.serviceID}
                                        variant="outlined"
                                        sx={{
                                            width: '300px',
                                            cursor: 'pointer',
                                            backgroundColor: selectedService === service.serviceID
                                                ? '#a5d6a7'
                                                : 'inherit',
                                            borderColor: selectedService === service.serviceID
                                                ? '#4caf50'
                                                : 'inherit',
                                        }}
                                        onClick={() => handleServiceSelection(service.serviceID)}
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
                            </div>
                        </div>
                    )}

                    <Button onClick={handleNextStepToStep2} variant="solid" color="primary" className='registration-next-button'>Next</Button>
                </>
            )}

            {/* Step 2: Select Patients */}
            {step === 2 && (
                <div>
                    <h2 className='registration-step-heading'>Step 2: Select Patients</h2>
                    {errors.patientSelection && <p className="registration-error-message">{errors.patientSelection}</p>}
                    <FormControl className='registration-form-control-group'>
                        <FormLabel>Enter patient phone number</FormLabel>
                        <Input
                            type="text"
                            value={searchPhone}
                            onChange={(e) => setSearchPhone(e.target.value)}
                            placeholder="Enter patient phone number"
                            endDecorator={
                                <Button onClick={handleSearchPatient} disabled={loading} className='registration-search-button'>
                                    {loading ? "Searching..." : "Search Patient"}
                                </Button>
                            }
                        />
                    </FormControl>

                    {errors.search && <p className="registration-error-message">{errors.search}</p>}

                    {foundPatients.length > 0 && (
                        <div className='registration-patient-list-container'>
                            <h3>Found Patients:</h3>
                            {foundPatients.map((patient) => (
                                <div key={patient.patientId} className='registration-checkbox-container'>
                                    <Checkbox
                                        key={patient.patientId}
                                        label={String(`${patient.patientName} - ${patient.phone}`)}
                                        checked={selectedPatientIds.includes(patient.patientId)}
                                        onChange={() => handlePatientSelection(patient.patientId)}
                                    >
                                    </Checkbox>
                                </div>
                            ))}
                        </div>
                    )}

                    {showCreatePatientForm && (
                        <div>
                            <h3>Create New Patient</h3>
                            {errors.createPatient && errors.createPatient.general && (
                                <p className="registration-error-message">{errors.createPatient.general}</p>
                            )}
                            <FormControl required className='registration-form-control-group'>
                                <FormLabel>Date of Birth:</FormLabel>
                                <Input
                                    type="date"
                                    value={newPatientData.dob}
                                    onChange={(e) =>
                                        setNewPatientData({ ...newPatientData, dob: e.target.value })
                                    }
                                />
                                {errors.createPatient && errors.createPatient.dob && (
                                    <p className="registration-error-message">{errors.createPatient.dob}</p>
                                )}
                            </FormControl>
                            <FormControl required className='registration-form-control-group'>
                                <FormLabel>Patient Name:</FormLabel>
                                <Input
                                    type="text"
                                    value={newPatientData.patientName}
                                    onChange={(e) =>
                                        setNewPatientData({ ...newPatientData, patientName: e.target.value })
                                    }
                                />
                                {errors.createPatient && errors.createPatient.patientName && (
                                    <p className="registration-error-message">{errors.createPatient.patientName}</p>
                                )}
                            </FormControl>
                            <FormControl required className='registration-form-control-group'>
                                <FormLabel>Gender:</FormLabel>
                                <Select
                                    value={newPatientData.gender}
                                    onChange={(event, newValue) =>
                                        setNewPatientData({ ...newPatientData, gender: newValue })
                                    }
                                >
                                    <Option value="">Select</Option>
                                    <Option value="Male">Male</Option>
                                    <Option value="Female">Female</Option>
                                    <Option value="Other">Other</Option>
                                </Select>

                                {errors.createPatient && errors.createPatient.gender && (
                                    <p className="registration-error-message">{errors.createPatient.gender}</p>
                                )}
                            </FormControl>

                            <FormControl className='registration-form-control-group'>
                                <FormLabel>Guardian Phone:</FormLabel>
                                <Input
                                    type="text"
                                    value={newPatientData.guardianPhone}
                                    onChange={(e) =>
                                        setNewPatientData({ ...newPatientData, guardianPhone: e.target.value })
                                    }
                                />
                            </FormControl>
                            <FormControl className='registration-form-control-group'>
                                <FormLabel>Address:</FormLabel>
                                <Input
                                    type="text"
                                    value={newPatientData.address}
                                    onChange={(e) =>
                                        setNewPatientData({ ...newPatientData, address: e.target.value })
                                    }
                                />
                            </FormControl>
                            <FormControl className='registration-form-control-group'>
                                <FormLabel>Relationship to Account:</FormLabel>
                                <Input
                                    type="text"
                                    value={newPatientData.relationshipToAccount}
                                    onChange={(e) =>
                                        setNewPatientData({
                                            ...newPatientData,
                                            relationshipToAccount: e.target.value,
                                        })
                                    }
                                />
                            </FormControl>
                            <FormControl required className='registration-form-control-group'>
                                <FormLabel>Phone:</FormLabel>
                                <Input
                                    type="text"
                                    value={newPatientData.phone}
                                    onChange={(e) =>
                                        setNewPatientData({ ...newPatientData, phone: e.target.value })
                                    }
                                />
                                {errors.createPatient && errors.createPatient.phone && (
                                    <p className="registration-error-message">{errors.createPatient.phone}</p>
                                )}
                            </FormControl>
                            <Button type="button" onClick={handleCreatePatient} variant="solid" color="primary" className='registration-create-patient-button'>
                                Create Patient
                            </Button>
                        </div>
                    )}

                    {displaySelectedPatients.length > 0 && (
                        <div className='registration-selected-patients'>
                            <Typography variant="h6" component="h3">
                                Selected Patients:
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
                                                {/* You could add a user avatar here if you have one */}
                                            </ListItemDecorator>
                                            {patient.patientName} - {patient.phone}
                                        </ListItemButton>
                                    </ListItem>
                                ))}
                            </List>
                        </div>
                    )}

                    <Button onClick={handleNextStepToStep3} variant="solid" color="primary" className='registration-next-button'>Next</Button>
                </div>
            )}

            {/* Step 3: Confirm Registration */}
            {step === 3 && (
                <div>
                    <h2 className='registration-step-heading'>Step 3: Confirm Registration</h2>
                    <Typography variant="h6" component="h3" gutterBottom>
                        Selected Vaccinations/Service:
                    </Typography>

                    {selectedService && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
                            {vaccinationServices
                                .filter((service) => service.serviceID === selectedService)
                                .map((service) => (
                                    <Card
                                        key={service.serviceID}
                                        variant="outlined"
                                        sx={{
                                            width: '300px',
                                            backgroundColor: '#a5d6a7',
                                            borderColor: '#4caf50',
                                        }}
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
                        </div>
                    )}

                    {selectedVaccinations.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
                            {vaccinations
                                .filter((vaccine) => selectedVaccinations.includes(vaccine.vaccinationId))
                                .map((vaccine) => (
                                    <Card
                                        key={vaccine.vaccinationId}
                                        variant="outlined"
                                        sx={{
                                            width: '300px',
                                            backgroundColor: '#a5d6a7',
                                            borderColor: '#4caf50',
                                        }}
                                    >
                                        <CardContent>
                                            <Typography level="h6" component="h3">
                                                {vaccine.vaccinationName}
                                            </Typography>
                                            <Typography level="body-sm">
                                                <strong>Manufacturer:</strong> {vaccine.manufacturer}
                                            </Typography>
                                            <Typography level="body-sm">
                                                <strong>Price:</strong> {vaccine.price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                                            </Typography>
                                            <Typography level="body-sm">
                                                <strong>Diseases:</strong>
                                                {vaccine.diseases.length > 0 ? (
                                                    <ul>
                                                        {vaccine.diseases.map((disease) => (
                                                            <li key={disease.diseaseId}>
                                                                {disease.diseaseName}: {disease.description}
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
                        </div>
                    )}

                    {!selectedService && selectedVaccinations.length === 0 && (
                        <p>No vaccinations or service selected.</p>
                    )}

                    <Typography level="body-md" sx={{ marginTop: '15px' }}>Selected Patients:</Typography>

                    {displaySelectedPatients.length > 0 ? (
                        <ul>
                            {displaySelectedPatients.map((patient) => (
                                <li key={patient.patientId}>{patient.patientName} - {patient.phone}</li>
                            ))}
                        </ul>
                    ) : (
                        <p>No patients selected.</p>
                    )}

                    <FormControl required className='registration-form-control-group'>
                        <FormLabel>Desired Vaccination Date:</FormLabel>
                        <Input
                            type="date"
                            value={desiredDate}
                            onChange={handleDateChange}
                        />
                        {errors.desiredDate && <p className="registration-error-message">{errors.desiredDate}</p>}
                    </FormControl>
                    {errors.createRegistration && (
                        <p className="registration-error-message">{errors.createRegistration}</p>
                    )}
                    <Button
                        onClick={handleCreateRegistration}
                        variant="solid"
                        color="primary"
                        className='registration-create-button'
                        disabled={loading || !desiredDate}
                    >
                        {loading ? 'Creating Registration...' : 'Create Registration'}
                    </Button>
                </div>
            )}

            {/* Step 4: Payment Confirmation */}
            {step === 4 && (
                <div>
                    <h2 className='registration-step-heading'>Step 4: Payment Confirmation</h2>
                    {registrationDetails && (
                        <div>
                            <Typography variant="body1">
                                <strong>Registration ID:</strong> {registrationDetails.registrationID}
                            </Typography>
                            <Typography variant="body1">
                                <strong>Registration Date:</strong> {registrationDetails.registrationDate}
                            </Typography>
                            <Typography variant="body1">
                                <strong>Status:</strong> {registrationDetails.status}
                            </Typography>
                            <Typography variant="body1">
                                <strong>Total Amount:</strong> {registrationDetails?.totalAmount?.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                            </Typography>
                        </div>
                    )}

                    <Button
                        onClick={handlePayment}
                        variant="solid"
                        color="primary"
                        className='registration-payment-button'
                        disabled={loading}
                    >
                        {loading ? 'Processing Payment...' : 'Proceed to Payment'}
                    </Button>
                </div>
            )}
        </div>
    );
}

export default Registration;