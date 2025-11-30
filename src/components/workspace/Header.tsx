'use client';

import React from 'react';
import Link from 'next/link';

interface HeaderProps {
    workspaceName: string;
    onSettingsClick?: () => void;
}

export const WorkspaceHeader: React.FC<HeaderProps> = ({ workspaceName, onSettingsClick }) => {
    return (
        <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
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
                        {/* User Profile */}
                        <div className="flex items-center gap-2">
                            <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white font-semibold">
                                김
                            </div>
                            <span className="text-sm font-medium text-gray-700">김철수</span>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};
