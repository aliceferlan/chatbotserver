import { checkedResponse } from "../types";
import { getRecieptData } from "../OCR/getRecieptData";
import { saveReceipt, getReceipt, getUserReceipts } from "../Database/recipets";
import { Receipt } from "../types";

function checkRecastReciept(response: string, userID: string): Receipt {

    console.log("checkRecastReciept running");

    console.log("response:", response);
    const recieptData = JSON.parse(response);

    const reciept: Receipt = {
        userID: userID,
        recipetID: 1,
        date: recieptData.日付,
        time: recieptData.時間,
        shopName: recieptData.店名,
        address: recieptData.住所,
        phone: recieptData.電話番号,
        summaryPrice: recieptData.合計,
        currencyUnit: recieptData.通貨単位,
        paymentMethod: recieptData.支払い方法,
        items: Array.isArray(recieptData.詳細)
            ? recieptData.詳細.map((item: any) => ({
                itemName: item.商品名 || "",
                itemPrice: item.単価 || 0,
                quantity: item.数量 || 1,
                category: item.カテゴリ || "",
            }))
            : []
    }
    console.log("reciept:", reciept);
    return reciept;
}


export async function getImage(request: any): Promise<checkedResponse> {

    console.log("getImage running");
    // 画像のパスを取得
    const messageID = request.events[0].message.id;

    console.log("getRecieptData running:", messageID);
    // AIに画像を送信
    // AIからの返答を取得
    const response = await getRecieptData(messageID);

    console.log("getRecieptData response:", response);
    // Response をReciept型に変換
    // DBにOCRデータを保存
    await saveReceipt(checkRecastReciept(JSON.stringify(response)[0], request.events[0].source.userId)
    );



    // 返答を返す
    return {
        type: "text",
        text: "OCR結果　:" + JSON.stringify(response)
    };
}

export async function getMessage(request: any): Promise<checkedResponse> {

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
        console.log("ユーザー確認メッセージ処理")
        const result = await getReceipt("test");

        console.log(result);

        console.log("ユーザー確認メッセージ処理完了")
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

export async function greetings(request: any): Promise<checkedResponse> {
    return {
        type: "text",
        text: "フォローありがとう！ よろしくね！"
    };
}

export async function getStamp(request: any): Promise<checkedResponse> {
    return {
        type: "text",
        text: "スタンプを受け取りました"
    };
}