import {
    federatedAttestationsContract,
    getIdentifier,
    issuer,
} from "@/utils/odisHelpers";

async function lookupAddresses(twitterHandle: string) {
    try {
        const obfuscatedIdentifier = await getIdentifier(twitterHandle);

        // query onchain mappings
        const attestations =
            await federatedAttestationsContract.lookupAttestations(
                obfuscatedIdentifier,
                [issuer.address]
            );
        console.log(attestations);

        return attestations.accounts;
    } catch (error) {
        return error;
    }
}

export default async function handler(req, res) {
    if (req.method === "GET") {
        try {
            let { handle } = req.query;
            console.log(handle);
            let result = await lookupAddresses(handle);

            return res.status(200).json({
                result,
            });
        } catch (error) {
            return res.status(500).json({
                error,
            });
        }
    }
    return res.status(404);
}
