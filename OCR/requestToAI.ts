import { GoogleGenAI } from "@google/genai";
import { ImageData, RecieptResponse, RecieptErrorResponse } from '../types';

function prompt(): string {
    return `あなたはレシート解析の専門家です。 提供された画像が購入レシートかどうかを判断し、適切な処理をして。 【タスク】 1. まず、画像が購入レシート（会計明細）かどうかを判断する。 2. 購入レシートの場合のみ、情報を抽出してJSON形式で返す。 3. 購入レシートが複数ある場合は次のように場合分けして抽出する 3,1. それぞれがレシートの特徴を満たすなら、別の店のレシートとしてデータを分ける。 3,2. それぞれがレシートの特徴を満たさず、かつ全てを合わせることでレシートの特徴を満たすなら、全てを1つのレシートとしてみなす。 3,3. それぞれがレシートの特徴を満たさず、全てを合わせることでもレシートの特徴を満たさないなら、エラー情報を返す。 4. 購入レシートでない場合（商品説明、成分表示、メニュー、広告など）は、エラー情報を返す。 【レシートの特徴】 - 店舗名、日付、時間が記載されている - 購入した商品名と金額の一覧がある - 合計金額が記載されている - 支払い方法の記載がある場合が多い - 「領収書」「レシート」「お買い上げ明細」などの文言がある 【出力形式】 レシートの場合:データ: [{ "店名": "店名 支店名", "住所": "店舗住所", "電話番号": "000-0000-0000", "日付": "YYYY / MM / DD", "時間": "HH:MM", "詳細": [ {"商品名": "商品名1", "個数": 0, "単価": 金額1, "カテゴリ": "食品|日用品|外食|精密機器|etc"}, {"商品名": "商品名2", "個数": 0, "単価": 金額2, "カテゴリ": "食品|日用品|外食|精密機器|etc"}], "合計": 合計金額, "説明": レシートの20文字程度の概要 "通貨単位": "JPY|USD|CNY|etc...", "支払い方法": "現金 | クレジットカード | 電子マネーの種類" }] レシートでない場合:{ "error": "この画像はレシートではありません", "detected_content_type": "検出されたコンテンツタイプ(例: 商品説明、成分表示、メニュー、広告など)", "suggestion": "購入時に発行される会計明細書（レシート）の画像をアップロードしてください" } 【注意点】 読み取れない箇所は該当フィールドを空白または0とする。 不明な支払い方法は「不明」と記載する。`;
}

async function send(imageInput: ImageData, model: string): Promise<string> {

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    const promptText = prompt();

    try {

        // Gemini APIクライアントを初期化
        const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

        // リクエストを送信
        const response = await ai.models.generateContent({
            model: model,
            contents: [
                {
                    parts: [{ text: promptText }, imageInput]
                }
            ]
        })

        if (response.text) {
            return response.text;
        }
        return ""
    } catch (error) {
        console.error('Error sending request to AI:', error);
        throw error;
    }
};

function removeJsonMarkdown(input: string): string {
    // 正規表現を使用して、先頭の```jsonと最後の```を削除
    return input.trim().replace(/^```json\s*/, '').replace(/\s*```$/, '').trim();
}


async function sendRequestToAI(input: ImageData): Promise<RecieptResponse | RecieptErrorResponse> {

    // const response = await send(input, "gemini-2.0-flash");
    const response = await send(input, "gemini-1.5-flash");

    const responseJson = JSON.parse(removeJsonMarkdown(response));

    return responseJson;
    if ('error' in responseJson || 'data' in responseJson) {
    }

    const reResponse = await send(input, "gemini-1.5-pro");
    const reResponseJson = JSON.parse(removeJsonMarkdown(reResponse));
    return reResponseJson;
}

export default sendRequestToAI;