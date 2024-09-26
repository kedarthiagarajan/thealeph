import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import CityMap from '../components/CityMap';  // Assuming CityMap is imported from a separate file

const InfrastructureMappingPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { data, asn } = location.state || {}; // Retrieve the data passed from the explore page

    if (!data) {
        return <div>No data available. Please return to the explore page.</div>;
    }

    // Function to render infrastructure mapping on the map
    const renderInfrastructureMap = (infrastructureMapping) => {
        if (!infrastructureMapping || !infrastructureMapping.locations) {
            return <div>No locations to display</div>;
        }

        const cityData = infrastructureMapping.locations.map(
            ({ city, state, region, country, count, latitude, longitude }) => {
              if (!latitude || !longitude) {
                console.warn(`Skipping location due to invalid coordinates: ${city}, ${state}, ${country}`);
                return null;
              }
              return {
                city: city || 'Unknown',
                stateOrRegion: state || region || 'N/A',
                country: country || 'N/A',
                count: count || 0,
                lat: latitude,
                lng: longitude
              };
            }
          ).filter(Boolean);  // Filter out invalid entries
          
        return (
            <div>
                <CityMap cityData={cityData} />
            </div>
        );
    };

    return (
        <div>
          <h1>Infrastructure Map for ASN {asn}</h1>
          <p> We construct the map using all available records from OpenIntel's February 2024 RDNS scan.</p>
          {data ? renderInfrastructureMap(data) : <p>Loading...</p>} {/* Conditional rendering */}
          <button style={{ marginTop: '30px' }} onClick={() => navigate(-1)}>Back to Explore</button>
        </div>
      );
};

export default InfrastructureMappingPage;
