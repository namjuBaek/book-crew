'use client';

import React, { useState, useEffect, useRef } from 'react';
import apiClient from '@/lib/api';
import { WorkspaceHeader } from '@/components/workspace/Header';
import { WorkspaceSidebar } from '@/components/workspace/Sidebar';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/Toast';

interface Member {
    id: string; // This is Member ID
    name: string;
    email?: string;
    role?: string;
    userId?: string;
}

interface Attendee {
    id: string; // Attendee ID (row id)
    memberId: string;
    name: string;
    role: string;
    userId: string;
    note: string | null;
}

interface Book {
    id: string;
    title: string;
    createdAt?: string;
}

interface ParticipantContent {
    memberId: string;
    memberName: string;
    content: string;
    attendeeId?: string; // To identify which attendee row to update if needed
    userId?: string; // Add userId for permission check
}

export default function MeetingDetailPage({
    params
}: {
    params: Promise<{ id: string; meetingId: string }>
}) {
    const router = useRouter();
    const { showToast } = useToast();

    // Params State
    const [workspaceId, setWorkspaceId] = useState<string>('');
    const [meetingId, setMeetingId] = useState<string>('');

    // Unwrap params
    useEffect(() => {
        params.then(resolved => {
            setWorkspaceId(resolved.id);
            setMeetingId(resolved.meetingId);
        });
    }, [params]);

    const [isLoading, setIsLoading] = useState(true);
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [title, setTitle] = useState('');
    const [isEditingInfo, setIsEditingInfo] = useState(false);
    const [books, setBooks] = useState<Book[]>([]);
    const [selectedBook, setSelectedBook] = useState<Book | null>(null);
    const [showBookSelector, setShowBookSelector] = useState(false);
    const [newBookTitle, setNewBookTitle] = useState('');
    const bookDropdownRef = useRef<HTMLDivElement>(null);
    const [meetingDate, setMeetingDate] = useState('');
    const [participants, setParticipants] = useState<Member[]>([]);
    const [participantContents, setParticipantContents] = useState<ParticipantContent[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [currentUser, setCurrentUser] = useState<{ userId: string; name: string } | null>(null);

    // Fetch Current User
    useEffect(() => {
        const fetchMe = async () => {
            try {
                const response = await apiClient.get('/users/me');
                if (response.data.success) {
                    setCurrentUser(response.data.data);
                }
            } catch (error) {
                console.error('Failed to fetch current user:', error);
            }
        };
        fetchMe();
    }, []);

    // Member Search State
    const [memberSearchQuery, setMemberSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<Member[]>([]);
    const [isSearchingMembers, setIsSearchingMembers] = useState(false);

    useEffect(() => {
        if (!meetingId || !workspaceId) return;
        loadMeetingDetail();
    }, [meetingId, workspaceId]);

    const loadMeetingDetail = async () => {
        setIsLoading(true);
        try {
            const response = await apiClient.post(`/meetings/detail?id=${meetingId}`, {
                workspaceId
            });

            if (response.data.success) {
                const data = response.data.data;
                setTitle(data.title);
                setMeetingDate(data.meetingDate);

                if (data.bookId) {
                    setSelectedBook({
                        id: data.bookId,
                        title: data.bookTitle || 'Unknown Book'
                    });
                }

                // Map attendees to participants and contents
                const loadedParticipants: Member[] = data.attendees.map((a: Attendee) => ({
                    id: a.memberId,
                    name: a.name,
                    role: a.role,
                    userId: a.userId
                }));
                setParticipants(loadedParticipants);

                const loadedContents: ParticipantContent[] = data.attendees.map((a: Attendee) => ({
                    memberId: a.memberId,
                    memberName: a.name,
                    content: a.note || '',
                    attendeeId: a.id,
                    userId: a.userId // Include userId
                }));
                setParticipantContents(loadedContents);
            } else {
                showToast('존재하지 않는 미팅이거나 접근 권한이 없습니다.', 'error');
                router.replace(`/workspace/${workspaceId}/meetings`);
            }
        } catch (error: any) {
            console.error('Failed to load meeting detail:', error);
            if (error.response?.status === 404) {
                showToast('존재하지 않는 미팅입니다.', 'error');
                router.replace(`/workspace/${workspaceId}/meetings`);
            } else {
                showToast('미팅 정보를 불러오는 중 오류가 발생했습니다.', 'error');
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Note: Removed the automatic participantContents creation useEffect because we strictly control it via loadMeetingDetail or adding users.
    // However, if we add NEW participants via UI, we need to add content entry.

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

    // Load books when selector opens
    useEffect(() => {
        if (showBookSelector && workspaceId) {
            loadBooks();
        }
    }, [showBookSelector, workspaceId]);

    const loadBooks = async () => {
        if (!workspaceId) return;
        try {
            const response = await apiClient.post('/books', { workspaceId });
            if (response.data.success) {
                setBooks(response.data.data);
            } else {
                showToast('책 목록을 불러오는데 실패했습니다.', 'error');
            }
        } catch (error) {
            console.error('Failed to load books:', error);
            showToast('책 목록을 불러오는 중 오류가 발생했습니다.', 'error');
        }
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (bookDropdownRef.current && !bookDropdownRef.current.contains(event.target as Node)) {
                setShowBookSelector(false);
            }
        };

        if (showBookSelector) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showBookSelector]);

    const handleCreateBook = async () => {
        if (!newBookTitle.trim() || !workspaceId) return;

        try {
            const response = await apiClient.post('/books/create', {
                workspaceId,
                title: newBookTitle
            });
            if (response.data.success) {
                const newBook = response.data.data;
                setBooks([newBook, ...books]);
                setSelectedBook(newBook);
                setNewBookTitle('');
                setShowBookSelector(false);
                showToast('책을 등록했습니다.', 'success');
            } else {
                showToast(response.data.message || '책 등록에 실패했습니다.', 'error');
            }
        } catch (error) {
            console.error('Failed to create book:', error);
            showToast('책 등록 중 오류가 발생했습니다.', 'error');
        }
    };

    const addParticipant = (member: Member) => {
        if (!participants.some(p => p.id === member.id)) {
            setParticipants([...participants, member]);
            // Add a new entry for participant content if it doesn't exist
            if (!participantContents.some(pc => pc.memberId === member.id)) {
                setParticipantContents(prev => [...prev, {
                    memberId: member.id,
                    memberName: member.name,
                    content: '',
                    userId: member.userId
                }]);
            }
        }
        setMemberSearchQuery('');
        setSearchResults([]);
    };

    const removeParticipant = (memberId: string) => {
        setParticipants(participants.filter(p => p.id !== memberId));
        setParticipantContents(participantContents.filter(pc => pc.memberId !== memberId));
    };

    const updateParticipantContent = (memberId: string, content: string) => {
        setParticipantContents(prev =>
            prev.map(pc =>
                pc.memberId === memberId
                    ? { ...pc, content }
                    : pc
            )
        );
    };

    const handleSaveInfo = async () => {
        if (!title.trim()) {
            showToast('제목을 입력해주세요.', 'error');
            return;
        }
        if (!selectedBook) {
            showToast('책을 선택해주세요.', 'error');
            return;
        }
        if (!meetingDate) {
            showToast('진행 일자를 선택해주세요.', 'error');
            return;
        }
        if (participants.length === 0) {
            showToast('최소 1명의 참석자를 선택해주세요.', 'error');
            return;
        }

        setIsSaving(true);
        try {
            // Update meeting info using PATCH /meetings/detail
            // Note: This might reset attendee notes as we are only sending IDs
            const response = await apiClient.patch('/meetings/detail', {
                workspaceId,
                meetingId,
                title,
                meetingDate,
                bookId: selectedBook.id,
                attendees: participants.map(p => p.id)
            });

            if (response.data.success) {
                showToast('미팅 정보가 수정되었습니다.', 'success');
                setIsEditingInfo(false);
                loadMeetingDetail(); // Reload to refresh data
            } else {
                showToast(response.data.message || '수정에 실패했습니다.', 'error');
            }
        } catch (error) {
            console.error('Failed to update meeting info:', error);
            showToast('수정 중 오류가 발생했습니다.', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveNote = async () => {
        if (!currentUser) {
            showToast('로그인이 필요합니다.', 'error');
            return;
        }

        const myContent = participantContents.find(pc => pc.userId === currentUser.userId);

        if (!myContent) {
            showToast('참석자 명단에서 본인 정보를 찾을 수 없습니다.', 'error');
            return;
        }

        if (!myContent.attendeeId) {
            showToast('참석자 정보가 저장되지 않았습니다. 먼저 미팅 정보를 저장해주세요.', 'error');
            return;
        }

        setIsSaving(true);
        try {
            const response = await apiClient.put('/meetings/detail/note', {
                workspaceId,
                meetingId,
                attendeeId: myContent.attendeeId,
                note: myContent.content
            });

            if (response.data.success) {
                showToast('노트가 저장되었습니다.', 'success');
            } else {
                showToast(response.data.message || '저장에 실패했습니다.', 'error');
            }
        } catch (error) {
            console.error('Failed to save note:', error);
            showToast('저장 중 오류가 발생했습니다.', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancelInfoEdit = () => {
        setIsEditingInfo(false);
        loadMeetingDetail(); // Revert changes
    };

    if (!workspaceId || isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <WorkspaceHeader workspaceName="독서모임 북클럽" workspaceId={workspaceId} />
            <div className="flex">
                <WorkspaceSidebar workspaceId={workspaceId} />
                <main className="flex-1 pt-[73px] p-8">
                    <div className="max-w-5xl mx-auto">
                        {/* Back Button */}
                        <button
                            onClick={() => router.push(`/workspace/${workspaceId}/meetings`)}
                            className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            <span className="font-medium">돌아가기</span>
                        </button>

                        {/* Document Container */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
                            {/* Header Section: Title + Edit Actions */}
                            <div className="mb-6 group relative flex items-start justify-between">
                                <div className="flex-1">
                                    {isEditingInfo ? (
                                        <input
                                            type="text"
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            placeholder="미팅 제목을 입력하세요"
                                            className="w-full text-4xl font-bold text-gray-900 border-b border-gray-300 focus:border-emerald-500 focus:outline-none placeholder-gray-300 pb-2"
                                            autoFocus
                                        />
                                    ) : (
                                        <h1 className="text-4xl font-bold text-gray-900 leading-tight min-h-[40px]">
                                            {title || '제목 없음'}
                                        </h1>
                                    )}
                                </div>

                                {/* Info Edit Buttons */}
                                <div className="ml-4 flex items-center gap-2">
                                    {isEditingInfo ? (
                                        <>
                                            <button
                                                onClick={handleSaveInfo}
                                                className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors"
                                            >
                                                저장
                                            </button>
                                            <button
                                                onClick={handleCancelInfoEdit}
                                                className="px-3 py-1.5 bg-white text-gray-600 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                                            >
                                                취소
                                            </button>
                                        </>
                                    ) : (
                                        <button
                                            onClick={() => setIsEditingInfo(true)}
                                            className="px-3 py-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5"
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                            </svg>
                                            정보 수정
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Properties Section - Notion Style */}
                            <div className="space-y-3 mb-12">
                                {/* Book Property */}
                                <div className="flex items-center gap-4 group relative z-20">
                                    <div className="flex items-center gap-2 text-gray-600 w-40 flex-shrink-0">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                        </svg>
                                        <span className="text-sm font-medium">읽을 책</span>
                                    </div>
                                    <div className="flex-1 relative" ref={bookDropdownRef}>
                                        {isEditingInfo ? (
                                            <>
                                                <div
                                                    onClick={() => setShowBookSelector(!showBookSelector)}
                                                    className="text-sm cursor-pointer hover:bg-gray-100 px-2 py-1 rounded text-gray-700 w-full flex items-center border border-gray-300"
                                                >
                                                    {selectedBook ? (
                                                        <span className="font-medium text-gray-900">{selectedBook.title}</span>
                                                    ) : (
                                                        <span className="text-gray-400">책을 선택해주세요</span>
                                                    )}
                                                </div>
                                                {/* Book Dropdown (Same as before) */}
                                                {showBookSelector && (
                                                    <div className="absolute left-0 top-full mt-1 w-72 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-y-auto z-50">
                                                        {books.length > 0 ? (
                                                            <div className="p-1">
                                                                {books.map((book) => (
                                                                    <div
                                                                        key={book.id}
                                                                        onClick={() => {
                                                                            setSelectedBook(book);
                                                                            setShowBookSelector(false);
                                                                        }}
                                                                        className="px-3 py-2 hover:bg-gray-50 rounded cursor-pointer text-sm text-gray-700"
                                                                    >
                                                                        {book.title}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <div className="p-4 text-center text-sm text-gray-500">
                                                                등록된 책이 없습니다.
                                                            </div>
                                                        )}
                                                        {/* Create New Book Section */}
                                                        <div className="border-t border-gray-100 p-3 bg-gray-50">
                                                            <div className="text-xs font-semibold text-gray-500 mb-2 px-1">새로운 책 등록하기</div>
                                                            <div className="flex gap-2">
                                                                <input
                                                                    type="text"
                                                                    value={newBookTitle}
                                                                    onChange={(e) => setNewBookTitle(e.target.value)}
                                                                    placeholder="책 제목 입력"
                                                                    className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:border-emerald-500"
                                                                    onKeyDown={(e) => {
                                                                        if (e.key === 'Enter') handleCreateBook();
                                                                    }}
                                                                />
                                                                <button
                                                                    onClick={handleCreateBook}
                                                                    disabled={!newBookTitle.trim()}
                                                                    className="px-3 py-1.5 text-sm bg-emerald-600 text-white rounded hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                                                                >
                                                                    등록
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </>
                                        ) : (
                                            <div className="text-sm px-2 py-1 rounded text-gray-900 w-full flex items-center">
                                                {selectedBook ? selectedBook.title : '-'}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Meeting Date Property */}
                                <div className="flex items-center gap-4 group">
                                    <div className="flex items-center gap-2 text-gray-600 w-40 flex-shrink-0">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <span className="text-sm font-medium">진행 일자</span>
                                    </div>
                                    <div className="flex-1">
                                        {isEditingInfo ? (
                                            <input
                                                type="date"
                                                value={meetingDate}
                                                onChange={(e) => setMeetingDate(e.target.value)}
                                                className="text-sm text-gray-900 border border-gray-300 focus:outline-none focus:border-emerald-500 px-2 py-1 rounded w-auto"
                                            />
                                        ) : (
                                            <div className="text-sm text-gray-900 px-2 py-1">
                                                {meetingDate ? new Date(meetingDate).toLocaleDateString('ko-KR', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                }) : '-'}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Participants Property */}
                                <div className="flex items-start gap-4 group relative">
                                    <div className="flex items-center gap-2 text-gray-600 w-40 flex-shrink-0">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                        </svg>
                                        <span className="text-sm font-medium">참석자</span>
                                    </div>
                                    <div className="flex-1">
                                        {/* Selected Participants Tags */}
                                        <div className="flex flex-wrap gap-2 mb-3">
                                            {participants.map((member) => (
                                                <span
                                                    key={member.id}
                                                    className="inline-flex items-center gap-1.5 px-2 py-1 bg-emerald-100 text-emerald-800 rounded-lg text-sm font-medium"
                                                >
                                                    {member.name}
                                                    {isEditingInfo && (
                                                        <button
                                                            onClick={() => removeParticipant(member.id)}
                                                            className="hover:bg-emerald-200 rounded-full p-0.5 cursor-pointer"
                                                        >
                                                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                            </svg>
                                                        </button>
                                                    )}
                                                </span>
                                            ))}
                                        </div>

                                        {/* Search Input (Only when editing) */}
                                        {isEditingInfo && (
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    value={memberSearchQuery}
                                                    onChange={(e) => setMemberSearchQuery(e.target.value)}
                                                    placeholder="참석자 추가 검색"
                                                    className="w-full text-sm text-gray-700 bg-gray-50 border border-gray-300 px-2 py-1 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                                />
                                                {isSearchingMembers && (
                                                    <div className="absolute right-2 top-1/2 -translate-y-1/2">
                                                        <div className="animate-spin h-3.5 w-3.5 border-2 border-emerald-500 border-t-transparent rounded-full"></div>
                                                    </div>
                                                )}

                                                {/* Search Results Dropdown */}
                                                {memberSearchQuery && searchResults.length > 0 && (
                                                    <div className="absolute left-0 top-full mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto z-50">
                                                        {searchResults.map((member) => {
                                                            const isSelected = participants.some(p => p.id === member.id);
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
                                                    <div className="absolute left-0 top-full mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-center text-sm text-gray-500 z-50">
                                                        검색 결과가 없습니다.
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Participant Content Areas */}
                            {participants.length > 0 ? (
                                <div className="space-y-6">
                                    {participantContents.map((pc) => {
                                        // Check if the participant content belongs to the current logged-in user
                                        // We compare userId if available, otherwise fallback to name check won't work well due to structure change
                                        const isCurrentUser = currentUser && pc.userId === currentUser.userId;

                                        return (
                                            <div
                                                key={pc.memberId}
                                                className={`border rounded-lg ${isCurrentUser
                                                    ? 'border-emerald-300 bg-emerald-50/30'
                                                    : 'border-gray-200 bg-gray-50/50'
                                                    }`}
                                            >
                                                {/* Participant Header */}
                                                <div className={`px-4 py-3 border-b flex items-center justify-between ${isCurrentUser ? 'border-emerald-200 bg-emerald-100/50' : 'border-gray-200 bg-gray-100/50'
                                                    }`}>
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isCurrentUser
                                                            ? 'bg-gradient-to-br from-emerald-500 to-teal-600'
                                                            : 'bg-gray-300'
                                                            }`}>
                                                            <span className={`text-sm font-medium ${isCurrentUser ? 'text-white' : 'text-gray-600'
                                                                }`}>
                                                                {pc.memberName.charAt(0)}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-semibold text-gray-900">
                                                                    {pc.memberName}
                                                                </span>
                                                                {isCurrentUser && (
                                                                    <span className="px-2 py-0.5 text-xs font-medium bg-emerald-600 text-white rounded-full">
                                                                        본인
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <span className="text-xs text-gray-500">
                                                                {isCurrentUser ? '내용을 입력할 수 있습니다' : '읽기 전용'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    {!isCurrentUser && (
                                                        <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                                        </svg>
                                                    )}
                                                </div>

                                                {/* Content Area */}
                                                <div className="p-4">
                                                    <textarea
                                                        value={pc.content}
                                                        onChange={(e) => updateParticipantContent(pc.memberId, e.target.value)}
                                                        disabled={!isCurrentUser}
                                                        placeholder={isCurrentUser ? '내용을 입력하세요...' : '아직 작성된 내용이 없습니다.'}
                                                        className={`w-full min-h-[200px] text-base border-none focus:outline-none resize-none ${isCurrentUser
                                                            ? 'text-gray-900 placeholder-gray-400 bg-transparent'
                                                            : 'text-gray-600 placeholder-gray-400 bg-transparent cursor-not-allowed'
                                                            }`}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="text-center py-12 text-gray-400">
                                    <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                    </svg>
                                    <p className="text-lg font-medium">참석자를 선택해주세요</p>
                                    <p className="text-sm mt-1">참석자를 선택하면 각 참석자별 입력 영역이 생성됩니다.</p>
                                </div>
                            )}

                            {/* Note Save Button */}
                            <div className="mt-8 flex justify-end">
                                <button
                                    onClick={handleSaveNote}
                                    disabled={isSaving}
                                    className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSaving ? '저장 중...' : '노트 저장'}
                                </button>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
