'use client';

import React, { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { useToast } from '@/components/ui/Toast';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [autoLogin, setAutoLogin] = useState(false);
    const { showToast } = useToast();
    const router = useRouter();

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();

        if (!username || !password) {
            showToast('아이디와 비밀번호를 입력해주세요.', 'error');
            return;
        }

        // Validate username format (lowercase English letters only)
        const usernameRegex = /^[a-z]+$/;
        if (!usernameRegex.test(username)) {
            showToast('아이디는 영문 소문자만 입력 가능합니다.', 'error');
            return;
        }

        // Mock login logic
        if (username.length >= 3 && password.length >= 6) {
            showToast('로그인에 성공했습니다!', 'success');
            // Redirect to workspace join page
            setTimeout(() => {
                router.push('/workspace-join');
            }, 1000);
        } else {
            showToast('아이디 또는 비밀번호가 올바르지 않습니다.', 'error');
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-teal-50 px-4 py-12 relative overflow-hidden">
            {/* Background decorative elements */}
            <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
            <div className="absolute top-0 right-0 w-96 h-96 bg-teal-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-8 left-20 w-96 h-96 bg-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

            {/* Main content */}
            <div className="relative z-10 w-full max-w-md animate-fade-in">
                {/* Header / Logo */}
                <div className="mb-8 text-center">
                    <div className="flex items-center justify-center gap-3 mb-6">
                        {/* Book icon with emerald theme */}
                        <div className="relative">
                            <div className="absolute inset-0 bg-emerald-500 rounded-lg blur-md opacity-50"></div>
                            <div className="relative bg-gradient-to-br from-emerald-500 to-emerald-600 p-2.5 rounded-lg shadow-lg">
                                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white">
                                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M6.5 2H20V22H6.5A2.5 2.5 0 0 1 4 19.5V4.5A2.5 2.5 0 0 1 6.5 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                        </div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                            BookCrew
                        </h1>
                    </div>
                    <p className="text-gray-600 text-sm font-medium">
                        독서 모임을 더 쉽게, 더 즐겁게
                    </p>
                </div>

                {/* Login Card */}
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">로그인</h2>

                    {/* Login Form */}
                    <form onSubmit={handleLogin} className="space-y-5">
                        <Input
                            label="아이디"
                            type="text"
                            placeholder="영문 소문자만 입력"
                            value={username}
                            onChange={(e) => setUsername(e.target.value.toLowerCase())}
                            autoComplete="username"
                        />

                        <Input
                            label="비밀번호"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoComplete="current-password"
                        />

                        <div className="flex items-center justify-between">
                            <Checkbox
                                label="자동 로그인"
                                checked={autoLogin}
                                onChange={(e) => setAutoLogin(e.target.checked)}
                            />
                            <Link
                                href="/forgot-password"
                                className="text-sm text-emerald-600 hover:text-emerald-700 font-medium hover:underline transition-colors"
                            >
                                비밀번호 찾기
                            </Link>
                        </div>

                        <div className="space-y-4 pt-2">
                            <Button type="submit" fullWidth>
                                로그인
                            </Button>

                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-200"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-4 bg-white text-gray-500">또는</span>
                                </div>
                            </div>

                            <Link href="/signup" className="block">
                                <Button type="button" variant="secondary" fullWidth>
                                    회원가입
                                </Button>
                            </Link>
                        </div>
                    </form>
                </div>

                {/* Footer text */}
                <p className="mt-8 text-center text-sm text-gray-500">
                    독서 모임 관리의 새로운 기준, <span className="font-semibold text-emerald-600">BookCrew</span>
                </p>
            </div>

            <style jsx>{`
                @keyframes blob {
                    0%, 100% {
                        transform: translate(0, 0) scale(1);
                    }
                    33% {
                        transform: translate(30px, -50px) scale(1.1);
                    }
                    66% {
                        transform: translate(-20px, 20px) scale(0.9);
                    }
                }
                .animate-blob {
                    animation: blob 7s infinite;
                }
                .animation-delay-2000 {
                    animation-delay: 2s;
                }
                .animation-delay-4000 {
                    animation-delay: 4s;
                }
            `}</style>
        </div>
    );
}
