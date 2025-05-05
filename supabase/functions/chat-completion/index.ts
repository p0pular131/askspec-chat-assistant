
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { OpenAI } from "https://esm.sh/openai@4.28.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper function to extract PC build information from AI response
const extractPcBuild = (content: string) => {
  // Basic pattern matching for PC build recommendations
  const hasBuildRecommendation = content.includes('CPU') && 
    (content.includes('GPU') || content.includes('그래픽카드')) && 
    content.includes('RAM') && 
    content.includes('SSD') || content.includes('HDD');
  
  if (!hasBuildRecommendation) return null;
  
  // Simple extraction of price
  let totalPrice = 0;
  const pricePattern = /총\s*가격[:\s]*₩?([0-9,]+)원?/i;
  const priceMatch = content.match(pricePattern);
  if (priceMatch && priceMatch[1]) {
    // Convert string like "1,500,000" to number 1500000
    totalPrice = Number(priceMatch[1].replace(/,/g, ''));
  }
  
  // Extract components
  // This is a simple extraction - in a real application, we'd want more sophisticated parsing
  const components = [
    { type: 'CPU', pattern: /CPU[:\s]+(.*?)(?=\n|GPU|그래픽카드|메모리|RAM|저장장치|Storage|SSD|HDD|마더보드|케이스|전원공급장치)/is },
    { type: 'GPU', pattern: /(GPU|그래픽카드)[:\s]+(.*?)(?=\n|CPU|메모리|RAM|저장장치|Storage|SSD|HDD|마더보드|케이스|전원공급장치)/is },
    { type: 'RAM', pattern: /(RAM|메모리)[:\s]+(.*?)(?=\n|CPU|GPU|그래픽카드|저장장치|Storage|SSD|HDD|마더보드|케이스|전원공급장치)/is },
    { type: 'Storage', pattern: /(저장장치|Storage|SSD|HDD)[:\s]+(.*?)(?=\n|CPU|GPU|그래픽카드|메모리|RAM|마더보드|케이스|전원공급장치)/is },
    { type: 'Motherboard', pattern: /(Motherboard|마더보드)[:\s]+(.*?)(?=\n|CPU|GPU|그래픽카드|메모리|RAM|저장장치|Storage|SSD|HDD|케이스|전원공급장치)/is },
    { type: 'Case', pattern: /(Case|케이스)[:\s]+(.*?)(?=\n|CPU|GPU|그래픽카드|메모리|RAM|저장장치|Storage|SSD|HDD|마더보드|전원공급장치)/is },
    { type: 'PSU', pattern: /(PSU|Power Supply|전원공급장치)[:\s]+(.*?)(?=\n|CPU|GPU|그래픽카드|메모리|RAM|저장장치|Storage|SSD|HDD|마더보드|케이스)/is }
  ];
  
  const extractedComponents = [];
  
  for (const component of components) {
    const match = content.match(component.pattern);
    if (match && match[2]) {
      const componentText = match[2].trim();
      const purchaseLinkMatch = componentText.match(/https?:\/\/[^\s)]+/i);
      
      extractedComponents.push({
        name: componentText.replace(/https?:\/\/[^\s)]+/gi, '').trim(),
        type: component.type,
        image: '',  // Would require additional processing
        specs: componentText,
        reason: `Selected for optimal performance and value`,
        purchase_link: purchaseLinkMatch ? purchaseLinkMatch[0] : '',
        alternatives: [] // Would require additional processing
      });
    }
  }
  
  // Extract purpose/recommendation
  let recommendation = '';
  const purposePattern = /이\s*빌드는\s*(.*?)(?=\n|CPU|GPU|그래픽카드)/i;
  const purposeMatch = content.match(purposePattern);
  if (purposeMatch && purposeMatch[1]) {
    recommendation = purposeMatch[1].trim();
  } else {
    // Fallback to first paragraph
    const firstParagraphMatch = content.match(/^([^]*?)(?=\n\n|\n[A-Z]|\n[0-9])/);
    if (firstParagraphMatch) {
      recommendation = firstParagraphMatch[0].trim();
    }
  }
  
  return {
    components: extractedComponents,
    totalPrice,
    recommendation
  };
};

