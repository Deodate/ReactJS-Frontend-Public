import React, { useState } from 'react';
import './StockMovementForm.css';

const StockMovementForm = () => {
    const [formData, setFormData] = useState({
        productId: '',
        currentStockLevel: '',
        expiryDate: '',
        stockAlerts: '',
        lastUpdatedDate: '',
        responsibleOfficer: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Stock Movement form data submitted:', formData);
        // TODO: Implement form submission logic
    };

    return (
        <div className="stock-movement-form-container">
            <form className="stock-movement-form" onSubmit={handleSubmit}>
                <div className="form-group">
                    <input type="text" id="productId" name="productId" value={formData.productId} onChange={handleChange} required placeholder="Product ID" />
                </div>
                <div className="form-group">
                    <input type="number" id="currentStockLevel" name="currentStockLevel" value={formData.currentStockLevel} onChange={handleChange} required placeholder="Current Stock Level" />
                </div>
                <div className="form-group">
                    <input type="date" id="expiryDate" name="expiryDate" value={formData.expiryDate} onChange={handleChange} required placeholder="Expiry Date" />
                </div>
                <div className="form-group">
                    <select id="stockAlerts" name="stockAlerts" value={formData.stockAlerts} onChange={handleChange} required>
                        <option value="">Stock Alerts (Yes/No)</option>
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                    </select>
                </div>
                <div className="form-group">
                    <input type="date" id="lastUpdatedDate" name="lastUpdatedDate" value={formData.lastUpdatedDate} onChange={handleChange} required placeholder="Last Updated Date" />
                </div>
                <div className="form-group">
                    <input type="text" id="responsibleOfficer" name="responsibleOfficer" value={formData.responsibleOfficer} onChange={handleChange} required placeholder="Responsible Officer" />
                </div>
                <div className="form-buttons">
                    <button type="submit">Submit</button>
                    <button type="button" className="cancel-button">Cancel</button>
                </div>
            </form>
        </div>
    );
};

export default StockMovementForm; 