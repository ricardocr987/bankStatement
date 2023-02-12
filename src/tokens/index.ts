import { decimalsFromSymbol, priceAccountFromSymbol, symbolFromMint } from '../constants.js'
import { TOKEN_PROGRAM_ID, AccountLayout } from '@solana/spl-token'
import { Connection, PublicKey } from '@solana/web3.js'
import { TokenBalance } from '../types.js'
//import { Metaplex } from '@metaplex-foundation/js'
import { getPythPrice } from '../utils/pythPrice.js'

export async function getAllTokensBalance(
    connection: Connection, 
    pubKeys: PublicKey[]
): Promise<TokenBalance[]> {
    //const metaplex = new Metaplex(connection)
    //const nftsAddress: string[] = []
    const tokens: TokenBalance[] = []

    let len = pubKeys.length
    while (len > 0){
        // get all the nfts
        /*const nfts = await metaplex.nfts().findAllByOwner({owner: pubKeys[len - 1]})
        for (const nft of nfts) { // to-do: process this info
            nftsAddress.push(nft.address.toString())
        }*/

        // get all token accounts and exclude nfts
        const response = await connection.getTokenAccountsByOwner(pubKeys[len - 1], { programId: TOKEN_PROGRAM_ID })
        for (const tokenAccount of response.value){
            //if (!nftsAddress.includes(tokenAccount.pubkey.toString())) { // if it isnt a nft, treat it as a token
                const accountInfo = await connection.getAccountInfo(tokenAccount.pubkey)
                if (accountInfo && accountInfo.data){
                    const accountData = AccountLayout.decode(accountInfo.data)
                    const price = await getPythPrice(connection, priceAccountFromSymbol[symbolFromMint[accountData.mint.toString()]])
                    tokens.push({
                        mint: accountData.mint.toString(),
                        symbol: symbolFromMint[accountData.mint.toString()],
                        amount: Number(accountData.amount) / decimalsFromSymbol[symbolFromMint[accountData.mint.toString()]],
                        price: price,
                        value: price * Number(accountData.amount)
                    }) 
                } else {
                    console.log('accountInfo or its data is undefined')
                }
            //}
        }
        len--
    }

    return tokens
}