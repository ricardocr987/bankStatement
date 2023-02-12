import { Connection, PublicKey } from "@solana/web3.js"
import { pythOracleCoder } from '@pythnetwork/client'
import { PythInstructionInfo } from "src/types"

export async function getPythPrice(connection: Connection, priceAccount: string): Promise<number> {
    let price = 0
    const signature = await connection.getSignaturesForAddress(new PublicKey(priceAccount), {limit: 1}) // most recent tx
    const transaction = await connection.getParsedTransaction(signature[0].signature)
    if (transaction) {
        const coder = pythOracleCoder()
        for (const ix of transaction.transaction.message.instructions) {
            if ('data' in ix) {
                const decoded = coder.instruction.decode(ix.data)
                const decodedData: PythInstructionInfo = decoded?.data
                if (decodedData && decodedData as PythInstructionInfo) price = Number(decodedData.price)
            }
        }
    }

    return price
}