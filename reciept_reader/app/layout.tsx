import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "レシートリーダー",
	description: "レシート画像をアップロードして自動解析するアプリ",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="ja">
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased`}
			>
				<nav className="bg-gray-800 text-white p-4">
					<div className="max-w-4xl mx-auto flex justify-between items-center">
						<a href="/" className="text-xl font-bold">
							レシートリーダー
						</a>
						<div className="flex gap-4">
							<a href="/" className="hover:underline">
								ホーム
							</a>
							<a href="/receipts" className="hover:underline">
								レシート一覧
							</a>
						</div>
					</div>
				</nav>
				{children}
			</body>
		</html>
	);
}
