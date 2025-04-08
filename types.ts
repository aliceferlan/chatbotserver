export type checkedResponse = {
    type: string,
    text: string,
}


// レシートの型定義
export interface Receipt {
    userID: string;
    recipetID?: string;
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
    shopName: string;
    date: string;
    time: string;
    items: [
        {
            name: string;
            price: number;
        }
    ];
    total: number;
    paymentMethod: string;
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
