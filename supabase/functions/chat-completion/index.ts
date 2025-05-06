
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { OpenAI } from "https://esm.sh/openai@4.28.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper function to extract PC build information from AI response
const extractPcBuild = (content) => {
  // Basic pattern matching for PC build recommendations
  const hasBuildRecommendation = content.includes('CPU') && 
    (content.includes('GPU') || content.includes('그래픽카드')) && 
    (content.includes('RAM') || content.includes('메모리')) && 
    (content.includes('SSD') || content.includes('HDD') || content.includes('스토리지'));
  
  console.log("Has build recommendation:", hasBuildRecommendation);
  console.log("Content excerpt:", content.substring(0, 200)); // Log a preview of content
  
  if (!hasBuildRecommendation) return null;
  
  // Simple extraction of price
  let totalPrice = 0;
  const pricePattern = /총\s*가격[:\s]*₩?([0-9,]+)원?/i;
  const priceMatch = content.match(pricePattern);
  if (priceMatch && priceMatch[1]) {
    // Convert string like "1,500,000" to number 1500000
    totalPrice = Number(priceMatch[1].replace(/,/g, ''));
    console.log("Extracted price:", totalPrice);
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
    if (match && match.length > 1) {
      const componentText = match[match.length - 1].trim();
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

  console.log("Extracted components:", extractedComponents.length);
  if (extractedComponents.length > 0) {
    console.log("First component:", JSON.stringify(extractedComponents[0]));
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
  
  // For non-specific PC build recommendations, try to extract components from numbered lists
  if (extractedComponents.length === 0 && content.includes('1.') && content.includes('2.')) {
    const componentTypes = ['CPU', 'GPU', 'RAM', 'Storage', 'Motherboard', 'Case', 'PSU'];
    
    for (const type of componentTypes) {
      const regex = new RegExp(`\\*\\*${type}[^*]*\\*\\*:?\\s*([^\\n]+)`, 'i');
      const match = content.match(regex);
      if (match && match[1]) {
        extractedComponents.push({
          name: match[1].trim(),
          type: type,
          image: '',
          specs: match[1].trim(),
          reason: 'Recommended component',
          purchase_link: '',
          alternatives: []
        });
      }
    }
    
    console.log("Extracted components from numbered list:", extractedComponents.length);
  }

  // Attempt to extract from any list format
  if (extractedComponents.length === 0) {
    // Try matching components in Korean or English from any list format
    const listItemPattern = /(?:\d+[\.\)]\s*|\*\s+|•\s+|-\s+)(?:\*\*)?([^:]+)(?:\*\*)?:?\s*([^\n]+)/g;
    let match;
    
    while ((match = listItemPattern.exec(content)) !== null) {
      const itemName = match[1].trim();
      const itemValue = match[2].trim();
      
      // Check if this is a PC component
      const componentType = determineComponentType(itemName);
      if (componentType) {
        extractedComponents.push({
          name: itemValue,
          type: componentType,
          image: '',
          specs: itemValue,
          reason: 'Recommended component',
          purchase_link: '',
          alternatives: []
        });
      }
    }
    
    console.log("Extracted components from general list:", extractedComponents.length);
  }
  
  // Helper function to determine component type from text
  function determineComponentType(text) {
    text = text.toLowerCase();
    if (text.includes('cpu') || text.includes('프로세서') || text.includes('processor')) return 'CPU';
    if (text.includes('gpu') || text.includes('그래픽') || text.includes('graphics')) return 'GPU'; 
    if (text.includes('ram') || text.includes('메모리') || text.includes('memory')) return 'RAM';
    if (text.includes('ssd') || text.includes('hdd') || text.includes('storage') || text.includes('저장')) return 'Storage';
    if (text.includes('motherboard') || text.includes('마더보드')) return 'Motherboard';
    if (text.includes('case') || text.includes('케이스')) return 'Case';
    if (text.includes('psu') || text.includes('power') || text.includes('전원')) return 'PSU';
    return null;
  }

  // Only return a build if we found at least some components
  if (extractedComponents.length > 0) {
    return {
      components: extractedComponents,
      totalPrice: totalPrice || 1000000, // Default to 1,000,000 if price not found
      recommendation: recommendation || '맞춤형 PC 빌드 추천'
    };
  }
  
  return null;
};

// Function to get system message with appropriate expertise level
const getSystemMessage = (chatMode, expertiseLevel) => {
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

// Function to generate a concise name based on request content
const generateConciseName = async (openai, content, isConversation = true) => {
  try {
    const prompt = isConversation 
      ? `Generate a concise one-line summary (maximum 5-7 words) for this question about computer hardware: "${content}"`
      : `Generate a concise name (maximum 5-7 words) for a PC build with this purpose and components: "${content}". Include the purpose and budget if mentioned.`;
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a concise labeling assistant. Generate very short, descriptive titles."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.5,
      max_tokens: 30,
    });
    
    let name = completion.choices[0].message.content.trim();
    
    // Remove quotes if present
    name = name.replace(/^["']|["']$/g, '');
    
    // Ensure the name is not too long
    if (name.length > 50) {
      name = name.substring(0, 47) + '...';
    }
    
    return name;
  } catch (error) {
    console.error("Error generating name:", error);
    return isConversation ? "New Conversation" : "New PC Build";
  }
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

    console.log("Calling OpenAI with messages:", JSON.stringify(fullMessages));

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: fullMessages,
      temperature: 0.7,
    });

    const assistantResponse = completion.choices[0].message.content;
    console.log("Got response from OpenAI:", assistantResponse.substring(0, 100) + "...");
    
    // We'll try to extract a PC build from ALL responses, not just specific modes
    const buildInfo = extractPcBuild(assistantResponse);
    
    // If we detected a PC build and have a conversation ID, save it
    if (buildInfo && conversationId && buildInfo.components.length > 0) {
      // Extract a title from the user's last message
      const userLastMessage = messages.findLast(msg => msg.role === 'user')?.content;
      
      // Generate a better name for the build
      const buildName = await generateConciseName(openai, userLastMessage, false);
      console.log("Generated build name:", buildName);
      
      // Save the build to the database
      try {
        console.log("Saving build to database:", {
          name: buildName,
          conversation_id: conversationId,
          components: buildInfo.components.length,
          total_price: buildInfo.totalPrice,
        });
        
        const { data, error } = await supabaseClient
          .from('pc_builds')
          .insert({
            name: buildName,
            conversation_id: conversationId,
            components: buildInfo.components,
            total_price: buildInfo.totalPrice || 0,
            recommendation: buildInfo.recommendation || '맞춤형 PC 빌드 추천',
            rating: {}  // Empty JSON object for future ratings
          })
          .select();
        
        if (error) {
          console.error("Error saving build:", error);
        } else {
          console.log("Successfully saved build:", data);
        }
      } catch (error) {
        console.error("Error saving build:", error);
      }
    } else {
      if (!buildInfo) {
        console.log("No valid PC build detected.");
      } else if (buildInfo.components.length === 0) {
        console.log("No components found in the build.");
      } else if (!conversationId) {
        console.log("No conversation ID provided.");
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
