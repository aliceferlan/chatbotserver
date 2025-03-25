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

import { saveReceipt, getReceipt, getUserReceipts } from "../Database/recipets";
import { Receipt } from "../types";
import { get } from "http";

export function getMessage(request: any): checkedResponse {

    const message = request.events[0].message.text;

    // メッセージの解析

    // 処理分岐

    const pattern = /テスト/

    if (pattern.test(message)) {
        const recipetData: Receipt = {
            userID: "test",
            recipetID: 1,
            date: "2021-09-01",
            shopName: "testShop",
            summaryPrice: 1000,
            items: [
                {
                    itemName: "testItem",
                    itemPrice: 1000
                }
            ]
        };

        saveReceipt(recipetData);

        console.log("レシートを保存しました");
        console.log(getReceipt("test"));

        return {
            type: "text",
            text: "レシートを保存しました"
        };
    }


    // 収入登録
    // 出費確認

    const pattern2 = /ユーザー確認/
    if (pattern2.test(message)) {
        const result = getReceipt("test");

        console.log(result);

        return {
            type: "text",
            text: "ユーザー確認"
        }
    }

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