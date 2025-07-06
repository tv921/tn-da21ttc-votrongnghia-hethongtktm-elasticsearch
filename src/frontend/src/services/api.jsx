import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000/api',
});

export const search = (query, type = 'keyword') => api.get(`/search?query=${query}&type=${type}`);