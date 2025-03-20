const express = require("express");
const bodyParser = require("body-parser");
const app = express();
import { sendResponse } from "./response";

// Line Message API からのリクエストはJSON形式で送られてくるので、
// JSON形式のリクエストを解析できるようにする
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ルートエンドポイント - サーバーが起動していることを確認するため
app.get("/", (req: any, res: any) => {
	res.send("Line Message API Echo Server is running!");
});

// Line Messaging API からのWebhookを処理するエンドポイント
app.post("/webhook", (req: any, res: any) => {
	console.log("Received webhook:", JSON.stringify(req.body, null, 2));

	const textmessage = req.body.events[0].message.text;
	console.log(textmessage);
	console.log("Received webhook:", textmessage);

	// 応答メッセージを作成
	const replyToken = req.body.events[0].replyToken;
	const messages = [textmessage];
	const CHANNEL_ACCESS_TOKEN = process.env.CHANNEL_ACCESS_TOKEN;

	// 必要な情報が揃っているか確認
	if (!replyToken || !CHANNEL_ACCESS_TOKEN) {
		console.error("No replyToken found");
		return res.status(400).send("No replyToken found");
	}

	// LINE API にメッセージを送信
	sendResponse(replyToken, CHANNEL_ACCESS_TOKEN, messages)
		.then(() => {
			res.send("OK");
		})
		.catch((error) => {
			console.error("Error sending message to LINE:", error);
			res.status(500).send("Error");
		});
});

// サーバーのポート設定（Vercelではポート設定は無視されますが、ローカルテスト用に設定）
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});

// Vercelでデプロイするためにエクスポート
module.exports = app;
