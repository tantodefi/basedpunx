// server side actions
"use server";
import { contract_address, mainnet_rpc } from "@/config/consts";
import { ethers } from "ethers";
import abi from "@/config/abi.json";
import { ERC725, ERC725JSONSchema } from "@erc725/erc725.js";
import LSP3ProfileSchema from "@erc725/erc725.js/schemas/LSP3ProfileMetadata.json";
import { IPFS_GATEWAYS } from "@/config/wagmi";

const RPC_ENDPOINT = 'https://rpc.lukso.gateway.fm';
const ipfsGateway = 'https://api.universalprofile.cloud/ipfs';

async function fetchFromIPFS(ipfsHash: string) {
  const hash = ipfsHash.replace('ipfs://', '');
  
  for (const gateway of IPFS_GATEWAYS) {
    try {
      const response = await fetch(gateway + hash);
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.warn(`Failed to fetch from ${gateway}`, error);
    }
  }
  
  throw new Error(`Failed to fetch IPFS data for hash: ${ipfsHash}`);
}

// Get the count of tokens left to mint
export const getCount = async () => {
  const totalSupply = 6900;
  const provider = new ethers.JsonRpcProvider(mainnet_rpc);
  const contract = new ethers.Contract(contract_address, abi.abi, provider);
  const count = totalSupply - parseInt(await contract.totalSupply());
  return count;
};

// Get the tokens owned by an address
export const getTokens = async (address: string) => {
  try {
    const provider = new ethers.JsonRpcProvider(mainnet_rpc);
    const contract = new ethers.Contract(contract_address, abi.abi, provider);
    const tokens = await contract.tokenIdsOf(address);
    
    const formattedTokens = tokens.map((token: string) => {
      const id = parseInt(token);
      return {
        id,
        name: `BurntPunX #${id}`,
        largePhoto: `https://ipfs.filebase.io/ipfs/QmP1MQ1d6UvNvzpfr5Brfuqfu6JDBj4Kq9kBKzaPPUZ2zA/BurntPunX_${id}.png`,
        smallPhoto: `https://ipfs.filebase.io/ipfs/QmSKbCkmib8koVyYA2Xum3hngzNCLVijFkiQBg23VHjcMV/BurntPunX_${id}.png`
      };
    });

    return formattedTokens as Token[];
  } catch (error) {
    console.error('Error getting tokens:', error);
    return [];
  }
};

// Get the LSP3Profile of an address
export const getProfile = async (address: string) => {
  try {
    const erc725 = new ERC725(
      LSP3ProfileSchema as ERC725JSONSchema[],
      address,
      RPC_ENDPOINT
    );

    const profileData = await erc725.getData('LSP3Profile');
    
    if (!profileData?.value) {
      console.warn('No profile data found');
      return {};
    }

    if (typeof profileData.value === 'string' && profileData.value.startsWith('ipfs://')) {
      try {
        const profile = await fetchFromIPFS(profileData.value);
        console.log('Fetched profile:', profile);
        return {
          name: profile.LSP3Profile.name,
          description: profile.LSP3Profile.description,
          image: profile.LSP3Profile.profileImage?.[0]?.url?.replace('ipfs://', ipfsGateway + '/')
        };
      } catch (error) {
        console.error('Error fetching profile from IPFS:', error);
        return {};
      }
    }

    return profileData.value;
  } catch (error) {
    console.error('Error getting profile:', error);
    return {};
  }
};
