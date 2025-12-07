'use client';

import React, { useState, useEffect } from 'react';
import { WorkspaceHeader } from '@/components/workspace/Header';
import { WorkspaceSidebar } from '@/components/workspace/Sidebar';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';

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

interface UserProfile {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'member';
}

interface WorkspaceSettings {
    id: string;
    name: string;
    imageUrl: string;
}

export default function SettingsPage({ params }: { params: { id: string } }) {
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [workspaceSettings, setWorkspaceSettings] = useState<WorkspaceSettings | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // User profile editing
    const [editedName, setEditedName] = useState('');
    const [isEditingName, setIsEditingName] = useState(false);

    // Workspace editing (admin only)
    const [editedWorkspaceName, setEditedWorkspaceName] = useState('');
    const [editedWorkspaceImage, setEditedWorkspaceImage] = useState('');
    const [isEditingWorkspace, setIsEditingWorkspace] = useState(false);

    const isSidebarCollapsed = useSidebarState();
    const { showToast } = useToast();

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        setIsLoading(true);
        try {
            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 800));

            // Mock user data
            const mockUser: UserProfile = {
                id: '1',
                name: '김철수',
                email: 'kim@example.com',
                role: 'admin', // Change to 'member' to test member view
            };

            // Mock workspace data
            const mockWorkspace: WorkspaceSettings = {
                id: params.id,
                name: '독서모임 북클럽',
                imageUrl: '',
            };

            setUserProfile(mockUser);
            setWorkspaceSettings(mockWorkspace);
            setEditedName(mockUser.name);
            setEditedWorkspaceName(mockWorkspace.name);
            setEditedWorkspaceImage(mockWorkspace.imageUrl);
        } catch (error) {
            showToast('설정을 불러오는데 실패했습니다.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveUserProfile = async () => {
        if (!editedName.trim()) {
            showToast('이름을 입력해주세요.', 'error');
            return;
        }

        setIsSaving(true);
        try {
            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 500));

            setUserProfile({ ...userProfile!, name: editedName });
            setIsEditingName(false);
            showToast('프로필이 저장되었습니다.', 'success');
        } catch (error) {
            showToast('프로필 저장에 실패했습니다.', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveWorkspace = async () => {
        if (!editedWorkspaceName.trim()) {
            showToast('워크스페이스 이름을 입력해주세요.', 'error');
            return;
        }

        setIsSaving(true);
        try {
            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 500));

            setWorkspaceSettings({
                ...workspaceSettings!,
                name: editedWorkspaceName,
                imageUrl: editedWorkspaceImage,
            });
            setIsEditingWorkspace(false);
            showToast('워크스페이스 설정이 저장되었습니다.', 'success');
        } catch (error) {
            showToast('워크스페이스 설정 저장에 실패했습니다.', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <WorkspaceHeader workspaceName="독서모임 북클럽" />
                <WorkspaceSidebar workspaceId={params.id} />
                <main className={`px-6 py-8 transition-all duration-300 ${isSidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
                    <div className="flex items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent" />
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <WorkspaceHeader workspaceName={workspaceSettings?.name || '독서모임 북클럽'} />
            <WorkspaceSidebar workspaceId={params.id} />

            <main className={`px-6 py-8 transition-all duration-300 ${isSidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
                <div className="max-w-4xl mx-auto space-y-8">
                    {/* Page Header */}
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">설정</h1>
                        <p className="text-gray-600">프로필과 워크스페이스 설정을 관리하세요.</p>
                    </div>

                    {/* User Profile Section */}
                    <section className="bg-white rounded-xl shadow-card border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">내 프로필</h2>
                                <p className="text-sm text-gray-600 mt-1">개인 정보를 관리하세요.</p>
                            </div>
                            {!isEditingName && (
                                <Button
                                    variant="secondary"
                                    onClick={() => setIsEditingName(true)}
                                    className="flex items-center gap-2"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                    수정
                                </Button>
                            )}
                        </div>

                        <div className="space-y-4">
                            {/* Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    이름
                                </label>
                                {isEditingName ? (
                                    <div className="flex gap-3">
                                        <input
                                            type="text"
                                            value={editedName}
                                            onChange={(e) => setEditedName(e.target.value)}
                                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                            placeholder="이름을 입력하세요"
                                        />
                                        <Button
                                            onClick={handleSaveUserProfile}
                                            disabled={isSaving}
                                            className="whitespace-nowrap"
                                        >
                                            {isSaving ? '저장 중...' : '저장'}
                                        </Button>
                                        <Button
                                            variant="secondary"
                                            onClick={() => {
                                                setIsEditingName(false);
                                                setEditedName(userProfile?.name || '');
                                            }}
                                            disabled={isSaving}
                                        >
                                            취소
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="px-4 py-2 bg-gray-50 rounded-lg border border-gray-200">
                                        <p className="text-gray-900">{userProfile?.name}</p>
                                    </div>
                                )}
                            </div>

                            {/* Email (Read-only) */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    이메일
                                </label>
                                <div className="px-4 py-2 bg-gray-50 rounded-lg border border-gray-200">
                                    <p className="text-gray-900">{userProfile?.email}</p>
                                </div>
                            </div>

                            {/* Role (Read-only) */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    역할
                                </label>
                                <div className="px-4 py-2 bg-gray-50 rounded-lg border border-gray-200">
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${userProfile?.role === 'admin'
                                        ? 'bg-emerald-100 text-emerald-700'
                                        : 'bg-gray-100 text-gray-700'
                                        }`}>
                                        {userProfile?.role === 'admin' ? '관리자' : '멤버'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Workspace Settings (Admin Only) */}
                    {userProfile?.role === 'admin' && (
                        <section className="bg-white rounded-xl shadow-card border border-gray-200 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">워크스페이스 설정</h2>
                                    <p className="text-sm text-gray-600 mt-1">워크스페이스 정보를 관리하세요. (관리자 전용)</p>
                                </div>
                                {!isEditingWorkspace && (
                                    <Button
                                        variant="secondary"
                                        onClick={() => setIsEditingWorkspace(true)}
                                        className="flex items-center gap-2"
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                        수정
                                    </Button>
                                )}
                            </div>

                            <div className="space-y-4">
                                {/* Workspace Name */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        워크스페이스 이름
                                    </label>
                                    {isEditingWorkspace ? (
                                        <input
                                            type="text"
                                            value={editedWorkspaceName}
                                            onChange={(e) => setEditedWorkspaceName(e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                            placeholder="워크스페이스 이름을 입력하세요"
                                        />
                                    ) : (
                                        <div className="px-4 py-2 bg-gray-50 rounded-lg border border-gray-200">
                                            <p className="text-gray-900">{workspaceSettings?.name}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Workspace Image URL */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        워크스페이스 이미지 URL
                                    </label>
                                    {isEditingWorkspace ? (
                                        <input
                                            type="text"
                                            value={editedWorkspaceImage}
                                            onChange={(e) => setEditedWorkspaceImage(e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                            placeholder="이미지 URL을 입력하세요 (선택사항)"
                                        />
                                    ) : (
                                        <div className="px-4 py-2 bg-gray-50 rounded-lg border border-gray-200">
                                            <p className="text-gray-900">
                                                {workspaceSettings?.imageUrl || '설정된 이미지가 없습니다'}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Save/Cancel Buttons */}
                                {isEditingWorkspace && (
                                    <div className="flex gap-3 pt-4">
                                        <Button
                                            onClick={handleSaveWorkspace}
                                            disabled={isSaving}
                                            className="flex-1"
                                        >
                                            {isSaving ? '저장 중...' : '저장'}
                                        </Button>
                                        <Button
                                            variant="secondary"
                                            onClick={() => {
                                                setIsEditingWorkspace(false);
                                                setEditedWorkspaceName(workspaceSettings?.name || '');
                                                setEditedWorkspaceImage(workspaceSettings?.imageUrl || '');
                                            }}
                                            disabled={isSaving}
                                            className="flex-1"
                                        >
                                            취소
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </section>
                    )}

                    {/* Danger Zone (Admin Only) */}
                    {userProfile?.role === 'admin' && (
                        <section className="bg-white rounded-xl shadow-card border border-red-200 p-6">
                            <div className="mb-4">
                                <h2 className="text-xl font-bold text-red-600">위험 구역</h2>
                                <p className="text-sm text-gray-600 mt-1">신중하게 사용하세요.</p>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
                                    <div>
                                        <h3 className="font-semibold text-gray-900">워크스페이스 삭제</h3>
                                        <p className="text-sm text-gray-600 mt-1">
                                            워크스페이스를 영구적으로 삭제합니다. 이 작업은 되돌릴 수 없습니다.
                                        </p>
                                    </div>
                                    <Button
                                        variant="secondary"
                                        className="bg-red-600 !text-white hover:bg-red-700 border-red-600"
                                        onClick={() => showToast('워크스페이스 삭제 기능은 준비 중입니다.', 'error')}
                                    >
                                        삭제
                                    </Button>
                                </div>
                            </div>
                        </section>
                    )}
                </div>
            </main>
        </div>
    );
}
