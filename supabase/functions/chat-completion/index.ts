
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { OpenAI } from "https://esm.sh/openai@4.28.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const openai = new OpenAI({
      apiKey: Deno.env.get('OPENAI_API_KEY'),
    });

    const { messages, chatMode } = await req.json();

    // Add system message based on chat mode
    let systemMessage = "You are AskSpec, a helpful assistant that specializes in computer hardware and PC building advice.";
    
    switch(chatMode) {
      case '범용 검색':
        systemMessage += " Answer general questions about computer hardware and PC building.";
        break;
      case '부품 추천':
        systemMessage += " Provide specific component recommendations based on user needs.";
        break;
      case '견적 추천':
        systemMessage += " Create complete PC build recommendations within user's budget and requirements.";
        break;
      case '호환성 검사':
        systemMessage += " Verify compatibility between different PC components.";
        break;
      case '스펙 업그레이드':
        systemMessage += " Suggest upgrade paths for existing PC builds to improve performance.";
        break;
      case '견적 평가':
        systemMessage += " Evaluate PC builds and provide feedback on their performance, value, and balance.";
        break;
    }

    // Add system message to the beginning
    const fullMessages = [
      { role: "system", content: systemMessage },
      ...messages
    ];

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: fullMessages,
      temperature: 0.7,
    });

    // Return the response
    return new Response(JSON.stringify({ 
      response: completion.choices[0].message.content 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
