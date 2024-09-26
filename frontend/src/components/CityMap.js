import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const CityMap = ({ cityData }) => {
  useEffect(() => {
    console.log('Map rendered with cityData:', cityData);
  }, [cityData]);

  const initialCenter = cityData.length ? [cityData[0].lat, cityData[0].lng] : [20, 0];

  const customIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
    iconSize: [25, 25],
  });

  return (
    <MapContainer center={initialCenter} zoom={2} scrollWheelZoom={true} className="map-container">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {cityData.map((city, index) => (
        <Marker key={index} position={[city.lat, city.lng]} icon={customIcon}>
          <Popup>
            <strong>{city.city}</strong><br />
            State/Region: {city.stateOrRegion}<br />
            Country: {city.country}<br />
            IP Count: {city.count}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default CityMap;
