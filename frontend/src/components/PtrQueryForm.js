import React, { useState } from 'react';
import '../styles/PtrQueryForm.css'; // Import the CSS file for styling
import { queryPTR } from '../api/ptrApi';

const PtrQueryForm = ({ onResults }) => {
    const [ptrRecord, setPtrRecord] = useState('');
    const [asn, setAsn] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const data = await queryPTR(ptrRecord, asn);
            onResults(data);
        } catch (err) {
            setError(err.detail || 'Failed to perform query');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="ptr-query-form">
            <div className="form-row">
                <div className="form-item">
                    <label>PTR Record:</label>
                    <input
                        type="text"
                        value={ptrRecord}
                        onChange={(e) => setPtrRecord(e.target.value)}
                        required
                        className="input-box"
                    />
                </div>
                <div className="form-item">
                    <label>ASN:</label>
                    <input
                        type="text"
                        value={asn}
                        onChange={(e) => setAsn(e.target.value)}
                        required
                        className="input-box"
                    />
                </div>
            </div>
            <button type="submit" className="submit-btn">Submit</button>
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </form>

    );
};

export default PtrQueryForm;
