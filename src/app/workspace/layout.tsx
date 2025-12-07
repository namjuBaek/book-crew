'use client';

import { useAuth } from '@/hooks/useAuth';
import { LoadingOverlay } from '@/components/ui/LoadingOverlay';

export default function WorkspaceLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return <LoadingOverlay isVisible={true} message="인증 확인 중..." />;
    }

    if (!isAuthenticated) {
        return null;
    }

    return <>{children}</>;
}
