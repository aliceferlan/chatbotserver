import fs from "fs";
import { ImageData } from "../types";

// 画像ファイルをBase64エンコードする関数
// mimeType : image/png, image/jpeg image/gif image/webp etc...
function fileToGenerativePart(filePath: string, mimeType: string): ImageData {
    const fileBuffer = fs.readFileSync(filePath);
    return {
        inlineData: {
            data: fileBuffer.toString("base64"),
            mimeType,
        },
    };
}


export async function getImageLine(request: any): Promise<string> {

    const messageID = "hello"
    const getImageURL = `https://api-data.line.me/v2/bot/message/${messageID}/content`


    return "画像を受け取りました";
}