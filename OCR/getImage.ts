import { ImageData } from "../types";

// 画像ファイルをBase64エンコードする関数
// mimeType : image/png, image/jpeg image/gif image/webp etc...
async function fileToGenerativePart(fileURL: string, mimeType: string): Promise<ImageData> {
    console.log("run fileToGenerativePart");
    const axios = require("axios");
    const response = await axios.get(fileURL, { responseType: "arraybuffer" });
    const fileBuffer = Buffer.from(response.data);
    console.log("fileBuffer", fileBuffer);
    return {
        inlineData: {
            data: fileBuffer.toString("base64"),
            mimeType,
        },
    };
}

async function getImageLine(messageID: string): Promise<ImageData> {
    console.log("run getImageLine");
    const getImageURL = `https://api-data.line.me/v2/bot/message/${messageID}/content`

    return await fileToGenerativePart(getImageURL, "image/jpeg");
}

export default getImageLine;