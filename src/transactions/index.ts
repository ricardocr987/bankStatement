import { Connection, PublicKey, ConfirmedSignatureInfo, TokenBalance } from '@solana/web3.js'
import { ParsedTransaction, ProcessedTransaction, TimestampInterval } from '../types.js'
import { mintFromSymbol } from '../constants.js'

export async function getAllTransactions (
    connection: Connection, 
    pubKeys: PublicKey[],
    month: string
): Promise<ParsedTransaction[]> {
    const transactions: ParsedTransaction[] = []
    let len = pubKeys.length
    while (len > 0){
        const signatures = await getSignatures(connection, pubKeys[len - 1], month)
        for (const signature of signatures) {
            connection.getSignatureStatus
            const transaction = await connection.getParsedTransaction(signature)
            if (transaction && transaction.meta && transaction.meta.postTokenBalances && transaction.meta.preTokenBalances && transaction.blockTime) {
                const { preBalances, postBalances } = getBalances(transaction.meta.postTokenBalances, transaction.meta.preTokenBalances)
                const processedTx: ProcessedTransaction = processTransaction(preBalances, postBalances, transaction.blockTime)
                transactions.push({ signature, ...processedTx })
            }
        }
        len--
    }

    return transactions
}

async function getSignatures(connection: Connection, pubkey: PublicKey, month: string): Promise<string[]> {
    const timestampInverval: TimestampInterval = getTimestampInverval(month)
    const signatures: ConfirmedSignatureInfo[] = await connection.getSignaturesForAddress(new PublicKey(pubkey))

    // returns a filtered vector of signatures (only those that were produced during the requested timestamp interval and without tx error)
    return signatures.filter((signature) => {
        return signature.blockTime && signature.err === null && signature.blockTime > timestampInverval.since && signature.blockTime < timestampInverval.to
    }).map((signature) => { return signature.signature })
}

/* get unlimited signatures:
let i = 1
while(totalSignatures.length % 1000 === 0){
    const currentSignatures: ConfirmedSignatureInfo[] = await connection.getSignaturesForAddress(
        pubkey,
        {
            before: totalSignatures[i*999].signature
        }
    )
    totalSignatures = totalSignatures.concat(currentSignatures)
    i++
}*/

function getTimestampInverval(month: string): TimestampInterval {
    const since = (new Date(`2023-01-01T00:00:00Z`)).getTime() / 1000
    let to
    if (month === '12') {
        to = (new Date(`2023-0${month}-01T00:00:00Z`)).getTime() / 1000
    } else {
        to = (new Date(`2024-01-01T00:00:00Z`)).getTime() / 1000
    }

    return { since, to }
}

// i identify two mints (swap), using jup is possible to do a swap in the same tx in multiple AMM, so the best solution is gather the amounts of all 
// token accounts in the same tx that has the same mint
function getBalances(pre: TokenBalance[], post: TokenBalance[]) {
    const preBalances: TokenBalance[] = []
    const postBalances: TokenBalance[] = []

    preBalances.push(addAmounts(pre.filter((balance) => { return pre[0].mint === balance.mint })), addAmounts(pre.filter((balance) => { return pre[1].mint === balance.mint })))
    postBalances.push(addAmounts(pre.filter((balance) => { return post[0].mint === balance.mint })), addAmounts(pre.filter((balance) => { return post[1].mint === balance.mint })))
    
    return { preBalances, postBalances }
}

function addAmounts(balances: TokenBalance[]): TokenBalance {
    let amount = 0
    for (const balance of balances) {
        if (balance.uiTokenAmount.uiAmount) amount += balance.uiTokenAmount.uiAmount
    }
    return {
        ...balances[0],
        uiTokenAmount: {
            ...balances[0].uiTokenAmount,
            uiAmount: amount
        }
    }
}

function processTransaction(preBalances: TokenBalance[], postBalances: TokenBalance[], blockTime: number): ProcessedTransaction {
    const processedTx: ProcessedTransaction = getEmptyProcessedTx(blockTime)

    for (let i = 0; i < postBalances.length; i++) {
        if (Number(preBalances[i].uiTokenAmount.amount) > Number(postBalances[i].uiTokenAmount.amount)) {
            processedTx.tokenSold = postBalances[i].mint
            processedTx.amountSold = Number(postBalances[i].uiTokenAmount.amount) - Number(preBalances[i].uiTokenAmount.amount)
        } else {
            processedTx.tokenBought = preBalances[i].mint
            processedTx.amountBought = Number(preBalances[i].uiTokenAmount.amount) - Number(preBalances[i].uiTokenAmount.amount)
        }
        if (postBalances[i].mint === mintFromSymbol['USDC']) processedTx.value = Number(postBalances[i].uiTokenAmount.amount) - Number(preBalances[i].uiTokenAmount.amount)
    }

    return processedTx
}

function getEmptyProcessedTx(blockTime: number): ProcessedTransaction{
    return {
        tokenBought: '',
        amountBought: 0,
        tokenSold: '',
        amountSold: 0,
        value: 0,
        timestamp: blockTime
    }
}