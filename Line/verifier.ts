export function verifyRequest(
    channelSecret: string,
    httpRequestBody: string,
    signature: string
): boolean {
    const crypto = require("crypto");
    const hash = crypto
        .createHmac("sha256", channelSecret)
        .update(Buffer.from(httpRequestBody, 'utf-8'))
        .digest("base64");
    return hash === signature;
}



import { checkedResponse } from "../types";
import { getImage, getMessage, greetings, getStamp } from "./getMessage";

// bodyの中身を確認
export function checkRequestBody(
    request: any
): checkedResponse {
    // Eventsがない場合はエラー
    if (request.events.length === 0) {
        console.log("No events found. its Verify the request is a valid LINE Messaging API event.");
        return {
            type: "error",
            text: "No events found. Verify the request is a valid LINE Messaging API event."
        };
    }


    // events.typeを取得
    const eventType = request.events[0].type;

    if (eventType === "text") {
        return getMessage(request);
    }
    if (eventType === "image") {
        return getImage(request);
    }
    if (eventType === "follow") {
        return greetings(request);
    }
    if (eventType === "sticker") {
        return getStamp(request);
    }

    const textmessage = request.events[0].message.text;
    console.log(textmessage);
    console.log("Received webhook:", textmessage);

    // 応答メッセージを作成
    if (request.events[0].message.type !== "text") {
    }
    const replyToken = request.events[0].replyToken;
    const messages = [textmessage];

    return {
        type: "text",
        text: textmessage
    };

}
