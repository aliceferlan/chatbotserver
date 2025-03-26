import { getImage } from "../Line/getMessage";
import { RecieptResponse, RecieptErrorResponse } from "../types";
import getImageLine from "./getImage";
import sendRequestToAI from "./requestToAI";
import { ImageData } from "../types";

export async function getRecieptData(messageID: string): Promise<RecieptResponse | RecieptErrorResponse> {
    const imageData = await getImageLine(messageID);
    const responseData = await sendRequestToAI(imageData);
    return responseData;
}