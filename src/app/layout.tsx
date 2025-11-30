import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ToastProvider } from "@/components/ui/Toast";

const pretendard = localFont({
  src: [
    {
      path: "../fonts/Pretendard-Thin.woff2",
      weight: "100",
      style: "normal",
    },
    {
      path: "../fonts/Pretendard-ExtraLight.woff2",
      weight: "200",
      style: "normal",
    },
    {
      path: "../fonts/Pretendard-Light.woff2",
      weight: "300",
      style: "normal",
    },
    {
      path: "../fonts/Pretendard-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../fonts/Pretendard-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../fonts/Pretendard-SemiBold.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "../fonts/Pretendard-Bold.woff2",
      weight: "700",
      style: "normal",
    },
    {
      path: "../fonts/Pretendard-ExtraBold.woff2",
      weight: "800",
      style: "normal",
    },
    {
      path: "../fonts/Pretendard-Black.woff2",
      weight: "900",
      style: "normal",
    },
  ],
  variable: "--font-pretendard",
  display: "swap",
});

export const metadata: Metadata = {
  title: "BookCrew - 독서 모임 관리 플랫폼",
  description: "독서 모임 운영을 더 쉽고 즐겁게. 멤버 관리, 일정 공유, 기록 정리를 한 곳에서.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={`${pretendard.variable} font-pretendard antialiased`}>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
