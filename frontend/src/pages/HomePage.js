import React, { useState, useEffect } from 'react';
import { Link, useNavigate  } from 'react-router-dom'; // Import Link for navigation
import '../styles/HomePage.css';
import Navbar from '../components/NavBar.js';

const HomePage = () => {
    const [isHovered, setIsHovered] = useState(false);
    const [showText, setShowText] = useState(false);
    const navigate = useNavigate();

    // Handle automatic switching every 5 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            setShowText(prevShowText => !prevShowText);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    const handleMouseEnter = () => {
        setIsHovered(true);
        setShowText(true);
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
        setShowText(false);
    };

    const handleTryIt = () => {
        // Navigate to the PTRQueryPage with predefined PTR record and ASN
        navigate('/ptr-query', { state: { ptrRecord: '99-170-164-205.lightspeed.tukrga.sbcglobal.net', asn: '7018', autoSubmit: true } });
    };

    return (
        <div className="homepage-container">
            <Navbar>{Navbar()} </Navbar>

            <div className="content">
                <div className="symbol-container" 
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}>
                    {!showText ? (
                        <div className="aleph-container">
                            <img src='/thealeph.webp' alt="Aleph Logo" className="aleph-logo" />
                            <p className="aleph-text">The Aleph</p>
                        </div>
                    ) : (
                        <p className="geolocation-text">
                            This system enables efficient geolocation and analysis of internet 
                            infrastructure by mapping network paths to real-world locations 
                            using state-of-the-art machine learning techniques.
                        </p>
                    )}
                </div>
            </div>
            <div className="quote-container">
                <p className="quote">
                    "All language is a set of symbols whose use among its speakers assumes a shared past. 
                    How, then, can I translate into words the limitless Aleph, which my floundering mind 
                    can scarcely encompass?" – Jorge Luis Borges
                </p>
            </div>
            <div className='try-it-container'>
                <button className="try-it-button" onClick={handleTryIt}>
                    TRY IT
                </button>
            </div>
        </div>
    );
};

export default HomePage;
