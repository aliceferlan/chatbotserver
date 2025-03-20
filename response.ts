import { promises } from "dns";

export function sendResponse(replyToken: string, CHANNEL_ACCESS_TOKEN: string, messages: string[]): Promise<void> {
	const url = "https://api.line.me/v2/bot/message/reply";

	const messagesBody = messages.map((message) => {
		return {
			type: "text",
			text: message,
		};
	});

	const headers = {
		"Content-Type": "application/json",
		Authorization: "Bearer " + CHANNEL_ACCESS_TOKEN,
	};

	const body = {
		replyToken: replyToken,
		messages: messagesBody,
	};

	// Send the HTTP request
	return fetch(url, {
		method: "POST",
		headers: headers,
		body: JSON.stringify(body),
	})
		.then((response) => {
			if (!response.ok) {
				return response.json().then((errorData) => {
					throw new Error(
						`LINE API Error: ${response.status} ${JSON.stringify(
							errorData
						)}`
					);
				});
			}
			return response.json();
		})
		.catch((error) => {
			console.error("Error sending message to LINE:", error);
			throw error;
		});
}
