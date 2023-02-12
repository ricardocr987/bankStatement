// to-do: complete list
export const symbolFromMint: Record<string, string> = {
    'So11111111111111111111111111111111111111112': 'SOL',
    'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v': 'USDC',
    'mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So': 'MSOL'
}

export const mintFromSymbol: Record<string, string> = {
    'SOL': 'So11111111111111111111111111111111111111112',
    'USDC': 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    'MSOL': 'mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So'
}

export const decimalsFromSymbol: Record<string, number> = {
    'SOL': 9,
    'USDC': 6,
    'MSOL': 9
}

// https://pyth.network/developers/accounts
export const priceAccountFromSymbol: Record<string, string> = {
    'SOL': 'ALP8SdU9oARYVLgLR7LrqMNCYBnhtnQz1cj6bwgwQmgj',
    'USDC': '8GWTTbNiXdmyZREXbjsZBmCRuzdPrW55dnZGDkTRjWvb',
    'MSOL': 'BS2iAqT67j8hA9Jji4B8UpL3Nfw9kwPfU5s4qeaf1e7r'
}

export const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
