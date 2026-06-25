import { useState } from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useSettingsStore } from '@/stores/settingsStore'
import { useTransactionStore } from '@/stores/transactionStore'
import { calcOverring, calcGratuity } from '@/lib/calculations'
import type { Transaction } from '@/types'

interface Props {
  txn: Transaction
}

export function TransactionItem({ txn }: Props) {
  const { settings, getPaymentType } = useSettingsStore()
  const { updateTransaction, deleteTransaction } = useTransactionStore()
  const [editing, setEditing] = useState(false)
  const [editForm, setEditForm] = useState({ charge: String(txn.charge), cashIn: String(txn.cashIn), notes: txn.notes })
  const cur = settings.currency
  const pt = getPaymentType(txn.paymentType)
  const time = txn.createdAt.split('T')[1]?.slice(0, 5) ?? ''

  const handleSave = () => {
    const charge = parseFloat(editForm.charge) || 0
    const cashIn = parseFloat(editForm.cashIn) || 0
    updateTransaction(txn.id, {
      charge,
      cashIn,
      overring: calcOverring(txn.meter, charge),
      gratuity: calcGratuity(cashIn, charge),
      notes: editForm.notes.trim(),
    })
    toast.success('Transaction updated')
    setEditing(false)
  }

  const handleDelete = () => {
    deleteTransaction(txn.id)
    toast.success('Transaction deleted')
  }

  return (
    <>
      <div className="flex items-center gap-3 py-2.5 border-b border-surface-border last:border-0">
        <span className="text-xs text-gray-500 font-mono w-10 flex-shrink-0">{time}</span>
        <Badge label={pt?.label ?? txn.paymentType} color={pt?.color} bgColor={pt?.bgColor} />
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-sm text-white">{cur}{txn.charge.toFixed(2)}</span>
            {txn.gratuity > 0 && (
              <span className="font-mono text-xs text-gray-400">+{cur}{txn.gratuity.toFixed(2)} tip</span>
            )}
          </div>
          {txn.notes && <div className="text-xs text-gray-500 truncate">{txn.notes}</div>}
        </div>
        <div className="flex gap-1">
          <button onClick={() => setEditing(true)} className="p-1.5 text-gray-500 hover:text-white transition-colors">
            <Pencil size={14} />
          </button>
          <button onClick={handleDelete} className="p-1.5 text-gray-500 hover:text-red-400 transition-colors">
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <Modal open={editing} onClose={() => setEditing(false)} title="Edit Transaction">
        <div className="space-y-4">
          <Input
            label="Charge"
            type="number"
            inputMode="decimal"
            step="0.01"
            prefix={cur}
            value={editForm.charge}
            onChange={(e) => setEditForm((f) => ({ ...f, charge: e.target.value }))}
          />
          <Input
            label="Cash In"
            type="number"
            inputMode="decimal"
            step="0.01"
            prefix={cur}
            value={editForm.cashIn}
            onChange={(e) => setEditForm((f) => ({ ...f, cashIn: e.target.value }))}
          />
          <Input
            label="Notes"
            value={editForm.notes}
            onChange={(e) => setEditForm((f) => ({ ...f, notes: e.target.value }))}
          />
          <div className="flex gap-3">
            <Button variant="secondary" fullWidth onClick={() => setEditing(false)}>Cancel</Button>
            <Button fullWidth onClick={handleSave}>Save</Button>
          </div>
        </div>
      </Modal>
    </>
  )
}
