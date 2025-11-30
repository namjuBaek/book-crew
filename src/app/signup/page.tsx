'use client';

import React, { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');
    const [usernameVerified, setUsernameVerified] = useState<boolean | null>(null);
    const [passwordMatched, setPasswordMatched] = useState<boolean | null>(null);
    const { showToast } = useToast();
    const router = useRouter();

    // Mock database of existing usernames
    const existingUsernames = ['testuser', 'admin', 'bookcrew'];

    const handleUsernameVerification = () => {
        if (!username) {
            showToast('아이디를 입력해주세요.', 'error');
            return;
        }

        // Username format validation (lowercase English letters only)
        const usernameRegex = /^[a-z]+$/;
        if (!usernameRegex.test(username)) {
            showToast('아이디는 영문 소문자만 입력 가능합니다.', 'error');
            setUsernameVerified(false);
            return;
        }

        // Username length validation
        if (username.length < 3) {
            showToast('아이디는 최소 3자 이상이어야 합니다.', 'error');
            setUsernameVerified(false);
            return;
        }

        // Check if username already exists (mock API call)
        if (existingUsernames.includes(username.toLowerCase())) {
            setUsernameVerified(false);
            showToast('이미 사용 중인 아이디입니다.', 'error');
        } else {
            setUsernameVerified(true);
            showToast('사용 가능한 아이디입니다.', 'success');
        }
    };

    const handleSignup = (e: React.FormEvent) => {
        e.preventDefault();

        // Validation checks
        if (!username || !password || !passwordConfirm) {
            showToast('모든 필드를 입력해주세요.', 'error');
            return;
        }

        if (usernameVerified !== true) {
            showToast('아이디 중복 확인을 완료해주세요.', 'error');
            return;
        }

        if (password.length < 6) {
            showToast('비밀번호는 최소 6자 이상이어야 합니다.', 'error');
            return;
        }

        if (password !== passwordConfirm) {
            showToast('비밀번호가 일치하지 않습니다.', 'error');
            return;
        }

        // Mock signup success
        showToast('회원가입이 완료되었습니다!', 'success');

        // Redirect to login page after 1.5 seconds
        setTimeout(() => {
            router.push('/login');
        }, 1500);
    };

    // Reset username verification when username changes
    const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.toLowerCase();
        setUsername(value);
        setUsernameVerified(null);
    };

    // Check password match in real-time
    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newPassword = e.target.value;
        setPassword(newPassword);

        // Check if passwords match when both fields have values
        if (passwordConfirm) {
            setPasswordMatched(newPassword === passwordConfirm);
        } else {
            setPasswordMatched(null);
        }
    };

    const handlePasswordConfirmChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newPasswordConfirm = e.target.value;
        setPasswordConfirm(newPasswordConfirm);

        // Check if passwords match in real-time
        if (newPasswordConfirm && password) {
            setPasswordMatched(password === newPasswordConfirm);
        } else {
            setPasswordMatched(null);
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
                    <Link href="/" className="inline-block">
                        <div className="flex items-center justify-center gap-3 mb-6 hover:opacity-80 transition-opacity">
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
                    </Link>
                    <p className="text-gray-600 text-sm font-medium">
                        독서 모임을 더 쉽게, 더 즐겁게
                    </p>
                </div>

                {/* Signup Card */}
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">회원가입</h2>

                    {/* Signup Form */}
                    <form onSubmit={handleSignup} className="space-y-5">
                        {/* Username Input with Verification */}
                        <div>
                            <div className="flex gap-2">
                                <div className="flex-1">
                                    <Input
                                        label="아이디"
                                        type="text"
                                        placeholder="영문 소문자만 입력"
                                        value={username}
                                        onChange={handleUsernameChange}
                                        autoComplete="username"
                                    />
                                </div>
                                <div className="pt-7">
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        onClick={handleUsernameVerification}
                                        className="h-[50px] whitespace-nowrap"
                                    >
                                        중복확인
                                    </Button>
                                </div>
                            </div>
                            {/* Username verification feedback */}
                            {usernameVerified === true && (
                                <p className="mt-2 text-sm text-emerald-600 font-medium flex items-center gap-1">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    사용 가능한 아이디입니다.
                                </p>
                            )}
                            {usernameVerified === false && (
                                <p className="mt-2 text-sm text-red-500 font-medium flex items-center gap-1">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                    이미 사용 중인 아이디입니다.
                                </p>
                            )}
                        </div>

                        {/* Password Input */}
                        <Input
                            label="비밀번호"
                            type="password"
                            placeholder="최소 6자 이상"
                            value={password}
                            onChange={handlePasswordChange}
                            autoComplete="new-password"
                        />

                        {/* Password Confirmation */}
                        <div>
                            <Input
                                label="비밀번호 재확인"
                                type="password"
                                placeholder="비밀번호를 다시 입력해주세요"
                                value={passwordConfirm}
                                onChange={handlePasswordConfirmChange}
                                autoComplete="new-password"
                            />
                            {/* Password match feedback */}
                            {passwordMatched === false && (
                                <p className="mt-2 text-sm text-red-500 font-medium flex items-center gap-1">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                    비밀번호가 일치하지 않습니다.
                                </p>
                            )}
                        </div>

                        <div className="space-y-4 pt-2">
                            <Button type="submit" fullWidth>
                                회원가입
                            </Button>

                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-200"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-4 bg-white text-gray-500">또는</span>
                                </div>
                            </div>

                            <div className="text-center">
                                <span className="text-sm text-gray-600">이미 계정이 있으신가요? </span>
                                <Link
                                    href="/login"
                                    className="text-sm text-emerald-600 hover:text-emerald-700 font-semibold hover:underline transition-colors"
                                >
                                    로그인
                                </Link>
                            </div>
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