// Function to get system message with appropriate expertise level
const getSystemMessage = (chatMode: string, expertiseLevel: string): string => {
  let baseSystemMessage = "You are AskSpec, a helpful assistant that specializes in computer hardware and PC building advice.";
  
  // Add chat mode specific instructions
  switch(chatMode) {
    case '범용 검색':
      baseSystemMessage += " Answer general questions about computer hardware and PC building.";
      break;
    case '부품 추천':
      baseSystemMessage += " Provide specific component recommendations based on user needs.";
      break;
    case '견적 추천':
      baseSystemMessage += " Create complete PC build recommendations within user's budget and requirements. Include links to purchase components.";
      break;
    case '호환성 검사':
      baseSystemMessage += " Verify compatibility between different PC components.";
      break;
    case '스펙 업그레이드':
      baseSystemMessage += " Suggest upgrade paths for existing PC builds to improve performance.";
      break;
    case '견적 평가':
      baseSystemMessage += " Evaluate PC builds and provide feedback on their performance, value, and balance.";
      break;
  }
  
  // Add expertise level specific instructions
  switch(expertiseLevel) {
    case 'expert':
      baseSystemMessage += " Use technical terminology and detailed specifications. Include model numbers, architecture details, and in-depth technical explanations. Your responses should be suitable for computer hardware enthusiasts and professionals.";
      break;
    case 'intermediate':
      baseSystemMessage += " Use a balanced approach with some technical terms, but explain them. Focus on practical information and provide enough context for users with some hardware knowledge. Strike a balance between technical accuracy and accessibility.";
      break;
    case 'beginner':
      baseSystemMessage += " Use simple, non-technical language. Avoid jargon and explain concepts in everyday terms. Use analogies where helpful. Focus on practical advice and basic information suitable for complete beginners in computer hardware.";
      break;
    default:
      baseSystemMessage += " Use a balanced approach with some technical terms, but explain them.";
  }
  
  return baseSystemMessage;
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_ANON_KEY') || ''
    );

    const openai = new OpenAI({
      apiKey: Deno.env.get('OPENAI_API_KEY'),
    });

    const { messages, chatMode, conversationId, expertiseLevel = 'intermediate' } = await req.json();

    // Get system message with appropriate expertise level
    const systemMessage = getSystemMessage(chatMode, expertiseLevel);

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

    const assistantResponse = completion.choices[0].message.content;
    
    // Check if the response contains a PC build recommendation
    if (chatMode === '견적 추천' || chatMode === '스펙 업그레이드') {
      const buildInfo = extractPcBuild(assistantResponse);
      
      // If we detected a PC build and have a conversation ID, save it
      if (buildInfo && conversationId && buildInfo.components.length > 0) {
        // Extract a title from the user's last message
        const userLastMessage = messages.findLast(msg => msg.role === 'user')?.content;
        let buildTitle = '새 PC 빌드';
        
        if (userLastMessage) {
          const titleText = userLastMessage.length > 30 
            ? userLastMessage.substring(0, 27) + '...' 
            : userLastMessage;
          buildTitle = `${titleText} 빌드`;
        }
        
        // Save the build to the database
        try {
          await supabaseClient
            .from('pc_builds')
            .insert({
              name: buildTitle,
              conversation_id: conversationId,
              components: buildInfo.components,
              total_price: buildInfo.totalPrice || 0,
              recommendation: buildInfo.recommendation || '맞춤형 PC 빌드 추천',
              rating: {}  // Empty JSON object for future ratings
            });
        } catch (error) {
          console.error("Error saving build:", error);
        }
      }
    }

    // Return the response
    return new Response(JSON.stringify({ 
      response: assistantResponse 
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
