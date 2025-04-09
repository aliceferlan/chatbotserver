export type checkedResponse = {
    type: string,
    text: string,
}

// レシートの型定義
export interface Receipt {
    userID: string;
    recipetID?: number;
    date: string;
    time: string;
    shopName?: string;
    phone?: string;
    address?: string;
    summaryPrice?: number;
    currencyUnit?: string;
    paymentMethod?: string;
    items?: ReceiptItem[];
    amount: number; // 金額
    description: string; // 説明
}

export interface ReceiptItem {
    itemName: string;
    itemPrice: number;
    quantity?: number;
    category?: string;
}

export interface RecieptResponse {
    // AIからの応答内容に合わせて修正
    店名?: string;
    住所?: string;
    電話番号?: string;
    日付?: string;
    時間?: string;
    詳細?: Array<{
        商品名?: string;
        個数?: number;
        単価?: number;
        カテゴリ?: string;
    }>;
    合計?: number;
    説明?: string;
    通貨単位?: string;
    支払い方法?: string;
}

export interface RecieptErrorResponse {
    error: string;
    contentType: string;
    suggestion: string;
}

// 画像データの型定義
export interface ImageData {
    inlineData: {
        data: string;
        mimeType: string;
    };
}
