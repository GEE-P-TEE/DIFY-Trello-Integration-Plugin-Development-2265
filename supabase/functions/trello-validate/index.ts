import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from '../_shared/cors.ts'

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { credentials } = await req.json()
    
    if (!credentials?.apiKey || !credentials?.token) {
      throw new Error('API key and token are required')
    }

    // Validate credentials by calling Trello API
    const response = await fetch(`https://api.trello.com/1/members/me?key=${credentials.apiKey}&token=${credentials.token}`)
    
    if (response.status === 401) {
      throw new Error('Invalid API key or token')
    } else if (response.status === 403) {
      throw new Error('Access denied. Please check your token permissions')
    } else if (!response.ok) {
      throw new Error(`API validation failed: ${response.status}`)
    }

    const userData = await response.json()
    
    if (!userData.id) {
      throw new Error('Invalid API response format')
    }

    return new Response(
      JSON.stringify(userData),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    )

  } catch (error) {
    console.error('Validation error:', error)
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