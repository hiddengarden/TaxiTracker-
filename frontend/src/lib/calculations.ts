import type { Transaction, Settings, ShiftSummary, WeeklySummary, DailySheet } from '@/types'

export function calcMeterToCharge(meterPounds: number): number {
  return Math.floor(meterPounds * 10) / 10
}

export function calcOverring(meter: number, charge: number): number {
  return Math.max(0, parseFloat((meter - charge).toFixed(2)))
}

export function calcGratuity(cashIn: number, charge: number): number {
  return Math.max(0, parseFloat((cashIn - charge).toFixed(2)))
}

export function round2(n: number): number {
  return Math.round(n * 100) / 100
}

export function calcShiftSummary(transactions: Transaction[], settings: Settings): ShiftSummary {
  let cashTotal = 0
  let cardTotal = 0
  let accountTotal = 0
  let chargeTotal = 0
  let meterTotal = 0
  let overringTotal = 0
  let cardGratuity = 0
  let cashGratuity = 0
  const byType: Record<string, number> = {}

  for (const txn of transactions) {
    chargeTotal += txn.charge
    meterTotal += txn.meter
    overringTotal += txn.overring

    const ptLower = txn.paymentType.toLowerCase()
    byType[txn.paymentType] = (byType[txn.paymentType] ?? 0) + txn.charge

    if (ptLower === 'cash') {
      cashTotal += txn.charge
      cashGratuity += txn.gratuity
    } else if (ptLower === 'card') {
      cardTotal += txn.charge
      cardGratuity += txn.gratuity
    } else {
      accountTotal += txn.charge
    }
  }

  const baseShare = chargeTotal * settings.commissionRate
  const driverShare = settings.cardGratuityInDriverShare
    ? round2(baseShare + cardGratuity)
    : round2(baseShare)

  const cashEnclosed = round2(cashTotal - cardGratuity)

  return {
    cashTotal: round2(cashTotal),
    cardTotal: round2(cardTotal),
    accountTotal: round2(accountTotal),
    chargeTotal: round2(chargeTotal),
    meterTotal: round2(meterTotal),
    overringTotal: round2(overringTotal),
    cardGratuity: round2(cardGratuity),
    cashGratuity: round2(cashGratuity),
    driverShare,
    cashEnclosed: Math.max(0, cashEnclosed),
    transactionCount: transactions.length,
    byType,
  }
}

export function calcWeeklySummary(sheets: DailySheet[]): WeeklySummary {
  return {
    totalCharge: round2(sheets.reduce((s, d) => s + d.chargeTotal, 0)),
    totalDriverShare: round2(sheets.reduce((s, d) => s + d.driverShare, 0)),
    totalCash: round2(sheets.reduce((s, d) => s + d.cashTotal, 0)),
    totalCard: round2(sheets.reduce((s, d) => s + d.cardTotal, 0)),
    totalAccount: round2(sheets.reduce((s, d) => s + d.accountTotal, 0)),
    sheetCount: sheets.length,
  }
}
