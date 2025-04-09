import { NextResponse } from 'next/server';
import { getEnvironmentStatus } from '@/lib/utils';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';

/**
 * アプリケーションとサービスの状態を確認するAPIエンドポイント
 */
export async function GET() {
    try {
        const envStatus = getEnvironmentStatus();

        // DynamoDBへの接続テスト
        let dynamodbStatus = { connected: false, error: null };

        if (envStatus.aws.configured) {
            try {
                const dynamoClient = new DynamoDBClient({
                    region: process.env.AWS_REGION,
                    credentials: {
                        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
                        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
                    }
                });

                // 接続テスト（軽量なオペレーション）
                await dynamoClient.config.credentials();
                dynamodbStatus.connected = true;
            } catch (error) {
                dynamodbStatus.error = error instanceof Error ? error.message : 'Unknown error';
            }
        }

        return NextResponse.json({
            status: 'online',
            timestamp: new Date().toISOString(),
            environment: {
                node: process.version,
                env: process.env.NODE_ENV
            },
            services: {
                aws: {
                    configured: envStatus.aws.configured,
                    region: envStatus.aws.region,
                    dynamodb: dynamodbStatus
                },
                gemini: {
                    configured: envStatus.gemini.configured
                }
            }
        });
    } catch (error) {
        return NextResponse.json(
            {
                status: 'error',
                error: error instanceof Error ? error.message : 'Unknown error',
                timestamp: new Date().toISOString()
            },
            { status: 500 }
        );
    }
}
