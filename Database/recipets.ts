import { PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { v4 as uuid } from "uuid";
import { Receipt } from "../types";
import { getDocumentClient } from "./dynamodb";

// レシート型の定義を補足


// レシートの取得
export async function getReceipt(userID: string): Promise<Receipt[] | null> {

    const docClient = getDocumentClient();

    const command = new QueryCommand({
        TableName: "smart-account-book",
        KeyConditionExpression: "userID = :userID",
        ExpressionAttributeValues: {
            ":userID": userID
        }
    });

    try {
        const response = await docClient.send(command);
        return response.Items as Receipt[] || null;
    } catch (error) {
        console.error("Error fetching receipt:", error);
        throw error;
    }
}

// レシートの保存
export async function saveReceipt(receipt: Receipt): Promise<void> {
    const docClient = getDocumentClient();

    // レシートIDの生成
    receipt.recipetID = parseInt(`${Date.now()}${Math.floor(Math.random() * 1000)}`, 10);
    console.log("Saving receipt:", receipt);

    const command = new PutCommand({
        TableName: "smart-account-book", // DynamoDBのテーブル名
        Item: receipt,
    });

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
        TableName: "smart-account-book",
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


// ユーザーのレシートから指定された日付と時間が一致するレシートを取得
export async function getUserReceiptByDateTime(userID: string, date: string, time: string): Promise<Receipt | null> {
    const docClient = getDocumentClient();

    console.log(`Querying receipt for userID: ${userID}, date: ${date}, time: ${time}`);

    // パーティションキー(userID)だけをKeyConditionExpressionで使用
    const command = new QueryCommand({
        TableName: "smart-account-book",
        KeyConditionExpression: "userID = :uid",
        FilterExpression: "#dateAttr = :dateValue AND #timeAttr = :timeValue", // 修正: 属性名と値を明確に
        ExpressionAttributeNames: {
            "#dateAttr": "date", // 修正: より明確な名前
            "#timeAttr": "time"  // 修正: より明確な名前
        },
        ExpressionAttributeValues: {
            ":uid": userID,
            ":dateValue": date,   // 修正: 値に明確な名前
            ":timeValue": time    // 修正: 値に明確な名前
        }
    });

    try {
        const response = await docClient.send(command);
        console.log(`Query response: ${JSON.stringify(response.Items)}`);
        return response.Items && response.Items.length > 0 ? (response.Items[0] as Receipt) : null;
    } catch (error) {
        console.error("Error querying receipts:", error);
        throw error;
    }
}