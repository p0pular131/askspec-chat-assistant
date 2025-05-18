
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
    
    if (action === 'create_message') {
      const { session_id, input_text, role } = data
      
      // Get next ID
      const { data: lastMessage, error: idError } = await supabase
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
      
      const nextId = lastMessage && lastMessage.length > 0 ? lastMessage[0].id + 1 : 1
      
      // Create message with generated ID
      const { data: newMessage, error } = await supabase
        .from('messages')
        .insert({
          id: nextId,
          session_id: session_id,
          input_text: input_text,
          role: role,
          created_at: new Date().toISOString()
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
