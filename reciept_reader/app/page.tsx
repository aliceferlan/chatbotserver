"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
	const [file, setFile] = useState<File | null>(null);
	const [preview, setPreview] = useState<string | null>(null);
	const [processing, setProcessing] = useState(false);
	const [result, setResult] = useState<any>(null);
	const [error, setError] = useState<string | null>(null);
	const [userID, setUserID] = useState("guest-user"); // デフォルトユーザーID
	const [debugMode, setDebugMode] = useState(false);

	// ファイル選択ハンドラー
	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files[0]) {
			const selectedFile = e.target.files[0];
			setFile(selectedFile);

			// プレビュー画像を作成
			const reader = new FileReader();
			reader.onload = () => {
				setPreview(reader.result as string);
			};
			reader.readAsDataURL(selectedFile);

			// 以前の結果をクリア
			setResult(null);
			setError(null);
		}
	};

	// レシート送信ハンドラー
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!file) {
			setError("画像ファイルを選択してください");
			return;
		}

		setProcessing(true);
		setError(null);

		try {
			const formData = new FormData();
			formData.append("image", file);
			formData.append("userID", userID);

			// デバッグモードが有効ならフラグを追加
			if (debugMode) {
				formData.append("debug", "true");
			}

			const response = await fetch("/api/receipt", {
				method: "POST",
				body: formData,
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(
					data.error || "レシート処理中にエラーが発生しました"
				);
			}

			setResult(data);
		} catch (err) {
			console.error("Error uploading receipt:", err);
			setError(
				err instanceof Error
					? err.message
					: "不明なエラーが発生しました"
			);
		} finally {
			setProcessing(false);
		}
	};

	// ステータス確認
	const checkStatus = async () => {
		try {
			const response = await fetch("/api/status");
			const status = await response.json();

			setResult({
				_type: "status",
				...status,
			});
		} catch (err) {
			console.error("Error checking status:", err);
			setError(
				err instanceof Error
					? err.message
					: "ステータス確認中にエラーが発生しました"
			);
		}
	};

	return (
		<div className="grid min-h-screen p-8 pb-20 gap-6">
			<header className="text-center py-4">
				<h1 className="text-3xl font-bold">レシートリーダー</h1>
				<p className="text-gray-600 mt-2">
					レシート画像をアップロードして分析しましょう
				</p>

				<div className="flex justify-center space-x-4 mt-4">
					<Link
						href="/receipts"
						className="text-blue-600 hover:underline"
					>
						レシート履歴を見る
					</Link>
					<Link
						href="/test"
						className="text-blue-600 hover:underline"
					>
						テストページ
					</Link>
					<button
						onClick={checkStatus}
						className="text-green-600 hover:underline"
					>
						システム状態を確認
					</button>
				</div>
			</header>

			<main className="flex flex-col gap-8 max-w-4xl mx-auto w-full">
				{/* ユーザーID入力 */}
				<div className="w-full">
					<label
						htmlFor="userID"
						className="block text-sm font-medium mb-2"
					>
						ユーザーID
					</label>
					<input
						type="text"
						id="userID"
						value={userID}
						onChange={(e) => setUserID(e.target.value)}
						className="w-full p-2 border rounded"
						placeholder="ユーザーIDを入力"
					/>
				</div>

				{/* 画像アップロードフォーム */}
				<form onSubmit={handleSubmit} className="w-full">
					<div className="mb-4">
						<label
							htmlFor="receiptImage"
							className="block text-sm font-medium mb-2"
						>
							レシート画像
						</label>
						<input
							type="file"
							id="receiptImage"
							accept="image/*"
							onChange={handleFileChange}
							className="w-full p-2 border rounded"
						/>
					</div>

					{/* プレビュー表示 */}
					{preview && (
						<div className="mb-4">
							<p className="text-sm font-medium mb-2">
								プレビュー
							</p>
							<div className="relative w-full h-64 border rounded overflow-hidden">
								<Image
									src={preview}
									alt="Receipt preview"
									fill
									style={{ objectFit: "contain" }}
								/>
							</div>
						</div>
					)}

					{/* デバッグモード */}
					<div className="mb-4 flex items-center">
						<input
							type="checkbox"
							id="debugMode"
							checked={debugMode}
							onChange={(e) => setDebugMode(e.target.checked)}
							className="mr-2"
						/>
						<label htmlFor="debugMode" className="text-sm">
							デバッグモード（詳細情報を表示）
						</label>
					</div>

					<button
						type="submit"
						disabled={processing || !file}
						className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
					>
						{processing ? "処理中..." : "レシートを分析"}
					</button>
				</form>

				{/* エラーメッセージ */}
				{error && (
					<div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
						<p>{error}</p>
					</div>
				)}

				{/* 結果表示 */}
				{result && (
					<div className="p-4 bg-gray-100 border rounded">
						{result._type === "status" ? (
							// ステータス情報表示
							<div>
								<h2 className="text-xl font-bold mb-2">
									システム状態
								</h2>
								<div className="mt-2">
									<p>
										ステータス:{" "}
										<span
											className={
												result.status === "online"
													? "text-green-600"
													: "text-red-600"
											}
										>
											{result.status}
										</span>
									</p>
									<p>タイムスタンプ: {result.timestamp}</p>

									<h3 className="font-semibold mt-3">
										環境:
									</h3>
									<p>Node: {result.environment.node}</p>
									<p>環境: {result.environment.env}</p>

									<h3 className="font-semibold mt-3">
										サービス状態:
									</h3>
									<ul className="ml-4 list-disc">
										<li>
											AWS:{" "}
											{result.services.aws.configured
												? "設定済み"
												: "未設定"}
										</li>
										{result.services.aws.configured && (
											<>
												<li className="ml-4">
													リージョン:{" "}
													{result.services.aws.region}
												</li>
												<li className="ml-4">
													DynamoDB:{" "}
													{result.services.aws
														.dynamodb.connected
														? "接続成功"
														: "接続失敗"}
												</li>
											</>
										)}
										<li>
											Gemini API:{" "}
											{result.services.gemini.configured
												? "設定済み"
												: "未設定"}
										</li>
									</ul>
								</div>
							</div>
						) : "error" in result ? (
							// エラー表示
							<div>
								<h2 className="text-xl font-bold mb-2">
									エラー
								</h2>
								<div className="text-red-600">
									<p className="font-semibold">
										{result.error}
									</p>
									<p>検出内容: {result.contentType}</p>
									<p>提案: {result.suggestion}</p>
								</div>
							</div>
						) : (
							// レシート結果表示
							<div>
								<h2 className="text-xl font-bold mb-2">
									分析結果
								</h2>
								<div className="flex justify-between items-center mb-2">
									<h3 className="font-bold text-lg">
										{result.shopName || "不明な店舗"}
									</h3>
									<p>
										{result.date} {result.time}
									</p>
								</div>

								{result.items && result.items.length > 0 && (
									<div className="mt-4">
										<h4 className="font-semibold mb-2">
											購入アイテム
										</h4>
										<table className="w-full border-collapse">
											<thead>
												<tr className="bg-gray-200">
													<th className="text-left p-2">
														商品名
													</th>
													<th className="text-right p-2">
														数量
													</th>
													<th className="text-right p-2">
														価格
													</th>
												</tr>
											</thead>
											<tbody>
												{result.items.map(
													(
														item: any,
														index: number
													) => (
														<tr
															key={index}
															className="border-b"
														>
															<td className="p-2">
																{item.itemName}
															</td>
															<td className="text-right p-2">
																{item.quantity ||
																	1}
															</td>
															<td className="text-right p-2">
																{item.itemPrice}
																円
															</td>
														</tr>
													)
												)}
											</tbody>
											<tfoot>
												<tr className="font-bold">
													<td className="p-2">
														合計
													</td>
													<td className="p-2"></td>
													<td className="text-right p-2">
														{result.amount}円
													</td>
												</tr>
											</tfoot>
										</table>
									</div>
								)}

								<div className="mt-4 text-sm text-gray-600">
									<p>
										支払い方法:{" "}
										{result.paymentMethod || "不明"}
									</p>
									{result.description && (
										<p>説明: {result.description}</p>
									)}
								</div>

								{/* デバッグ情報 */}
								{debugMode && result.debug && (
									<div className="mt-4 p-2 bg-gray-200 rounded">
										<h4 className="font-semibold mb-1">
											デバッグ情報:
										</h4>
										<p>
											処理日時: {result.debug.processedAt}
										</p>
										<p>
											ファイル名:{" "}
											{result.debug.imageInfo.fileName}
										</p>
										<p>
											ファイルサイズ:{" "}
											{result.debug.imageInfo.fileSize}{" "}
											bytes
										</p>
										<p>
											ファイル形式:{" "}
											{result.debug.imageInfo.fileType}
										</p>
									</div>
								)}
							</div>
						)}

						<div className="mt-4">
							<details>
								<summary className="cursor-pointer text-blue-600">
									JSON データ
								</summary>
								<pre className="mt-2 p-2 bg-gray-200 rounded overflow-auto text-xs">
									{JSON.stringify(result, null, 2)}
								</pre>
							</details>
						</div>
					</div>
				)}
			</main>

			<footer className="text-center text-gray-500 text-sm py-4">
				&copy; {new Date().getFullYear()} レシートリーダーアプリ
			</footer>
		</div>
	);
}
