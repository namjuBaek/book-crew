import axios from 'axios';

const apiClient = axios.create({
    baseURL: typeof window === 'undefined'
        ? process.env.NEXT_PUBLIC_API_URL
        : '/api/proxy',
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // 쿠키를 자동으로 포함
});

export default apiClient;
