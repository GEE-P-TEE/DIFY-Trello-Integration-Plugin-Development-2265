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

    const url = new URL(`https://api.trello.com/1/boards/${boardId}/members`)
    url.searchParams.set('key', credentials.apiKey)
    url.searchParams.set('token', credentials.token)
    url.searchParams.set('fields', 'id,fullName,username,avatarUrl')

    const response = await fetch(url.toString())
    
    if (!response.ok) {
      throw new Error(`Failed to fetch members: ${response.status}`)
    }

    const members = await response.json()

    return new Response(
      JSON.stringify(members),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    )

  } catch (error) {
    console.error('Members fetch error:', error)
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