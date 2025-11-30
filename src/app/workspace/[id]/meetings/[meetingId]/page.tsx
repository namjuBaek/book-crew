'use client';

import React, { useState, useEffect, useRef } from 'react';
import { WorkspaceHeader } from '@/components/workspace/Header';
import { WorkspaceSidebar } from '@/components/workspace/Sidebar';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/Toast';

interface ParticipantContent {
    participantName: string;
    content: string;
}

export default function MeetingDetailPage({
    params
}: {
    params: { id: string; meetingId: string }
}) {
    const router = useRouter();
    const { showToast } = useToast();
    const [title, setTitle] = useState('');
    const [meetingDate, setMeetingDate] = useState('');
    const [participants, setParticipants] = useState<string[]>([]);
    const [participantContents, setParticipantContents] = useState<ParticipantContent[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [showParticipantDropdown, setShowParticipantDropdown] = useState(false);
    const [currentUser] = useState('김철수'); // Mock current user
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Available participants (mock data)
    const availableParticipants = ['홍길동', '김철수', '이영희', '박민수', '최지영'];

    useEffect(() => {
        // Load meeting data (mock)
        setTitle('');
        setMeetingDate('');
        setParticipants([]);
        setParticipantContents([]);
    }, [params.meetingId]);

    useEffect(() => {
        // Update participant contents when participants change
        const newContents = participants.map(participant => {
            const existing = participantContents.find(pc => pc.participantName === participant);
            return existing || { participantName: participant, content: '' };
        });
        setParticipantContents(newContents);
    }, [participants]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowParticipantDropdown(false);
            }
        };

        if (showParticipantDropdown) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showParticipantDropdown]);

    const toggleParticipant = (participant: string) => {
        if (participants.includes(participant)) {
            setParticipants(participants.filter(p => p !== participant));
        } else {
            setParticipants([...participants, participant]);
        }
    };

    const updateParticipantContent = (participantName: string, content: string) => {
        setParticipantContents(prev =>
            prev.map(pc =>
                pc.participantName === participantName
                    ? { ...pc, content }
                    : pc
            )
        );
    };

    const handleSave = () => {
        if (!title.trim()) {
            showToast('제목을 입력해주세요.', 'error');
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
        setTimeout(() => {
            setIsSaving(false);
            showToast('문서가 저장되었습니다.', 'success');
        }, 500);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <WorkspaceHeader workspaceId={params.id} />
            <WorkspaceSidebar workspaceId={params.id} />

            <main className="ml-64 pt-[73px] p-8">
                <div className="max-w-5xl mx-auto">
                    {/* Back Button */}
                    <button
                        onClick={() => router.push(`/workspace/${params.id}/meetings`)}
                        className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        <span className="font-medium">돌아가기</span>
                    </button>

                    {/* Document Container */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
                        {/* Title Input */}
                        <input
                            type="text"
                            placeholder="제목을 입력하세요"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full text-4xl font-bold text-gray-900 placeholder-gray-300 border-none focus:outline-none mb-6"
                        />

                        {/* Properties Section - Notion Style */}
                        <div className="space-y-3 mb-12">
                            {/* Meeting Date Property */}
                            <div className="flex items-center gap-4 group">
                                <div className="flex items-center gap-2 text-gray-600 w-40 flex-shrink-0">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <span className="text-sm font-medium">진행 일자</span>
                                </div>
                                {meetingDate ? (
                                    <button
                                        onClick={() => setMeetingDate('')}
                                        className="text-sm text-gray-700 hover:bg-gray-100 px-2 py-1 rounded cursor-pointer"
                                    >
                                        {new Date(meetingDate).toLocaleDateString('ko-KR', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </button>
                                ) : (
                                    <input
                                        type="date"
                                        value={meetingDate}
                                        onChange={(e) => setMeetingDate(e.target.value)}
                                        className="text-sm text-gray-500 border-none focus:outline-none cursor-pointer hover:bg-gray-100 px-2 py-1 rounded"
                                        placeholder="Empty"
                                    />
                                )}
                            </div>

                            {/* Participants Property */}
                            <div className="flex items-start gap-4 group relative">
                                <div className="flex items-center gap-2 text-gray-600 w-40 flex-shrink-0">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                    </svg>
                                    <span className="text-sm font-medium">참석자</span>
                                </div>
                                <div className="flex-1 relative" ref={dropdownRef}>
                                    {participants.length === 0 ? (
                                        <button
                                            onClick={() => setShowParticipantDropdown(!showParticipantDropdown)}
                                            className="text-sm text-gray-400 hover:bg-gray-100 px-2 py-1 rounded cursor-pointer"
                                        >
                                            Empty
                                        </button>
                                    ) : (
                                        <div className="flex flex-wrap gap-2">
                                            {participants.map((participant) => (
                                                <div
                                                    key={participant}
                                                    className="inline-flex items-center gap-1.5 px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm text-gray-700 cursor-pointer group/chip"
                                                >
                                                    <div className="w-5 h-5 rounded-full bg-gray-300 flex items-center justify-center">
                                                        <span className="text-xs font-medium text-gray-600">
                                                            {participant.charAt(0)}
                                                        </span>
                                                    </div>
                                                    <span>{participant}</span>
                                                    <button
                                                        onClick={() => toggleParticipant(participant)}
                                                        className="opacity-0 group-hover/chip:opacity-100 hover:bg-gray-300 rounded p-0.5"
                                                    >
                                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            ))}
                                            <button
                                                onClick={() => setShowParticipantDropdown(!showParticipantDropdown)}
                                                className="text-sm text-gray-400 hover:bg-gray-100 px-2 py-1 rounded cursor-pointer"
                                            >
                                                +
                                            </button>
                                        </div>
                                    )}

                                    {/* Participant Dropdown - Absolute Positioned */}
                                    {showParticipantDropdown && (
                                        <>
                                            {/* Backdrop */}
                                            <div
                                                className="fixed inset-0 z-40"
                                                onClick={() => setShowParticipantDropdown(false)}
                                            />

                                            {/* Dropdown */}
                                            <div className="absolute left-0 top-full mt-2 p-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[250px]">
                                                <div className="space-y-1">
                                                    {availableParticipants.map((participant) => (
                                                        <label
                                                            key={participant}
                                                            className="flex items-center gap-2 p-2 rounded hover:bg-gray-50 cursor-pointer"
                                                        >
                                                            <input
                                                                type="checkbox"
                                                                checked={participants.includes(participant)}
                                                                onChange={() => toggleParticipant(participant)}
                                                                className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500 cursor-pointer"
                                                            />
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                                                                    <span className="text-xs font-medium text-gray-600">
                                                                        {participant.charAt(0)}
                                                                    </span>
                                                                </div>
                                                                <span className="text-sm text-gray-900">{participant}</span>
                                                            </div>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Participant Content Areas */}
                        {participants.length > 0 ? (
                            <div className="space-y-6">
                                {participantContents.map((pc) => {
                                    const isCurrentUser = pc.participantName === currentUser;
                                    return (
                                        <div
                                            key={pc.participantName}
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
                                                            {pc.participantName.charAt(0)}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-semibold text-gray-900">
                                                                {pc.participantName}
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
                                                    onChange={(e) => updateParticipantContent(pc.participantName, e.target.value)}
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

                        {/* Save Button */}
                        <div className="mt-8 flex justify-end">
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSaving ? '저장 중...' : '저장'}
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
