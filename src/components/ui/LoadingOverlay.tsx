import React from 'react';

interface LoadingOverlayProps {
    isVisible: boolean;
    message?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
    isVisible,
    message = '처리 중입니다...'
}) => {
    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 flex flex-col items-center gap-4 shadow-2xl">
                <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-700 font-semibold">{message}</p>
            </div>
        </div>
    );
};
