'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import apiClient from '@/lib/api';

interface WorkspaceMember {
    id: string;
    name: string;
    role: string;
    userId: string;
}

interface WorkspaceMemberContextType {
    member: WorkspaceMember | null;
    isLoading: boolean;
    error: string | null;
    refreshMember: () => Promise<void>;
}

const WorkspaceMemberContext = createContext<WorkspaceMemberContextType | undefined>(undefined);

export function WorkspaceMemberProvider({
    children,
    workspaceId
}: {
    children: ReactNode;
    workspaceId: string;
}) {
    const [member, setMember] = useState<WorkspaceMember | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchMember = async () => {
        if (!workspaceId) return;

        setIsLoading(true);
        try {
            const response = await apiClient.post('/members/me', {
                workspaceId
            });
            if (response.data.success) {
                setMember(response.data.data);
                setError(null);
            } else {
                setError(response.data.message || '멤버 정보를 불러올 수 없습니다.');
                setMember(null);
            }
        } catch (err) {
            console.error('Failed to fetch workspace member info:', err);
            setError('멤버 정보를 불러오는 중 오류가 발생했습니다.');
            setMember(null);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchMember();
    }, [workspaceId]);

    return (
        <WorkspaceMemberContext.Provider value={{ member, isLoading, error, refreshMember: fetchMember }}>
            {children}
        </WorkspaceMemberContext.Provider>
    );
}

export function useWorkspaceMember() {
    const context = useContext(WorkspaceMemberContext);
    if (context === undefined) {
        throw new Error('useWorkspaceMember must be used within a WorkspaceMemberProvider');
    }
    return context;
}
