import React, { useMemo } from 'react'
import type { GenericTicketDetailsData } from '../types/ticket'

interface GenericTicketDetailsProps {
  ticketDetails: GenericTicketDetailsData
  isLoading?: boolean
  loadError?: boolean
}

type IconProps = React.SVGProps<SVGSVGElement> & {
  size?: number
  color?: string
}

const CalendarIcon = ({ size = 16, color = '#6C757D' }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <rect x="3" y="5" width="18" height="16" rx="3" stroke={color} strokeWidth="1.6" />
    <path d="M7 3V7M17 3V7M3 9H21" stroke={color} strokeWidth="1.6" />
  </svg>
)

const CaretDownIcon = ({ size = 12, color = '#6C757D' }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M6 9L12 15L18 9" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
  </svg>
)

const CheckCircleIcon = ({ size = 10, color = '#2CA824' }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="2" />
    <path d="M8 12L11 15L16 9" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </svg>
)

const ClockIcon = ({ size = 10, color = '#BEA51A' }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="2" />
    <path d="M12 7V12L15 14" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </svg>
)

const DownloadSimpleIcon = ({ size = 14, color = '#ADB5BD' }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M12 4V14" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <path d="M8 10L12 14L16 10" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <path d="M4 18H20" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </svg>
)

const ExportIcon = ({ size = 14, color = '#6C757D' }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M12 4V14" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <path d="M8 8L12 4L16 8" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <path d="M5 14V18H19V14" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </svg>
)

const HeadsetIcon = ({ size = 12, color = '#6C757D' }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M4 12V17C4 18.1 4.9 19 6 19H7" stroke={color} strokeWidth="1.6" />
    <path d="M20 12V17C20 18.1 19.1 19 18 19H17" stroke={color} strokeWidth="1.6" />
    <path d="M4 12C4 7.6 7.6 4 12 4C16.4 4 20 7.6 20 12" stroke={color} strokeWidth="1.6" />
  </svg>
)

const QrCodeIcon = ({ size = 16, color = '#6C757D' }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <rect x="3" y="3" width="7" height="7" stroke={color} strokeWidth="1.6" />
    <rect x="14" y="3" width="7" height="7" stroke={color} strokeWidth="1.6" />
    <rect x="3" y="14" width="7" height="7" stroke={color} strokeWidth="1.6" />
    <path d="M14 14H21V21H14" stroke={color} strokeWidth="1.6" />
  </svg>
)

const parseTotal = (total?: string | number | null): string => {
  if (total === null || total === undefined) return '$0.00'

  if (typeof total === 'number') {
    // API sometimes returns a raw number instead of a formatted string.
    if (!Number.isFinite(total)) return '$0.00'
    return `$${total.toFixed(2)}`
  }

  const normalized = total.trim()
  if (!normalized) return '$0.00'

  // Some payloads use "¤" as currency placeholder.
  return normalized.replaceAll('¤', '$')
}

const formatCurrency = (moneda?: string): string => {
  if (!moneda) return 'MXN'
  const currencyMap: Record<string, string> = {
    MX: 'MXN',
    US: 'USD',
  }
  return currencyMap[moneda] || moneda
}

const formatDateTime = (fecha?: string, hora?: string): string => {
  if (!fecha || !hora) return '--'
  const [year, month, day] = fecha.split('-')
  const [hours, minutes] = hora.split(':')
  return `${day}/${month}/${year} ${hours}:${minutes}hrs`
}

const getStatusConfig = (estatus: number, horapagado?: string) => {
  const isPaid = Boolean(horapagado && horapagado.trim() !== '')
  if (isPaid || estatus === 2) {
    return {
      text: 'Pagado',
      icon: <CheckCircleIcon size={10} color="#2CA824" />,
    }
  }

  return {
    text: 'Sin pagar',
    icon: <ClockIcon size={10} color="#BEA51A" />,
  }
}

const getTicketTypeLabel = (tipoticket?: number): string => {
  if (!tipoticket) return 'No definido'
  if (tipoticket === 1) return 'Facturacion'
  return `Tipo ${tipoticket}`
}

