import { Connection, PublicKey } from '@solana/web3.js'
import { getAllTokensBalance } from './tokens/index.js'
import { getAllTransactions } from './transactions/index.js'
import { createBankStatement } from './bankStatement/index.js'
import { ParsedTransaction, TokenBalance } from './types.js'
import prompts from 'prompts'

async function main() {
    const number = await prompts({
        type: 'number',
        name: 'value',
        message: 'How many wallets do you want to check:',
        validate: value => value < 0 ? `Should be positive` : true
    })

    const month = await prompts({
        type: 'text',
        name: 'value',
        message: 'Introduce month number:',
    })

    const pubKeys: PublicKey[] = []
    while (number.value > 0) {
        const pubKey = await prompts({
            type: 'text',
            name: 'value',
            message: 'Introduce a PublicKey:'
        })
        pubKeys.push(new PublicKey(pubKey.value))
        number.value--
    }

    const connection: Connection = new Connection('')

    const tokensBalance: TokenBalance[] = await getAllTokensBalance(connection, pubKeys)
    // todo: const nftsBalance: NFTBalance = await getAllNftsBalance(pubKeys)
    const transactions: ParsedTransaction[] = await getAllTransactions(connection, pubKeys, month.value)

    createBankStatement(tokensBalance, transactions)
}

await main()