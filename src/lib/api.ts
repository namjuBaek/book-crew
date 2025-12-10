import axios from 'axios';

const apiClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    // 쿠키 사용 시 필요하지만, 토큰 방식에서는 필수가 아님. 
    // "프론트(Next) – localStorage + Authorization 헤더 쓰기"를 원하므로 토큰 로직 추가 구현.
    withCredentials: true,
});

apiClient.interceptors.request.use(
    (config) => {
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('accessToken');
            if (token) {
                config.headers = config.headers || {};
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default apiClient;
