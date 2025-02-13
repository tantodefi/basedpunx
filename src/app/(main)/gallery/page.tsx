"use client";
import Link from "next/link";
import { getProfile, getTokens } from "@/actions/contract";
import GridItem from "@/components/layout/GridItem";
import Image from "next/image";
import { useAccount } from "wagmi";
import { useEffect, useState } from "react";
import ConnectButton from "@/components/ConnectButton";
import { Copy } from "@/utils/icons/copy";
import { toast } from "sonner";
import { ErrorBoundary } from '@/components/ErrorBoundary';

export default function GalleryPage() {
  const { address } = useAccount();
  const [tokens, setTokens] = useState<Token[] | [any]>(Array(12).fill({}));
  const [profile, setProfile] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      if (address?.length) {
        setIsLoading(true);
        try {
          const [tokenReq, profileReq] = await Promise.all([
            getTokens(address),
            getProfile(address)
          ]);

          let blankTokens;
          if (tokenReq.length < 12) {
            blankTokens = Array(12 - tokenReq.length).fill({});
          } else {
            blankTokens = Array(3 - (tokenReq.length % 3)).fill({});
          }

          setTokens([...tokenReq, ...blankTokens]);
          setProfile(profileReq);
        } catch (error) {
          console.error('Error loading gallery data:', error);
        } finally {
          setIsLoading(false);
        }
      }
    })();
  }, [address]);

  const grid = tokens.map((token, i) => (
    <GridItem token={token} key={`grid-item-${i}`} />
  ));

  return (
    <ErrorBoundary>
      <div className="flex gap-3 flex-1 flex-col px-6 w-full max-w-sm h-full">
        {address ? (
          <div className="gold p-[2px] w-full rounded-md">
            <div className="w-full bg-black rounded-md p-3 flex flex-row gap-3 items-center justify-start">
              <div className="aspect-square overflow-hidden rounded-full">
                <div className="gold p-[2px] rounded-full">
                  {profile.image ? (
                    <Image
                      src={profile.image}
                      alt={profile.name}
                      width={50}
                      height={50}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="w-[50px] h-[50px]" />
                  )}
                </div>
              </div>
              <div className="flex flex-col w-full">
                <div className="digital text-sm text-gold line-clamp-1">
                  {profile.name ? profile.name : "Loading..."}
                </div>
                <div className="basker text-gold opacity-60 text-sm line-clamp-1">
                  {address.slice(0, 6)}...{address.slice(-6)}
                </div>
              </div>
              <button
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(
                      `https://www.hoodiecartel.com/gallery/${address}`
                    );
                    toast("Share link copied!", {
                      duration: 2000,
                      dismissible: true
                    });
                  } catch (error) {
                    console.error('Failed to copy:', error);
                    toast("Couldn't copy link. Please try again.", {
                      duration: 3000,
                      dismissible: true
                    });
                  }
                }}
              >
                <Copy className="text-gold" />
              </button>
            </div>
          </div>
        ) : (
          <ConnectButton />
        )}
        <div className="grid grid-cols-3 gap-3 flex-1 w-full content-start">
          {grid}
        </div>
        <Link
          href="/"
          className="max-h-12 border rounded-md digital text-sm py-3 tracking-widest px-6 w-full text-center text-gold"
        >
          Home
        </Link>
      </div>
    </ErrorBoundary>
  );
}
