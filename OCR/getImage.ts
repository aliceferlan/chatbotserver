export async function getImageLine(request: any): Promise<string> {

    const messageID = "hello"
    const getImageURL = `https://api-data.line.me/v2/bot/message/${messageID}/content`


    return "画像を受け取りました";
}