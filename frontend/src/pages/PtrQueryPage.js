import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { queryPTR } from '../api/ptrApi';
import '../styles/PtrQueryPage.css';
import Navbar from '../components/NavBar';

const PtrQueryPage = () => {
    const location = useLocation();
    const [ptrRecord, setPtrRecord] = useState('');
    const [asn, setAsn] = useState('');
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');
    const [autoSubmit, setAutoSubmit] = useState(true);

    // On page load, populate PTR record and ASN from location.state
    useEffect(() => {
        if (location.state) {
            setPtrRecord(location.state.ptrRecord || '');
            setAsn(location.state.asn || '');
        }
    }, [location.state]);

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setResult(null);

        try {
            // API call to query PTR
            const data = await queryPTR(ptrRecord, asn);
            setResult(data);
        } catch (err) {
            setError('Failed to fetch data. Please try again.');
        }
    };

    useEffect(() => {
        if (autoSubmit && ptrRecord && asn) {
            handleSubmit(new Event('submit'));
        }
    }, [autoSubmit, ptrRecord, asn]);

    // Function to render a simplified table
    const renderTable = () => (
        <table className="styled-table">
            <thead>
                <tr>
                    <th>PTR Record</th>
                    <th>Regular Expression</th>
                    <th>Geo Hint</th>
                    <th>City</th>
                    <th>{result.location_info.region ? 'Region' : 'State'}</th>
                    <th>Country</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>{result.ptr_record}</td>
                    <td>{result.regular_expression}</td>
                    <td>{result.geo_hint}</td>
                    <td>{result.location_info.city}</td>
                    <td>{result.location_info.region || result.location_info.state}</td>
                    <td>{result.location_info.country}</td>
                </tr>
            </tbody>
        </table>
    );

    return (
        <div className="ptr-query-page">
            <Navbar>{Navbar()}</Navbar>
            <p >
                Provided an ASN and PTR record, we will use our generated regex and hint mappings to extract geographic information from the record.
            </p>
            <form onSubmit={handleSubmit}>
                <input
                    className="input-box"
                    type="text"
                    id="ptrRecord"
                    value={ptrRecord}
                    onChange={(e) => setPtrRecord(e.target.value)}
                    required
                    placeholder="Enter PTR Record"
                />
                <input
                    className="input-box"
                    type="text"
                    id="asn"
                    value={asn}
                    onChange={(e) => setAsn(e.target.value)}
                    required
                    placeholder="Enter ASN Number"
                />

                <button type="submit" className="button-container move-up">Submit</button>
            </form>
            
            {error && <p className="error-message">{error}</p>}

            {result && (
                <div className="table-container">
                    {renderTable()}
                </div>
            )}
        </div>
    );
};

export default PtrQueryPage;
