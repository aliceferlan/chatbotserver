import { GetCommand, PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { v4 as uuid } from "uuid";
import { Receipt } from "../types";
import { getDocumentClient } from "./dynamodb";

// レシートの取得
export async function getReceipt(userID: string): Promise<Receipt | null> {

    const docClient = getDocumentClient();

    const command = new GetCommand({
        TableName: "FinanceTable",
        Key: {
            userID
        }
    });

    try {
        const response = await docClient.send(command);
        return response.Item as Receipt || null;
    } catch (error) {
        console.error("Error fetching receipt:", error);
        throw error;
    }
}

// レシートの保存
export async function saveReceipt(receipt: Receipt): Promise<void> {
    // ドキュメントクライアントの取得
    const docClient = getDocumentClient();

    // レシートIDの生成
    receipt.recipetID = parseInt(uuid(), 10);

    // PutCommandの作成
    const command = new PutCommand({
        TableName: "smart-account-book",
        Item: receipt
    });

    // レシートの保存
    try {
        await docClient.send(command);
    } catch (error) {
        console.error("Error saving receipt:", error);
        throw error;
    }
}

// ユーザーのレシート一覧取得
export async function getUserReceipts(userID: string): Promise<Receipt[]> {
    const docClient = getDocumentClient();

    const command = new QueryCommand({
        TableName: "FinanceTable",
        KeyConditionExpression: "userID = :uid",
        ExpressionAttributeValues: {
            ":uid": userID
        }
    });

    try {
        const response = await docClient.send(command);
        return response.Items as Receipt[] || [];
    } catch (error) {
        console.error("Error querying receipts:", error);
        throw error;
    }
}