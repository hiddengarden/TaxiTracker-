import type { TelegramConfig, Transaction, DailySheet } from '@/types'

async function send(config: TelegramConfig, text: string): Promise<void> {
  if (!config.enabled || !config.token || !config.chatId) return
  try {
    await fetch(`https://api.telegram.org/bot${config.token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: config.chatId, text, parse_mode: 'HTML' }),
    })
  } catch {
    // non-fatal
  }
}

export async function notifyTransaction(config: TelegramConfig, txn: Transaction, currency: string): Promise<void> {
  if (!config.events.includes('transaction')) return
  const text = [
    `<b>TXN</b> ${txn.shiftDate} ${txn.id.split('T')[1]?.slice(0, 8) ?? ''}`,
    `${txn.paymentType} · Meter: ${currency}${txn.meter.toFixed(2)} · Charge: ${currency}${txn.charge.toFixed(2)} · Overring: ${currency}${txn.overring.toFixed(2)}`,
    `Cash In: ${currency}${txn.cashIn.toFixed(2)} · Gratuity: ${currency}${txn.gratuity.toFixed(2)}`,
    txn.notes ? `Notes: ${txn.notes}` : '',
  ].filter(Boolean).join('\n')
  await send(config, text)
}

export async function notifyDailySheet(config: TelegramConfig, sheet: DailySheet, currency: string): Promise<void> {
  if (!config.events.includes('dailySheet')) return
  const text = [
    `<b>DAILY SHEET</b> ${sheet.date} (${sheet.dayName})`,
    `Transactions: ${sheet.transactionCount}`,
    `Cash: ${currency}${sheet.cashTotal.toFixed(2)} · Card: ${currency}${sheet.cardTotal.toFixed(2)} · Account: ${currency}${sheet.accountTotal.toFixed(2)}`,
    `Total Charge: ${currency}${sheet.chargeTotal.toFixed(2)}`,
    `Driver Share: ${currency}${sheet.driverShare.toFixed(2)}`,
    `Cash Enclosed: ${currency}${sheet.cashEnclosed.toFixed(2)}`,
  ].join('\n')
  await send(config, text)
}

export async function notifyShift(
  config: TelegramConfig,
  type: 'start' | 'end',
  date: string,
  time: string,
  car: string,
  readings: number[]
): Promise<void> {
  if (!config.events.includes('shift')) return
  const text = [
    `<b>SHIFT ${type.toUpperCase()}</b> ${date}`,
    `Time: ${time} · Car: ${car}`,
    readings.map((r, i) => `R${i + 1}: ${r}`).join('  '),
  ].filter(Boolean).join('\n')
  await send(config, text)
}
