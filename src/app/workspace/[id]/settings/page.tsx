'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import apiClient from '@/lib/api';
import { useWorkspaceMember } from '@/contexts/WorkspaceMemberContext';



interface UserProfile {
    id: string;
    name: string;
    email: string;
    role: string;
}

interface WorkspaceSettings {
    id: string;
    name: string;
    imageUrl: string;
}

export default function SettingsPage({ params }: { params: Promise<{ id: string }> }) {
    const [workspaceId, setWorkspaceId] = useState<string>('');
    const [workspaceSettings, setWorkspaceSettings] = useState<WorkspaceSettings | null>(null);
    const { member, refreshMember } = useWorkspaceMember();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // User profile editing
    const [editedName, setEditedName] = useState('');
    const [isEditingName, setIsEditingName] = useState(false);

    // Workspace editing (admin only)
    const [editedWorkspaceName, setEditedWorkspaceName] = useState('');
    const [isEditingWorkspace, setIsEditingWorkspace] = useState(false);

    // Workspace deletion
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteConfirmation, setDeleteConfirmation] = useState('');

    const { showToast } = useToast();
    const router = useRouter();

    useEffect(() => {
        params.then((resolvedParams) => {
            setWorkspaceId(resolvedParams.id);
            loadSettings(resolvedParams.id);
        });
    }, [params]);

    const loadSettings = async (id: string) => {
        setIsLoading(true);
        try {
            // Fetch workspace details only
            const workspaceResponse = await apiClient.get(`/workspaces/${id}`);

            if (workspaceResponse.data.success) {
                const workspaceData = workspaceResponse.data.data;

                const workspaceSettingsData: WorkspaceSettings = {
                    id: workspaceData.id,
                    name: workspaceData.name,
                    imageUrl: workspaceData.coverImage || '',
                };

                setWorkspaceSettings(workspaceSettingsData);
                setEditedWorkspaceName(workspaceSettingsData.name);
            }
        } catch (error) {
            console.error('Failed to load settings:', error);
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
            const response = await apiClient.patch(`/workspaces/${workspaceId}/me`, {
                name: editedName
            });

            if (response.data.success) {
                await refreshMember();
                setIsEditingName(false);
                showToast('프로필이 수정되었습니다.', 'success');
            } else {
                showToast(response.data.message || '프로필 수정에 실패했습니다.', 'error');
            }
        } catch (error) {
            console.error('Failed to update profile:', error);
            showToast('프로필 수정 중 오류가 발생했습니다.', 'error');
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
            const response = await apiClient.patch(`/workspaces/${workspaceId}`, {
                name: editedWorkspaceName
            });

            if (response.data.success) {
                setWorkspaceSettings({
                    ...workspaceSettings!,
                    name: response.data.data.name,
                });
                setIsEditingWorkspace(false);
                showToast('워크스페이스 정보가 수정되었습니다.', 'success');
                // 변경된 워크스페이스 이름을 헤더 등에 반영하기 위해 새로고침
                window.location.reload();
            } else {
                showToast(response.data.message || '워크스페이스 수정에 실패했습니다.', 'error');
            }
        } catch (error: any) {
            if (error.response?.status === 403) {
                showToast('워크스페이스 수정 권한이 없습니다.', 'error');
            } else {
                console.error('Failed to update workspace:', error);
                showToast('워크스페이스 수정 중 오류가 발생했습니다.', 'error');
            }
        } finally {
            setIsSaving(false);
        }
    };
    const handleDeleteWorkspace = async () => {
        if (deleteConfirmation !== workspaceSettings?.name) {
            return;
        }

        try {
            const response = await apiClient.delete(`/workspaces/${workspaceId}`);

            if (response.data.success) {
                setIsDeleteModalOpen(false);
                showToast('워크스페이스가 삭제되었습니다.', 'success');
                router.replace('/workspace-join');
            } else {
                showToast(response.data.message || '워크스페이스 삭제에 실패했습니다.', 'error');
            }
        } catch (error: any) {
            if (error.response?.status === 403) {
                showToast('워크스페이스 삭제 권한이 없습니다.', 'error');
            } else {
                console.error('Failed to delete workspace:', error);
                showToast('워크스페이스 삭제 중 오류가 발생했습니다.', 'error');
            }
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent" />
            </div>
        );
    }

    return (
        <div className="px-6 py-8">
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
                                onClick={() => {
                                    setEditedName(member?.name || '');
                                    setIsEditingName(true);
                                }}
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
                                            setEditedName(member?.name || '');
                                        }}
                                        disabled={isSaving}
                                    >
                                        취소
                                    </Button>
                                </div>
                            ) : (
                                <div className="px-4 py-2 bg-gray-50 rounded-lg border border-gray-200">
                                    <p className="text-gray-900">{member?.name}</p>
                                </div>
                            )}
                        </div>



                        {/* Role (Read-only) */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                역할
                            </label>
                            <div className="px-4 py-2 bg-gray-50 rounded-lg border border-gray-200">
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${member?.role === 'OWNER' || member?.role === 'ADMIN'
                                    ? 'bg-emerald-100 text-emerald-700'
                                    : 'bg-gray-100 text-gray-700'
                                    }`}>
                                    {member?.role === 'OWNER' ? '소유자' :
                                        member?.role === 'ADMIN' ? '관리자' : '멤버'}
                                </span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Workspace Settings (Admin Only) */}
                {(member?.role === 'OWNER' || member?.role === 'ADMIN') && (
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
                                    <div className="flex gap-3">
                                        <input
                                            type="text"
                                            value={editedWorkspaceName}
                                            onChange={(e) => setEditedWorkspaceName(e.target.value)}
                                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                            placeholder="워크스페이스 이름을 입력하세요"
                                        />
                                        <Button
                                            onClick={handleSaveWorkspace}
                                            disabled={isSaving}
                                            className="whitespace-nowrap"
                                        >
                                            {isSaving ? '저장 중...' : '저장'}
                                        </Button>
                                        <Button
                                            variant="secondary"
                                            onClick={() => {
                                                setIsEditingWorkspace(false);
                                                setEditedWorkspaceName(workspaceSettings?.name || '');
                                            }}
                                            disabled={isSaving}
                                        >
                                            취소
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="px-4 py-2 bg-gray-50 rounded-lg border border-gray-200">
                                        <p className="text-gray-900">{workspaceSettings?.name}</p>
                                    </div>
                                )}
                            </div>

                            {/* Save/Cancel Buttons */}

                        </div>
                    </section>
                )}

                {/* Danger Zone (Admin Only) */}
                {(member?.role === 'OWNER' || member?.role === 'ADMIN') && (
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
                                    className="bg-red-600 text-white hover:bg-red-700 border-red-600"
                                    onClick={() => {
                                        setDeleteConfirmation('');
                                        setIsDeleteModalOpen(true);
                                    }}
                                >                                  삭제
                                </Button>
                            </div>
                        </div>
                    </section>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                title="워크스페이스 삭제"
            >
                <div className="space-y-4">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                        <p className="text-sm text-red-800 font-medium">
                            경고: 이 작업은 되돌릴 수 없습니다.
                        </p>
                        <p className="text-sm text-red-700 mt-1">
                            워크스페이스의 모든 데이터(멤버, 모임, 기록 등)가 영구적으로 삭제됩니다.
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            삭제를 확인하려면 <span className="font-bold text-gray-900">{workspaceSettings?.name}</span>을(를) 입력하세요.
                        </label>
                        <input
                            type="text"
                            value={deleteConfirmation}
                            onChange={(e) => setDeleteConfirmation(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                            placeholder={workspaceSettings?.name}
                        />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <Button
                            variant="secondary"
                            onClick={() => setIsDeleteModalOpen(false)}
                            className="flex-1"
                        >
                            취소
                        </Button>
                        <Button
                            className="flex-1 bg-red-600 text-white hover:bg-red-700 border-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={deleteConfirmation !== workspaceSettings?.name}
                            onClick={handleDeleteWorkspace}
                        >
                            삭제
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
