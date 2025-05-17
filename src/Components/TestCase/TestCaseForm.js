import React, { useState, useEffect } from 'react';
import { FaArrowLeft, FaCalendarAlt, FaSave, FaMapMarkerAlt } from 'react-icons/fa';
import './TestCaseForm.css';
import { API_CONFIG, AUTH_SETTINGS } from '../../config';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Custom notification function to ensure notifications are displayed properly
const showNotification = (type, message) => {
  // Force a small delay to ensure the toast container is mounted
  setTimeout(() => {
    if (type === 'success') {
      toast.success(message, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored",
      });
    } else if (type === 'error') {
      toast.error(message, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored",
      });
    }
  }, 100);
};

const TestCaseForm = ({ onBack, onSave, initialData }) => {
  // Get the API URL from config or use default
  const apiBaseUrl = API_CONFIG.BASE_URL || 'http://localhost:8089';
  console.log('Using API base URL:', apiBaseUrl);

  const [formData, setFormData] = useState({
    testName: '',
    testDescription: '',
    testObjectives: '',
    productType: '',
    productBatchNumber: 'SEED-2025-001', // Default batch number
    testingLocation: '',
    assignedWorkerId: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    notes: '',
    receiveUpdates: false
  });

  // For available assigned workers
  const [availableWorkers, setAvailableWorkers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUsedBatchNumber, setLastUsedBatchNumber] = useState(1);
  const [fetchingBatchNumber, setFetchingBatchNumber] = useState(true);

  // Function to generate a batch number
  const generateBatchNumber = (lastNumber) => {
    // Make sure lastNumber is valid, fallback to 1 if it's not
    const numberToUse = (lastNumber && !isNaN(lastNumber) && lastNumber > 0) ? lastNumber : 1;
    
    // Format with leading zeros to ensure 3 digits
    const formattedNumber = String(numberToUse).padStart(3, '0');
    return `SEED-2025-${formattedNumber}`;
  };

  // Fetch the last used batch number
  useEffect(() => {
    const fetchLastBatchNumber = async () => {
      setFetchingBatchNumber(true);
      console.log('Fetching latest batch number from API...');
      
      // Create axios instance with auth headers
      const api = axios.create({
        baseURL: apiBaseUrl,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem(AUTH_SETTINGS.TOKEN_KEY)}`
        }
      });
      
      try {
        // Try to fetch all test cases to find the last batch number
        const response = await api.get('/api/testcases');
        
        if (response.data && Array.isArray(response.data) && response.data.length > 0) {
          // Find the highest batch number
          let highestNumber = 0;
          
          response.data.forEach(testCase => {
            if (testCase.productBatchNumber) {
              const matches = testCase.productBatchNumber.match(/SEED-\d+-(\d+)/);
              if (matches && matches[1]) {
                const batchNumber = parseInt(matches[1], 10);
                highestNumber = Math.max(highestNumber, batchNumber);
              }
            }
          });
          
          // Increment the highest number for the next batch
          const nextNumber = highestNumber + 1;
          console.log('Next batch number will be:', nextNumber);
          setLastUsedBatchNumber(nextNumber);
          
          // Update the form data with the new batch number
          setFormData(prev => ({
            ...prev,
            productBatchNumber: generateBatchNumber(nextNumber)
          }));
        } else {
          console.log('No existing test cases found. Starting with batch number 001.');
          setFormData(prev => ({
            ...prev,
            productBatchNumber: generateBatchNumber(1)
          }));
        }
      } catch (err) {
        console.error('Error fetching test cases for batch number:', err);
        // If there's an error, we'll use the default batch number already set
        console.log('Using default batch number due to error:', generateBatchNumber(1));
      } finally {
        setFetchingBatchNumber(false);
      }
    };
    
    fetchLastBatchNumber();
  }, [apiBaseUrl]);

  // Fetch workers from API
  useEffect(() => {
    const fetchWorkers = async () => {
      setIsLoading(true);
      setError(null);
      
      // Create axios instance with auth headers
      const api = axios.create({
        baseURL: apiBaseUrl,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem(AUTH_SETTINGS.TOKEN_KEY)}`
        }
      });
      
      try {
        // First try to get users with ROLE_FIELD_WORKER
        const response = await api.get('/api/users/role/ROLE_FIELD_WORKER');
        
        // Check if we got field workers
        if (response.data && response.data.length > 0) {
          const workers = response.data.map(user => ({
            id: user.id,
            name: user.fullName || user.username
          }));
          setAvailableWorkers(workers);
          return;
        }
        
        // If no field workers found, try agronomists as they can also do field work
        console.log('No field workers found, fetching agronomists instead');
        const agronomistResponse = await api.get('/api/users/role/ROLE_AGRONOMIST');
        
        if (agronomistResponse.data && agronomistResponse.data.length > 0) {
          const workers = agronomistResponse.data.map(user => ({
            id: user.id,
            name: user.fullName || user.username
          }));
          setAvailableWorkers(workers);
          return;
        }
        
        // If still no workers found, throw an error
        throw new Error('No field workers or agronomists found in the system');
      } catch (err) {
        console.error('Error fetching workers:', err);
        
        // If there's an authentication error, provide a specific message
        if (err.response && err.response.status === 401) {
          setError('Authentication error: Please log in again to access worker data');
        } else if (err.response && err.response.status === 403) {
          setError('Permission denied: You do not have access to view worker data');
        } else {
          setError('Failed to load workers: ' + (err.message || 'Unknown error'));
        }
        
        // Fallback to sample data
        setAvailableWorkers([
          { id: 2, name: 'John Smith (Field Worker)' },
          { id: 15, name: 'Jane Doe (Field Worker)' },
          { id: 24, name: 'Michael Johnson (Field Worker)' },
          { id: 32, name: 'Alice Johnson (Field Worker)' },
          { id: 41, name: 'Robert Brown (Field Worker)' }
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWorkers();
  }, []);

  // Initialize with provided data if any
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
      
      // If we're editing an existing test case, extract its batch number information
      if (initialData.productBatchNumber) {
        const batchNumberString = initialData.productBatchNumber;
        const matches = batchNumberString.match(/SEED-\d+-(\d+)/);
        
        if (matches && matches[1]) {
          // Set the last used batch number to the current one
          // (we won't increment this since we're editing an existing record)
          const currentNumber = parseInt(matches[1], 10);
          setLastUsedBatchNumber(currentNumber);
        }
      }
    }
  }, [initialData]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Ensure we're using the current batch number and convert assignedWorkerId to a number before sending to API
    const formDataToSubmit = {
      ...formData,
      productBatchNumber: generateBatchNumber(lastUsedBatchNumber),
      assignedWorkerId: formData.assignedWorkerId ? Number(formData.assignedWorkerId) : null
    };
    
    setIsSubmitting(true);
    
    try {
      console.log('Submitting test case with batch number:', formDataToSubmit.productBatchNumber);
      
      // Create axios instance with auth headers
      const api = axios.create({
        baseURL: apiBaseUrl,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem(AUTH_SETTINGS.TOKEN_KEY)}`
        }
      });
      
      // Send data to API
      const response = await api.post('/api/testcases', formDataToSubmit);
      
      console.log('Test case created:', response.data);
      
      // Increment the batch number for next submission
      const newBatchNumber = lastUsedBatchNumber + 1;
      setLastUsedBatchNumber(newBatchNumber);
      console.log('Incrementing batch number to:', newBatchNumber);
      
      // Show success notification using our custom function
      showNotification('success', 'Test case created successfully!');
      
      // Reset form while keeping the new batch number
      setFormData({
        testName: '',
        testDescription: '',
        testObjectives: '',
        productType: '',
        productBatchNumber: generateBatchNumber(newBatchNumber),
        testingLocation: '',
        assignedWorkerId: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        notes: '',
        receiveUpdates: false
      });
      
      // Important: Don't navigate away from the form
      // Only call onSave if needed, and make sure it doesn't navigate away
      if (onSave && typeof onSave === 'function') {
        try {
          // Some implementations might expect a callback, so we'll handle both cases
          if (onSave.length >= 2) {
            // If onSave accepts 2 or more parameters, second is options
            onSave(response.data, { preventNavigation: true });
          } else {
            // Otherwise just pass the data and handle staying on page here
            onSave(response.data);
          }
        } catch (err) {
          console.warn('Error in onSave callback, but continuing:', err);
        }
      }
      
    } catch (error) {
      console.error('Error creating test case:', error);
      
      // Show error notification using our custom function
      showNotification(
        'error', 
        error.response?.data?.message || 'Failed to create test case. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="test-case-form-container">
      {/* Toast notifications container - positioned at the top of the component */}
      <ToastContainer 
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        draggable
        theme="colored"
      />
      <div className="test-case-form-header">
        <div>
          <h1>Creating Test Case</h1>
          <p className="test-case-form-subheader">Please create a test case by completing this form.</p>
        </div>
        <button className="back-button" onClick={onBack}>
          Back to List
        </button>
      </div>

      <div className="test-case-form-content">
        <form onSubmit={handleSubmit} className="form-container">
          <div className="field-group">
            <label htmlFor="testName">
              Test Name<span className="required">*</span>
            </label>
            <input
              type="text"
              id="testName"
              name="testName"
              className="form-input"
              value={formData.testName}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="field-group">
            <label htmlFor="testDescription">
              Test Description<span className="required">*</span>
            </label>
            <input
              type="text"
              id="testDescription"
              name="testDescription"
              className="form-input"
              value={formData.testDescription}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="field-group">
            <label htmlFor="testObjectives">
              Test Objectives<span className="required">*</span>
            </label>
            <input
              type="text"
              id="testObjectives"
              name="testObjectives"
              className="form-input"
              value={formData.testObjectives}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="field-group">
            <label htmlFor="productType">
              Product Type<span className="required">*</span>
            </label>
            <select
              id="productType"
              name="productType"
              className="form-select"
              value={formData.productType}
              onChange={handleInputChange}
              required
            >
              <option value="">Please Select</option>
              <option value="Seeds">Seeds</option>
              <option value="Fungicide">Fungicide</option>
              <option value="Herbicide">Herbicide</option>
              <option value="Insecticide">Insecticide</option>
              <option value="Fertilizer">Fertilizer</option>
              <option value="Growth Enhancer">Growth Enhancer</option>
              <option value="Soil Conditioner">Soil Conditioner</option>
            </select>
          </div>

          <div className="field-group">
            <label htmlFor="productBatchNumber">
              Product Batch Number<span className="required">*</span>
            </label>
            <input
              type="text"
              id="productBatchNumber"
              name="productBatchNumber"
              className="form-input"
              value={fetchingBatchNumber ? "Loading..." : formData.productBatchNumber}
              readOnly
              required
              style={{ 
                backgroundColor: '#f0f0f0', 
                cursor: 'not-allowed',
                fontStyle: fetchingBatchNumber ? 'italic' : 'normal'
              }}
              title="Batch number is automatically generated"
            />
            {fetchingBatchNumber && <div className="info-message">Determining next available batch number...</div>}
          </div>

          <div className="field-group">
            <label htmlFor="testingLocation">
              Testing Location<span className="required">*</span>
            </label>
            <input
              type="text"
              id="testingLocation"
              name="testingLocation"
              className="form-input"
              value={formData.testingLocation}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="field-group">
            <label htmlFor="assignedWorkerId">
              Assigned Worker<span className="required">*</span>
            </label>
            <select
              id="assignedWorkerId"
              name="assignedWorkerId"
              className="form-select"
              value={formData.assignedWorkerId}
              onChange={handleInputChange}
              required
              disabled={isLoading}
            >
              <option value="">
                {isLoading ? "Loading workers..." : "Please Select"}
              </option>
              {availableWorkers.map(worker => (
                <option key={worker.id} value={worker.id}>{worker.name}</option>
              ))}
            </select>
            {error && <div className="error-message">{error}</div>}
          </div>

          <div className="field-group">
            <label htmlFor="startDate">
              Start Date<span className="required">*</span>
            </label>
            <div className="date-input-container">
              <input
                type="date"
                id="startDate"
                name="startDate"
                className="form-input date-input"
                value={formData.startDate}
                onChange={handleInputChange}
                required
              />
              <FaCalendarAlt className="calendar-icon" />
            </div>
          </div>

          <div className="field-group">
            <label htmlFor="endDate">
              End Date<span className="required">*</span>
            </label>
            <div className="date-input-container">
              <input
                type="date"
                id="endDate"
                name="endDate"
                className="form-input date-input"
                value={formData.endDate}
                onChange={handleInputChange}
                required
              />
              <FaCalendarAlt className="calendar-icon" />
            </div>
          </div>

          <div className="field-group full-width">
            <label htmlFor="notes">
              Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              className="form-textarea"
              value={formData.notes}
              onChange={handleInputChange}
              rows="4"
            />
          </div>


          <div className="form-actions">
            <button 
              type="submit" 
              className="save-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </button>
            <button 
              type="button" 
              className="cancel-btn"
              onClick={onBack}
              disabled={isSubmitting}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TestCaseForm; 