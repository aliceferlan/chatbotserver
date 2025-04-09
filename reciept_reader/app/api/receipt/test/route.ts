import { NextRequest, NextResponse } from 'next/server';
import { saveReceipt } from '@/lib/db/receipts';
import { Receipt } from '@/lib/types';

// テスト用のレシート保存APIエンドポイント
export async function POST(req: NextRequest) {
    try {
        const data = await req.json();

        if (!data.userID || !data.date || !data.time || data.amount === undefined) {
            return NextResponse.json(
                { error: '必須項目が不足しています' },
                { status: 400 }
            );
        }

        // リクエストからReceiptオブジェクトを作成
        const receipt: Receipt = {
            userID: data.userID,
            date: data.date,
            time: data.time,
            shopName: data.shopName || 'テスト店舗',
            amount: data.amount,
            description: data.description || 'テスト用レシート',
            items: data.items || [
                {
                    itemName: 'テスト商品',
                    itemPrice: data.amount,
                    quantity: 1,
                    category: 'テスト'
                }
            ]
        };

        // DBに保存
        await saveReceipt(receipt);

        return NextResponse.json({
            success: true,
            message: 'テスト用レシートが保存されました',
            receiptID: receipt.recipetID
        });

    } catch (error) {
        console.error('テスト用レシート保存中のエラー:', error);
        return NextResponse.json(
            {
                error: 'テスト用レシート保存中にエラーが発生しました',
                details: error instanceof Error ? error.message : String(error)
            },
            { status: 500 }
        );
    }
}
