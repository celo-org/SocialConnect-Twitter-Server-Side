import { Wallet, ethers } from "ethers";
import {
    ACCOUNTS_CONTRACT,
    ACCOUNTS_PROXY_ADDRESS,
    ALFAJORES_CUSD_ADDRESS,
    FA_CONTRACT,
    FA_PROXY_ADDRESS,
    ODIS_PAYMENTS_CONTRACT,
    ODIS_PAYMENTS_PROXY_ADDRESS,
    STABLE_TOKEN_CONTRACT,
    ALFAJORES_RPC,
} from "../utils/constants";
import { OdisUtils } from "@celo/identity";
import {
    AuthenticationMethod,
    OdisContextName,
} from "@celo/identity/lib/odis/query";
import { IdentifierPrefix } from "@celo/identity/lib/odis/identifier";

export let provider = new ethers.providers.JsonRpcProvider(ALFAJORES_RPC);
export let issuer = new Wallet(
    process.env.ISSUER_PRIVATE_KEY as string,
    provider
);
export let serviceContext = OdisUtils.Query.getServiceContext(
    OdisContextName.ALFAJORES
);
export let ONE_CENT_CUSD = ethers.utils.parseEther("0.01");

export let authSigner = {
    authenticationMethod: AuthenticationMethod.ENCRYPTION_KEY,
    rawKey: process.env.DEK_PRIVATE_KEY as string,
};
export let accountsContract = new ethers.Contract(
    ACCOUNTS_PROXY_ADDRESS,
    ACCOUNTS_CONTRACT.abi,
    issuer
);
export let federatedAttestationsContract = new ethers.Contract(
    FA_PROXY_ADDRESS,
    FA_CONTRACT.abi,
    issuer
);
export let odisPaymentsContract = new ethers.Contract(
    ODIS_PAYMENTS_PROXY_ADDRESS,
    ODIS_PAYMENTS_CONTRACT.abi,
    issuer
);
export let stableTokenContract = new ethers.Contract(
    ALFAJORES_CUSD_ADDRESS,
    STABLE_TOKEN_CONTRACT.abi,
    issuer
);

export async function checkAndTopUpODISQuota() {
    const { remainingQuota } = await OdisUtils.Quota.getPnpQuotaStatus(
        issuer?.address,
        authSigner,
        serviceContext
    );
    console.log(remainingQuota);

    if (remainingQuota < 1) {
        const currentAllowance = await stableTokenContract.allowance(
            issuer.address,
            odisPaymentsContract.address
        );
        console.log("current allowance:", currentAllowance.toString());
        let enoughAllowance: boolean = false;

        if (ONE_CENT_CUSD.gt(currentAllowance)) {
            const approvalTxReceipt = (
                await stableTokenContract.increaseAllowance(
                    odisPaymentsContract.address,
                    ONE_CENT_CUSD
                )
            ).sendAndWaitForReceipt();
            console.log("approval status", approvalTxReceipt.status);
            enoughAllowance = approvalTxReceipt.status;
        } else {
            enoughAllowance = true;
        }

        // increase quota
        if (enoughAllowance) {
            const odisPayment = (
                await odisPaymentsContract.payInCUSD(
                    issuer.address,
                    ONE_CENT_CUSD
                )
            ).sendAndWaitForReceipt();
            console.log("odis payment tx status:", odisPayment.status);
            console.log("odis payment tx hash:", odisPayment.transactionHash);
        } else {
            throw "cUSD approval failed";
        }
    }
}

export async function getIdentifier(twitterHandle: string) {
    try {
        await checkAndTopUpODISQuota();

        const { obfuscatedIdentifier } =
            await OdisUtils.Identifier.getObfuscatedIdentifier(
                twitterHandle,
                IdentifierPrefix.TWITTER,
                issuer.address,
                authSigner,
                serviceContext
            );

        return obfuscatedIdentifier;
    } catch (e) {
        console.log(e);
    }
}
