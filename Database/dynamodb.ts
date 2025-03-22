// db/dynamodb.ts
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

// シングルトンインスタンス
let docClientInstance: DynamoDBDocumentClient | null = null;

export function getDocumentClient(): DynamoDBDocumentClient {
    if (docClientInstance) {
        return docClientInstance;
    }

    const client = new DynamoDBClient({
        region: process.env.AWS_REGION,
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ""
        }
    });

    docClientInstance = DynamoDBDocumentClient.from(client, {
        marshallOptions: {
            // 必要に応じてオプションを設定
            convertEmptyValues: true,
            removeUndefinedValues: true,
        }
    });

    return docClientInstance;
}