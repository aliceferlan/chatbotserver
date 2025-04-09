"use client";

import { useState } from "react";

export default function TestPage() {
	const [testOutput, setTestOutput] = useState<string[]>([]);
	const [loading, setLoading] = useState(false);

	const addLog = (message: string) => {
		setTestOutput((prev) => [...prev, message]);
	};

	const clearLogs = () => {
		setTestOutput([]);
	};

	const runApiTest = async () => {
		setLoading(true);
		clearLogs();

		try {
			addLog("APIテスト開始...");

			// ダミーユーザーID
			const testUserId = "test-user-" + Date.now();
			addLog(`テスト用ユーザーID: ${testUserId}`);

			// 1. ダミーレシート情報でテスト
			const dummyReceipt = {
				userID: testUserId,
				date: "2023/12/01",
				time: "13:45",
				shopName: "テスト店舗",
				amount: 1250,
				description: "APIテスト用レシート",
			};

			// POST リクエストでレシートを保存
			addLog("レシート保存テスト...");
			const saveResponse = await fetch("/api/receipt/test", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(dummyReceipt),
			});

			const saveResult = await saveResponse.json();
			addLog(`保存結果: ${JSON.stringify(saveResult)}`);

			// GET リクエストでレシートを取得
			addLog("レシート取得テスト...");
			const getResponse = await fetch(
				`/api/receipt?userID=${testUserId}`
			);
			const receipts = await getResponse.json();

			addLog(`取得したレシート数: ${receipts.length}`);
			if (receipts.length > 0) {
				addLog(`取得結果: ${JSON.stringify(receipts[0], null, 2)}`);
			}

			addLog("APIテスト完了");
		} catch (error) {
			addLog(
				`エラー発生: ${
					error instanceof Error ? error.message : String(error)
				}`
			);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="container mx-auto p-6">
			<h1 className="text-2xl font-bold mb-6">テストページ</h1>

			<div className="flex flex-col space-y-6">
				<div className="p-4 border rounded-lg">
					<h2 className="text-xl font-semibold mb-4">API テスト</h2>
					<button
						onClick={runApiTest}
						disabled={loading}
						className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-400"
					>
						{loading ? "テスト実行中..." : "APIテスト実行"}
					</button>
				</div>

				<div className="p-4 border rounded-lg">
					<h2 className="text-xl font-semibold mb-2">テスト結果</h2>
					<button
						onClick={clearLogs}
						className="px-2 py-1 text-sm bg-gray-200 rounded mb-4"
					>
						ログをクリア
					</button>
					<div className="bg-gray-100 p-4 rounded-lg h-96 overflow-auto">
						<pre className="whitespace-pre-wrap">
							{testOutput.map((log, index) => (
								<div
									key={index}
									className="py-1 border-b border-gray-200"
								>
									{log}
								</div>
							))}
						</pre>
					</div>
				</div>
			</div>
		</div>
	);
}
