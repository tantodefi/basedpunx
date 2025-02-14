"use client";
import { useAccount } from "wagmi";
import { useMinter } from "./contexts/MinterContext";
import { chill_address, contract_address } from "@/config/consts";
import abi from "@/config/abi.json";
import { useTransition } from "react";
import { toast } from "sonner";
import { Loader } from "@/utils/icons/loader";
import lsp7 from "@lukso/lsp-smart-contracts/artifacts/LSP7DigitalAsset.json";
import { useUP } from "./contexts/UPContext";
import { createWalletClient, custom, parseEther, encodeFunctionData } from "viem";
import { lukso } from "viem/chains";

const MintButton = () => {
  const account = useAccount();
  const { isUPProvider, walletConnected, provider } = useUP();
  const { count, chill, setFrameImage, error } = useMinter();
  const [isPending, startTransition] = useTransition();

  // Mint function
  const mint = async () => {
    if (!isUPProvider || !walletConnected || !provider) {
      toast.error("Please connect with UP Browser Extension");
      return;
    }

    startTransition(async () => {
      setFrameImage("");
      try {
        const total = (parseInt(count) * 4.2).toFixed(1);

        // Create wallet client with UP provider
        const walletClient = createWalletClient({
          chain: lukso,
          transport: custom(provider)
        });

        // Get the account address
        const [address] = await walletClient.getAddresses();
        
        // Encode the mint function call
        const mintData = encodeFunctionData({
          abi: abi.abi,
          functionName: 'mint',
          args: [BigInt(count)]
        });

        // Send the transaction
        const hash = await walletClient.sendTransaction({
          account: address,
          to: contract_address,
          data: mintData,
          value: parseEther(total),
          chain: lukso,
        });

        // Wait for transaction
        const receipt = await walletClient.waitForTransactionReceipt({ hash });

        if (receipt.status === 'success') {
          toast.success("Minted!");

          // Get token IDs (using provider.request directly since we need to call a read method)
          const tokenIds = await provider.request({
            method: 'eth_call',
            params: [{
              to: contract_address,
              data: encodeFunctionData({
                abi: abi.abi,
                functionName: 'tokenIdsOf',
                args: [address]
              })
            }]
          });

          // Get the last token ID
          const tokens = tokenIds ? tokenIds[tokenIds.length - 1] : null;
          if (tokens) {
            setFrameImage(
              `https://ipfs.filebase.io/ipfs/QmSKbCkmib8koVyYA2Xum3hngzNCLVijFkiQBg23VHjcMV/BurntPunX_${parseInt(
                tokens.toString()
              )}.png`
            );
          }
        }
      } catch (e) {
        console.error("Mint error:", e);
        toast.error("Error minting: " + (e as Error).message);
      }
    });
  };

  // Chill Mint Function with viem
  const chillMint = async () => {
    if (!isUPProvider || !walletConnected || !provider) {
      toast.error("Please connect with UP Browser Extension");
      return;
    }

    startTransition(async () => {
      setFrameImage("");
      try {
        const total = parseInt(count) * 6969;
        
        // Create wallet client
        const walletClient = createWalletClient({
          chain: lukso,
          transport: custom(provider)
        });

        // Get the account address
        const [address] = await walletClient.getAddresses();

        // First authorize the operator
        const authorizeData = encodeFunctionData({
          abi: lsp7.abi,
          functionName: 'authorizeOperator',
          args: [contract_address, parseEther(total.toString()), "0x"]
        });

        const authHash = await walletClient.sendTransaction({
          account: address,
          to: chill_address,
          data: authorizeData,
          chain: lukso,
        });

        await walletClient.waitForTransactionReceipt({ hash: authHash });

        // Then do the chill mint
        const mintData = encodeFunctionData({
          abi: abi.abi,
          functionName: 'chillMint',
          args: [BigInt(count)]
        });

        const mintHash = await walletClient.sendTransaction({
          account: address,
          to: contract_address,
          data: mintData,
          chain: lukso,
        });

        const receipt = await walletClient.waitForTransactionReceipt({ hash: mintHash });

        if (receipt.status === 'success') {
          toast.success("Minted!");

          // Get token IDs
          const tokenIds = await provider.request({
            method: 'eth_call',
            params: [{
              to: contract_address,
              data: encodeFunctionData({
                abi: abi.abi,
                functionName: 'tokenIdsOf',
                args: [address]
              })
            }]
          });

          const tokens = tokenIds ? tokenIds[tokenIds.length - 1] : null;
          if (tokens) {
            setFrameImage(
              `https://ipfs.filebase.io/ipfs/QmSKbCkmib8koVyYA2Xum3hngzNCLVijFkiQBg23VHjcMV/BurntPunX_${parseInt(
                tokens.toString()
              )}.png`
            );
          }
        }
      } catch (e) {
        console.error("Mint error:", e);
        toast.error("Error minting: " + (e as Error).message);
      }
    });
  };

  if (account.isConnected) {
    return (
      <>
        <button
          onClick={chill ? chillMint : mint}
          disabled={isPending || error}
          className="max-h-12 digital text-sm tracking-widest gap-1 grow p-2 text-center border text-gold col-span-4 rounded-md flex items-center justify-center"
        >
          Mint{" "}
          {isPending ? (
            <Loader className="text-gold animate-spin w-3 h-3" />
          ) : (
            <div className="status bg-green-600 mb-1" />
          )}
        </button>
      </>
    );
  }

  return (
    <div className="max-h-12 digital text-sm tracking-widest gap-1 grow p-2 text-center border border-blue text-blue col-span-4 rounded-md flex items-center justify-center">
      Mint <div className="status bg-red-500 mb-1" />
    </div>
  );
};

export default MintButton;
