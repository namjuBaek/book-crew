'use client';

import React, { useState, useEffect } from 'react';
import apiClient from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import Link from 'next/link';
import { Modal } from '@/components/ui/Modal';

interface NextMeeting {
    id: string;
    title: string;
    meetingDate: string;
    bookTitle: string | null;
    attendeeCount: number;
}

interface LatestMeeting {
    id: string;
    title: string;
    meetingDate: string;
    bookTitle: string | null;
    attendeeCount: number;
}

interface Book {
    id: string;
    title: string;
    author: string;
    description: string;
    color: string;
    createdAt: string;
}

const BOOK_COVERS = [
    'from-blue-500 to-blue-700',
    'from-red-500 to-red-700',
    'from-purple-500 to-purple-700',
    'from-emerald-500 to-emerald-700',
    'from-orange-500 to-orange-700',
    'from-teal-500 to-teal-700',
    'from-indigo-500 to-indigo-700',
    'from-green-500 to-green-700',
    'from-pink-500 to-pink-700',
    'from-cyan-500 to-cyan-700',
    'from-rose-500 to-rose-700',
    'from-amber-500 to-amber-700',
    'from-violet-500 to-violet-700',
    'from-fuchsia-500 to-fuchsia-700',
    'from-sky-500 to-sky-700',
];

