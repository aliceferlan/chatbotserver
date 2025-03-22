import { checkedResponse } from "../types";

export function getImage(id: string): checkedResponse {

    // 画像のパスを取得

    // AIに画像を送信

    // AIからの返答を取得

    // DBにOCRデータを保存

    // 返答を返す
    return {
        type: "text",
        text: "画像を受け取りました"
    };
}

export function getMessage(request: any): checkedResponse {

    const message = request.events[0].message.text;

    // メッセージの解析

    // 処理分岐

    // 収入登録
    // 出費確認
    // 予算確認
    // ヘルプ

    // メッセージを返す
    return {
        type: "text",
        text: message
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