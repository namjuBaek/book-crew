'use client';

import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { useRouter } from 'next/navigation';

interface Workspace {
    id: string;
    name: string;
    invitedBy: string;
    memberCount: number;
    createdAt: string;
}

export default function WorkspaceJoinPage() {
    const [workspaceName, setWorkspaceName] = useState('');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [invitedWorkspaces, setInvitedWorkspaces] = useState<Workspace[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { showToast } = useToast();
    const router = useRouter();

    // Mock API: Fetch invited workspaces
    useEffect(() => {
        const fetchInvitedWorkspaces = async () => {
            setIsLoading(true);
            try {
                // Simulate API call
                await new Promise((resolve) => setTimeout(resolve, 800));

                // Mock data
                const mockWorkspaces: Workspace[] = [
                    {
                        id: '1',
                        name: '독서모임 북클럽',
                        invitedBy: '김철수',
                        memberCount: 8,
                        createdAt: '2025-01-15',
                    },
                    {
                        id: '2',
                        name: '주말 독서 모임',
                        invitedBy: '이영희',
                        memberCount: 5,
                        createdAt: '2025-02-01',
                    },
                    {
                        id: '3',
                        name: '비즈니스 북 스터디',
                        invitedBy: '박민수',
                        memberCount: 12,
                        createdAt: '2025-01-20',
                    },
                ];

                setInvitedWorkspaces(mockWorkspaces);
                showToast('초대받은 모임 목록을 불러왔습니다.', 'success');
            } catch (error) {
                showToast('모임 목록을 불러오는데 실패했습니다.', 'error');
            } finally {
                setIsLoading(false);
            }
        };

        fetchInvitedWorkspaces();
    }, [showToast]);

    // Handle workspace creation
    const handleCreateWorkspace = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!workspaceName.trim()) {
            showToast('모임명을 입력해주세요.', 'error');
            return;
        }

        if (workspaceName.trim().length < 2) {
            showToast('모임명은 최소 2자 이상이어야 합니다.', 'error');
            return;
        }

        try {
            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 500));

            showToast(`"${workspaceName}" 모임이 생성되었습니다!`, 'success');

            // Redirect to workspace home after creation
            setTimeout(() => {
                router.push(`/workspace/new`);
            }, 1000);
        } catch (error) {
            showToast('모임 생성에 실패했습니다.', 'error');
        }
    };

    // Handle workspace join
    const handleJoinWorkspace = async (workspace: Workspace) => {
        try {
            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 500));

            showToast(`"${workspace.name}" 모임에 참여했습니다!`, 'success');

            // Redirect to workspace home
            setTimeout(() => {
                router.push(`/workspace/${workspace.id}`);
            }, 1000);
        } catch (error) {
            showToast('모임 참여에 실패했습니다.', 'error');
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-emerald-50 via-white to-teal-50 relative overflow-hidden">
            {/* Background decorative elements */}
            <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
            <div className="absolute top-0 right-0 w-96 h-96 bg-teal-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
            <div className="absolute -bottom-8 left-20 w-96 h-96 bg-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />

            {/* Header */}
            <header className="relative z-10 bg-white/80 backdrop-blur-xl border-b border-white/20 shadow-sm">
                <div className="max-w-6xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            {/* Logo */}
                            <div className="relative">
                                <div className="absolute inset-0 bg-emerald-500 rounded-lg blur-md opacity-50" />
                                <div className="relative bg-gradient-to-br from-emerald-500 to-emerald-600 p-2 rounded-lg shadow-lg">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white">
                                        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M6.5 2H20V22H6.5A2.5 2.5 0 0 1 4 19.5V4.5A2.5 2.5 0 0 1 6.5 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                            </div>
                            <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                                BookCrew
                            </h1>
                        </div>
                        <Button
                            variant="primary"
                            onClick={() => setIsCreateModalOpen(true)}
                            className="flex items-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            모임 생성
                        </Button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="relative z-10 flex-1 max-w-6xl w-full mx-auto px-6 py-12">
                <div className="mb-8 animate-fade-in">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">모임 참여하기</h2>
                    <p className="text-gray-600">초대받은 독서 모임에 참여하거나 새로운 모임을 만들어보세요.</p>
                </div>

                {/* Invited Workspaces List */}
                {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent" />
                    </div>
                ) : invitedWorkspaces.length === 0 ? (
                    <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-12 text-center animate-slide-up">
                        <div className="flex justify-center mb-4">
                            <div className="bg-emerald-100 p-4 rounded-full">
                                <svg className="w-12 h-12 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">초대받은 모임이 없습니다</h3>
                        <p className="text-gray-600 mb-6">새로운 모임을 만들어 독서 여정을 시작해보세요!</p>
                        <Button onClick={() => setIsCreateModalOpen(true)}>
                            모임 만들기
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-slide-up">
                        {invitedWorkspaces.map((workspace, index) => (
                            <div
                                key={workspace.id}
                                className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                {/* Workspace Icon */}
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-3 rounded-xl shadow-md">
                                        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                        </svg>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-gray-900 text-lg truncate">{workspace.name}</h3>
                                    </div>
                                </div>

                                {/* Workspace Info */}
                                <div className="space-y-2 mb-4">
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                        <span>초대자: <span className="font-medium text-gray-900">{workspace.invitedBy}</span></span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                        <span>멤버: <span className="font-medium text-gray-900">{workspace.memberCount}명</span></span>
                                    </div>
                                </div>

                                {/* Join Button */}
                                <Button
                                    fullWidth
                                    onClick={() => handleJoinWorkspace(workspace)}
                                    className="mt-4"
                                >
                                    참여하기
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* Create Workspace Modal */}
            <Modal
                isOpen={isCreateModalOpen}
                onClose={() => {
                    setIsCreateModalOpen(false);
                    setWorkspaceName('');
                }}
                title="새 모임 만들기"
            >
                <form onSubmit={handleCreateWorkspace} className="space-y-6">
                    <div>
                        <Input
                            label="모임명"
                            type="text"
                            placeholder="주말 독서 모임"
                            value={workspaceName}
                            onChange={(e) => setWorkspaceName(e.target.value)}
                            autoFocus
                        />
                        <p className="mt-2 text-sm text-gray-500">
                            함께 독서할 멤버들과 공유할 모임 이름을 입력해주세요.
                        </p>
                    </div>

                    <div className="flex gap-3">
                        <Button
                            type="button"
                            variant="secondary"
                            fullWidth
                            onClick={() => {
                                setIsCreateModalOpen(false);
                                setWorkspaceName('');
                            }}
                        >
                            취소
                        </Button>
                        <Button type="submit" fullWidth>
                            생성 및 접속
                        </Button>
                    </div>
                </form>
            </Modal>

            <style jsx>{`
                @keyframes blob {
                    0%, 100% {
                        transform: translate(0, 0) scale(1);
                    }
                    33% {
                        transform: translate(30px, -50px) scale(1.1);
                    }
                    66% {
                        transform: translate(-20px, 20px) scale(0.9);
                    }
                }
                .animate-blob {
                    animation: blob 7s infinite;
                }
                .animation-delay-2000 {
                    animation-delay: 2s;
                }
                .animation-delay-4000 {
                    animation-delay: 4s;
                }
            `}</style>
        </div>
    );
}
