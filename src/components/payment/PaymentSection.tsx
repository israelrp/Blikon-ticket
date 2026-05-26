import { useCallback, useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { BlikonUser } from '../../auth/getUser'
import type { GenericTicketDetailsData } from '../../types/ticket'
import type { PaymentMethod } from '../../types/payment'
import {
  actualizarEstatusTicket,
  fetchPaymentMethods,
  realizarPago,
} from '../../services/paymentService'
import {
  buildRealizarPagoPayload,
  getCardBrandLabel,
  maskCardNumber,
  parseAmount,
} from '../../utils/paymentUtils'
import { AddPaymentMethodForm } from './AddPaymentMethodForm'

interface PaymentSectionProps {
  ticketDetails: GenericTicketDetailsData
  authUser: BlikonUser
  onPaymentComplete?: () => void
}

const TIP_OPTIONS = [0, 5, 10, 15] as const

const MoneyBillIcon = () => (
  <svg width="20" height="12" viewBox="0 0 20 12" fill="none">
    <path
      d="M19 0H1C0.447812 0 0 0.447812 0 1V11C0 11.5522 0.447812 12 1 12H19C19.5522 12 20 11.5522 20 11V1C20 0.447812 19.5522 0 19 0ZM1.5 10.5V8.5C2.60469 8.5 3.5 9.39531 3.5 10.5H1.5ZM1.5 3.5V1.5H3.5C3.5 2.60469 2.60469 3.5 1.5 3.5ZM10 9C8.61906 9 7.5 7.65656 7.5 6C7.5 4.34312 8.61938 3 10 3C11.3806 3 12.5 4.34312 12.5 6C12.5 7.65719 11.3803 9 10 9ZM18.5 10.5H16.5C16.5 9.39531 17.3953 8.5 18.5 8.5V10.5ZM18.5 3.5C17.3953 3.5 16.5 2.60469 16.5 1.5H18.5V3.5Z"
      fill="#6E6E6E"
    />
  </svg>
)

export function PaymentSection({
  ticketDetails,
  authUser,
  onPaymentComplete,
}: PaymentSectionProps) {
  const metadata = ticketDetails.metadata
  const moneda = metadata?.moneda
  const currencySymbol = moneda?.toUpperCase() === 'USD' ? '$' : '$'

  const importe = parseAmount(metadata?.total)
  const [selectedTipPercentage, setSelectedTipPercentage] = useState<number | null>(null)
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [selectedMethodId, setSelectedMethodId] = useState<number | null>(null)
  const [isLoadingMethods, setIsLoadingMethods] = useState(true)
  const [methodsError, setMethodsError] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [paymentState, setPaymentState] = useState<'idle' | 'processing' | 'success' | 'error'>('idle')
  const [paymentMessage, setPaymentMessage] = useState<string | null>(null)

  const tipAmount =
    selectedTipPercentage === null ? 0 : (importe * selectedTipPercentage) / 100
  const totalWithTip = importe + tipAmount

  const selectedMethod = useMemo(
    () => paymentMethods.find((method) => method.id === selectedMethodId) ?? null,
    [paymentMethods, selectedMethodId]
  )

  const loadPaymentMethods = useCallback(async () => {
    setIsLoadingMethods(true)
    setMethodsError(null)

    try {
      const response = await fetchPaymentMethods(authUser.user_id)
      if (!response.resultado) {
        throw new Error(response.mensaje ?? 'No se pudieron cargar los métodos de pago')
      }

      const activeMethods = (response.metodosPagos ?? []).filter(
        (method) => !method.eliminado
      )
      setPaymentMethods(activeMethods)

      const defaultMethod =
        activeMethods.find((method) => method.predeterminado) ?? activeMethods[0] ?? null
      setSelectedMethodId(defaultMethod?.id ?? null)
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'No se pudieron cargar los métodos de pago'
      setMethodsError(message)
      setPaymentMethods([])
      setSelectedMethodId(null)
    } finally {
      setIsLoadingMethods(false)
    }
  }, [authUser.user_id])

  useEffect(() => {
    loadPaymentMethods()
  }, [loadPaymentMethods])

  const isPayEnabled =
    selectedMethod !== null &&
    selectedTipPercentage !== null &&
    importe > 0 &&
    Boolean(ticketDetails.spaceid)

  const handlePay = async () => {
    if (!selectedMethod || selectedTipPercentage === null) return

    const payload = buildRealizarPagoPayload({
      authUser,
      ticketDetails,
      paymentMethod: selectedMethod,
      importe,
      propina: tipAmount,
    })

    if (!payload) {
      setPaymentState('error')
      setPaymentMessage('Faltan datos del ticket para procesar el pago.')
      setTimeout(() => {
        setPaymentState('idle')
        setPaymentMessage(null)
      }, 3500)
      return
    }

    setPaymentMessage(null)
    setPaymentState('processing')

    try {
      const paymentResponse = await realizarPago(payload)

      if (!paymentResponse.resultado) {
        throw new Error(paymentResponse.mensaje ?? 'Pago rechazado')
      }

      await actualizarEstatusTicket({
        usuarioId: authUser.user_id,
        usuarioPerfilId: authUser.blikon_profile_id,
        spaceId: payload.spaceId,
        ticketId: payload.ticketId,
        cadenaEstatus: 'Pagado',
      })

      setPaymentState('success')
      setPaymentMessage('Tu pago se procesó correctamente.')
      onPaymentComplete?.()

      setTimeout(() => {
        setPaymentState('idle')
        setPaymentMessage(null)
      }, 2500)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No se pudo procesar el pago'
      setPaymentState('error')
      setPaymentMessage(message)

      setTimeout(() => {
        setPaymentState('idle')
        setPaymentMessage(null)
      }, 3500)
    }
  }

  const isPaymentBusy = paymentState === 'processing'

  return (
    <div className="flex flex-col gap-[16px] w-full rounded-[10px] px-[9px] py-[9px] bg-[#F7F7F7]">
      <div className="flex items-center gap-[6px] w-full">
        <div className="flex items-center justify-center w-[30px] h-[30px] rounded-[9px] bg-white">
          <MoneyBillIcon />
        </div>
        <span className="font-inter-regular text-[16px] text-black">Pago</span>
      </div>

      <div className="flex flex-col gap-[8px] w-full">
        <span className="font-inter-regular text-[13px] text-[#888888]">
          Método de pago
        </span>

        {isLoadingMethods && (
          <div className="rounded-[14px] border border-[#E9ECEF] bg-white px-[12px] py-[14px]">
            <span className="font-inter-regular text-[13px] text-[#6C757D]">
              Cargando tarjetas...
            </span>
          </div>
        )}

        {!isLoadingMethods && methodsError && (
          <div className="rounded-[14px] border border-[#F1C0C0] bg-[#FFF5F5] px-[12px] py-[14px]">
            <p className="font-inter-regular text-[13px] text-[#A82424]">{methodsError}</p>
            <button
              type="button"
              onClick={loadPaymentMethods}
              className="mt-[8px] font-inter-medium text-[13px] text-[#027AFF]"
            >
              Reintentar
            </button>
          </div>
        )}

        {!isLoadingMethods && !methodsError && (
          <div className="flex flex-col gap-[8px]">
            {paymentMethods.map((method) => {
              const isSelected = method.id === selectedMethodId
              return (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => setSelectedMethodId(method.id)}
                  className={`flex items-center justify-between w-full rounded-[14px] border px-[14px] py-[12px] bg-white transition-colors ${
                    isSelected
                      ? 'border-[#027AFF] ring-1 ring-[#027AFF]/20'
                      : 'border-[#E9ECEF] hover:border-[#CED4DA]'
                  }`}
                >
                  <div className="flex items-center gap-[10px] min-w-0">
                    <div className="flex h-[28px] min-w-[44px] items-center justify-center rounded-[8px] bg-[#F1F3F5] px-[8px]">
                      <span className="font-inter-semibold text-[11px] uppercase text-[#495057]">
                        {getCardBrandLabel(method.emisor)}
                      </span>
                    </div>
                    <div className="flex flex-col items-start min-w-0">
                      <span className="font-inter-medium text-[14px] text-[#2B333B] truncate">
                        {maskCardNumber(method.numeroTarjeta)}
                      </span>
                      <span className="font-inter-regular text-[12px] text-[#6C757D] truncate">
                        {method.nombreCompleto || method.email || 'Tarjeta guardada'}
                      </span>
                    </div>
                  </div>
                  <div
                    className={`h-[18px] w-[18px] rounded-full border ${
                      isSelected ? 'border-[#027AFF] border-[5px]' : 'border-[#CED4DA]'
                    }`}
                  />
                </button>
              )
            })}

            {!showAddForm ? (
              <button
                type="button"
                onClick={() => setShowAddForm(true)}
                className="flex items-center justify-center w-full rounded-[14px] border border-dashed border-[#CED4DA] bg-white px-[14px] py-[12px] hover:border-[#027AFF] hover:bg-[rgba(2,122,255,0.02)] transition-colors"
              >
                <span className="font-inter-medium text-[14px] text-[#027AFF]">
                  + Agregar tarjeta
                </span>
              </button>
            ) : (
              <AddPaymentMethodForm
                authUser={authUser}
                onCancel={() => setShowAddForm(false)}
                onAdded={() => {
                  setShowAddForm(false)
                  loadPaymentMethods()
                }}
              />
            )}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-[8px] w-full">
        <span className="font-inter-regular text-[16px] text-black">Propina</span>
        <div className="grid grid-cols-4 gap-[8px] w-full">
          {TIP_OPTIONS.map((percentage) => {
            const value = (importe * percentage) / 100
            const isSelected = selectedTipPercentage === percentage
            return (
              <button
                key={percentage}
                type="button"
                onClick={() => setSelectedTipPercentage(percentage)}
                className={`flex flex-col items-center justify-center rounded-[14px] border py-[10px] transition-all ${
                  isSelected
                    ? 'border-[#027AFF] bg-[rgba(2,122,255,0.05)]'
                    : 'border-[#E9ECEF] bg-white hover:border-[#CED4DA]'
                }`}
              >
                <span
                  className={`font-inter-semibold text-[16px] ${
                    isSelected ? 'text-[#027AFF]' : 'text-[#495057]'
                  }`}
                >
                  {percentage}%
                </span>
                <span className="font-inter-regular text-[12px] text-[#6C757D]">
                  {currencySymbol}
                  {value.toFixed(2)}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="flex flex-col gap-[8px] w-full">
        <button
          type="button"
          disabled={!isPayEnabled || isPaymentBusy || paymentState === 'success'}
          onClick={handlePay}
          className={`flex items-center justify-center gap-[8px] w-full h-[44px] rounded-[22px] transition-all duration-300 overflow-hidden ${
            paymentState === 'success'
              ? 'bg-[#2CA824] cursor-default'
              : paymentState === 'error'
              ? 'bg-[#DC3545] hover:bg-[#DC3545]'
              : isPaymentBusy
              ? 'bg-[#027AFF] cursor-not-allowed'
              : isPayEnabled
              ? 'bg-[#027AFF] hover:bg-[#0266D6]'
              : 'bg-[#027AFF] opacity-50 cursor-not-allowed'
          }`}
        >
          <AnimatePresence mode="wait">
            {paymentState === 'idle' && (
              <motion.div
                key="pay-idle"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-[8px]"
              >
                <span className="font-inter-semibold text-[14px] text-white">Pagar</span>
                <span className="font-inter-semibold text-[14px] text-white">
                  {currencySymbol}
                  {totalWithTip.toFixed(2)}
                </span>
              </motion.div>
            )}

            {paymentState === 'processing' && (
              <motion.div
                key="pay-processing"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-[8px]"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 1,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: 'linear',
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="#FFFFFF"
                      strokeWidth="3"
                      strokeOpacity="0.25"
                    />
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="#FFFFFF"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeDasharray="40 60"
                    />
                  </svg>
                </motion.div>
                <span className="font-inter-medium text-[14px] text-white">
                  Procesando...
                </span>
              </motion.div>
            )}

            {paymentState === 'success' && (
              <motion.div
                key="pay-success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="flex items-center gap-[8px]"
              >
                <motion.svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                >
                  <motion.path
                    d="M5 12L10 17L19 8"
                    stroke="white"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                  />
                </motion.svg>
                <span className="font-inter-medium text-[14px] text-white">Pagado</span>
              </motion.div>
            )}

            {paymentState === 'error' && (
              <motion.div
                key="pay-error"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-[8px]"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M6 6L18 18M18 6L6 18"
                    stroke="white"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                </svg>
                <span className="font-inter-medium text-[14px] text-white">Error</span>
              </motion.div>
            )}
          </AnimatePresence>
        </button>

        <AnimatePresence>
          {paymentMessage && paymentState !== 'idle' && paymentState !== 'processing' && (
            <motion.p
              key={paymentMessage}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2 }}
              className={`text-center font-inter-regular text-[13px] leading-[16px] ${
                paymentState === 'success' ? 'text-[#2CA824]' : 'text-[#DC3545]'
              }`}
            >
              {paymentMessage}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
