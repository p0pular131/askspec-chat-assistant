// Edge function for database helper functions
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

const supabaseUrl = Deno.env.get('SUPABASE_URL') as string
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string
const supabase = createClient(supabaseUrl, supabaseKey)

// Define CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    });
  }

  try {
    const { action, data } = await req.json()
    
    if (action === 'create_new_session') {
      const { user_id } = data
      
      // Get next ID
      const { data: lastSession, error: idError } = await supabase
        .from('sessions')
        .select('id')
        .order('id', { ascending: false })
        .limit(1)
      
      if (idError) {
        return new Response(JSON.stringify({ error: idError.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }
      
      const nextId = lastSession && lastSession.length > 0 ? lastSession[0].id + 1 : 1
      
      // Create session with generated ID
      const { data: newSession, error } = await supabase
        .from('sessions')
        .insert({
          id: nextId,
          user_id: user_id,
          created_at: new Date().toISOString()
        })
        .select()
      
      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }
      
      return new Response(JSON.stringify(newSession), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }
    
    if (action === 'create_new_message') {
      // Get the next message ID
      const { data: maxIdData, error: idError } = await supabase
        .from('messages')
        .select('id')
        .order('id', { ascending: false })
        .limit(1)
      
      if (idError) {
        return new Response(JSON.stringify({ error: idError.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }
      
      const nextId = maxIdData && maxIdData.length > 0 ? maxIdData[0].id + 1 : 1
      
      // Add the new message with the chat_mode field
      const { data: newMessage, error } = await supabase
        .from('messages')
        .insert({
          id: nextId,
          session_id: data.session_id,
          input_text: data.input_text,
          role: data.role,
          chat_mode: data.chat_mode || '범용 검색' // Add chat_mode to the message
        })
        .select()
      
      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }
      
      return new Response(JSON.stringify(newMessage), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }
    
    return new Response(JSON.stringify({ error: 'Unknown action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
