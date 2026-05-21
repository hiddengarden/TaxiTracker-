import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Settings } from '@/types'

const DEFAULT_SETTINGS: Settings = {
  driverName: '',
  driverLicense: '',
  companyName: '',
  defaultCar: '',
  currency: '£',
  commissionRate: 0.45,
  cardGratuityInDriverShare: true,
  meterReadingCount: 4,
  dateFormat: 'dd/MM/yyyy',
  paymentTypes: [
    { id: 'cash', label: 'Cash', color: '#4caf50', bgColor: '#0d2e0d', enabled: true },
    { id: 'card', label: 'Card', color: '#5b9bd5', bgColor: '#0d1a2e', enabled: true },
    { id: 'account', label: 'Account', color: '#d55b5b', bgColor: '#2e0d0d', enabled: true },
  ],
  fields: [
    { id: 'meter', label: 'Meter', visible: true },
    { id: 'charge', label: 'Charge', visible: true },
    { id: 'cashIn', label: 'Cash In', visible: true },
    { id: 'overring', label: 'Overring', visible: true },
    { id: 'gratuity', label: 'Gratuity', visible: true },
    { id: 'notes', label: 'Notes', visible: true },
  ],
  telegram: {
    token: '',
    chatId: '',
    enabled: false,
    events: ['transaction', 'shift', 'dailySheet'],
  },
}

interface SettingsStore {
  settings: Settings
  updateSettings: (partial: Partial<Settings>) => void
  resetSettings: () => void
  getField: (id: string) => { label: string; visible: boolean }
  getPaymentType: (id: string) => Settings['paymentTypes'][0] | undefined
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set, get) => ({
      settings: DEFAULT_SETTINGS,

      updateSettings: (partial) =>
        set((state) => ({ settings: { ...state.settings, ...partial } })),

      resetSettings: () => set({ settings: DEFAULT_SETTINGS }),

      getField: (id) => {
        const field = get().settings.fields.find((f) => f.id === id)
        return field ?? { label: id, visible: true }
      },

      getPaymentType: (id) =>
        get().settings.paymentTypes.find((p) => p.id === id),
    }),
    { name: 'taxitracker-settings' }
  )
)

export { DEFAULT_SETTINGS }
