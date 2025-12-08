'use client';

import React, { useState, useEffect } from 'react';
import apiClient from '@/lib/api';
import { useWorkspaceMember } from '@/contexts/WorkspaceMemberContext';

import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { Modal } from '@/components/ui/Modal';

interface Member {
    id: string;
    name: string;
    role: 'ADMIN' | 'MEMBER';
    userId: string;
}

const roleOptions = [
    { value: 'ADMIN', label: 'ADMIN' },
    { value: 'MEMBER', label: 'MEMBER' },
];

export default function MembersPage({ params }: { params: Promise<{ id: string }> }) {
    const [workspaceId, setWorkspaceId] = useState<string>('');
    const [members, setMembers] = useState<Member[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const { showToast } = useToast();
    const { member: currentMember } = useWorkspaceMember();

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [memberToDelete, setMemberToDelete] = useState<Member | null>(null);

    const itemsPerPage = 10;

    useEffect(() => {
        params.then((resolvedParams) => {
            setWorkspaceId(resolvedParams.id);
        });
    }, [params]);

    useEffect(() => {
        if (!workspaceId) return;

        const timer = setTimeout(() => {
            loadMembers(workspaceId, searchQuery);
        }, 300); // 300ms debounce

        return () => clearTimeout(timer);
    }, [workspaceId, searchQuery]);

    const loadMembers = async (id: string, keyword?: string) => {
        setIsLoading(true);
        try {
            const payload: any = { workspaceId: id };
            if (keyword) {
                payload.keyword = keyword;
            }

            const response = await apiClient.post('/members', payload);
            if (response.data.success) {
                setMembers(response.data.data);
            } else {
                showToast(response.data.message || '멤버 목록을 불러오는데 실패했습니다.', 'error');
            }
        } catch (error) {
            console.error('Failed to load members:', error);
            showToast('멤버 목록을 불러오는 중 오류가 발생했습니다.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRoleChange = async (memberId: string, newRole: string) => {
        const previousMembers = [...members];
        setMembers(members.map(m => m.id === memberId ? { ...m, role: newRole as Member['role'] } : m));

        try {
            const response = await apiClient.patch('/members/role', {
                workspaceId,
                memberId,
                updateRole: newRole
            });

            if (response.data.success) {
                showToast('멤버 권한을 수정했습니다.', 'success');
            } else {
                setMembers(previousMembers);
                showToast(response.data.message || '권한 수정에 실패했습니다.', 'error');
            }
        } catch (error: any) {
            console.error('Failed to update role:', error);
            setMembers(previousMembers);
            if (error.response?.status === 403) {
                showToast(error.response.data.message || '권한이 없습니다.', 'error');
            } else {
                showToast('권한 수정 중 오류가 발생했습니다.', 'error');
            }
        }
    };

    const handleRemoveMember = (member: Member) => {
        setMemberToDelete(member);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!memberToDelete || !workspaceId) return;

        try {
            const response = await apiClient.delete('/members', {
                data: {
                    workspaceId,
                    memberId: memberToDelete.id
                }
            });

            if (response.data.success) {
                showToast('멤버를 내보냈습니다.', 'success');
                setMembers(members.filter(m => m.id !== memberToDelete.id));
                setIsDeleteModalOpen(false);
                setMemberToDelete(null);
            } else {
                showToast(response.data.message || '멤버 내보내기에 실패했습니다.', 'error');
            }
        } catch (error: any) {
            console.error('Failed to remove member:', error);
            if (error.response?.status === 403) {
                showToast(error.response.data.message || '권한이 없습니다.', 'error');
            } else {
                showToast('멤버 내보내기 중 오류가 발생했습니다.', 'error');
            }
        }
    };

    // Client-side filtering removed, as server does filtering
    const filteredMembers = members;

    const totalPages = Math.ceil(filteredMembers.length / itemsPerPage);
    const paginatedMembers = filteredMembers.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    if (!workspaceId) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent" />
            </div>
        );
    }

    return (
        <div className="px-8 py-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold text-gray-900">멤버 관리</h1>
            </div>

            {/* Search Bar */}
            <div className="mb-6">
                <div className="relative max-w-md">
                    <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        type="text"
                        placeholder="멤버를 검색해 주세요."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                </div>
            </div>

            {/* Members Table */}
            <div className="bg-white rounded-lg shadow-card border border-gray-200">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">이름</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                                <div className="flex items-center gap-1">
                                    권한
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">관리</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {paginatedMembers.map((member) => {
                            const isMe = member.userId === currentMember?.userId;
                            return (
                                <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                                                <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                </svg>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium text-gray-900">{member.name}</span>
                                                {isMe && (
                                                    <span className="px-2 py-0.5 text-xs font-medium bg-emerald-100 text-emerald-700 rounded">
                                                        본인
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <select
                                            value={member.role}
                                            onChange={(e) => handleRoleChange(member.id, e.target.value)}
                                            disabled={isMe}
                                            className={`px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white ${isMe ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`}
                                        >
                                            {roleOptions.map((option) => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                    </td>
                                    <td className="px-6 py-4">
                                        {!isMe && (
                                            <button
                                                onClick={() => handleRemoveMember(member)}
                                                className="px-4 py-2 text-sm text-gray-700 hover:text-red-600 border border-gray-300 rounded-lg hover:border-red-300 transition-colors"
                                            >
                                                내보내기
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>

                {/* Pagination */}
                <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-center gap-2">
                    <button
                        onClick={() => setCurrentPage(1)}
                        disabled={currentPage === 1}
                        className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                        </svg>
                    </button>
                    <button
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`px-3 py-1 rounded ${currentPage === page
                                ? 'bg-emerald-600 text-white'
                                : 'text-gray-600 hover:bg-gray-100'
                                }`}
                        >
                            {page}
                        </button>
                    ))}
                    <button
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                    <button
                        onClick={() => setCurrentPage(totalPages)}
                        disabled={currentPage === totalPages}
                        className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => {
                    setIsDeleteModalOpen(false);
                    setMemberToDelete(null);
                }}
                title="멤버 내보내기"
            >
                <div className="space-y-4">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <p className="text-sm text-red-800 font-medium">
                            정말 {memberToDelete?.name}님을 내보내시겠습니까?
                        </p>
                        <p className="text-sm text-red-700 mt-1">
                            내보낸 멤버는 워크스페이스에 접근할 수 없게 됩니다.
                        </p>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <Button
                            variant="secondary"
                            onClick={() => {
                                setIsDeleteModalOpen(false);
                                setMemberToDelete(null);
                            }}
                            className="flex-1"
                        >
                            취소
                        </Button>
                        <Button
                            className="flex-1 bg-red-600 text-white hover:bg-red-700 border-red-600"
                            onClick={handleConfirmDelete}
                        >
                            내보내기
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
