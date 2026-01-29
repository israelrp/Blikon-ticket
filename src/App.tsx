import { useEffect, useState } from 'react'
import { EParkingLogo } from './components/EParkingLogo'
import { GenericTicketDetails } from './components/GenericTicketDetails'
import type { GenericTicketDetailsData } from './types/ticket'
import {
  extractTicketParamsFromUrl,
  fetchTicket,
  type TicketUrlParams,
} from './services/ticketService'
import './index.css' // Import Tailwind CSS

function App() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [ticketDetails, setTicketDetails] = useState<GenericTicketDetailsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [urlParams, setUrlParams] = useState<TicketUrlParams | null>(null)

  // Extract URL params and fetch ticket
  useEffect(() => {
    const loadTicket = async () => {
      setIsLoading(true)
      setError(null)

      const params = extractTicketParamsFromUrl()
      setUrlParams(params)

      if (!params.ticketId || !params.folio) {
        setError('URL inválida: no se encontró ticketId o folio')
        setIsLoading(false)
        return
      }

      const result = await fetchTicket(params.ticketId, params.folio)

      if (result.success && result.ticket) {
        setTicketDetails(result.ticket)
      } else {
        setError(result.error || 'Error desconocido')
      }

      setIsLoading(false)
    }

    loadTicket()
  }, [])

  // Handle scroll for sticky header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0)
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex justify-center items-center px-2 pt-3 pb-4">
        <div className="w-full max-w-md">
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin mb-4" />
            <span className="text-[14px] text-[#6C757D]">Cargando ticket...</span>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !ticketDetails) {
    return (
      <div className="min-h-screen bg-gray-100 flex justify-center items-center px-2 pt-3 pb-4">
        <div className="w-full max-w-md">
          <div className="mx-[9px] p-6 rounded-[17px] bg-white">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="9" stroke="#DC3545" strokeWidth="2" />
                  <path d="M15 9L9 15M9 9L15 15" stroke="#DC3545" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              <div>
                <h2 className="text-[18px] font-semibold text-[#2B333B] mb-2">
                  No se pudo cargar el ticket
                </h2>
                <p className="text-[14px] text-[#6C757D]">
                  {error || 'Ticket no encontrado'}
                </p>
              </div>
              {urlParams && (
                <div className="text-[12px] text-[#ADB5BD] mt-2">
                  <p>ticketId: {urlParams.ticketId || 'no definido'}</p>
                  <p>folio: {urlParams.folio || 'no definido'}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Get place name for header
  const placeName = ticketDetails.metadata?.nombreplace || 'Ticket'

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center px-2 pt-3 pb-4">
      <div className="w-full max-w-md">
        <section
          className={`sticky top-3 z-10 flex items-center justify-between mb-[6px] mx-[9px] px-[8px] rounded-[31px] bg-white transition-shadow ${
            isScrolled ? 'shadow-md' : 'shadow-none'
          }`}
        >
          <div className="flex items-center h-[52px]">
            {ticketDetails.metadata?.icono ? (
              <img
                src={ticketDetails.metadata.icono}
                alt={placeName}
                className="min-w-[38px] max-w-[38px] h-[38px] ml-[9px] rounded-full bg-white object-cover"
              />
            ) : (
              <EParkingLogo size="medium" className="min-w-[57px] max-w-[57px] h-[38px] ml-[9px] rounded-full bg-white shadow-none" />
            )}
            <div className="ml-[9px] flex flex-col justify-center">
              <p className="text-[15px] font-bold text-black leading-tight">{placeName}</p>
              <span className="text-[12px] text-[#989898] leading-tight">
                {window.location.hostname}
              </span>
            </div>
          </div>
        </section>

        <GenericTicketDetails ticketDetails={ticketDetails} />
      </div>
    </div>
  )
}

export default App