export default function WorkspaceHomePage({ params }: { params: Promise<{ id: string }> }) {
    const [workspaceId, setWorkspaceId] = useState<string>('');
    const [isBookshelfModalOpen, setIsBookshelfModalOpen] = useState(false);
    const [nextMeeting, setNextMeeting] = useState<NextMeeting | null>(null);
    const [latestMeetings, setLatestMeetings] = useState<LatestMeeting[]>([]);
    const [recentBooks, setRecentBooks] = useState<Book[]>([]);
    const [allBooks, setAllBooks] = useState<Book[]>([]); // For modal
    const [isLoading, setIsLoading] = useState(true);
    const { showToast } = useToast();

    const getBookColor = (id: string, title: string) => {
        const uniqueString = id + title;
        let hash = 0;
        for (let i = 0; i < uniqueString.length; i++) {
            hash = uniqueString.charCodeAt(i) + ((hash << 5) - hash);
        }
        const index = Math.abs(hash) % BOOK_COVERS.length;
        return BOOK_COVERS[index];
    };

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
                // 1. Fetch Next Meeting
                try {
                    const nextResponse = await apiClient.post('/meetings/next', { workspaceId });
                    if (nextResponse.data.success) {
                        setNextMeeting(nextResponse.data.data);
                    } else {
                        setNextMeeting(null);
                    }
                } catch (err: any) {
                    if (err.response?.status !== 404) {
                        console.error("Failed to fetch next meeting", err);
                    }
                    setNextMeeting(null);
                }

                // 2. Fetch Latest Meetings
                try {
                    const latestResponse = await apiClient.post('/meetings/latest', { workspaceId });
                    if (latestResponse.data.success) {
                        setLatestMeetings(latestResponse.data.data);
                    }
                } catch (err) {
                    console.error("Failed to fetch latest meetings", err);
                }

                // 3. Fetch Recent Books (Limit 15)
                try {
                    const booksResponse = await apiClient.post('/books', { workspaceId, limit: 15 });
                    if (booksResponse.data.success) {
                        setRecentBooks(booksResponse.data.data);
                    }
                } catch (err) {
                    console.error("Failed to fetch recent books", err);
                }

            } catch (error) {
                showToast('데이터를 불러오는데 실패했습니다.', 'error');
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [workspaceId, showToast]);

    const handleOpenBookshelf = async () => {
        try {
            const response = await apiClient.post('/books', { workspaceId });
            if (response.data.success) {
                setAllBooks(response.data.data);
            }
        } catch (error) {
            console.error("Failed to fetch all books", error);
            showToast('전체 책 목록을 불러오는데 실패했습니다.', 'error');
        }
        setIsBookshelfModalOpen(true);
    };

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
                    <section className="lg:col-span-1">
                        {nextMeeting ? (
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
                                            {formatDate(nextMeeting.meetingDate)}
                                        </p>
                                    </div>

                                    <div className="space-y-3 mb-4">
                                        <h3 className="text-lg font-semibold mb-2">{nextMeeting.title}</h3>
                                        <div className="flex items-center gap-2">
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                            </svg>
                                            <p className="text-base font-semibold">{nextMeeting.bookTitle || '지정된 책 없음'}</p>
                                        </div>
                                    </div>
                                </div>

                                <Link
                                    href={`/workspace/${workspaceId}/meetings/${nextMeeting.id}`}
                                    className="w-full"
                                >
                                    <button className="w-full bg-white text-emerald-600 font-bold py-3 px-4 rounded-xl hover:bg-emerald-50 transition-colors flex items-center justify-center gap-2">
                                        <span>문서 바로가기</span>
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                        </svg>
                                    </button>
                                </Link>
                            </div>
                        ) : (
                            <div className="bg-white border-2 border-dashed border-gray-200 rounded-2xl p-6 text-gray-500 aspect-square flex flex-col items-center justify-center text-center">
                                <div className="bg-gray-50 p-4 rounded-full mb-4">
                                    <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">예정된 모임이 없습니다</h3>
                                <p className="text-sm text-gray-500 mb-6">새로운 독서 모임 일정을 계획해보세요!</p>
                                <Link href={`/workspace/${workspaceId}/meetings`}>
                                    <Button variant="primary">
                                        모임 만들기
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </section>

                    {/* Bookshelf Section */}
                    <section className="lg:col-span-2">
                        {/* Bookshelf Design */}
                        <div className="bg-gradient-to-b from-amber-100 to-amber-50 rounded-2xl p-6 shadow-card border-2 border-amber-200 flex flex-col h-full">
                            {/* Header inside card */}
                            <div className="mb-4 flex items-center justify-between">
                                <h2 className="text-xl font-bold text-gray-900">우리의 책장</h2>
                                <Button
                                    variant="text"
                                    className="text-amber-900 hover:text-amber-700 hover:bg-amber-200/50"
                                    onClick={handleOpenBookshelf}
                                >
                                    전체 보기
                                </Button>
                            </div>

                            {/* Books on Shelf */}
                            <div className="flex items-end justify-start gap-2 mb-4 pb-4 border-b-4 border-amber-800 relative overflow-x-auto min-h-[200px]">
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
                                            className={`h-full w-full bg-gradient-to-br ${getBookColor(book.id, book.title)} rounded-t-sm shadow-card relative overflow-hidden`}
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
                                        </div>

                                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                                            <div className="bg-gray-900 text-white text-xs rounded-lg py-2 px-3 whitespace-nowrap shadow-xl">
                                                <p className="font-semibold mb-1">{book.title}</p>
                                                <p className="text-gray-400 text-[10px] mt-1">{formatDate(book.createdAt)}</p>
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

                    {/* Latest Meetings List */}
                    {latestMeetings.length > 0 ? (
                        <div className="grid grid-cols-1 gap-4">
                            {latestMeetings.map((meeting) => (
                                <div
                                    key={meeting.id}
                                    className="bg-white rounded-xl shadow-card border border-gray-200 p-6 hover:shadow-card transition-shadow"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-emerald-100 px-3 py-1 rounded-lg">
                                                <span className="text-emerald-700 font-semibold text-sm">
                                                    {formatDate(meeting.meetingDate)}
                                                </span>
                                            </div>
                                            <h3 className="text-lg font-semibold text-gray-900">{meeting.bookTitle || '지정된 책 없음'}</h3>
                                        </div>
                                    </div>
                                    <p className="text-gray-600 mb-4 font-medium">{meeting.title}</p>
                                    <div className="flex items-center gap-4 text-sm text-gray-500">
                                        <div className="flex items-center gap-1">
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                            </svg>
                                            <span>{meeting.attendeeCount}명 참여</span>
                                        </div>
                                        <Link
                                            href={`/workspace/${workspaceId}/meetings/${meeting.id}`}
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
                    ) : (
                        <div className="bg-gray-50 border border-gray-200 rounded-xl p-12 text-center text-gray-500">
                            <p>최근 진행된 모임이 없습니다.</p>
                        </div>
                    )}
                </section>
            </div>

            {/* Bookshelf Modal */}
            <Modal
                isOpen={isBookshelfModalOpen}
                onClose={() => setIsBookshelfModalOpen(false)}
                title="우리의 책장"
            >
                <div className="bg-amber-50 rounded-xl p-8 min-h-[400px]">
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-y-12 gap-x-6">
                        {allBooks.map((book) => (
                            <div key={book.id} className="flex flex-col items-center group cursor-pointer hover:-translate-y-2 transition-transform duration-300">
                                <div
                                    className="relative flex-shrink-0 mb-2"
                                    style={{
                                        height: '180px',
                                        width: '60px',
                                    }}
                                >
                                    {/* Book Spine */}
                                    <div
                                        className={`h-full w-full bg-gradient-to-br ${getBookColor(book.id, book.title)} rounded-sm shadow-lg relative overflow-hidden z-10`}
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
                                    </div>

                                    {/* Shelf Shadow */}
                                    <div className="absolute -bottom-4 left-[-10px] right-[-10px] h-2 bg-black/10 rounded-full blur-sm z-0"></div>
                                </div>

                                {/* Shelf Line under each item */}
                                <div className="w-[140%] h-4 bg-amber-800 rounded-sm shadow-md mt-1"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </Modal>

            <style jsx>{`
                .writing-mode-vertical {
                    writing-mode: vertical-rl;
                }
            `}</style>
        </div>
    );
}
