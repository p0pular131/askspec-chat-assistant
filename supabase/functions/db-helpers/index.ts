
import { serve } from 'https://deno.land/std@0.131.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.0.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  try {
    // Create a Supabase client with the Auth context
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Parse request body
    const requestData = await req.json();
    const { action, data } = requestData;

    // Perform requested action
    let result;
    switch (action) {
      case 'create_new_session':
        // Create a new session
        const { data: sessionData, error: sessionError } = await supabase
          .from('sessions')
          .insert([data])
          .select();
        
        if (sessionError) {
          console.error('Session creation error:', sessionError);
          return new Response(
            JSON.stringify({ error: 'Failed to create session' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
          );
        }
        
        result = sessionData;
        break;
        
      case 'create_new_message':
        // Add chat_mode field to the data if not present
        if (!data.chat_mode) {
          data.chat_mode = '범용 검색'; // Default value
        }
        
        // Create a new message
        const { data: messageData, error: messageError } = await supabase
          .from('messages')
          .insert([data])
          .select();
          
        if (messageError) {
          console.error('Message creation error:', messageError);
          return new Response(
            JSON.stringify({ error: 'Failed to create message' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
          );
        }
        
        result = messageData;
        break;

      case 'update_session':
        // Update an existing session
        const { data: updatedSessionData, error: updateError } = await supabase
          .from('sessions')
          .update(data.updates)
          .eq('id', data.id)
          .select();
          
        if (updateError) {
          return new Response(
            JSON.stringify({ error: 'Failed to update session' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
          );
        }
        
        result = updatedSessionData;
        break;

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
    }

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in db-helpers function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
