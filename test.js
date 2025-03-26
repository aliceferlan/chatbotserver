import { GoogleGenAI } from "@google/genai";

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
// 現在のファイルのディレクトリパスを取得
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// APIキーを設定
const apiKey = process.env.GEMINI_API_KEY;

// Gemini APIクライアントを初期化
const ai = new GoogleGenAI({ apiKey });

// 画像ファイルをBase64エンコードする関数
function fileToGenerativePart(filePath, mimeType) {
	const fileBuffer = fs.readFileSync(filePath);
	return {
		inlineData: {
			data: fileBuffer.toString("base64"),
			mimeType,
		},
	};
}

async function main() {
	console.log("開始しました...");

	try {
		// 使用するモデルを選択（マルチモーダル対応のモデル）
		const model = "gemini-1.5-pro";

		// 画像ファイルのパス（同じディレクトリにある image.jpg を使用）
		const imagePath = path.join(__dirname, "pic2.jpg");

		// 画像のMIMEタイプを指定
		// 一般的な画像形式: image/jpeg, image/png, image/gif, image/webp
		const imagePart = fileToGenerativePart(imagePath, "image/jpeg");

		// テキストと画像を含むリクエストを作成
		const prompt =
			'この取引明細画像を読み取り、以下のstandard formatに基づいてJsonを生成して。読み取れない箇所は空白で表示して。取引明細ではない場合は illigal format に従ってエラー情報を返して <standart format> {"店名": "店名 支店あなたはレシート解析の専門家です。提供された画像が購入レシートかどうかを判断し、適切に処理して。【タスク】1. まず、画像が購入レシート（会計明細）かどうかを判断する。2. 購入レシートの場合のみ、情報を抽出してJSON形式で返す。3. 購入レシートでない場合（商品説明、成分表示、メニュー、広告など）は、エラー情報を返す。【レシートの特徴】- 店舗名、日付、時間が記載されている - 購入した商品名と金額の一覧がある - 合計金額が記載されている - 支払い方法の記載がある場合が多い - 「領収書」「レシート」「お買い上げ明細」などの文言がある【出力形式】レシートの場合:{ "店名": "店名 支店名", "日付": "YYYY/MM/DD", "時間": "HH:MM", "詳細": [ {"商品名": "商品名1", "値段": 金額1}, {"商品名": "商品名2", "値段": 金額2} ], "合計": 合計金額, "支払い方法": "現金|クレジットカード|電子マネー(種類を記載)"} レシートでない場合:{ "error": "この画像はレシートではありません", "detected_content_type": "検出されたコンテンツタイプ(例: 商品説明、成分表示、メニュー、広告など)", "suggestion": "購入時に発行される会計明細書（レシート）の画像をアップロードしてください"} 読み取れない箇所は該当フィールドを空白または0とする。不明な支払い方法は「不明」と記載する。';

		// リクエストを送信
		const response = await ai.models.generateContent({
			model: model,
			contents: [
				{
					parts: [{ text: prompt }, imagePart],
				},
			],
		});

		// レスポンス全体を表示（整形して読みやすく）
		console.log("=== Gemini APIからの完全なレスポンス ===");
		console.log(JSON.stringify(response, null, 2));

		// テキスト部分だけを表示
		console.log("\n=== 生成されたテキスト ===");
		console.log(response.text);

		// レスポンスの構造を詳しく調べる
		console.log("\n=== レスポンスの構造 ===");
		console.log("レスポンスのプロパティ:", Object.keys(response));

		// candidates配列があれば表示
		if (response.candidates) {
			console.log("\n=== 候補リスト ===");
			response.candidates.forEach((candidate, index) => {
				console.log(`候補 ${index + 1}:`);
				console.log(JSON.stringify(candidate, null, 2));
			});
		}

		// parts配列があれば表示
		if (response.parts) {
			console.log("\n=== パーツリスト ===");
			response.parts.forEach((part, index) => {
				console.log(`パーツ ${index + 1}:`);
				console.log(JSON.stringify(part, null, 2));
			});
		}

		// promptFeedbackがあれば表示
		if (response.promptFeedback) {
			console.log("\n=== プロンプトフィードバック ===");
			console.log(JSON.stringify(response.promptFeedback, null, 2));
		}
	} catch (error) {
		console.error("エラーが発生しました:", error);
		console.error("エラーメッセージ:", error.message);
		console.error("エラーの詳細:", error);
	}

	console.log("完了しました");
}

// メイン関数を実行
console.log("プログラムを開始します");
await main();
console.log("プログラムを終了します");
