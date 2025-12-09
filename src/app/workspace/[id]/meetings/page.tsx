'use client';

import React, { useState, useEffect, useRef } from 'react';

import apiClient from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { useRouter } from 'next/navigation';

interface Book {
    id: string;
    title: string;
    createdAt: string;
}

interface Member {
    id: string;
    name: string;
    email: string;
}

interface Meeting {
    id: string;
    title: string;
    meetingDate: string;
    bookTitle: string | null;
    attendeeCount: number;
    createdAt: string;
}

export default function MeetingsPage({ params }: { params: Promise<{ id: string }> }) {
    const [workspaceId, setWorkspaceId] = useState<string>('');
    const [meetings, setMeetings] = useState<Meeting[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);

    // Search & Filter State
    const [searchTitle, setSearchTitle] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newMeetingTitle, setNewMeetingTitle] = useState('');
    const [newMeetingDate, setNewMeetingDate] = useState('');
    const [newMeetingBookId, setNewMeetingBookId] = useState('');
    const [newMeetingBookTitle, setNewMeetingBookTitle] = useState(''); // Display only
    const [newMeetingParticipants, setNewMeetingParticipants] = useState<Member[]>([]);
    const { showToast } = useToast();
    const router = useRouter();

    // Member Search State
    const [memberSearchQuery, setMemberSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<Member[]>([]);
    const [isSearchingMembers, setIsSearchingMembers] = useState(false);

    // Books from API
    const [availableBooks, setAvailableBooks] = useState<Book[]>([]);
    const [isAddingNewBook, setIsAddingNewBook] = useState(false);
    const [newBookInput, setNewBookInput] = useState('');
    const [showBookDropdown, setShowBookDropdown] = useState(false);
    const bookDropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        params.then((resolvedParams) => {
            setWorkspaceId(resolvedParams.id);
        });
    }, [params]);

    useEffect(() => {
        if (workspaceId) {
            loadMeetings(currentPage);
            loadBooks();
        }
    }, [workspaceId, currentPage]);

    // Close book dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (bookDropdownRef.current && !bookDropdownRef.current.contains(event.target as Node)) {
                setShowBookDropdown(false);
                setIsAddingNewBook(false);
                setNewBookInput('');
            }
        };

        if (showBookDropdown) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showBookDropdown]);

    // Debounce filter changes
    useEffect(() => {
        if (!workspaceId) return;

        const timer = setTimeout(() => {
            if (currentPage === 1) {
                loadMeetings(1);
            } else {
                setCurrentPage(1);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [searchTitle, startDate, endDate, workspaceId]);

    const loadMeetings = async (page: number) => {
        setIsLoading(true);
        try {
            // API call - note: using query param for page
            const response = await apiClient.post(`/meetings?page=${page}`, {
                workspaceId,
                keyword: searchTitle || undefined,
                startDate: startDate || undefined,
                endDate: endDate || undefined
            });
            if (response.data.success) {
                setMeetings(response.data.data);
                const meta = response.data.meta;
                setTotalPages(meta.totalPage);
                setTotalCount(meta.totalCount);
            } else {
                setMeetings([]);
                // Only show error if it's not a 404 (which might mean no results)
                // But typically API returns empty list for no results.
                // Keeping original error handling but suppressed for empty searches if needed
                // showToast('미팅 목록을 불러오지 못했습니다.', 'error');
            }
        } catch (error) {
            console.error('Failed to load meetings:', error);
            showToast('미팅 목록을 불러오는 중 오류가 발생했습니다.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const loadBooks = async () => {
        try {
            const response = await apiClient.post('/books', { workspaceId });
            if (response.data.success) {
                setAvailableBooks(response.data.data);
            }
        } catch (error) {
            console.error('Failed to load books:', error);
            showToast('책 목록을 불러오는 중 오류가 발생했습니다.', 'error');
        }
    };

    const resetFilters = () => {
        setSearchTitle('');
        setStartDate('');
        setEndDate('');
        showToast('필터가 초기화되었습니다.', 'success');
    };

    const handleCreateMeeting = async () => {
        if (!newMeetingTitle.trim()) {
            showToast('문서 제목을 입력해주세요.', 'error');
            return;
        }
        if (!newMeetingDate) {
            showToast('진행 일자를 선택해주세요.', 'error');
            return;
        }
        if (!newMeetingBookId) {
            showToast('책을 선택해주세요.', 'error');
            return;
        }
        if (newMeetingParticipants.length === 0) {
            showToast('최소 1명의 참가자를 선택해주세요.', 'error');
            return;
        }

        try {
            const response = await apiClient.post('/meetings/create', {
                workspaceId,
                title: newMeetingTitle,
                meetingDate: newMeetingDate,
                bookId: newMeetingBookId,
                attendees: newMeetingParticipants.map(p => p.id)
            });

            if (response.data.success) {
                showToast('미팅 문서가 생성되었습니다.', 'success');
                setIsCreateModalOpen(false);
                // Reset form
                setNewMeetingTitle('');
                setNewMeetingDate('');
                setNewMeetingBookId('');
                setNewMeetingBookTitle('');
                setNewMeetingParticipants([]);

                // Navigate to the new meeting
                router.push(`/workspace/${workspaceId}/meetings/${response.data.data.id}`);
            } else {
                showToast(response.data.message || '미팅 생성에 실패했습니다.', 'error');
            }
        } catch (error) {
            console.error('Failed to create meeting:', error);
            showToast('미팅 생성 중 오류가 발생했습니다.', 'error');
        }
    };

    // Member Search Debounce
    useEffect(() => {
        if (!memberSearchQuery.trim() || !workspaceId) {
            setSearchResults([]);
            return;
        }

        const timer = setTimeout(async () => {
            setIsSearchingMembers(true);
            try {
                const response = await apiClient.post('/members/search', {
                    workspaceId,
                    keyword: memberSearchQuery
                });
                if (response.data.success) {
                    setSearchResults(response.data.data);
                }
            } catch (error) {
                console.error('Failed to search members:', error);
            } finally {
                setIsSearchingMembers(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [memberSearchQuery, workspaceId]);

    const addParticipant = (member: Member) => {
        if (!newMeetingParticipants.some(p => p.id === member.id)) {
            setNewMeetingParticipants([...newMeetingParticipants, member]);
        }
        setMemberSearchQuery(''); // Clear search after selection
        setSearchResults([]);
    };

    const removeParticipant = (memberId: string) => {
        setNewMeetingParticipants(newMeetingParticipants.filter(p => p.id !== memberId));
    };

    const handleAddNewBook = async () => {
        if (!newBookInput.trim()) {
            showToast('책 제목을 입력해주세요.', 'error');
            return;
        }

        try {
            const response = await apiClient.post('/books/create', {
                workspaceId,
                title: newBookInput.trim()
            });

            if (response.data.success) {
                const newBook = response.data.data;
                setAvailableBooks([...availableBooks, newBook]);
                setNewMeetingBookId(newBook.id);
                setNewMeetingBookTitle(newBook.title);
                setNewBookInput('');
                setIsAddingNewBook(false);
                setShowBookDropdown(false);
                showToast('새 책이 추가되었습니다.', 'success');
            } else {
                showToast(response.data.message || '책 등록에 실패했습니다.', 'error');
            }
        } catch (error) {
            console.error('Failed to create book:', error);
            showToast('책 등록 중 오류가 발생했습니다.', 'error');
        }
    };

    const handleRowClick = (meetingId: string) => {
        router.push(`/workspace/${workspaceId}/meetings/${meetingId}`);
    };

    if (!workspaceId) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent" />
            </div>
        );
    }

    return (
        <div className="p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8 flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">독서 모임</h1>
                        <p className="text-gray-600">진행된 미팅 문서를 확인하고 관리하세요.</p>
                    </div>
                    <Button onClick={() => setIsCreateModalOpen(true)} className="flex-shrink-0 whitespace-nowrap">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        새 문서 생성
                    </Button>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
                    <div className="flex flex-wrap items-end gap-3">
                        {/* 제목 검색 */}
                        <div className="flex-1 min-w-[200px]">
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                문서 제목
                            </label>
                            <input
                                type="text"
                                placeholder="제목 검색"
                                value={searchTitle}
                                onChange={(e) => setSearchTitle(e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                        </div>

                        {/* 기간 필터 */}
                        <div className="flex-1 min-w-[300px]">
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                기간
                            </label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                                />
                                <span className="text-gray-500">~</span>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                                />
                            </div>
                        </div>

                        {/* 필터 초기화 버튼 */}
                        <div>
                            <button
                                onClick={resetFilters}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                            >
                                초기화
                            </button>
                        </div>
                    </div>
                </div>

                {/* Meetings Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    {/* Results Summary */}
                    <div className="px-6 py-4 border-b border-gray-200 text-sm text-gray-600">
                        총 <span className="font-semibold text-gray-900">{totalCount}</span>개의 문서
                    </div>

                    {isLoading ? (
                        <div className="p-12 text-center text-gray-500">
                            로딩 중...
                        </div>
                    ) : meetings.length === 0 ? (
                        <div className="p-12 text-center text-gray-500">
                            등록된 미팅이 없습니다.
                        </div>
                    ) : (
                        <>
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        {/* <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">회차</th> */}
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">문서 제목</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">진행 일자</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">참가자 수</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {meetings.map((meeting, index) => (
                                        <tr
                                            key={meeting.id}
                                            onClick={() => handleRowClick(meeting.id)}
                                            className="hover:bg-gray-50 transition-colors cursor-pointer"
                                        >
                                            {/* <td className="px-6 py-4">
                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-emerald-100 text-emerald-700">
                                                    {meeting.sessionNumber}회차
                                                </span>
                                            </td> */}
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-gray-900">{meeting.title}</div>
                                                <div className="text-sm text-gray-500">{meeting.bookTitle || '책 미정'}</div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-600">
                                                {new Date(meeting.meetingDate).toLocaleDateString('ko-KR', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm text-gray-700">{meeting.attendeeCount}명</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {/* Pagination */}
                            {/* Pagination */}
                            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-center gap-2">
                                <button
                                    onClick={() => setCurrentPage(1)}
                                    disabled={currentPage === 1}
                                    className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                                    </svg>
                                </button>
                                <button
                                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                    disabled={currentPage === 1}
                                    className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                </button>
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                    <button
                                        key={page}
                                        onClick={() => setCurrentPage(page)}
                                        className={`px-3 py-1 rounded cursor-pointer ${currentPage === page
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
                                    className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                                <button
                                    onClick={() => setCurrentPage(totalPages)}
                                    disabled={currentPage === totalPages}
                                    className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                                    </svg>
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>


            {/* Create Meeting Modal */}
            <Modal
                isOpen={isCreateModalOpen}
                onClose={() => {
                    setIsCreateModalOpen(false);
                    setNewMeetingTitle('');
                    setNewMeetingDate('');
                    setNewMeetingBookId('');
                    setNewMeetingBookTitle('');
                    setNewMeetingParticipants([]);
                    setIsAddingNewBook(false);
                    setNewBookInput('');
                }}
                title="새 문서 생성"
            >
                <div className="space-y-5">
                    {/* Title Input */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            문서 제목 <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            placeholder="사피엔스 1부 토론"
                            value={newMeetingTitle}
                            onChange={(e) => setNewMeetingTitle(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                    </div>

                    {/* Date Input */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            진행 일자 <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="date"
                            value={newMeetingDate}
                            onChange={(e) => setNewMeetingDate(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                        />
                    </div>

                    {/* Book Selection - Badge Style */}
                    <div className="relative" ref={bookDropdownRef}>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            책 제목 <span className="text-red-500">*</span>
                        </label>

                        {/* Selected Book Badge */}
                        {newMeetingBookId && (
                            <div className="mb-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-pink-100 text-pink-700 rounded-md text-sm font-medium">
                                {newMeetingBookTitle}
                                <button
                                    onClick={() => {
                                        setNewMeetingBookId('');
                                        setNewMeetingBookTitle('');
                                    }}
                                    className="hover:bg-pink-200 rounded-full p-0.5 cursor-pointer"
                                >
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        )}

                        {/* Book Input Field */}
                        {!newMeetingBookId && (
                            <div>
                                <input
                                    type="text"
                                    placeholder="책 제목을 선택하거나 입력하세요"
                                    value={newBookInput}
                                    onChange={(e) => setNewBookInput(e.target.value)}
                                    onFocus={() => setShowBookDropdown(true)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                />

                                {/* Dropdown */}
                                {showBookDropdown && (
                                    <div className="absolute left-0 right-0 mt-2 p-3 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
                                        <p className="text-sm text-gray-600 mb-3">Select an option or create one</p>

                                        {/* Existing Books List */}
                                        {availableBooks.length > 0 && (
                                            <div className="space-y-2 mb-3">
                                                {availableBooks.map((book) => (
                                                    <button
                                                        key={book.id}
                                                        onClick={() => {
                                                            setNewMeetingBookId(book.id);
                                                            setNewMeetingBookTitle(book.title);
                                                            setShowBookDropdown(false);
                                                            setNewBookInput('');
                                                        }}
                                                        className="w-full flex items-center gap-3 p-2.5 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer text-left group"
                                                    >
                                                        <div className="flex items-center gap-2 text-gray-400">
                                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                                            </svg>
                                                        </div>
                                                        <span className="text-sm text-gray-700 group-hover:text-gray-900">{book.title}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        )}

                                        {/* Add New Book */}
                                        {isAddingNewBook ? (
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    placeholder="새 책 제목 입력"
                                                    value={newBookInput}
                                                    onChange={(e) => setNewBookInput(e.target.value)}
                                                    onKeyPress={(e) => {
                                                        if (e.key === 'Enter') {
                                                            handleAddNewBook();
                                                        }
                                                    }}
                                                    className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                                    autoFocus
                                                />
                                                <button
                                                    onClick={handleAddNewBook}
                                                    className="px-3 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 cursor-pointer"
                                                >
                                                    추가
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setIsAddingNewBook(false);
                                                        setNewBookInput('');
                                                    }}
                                                    className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer"
                                                >
                                                    취소
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => setIsAddingNewBook(true)}
                                                className="w-full flex items-center gap-2 p-2.5 bg-white border border-dashed border-gray-300 rounded-lg hover:border-emerald-500 hover:bg-emerald-50 transition-colors cursor-pointer text-left"
                                            >
                                                <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                                </svg>
                                                <span className="text-sm text-emerald-600 font-medium">새 책 추가</span>
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Participants Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            참가자 <span className="text-red-500">*</span>
                        </label>

                        {/* Selected Participants Tags */}
                        <div className="flex flex-wrap gap-2 mb-3">
                            {newMeetingParticipants.map((member) => (
                                <span
                                    key={member.id}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-emerald-100 text-emerald-800"
                                >
                                    {member.name}
                                    <button
                                        onClick={() => removeParticipant(member.id)}
                                        className="hover:bg-emerald-200 rounded-full p-0.5 cursor-pointer"
                                    >
                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </span>
                            ))}
                        </div>

                        {/* Search Input */}
                        <div className="relative">
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                                <input
                                    type="text"
                                    value={memberSearchQuery}
                                    onChange={(e) => setMemberSearchQuery(e.target.value)}
                                    placeholder="이름으로 멤버 검색..."
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                />
                                {isSearchingMembers && (
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                        <div className="animate-spin h-4 w-4 border-2 border-emerald-500 border-t-transparent rounded-full"></div>
                                    </div>
                                )}
                            </div>

                            {/* Search Results Dropdown */}
                            {memberSearchQuery && searchResults.length > 0 && (
                                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                    {searchResults.map((member) => {
                                        const isSelected = newMeetingParticipants.some(p => p.id === member.id);
                                        return (
                                            <button
                                                key={member.id}
                                                onClick={() => !isSelected && addParticipant(member)}
                                                disabled={isSelected}
                                                className={`w-full flex items-center justify-between px-4 py-2 text-left hover:bg-gray-50 transition-colors ${isSelected ? 'opacity-50 cursor-not-allowed bg-gray-50' : 'cursor-pointer'
                                                    }`}
                                            >
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">{member.name}</div>
                                                    <div className="text-xs text-gray-500">{member.email}</div>
                                                </div>
                                                {isSelected && (
                                                    <span className="text-xs text-emerald-600 font-medium">선택됨</span>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}

                            {memberSearchQuery && !isSearchingMembers && searchResults.length === 0 && (
                                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-4 text-center text-sm text-gray-500">
                                    검색 결과가 없습니다.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4">
                        <button
                            onClick={() => {
                                setIsCreateModalOpen(false);
                                setNewMeetingTitle('');
                                setNewMeetingDate('');
                                setNewMeetingBookId('');
                                setNewMeetingBookTitle('');
                                setNewMeetingParticipants([]);
                                setIsAddingNewBook(false);
                                setNewBookInput('');
                            }}
                            className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                        >
                            취소
                        </button>
                        <button
                            onClick={handleCreateMeeting}
                            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors cursor-pointer"
                        >
                            생성
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
