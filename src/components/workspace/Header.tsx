'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api';
import { useToast } from '@/components/ui/Toast';
import { useWorkspaceMember } from '@/contexts/WorkspaceMemberContext';

interface HeaderProps {
    workspaceName: string;
    onSettingsClick?: () => void;
}

export const WorkspaceHeader: React.FC<HeaderProps> = ({ workspaceName, onSettingsClick }) => {
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const { member } = useWorkspaceMember();
    const router = useRouter();
    const { showToast } = useToast();

    const handleLogout = async () => {
        try {
            await apiClient.post('/users/logout');
            showToast('로그아웃되었습니다.', 'success');
            router.push('/login');
        } catch (error) {
            console.error('Logout failed:', error);
            showToast('로그아웃에 실패했습니다.', 'error');
            // 실패해도 로그인 페이지로 이동 (토큰 만료 등일 수 있음)
            router.push('/login');
        }
    };

    return (
        <header className="bg-white border-b border-gray-200 fixed top-0 left-0 right-0 z-40 shadow-sm">
            <div className="px-6 py-4">
                <div className="flex items-center justify-between">
                    {/* Left: Logo and Workspace Name */}
                    <div className="flex items-center gap-4">
                        <Link href="/workspace-join" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
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
                            <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                                BookCrew
                            </h1>
                        </Link>

                        {/* Divider */}
                        <div className="h-6 w-px bg-gray-300" />

                        {/* Workspace Name */}
                        <div className="flex items-center gap-2">
                            <div className="bg-emerald-100 p-2 rounded-lg">
                                <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                            <h2 className="text-lg font-semibold text-gray-900">{workspaceName}</h2>
                        </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-3">
                        {/* User Profile Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setIsProfileOpen(!isProfileOpen)}
                                className="flex items-center gap-2 hover:bg-gray-50 p-1.5 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                            >
                                <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white font-semibold shadow-sm">
                                    {member?.name?.[0] || 'U'}
                                </div>
                                <span className="text-sm font-medium text-gray-700 hidden sm:block">{member?.name || 'Loading...'}</span>
                                <svg className={`w-4 h-4 text-gray-400 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            {/* Dropdown Menu */}
                            {isProfileOpen && (
                                <>
                                    <div
                                        className="fixed inset-0 z-40 cursor-default"
                                        onClick={() => setIsProfileOpen(false)}
                                    />
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50 animate-fade-in origin-top-right">
                                        <div className="px-4 py-3 border-b border-gray-50">
                                            <p className="text-sm font-medium text-gray-900">{member?.name}</p>
                                            <p className="text-xs text-gray-500 truncate">{member?.role}</p>
                                        </div>

                                        <div className="py-1">
                                            <Link
                                                href="/workspace-join"
                                                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-emerald-600 transition-colors"
                                                onClick={() => setIsProfileOpen(false)}
                                            >
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                                                </svg>
                                                모임 전환
                                            </Link>
                                        </div>

                                        <div className="border-t border-gray-50 py-1">
                                            <button
                                                onClick={() => {
                                                    setIsProfileOpen(false);
                                                    handleLogout();
                                                }}
                                                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
                                            >
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                                </svg>
                                                로그아웃
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};
