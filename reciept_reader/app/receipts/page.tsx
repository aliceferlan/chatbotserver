"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Receipt } from "@/lib/types";

export default function ReceiptsPage() {
	const [receipts, setReceipts] = useState<Receipt[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [userID, setUserID] = useState("guest-user");

	// レシートを取得する関数
	const fetchReceipts = async () => {
		setLoading(true);
		setError(null);

		try {
			const response = await fetch(`/api/receipt?userID=${userID}`);

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(
					errorData.error || "レシートの取得に失敗しました"
				);
			}

			const data = await response.json();
			setReceipts(data);
		} catch (err) {
			console.error("Error fetching receipts:", err);
			setError(
				err instanceof Error
					? err.message
					: "不明なエラーが発生しました"
			);
		} finally {
			setLoading(false);
		}
	};

	// ユーザーIDが変更されたらレシートを再取得
	useEffect(() => {
		if (userID) {
			fetchReceipts();
		}
	}, [userID]);

	return (
		<div className="grid min-h-screen p-8 pb-20 gap-6">
			<header className="text-center py-4">
				<h1 className="text-3xl font-bold">レシート一覧</h1>
				<p className="text-gray-600 mt-2">保存されたレシートの履歴</p>
			</header>

			<nav className="max-w-4xl mx-auto w-full">
				<Link href="/" className="text-blue-600 hover:underline">
					← ホームに戻る
				</Link>
			</nav>

			<main className="flex flex-col gap-8 max-w-4xl mx-auto w-full">
				{/* ユーザーID入力 */}
				<div className="w-full flex gap-4">
					<input
						type="text"
						value={userID}
						onChange={(e) => setUserID(e.target.value)}
						className="flex-1 p-2 border rounded"
						placeholder="ユーザーIDを入力"
					/>
					<button
						onClick={fetchReceipts}
						className="py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700"
					>
						更新
					</button>
				</div>

				{/* エラーメッセージ */}
				{error && (
					<div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
						<p>{error}</p>
					</div>
				)}

				{/* ローディング表示 */}
				{loading && (
					<div className="text-center py-8">
						<p className="text-gray-600">読み込み中...</p>
					</div>
				)}

				{/* レシート一覧 */}
				{!loading && receipts.length === 0 ? (
					<div className="text-center py-8">
						<p className="text-gray-600">レシートがありません</p>
					</div>
				) : (
					<div className="grid gap-4">
						{receipts.map((receipt) => (
							<div
								key={receipt.recipetID}
								className="p-4 border rounded shadow-sm"
							>
								<div className="flex justify-between items-center mb-2">
									<h3 className="font-bold">
										{receipt.shopName || "不明な店舗"}
									</h3>
									<p className="text-sm text-gray-600">
										{receipt.date} {receipt.time}
									</p>
								</div>

								<p className="text-lg font-semibold mt-2">
									{receipt.amount}円
								</p>

								{receipt.description && (
									<p className="text-sm text-gray-700 mt-1">
										{receipt.description}
									</p>
								)}

								{receipt.items && receipt.items.length > 0 && (
									<div className="mt-4">
										<details>
											<summary className="cursor-pointer text-blue-600 text-sm">
												アイテム一覧 (
												{receipt.items.length}点)
											</summary>
											<ul className="mt-2 text-sm">
												{receipt.items.map(
													(item, index) => (
														<li
															key={index}
															className="flex justify-between py-1 border-b"
														>
															<span>
																{item.itemName}
															</span>
															<span>
																{item.itemPrice}
																円 ×{" "}
																{item.quantity ||
																	1}
															</span>
														</li>
													)
												)}
											</ul>
										</details>
									</div>
								)}

								<div className="mt-3 text-xs text-gray-500">
									<p>
										支払い方法:{" "}
										{receipt.paymentMethod || "不明"}
									</p>
									{receipt.address && (
										<p>住所: {receipt.address}</p>
									)}
								</div>
							</div>
						))}
					</div>
				)}
			</main>

			<footer className="text-center text-gray-500 text-sm py-4">
				&copy; {new Date().getFullYear()} レシートリーダーアプリ
			</footer>
		</div>
	);
}
