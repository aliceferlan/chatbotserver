// index.js
const express = require("express");
const bodyParser = require("body-parser");
const crypto = require("crypto");
const app = express();

// 環境変数からチャンネルシークレットを取得
const LINE_CHANNEL_SECRET =
	process.env.LINE_CHANNEL_SECRET || "your_channel_secret";

// body-parserの設定
// 「raw」形式のデータを取得できるように設定
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
	res.send("Line Message API Echo Server is running! v0.3");
});

// Line Messaging API からのWebhookを処理するエンドポイント
app.post("/webhook", (req, res) => {
	console.log("リクエスト受信:", JSON.stringify(req.body, null, 2));
	console.log("ヘッダー:", JSON.stringify(req.headers, null, 2));

	try {
		// リクエストの署名を検証
		const signature = req.headers["x-line-signature"];

		// 署名検証をスキップするデバッグモード（開発時のみ使用）
		const isDebugMode = process.env.DEBUG_MODE === "true";

		if (!isDebugMode && !verifySignature(req.rawBody, signature)) {
			console.log("署名検証失敗");
			return res.status(401).send("Invalid signature");
		}

		// Line からのイベントを処理
		const events = req.body.events || [];
		console.log(`${events.length} 件のイベントを受信`);

		// レスポンスメッセージの作成
		const responseMessages = [];

		events.forEach((event) => {
			if (event.type === "message" && event.message.type === "text") {
				// テキストメッセージの場合、受信したメッセージをそのまま返す
				responseMessages.push({
					type: "text",
					text: `受信したメッセージ: ${event.message.text}`,
				});
			}
		});

		// Lineへの応答用のリプライトークンがあれば応答メッセージを送信
		if (
			events.length > 0 &&
			events[0].replyToken &&
			responseMessages.length > 0
		) {
			const replyToken = events[0].replyToken;

			// 応答メッセージをコンソールに表示（デバッグ用）
			console.log(
				"応答メッセージ:",
				JSON.stringify(
					{
						replyToken: replyToken,
						messages: responseMessages,
					},
					null,
					2
				)
			);

			// HTTPステータス200を返して処理完了を通知
			res.status(200).end();

			// Line Messaging API にリプライを送信
			// 実際の実装では、ここで別途Line Messaging APIを呼び出す処理を書く
			sendReply(replyToken, responseMessages);
		} else {
			// イベントがない場合や応答不要の場合は200を返す
			res.status(200).end();
		}
	} catch (error) {
		console.error("エラー発生:", error);
		res.status(500).send("Internal Server Error");
	}
});

// 署名検証関数
function verifySignature(body, signature) {
	if (!signature) return false;

	const hmac = crypto.createHmac("sha256", LINE_CHANNEL_SECRET);
	const digest = hmac.update(body).digest("base64");
	return digest === signature;
}

// Line Messaging API にリプライを送信する関数
async function sendReply(replyToken, messages) {
	// この部分は実際のプロジェクトで実装する
	// ここでは簡易的に実装を示す
	console.log(
		`リプライトークン ${replyToken} に対してメッセージを送信します`
	);

	// 実際には以下のようなコードでAPIを呼び出す
	/*
  const axios = require('axios');
  try {
    const response = await axios.post('https://api.line.me/v2/bot/message/reply', {
      replyToken: replyToken,
      messages: messages
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`
      }
    });
    console.log('応答送信成功:', response.data);
  } catch (error) {
    console.error('応答送信失敗:', error.response ? error.response.data : error.message);
  }
  */
}

// サーバーのポート設定
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
	console.log(`サーバーがポート ${PORT} で起動しました`);
});

// Vercelでデプロイするためにエクスポート
module.exports = app;
