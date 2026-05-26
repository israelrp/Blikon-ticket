import { useMemo, useState } from 'react'
import type { BlikonUser } from '../../auth/getUser'
import { useConekta } from '../../hooks/useConekta'
import { addPaymentMethod } from '../../services/paymentService'
import { detectCardBrand } from '../../utils/paymentUtils'

interface AddPaymentMethodFormProps {
  authUser: BlikonUser
  onAdded: () => void
  onCancel: () => void
}

export function AddPaymentMethodForm({
  authUser,
  onAdded,
  onCancel,
}: AddPaymentMethodFormProps) {
  const conektaPublicKey = import.meta.env.VITE_CONEKTA_PUBLIC_KEY
  const { isLoaded, tokenizeCard } = useConekta(conektaPublicKey)

  const [cardNumber, setCardNumber] = useState('')
  const [cardHolder, setCardHolder] = useState('')
  const [expirationDate, setExpirationDate] = useState('')
  const [cvc, setCvc] = useState('')
  const [email, setEmail] = useState(authUser.email ?? '')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const cardBrand = useMemo(() => detectCardBrand(cardNumber), [cardNumber])

  const handleExpirationChange = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 4)
    if (digits.length <= 2) {
      setExpirationDate(digits)
      return
    }
    setExpirationDate(`${digits.slice(0, 2)}/${digits.slice(2)}`)
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)

    if (!conektaPublicKey) {
      setError('Conekta no está configurado (VITE_CONEKTA_PUBLIC_KEY).')
      return
    }

    if (!isLoaded) {
      setError('El procesador de tarjetas aún no está listo.')
      return
    }

    const [expMonth, expYearRaw] = expirationDate.split('/')
    const expYear = expYearRaw?.length === 2 ? `20${expYearRaw}` : expYearRaw

    if (!expMonth || !expYear) {
      setError('Ingresa una fecha de vencimiento válida (MM/AA).')
      return
    }

    setIsSubmitting(true)

    try {
      const token = await tokenizeCard({
        card: {
          number: cardNumber.replace(/\D/g, ''),
          name: cardHolder.trim(),
          exp_month: expMonth,
          exp_year: expYear,
          cvc: cvc.replace(/\D/g, ''),
        },
      })

      const response = await addPaymentMethod({
        blikonId: authUser.blikon_id,
        numeroTarjeta: cardNumber.replace(/\D/g, '').slice(-4),
        tokenTarjeta: token.id,
        nombreCompleto: cardHolder.trim(),
        mes: expMonth,
        año: expYear,
        emisor: cardBrand,
        email: email.trim(),
      })

      if (!response.resultado) {
        throw new Error(response.mensaje ?? 'No se pudo agregar la tarjeta')
      }

      onAdded()
    } catch (submitError) {
      const message =
        submitError instanceof Error
          ? submitError.message
          : 'No se pudo agregar la tarjeta'
      setError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-[10px] w-full rounded-[14px] border border-[#E9ECEF] bg-white p-[12px]"
    >
      <div className="flex items-center justify-between">
        <span className="font-inter-medium text-[14px] text-[#2B333B]">
          Agregar tarjeta
        </span>
        <button
          type="button"
          onClick={onCancel}
          className="font-inter-regular text-[12px] text-[#6C757D] hover:text-[#495057]"
        >
          Cancelar
        </button>
      </div>

      <label className="flex flex-col gap-[4px]">
        <span className="font-inter-regular text-[12px] text-[#6C757D]">Número</span>
        <input
          value={cardNumber}
          onChange={(event) => setCardNumber(event.target.value)}
          inputMode="numeric"
          autoComplete="cc-number"
          placeholder="4242 4242 4242 4242"
          className="h-[40px] rounded-[10px] bg-[#F7F7F7] px-[12px] font-inter-regular text-[14px] outline-none focus:ring-2 focus:ring-[#027AFF]/20"
          required
        />
      </label>

      <label className="flex flex-col gap-[4px]">
        <span className="font-inter-regular text-[12px] text-[#6C757D]">Titular</span>
        <input
          value={cardHolder}
          onChange={(event) => setCardHolder(event.target.value)}
          autoComplete="cc-name"
          placeholder="Nombre en la tarjeta"
          className="h-[40px] rounded-[10px] bg-[#F7F7F7] px-[12px] font-inter-regular text-[14px] outline-none focus:ring-2 focus:ring-[#027AFF]/20"
          required
        />
      </label>

      <div className="grid grid-cols-2 gap-[8px]">
        <label className="flex flex-col gap-[4px]">
          <span className="font-inter-regular text-[12px] text-[#6C757D]">Vence</span>
          <input
            value={expirationDate}
            onChange={(event) => handleExpirationChange(event.target.value)}
            inputMode="numeric"
            autoComplete="cc-exp"
            placeholder="MM/AA"
            className="h-[40px] rounded-[10px] bg-[#F7F7F7] px-[12px] font-inter-regular text-[14px] outline-none focus:ring-2 focus:ring-[#027AFF]/20"
            required
          />
        </label>
        <label className="flex flex-col gap-[4px]">
          <span className="font-inter-regular text-[12px] text-[#6C757D]">CVC</span>
          <input
            value={cvc}
            onChange={(event) => setCvc(event.target.value.replace(/\D/g, '').slice(0, 4))}
            inputMode="numeric"
            autoComplete="cc-csc"
            placeholder="123"
            className="h-[40px] rounded-[10px] bg-[#F7F7F7] px-[12px] font-inter-regular text-[14px] outline-none focus:ring-2 focus:ring-[#027AFF]/20"
            required
          />
        </label>
      </div>

      <label className="flex flex-col gap-[4px]">
        <span className="font-inter-regular text-[12px] text-[#6C757D]">Correo</span>
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
          placeholder="correo@ejemplo.com"
          className="h-[40px] rounded-[10px] bg-[#F7F7F7] px-[12px] font-inter-regular text-[14px] outline-none focus:ring-2 focus:ring-[#027AFF]/20"
          required
        />
      </label>

      {error && (
        <p className="font-inter-regular text-[12px] text-[#DC3545]">{error}</p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="h-[40px] rounded-[10px] bg-[#027AFF] font-inter-medium text-[14px] text-white disabled:opacity-50"
      >
        {isSubmitting ? 'Guardando...' : 'Guardar tarjeta'}
      </button>
    </form>
  )
}
