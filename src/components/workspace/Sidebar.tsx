'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavItem {
    name: string;
    href: string;
    icon: React.ReactNode;
}

interface SidebarProps {
    workspaceId: string;
}

export const WorkspaceSidebar: React.FC<SidebarProps> = ({ workspaceId }) => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const pathname = usePathname();

    const navItems: NavItem[] = [
        {
            name: '홈',
            href: `/workspace/${workspaceId}`,
            icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
            ),
        },
        {
            name: '독서 모임',
            href: `/workspace/${workspaceId}/meetings`,
            icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
            ),
        },
        {
            name: '멤버',
            href: `/workspace/${workspaceId}/members`,
            icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
            ),
        },
        {
            name: '설정',
            href: `/workspace/${workspaceId}/settings`,
            icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            ),
        },
    ];

    const isActive = (href: string) => {
        if (href === `/workspace/${workspaceId}`) {
            return pathname === href;
        }
        return pathname?.startsWith(href);
    };

    return (
        <aside
            className={`
                fixed left-0 top-[73px] bottom-0 bg-white border-r border-gray-200 z-30 overflow-y-auto
                transition-all duration-300 ease-in-out
                ${isCollapsed ? 'w-20' : 'w-64'}
            `}
        >
            {/* Header with Logo and Toggle */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                {!isCollapsed && (
                    <div className="flex items-center gap-2">
                        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-1.5 rounded-lg">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white">
                                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M6.5 2H20V22H6.5A2.5 2.5 0 0 1 4 19.5V4.5A2.5 2.5 0 0 1 6.5 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <span className="font-semibold text-gray-900">BookCrew</span>
                    </div>
                )}
                <button
                    onClick={() => {
                        const newState = !isCollapsed;
                        setIsCollapsed(newState);
                        // Dispatch custom event for other components to listen
                        window.dispatchEvent(new CustomEvent('sidebarToggle', {
                            detail: { isCollapsed: newState }
                        }));
                    }}
                    className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                    aria-label={isCollapsed ? '사이드바 열기' : '사이드바 닫기'}
                >
                    <svg
                        className={`w-4 h-4 text-gray-600 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                    </svg>
                </button>
            </div>

            <nav className="p-4 space-y-1">
                {navItems.map((item) => {
                    const active = isActive(item.href);
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`
                                flex items-center rounded-lg font-medium transition-all duration-200
                                ${isCollapsed ? 'justify-center px-4 py-3' : 'gap-3 px-4 py-3'}
                                ${active
                                    ? 'bg-emerald-50 text-emerald-700 shadow-sm'
                                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                                }
                            `}
                            title={isCollapsed ? item.name : undefined}
                        >
                            <span className={active ? 'text-emerald-600' : 'text-gray-500'}>
                                {item.icon}
                            </span>
                            {!isCollapsed && <span>{item.name}</span>}
                        </Link>
                    );
                })}
            </nav>

            {/* Workspace Switcher */}
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-white">
                <Link
                    href="/workspace-join"
                    className={`
                        flex items-center rounded-lg text-gray-700 hover:bg-gray-50 transition-colors
                        ${isCollapsed ? 'justify-center px-4 py-3' : 'gap-3 px-4 py-3'}
                    `}
                    title={isCollapsed ? '모임 전환' : undefined}
                >
                    <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                    {!isCollapsed && <span className="text-sm font-medium">모임 전환</span>}
                </Link>
            </div>
        </aside>
    );
};
