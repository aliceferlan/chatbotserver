const express = require("express");
const bodyParser = require("body-parser");
const app = express();
import { sendResponse } from "./Line/response";
import { verifyRequest } from "./Line/verifier";

// Line Message API からのリクエストはJSON形式で送られてくるので、
// JSON形式のリクエストを解析できるようにする
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ルートエンドポイント - サーバーが起動していることを確認するため
app.get("/", (req: any, res: any) => {
	res.send("Line Message API Echo Server is running!");
});


import { checkedResponse } from "./types";
import { checkRequestBody } from "./Line/verifier";
import { getUserReceiptByDateTime } from "./Database/recipets";
// Line Messaging API からのWebhookを処理するエンドポイント
app.post("/webhook", async (req: any, res: any) => {

	// リクエストの検証
	const channelSecret = process.env.CHANNEL_SECRET;
	if (channelSecret == undefined) {
		console.error("channel seacret env is none")
		return res.status(400).send("CHANNEL_SECRET is not set");
	}
	if (!verifyRequest(channelSecret, JSON.stringify(req.body), req.headers["x-line-signature"])) {
		console.error("Invalid request");
		return res.status(400).send("Invalid request");
	}

	// 応答メッセージを作成
	const replyToken = req.body.events[0].replyToken;
	const CHANNEL_ACCESS_TOKEN = process.env.CHANNEL_ACCESS_TOKEN;
	// 必要な情報が揃っているか確認
	if (!replyToken || !CHANNEL_ACCESS_TOKEN) {
		console.error("No replyToken found");
		return res.status(400).send("No replyToken found");
	}

	// 受信通知を送信
	sendResponse(replyToken, CHANNEL_ACCESS_TOKEN, ["受信しました"])
		.then(() => {
			res.send("OK");
		})
		.catch(error => {
			console.error("Error sending receipt notification:", error);
			res.status(500).send("Error");
		});

	// bodyの中身を確認
	console.log("Received webhook:", JSON.stringify(req.body, null, 2));

	const checkedRequest = await checkRequestBody(req.body);

	if (checkedRequest.type === "error") {
		console.log(checkedRequest.text);
		return res.status(200).send(checkedRequest.text);
	}

	console.log("Received webhook:", req.body.events[0]);
	console.log(checkedRequest.text);

	// DB照合処理API
	getUserReceiptByDateTime(
		req.body.events[0].source.userId,
		req.body.events[0].message.date,
		req.body.events[0].message.time
	).then(existingReceipt => {
		if (existingReceipt) {
			console.log("Receipt already exists in database");
		} else {
			console.log("Receipt not found in database");
			// 保存処理を実行
			saveReceipt({
				userID: req.body.events[0].source.userId,
				date: req.body.events[0].message.date,
				time: req.body.events[0].message.time,
				amount: req.body.events[0].message.amount,
				description: req.body.events[0].message.description,
			})
				.then(() => {
					console.log("Receipt saved successfully from webhook");
				})
				.catch(error => {
					console.error("Error saving receipt from webhook:", error);
				});
		}
	});

	// 応答メッセージを作成
	console.log("Sending response to LINE:", checkedRequest.text);
	console.log("Sending response to LINE:", replyToken);
	// LINE API にメッセージを送信
	sendResponse(replyToken, CHANNEL_ACCESS_TOKEN, [checkedRequest.text])
		.then(() => {
			res.send("OK");
		})
		.catch((error) => {
			console.error("Error sending message to LINE:", error);
			res.status(500).send("Error");
		});
});

import { saveReceipt } from "./Database/recipets";

app.post("/savedb", async (req: any, res: any) => {
	const CHANNEL_ACCESS_TOKEN = process.env.CHANNEL_ACCESS_TOKEN;
	// 必要な情報が揃っているか確認
	if (!CHANNEL_ACCESS_TOKEN) {
		console.error("No replyToken found");
		return res.status(400).send("No replyToken found");
	}
	const replyToken = req.body.events[0].replyToken;

	const receiptDate = req.body.events[0].message.date;
	const receiptTime = req.body.events[0].message.time;
	const userID = req.body.events[0].source.userId;
	const receiptAmount = req.body.events[0].message.amount; // 金額情報を追加
	const receiptDescription = req.body.events[0].message.description; // 説明情報を追加

	// DB照合処理
	if (await getUserReceiptByDateTime(userID, receiptDate, receiptTime)) {
		return res.status(200).send("Receipt already exists");
	}
	console.log("Received webhook:", req.body.events[0]);

	// 保存処理
	try {
		await saveReceipt({
			userID,
			date: receiptDate,
			time: receiptTime,
			amount: receiptAmount,
			description: receiptDescription,
		});
		console.log("Receipt saved successfully");
	} catch (error) {
		console.error("Error saving receipt:", error);
		return res.status(500).send("Error saving receipt");
	}

	// 受信通知を送信
	sendResponse(replyToken, CHANNEL_ACCESS_TOKEN, ["受信しました"])
		.then(() => {
			res.send("OK");
		})
		.catch(error => {
			console.error("Error sending receipt notification:", error);
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
