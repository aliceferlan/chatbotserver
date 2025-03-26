export type checkedResponse = {
    type: string,
    text: string,
}


// レシートの型定義
export interface Receipt {
    userID: string;
    recipetID: number;
    date?: string;
    shopName?: string;
    summaryPrice?: number;
    items?: ReceiptItem[];
}

export interface ReceiptItem {
    itemName: string;
    itemPrice: number;
}

// 画像データの型定義
export interface ImageData {
    inlineData: {
        data: string;
        mimeType: string;
    };
}
