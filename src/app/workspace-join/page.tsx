'use client';

import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { LoadingOverlay } from '@/components/ui/LoadingOverlay';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import apiClient from '@/lib/api';

interface Workspace {
    id: string;
    name: string;
    description: string | null;
    coverImage: string | null;
    createdAt: string;
    role?: 'ADMIN' | 'MEMBER';
    isJoined?: boolean;
}

export default function WorkspaceJoinPage() {
    const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
    const [workspaceName, setWorkspaceName] = useState('');
    const [workspaceDescription, setWorkspaceDescription] = useState('');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

    // Join Modal States
    const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResult, setSearchResult] = useState<Workspace[]>([]);
    const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace | null>(null);
    const [joinCode, setJoinCode] = useState('');
    const [isSearching, setIsSearching] = useState(false);

    const { showToast } = useToast();
    const router = useRouter();

    // 로그아웃 처리
    const handleLogout = async () => {
        try {
            await apiClient.post('/users/logout');
            showToast('로그아웃되었습니다.', 'success');
            router.push('/login');
        } catch (error) {
            console.error('Logout error:', error);
            // 에러가 발생해도 로그인 페이지로 이동
            router.push('/login');
        }
    };

    // Fetch joined workspaces
    useEffect(() => {
        // 인증되지 않은 경우 데이터 로딩하지 않음
        if (!isAuthenticated || isAuthLoading) {
            return;
        }

        const fetchWorkspaces = async () => {
            setIsLoading(true);
            try {
                const response = await apiClient.get('/workspaces');
                setWorkspaces(response.data.data);
            } catch (error) {
                console.error('Failed to fetch workspaces:', error);
                showToast('모임 목록을 불러오는데 실패했습니다.', 'error');
            } finally {
                setIsLoading(false);
            }
        };

        fetchWorkspaces();
    }, [showToast, isAuthenticated, isAuthLoading]);

    // 인증 확인 중이면 로딩 표시
    if (isAuthLoading) {
        return <LoadingOverlay isVisible={true} message="인증 확인 중..." />;
    }

    // 인증되지 않은 경우 (useAuth가 자동으로 리다이렉트하지만 안전장치)
    if (!isAuthenticated) {
        return null;
    }

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
            const response = await apiClient.post('/workspaces', {
                workspaceName: workspaceName,
                description: workspaceDescription
            });

            const { id, name } = response.data.data;

            showToast(`"${name}" 모임이 생성되었습니다!`, 'success');

            setIsCreateModalOpen(false);
            setWorkspaceName('');
            setWorkspaceDescription('');

            // Redirect to workspace home
            router.push(`/workspace/${id}`);
        } catch (error: any) {
            console.error('Workspace creation error:', error);
            const errorMessage = error.response?.data?.message || '모임 생성에 실패했습니다.';
            showToast(errorMessage, 'error');
        }
    };

    // Handle workspace search
    const handleSearchWorkspace = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;

        setIsSearching(true);
        setSearchResult([]);
        setSelectedWorkspace(null);

        try {
            const response = await apiClient.get(`/workspaces/search?search=${encodeURIComponent(searchQuery)}`);

            if (response.data.success) {
                const results = response.data.data;
                setSearchResult(results);

                if (results.length === 0) {
                    showToast('검색 결과가 없습니다.', 'error');
                }
            }
        } catch (error) {
            console.error('Search error:', error);
            showToast('모임 검색에 실패했습니다.', 'error');
        } finally {
            setIsSearching(false);
        }
    };

    // Handle join request with code
    const handleJoinWithCode = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedWorkspace || !joinCode.trim()) return;

        try {
            await apiClient.post(`/workspaces/join`, {
                workspaceId: selectedWorkspace.id,
                workspacePassword: joinCode
            });

            showToast(`"${selectedWorkspace.name}" 모임에 가입되었습니다!`, 'success');
            setIsJoinModalOpen(false);
            setJoinCode('');

            const joinedWorkspaceId = selectedWorkspace.id;
            setSelectedWorkspace(null);
            setSearchQuery('');
            setSearchResult([]);

            // Redirect to workspace home
            router.push(`/workspace/${joinedWorkspaceId}`);
        } catch (error: any) {
            console.error('Join error:', error);
            const errorMessage = error.response?.data?.message || '참여 코드가 올바르지 않거나 가입에 실패했습니다.';
            showToast(errorMessage, 'error');
        }
    };

    // Handle workspace enter
    const handleEnterWorkspace = (workspaceId: string) => {
        router.push(`/workspace/${workspaceId}`);
    };

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-emerald-50 via-white to-teal-50 relative overflow-hidden">
            {/* Background decorative elements */}
            <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
            <div className="absolute top-0 right-0 w-96 h-96 bg-teal-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
            <div className="absolute -bottom-8 left-20 w-96 h-96 bg-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />

            {/* Header */}
            <header className="relative z-50 bg-white/80 backdrop-blur-xl border-b border-white/20 shadow-sm">
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
                        <div className="flex items-center gap-3">
                            {/* Profile Dropdown */}

                            {/* Profile Dropdown */}
                            <div className="relative">
                                <button
                                    onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-emerald-50 transition-colors"
                                >
                                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-semibold shadow-md">
                                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    </div>
                                </button>

                                {/* Dropdown Menu */}
                                {isProfileDropdownOpen && (
                                    <>
                                        {/* Backdrop */}
                                        <div
                                            className="fixed inset-0 z-10"
                                            onClick={() => setIsProfileDropdownOpen(false)}
                                        />

                                        {/* Dropdown */}
                                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-20">
                                            <button
                                                onClick={handleLogout}
                                                className="w-full px-4 py-2 text-left text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 transition-colors flex items-center gap-2"
                                            >
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                                </svg>
                                                로그아웃
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="relative z-10 flex-1 max-w-6xl w-full mx-auto px-6 py-12">
                <div className="mb-8 animate-fade-in flex items-end justify-between">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">참여 중인 모임</h2>
                        <p className="text-gray-600">참여 중인 독서 모임 목록입니다. 새로운 모임을 만들어보세요.</p>
                    </div>
                    {workspaces.length > 0 && (
                        <div className="flex items-center gap-3">
                            <Button
                                variant="secondary"
                                onClick={() => setIsJoinModalOpen(true)}
                                className="flex items-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                </svg>
                                모임 참여
                            </Button>
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
                    )}
                </div>

                {/* Workspaces List */}
                {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent" />
                    </div>
                ) : workspaces.length === 0 ? (
                    <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-12 text-center animate-slide-up">
                        <div className="flex justify-center mb-4">
                            <div className="bg-emerald-100 p-4 rounded-full">
                                <svg className="w-12 h-12 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">참여 중인 모임이 없습니다</h3>
                        <p className="text-gray-600 mb-6">새로운 모임을 만들어 독서 여정을 시작해보세요!</p>
                        <div className="flex justify-center gap-3">
                            <Button
                                variant="secondary"
                                onClick={() => setIsJoinModalOpen(true)}
                            >
                                모임 참여
                            </Button>
                            <Button onClick={() => setIsCreateModalOpen(true)}>
                                모임 생성
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-slide-up">
                        {workspaces.map((workspace, index) => (
                            <div
                                key={workspace.id}
                                className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                                style={{ animationDelay: `${index * 100}ms` }}
                                onClick={() => handleEnterWorkspace(workspace.id)}
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
                                        <span className={`px-2 py-1 rounded-md text-xs font-medium ${workspace.role === 'ADMIN' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-700'}`}>
                                            {workspace.role === 'ADMIN' ? '관리자' : '멤버'}
                                        </span>
                                        <span className="text-gray-400">|</span>
                                        <span className="text-gray-500">
                                            {new Date(workspace.createdAt).toLocaleDateString()} 가입
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-500 line-clamp-2 h-10">
                                        {workspace.description || " "}
                                    </p>
                                </div>

                                {/* Enter Button */}
                                <Button
                                    fullWidth
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleEnterWorkspace(workspace.id);
                                    }}
                                    className="mt-4"
                                >
                                    입장하기
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
                    setWorkspaceDescription('');
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

                    <div>
                        <Input
                            label="모임 설명 (선택)"
                            type="text"
                            placeholder="모임에 대한 간단한 설명을 입력해주세요"
                            value={workspaceDescription}
                            onChange={(e) => setWorkspaceDescription(e.target.value)}
                        />
                    </div>

                    <div className="flex gap-3">
                        <Button
                            type="button"
                            variant="secondary"
                            fullWidth
                            onClick={() => {
                                setIsCreateModalOpen(false);
                                setWorkspaceName('');
                                setWorkspaceDescription('');
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

            {/* Join Workspace Modal */}
            <Modal
                isOpen={isJoinModalOpen}
                onClose={() => {
                    setIsJoinModalOpen(false);
                    setSearchQuery('');
                    setSearchResult([]);
                    setSelectedWorkspace(null);
                    setJoinCode('');
                }}
                title="모임 참여하기"
            >
                <div className="space-y-6">
                    {/* Search Section */}
                    <form onSubmit={handleSearchWorkspace} className="flex gap-2">
                        <div className="flex-1">
                            <Input
                                label=""
                                type="text"
                                placeholder="모임 이름 검색"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                autoFocus
                            />
                        </div>
                        <Button type="submit" disabled={isSearching}>
                            {isSearching ? '검색 중...' : '검색'}
                        </Button>
                    </form>

                    {/* Search Results */}
                    {searchResult.length > 0 && !selectedWorkspace && (
                        <div className="space-y-3">
                            <p className="text-sm text-gray-500 font-medium">검색 결과</p>
                            {searchResult.map((workspace) => (
                                <div
                                    key={workspace.id}
                                    className={`border border-gray-200 rounded-xl p-4 transition-all ${workspace.isJoined
                                        ? 'bg-gray-50 opacity-60 cursor-default'
                                        : 'hover:border-emerald-500 hover:bg-emerald-50 cursor-pointer'
                                        }`}
                                    onClick={() => !workspace.isJoined && setSelectedWorkspace(workspace)}
                                >
                                    <div className="flex items-center justify-between">
                                        <h4 className="font-bold text-gray-900">{workspace.name}</h4>
                                        {workspace.isJoined && (
                                            <span className="text-xs font-semibold text-emerald-600 bg-emerald-100 px-2 py-1 rounded-full">
                                                참여 중
                                            </span>
                                        )}
                                    </div>
                                    {workspace.description && (
                                        <p className="text-sm text-gray-600 mt-1">{workspace.description}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Join Code Section */}
                    {selectedWorkspace && (
                        <div className="bg-gray-50 rounded-xl p-6 animate-fade-in">
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="font-bold text-gray-900">{selectedWorkspace.name}</h4>
                                <button
                                    onClick={() => setSelectedWorkspace(null)}
                                    className="text-sm text-gray-500 hover:text-gray-700"
                                >
                                    다른 모임 선택
                                </button>
                            </div>

                            <form onSubmit={handleJoinWithCode} className="space-y-4">
                                <Input
                                    label="참여 코드"
                                    type="text"
                                    placeholder="참여 코드를 입력하세요"
                                    value={joinCode}
                                    onChange={(e) => setJoinCode(e.target.value)}
                                />
                                <Button type="submit" fullWidth variant="primary">
                                    가입하기
                                </Button>
                            </form>
                        </div>
                    )}
                </div>
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
