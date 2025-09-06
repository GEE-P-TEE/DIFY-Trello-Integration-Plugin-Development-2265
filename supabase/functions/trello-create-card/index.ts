import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from '../_shared/cors.ts'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { credentials, cardData } = await req.json()
    
    if (!credentials?.apiKey || !credentials?.token) {
      throw new Error('API key and token are required')
    }

    if (!cardData?.title || !cardData?.description || !cardData?.listId) {
      throw new Error('Title, description, and list ID are required')
    }

    // Create card
    const createUrl = new URL('https://api.trello.com/1/cards')
    const params = new URLSearchParams({
      key: credentials.apiKey,
      token: credentials.token,
      idList: cardData.listId,
      name: cardData.title.substring(0, 512), // Trello title limit
      desc: cardData.description.substring(0, 16384) // Trello description limit
    })

    if (cardData.dueDate) {
      params.set('due', cardData.dueDate)
    }

    if (cardData.assigneeId) {
      params.set('idMembers', cardData.assigneeId)
    }

    const response = await fetch(createUrl.toString(), {
      method: 'POST',
      body: params
    })

    if (response.status === 429) {
      throw new Error('Rate limited. Please try again in a moment.')
    }

    if (!response.ok) {
      const errorData = await response.text()
      throw new Error(`Failed to create card: ${response.status} - ${errorData}`)
    }

    const card = await response.json()

    // Add labels if specified
    if (cardData.labelIds && cardData.labelIds.length > 0) {
      for (const labelId of cardData.labelIds) {
        try {
          const labelUrl = new URL(`https://api.trello.com/1/cards/${card.id}/idLabels`)
          const labelParams = new URLSearchParams({
            key: credentials.apiKey,
            token: credentials.token,
            value: labelId
          })

          await fetch(labelUrl.toString(), {
            method: 'POST',
            body: labelParams
          })
        } catch (labelError) {
          console.warn('Failed to add label:', labelError)
          // Continue without failing the entire operation
        }
      }
    }

    return new Response(
      JSON.stringify(card),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    )

  } catch (error) {
    console.error('Card creation error:', error)
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