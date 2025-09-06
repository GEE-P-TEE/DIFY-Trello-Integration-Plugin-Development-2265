import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from '../_shared/cors.ts'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { credentials, boardId } = await req.json()
    
    if (!credentials?.apiKey || !credentials?.token) {
      throw new Error('API key and token are required')
    }

    if (!boardId) {
      throw new Error('Board ID is required')
    }

    const url = new URL(`https://api.trello.com/1/boards/${boardId}/lists`)
    url.searchParams.set('key', credentials.apiKey)
    url.searchParams.set('token', credentials.token)
    url.searchParams.set('filter', 'open')
    url.searchParams.set('fields', 'id,name,pos')

    const response = await fetch(url.toString())
    
    if (!response.ok) {
      throw new Error(`Failed to fetch lists: ${response.status}`)
    }

    const lists = await response.json()

    return new Response(
      JSON.stringify(lists),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    )

  } catch (error) {
    console.error('Lists fetch error:', error)
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