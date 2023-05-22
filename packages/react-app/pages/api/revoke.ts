import {
    federatedAttestationsContract,
    getIdentifier,
    issuer,
} from "@/utils/odisHelpers";

async function revokeIdentifier(twitterHandle: string, address: string) {
    try {
        const identifier = await getIdentifier(twitterHandle);

        let tx = await federatedAttestationsContract.revokeAttestation(
            identifier,
            issuer.address,
            address
        );

        let receipt = await tx.wait();
        return receipt;
    } catch (error) {
        return error;
    }
}

export default async function revoke(req, res) {
    try {
        if (req.method === "POST") {
            let { handle, address } = JSON.parse(req.body);
            let result = await revokeIdentifier(handle, address);
            return res.status(200).json({
                result,
            });
        }
    } catch (error) {
        return res.status(500).json({
            error,
        });
    }
    return res.status(404);
}
