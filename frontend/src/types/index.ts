// ─── Settings ───────────────────────────────────────────────────────────────

export interface PaymentType {
  id: string
  label: string
  color: string
  bgColor: string
  enabled: boolean
}

export interface FieldConfig {
  id: string
  label: string
  visible: boolean
}

export interface TelegramConfig {
  token: string
  chatId: string
  enabled: boolean
  events: ('transaction' | 'shift' | 'dailySheet')[]
}

export interface Settings {
  driverName: string
  driverLicense: string
  companyName: string
  defaultCar: string
  currency: string
  commissionRate: number
  cardGratuityInDriverShare: boolean
  paymentTypes: PaymentType[]
  fields: FieldConfig[]
  meterReadingCount: number
  telegram: TelegramConfig
  dateFormat: string
}

// ─── Core Data ───────────────────────────────────────────────────────────────

export interface Transaction {
  id: string
  shiftDate: string
  weekNumber: number
  year: number
  paymentType: string
  meter: number
  charge: number
  overring: number
  cashIn: number
  gratuity: number
  notes: string
  createdAt: string
  updatedAt: string
}

export interface Shift {
  date: string
  type: 'start' | 'end'
  time: string
  car: string
  meterReadings: number[]
  createdAt: string
  updatedAt: string
}

export interface DailySheet {
  date: string
  dayName: string
  weekNumber: number
  year: number
  shiftStart: string
  shiftEnd: string
  car: string
  meterReadingsStart: number[]
  meterReadingsEnd: number[]
  cashTotal: number
  cardTotal: number
  accountTotal: number
  chargeTotal: number
  meterTotal: number
  overringTotal: number
  cardGratuity: number
  cashGratuity: number
  driverShare: number
  cashEnclosed: number
  transactionCount: number
  transactions: Transaction[]
  createdAt: string
  updatedAt: string
}

export interface FrozenInvoice {
  id: string
  weekNumber: number
  year: number
  version: number
  frozenDate: string
  totalCharge: number
  totalDriverShare: number
  sheets: DailySheet[]
  createdAt: string
}

// ─── Calculated summaries ────────────────────────────────────────────────────

export interface ShiftSummary {
  cashTotal: number
  cardTotal: number
  accountTotal: number
  chargeTotal: number
  meterTotal: number
  overringTotal: number
  cardGratuity: number
  cashGratuity: number
  driverShare: number
  cashEnclosed: number
  transactionCount: number
  byType: Record<string, number>
}

export interface WeeklySummary {
  totalCharge: number
  totalDriverShare: number
  totalCash: number
  totalCard: number
  totalAccount: number
  sheetCount: number
}

// ─── Sync ────────────────────────────────────────────────────────────────────

export interface SyncPayload {
  transactions: Transaction[]
  shifts: Shift[]
  dailySheets: DailySheet[]
  frozenInvoices: FrozenInvoice[]
  settings: Settings | null
  serverTime: string
}
