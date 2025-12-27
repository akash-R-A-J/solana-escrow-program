export interface Token {
    symbol: string;
    name: string;
    mint: string;
    decimals: number;
    logoUrl: string;
}

export const DEVNET_TOKENS: Token[] = [
    {
        symbol: "USDC",
        name: "USD Coin",
        mint: "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU",
        decimals: 6,
        logoUrl: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png",
    },
    {
        symbol: "USDT",
        name: "Tether USD",
        mint: "EJwZgeZrdC8TXTQbQBoL6bfuAnFUUy1PVCMB4DYPzVaS",
        decimals: 6,
        logoUrl: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB/logo.svg",
    },
    {
        symbol: "SOL",
        name: "Wrapped SOL",
        mint: "So11111111111111111111111111111111111111112",
        decimals: 9,
        logoUrl: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png",
    },
    {
        symbol: "BONK",
        name: "Bonk",
        mint: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
        decimals: 5,
        logoUrl: "https://arweave.net/hQiPZOsRZXGXBJd_82PhVdlM_hACsT_q6wqwf5cSY7I",
    },
];

export function getTokenByMint(mint: string): Token | undefined {
    return DEVNET_TOKENS.find((t) => t.mint === mint);
}

export function getTokenBySymbol(symbol: string): Token | undefined {
    return DEVNET_TOKENS.find((t) => t.symbol === symbol);
}
