'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavItem {
    name: string;
    href: string;
    icon: React.ReactNode;
}

interface NavigationProps {
    workspaceId: string;
}

export const WorkspaceNavigation: React.FC<NavigationProps> = ({ workspaceId }) => {
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
            name: '독서 기록',
            href: `/workspace/${workspaceId}/records`,
            icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            ),
        },
        {
            name: '책 목록',
            href: `/workspace/${workspaceId}/books`,
            icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
            ),
        },
        {
            name: '일정',
            href: `/workspace/${workspaceId}/schedule`,
            icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
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
    ];

    const isActive = (href: string) => {
        if (href === `/workspace/${workspaceId}`) {
            return pathname === href;
        }
        return pathname?.startsWith(href);
    };

    return (
        <nav className="bg-white border-b border-gray-200 sticky top-[73px] z-30">
            <div className="px-6">
                <div className="flex items-center gap-1">
                    {navItems.map((item) => {
                        const active = isActive(item.href);
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`
                                    flex items-center gap-2 px-4 py-3 font-medium transition-all duration-200
                                    ${active
                                        ? 'text-emerald-600 border-b-2 border-emerald-600'
                                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                    }
                                `}
                            >
                                {item.icon}
                                <span>{item.name}</span>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </nav>
    );
};
