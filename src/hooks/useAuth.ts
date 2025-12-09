'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import apiClient from '@/lib/api';

/**
 * 인증이 필요한 페이지에서 사용하는 훅
 * 로그인되어 있지 않으면 자동으로 로그인 페이지로 리다이렉트
 */
export function useAuth() {
    const router = useRouter();
    const pathname = usePathname();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            // 로그인 페이지에서는 인증 체크를 하지 않음 (무한 리다이렉트 방지)
            if (pathname === '/login' || pathname === '/signup') {
                setIsLoading(false);
                return;
            }

            try {
                const response = await apiClient.get('/users/me');

                if (response.data.success) {
                    setIsAuthenticated(true);
                } else {
                    console.warn('Auth check failed:', response.data);
                    // 인증 실패 시 로그인 페이지로 리다이렉트
                    router.replace('/login');
                }
            } catch (error: any) {
                console.error('Auth check error:', error.message);
                // 인증 실패 시 로그인 페이지로 리다이렉트
                router.replace('/login');
            } finally {
                setIsLoading(false);
            }
        };

        checkAuth();
    }, [router, pathname]);

    return { isAuthenticated, isLoading };
}
