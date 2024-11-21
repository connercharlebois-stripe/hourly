export interface ICheckIn {
    id: number,
    time: Date,
    label: string,
    duration?: number,
    isActive: boolean
}
export interface ITotals {
    [key: string]: number
}
export interface ISummary {
    label: string,
    duration: number,
    checkInCount: number
}