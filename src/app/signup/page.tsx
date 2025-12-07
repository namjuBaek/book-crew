'use client';

import React, { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { LoadingOverlay } from '@/components/ui/LoadingOverlay';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api';

export default function SignupPage() {
    const [userid, setUserid] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');
    const [useridVerified, setUseridVerified] = useState<boolean | null>(null);
    const [passwordMatched, setPasswordMatched] = useState<boolean | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const { showToast } = useToast();
    const router = useRouter();

    const [isCheckingUserid, setIsCheckingUserid] = useState(false);

    const handleUseridVerification = async () => {
        if (!userid) {
            showToast('아이디를 입력해주세요.', 'error');
            return;
        }

        // Userid format validation (lowercase English letters and numbers)
        const useridRegex = /^[a-z0-9]+$/;
        if (!useridRegex.test(userid)) {
            showToast('아이디는 영문 소문자와 숫자만 입력 가능합니다.', 'error');
            return;
        }

        // Userid length validation
        if (userid.length < 3) {
            showToast('아이디는 최소 3자 이상이어야 합니다.', 'error');
            return;
        }

        // Check if userid already exists via API
        setIsCheckingUserid(true);
        try {
            const response = await apiClient.post('/users/check-userid', {
                userId: userid
            });

            // response.data.data.available로 중복 여부 확인
            const { available } = response.data.data;
            const message = response.data.message;

            if (available) {
                // 사용 가능한 아이디
                setUseridVerified(true);
                showToast(message || '사용 가능한 아이디입니다.', 'success');
            } else {
                // 이미 사용 중인 아이디
                setUseridVerified(false);
                showToast(message || '이미 사용 중인 아이디입니다.', 'error');
            }
        } catch (error: any) {
            console.error('Userid check error:', error);

            if (error.response) {
                // 서버가 에러 응답을 반환
                setUseridVerified(null);
                const errorMessage = error.response.data.message || '아이디 확인 중 오류가 발생했습니다.';
                showToast(errorMessage, 'error');
            } else if (error.request) {
                // 요청은 보냈지만 응답이 없음
                setUseridVerified(null);
                showToast('서버와의 연결에 실패했습니다. 잠시 후 다시 시도해주세요.', 'error');
            } else {
                // 기타 에러
                setUseridVerified(null);
                showToast('오류가 발생했습니다. 잠시 후 다시 시도해주세요.', 'error');
            }
        } finally {
            setIsCheckingUserid(false);
        }
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation checks
        if (!userid || !password || !passwordConfirm) {
            showToast('모든 필드를 입력해주세요.', 'error');
            return;
        }

        if (useridVerified !== true) {
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

        setIsLoading(true);

        try {
            const response = await apiClient.post('/users/signup', {
                userId: userid,
                password
            });

            const data = response.data;

            showToast(data.message || '회원가입이 완료되었습니다.', 'success');

            // 성공 시 로딩 상태 유지 (페이지 이동까지)
            // Redirect to login page after 1.5 seconds
            setTimeout(() => {
                router.push('/login');
            }, 1500);
        } catch (error: any) {
            console.error('Signup error:', error);

            if (error.response) {
                // Server responded with error status
                const errorMessage = Array.isArray(error.response.data.message)
                    ? error.response.data.message.join(', ')
                    : error.response.data.message;
                showToast(errorMessage || '회원가입에 실패했습니다.', 'error');
            } else if (error.request) {
                // Request was made but no response received
                showToast('서버와의 연결에 실패했습니다. 잠시 후 다시 시도해주세요.', 'error');
            } else {
                // Something else happened
                showToast('오류가 발생했습니다. 잠시 후 다시 시도해주세요.', 'error');
            }

            // 에러 발생 시에만 로딩 해제
            setIsLoading(false);
        }
    };

    // Reset userid verification when userid changes
    const handleUseridChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.toLowerCase();
        setUserid(value);
        setUseridVerified(null);
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
            {/* Loading Overlay */}
            <LoadingOverlay isVisible={isLoading} />

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
                        {/* Userid Input with Verification */}
                        <div>
                            <div className="flex gap-2">
                                <div className="flex-1">
                                    <Input
                                        label="아이디"
                                        type="text"
                                        placeholder="영문 소문자, 숫자 입력"
                                        value={userid}
                                        onChange={handleUseridChange}
                                        autoComplete="username"
                                    />
                                </div>
                                <div className="pt-7">
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        onClick={handleUseridVerification}
                                        className="h-[50px] whitespace-nowrap"
                                        disabled={isCheckingUserid}
                                    >
                                        {isCheckingUserid ? '확인 중...' : '중복확인'}
                                    </Button>
                                </div>
                            </div>
                            {/* Userid verification feedback */}
                            {useridVerified === true && (
                                <p className="mt-2 text-sm text-emerald-600 font-medium flex items-center gap-1">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    사용 가능한 아이디입니다.
                                </p>
                            )}
                            {useridVerified === false && (
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
                            <Button type="submit" fullWidth disabled={isLoading}>
                                {isLoading ? '처리 중...' : '회원가입'}
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
