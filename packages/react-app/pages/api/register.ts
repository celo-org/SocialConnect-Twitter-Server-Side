import {
    federatedAttestationsContract,
    getIdentifier,
} from "@/utils/odisHelpers";
import { NextApiRequest, NextApiResponse } from "next";

const NOW_TIMESTAMP = Math.floor(new Date().getTime() / 1000);

async function registerIdentifier(twitterHandle: string, address: string) {
    try {
        const identifier = await getIdentifier(twitterHandle);

        let tx =
            await federatedAttestationsContract.registerAttestationAsIssuer(
                identifier,
                address,
                NOW_TIMESTAMP
            );

        let receipt = await tx.wait();
        return receipt;
    } catch (error) {
        return error;
    }
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method === "POST") {
        try {
            let { handle, address } = JSON.parse(req.body);
            let receipt = await registerIdentifier(
                handle as string,
                address as string
            );

            return res.status(201).json({
                receipt,
            });
        } catch (error) {
            return res.status(500).json({
                error,
            });
        }
    }

    return res.status(404);
}
