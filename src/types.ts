import BN from "bn.js"

export type ParsedTransaction = {
    signature: string
    tokenBought: string
    amountBought: number
    tokenSold: string
    amountSold: number
    value: number
    timestamp: number
}

export type ProcessedTransaction = {
    tokenBought: string
    amountBought: number
    tokenSold: string
    amountSold: number
    value: number
    timestamp: number
}

export type TokenBalance = {
    mint: string
    symbol: string
    amount: number
    price: number
    value: number
}

export type TimestampInterval = {
    since: number
    to: number
}

export type PythInstructionInfo = {
    status: number
    unused: number
    price: BN
    conf: BN
    pubSlot: BN
}