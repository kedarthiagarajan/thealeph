import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ExplorePage from './pages/ExplorePage';
import PtrQueryPage from './pages/PtrQueryPage';
import HomePage from './pages/HomePage'; // Import the new HomePage component
import Navbar from './components/NavBar'; // Import the Navbar component
import InfrastructureMappingPage from './pages/InfrastructureMappingPage';
import './App.css';

function App() {
    return (
        <Router>
            <div className="App">
                <Routes>
                    <Route path="/" element={<HomePage />} /> {/* Set HomePage as the default */}
                    <Route path="/explore" element={<ExplorePage />} />
                    <Route path="/ptr-query" element={<PtrQueryPage />} />
                    <Route path="/infrastructure-mapping" element={<InfrastructureMappingPage />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
