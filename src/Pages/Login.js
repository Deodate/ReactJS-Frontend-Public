import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../Components/Header/Header';
import Footer from '../Components/Footer/Footer';
import './login.css';

/**
 * Login component with updated UI and circle title
 * @param {Object} props - Component props
 * @returns {JSX.Element} - The rendered Login page
 */
const Login = (props) => {
  const navigate = useNavigate();
  
  // Form state
  const [formData, setFormData] = useState({
    username: "",
    password: ""
  });
  
  // Error and success messages
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ""
      });
    }
  };
  
  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    // Username validation
    if (!formData.username) {
      newErrors.username = "Username is required";
    }
    
    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      // This would be your API call to login the user
      // For now, we'll simulate it with a timeout
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccessMessage("Login successful! Redirecting...");
      
      // Redirect after a delay
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
      
    } catch (error) {
      setErrors({
        form: error.message || "Login failed. Please try again."
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="workshop-registration">
      {/* Use the same Header component */}
      <Header {...props} />
      
      {/* Main Form Content */}
      <div className="workshop-form-container">
        <div className="workshop-form-wrapper">
          <div className="circle-title">
            <span>LOGIN</span>
          </div>
          
          {/* Success Message */}
          {successMessage && (
            <div className="success-message">
              {successMessage}
            </div>
          )}
          
          {/* Form Error */}
          {errors.form && (
            <div className="error-message">
              {errors.form}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="workshop-form">
            {/* Username */}
            <div className="form-group">
              <label htmlFor="username">Username:</label>
              <div className="input-container">
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className={errors.username ? "error" : ""}
                />
                {errors.username && (
                  <p className="error-text">{errors.username}</p>
                )}
              </div>
            </div>
            
            {/* Password */}
            <div className="form-group">
              <label htmlFor="password">Password:</label>
              <div className="input-container">
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={errors.password ? "error" : ""}
                />
                {errors.password && (
                  <p className="error-text">{errors.password}</p>
                )}
              </div>
            </div>
            
            {/* Submit Button */}
            <div className="form-group">
              <div className="button-group">
                <button
                  type="submit"
                  className={`login-button ${isLoading ? "loading" : ""}`}
                  disabled={isLoading}
                >
                  {isLoading ? "Processing..." : "Login"}
                </button>
                <button
                  type="button"
                  className="cancel-button"
                  onClick={() => navigate('/')}
                  disabled={isLoading}
                >
                  Cancel
                </button>
              </div>
            </div>
            
            {/* Signup Link */}
            <div className="signup-link">
              Don't have an account?{" "}
              <Link to="/signup">
                Sign up
              </Link>
            </div>
          </form>
        </div>
      </div>
      
      {/* Use the same Footer component */}
      <Footer {...props} />
    </div>
  );
};

export default Login;