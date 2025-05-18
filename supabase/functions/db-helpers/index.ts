
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

    // Helper function to get next available ID
    async function getNextId(tableName: string) {
      const { data: maxIdData, error: maxIdError } = await supabase
        .from(tableName)
        .select('id')
        .order('id', { ascending: false })
        .limit(1);

      if (maxIdError) {
        console.error(`Error getting max ID for ${tableName}:`, maxIdError);
        return 1; // Start with 1 if there's an error
      }

      return maxIdData && maxIdData.length > 0 ? maxIdData[0].id + 1 : 1;
    }

    // Perform requested action
    let result;
    switch (action) {
      case 'create_new_session':
        // Get the next available session ID
        const nextSessionId = await getNextId('sessions');
        
        // Create a new session with an explicit ID
        const sessionData = {
          ...data,
          id: nextSessionId, // Explicitly set the ID
          created_at: new Date().toISOString() // Ensure created_at is set
        };
        
        const { data: newSessionData, error: sessionError } = await supabase
          .from('sessions')
          .insert([sessionData])
          .select();
        
        if (sessionError) {
          console.error('Session creation error:', sessionError);
          return new Response(
            JSON.stringify({ error: 'Failed to create session' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
          );
        }
        
        result = newSessionData;
        break;
        
      case 'create_new_message':
        // Get the next available message ID
        const nextMessageId = await getNextId('messages');
        
        // Remove chat_mode as it's not a column in the database
        const { chat_mode, ...messageDataWithoutChatMode } = data;
        
        // Create a new message
        const messageData = {
          ...messageDataWithoutChatMode,
          id: nextMessageId, // Explicitly set the ID
          created_at: new Date().toISOString() // Ensure created_at is set
        };
        
        const { data: newMessageData, error: messageError } = await supabase
          .from('messages')
          .insert([messageData])
          .select();
          
        if (messageError) {
          console.error('Message creation error:', messageError);
          return new Response(
            JSON.stringify({ error: 'Failed to create message' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
          );
        }
        
        // Add chat_mode back to the result data
        result = newMessageData?.map(msg => ({ ...msg, chat_mode: chat_mode || '범용 검색' }));
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
