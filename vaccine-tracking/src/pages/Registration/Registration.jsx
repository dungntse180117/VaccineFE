import React, { useState, useEffect } from 'react';
import {
    getAllVaccinationRegistration,
    getAllVaccinationServicesRegistration,
    getPatientsByPhone,
    createPatient,
    createRegistration,
} from '../../config/axios'; // Corrected import path
import { format } from 'date-fns';
import {
    CssVarsProvider,
    extendTheme,
  } from "@mui/joy/styles";
import GlobalStyles from "@mui/joy/GlobalStyles";
import CssBaseline from "@mui/joy/CssBaseline";
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
import './Registration.css'; // Import the CSS

function Registration() {
    const [step, setStep] = useState(1); // 1: Choose Vaccine/Service, 2: Choose Patients, 3: Confirm
    const [vaccinations, setVaccinations] = useState([]); // Initialize as an empty array
    const [vaccinationServices, setVaccinationServices] = useState([]);
    const [selectedVaccinations, setSelectedVaccinations] = useState([]); // For individual vaccinations
    const [selectedService, setSelectedService] = useState(null); // For a single service
    const [searchPhone, setSearchPhone] = useState('');
    const [foundPatients, setFoundPatients] = useState([]);
    const [selectedPatientIds, setSelectedPatientIds] = useState([]);
    const [newPatientData, setNewPatientData] = useState({ // For creating a new patient
        dob: '',
        patientName: '',
        gender: '',
        guardianPhone: '',
        address: '',
        relationshipToAccount: '',
        phone: '',
        accountId: null, // Initialize accountId
    });
    const [desiredDate, setDesiredDate] = useState('');
    const [showCreatePatientForm, setShowCreatePatientForm] = useState(false);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const [showVaccines, setShowVaccines] = useState(true); // Toggle between vaccines and services
    // New state for displaying selected patients *within* step 2
    const [displaySelectedPatients, setDisplaySelectedPatients] = useState([]);

      useEffect(() => {
        // Get accountId from localStorage
        const accountId = localStorage.getItem('accountId');
        if (accountId) {
            setNewPatientData(prev => ({ ...prev, accountId: parseInt(accountId, 10) })); // Set accountId
        }
      },[]);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const vaccinationsData = await getAllVaccinationRegistration();
                 // Ensure the API call returns an array.
                if (Array.isArray(vaccinationsData)) {
                    setVaccinations(vaccinationsData);
                } else {
                    console.error("getAllVaccination did not return an array:", vaccinationsData);
                    setVaccinations([]); // Set to empty array if not an array
                    setErrors({fetch: "Failed to fetch vaccinations: Data is not an array."})
                }
                const servicesData = await getAllVaccinationServicesRegistration();
                setVaccinationServices(servicesData);
            } catch (error) {
                setErrors({ fetch: error.message || 'Failed to fetch data.' });
                setVaccinations([]); // Ensure vaccinations is an empty array on error
            } finally {
                setLoading(false);
            }
        };
        fetchData();
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
        setErrors({ selection: '' }); // Clear error
    };

    const handleServiceSelection = (serviceId) => {
        if (selectedVaccinations.length > 0) {
            setErrors({ selection: 'You cannot select a service when individual vaccines are selected.' });
            return;
        }
        setSelectedService(serviceId === selectedService ? null : serviceId); // Toggle selection
        setErrors({ selection: '' }); // Clear error
    };


    const handleSearchPatient = async () => {
        setLoading(true);
        setErrors({}); // Clear previous errors
        try {
            const patients = await getPatientsByPhone(searchPhone);
            if (patients.length === 0) {
                setShowCreatePatientForm(true);
                setNewPatientData(prev => ({ ...prev, phone: searchPhone })); //Pre-fill phone
                setFoundPatients([]); // Set to empty if not found
            } else {
                setFoundPatients(patients);
                setShowCreatePatientForm(false) //Hide create patient form
            }

        } catch (error) {
            setErrors({ search: error.message || 'Failed to search for patients.' });
             setFoundPatients([]); // Set to empty on error
        } finally {
            setLoading(false);
        }
    };

     const handlePatientSelection = (patientId) => {
        const patient = foundPatients.find(p => p.patientId === patientId);
        if (!patient) return; // Safety check

        if (selectedPatientIds.includes(patientId)) {
            setSelectedPatientIds(selectedPatientIds.filter((id) => id !== patientId));
             setDisplaySelectedPatients(displaySelectedPatients.filter((p) => p.patientId !== patientId));
        } else {
            setSelectedPatientIds([...selectedPatientIds, patientId]);
            setDisplaySelectedPatients([...displaySelectedPatients, patient]); // Add the *patient object*
        }
    };

    //Remove patient from displaySelectedPatient
    const handleRemoveSelectedPatient = (patientId) => {
        setSelectedPatientIds(selectedPatientIds.filter((id) => id !== patientId));
        setDisplaySelectedPatients(displaySelectedPatients.filter((p) => p.patientId !== patientId));
    };
    const handleCreatePatient = async () => {
        // Validate new patient data
        const validationErrors = {};
        if (!newPatientData.dob) validationErrors.dob = 'Date of Birth is required.';
        if (!newPatientData.patientName) validationErrors.patientName = 'Patient Name is required.';
        if (!newPatientData.gender) validationErrors.gender = 'Gender is required.';
        if (!newPatientData.phone) validationErrors.phone = "Phone is required"
        // Add other validations as needed

        if (Object.keys(validationErrors).length > 0) {
            setErrors({ ...errors, createPatient: validationErrors });
            return;
        }

        try {
            const createdPatient = await createPatient(newPatientData);
            // Add the newly created patient to the selected patients
            setSelectedPatientIds([...selectedPatientIds, createdPatient.patientId]);
             // Add to displaySelectedPatients as well
            setDisplaySelectedPatients([...displaySelectedPatients, createdPatient]);
            setShowCreatePatientForm(false); // Hide the form
            setNewPatientData({  // Reset form
                dob: '',
                patientName: '',
                gender: '',
                guardianPhone: '',
                address: '',
                relationshipToAccount: '',
                phone: '',
                accountId: localStorage.getItem('accountId') ? parseInt(localStorage.getItem('accountId'), 10) : null, //Keep account ID
            });
            setFoundPatients([...foundPatients, createdPatient]) // Add new patient to found patient list
        } catch (error) {
            setErrors({ ...errors, createPatient: { general: error.message || 'Failed to create patient.' } });
        }
    };
    const handleNextStep = () => {

        if (step === 1) {
            if ((selectedVaccinations.length === 0 && selectedService === null)) {
                setErrors({ selection: 'Please select at least one vaccine or a service.' });
                return;
            }
            setStep(2)

        }
        else if(step === 2){
            if (selectedPatientIds.length === 0) {
                setErrors({ patientSelection: 'Please select or create at least one patient.' });
                return;
            }
            setStep(3);
        }
    };

    const handleCreateRegistrationSubmit = async () => {
        setLoading(true);
        setErrors({});
        if (!desiredDate) {
            setErrors({ desiredDate: 'Please select a desired vaccination date.' });
            setLoading(false);
            return;
        }
        try {
            const requestData = {
                accountId: localStorage.getItem('accountId') ? parseInt(localStorage.getItem('accountId'), 10) : null, // Get accountId from localStorage
                registrationDate: format(new Date(), 'yyyy-MM-dd'), // Format current date
                patientIds: selectedPatientIds,
                vaccinationIds: selectedVaccinations,
                serviceId: selectedService,
                desiredDate: format(new Date(desiredDate), 'yyyy-MM-dd'), // Format desired date
                status: 'Pending', // Initial status
            };

            const response = await createRegistration(requestData);
            setSuccessMessage(
                `Registration created successfully!`
            );
            // Reset state
            setStep(1);
            setSelectedVaccinations([]);
            setSelectedService(null);
            setSearchPhone('');
            setFoundPatients([]);
            setSelectedPatientIds([]);
            setDesiredDate('');
            setShowCreatePatientForm(false);
            setDisplaySelectedPatients([]);// Reset selected patients display

        } catch (error) {
            if (error.response && error.response.data) {
                // If the server sends back a detailed error message (like the age error)
                setErrors({ createRegistration: error.response.data });  // Assuming the error is a string
            }
            else {
                setErrors({
                    createRegistration:
                        error.message || 'An unexpected error occurred during registration.',
                });
            }
        } finally {
            setLoading(false);
        }
    };
    const handleDateChange = (event) => {
        const selectedDate = event.target.value;
        // Basic validation: Prevent selecting past dates
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Reset time part for accurate comparison
        const selected = new Date(selectedDate);

        if (selected < today) {
            setErrors({ desiredDate: 'Please select a future date.' });
        } else {
            setErrors({ desiredDate: '' }); // Clear the error if date is valid
            setDesiredDate(selectedDate);
        }

    };
    return (
        <div className="registration-container">
            {successMessage && <div className='registration-success-message'>{successMessage}</div>}
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
                            {/*  Conditional rendering based on vaccinations being an array */}
                            {Array.isArray(vaccinations) && vaccinations.map((vaccination) => (
                                <div key={vaccination.vaccinationId} className='registration-checkbox-container'>
                                    <Checkbox
                                        key={vaccination.vaccinationId}
                                        label={vaccination.vaccinationName}

                                        checked={selectedVaccinations.includes(vaccination.vaccinationId)}
                                        onChange={() => handleVaccineSelection(vaccination.vaccinationId)}
                                    />


                                </div>

                            ))}
                        </div>
                    ) : (
                        <div className='registration-service-list-container'>
                            {loading && <p className='registration-loading-indicator'>Loading services...</p>}
                            {Array.isArray(vaccinationServices) && vaccinationServices.map((service) => (  //Also check if vaccinationServices is array
                                <div key={service.serviceID} className='registration-checkbox-container'>
                                    <Checkbox
                                        key={service.serviceID}
                                        label={service.serviceName}
                                        checked={selectedService === service.serviceID}
                                        onChange={() => handleServiceSelection(service.serviceID)}
                                    />

                                </div>
                            ))}
                        </div>
                    )}

                    <Button onClick={handleNextStep} variant="solid" color="primary" className='registration-next-button'>Next</Button>
                </>

            )}

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
                    {/* Display selected patients */}
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
                                                {/*  You could add a user avatar here if you have one */}
                                            </ListItemDecorator>
                                           {patient.patientName} - {patient.phone}
                                        </ListItemButton>

                                    </ListItem>
                                ))}
                            </List>
                        </div>
                    )}

                    <Button onClick={handleNextStep} variant="solid" color="primary" className='registration-next-button'>Next</Button>
                </div>
            )}
            {step === 3 && (
                <div>
                    <h2 className='registration-step-heading'>Step 3: Confirm Registration</h2>
                    <Typography level="body-md">Selected Vaccinations/Service:
                      {selectedService
                        ? vaccinationServices.find((service) => service.serviceID === selectedService)?.serviceName
                        : selectedVaccinations.length > 0
                        ? selectedVaccinations
                          .map(
                            (id) => vaccinations.find((vaccination) => vaccination.vaccinationId === id)?.vaccinationName
                          )
                          .join(', ')
                        : 'No vaccinations or service selected'}
                    </Typography>

                   <Typography level="body-md">Selected Patients:</Typography>
                    {/* Display selected patients here.  Use displaySelectedPatients, NOT foundPatients. */}
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
                    <Button onClick={handleCreateRegistrationSubmit} disabled={loading} variant="solid" color="primary" className='registration-submit-button'>
                        {loading ? 'Submitting...' : 'Submit Registration'}
                    </Button>

                </div>
            )}
        </div>
    );
}

export default Registration;