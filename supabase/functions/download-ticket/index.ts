import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface DownloadTicketRequest {
  ticketId: number | string
}

interface InterwebResponse {
  resultado: boolean
  mensaje: string
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const blikonApiUrl = Deno.env.get('BLIKON_API_URL')
    const blikonApiToken = Deno.env.get('BLIKON_API_TOKEN')

    if (!blikonApiUrl || !blikonApiToken) {
      console.error('Missing BLIKON_API_URL or BLIKON_API_TOKEN environment variables')
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Configuración del servidor incompleta',
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Get ticketId from query params
    const url = new URL(req.url)
    const ticketId = url.searchParams.get('ticketId')

    if (!ticketId) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'ticketId es requerido',
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    console.log(`Downloading ticket PDF for ticketId: ${ticketId}`)

    // Call the Interweb API
    const apiUrl = `${blikonApiUrl}/api/Tickets/GenerarPdfTicket?ticketId=${ticketId}`
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${blikonApiToken}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      console.error(`Interweb API error: ${response.status} ${response.statusText}`)
      return new Response(
        JSON.stringify({
          success: false,
          error: `Error al generar el PDF: ${response.statusText}`,
        }),
        {
          status: response.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    const data: InterwebResponse = await response.json()

    if (!data.resultado) {
      console.error('Interweb API returned resultado: false', data.mensaje)
      return new Response(
        JSON.stringify({
          success: false,
          error: data.mensaje || 'Error al generar el PDF',
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    console.log('PDF generated successfully')

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          resultado: data.resultado,
          mensaje: data.mensaje,
        },
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error('Error in download-ticket function:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
