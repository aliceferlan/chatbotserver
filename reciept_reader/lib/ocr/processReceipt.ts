import { Receipt, ImageData, RecieptResponse, RecieptErrorResponse } from "../types";
import { sendRequestToAI } from "./requestToAI";
import { saveReceipt } from "../db/receipts";

export function convertToReceipt(response: any, userID: string): Receipt {
    console.log("convertToReceipt running");
    console.log("response:", response);

    // レスポンスが配列の場合は最初の要素を使用
    const recieptData = Array.isArray(response) ? response[0] : response;

    const receipt: Receipt = {
        userID: userID,
        recipetID: undefined, // 保存時に自動生成される
        date: recieptData.日付 || "",
        time: recieptData.時間 || "",
        shopName: recieptData.店名 || "",
        address: recieptData.住所 || "",
        phone: recieptData.電話番号 || "",
        summaryPrice: recieptData.合計 || 0,
        currencyUnit: recieptData.通貨単位 || "JPY",
        paymentMethod: recieptData.支払い方法 || "不明",
        amount: recieptData.合計 || 0,
        description: recieptData.説明 || "",
        items: Array.isArray(recieptData.詳細)
            ? recieptData.詳細.map((item: any) => ({
                itemName: item.商品名 || "",
                itemPrice: item.単価 || 0,
                quantity: item.個数 || 1,
                category: item.カテゴリ || "",
            }))
            : []
    };

    console.log("Converted receipt:", receipt);
    return receipt;
}

export async function processReceipt(imageData: ImageData, userID: string): Promise<Receipt | RecieptErrorResponse> {
    try {
        // AIからの解析結果を取得
        const response = await sendRequestToAI(imageData);

        // エラーの場合はそのまま返す
        if ('error' in response) {
            return response;
        }

        // レシート型に変換
        const receipt = convertToReceipt(response, userID);

        // DBに保存
        await saveReceipt(receipt);

        return receipt;
    } catch (error) {
        console.error("Error processing receipt:", error);
        return {
            error: "レシート処理中にエラーが発生しました",
            contentType: "システムエラー",
            suggestion: "再度お試しいただくか、システム管理者にお問い合わせください"
        };
    }
}
