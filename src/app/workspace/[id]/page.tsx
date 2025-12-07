'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import Link from 'next/link';

interface NextMeeting {
    id: string;
    title: string;
    date: string;
    time: string;
    location: string;
    book: string;
    chapter: string;
}

interface ReadingRecord {
    id: string;
    session: number;
    date: string;
    book: string;
    participants: number;
    summary: string;
}

interface Book {
    id: string;
    title: string;
    author: string;
    coverColor: string;
    readDate: string;
    rating: number;
}

export default function WorkspaceHomePage({ params }: { params: Promise<{ id: string }> }) {
    const [workspaceId, setWorkspaceId] = useState<string>('');
    const [nextMeeting, setNextMeeting] = useState<NextMeeting | null>(null);
    const [recentRecords, setRecentRecords] = useState<ReadingRecord[]>([]);
    const [recentBooks, setRecentBooks] = useState<Book[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { showToast } = useToast();

    useEffect(() => {
        params.then((resolvedParams) => {
            setWorkspaceId(resolvedParams.id);
        });
    }, [params]);

    useEffect(() => {
        if (!workspaceId) return;

        const fetchData = async () => {
            setIsLoading(true);
            try {
                // Mock data loading simulation
                await new Promise((resolve) => setTimeout(resolve, 800));

                setNextMeeting({
                    id: '1',
                    title: '3월 정기 모임',
                    date: '2025-03-15',
                    time: '14:00',
                    location: '강남 스터디카페',
                    book: '클린 코드',
                    chapter: '3-5장',
                });

                setRecentRecords([
                    {
                        id: '1',
                        session: 12,
                        date: '2025-02-15',
                        book: '리팩토링',
                        participants: 8,
                        summary: '코드 스멜과 리팩토링 기법에 대해 토론했습니다.',
                    },
                    {
                        id: '2',
                        session: 11,
                        date: '2025-01-20',
                        book: '실용주의 프로그래머',
                        participants: 7,
                        summary: '소프트웨어 장인정신과 실용적인 개발 방법론을 논의했습니다.',
                    },
                    {
                        id: '3',
                        session: 10,
                        date: '2025-01-05',
                        book: '오브젝트',
                        participants: 8,
                        summary: '객체지향 설계 원칙과 패턴에 대해 깊이 있게 다뤘습니다.',
                    },
                ]);

                setRecentBooks([
                    {
                        id: '1',
                        title: '클린 코드',
                        author: '로버트 C. 마틴',
                        coverColor: 'from-blue-500 to-blue-700',
                        readDate: '2025-03-15',
                        rating: 5,
                    },
                    {
                        id: '2',
                        title: '리팩토링',
                        author: '마틴 파울러',
                        coverColor: 'from-red-500 to-red-700',
                        readDate: '2025-02-15',
                        rating: 5,
                    },
                    {
                        id: '3',
                        title: '실용주의 프로그래머',
                        author: '앤드류 헌트',
                        coverColor: 'from-purple-500 to-purple-700',
                        readDate: '2025-01-20',
                        rating: 4,
                    },
                    {
                        id: '4',
                        title: '오브젝트',
                        author: '조영호',
                        coverColor: 'from-emerald-500 to-emerald-700',
                        readDate: '2025-01-05',
                        rating: 5,
                    },
                    {
                        id: '5',
                        title: '이펙티브 자바',
                        author: '조슈아 블로크',
                        coverColor: 'from-orange-500 to-orange-700',
                        readDate: '2024-12-10',
                        rating: 5,
                    },
                    {
                        id: '6',
                        title: '함수형 사고',
                        author: '닐 포드',
                        coverColor: 'from-teal-500 to-teal-700',
                        readDate: '2024-11-25',
                        rating: 4,
                    },
                    {
                        id: '7',
                        title: 'DDD Start!',
                        author: '최범균',
                        coverColor: 'from-indigo-500 to-indigo-700',
                        readDate: '2024-11-01',
                        rating: 5,
                    },
                    {
                        id: '8',
                        title: '테스트 주도 개발',
                        author: '켄트 벡',
                        coverColor: 'from-green-500 to-green-700',
                        readDate: '2024-10-15',
                        rating: 4,
                    },
                ]);
            } catch (error) {
                showToast('데이터를 불러오는데 실패했습니다.', 'error');
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [workspaceId]);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    if (!workspaceId) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent" />
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent" />
            </div>
        );
    }

    return (
        <div className="px-6 py-8">
            <div className="space-y-8">
                {/* Next Meeting and Bookshelf Row */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Next Meeting Section - Square */}
                    {nextMeeting && (
                        <section className="lg:col-span-1">
                            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-card p-6 text-white aspect-square flex flex-col justify-between">
                                <div>
                                    <div className="flex items-center gap-2 mb-3">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <h2 className="text-xl font-bold">다음 모임</h2>
                                    </div>
                                    <div className="bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-lg inline-block mb-4">
                                        <p className="text-sm font-medium">
                                            {formatDate(nextMeeting.date)}
                                        </p>
                                    </div>

                                    <div className="space-y-3 mb-4">
                                        <div className="flex items-center gap-2">
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <p className="text-sm">{nextMeeting.time}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            <p className="text-sm">{nextMeeting.location}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                            </svg>
                                            <p className="text-sm font-semibold">{nextMeeting.book}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                            <p className="text-sm">{nextMeeting.chapter}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>
                    )}

                    {/* Bookshelf Section */}
                    <section className="lg:col-span-2">
                        {/* Bookshelf Design */}
                        <div className="bg-gradient-to-b from-amber-100 to-amber-50 rounded-2xl p-6 shadow-card border-2 border-amber-200 flex flex-col h-full">
                            {/* Header inside card */}
                            <div className="mb-4">
                                <h2 className="text-xl font-bold text-gray-900">우리의 책장</h2>
                            </div>

                            {/* Books on Shelf */}
                            <div className="flex items-end justify-start gap-2 mb-4 pb-4 border-b-4 border-amber-800 relative overflow-x-auto">
                                {recentBooks.map((book) => (
                                    <div
                                        key={book.id}
                                        className="group relative cursor-pointer transition-all duration-300 hover:-translate-y-3 flex-shrink-0"
                                        style={{
                                            height: '180px',
                                            width: '60px',
                                        }}
                                    >
                                        {/* Book Spine */}
                                        <div
                                            className={`h-full w-full bg-gradient-to-br ${book.coverColor} rounded-t-sm shadow-card relative overflow-hidden`}
                                        >
                                            {/* Book Title (Vertical) */}
                                            <div className="absolute inset-0 flex items-center justify-center p-2">
                                                <p className="text-white font-bold text-xs writing-mode-vertical line-clamp-3 text-center">
                                                    {book.title}
                                                </p>
                                            </div>

                                            {/* Decorative Lines */}
                                            <div className="absolute top-2 left-0 right-0 h-px bg-white/30" />
                                            <div className="absolute bottom-2 left-0 right-0 h-px bg-white/30" />

                                            {/* Author Name (Bottom) */}
                                            <div className="absolute bottom-4 left-0 right-0">
                                                <p className="text-white/80 text-[8px] text-center font-medium px-1 truncate">
                                                    {book.author}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Hover Tooltip */}
                                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                                            <div className="bg-gray-900 text-white text-xs rounded-lg py-2 px-3 whitespace-nowrap shadow-xl">
                                                <p className="font-semibold mb-1">{book.title}</p>
                                                <p className="text-gray-300 text-[10px] mb-1">{book.author}</p>
                                                <div className="flex items-center gap-1">
                                                    {[...Array(5)].map((_, i) => (
                                                        <svg
                                                            key={i}
                                                            className={`w-3 h-3 ${i < book.rating ? 'text-yellow-400' : 'text-gray-600'
                                                                }`}
                                                            fill="currentColor"
                                                            viewBox="0 0 20 20"
                                                        >
                                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                        </svg>
                                                    ))}
                                                </div>
                                                <p className="text-gray-400 text-[10px] mt-1">{formatDate(book.readDate)}</p>
                                                {/* Tooltip Arrow */}
                                                <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-px">
                                                    <div className="border-4 border-transparent border-t-gray-900" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Shelf Stats */}
                            <div className="flex items-center justify-between text-sm text-amber-800">
                                <div className="flex items-center gap-2">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                    </svg>
                                    <span className="font-semibold">총 {recentBooks.length}권의 책을 함께 읽었습니다</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <span className="text-yellow-600">★</span>
                                    <span className="font-medium">
                                        평균 {(recentBooks.reduce((acc, book) => acc + book.rating, 0) / recentBooks.length).toFixed(1)}점
                                    </span>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Recent Records Section */}
                <section>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">최근 독서 기록</h2>
                        <Link href={`/workspace/${workspaceId}/meetings`}>
                            <Button variant="text" className="flex items-center gap-1">
                                전체 보기
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </Button>
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        {recentRecords.map((record) => (
                            <div
                                key={record.id}
                                className="bg-white rounded-xl shadow-card border border-gray-200 p-6 hover:shadow-card transition-shadow"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-emerald-100 px-3 py-1 rounded-lg">
                                            <span className="text-emerald-700 font-semibold text-sm">
                                                {record.session}회차
                                            </span>
                                        </div>
                                        <h3 className="text-lg font-semibold text-gray-900">{record.book}</h3>
                                    </div>
                                </div>
                                <p className="text-gray-600 mb-4">{record.summary}</p>
                                <div className="flex items-center gap-4 text-sm text-gray-500">
                                    <div className="flex items-center gap-1">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                        </svg>
                                        <span>{record.participants}명 참여</span>
                                    </div>
                                    <Link
                                        href={`/workspace/${workspaceId}/records/${record.id}`}
                                        className="text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1"
                                    >
                                        자세히 보기
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>

            <style jsx>{`
                .writing-mode-vertical {
                    writing-mode: vertical-rl;
                }
            `}</style>
        </div>
    );
}
