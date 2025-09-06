import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from '../_shared/cors.ts'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { credentials } = await req.json()
    
    if (!credentials?.apiKey || !credentials?.token) {
      throw new Error('API key and token are required')
    }

    const url = new URL('https://api.trello.com/1/members/me/boards')
    url.searchParams.set('key', credentials.apiKey)
    url.searchParams.set('token', credentials.token)
    url.searchParams.set('filter', 'open')
    url.searchParams.set('fields', 'id,name,desc,url,prefs')

    const response = await fetch(url.toString())
    
    if (!response.ok) {
      throw new Error(`Failed to fetch boards: ${response.status}`)
    }

    const boards = await response.json()

    return new Response(
      JSON.stringify(boards),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    )

  } catch (error) {
    console.error('Boards fetch error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400, 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    )
  }
})