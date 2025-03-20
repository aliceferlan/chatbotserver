export function verifyRequest(
    channelSecret: string,
    httpRequestBody: string,
    signature: string
): boolean {
    const crypto = require("crypto");
    const hash = crypto
        .createHmac("sha256", channelSecret)
        .update(Buffer.from(httpRequestBody, 'utf-8'))
        .digest("base64");
    return hash === signature;
}