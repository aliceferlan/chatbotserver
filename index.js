const express = require("express");
const bodyParser = require("body-parser");
const app = express();

// Line Message API からのリクエストはJSON形式で送られてくるので、
// JSON形式のリクエストを解析できるようにする
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ルートエンドポイント - サーバーが起動していることを確認するため
app.get("/", (req, res) => {
	res.send("Line Message API Echo Server is running!");
});

// Line Messaging API からのWebhookを処理するエンドポイント
app.post("/webhook", (req, res) => {
	console.log("Received webhook:", JSON.stringify(req.body, null, 2));

	// リクエストをそのままエコーとして返す
	res.json(req.body);
});

// サーバーのポート設定（Vercelではポート設定は無視されますが、ローカルテスト用に設定）
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});

// Vercelでデプロイするためにエクスポート
module.exports = app;
