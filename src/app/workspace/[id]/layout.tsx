'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import apiClient from '@/lib/api';
import { useToast } from '@/components/ui/Toast';
import { LoadingOverlay } from '@/components/ui/LoadingOverlay';
import { WorkspaceHeader } from '@/components/workspace/Header';
import { WorkspaceSidebar } from '@/components/workspace/Sidebar';
import { WorkspaceMemberProvider } from '@/contexts/WorkspaceMemberContext';

// Listen to sidebar collapse state
const useSidebarState = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);

    useEffect(() => {
        const handleSidebarToggle = (e: CustomEvent) => {
            setIsCollapsed(e.detail.isCollapsed);
        };

        window.addEventListener('sidebarToggle' as any, handleSidebarToggle as any);
        return () => window.removeEventListener('sidebarToggle' as any, handleSidebarToggle as any);
    }, []);

    return isCollapsed;
};

interface WorkspaceLayoutProps {
    children: React.ReactNode;
}

export default function WorkspaceDetailLayout({ children }: WorkspaceLayoutProps) {
    const router = useRouter();
    const params = useParams();
    const { showToast } = useToast();
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [workspaceName, setWorkspaceName] = useState('');

    // params.id가 문자열인지 확인 (배열일 경우 첫 번째 요소 사용)
    const workspaceId = Array.isArray(params?.id) ? params?.id[0] : params?.id;
    const isSidebarCollapsed = useSidebarState();

    useEffect(() => {
        const loadWorkspaceInfo = async () => {
            if (!workspaceId) {
                return;
            }

            try {
                // 워크스페이스 상세 정보 조회 API 호출
                const response = await apiClient.get(`/workspaces/${workspaceId}`);

                if (response.data.success) {
                    setWorkspaceName(response.data.data.name);
                    setIsAuthorized(true);
                }
            } catch (error: any) {
                console.error('Workspace load failed:', error);

                if (error.response?.status === 403) {
                    showToast('워크스페이스에 접근할 권한이 없습니다.', 'error');
                } else if (error.response?.status === 404) {
                    showToast('존재하지 않는 워크스페이스입니다.', 'error');
                } else {
                    showToast('워크스페이스 정보를 불러오는데 실패했습니다.', 'error');
                }

                router.replace('/workspace-join');
            } finally {
                setIsLoading(false);
            }
        };

        loadWorkspaceInfo();
    }, [workspaceId, router, showToast]);

    if (isLoading || !isAuthorized) {
        return <LoadingOverlay isVisible={true} message="정보 불러오는 중..." />;
    }

    return (
        <WorkspaceMemberProvider workspaceId={workspaceId as string}>
            <div className="min-h-screen bg-gray-50 flex flex-col">
                <WorkspaceHeader workspaceName={workspaceName} />

                <div className="flex flex-1 relative pt-[73px]">
                    <WorkspaceSidebar workspaceId={workspaceId as string} />

                    <main
                        className={`
                        flex-1 transition-all duration-300 relative
                        ${isSidebarCollapsed ? 'ml-20' : 'ml-64'}
                    `}
                        style={{ minHeight: 'calc(100vh - 73px)' }}
                    >
                        {children}
                    </main>
                </div>
            </div>
        </WorkspaceMemberProvider>
    );
}
