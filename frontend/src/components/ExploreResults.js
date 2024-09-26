import React, { useState } from 'react';
import CityMap from './CityMap'; // Assuming the CityMap component is already created
import '../styles/ExplorePage.css'; // Ensure the CSS is imported correctly

const ExploreResults = ({ results }) => {

    if (!results) return null;

    // Function to render classifications in a table
    const renderClassifications = (classifications) => (
        <div className="table-container">
            <table className="centered-table">
                <thead>
                    <tr>
                        <th>Class</th>
                        <th>Description</th>
                        <th>Regex</th>
                        <th>Example</th>
                    </tr>
                </thead>
                <tbody>
                    {Object.keys(classifications).map((classKey) => {
                        const { description, regex, examples } = classifications[classKey];
                        return (
                            <tr key={classKey}>
                                <td>{classKey}</td>
                                <td>{description}</td>
                                <td>{regex}</td>
                                <td>{examples && examples.length > 0 ? examples[0] : "N/A"}</td> {/* Show one example */}
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );

    // Function to render regex data in a styled table
    const renderRegex = (regexData) => (
        <div className="table-container">
            <table className="centered-table">
                <thead>
                    <tr>
                        <th>Class</th>
                        <th>Regex</th>
                    </tr>
                </thead>
                <tbody>
                    {Object.keys(regexData).map((regexKey) => (
                        <tr key={regexKey}>
                            <td>{regexKey}</td>
                            <td>{regexData[regexKey]}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    // Function to render hint mapping data in a styled table
    const renderHints = (hints) => (
        <div className="table-container">
            <table className="centered-table">
                <thead>
                    <tr>
                        <th>Hint</th>
                        <th>City</th>
                        <th>State/Region</th>
                        <th>Country</th>
                    </tr>
                </thead>
                <tbody>
                    {Object.keys(hints).map((hintKey) => {
                        const { city, state, region, country } = hints[hintKey];
                        return (
                            <tr key={hintKey}>
                                <td>{hintKey}</td>
                                <td>{city || "N/A"}</td>
                                <td>{state || region || "N/A"}</td>
                                <td>{country || "N/A"}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );


    // Function to render default data if it's not classified as one of the above
    const renderDefault = (data) => (
        <ul>
            {Object.keys(data).map((key) => (
                <li key={key}>
                    <strong>{key}:</strong> {JSON.stringify(data[key], null, 2)}
                </li>
            ))}
        </ul>
    );

    return (
        <div>
            {/* Conditionally render based on the type of data */}
            {results.classifications ? (
                renderClassifications(results.classifications)
            ) : results.regex ? (
                renderRegex(results.regex)
            ) : results.hints ? (
                renderHints(results.hints)
            ) : (
                renderDefault(results)
            )}
        </div>
    );
};

export default ExploreResults;
