import { checkedResponse } from "../types";

export function getImage(id: string): checkedResponse {
    return {
        type: "text",
        text: "画像を受け取りました"
    };

}


export function getMessage(request: any): checkedResponse {
    return {
        type: "text",
        text: request.events[0].message.text
    };
}

export function greetings(request: any): checkedResponse {
    return {
        type: "text",
        text: "フォローありがとう！ よろしくね！"
    };
}

export function getStamp(request: any): checkedResponse {
    return {
        type: "text",
        text: "スタンプを受け取りました"
    };
}