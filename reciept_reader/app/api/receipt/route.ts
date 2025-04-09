import { NextRequest, NextResponse } from 'next/server';
import { processReceipt } from '@/lib/ocr/processReceipt';
import { ImageData } from '@/lib/types';
import { getUserReceipts } from '@/lib/db/receipts';
import { checkRequiredEnvVars } from '@/lib/utils';

// 画像アップロードとOCR処理のエンドポイント
export async function POST(req: NextRequest) {
    try {
        // 環境変数チェック
        const envCheck = checkRequiredEnvVars();
        if (!envCheck.success) {
            return NextResponse.json(
                { error: '環境変数が設定されていません', details: envCheck.errors },
                { status: 500 }
            );
        }

        const formData = await req.formData();
        const imageFile = formData.get('image') as File;
        const userID = formData.get('userID') as string;
        const debug = formData.get('debug') === 'true';

        if (!imageFile || !userID) {
            return NextResponse.json(
                { error: '画像ファイルとユーザーIDが必要です' },
                { status: 400 }
            );
        }

        // ファイルをBase64エンコードする
        const bytes = await imageFile.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const base64 = buffer.toString('base64');

        // 画像データの作成
        const imageData: ImageData = {
            inlineData: {
                data: base64,
                mimeType: imageFile.type
            }
        };

        // デバッグモードの場合は追加情報を返す
        if (debug) {
            console.log(`処理する画像: ${imageFile.name}, サイズ: ${imageFile.size} bytes, タイプ: ${imageFile.type}`);
        }

        // レシート処理
        const result = await processReceipt(imageData, userID);

        // デバッグ情報を追加
        if (debug && !('error' in result)) {
            return NextResponse.json({
                ...result,
                debug: {
                    processedAt: new Date().toISOString(),
                    imageInfo: {
                        fileName: imageFile.name,
                        fileSize: imageFile.size,
                        fileType: imageFile.type
                    }
                }
            });
        }

        return NextResponse.json(result);

    } catch (error) {
        console.error('Receipt processing error:', error);
        return NextResponse.json(
            { error: 'レシート処理中にエラーが発生しました', details: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}

// ユーザーのレシート一覧を取得するエンドポイント
export async function GET(req: NextRequest) {
    try {
        const searchParams = req.nextUrl.searchParams;
        const userID = searchParams.get('userID');

        if (!userID) {
            return NextResponse.json(
                { error: 'ユーザーIDが必要です' },
                { status: 400 }
            );
        }

        const receipts = await getUserReceipts(userID);
        return NextResponse.json(receipts);

    } catch (error) {
        console.error('Error fetching receipts:', error);
        return NextResponse.json(
            { error: 'レシート取得中にエラーが発生しました', details: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}
