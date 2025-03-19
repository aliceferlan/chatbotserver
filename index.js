// index.js
const express = require("express");
const bodyParser = require("body-parser");
const crypto = require("crypto");
const app = express();

// 環境変数からチャネルシークレットを取得
const LINE_CHANNEL_SECRET = process.env.LINE_CHANNEL_SECRET;

// JSONリクエストの解析設定
app.use(
	bodyParser.json({
		verify: (req, res, buf) => {
			req.rawBody = buf;
		},
	})
);
app.use(bodyParser.urlencoded({ extended: true }));

// ルートエンドポイント
app.get("/", (req, res) => {
	res.send("Line Message API Echo Server is running!");
});

// Lineからのシグネチャを検証する関数
function validateSignature(signature, body) {
	const hmac = crypto.createHmac("SHA256", LINE_CHANNEL_SECRET);
	const bodyString = Buffer.isBuffer(body) ? body.toString() : body;
	hmac.update(bodyString);
	const generatedSignature = hmac.digest("base64");
	return signature === generatedSignature;
}

// Webhook処理エンドポイント
app.post("/webhook", (req, res) => {
	// シグネチャの取得
	const signature = req.headers["x-line-signature"];

	// シグネチャがない場合はエラー
	if (!signature) {
		console.log("Signature missing");
		return res.status(401).send("Signature required");
	}

	// シグネチャの検証（本番環境では必須）
	if (LINE_CHANNEL_SECRET && !validateSignature(signature, req.rawBody)) {
		console.log("Invalid signature");
		return res.status(401).send("Invalid signature");
	}

	console.log("Received webhook:", JSON.stringify(req.body, null, 2));

	// Line Messaging APIはリクエスト処理完了を示すために200 OKを早めに返す必要がある
	res.status(200).end();

	// リクエストを処理して応答メッセージを送信する
	// 実際には、ここで受け取ったイベントに基づいて処理を行い、
	// Line Messaging APIを使って返信を送信する必要があります
	handleWebhook(req.body);
});

// Webhookイベントを処理して返信を送る関数
async function handleWebhook(event) {
	console.log("Handling webhook event:", event);

	// イベントがある場合のみ処理
	if (event.events && event.events.length > 0) {
		const LINE_CHANNEL_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN;

		// 各イベントに対して処理
		for (const lineEvent of event.events) {
			// メッセージイベントの場合
			if (lineEvent.type === "message") {
				try {
					// 受信したメッセージをそのまま返す
					const response = {
						replyToken: lineEvent.replyToken,
						messages: [
							{
								type: lineEvent.message.type,
								text:
									lineEvent.message.text ||
									"メッセージを受け取りました",
							},
						],
					};

					// Line Messaging APIに返信を送信
					const result = await fetch(
						"https://api.line.me/v2/bot/message/reply",
						{
							method: "POST",
							headers: {
								"Content-Type": "application/json",
								Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
							},
							body: JSON.stringify(response),
						}
					);

					console.log("Reply sent:", await result.json());
				} catch (error) {
					console.error("Error sending reply:", error);
				}
			}
		}
	}
}

// サーバーのポート設定
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});

// Vercelでデプロイするためにエクスポート
module.exports = app;
