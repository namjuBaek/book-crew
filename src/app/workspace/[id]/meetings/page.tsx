'use client';

import React, { useState, useEffect, useRef } from 'react';

import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { useRouter } from 'next/navigation';

interface Meeting {
    id: string;
    sessionNumber: number;
    title: string;
    date: string;
    participants: string[];
    book: string;
}

export default function MeetingsPage({ params }: { params: Promise<{ id: string }> }) {
    const [workspaceId, setWorkspaceId] = useState<string>('');
    const [meetings, setMeetings] = useState<Meeting[]>([]);
    const [filteredMeetings, setFilteredMeetings] = useState<Meeting[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTitle, setSearchTitle] = useState('');
    const [selectedSession, setSelectedSession] = useState<string>('all');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newMeetingTitle, setNewMeetingTitle] = useState('');
    const [newMeetingDate, setNewMeetingDate] = useState('');
    const [newMeetingBook, setNewMeetingBook] = useState('');
    const [newMeetingParticipants, setNewMeetingParticipants] = useState<string[]>([]);
    const { showToast } = useToast();
    const router = useRouter();

    const itemsPerPage = 10;

    // Available participants (mock data)
    const availableParticipants = ['홍길동', '김철수', '이영희', '박민수', '최지영'];

    // Available books (extracted from existing meetings)
    const [availableBooks, setAvailableBooks] = useState<string[]>([]);
    const [isAddingNewBook, setIsAddingNewBook] = useState(false);
    const [newBookInput, setNewBookInput] = useState('');
    const [showBookDropdown, setShowBookDropdown] = useState(false);
    const bookDropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        params.then((resolvedParams) => {
            setWorkspaceId(resolvedParams.id);
            loadMeetings();
        });
    }, [params]);

    useEffect(() => {
        // Extract unique book titles from meetings
        const uniqueBooks = Array.from(new Set(meetings.map(m => m.book)));
        setAvailableBooks(uniqueBooks);
    }, [meetings]);

    useEffect(() => {
        applyFilters();
    }, [meetings, searchTitle, selectedSession, startDate, endDate]);

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

    const loadMeetings = () => {
        // Mock data
        const mockMeetings: Meeting[] = [
            { id: '1', sessionNumber: 1, title: '사피엔스 1부 토론', date: '2024-01-15', participants: ['홍길동', '김철수', '이영희'], book: '사피엔스' },
            { id: '2', sessionNumber: 2, title: '사피엔스 2부 토론', date: '2024-01-22', participants: ['홍길동', '김철수', '이영희', '박민수'], book: '사피엔스' },
            { id: '3', sessionNumber: 3, title: '사피엔스 3부 토론', date: '2024-01-29', participants: ['홍길동', '김철수', '이영희'], book: '사피엔스' },
            { id: '4', sessionNumber: 4, title: '사피엔스 4부 토론 및 마무리', date: '2024-02-05', participants: ['홍길동', '김철수', '이영희', '박민수', '최지영'], book: '사피엔스' },
            { id: '5', sessionNumber: 5, title: '총, 균, 쇠 1부 토론', date: '2024-02-12', participants: ['홍길동', '김철수', '이영희'], book: '총, 균, 쇠' },
            { id: '6', sessionNumber: 6, title: '총, 균, 쇠 2부 토론', date: '2024-02-19', participants: ['홍길동', '김철수', '이영희', '박민수'], book: '총, 균, 쇠' },
            { id: '7', sessionNumber: 7, title: '총, 균, 쇠 3부 토론', date: '2024-02-26', participants: ['홍길동', '김철수', '이영희'], book: '총, 균, 쇠' },
            { id: '8', sessionNumber: 8, title: '총, 균, 쇠 4부 토론 및 마무리', date: '2024-03-04', participants: ['홍길동', '김철수', '이영희', '박민수'], book: '총, 균, 쇠' },
            { id: '9', sessionNumber: 9, title: '코스모스 1부 토론', date: '2024-03-11', participants: ['홍길동', '김철수', '이영희', '최지영'], book: '코스모스' },
            { id: '10', sessionNumber: 10, title: '코스모스 2부 토론', date: '2024-03-18', participants: ['홍길동', '김철수', '이영희'], book: '코스모스' },
            { id: '11', sessionNumber: 11, title: '코스모스 3부 토론', date: '2024-03-25', participants: ['홍길동', '김철수', '이영희', '박민수'], book: '코스모스' },
            { id: '12', sessionNumber: 12, title: '코스모스 4부 토론 및 마무리', date: '2024-04-01', participants: ['홍길동', '김철수', '이영희', '박민수', '최지영'], book: '코스모스' },
        ];
        setMeetings(mockMeetings);
        setIsLoading(false);
    };

    const applyFilters = () => {
        let filtered = [...meetings];

        // 회차 필터
        if (selectedSession !== 'all') {
            filtered = filtered.filter(m => m.sessionNumber.toString() === selectedSession);
        }

        // 제목 검색 필터
        if (searchTitle) {
            filtered = filtered.filter(m =>
                m.title.toLowerCase().includes(searchTitle.toLowerCase())
            );
        }

        // 날짜 범위 필터
        if (startDate) {
            filtered = filtered.filter(m => m.date >= startDate);
        }
        if (endDate) {
            filtered = filtered.filter(m => m.date <= endDate);
        }

        setFilteredMeetings(filtered);
        setCurrentPage(1);
    };

    const resetFilters = () => {
        setSearchTitle('');
        setSelectedSession('all');
        setStartDate('');
        setEndDate('');
        showToast('필터가 초기화되었습니다.', 'success');
    };

    const handleCreateMeeting = () => {
        if (!newMeetingTitle.trim()) {
            showToast('문서 제목을 입력해주세요.', 'error');
            return;
        }
        if (!newMeetingDate) {
            showToast('진행 일자를 선택해주세요.', 'error');
            return;
        }
        if (!newMeetingBook.trim()) {
            showToast('책 제목을 입력해주세요.', 'error');
            return;
        }
        if (newMeetingParticipants.length === 0) {
            showToast('최소 1명의 참가자를 선택해주세요.', 'error');
            return;
        }

        const nextSessionNumber = meetings.length > 0
            ? Math.max(...meetings.map(m => m.sessionNumber)) + 1
            : 1;

        const newMeeting: Meeting = {
            id: Date.now().toString(),
            sessionNumber: nextSessionNumber,
            title: newMeetingTitle,
            date: newMeetingDate,
            participants: newMeetingParticipants,
            book: newMeetingBook,
        };

        setMeetings([...meetings, newMeeting]);
        setIsCreateModalOpen(false);
        setNewMeetingTitle('');
        setNewMeetingDate('');
        setNewMeetingBook('');
        setNewMeetingParticipants([]);
        showToast('새 문서가 생성되었습니다.', 'success');

        // Navigate to the new meeting detail page
        router.push(`/workspace/${workspaceId}/meetings/${newMeeting.id}`);
    };

    const toggleParticipant = (participant: string) => {
        if (newMeetingParticipants.includes(participant)) {
            setNewMeetingParticipants(newMeetingParticipants.filter(p => p !== participant));
        } else {
            setNewMeetingParticipants([...newMeetingParticipants, participant]);
        }
    };

    const handleAddNewBook = () => {
        if (!newBookInput.trim()) {
            showToast('책 제목을 입력해주세요.', 'error');
            return;
        }
        if (availableBooks.includes(newBookInput.trim())) {
            showToast('이미 등록된 책입니다.', 'error');
            return;
        }
        setNewMeetingBook(newBookInput.trim());
        setAvailableBooks([...availableBooks, newBookInput.trim()]);
        setNewBookInput('');
        setIsAddingNewBook(false);
        setShowBookDropdown(false);
        showToast('새 책이 추가되었습니다.', 'success');
    };

    const handleRowClick = (meetingId: string) => {
        router.push(`/workspace/${workspaceId}/meetings/${meetingId}`);
    };

    // 페이지네이션
    const totalPages = Math.ceil(filteredMeetings.length / itemsPerPage);
    const paginatedMeetings = filteredMeetings.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // 회차 목록 (중복 제거)
    const sessionNumbers = Array.from(new Set(meetings.map(m => m.sessionNumber))).sort((a, b) => a - b);

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
                        <p className="text-gray-600">회차별 진행 문서를 확인하고 관리하세요.</p>
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
                        {/* 회차 선택 */}
                        <div className="flex-1 min-w-[150px]">
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                회차
                            </label>
                            <select
                                value={selectedSession}
                                onChange={(e) => setSelectedSession(e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                            >
                                <option value="all">전체</option>
                                {sessionNumbers.map(num => (
                                    <option key={num} value={num.toString()}>
                                        {num}회차
                                    </option>
                                ))}
                            </select>
                        </div>

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

                        {/* 시작 날짜 */}
                        <div className="flex-1 min-w-[150px]">
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                시작 날짜
                            </label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                            />
                        </div>

                        {/* 종료 날짜 */}
                        <div className="flex-1 min-w-[150px]">
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                종료 날짜
                            </label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                            />
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

                {/* Results Summary */}
                <div className="mb-4 text-sm text-gray-600">
                    총 <span className="font-semibold text-gray-900">{filteredMeetings.length}</span>개의 문서
                </div>

                {/* Meetings Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    {isLoading ? (
                        <div className="p-12 text-center text-gray-500">
                            로딩 중...
                        </div>
                    ) : paginatedMeetings.length === 0 ? (
                        <div className="p-12 text-center text-gray-500">
                            검색 결과가 없습니다.
                        </div>
                    ) : (
                        <>
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">회차</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">문서 제목</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">진행 일자</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">참가자</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {paginatedMeetings.map((meeting) => (
                                        <tr
                                            key={meeting.id}
                                            onClick={() => handleRowClick(meeting.id)}
                                            className="hover:bg-gray-50 transition-colors cursor-pointer"
                                        >
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-emerald-100 text-emerald-700">
                                                    {meeting.sessionNumber}회차
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-gray-900">{meeting.title}</div>
                                                <div className="text-sm text-gray-500">{meeting.book}</div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-600">
                                                {new Date(meeting.date).toLocaleDateString('ko-KR', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="flex -space-x-2">
                                                        {meeting.participants.slice(0, 3).map((participant, idx) => (
                                                            <div
                                                                key={idx}
                                                                className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center"
                                                                title={participant}
                                                            >
                                                                <span className="text-xs font-medium text-gray-600">
                                                                    {participant.charAt(0)}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    {meeting.participants.length > 3 && (
                                                        <span className="text-sm text-gray-500">
                                                            +{meeting.participants.length - 3}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {/* Pagination */}
                            {totalPages > 1 && (
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
                            )}
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
                    setNewMeetingBook('');
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
                        {newMeetingBook && (
                            <div className="mb-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-pink-100 text-pink-700 rounded-md text-sm font-medium">
                                {newMeetingBook}
                                <button
                                    onClick={() => setNewMeetingBook('')}
                                    className="hover:bg-pink-200 rounded-full p-0.5 cursor-pointer"
                                >
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        )}

                        {/* Book Input Field */}
                        {!newMeetingBook && (
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
                                                        key={book}
                                                        onClick={() => {
                                                            setNewMeetingBook(book);
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
                                                        <span className="text-sm text-gray-700 group-hover:text-gray-900">{book}</span>
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
                        <div className="space-y-2 border border-gray-200 rounded-lg p-4">
                            {availableParticipants.map((participant) => (
                                <label
                                    key={participant}
                                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                                >
                                    <input
                                        type="checkbox"
                                        checked={newMeetingParticipants.includes(participant)}
                                        onChange={() => toggleParticipant(participant)}
                                        className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500 cursor-pointer"
                                    />
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                                            <span className="text-sm font-medium text-gray-600">
                                                {participant.charAt(0)}
                                            </span>
                                        </div>
                                        <span className="text-sm text-gray-900">{participant}</span>
                                    </div>
                                </label>
                            ))}
                        </div>
                        {newMeetingParticipants.length > 0 && (
                            <p className="mt-2 text-sm text-gray-600">
                                {newMeetingParticipants.length}명 선택됨
                            </p>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4">
                        <button
                            onClick={() => {
                                setIsCreateModalOpen(false);
                                setNewMeetingTitle('');
                                setNewMeetingDate('');
                                setNewMeetingBook('');
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
