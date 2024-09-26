import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/NavBar.css'; // Import styles for the sidebar

const Navbar = () => {
    return (
        <nav className="navbar">
            <ul>
                <li><Link to="/">HOME</Link></li>
                <li><Link to="/explore">EXPLORE PTR DATA</Link></li>
                <li><Link to="/ptr-query">QUERY THE ALEPH</Link></li>
            </ul>
        </nav>
    );
};

export default Navbar;
