'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import apiClient from '@/lib/api';
import { useToast } from '@/components/ui/Toast';
import { LoadingOverlay } from '@/components/ui/LoadingOverlay';

interface WorkspaceLayoutProps {
    children: React.ReactNode;
}

export default function WorkspaceDetailLayout({ children }: WorkspaceLayoutProps) {
    const router = useRouter();
    const params = useParams();
    const { showToast } = useToast();
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
        const checkWorkspacePermission = async () => {
            // params.id가 문자열인지 확인 (배열일 경우 첫 번째 요소 사용)
            const workspaceId = Array.isArray(params?.id) ? params?.id[0] : params?.id;

            if (!workspaceId) {
                return;
            }

            try {
                // 워크스페이스 상세 정보 조회 API 호출로 권한 확인
                await apiClient.get(`/workspaces/${workspaceId}`);

                // 성공 시 권한 있음으로 설정
                setIsAuthorized(true);
            } catch (error: any) {
                console.error('Workspace permission check failed:', error);

                // 403 Forbidden 에러인 경우 (권한 없음)
                if (error.response?.status === 403) {
                    showToast('워크스페이스에 접근할 권한이 없습니다.', 'error');
                } else if (error.response?.status === 404) {
                    showToast('존재하지 않는 워크스페이스입니다.', 'error');
                } else {
                    showToast('워크스페이스 정보를 불러오는데 실패했습니다.', 'error');
                }

                // 에러 발생 시 목록 페이지로 리다이렉트
                router.replace('/workspace-join');
            } finally {
                setIsLoading(false);
            }
        };

        checkWorkspacePermission();
    }, [params?.id, router, showToast]);

    // 로딩 중이거나 권한 확인 전에는 로딩 표시
    if (isLoading || !isAuthorized) {
        return <LoadingOverlay isVisible={true} message="권한 확인 중..." />;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {children}
        </div>
    );
}