const HelpIcon = ({ size = 18, color = '#000000' }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.6" />
    <path
      d="M9.7 9.4C9.9 8.4 10.8 7.7 12 7.7C13.3 7.7 14.3 8.5 14.3 9.8C14.3 11.3 12.7 11.5 12.2 12.7V13.5"
      stroke={color}
      strokeWidth="1.6"
      strokeLinecap="round"
    />
    <circle cx="12" cy="16.7" r="0.8" fill={color} />
  </svg>
)

const TicketDetailsIcon = (props: IconProps) => (
  <svg width="24" height="24" viewBox="0 0 24 24" {...props}>
    <path d="M21.2501 6.42708C21.2501 6.2801 21.2211 6.13455 21.1648 5.99878C21.1085 5.86301 21.0259 5.73967 20.9219 5.63583C20.8179 5.53199 20.6944 5.44968 20.5585 5.39361C20.4226 5.33754 20.2771 5.30882 20.1301 5.30908H10.0481C9.75156 5.30908 9.46719 5.42687 9.25752 5.63654C9.04786 5.8462 8.93007 6.13057 8.93007 6.42708V7.38308C8.93007 7.41708 8.93007 7.45008 8.93507 7.48308C8.93507 7.53508 8.93007 7.58308 8.93007 7.63908V23.1771C8.92612 23.2473 8.93789 23.3175 8.96454 23.3825C8.99118 23.4476 9.03202 23.5058 9.08407 23.5531C9.20163 23.648 9.35017 23.6961 9.50107 23.6881C9.62503 23.6889 9.74694 23.6565 9.85407 23.5941C10.0213 23.4897 10.1819 23.3751 10.3351 23.2511L12.2301 21.7681C12.2422 21.7577 12.2576 21.752 12.2736 21.752C12.2895 21.752 12.3049 21.7577 12.3171 21.7681L14.2061 23.2501C14.361 23.3731 14.5226 23.4876 14.6901 23.5931C14.7961 23.6555 14.917 23.688 15.0401 23.6871C15.0571 23.6871 15.0721 23.6871 15.0881 23.6871C15.1041 23.6871 15.1181 23.6871 15.1351 23.6871C15.259 23.6879 15.3809 23.6555 15.4881 23.5931C15.6553 23.4887 15.8159 23.3741 15.9691 23.2501L17.8631 21.7681C17.8753 21.7575 17.8909 21.7516 17.9071 21.7516C17.9232 21.7516 17.9389 21.7575 17.9511 21.7681L19.8401 23.2501C19.995 23.3731 20.1566 23.4876 20.3241 23.5931C20.43 23.6556 20.551 23.6881 20.6741 23.6871C20.8266 23.6957 20.9769 23.6476 21.0961 23.5521C21.1483 23.5049 21.1893 23.4467 21.2161 23.3816C21.243 23.3166 21.2549 23.2463 21.2511 23.1761V7.63808C21.2511 7.58408 21.2511 7.53808 21.2461 7.48208C21.2461 7.44908 21.2511 7.41608 21.2511 7.38208L21.2501 6.42708Z" fill="#6E6E6E" />
  </svg>
)


