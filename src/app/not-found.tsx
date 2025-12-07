'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LoadingOverlay } from '@/components/ui/LoadingOverlay';
import apiClient from '@/lib/api';
import Link from 'next/link';

export default function NotFound() {
    const router = useRouter();
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const checkAuthStatus = async () => {
            try {
                const response = await apiClient.get('/users/me');

                if (response.data.success) {
                    // 로그인되어 있으면 workspace-join으로 리다이렉트
                    setIsAuthenticated(true);
                    router.replace('/workspace-join');
                }
            } catch (error) {
                // 로그인되어 있지 않으면 404 페이지 표시
                setIsAuthenticated(false);
            } finally {
                setIsCheckingAuth(false);
            }
        };

        checkAuthStatus();
    }, [router]);

    if (isCheckingAuth) {
        return <LoadingOverlay isVisible={true} message="페이지 확인 중..." />;
    }

    // 로그인되어 있지 않은 경우에만 404 페이지 표시
    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-teal-50 px-4">
                <div className="text-center">
                    <h1 className="text-9xl font-bold text-emerald-600 mb-4">404</h1>
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">페이지를 찾을 수 없습니다</h2>
                    <p className="text-gray-600 mb-8">
                        요청하신 페이지가 존재하지 않거나 이동되었습니다.
                    </p>
                    <div className="flex gap-4 justify-center">
                        <Link
                            href="/"
                            className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-lg transition-colors"
                        >
                            홈으로 가기
                        </Link>
                        <Link
                            href="/login"
                            className="px-6 py-3 bg-white hover:bg-gray-50 text-emerald-600 font-semibold rounded-lg border-2 border-emerald-500 transition-colors"
                        >
                            로그인
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return null;
}
