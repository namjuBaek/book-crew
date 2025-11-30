'use client';

import React, { useState, useEffect } from 'react';
import { WorkspaceHeader } from '@/components/workspace/Header';
import { WorkspaceSidebar } from '@/components/workspace/Sidebar';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { Modal } from '@/components/ui/Modal';

interface Member {
    id: string;
    username: string;
    name: string;
    badge?: string;
    email: string;
    role: 'Owner' | 'Super Admin' | 'Security Admin' | 'Staff';
    joinDate: string;
}

interface PendingInvite {
    id: string;
    username: string;
    email: string;
    role: 'Admin' | 'Member';
    invitedDate: string;
    invitedBy: string;
}

const roleOptions = [
    { value: 'Owner', label: 'Owner' },
    { value: 'Super Admin', label: 'Super Admin' },
    { value: 'Security Admin', label: 'Security Admin' },
    { value: 'Staff', label: 'Staff' },
];

const inviteRoleOptions = [
    { value: 'Admin', label: '관리자' },
    { value: 'Member', label: '멤버' },
];

export default function MembersPage({ params }: { params: Promise<{ id: string }> }) {
    const [workspaceId, setWorkspaceId] = useState<string>('');
    const [members, setMembers] = useState<Member[]>([]);
    const [pendingInvites, setPendingInvites] = useState<PendingInvite[]>([]);
    const [activeTab, setActiveTab] = useState<'current' | 'pending'>('current');
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteRole, setInviteRole] = useState<'Admin' | 'Member'>('Member');
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const { showToast } = useToast();

    const itemsPerPage = 10;

    useEffect(() => {
        params.then((resolvedParams) => {
            setWorkspaceId(resolvedParams.id);
            loadMembers();
            loadPendingInvites();
        });
    }, [params]);

    const loadMembers = () => {
        // Mock data
        const mockMembers: Member[] = [
            { id: '1', username: 'gildong', name: '홍길동', badge: '본인', email: 'gildong@mile.im', role: 'Owner', joinDate: '2024-01-01' },
            { id: '2', username: 'gildong', name: '홍길동', email: 'gildong@mile.im', role: 'Super Admin', joinDate: '2024-01-15' },
            { id: '3', username: 'gildong', name: '홍길동', email: 'gildong@mile.im', role: 'Security Admin', joinDate: '2024-02-01' },
            { id: '4', username: 'gildong', name: '홍길동', email: 'gildong@mile.im', role: 'Staff', joinDate: '2024-02-15' },
            { id: '5', username: 'gildong', name: '홍길동', email: 'gildong@mile.im', role: 'Staff', joinDate: '2024-03-01' },
            { id: '6', username: 'gildong', name: '홍길동', email: 'gildong@mile.im', role: 'Staff', joinDate: '2024-03-15' },
            { id: '7', username: 'gildong', name: '홍길동', email: 'gildong@mile.im', role: 'Staff', joinDate: '2024-04-01' },
            { id: '8', username: 'gildong', name: '홍길동', email: 'gildong@mile.im', role: 'Staff', joinDate: '2024-04-15' },
            { id: '9', username: 'gildong', name: '홍길동', email: 'gildong@mile.im', role: 'Staff', joinDate: '2024-05-01' },
            { id: '10', username: 'gildong', name: '홍길동', email: 'gildong@mile.im', role: 'Staff', joinDate: '2024-05-15' },
        ];
        setMembers(mockMembers);
        setIsLoading(false);
    };

    const loadPendingInvites = () => {
        // Mock data
        const mockInvites: PendingInvite[] = [
            { id: '1', username: 'user', email: 'user1@example.com', role: 'Member', invitedDate: '2024-06-01', invitedBy: '홍길동' },
            { id: '2', username: 'admin', email: 'user2@example.com', role: 'Admin', invitedDate: '2024-06-02', invitedBy: '홍길동' },
        ];
        setPendingInvites(mockInvites);
    };

    const handleInviteMember = () => {
        if (!inviteEmail) {
            showToast('이메일을 입력해주세요.', 'error');
            return;
        }

        const newInvite: PendingInvite = {
            id: Date.now().toString(),
            username: inviteEmail,
            email: `${inviteEmail}@example.com`,
            role: inviteRole,
            invitedDate: new Date().toISOString().split('T')[0],
            invitedBy: '홍길동',
        };

        setPendingInvites([...pendingInvites, newInvite]);
        setIsInviteModalOpen(false);
        setInviteEmail('');
        setInviteRole('Member');
        showToast('멤버 초대가 완료되었습니다.', 'success');
    };

    const handleRoleChange = (memberId: string, newRole: string) => {
        setMembers(members.map(m => m.id === memberId ? { ...m, role: newRole as Member['role'] } : m));
        showToast('권한이 변경되었습니다.', 'success');
    };

    const handleRemoveMember = (memberId: string) => {
        setMembers(members.filter(m => m.id !== memberId));
        showToast('멤버가 삭제되었습니다.', 'success');
    };

    const handleCancelInvite = (inviteId: string) => {
        setPendingInvites(pendingInvites.filter(i => i.id !== inviteId));
        showToast('초대가 취소되었습니다.', 'success');
    };

    const filteredMembers = members.filter(member =>
        member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const totalPages = Math.ceil(filteredMembers.length / itemsPerPage);
    const paginatedMembers = filteredMembers.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <div className="min-h-screen bg-gray-50">
            <WorkspaceHeader workspaceName="독서모임 북클럽" />
            <WorkspaceSidebar workspaceId={workspaceId} />

            <main className="ml-64 px-8 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">멤버 관리</h1>
                    <Button
                        onClick={() => setIsInviteModalOpen(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        멤버 초대하기
                    </Button>
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-8 mb-6 border-b border-gray-200">
                    <button
                        onClick={() => setActiveTab('current')}
                        className={`pb-3 px-1 font-medium transition-colors relative ${activeTab === 'current'
                            ? 'text-emerald-600'
                            : 'text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        전체 멤버
                        {activeTab === 'current' && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600" />
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('pending')}
                        className={`pb-3 px-1 font-medium transition-colors relative ${activeTab === 'pending'
                            ? 'text-emerald-600'
                            : 'text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        초대 대기
                        {activeTab === 'pending' && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600" />
                        )}
                    </button>
                </div>

                {/* Search Bar */}
                {activeTab === 'current' && (
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
                )}

                {/* Members Table */}
                {activeTab === 'current' && (
                    <div className="bg-white rounded-lg shadow-card border border-gray-200">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">아이디</th>
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
                                {paginatedMembers.map((member) => (
                                    <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <span className="text-gray-900">{member.username}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                                                    <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                    </svg>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium text-gray-900">{member.name}</span>
                                                    {member.badge && (
                                                        <span className="px-2 py-0.5 text-xs font-medium bg-emerald-100 text-emerald-700 rounded">
                                                            {member.badge}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {member.role === 'Owner' ? (
                                                <span className="text-gray-900 font-medium">{member.role}</span>
                                            ) : (
                                                <select
                                                    value={member.role}
                                                    onChange={(e) => handleRoleChange(member.id, e.target.value)}
                                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                                >
                                                    {roleOptions.filter(r => r.value !== 'Owner').map((option) => (
                                                        <option key={option.value} value={option.value}>
                                                            {option.label}
                                                        </option>
                                                    ))}
                                                </select>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            {member.role !== 'Owner' && (
                                                <button
                                                    onClick={() => handleRemoveMember(member.id)}
                                                    className="px-4 py-2 text-sm text-gray-700 hover:text-red-600 border border-gray-300 rounded-lg hover:border-red-300 transition-colors"
                                                >
                                                    삭제하기
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
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
                )}

                {/* Pending Invites Table */}
                {activeTab === 'pending' && (
                    <div className="bg-white rounded-lg shadow-card border border-gray-200">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">아이디</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">이름</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">권한</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">초대일</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">관리</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {pendingInvites.map((invite) => (
                                    <tr key={invite.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 text-gray-900">{invite.username}</td>
                                        <td className="px-6 py-4 text-gray-600">{invite.invitedBy}</td>
                                        <td className="px-6 py-4 text-gray-600">{invite.role}</td>
                                        <td className="px-6 py-4 text-gray-600">{invite.invitedDate}</td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => handleCancelInvite(invite.id)}
                                                className="px-4 py-2 text-sm text-gray-700 hover:text-red-600 border border-gray-300 rounded-lg hover:border-red-300 transition-colors"
                                            >
                                                취소하기
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Invite Modal */}
                <Modal
                    isOpen={isInviteModalOpen}
                    onClose={() => setIsInviteModalOpen(false)}
                    title="멤버 초대"
                >
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                아이디
                            </label>
                            <input
                                type="text"
                                value={inviteEmail}
                                onChange={(e) => setInviteEmail(e.target.value)}
                                placeholder="gildong"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                권한
                            </label>
                            <select
                                value={inviteRole}
                                onChange={(e) => setInviteRole(e.target.value as 'Admin' | 'Member')}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                            >
                                {inviteRoleOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex gap-3 pt-4">
                            <Button
                                onClick={() => setIsInviteModalOpen(false)}
                                variant="secondary"
                                className="flex-1 cursor-pointer"
                            >
                                취소
                            </Button>
                            <Button
                                onClick={handleInviteMember}
                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
                            >
                                초대하기
                            </Button>
                        </div>
                    </div>
                </Modal>
            </main>
        </div>
    );
}
