import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useEffect, useState } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { useAccount } from "wagmi";
import { toast } from "react-hot-toast";

export default function Home({}) {
    const [isLoaded, setIsLoaded] = useState(false);
    const [lookupValue, setLookupValue] = useState("");
    const [lookupResult, setLookupResult] = useState([]);

    const { isConnected, address } = useAccount();
    const { data: session, status } = useSession();

    useEffect(() => {
        setIsLoaded(true);
    }, []);

    if (!isLoaded) {
        return null;
    }

    function handleLookupValueChange({ target }) {
        let { value } = target;
        setLookupValue(value);
    }

    async function handleRegister() {
        let toastId = toast.loading("Loading...");

        let response = await fetch("/api/register", {
            method: "POST",
            body: JSON.stringify({
                handle: session.username.toLowerCase(),
                address,
            }),
        });

        let result = response.json();
        if (result.error) toast.error("😞 Not Registered", { id: toastId });
        else toast.success("🔥 Registered", { id: toastId });
    }

    async function handleLookup() {
        let toastId = toast.loading("🔎 Searching....");

        let response = await fetch(
            `/api/lookup?${new URLSearchParams({ handle: lookupValue })}`,
            {
                method: "GET",
            }
        );

        let { result } = await response.json();
        setLookupResult(result);
        if (result.length > 0) {
            toast.dismiss(toastId);
        } else {
            toast.error("No result", { id: toastId });
        }
    }

    async function handleRevoke() {
        let toastId = toast.loading("Loading...");
        let response = await fetch("/api/revoke", {
            method: "POST",
            body: JSON.stringify({
                handle: session.username.toLowerCase(),
                address,
            }),
        });

        let { result } = await response.json();
        console.log(result);
        if (result.error) {
            toast.error("Failed", { id: toastId });
        } else {
            toast.success("Revoked", { id: toastId });
        }
    }

    return (
        <div className="flex flex-col space-y-4">
            <div className="flex space-x-4">
                <div className="w-[400px] border border-black p-4 flex-col flex space-y-2">
                    <h2>Registration</h2>
                    <div className="border w-full space-y-4 p-4 flex items-center flex-col border-black">
                        {isConnected && <h3>Connected as:</h3>}
                        <ConnectButton showBalance={false} />
                    </div>
                    <div className="border w-full space-y-4 p-4 flex flex-col border-black">
                        {status === "unauthenticated" ? (
                            <button
                                onClick={() => signIn("twitter")}
                                className="border-2 border-black px-4 py-2"
                            >
                                Sign in with Twitter
                            </button>
                        ) : status === "loading" ? (
                            <h1>Loading...</h1>
                        ) : (
                            <>
                                <h3>Signed as:</h3>
                                <div className="flex space-x-2 w-full items-center">
                                    <img
                                        style={{
                                            width: "50px",
                                            height: "50px",
                                            borderRadius: "100%",
                                        }}
                                        src={session!.user?.image as string}
                                    />
                                    <div className="flex flex-col">
                                        <h2>{session!.user!.name}</h2>
                                        <h3>{`@${session!.username.toLowerCase()}`}</h3>
                                    </div>
                                </div>
                                <div className="flex flex-col w-full space-y-2">
                                    <button
                                        className="border-2 border-black px-4 py-2"
                                        onClick={() => signOut()}
                                    >
                                        Sign Out
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                    {isConnected && status === "authenticated" && (
                        <button
                            onClick={handleRegister}
                            className="border-2 border-black px-4 py-2"
                        >
                            Link Wallet
                        </button>
                    )}
                </div>
                <div className="w-[400px] border justify-between border-black p-4 flex-col flex space-y-2">
                    <div className="flex flex-col space-y-2">
                        <h2>Lookup</h2>
                        <input
                            className="border border-black px-4 py-2"
                            placeholder="Twitter handle only (not @)"
                            value={lookupValue}
                            onChange={handleLookupValueChange}
                        />
                    </div>
                    <div className="flex flex-col justify-start h-full">
                        {lookupResult.map((address) => {
                            return (
                                <div className="flex border py-2 px-4 border-black">
                                    <a
                                        href={`https://explorer.celo.org/address/${address}`}
                                        target="_blank"
                                        key={address}
                                    >
                                        <h4 className="underline">{`${(
                                            address as string
                                        ).slice(0, 10)}...${(
                                            address as string
                                        ).slice(-10)}`}</h4>
                                    </a>
                                </div>
                            );
                        })}
                    </div>
                    <button
                        onClick={handleLookup}
                        className="border-2 border-black px-4 py-2"
                        disabled={lookupValue == ""}
                    >
                        Search
                    </button>
                </div>
                <div className="w-[400px] border border-black p-4 flex-col flex space-y-2">
                    <h2>Revoke</h2>
                    <div className="border w-full space-y-4 p-4 flex items-center flex-col border-black">
                        {isConnected && <h3>Connected as:</h3>}
                        <ConnectButton showBalance={false} />
                    </div>
                    <div className="border w-full space-y-4 p-4 flex flex-col border-black">
                        {status === "unauthenticated" ? (
                            <button
                                onClick={() => signIn("twitter")}
                                className="border-2 border-black px-4 py-2"
                            >
                                Sign in with Twitter
                            </button>
                        ) : status === "loading" ? (
                            <h1>Loading...</h1>
                        ) : (
                            <>
                                <h3>Signed as:</h3>
                                <div className="flex space-x-2 w-full items-center">
                                    <img
                                        style={{
                                            width: "50px",
                                            height: "50px",
                                            borderRadius: "100%",
                                        }}
                                        src={session!.user?.image as string}
                                    />
                                    <div className="flex flex-col">
                                        <h2>{session!.user!.name}</h2>
                                        <h3>{`@${session!.username.toLowerCase()}`}</h3>
                                    </div>
                                </div>
                                <div className="flex flex-col w-full space-y-2">
                                    <button
                                        className="border-2 border-black px-4 py-2"
                                        onClick={() => signOut()}
                                    >
                                        Sign Out
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                    {isConnected && status === "authenticated" && (
                        <button
                            onClick={handleRevoke}
                            className="border-2 border-black px-4 py-2"
                        >
                            Unlink Wallet
                        </button>
                    )}
                </div>
            </div>
            {/* {issuer && (
                <div className="border flex py-2 justify-center border-black">
                    <h3>
                        Issuer Address:{" "}
                        <a
                            href={`https://explorer.celo.org/alfajores/address/${issuer.address}`}
                            className="underline"
                            target="_blank"
                        >
                            {issuer.address}
                        </a>
                    </h3>
                </div>
            )} */}
        </div>
    );
}
