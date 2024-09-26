import axios from 'axios';

const API_BASE_URL = 'http://lisa.cs.northwestern.edu:8000/api';  // Replace with the actual URL if hosted elsewhere

// API to perform a PTR query
export const ptrQuery = async (ptrRecord, asn) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/query`, {
            ptr_record: ptrRecord,
            asn: asn
        });
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : new Error('Failed to fetch data');
    }
};

// API to get classifications by ASN
export const getClassificationsByASN = async (asn) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/asn/${asn}/classifications`);
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : new Error('Failed to fetch data');
    }
};

// API to get regex by ASN
export const getRegexByASN = async (asn) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/asn/${asn}/regex`);
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : new Error('Failed to fetch data');
    }
};

// API to get hints by ASN
export const getHintsByASN = async (asn) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/asn/${asn}/hints`);
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : new Error('Failed to fetch data');
    }
};


export const queryPTR = async (ptrRecord, asn) => {
    const response = await axios.post(`${API_BASE_URL}/query`, {
        ptr_record: ptrRecord,
        asn: asn
    });
    return response.data;
};

export const getInfrastructureMapByASN = async(asn) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/asn/${asn}/infrastructure_mapping`);
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : new Error('Failed to fetch data');
    }
    
}
