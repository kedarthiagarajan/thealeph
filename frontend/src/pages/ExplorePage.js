import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ExploreResults from '../components/ExploreResults';
import Navbar from '../components/NavBar';
import { getClassificationsByASN, getRegexByASN, getHintsByASN, getInfrastructureMapByASN } from '../api/ptrApi';
import '../styles/ExplorePage.css'; // Import the new CSS

const ExplorePage = () => {
    const [results, setResults] = useState(null);
    const [asn, setAsn] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate(); 
    const location = useLocation();
    const { data, userAsn } = location.state || {}; 

    const handleExplore = async (exploreType) => {
        setError('');
        setResults(null);  
        setLoading(true); // Start loading

        try {
            let data;

            if (exploreType === 'classifications') {
                data = await getClassificationsByASN(asn);
                setResults({ classifications: data }); 
            } else if (exploreType === 'regex') {
                data = await getRegexByASN(asn);
                setResults({ regex: data });
            } else if (exploreType === 'hints') {
                data = await getHintsByASN(asn);
                setResults({ hints: data });
            } else if (exploreType === 'infrastructure_mapping') {
                data = await getInfrastructureMapByASN(asn);
                navigate('/infrastructure-mapping', { state: { data, asn } });
            }
        } catch (err) {
            setError('Error fetching data. Please try again.');
        } finally {
            setLoading(false); // End loading
        }
    };

    return (
        <div className="explore-page">
            <Navbar /> 
            <div className="explore-content">
                <p className="description">
                    We have collected data from over 2000+ Autonomous Systems (AS). 
                    Enter an AS number below to see what we have found.
                </p>
                <input
                    className="input-box"
                    type="text"
                    placeholder="Enter ASN"
                    value={asn}
                    onChange={(e) => setAsn(e.target.value)}
                />
                <div className="button-row">
                    <button className="button-container" onClick={() => handleExplore('classifications')}>
                        Classifications
                    </button>
                    <button className="button-container" onClick={() => handleExplore('regex')}>
                        Regex
                    </button>
                    <button className="button-container" onClick={() => handleExplore('hints')}>
                        Hints
                    </button>
                    <button className="button-container" onClick={() => handleExplore('infrastructure_mapping')}>
                        Visualization
                    </button>
                </div>

                {/* Loading and error messages */}
                {loading && <p className="loading">Loading...</p>}
                {error && <p className="error">{error}</p>}

                {/* Output section */}
                {results && <ExploreResults results={results} />}
            </div>
        </div>
    );
};

export default ExplorePage;