export const GenericTicketDetails: React.FC<GenericTicketDetailsProps> = ({
  ticketDetails,
  isLoading = false,
  loadError = false,
}) => {
  const metadata = ticketDetails.metadata
  const statusValue = ticketDetails.status ?? ticketDetails.estatus ?? 1
  const statusConfig = getStatusConfig(statusValue, metadata?.horapagado)
  const formattedDateTime = formatDateTime(ticketDetails.fecha, ticketDetails.hora)
  const formattedTotal = parseTotal(metadata?.total)
  const formattedCurrency = formatCurrency(metadata?.moneda)

  const sections = useMemo(() => {
    if (!ticketDetails.secciones) return []
    return Object.values(ticketDetails.secciones).map((section) => ({
      ...section,
      items: section.items ? Object.values(section.items) : [],
    }))
  }, [ticketDetails.secciones])

  const handleShare = () => {
    console.log('Share ticket:', ticketDetails)
  }

  const handleDownload = () => {
    console.log('Download ticket:', ticketDetails)
  }

  return (
    <section className="relative mx-[9px] mb-[6px] p-[10px] rounded-[17px] bg-white">
      <div className="flex flex-col items-center gap-[7px]">
        <div className="flex flex-col gap-[16px] w-full max-w-[393px] rounded-[10px] px-[9px] py-[9px] bg-[#F7F7F7]">
            <div className="flex items-center gap-[8px]">
              <div className="flex items-center justify-center w-[30px] h-[30px] rounded-[9px] border border-[#F2F2F2] bg-white">
                <TicketDetailsIcon />
              </div>
              <span className="text-[16px] text-black">Ticket</span>
            </div>

            <div className="flex flex-col gap-[8px]">
              <span className="font-semibold text-[16px] leading-[100%] text-[#2B333B]">
                {metadata?.nombreplace ?? 'Ticket'}
              </span>
              <div className="flex flex-col items-center px-[10px] py-[8px] gap-[24px] rounded-[10px] bg-[#FCFCFC]">
                <div className="flex flex-col items-start w-full">
                  <span className="text-[11px] tracking-[0.06em] uppercase text-[#ADB5BD]">
                    Folio
                  </span>
                  <span className="text-[18px] text-[#495057]">
                    {metadata?.folio ?? ticketDetails.folio}
                  </span>
                </div>

                <div className="flex flex-row items-start gap-[8px] w-full">
                  <div className="flex flex-col items-start flex-1">
                    <span className="text-[11px] tracking-[0.06em] uppercase text-[#ADB5BD]">
                      Tipo
                    </span>
                    <span className="text-[13px] text-[#495057]">
                      {getTicketTypeLabel(metadata?.tipoticket ?? ticketDetails.tipoticket)}
                    </span>
                  </div>
                </div>

                <div className="flex flex-row items-start gap-[8px] w-full">
                  <div className="flex flex-col items-start flex-1">
                    <span className="text-[11px] tracking-[0.06em] uppercase text-[#ADB5BD]">
                      Fecha
                    </span>
                    <span className="text-[13px] text-[#495057]">
                      {formattedDateTime}
                    </span>
                  </div>
                  <div className="flex flex-col items-start flex-1">
                    <span className="text-[11px] tracking-[0.06em] uppercase text-[#ADB5BD]">
                      Estatus
                    </span>
                    <div className="flex flex-row items-center gap-[4px]">
                      {statusConfig.icon}
                      <span className="text-[13px] text-[#495057]">{statusConfig.text}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-start w-full">
                  <span className="text-[11px] tracking-[0.06em] uppercase text-[#ADB5BD]">
                    Total
                  </span>
                  <div className="flex flex-row items-center gap-[4px]">
                    <span className="font-semibold text-[18px] text-[#2B333B]">
                      {formattedTotal}
                    </span>
                    <span className="text-[11px] tracking-[0.06em] text-[#ADB5BD]">
                      {formattedCurrency}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {sections.length > 0 && (
              <div className="flex flex-col items-end gap-[8px] w-full rounded-[10px] px-[10px] py-[8px] bg-[#FCFCFC]">
                {sections.map((section, index) => (
                  <div key={`${section.titulo ?? 'seccion'}-${index}`} className="w-full">
                    <div className="flex flex-col gap-[4px]">
                      <span className="text-[11px] tracking-[0.12em] uppercase text-[#ADB5BD]">
                        {section.titulo ?? 'Productos'} ({section.items?.length ?? 0})
                      </span>
                      <div className="flex flex-col gap-[4px]">
                        {section.items?.map((item, itemIndex) => (
                          <div key={`${item.nombre ?? 'item'}-${itemIndex}`} className="flex items-start gap-[8px]">
                            <span className="flex-1 text-[13px] text-[#495057]">
                              {item.nombre}
                            </span>
                            <span className="text-[13px] text-[#495057] text-right">
                              {item.valor}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="w-full border-t border-[#E9ECEF] my-[8px]" />
                    <div className="flex items-center gap-[8px] w-full">
                      <span className="flex-1 font-semibold text-[13px] text-[#2B333B]">
                        Total
                      </span>
                      <span className="font-semibold text-[13px] text-[#2B333B]">
                        {formattedTotal}
                      </span>
                      <span className="text-[11px] text-[#ADB5BD]">
                        {formattedCurrency}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex flex-col items-start gap-[8px] w-full">
              <div className="flex flex-row items-start gap-[8px] w-full">
                <button
                  type="button"
                  onClick={handleShare}
                  className="flex justify-center items-center p-[11px_16px] gap-[6px] w-[46px] h-[36px] bg-[#F0F2F4] rounded-[18px] hover:bg-[#E5E7EA] transition-colors"
                >
                  <ExportIcon size={14} color="#6C757D" />
                </button>
                <button
                  type="button"
                  onClick={handleDownload}
                  className="flex flex-row justify-center items-center p-[11px_0px] gap-[6px] flex-1 h-[36px] bg-[#F0F2F4] rounded-[18px] hover:bg-[#E5E7EA] transition-colors"
                >
                  <DownloadSimpleIcon size={14} color="#ADB5BD" />
                  <span className="text-[14px] text-center tracking-[-0.01em] text-[#495057]">
                    Descargar ticket
                  </span>
                </button>
              </div>
            </div>
          </div>

          {isLoading && (
            <div className="flex w-full max-w-[393px] justify-center py-[8px]">
              <span className="text-[13px] text-[#6C757D]">Cargando detalles del ticket...</span>
            </div>
          )}

          {loadError && (
            <div className="flex w-full max-w-[393px] justify-center py-[8px]">
              <span className="text-[13px] text-[#A82424]">
                No se pudo cargar la informacion del ticket.
              </span>
            </div>
          )}

          <div className="flex flex-col items-start gap-[8px] w-full max-w-[393px] rounded-[10px] px-[9px] py-[9px] bg-[#F7F7F7]">
            <div className="flex items-center gap-[6px]">
              <div className="flex items-center justify-center w-[30px] h-[30px] rounded-[9px] bg-white">
                <QrCodeIcon size={16} color="#6C757D" />
              </div>
              <span className="text-[16px] text-black">QR</span>
            </div>
            <div className="flex flex-col gap-[8px] w-full">
              <div className="flex items-center gap-[8px] w-full rounded-[10px] px-[8px] py-[10px] border border-[#B4B4B4] bg-white">
                <HelpIcon />
                <span className="text-[12px] leading-[15px] text-black">
                  Escanea este codigo QR para acceder de forma rapida y segura a tu ticket
                  digital, donde podras consultar todos los detalles de tu acceso.
                </span>
              </div>
              <div className="flex justify-center items-center w-[136px] h-[136px] rounded-[12px] bg-[#F8F9FA] border border-white mx-auto">
                <span className="text-[12px] text-[#6C757D]">QR</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            className="flex flex-row justify-between items-center w-full max-w-[393px] h-[44px] px-[16px] rounded-[18px] bg-[#F8F9FA]"
          >
            <span className="flex items-center gap-[6px] text-[14px] text-[#6C757D]">
              <CalendarIcon size={16} color="#6C757D" />
              Historial del boleto
            </span>
            <CaretDownIcon size={12} color="#6C757D" />
          </button>

          <button
            type="button"
            className="flex flex-row justify-between items-center w-full max-w-[393px] h-[42px] px-[16px] rounded-[18px] bg-[#F8F9FA]"
          >
            <span className="flex items-center gap-[6px] text-[14px] text-[#6C757D]">
              <HeadsetIcon size={12} color="#6C757D" />
              ¿Necesitas ayuda?
            </span>
            <CaretDownIcon size={12} color="#6C757D" />
          </button>
      </div>
    </section>
  )
}
