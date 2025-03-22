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

// bodyの中身を確認
import { checkedResponse } from "../types";
import { getImage, getMessage, greetings, getStamp } from "./getMessage";
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

    // Events.typeがmessage以外の場合はエラー
    if (request.events[0].type !== "message") {
        console.log("No events found. its Verify the request is a valid LINE Messaging API event.");
        return {
            type: "error",
            text: "Event type is not message. Verify the request is a valid LINE Messaging API event."
        };
    }

    // events.message.typeを取得
    const eventType = request.events[0].message.type;

    if (eventType === "text") {
        console.log("text event found");
        return getMessage(request);
    }
    if (eventType === "image") {
        console.log("image event found");
        return getImage(request);
    }
    if (eventType === "follow") {
        console.log("follow event found");
        return greetings(request);
    }
    if (eventType === "sticker") {
        console.log("sticker event found");
        return getStamp(request);
    }

    return {
        type: "error",
        text: "No events found. Verify the request is a valid LINE Messaging API event."
    };
}
