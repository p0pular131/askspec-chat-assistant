
import { supabase } from '../integrations/supabase/client';
import { Build, Component } from '@/hooks/useBuilds';
import { toast } from '@/components/ui/use-toast';
import { Json } from '@/integrations/supabase/types';

/**
 * Extracts build information from a message content
 * @param content Message content to extract from
 * @returns Extracted build information or null if no build detected
 */
export const extractBuildFromContent = (content: string): {
  components: Component[];
  totalPrice: number;
  recommendation: string;
} | null => {
  // Check if the content has a PC build recommendation
  const hasBuildRecommendation = 
    (content.includes('CPU') || content.includes('프로세서')) && 
    (content.includes('GPU') || content.includes('그래픽카드')) && 
    (content.includes('RAM') || content.includes('메모리'));
  
  if (!hasBuildRecommendation) return null;
  
  // Extract price with improved regex
  let totalPrice = 0;
  const pricePatterns = [
    /총\s*가격[:\s]*₩?([0-9,]+)원?/i,
    /총\s*예산[:\s]*₩?([0-9,]+)원?/i,
    /총\s*비용[:\s]*₩?([0-9,]+)원?/i,
    /전체\s*가격[:\s]*₩?([0-9,]+)원?/i,
    /가격[:\s]*₩?([0-9,]+)원?/i,
    /예상\s*비용[:\s]*약?\s*₩?([0-9,]+)원?/i,
    /총액[:\s]*₩?([0-9,]+)원?/i,
    /합계[:\s]*₩?([0-9,]+)원?/i,
    /전체\s*비용[:\s]*₩?([0-9,]+)원?/i
  ];
  
  for (const pattern of pricePatterns) {
    const priceMatch = content.match(pattern);
    if (priceMatch && priceMatch[1]) {
      // Convert string like "1,500,000" to number 1500000
      totalPrice = Number(priceMatch[1].replace(/,/g, ''));
      break;
    }
  }
  
  // If no price found, try to find any number followed by the won symbol
  if (totalPrice === 0) {
    const wonMatch = content.match(/([0-9,]+)원/);
    if (wonMatch && wonMatch[1]) {
      totalPrice = Number(wonMatch[1].replace(/,/g, ''));
    }
  }
  
  // If still no price, use a default value
  if (totalPrice === 0) {
    totalPrice = 1000000; // Default to 1,000,000 won
  }
  
  // Component extraction with Korean and English patterns
  const components: Component[] = [];
  const componentTypes = [
    { type: 'CPU', patterns: [/CPU[:\s]+(.*?)(?=\n|GPU|그래픽|메모리|RAM|저장장치|Storage|SSD|HDD|마더보드|케이스|전원|쿨러|냉각)/is, /프로세서[:\s]+(.*?)(?=\n|GPU|그래픽|메모리|RAM|저장장치|Storage|SSD|HDD|마더보드|케이스|전원|쿨러|냉각)/is] },
    { type: 'GPU', patterns: [/(GPU|그래픽카드|그래픽)[:\s]+(.*?)(?=\n|CPU|프로세서|메모리|RAM|저장장치|Storage|SSD|HDD|마더보드|케이스|전원|쿨러|냉각)/is] },
    { type: 'RAM', patterns: [/(RAM|메모리)[:\s]+(.*?)(?=\n|CPU|프로세서|GPU|그래픽|저장장치|Storage|SSD|HDD|마더보드|케이스|전원|쿨러|냉각)/is] },
    { type: 'Storage', patterns: [/(저장장치|Storage|SSD|HDD)[:\s]+(.*?)(?=\n|CPU|프로세서|GPU|그래픽|메모리|RAM|마더보드|케이스|전원|쿨러|냉각)/is] },
    { type: 'Motherboard', patterns: [/(Motherboard|마더보드|메인보드)[:\s]+(.*?)(?=\n|CPU|프로세서|GPU|그래픽|메모리|RAM|저장장치|Storage|SSD|HDD|케이스|전원|쿨러|냉각)/is] },
    { type: 'Case', patterns: [/(Case|케이스)[:\s]+(.*?)(?=\n|CPU|프로세서|GPU|그래픽|메모리|RAM|저장장치|Storage|SSD|HDD|마더보드|전원|쿨러|냉각)/is] },
    { type: 'PSU', patterns: [/(PSU|Power Supply|전원공급장치|전원|파워 서플라이|파워)[:\s]+(.*?)(?=\n|CPU|프로세서|GPU|그래픽|메모리|RAM|저장장치|Storage|SSD|HDD|마더보드|케이스|쿨러|냉각)/is] },
    { type: 'Cooler', patterns: [/(Cooling|쿨러|냉각장치|냉각|CPU 쿨러|Cooler)[:\s]+(.*?)(?=\n|CPU|프로세서|GPU|그래픽|메모리|RAM|저장장치|Storage|SSD|HDD|마더보드|케이스|전원)/is] }
  ];
  
  // Extract components
  for (const componentConfig of componentTypes) {
    let matched = false;
    for (const pattern of componentConfig.patterns) {
      const match = content.match(pattern);
      if (match && match.length > 1) {
        const componentText = match[match.length - 1].trim();
        const purchaseLinkMatch = componentText.match(/https?:\/\/[^\s)]+/i);
        
        components.push({
          name: componentText.replace(/https?:\/\/[^\s)]+/gi, '').trim(),
          type: componentConfig.type,
          image: '',
          specs: componentText,
          reason: `선택된 최적의 성능과 가치를 위한 부품`,
          purchase_link: purchaseLinkMatch ? purchaseLinkMatch[0] : '',
          alternatives: []
        });
        matched = true;
        break;
      }
    }
  }

  // If not enough components found from patterns, try numbered list
  if (components.length < 3) {
    // Try to extract from markdown lists
    const listItemRegexps = [
      /(?:\d+[\.\)]\s*|\*\s+|•\s+|-\s+)(?:\*\*)?([^:]+)(?:\*\*)?:?\s*([^\n]+)/g,
      /\*\*([^*]+)\*\*:?\s*([^\n]+)/g,
      /([^:]+):\s*([^\n]+)/g
    ];
    
    for (const regexp of listItemRegexps) {
      let match;
      // Create a copy of the regex for each iteration to reset the lastIndex
      const regex = new RegExp(regexp);
      while ((match = regex.exec(content)) !== null) {
        const itemName = match[1].trim();
        const itemValue = match[2].trim();
        
        // Check if this is a PC component
        const componentType = determineComponentType(itemName);
        if (componentType) {
          // Check if this component type already exists
          const existingComponent = components.find(c => c.type === componentType);
          if (!existingComponent) {
            components.push({
              name: itemValue,
              type: componentType,
              image: '',
              specs: itemValue,
              reason: '추천 부품',
              purchase_link: '',
              alternatives: []
            });
          }
        }
      }
    }
  }
  
  // Extract recommendation purpose
  let recommendation = '';
  const purposePatterns = [
    /이\s*견적은\s*(.*?)(?=\n|CPU|GPU|그래픽)/i,
    /이\s*PC는\s*(.*?)(?=\n|CPU|GPU|그래픽)/i,
    /추천\s*이유[:\s]+(.*?)(?=\n|CPU|GPU|그래픽)/i,
    /용도[:\s]+(.*?)(?=\n|CPU|GPU|그래픽)/i,
    /목적[:\s]+(.*?)(?=\n|CPU|GPU|그래픽)/i
  ];
  
  for (const pattern of purposePatterns) {
    const purposeMatch = content.match(pattern);
    if (purposeMatch && purposeMatch[1]) {
      recommendation = purposeMatch[1].trim();
      break;
    }
  }
  
  // If no recommendation found, use the first paragraph
  if (!recommendation) {
    const firstParagraphMatch = content.match(/^([^]*?)(?=\n\n|\n[A-Z]|\n[0-9])/);
    if (firstParagraphMatch) {
      recommendation = firstParagraphMatch[0].trim();
    } else {
      recommendation = '맞춤형 견적 추천';
    }
  }

  // Only return a valid build if we found at least 3 components
  if (components.length >= 3) {
    return {
      components,
      totalPrice,
      recommendation
    };
  }
  
  return null;
};

// Helper function to determine component type from text
function determineComponentType(text: string): string | null {
  text = text.toLowerCase();
  if (text.includes('cpu') || text.includes('프로세서') || text.includes('processor')) return 'CPU';
  if (text.includes('gpu') || text.includes('그래픽') || text.includes('graphics')) return 'GPU'; 
  if (text.includes('ram') || text.includes('메모리') || text.includes('memory')) return 'RAM';
  if (text.includes('ssd') || text.includes('hdd') || text.includes('storage') || text.includes('저장')) return 'Storage';
  if (text.includes('motherboard') || text.includes('마더보드') || text.includes('메인보드')) return 'Motherboard';
  if (text.includes('case') || text.includes('케이스')) return 'Case';
  if (text.includes('psu') || text.includes('power') || text.includes('전원')) return 'PSU';
  if (text.includes('cooler') || text.includes('cooling') || text.includes('쿨러') || text.includes('냉각')) return 'Cooler';
  return null;
}

/**
 * Generates build name from components
 * @param components Components to generate name from
 * @param purpose Purpose of the build (optional)
 * @returns Generated build name
 */
export const generateBuildName = (components: Component[], purpose?: string): string => {
  // Get CPU and GPU if available
  const cpu = components.find(c => c.type === 'CPU')?.name.substring(0, 15) || '';
  const gpu = components.find(c => c.type === 'GPU')?.name.substring(0, 15) || '';
  
  if (cpu && gpu) {
    return `${cpu} + ${gpu} 구성`;
  } else if (purpose) {
    return `${purpose.substring(0, 20)} 견적`;
  } else {
    return '맞춤형 PC 견적';
  }
};

/**
 * Process all existing messages to find builds
 * This function will generate PC builds from existing messages and store them in the database
 */
export const generateBuildsFromMessages = async (): Promise<void> => {
  try {
    // Get all sessions
    const { data: sessions, error: sessionError } = await supabase
      .from('sessions')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (sessionError) {
      console.error('Error loading sessions:', sessionError);
      throw sessionError;
    }
    
    // For each session
    for (const session of sessions || []) {
      // Check if a build already exists for this session
      const { data: existingBuilds } = await supabase
        .from('estimates')
        .select('id')
        .eq('session_id', session.id);
        
      // If build already exists, skip
      if (existingBuilds && existingBuilds.length > 0) {
        continue;
      }
      
      // Get all messages for this session
      const { data: messages, error: msgError } = await supabase
        .from('messages')
        .select('*')
        .eq('session_id', session.id)
        .eq('role', 'assistant')  // Only look at assistant messages
        .order('created_at', { ascending: true });
        
      if (msgError) {
        console.error(`Error loading messages for session ${session.id}:`, msgError);
        continue;
      }
      
      // For each assistant message, try to extract a build
      for (const message of messages || []) {
        const buildInfo = extractBuildFromContent(message.input_text);
        
        if (buildInfo && buildInfo.components.length >= 3) {
          // Get the next estimate ID
          const { data: maxIdData, error: maxIdError } = await supabase
            .from('estimates')
            .select('id')
            .order('id', { ascending: false })
            .limit(1);
            
          if (maxIdError) {
            console.error("Error getting next estimate ID:", maxIdError);
            continue;
          }
          
          const nextId = maxIdData && maxIdData.length > 0 ? maxIdData[0].id + 1 : 1;
          
          // Generate a name for the build
          const buildName = generateBuildName(
            buildInfo.components, 
            buildInfo.recommendation
          );
          
          // Convert Component[] to metrics_score_json format
          const metricsScoreJson: any = {};
          buildInfo.components.forEach(comp => {
            const lowerType = comp.type.toLowerCase();
            metricsScoreJson[lowerType] = {
              name: comp.name,
              specs: comp.specs,
              price: comp.price || 0
            };
          });
          
          // Save the build to the database
          const { error: saveError } = await supabase
            .from('estimates')
            .insert({
              id: nextId,
              name: buildName,
              session_id: session.id,
              metrics_score_json: metricsScoreJson,
              total_price: buildInfo.totalPrice,
              purpose: buildName,
              compatibility: true,
              compatibility_json: { valueForMoney: 5, noise: 3, performance: 4 },
              overall_reason: buildInfo.recommendation
            });
            
          if (saveError) {
            console.error(`Error saving build for session ${session.id}:`, saveError);
          } else {
            console.log(`Successfully generated build for session ${session.id}`);
            // Once we find a build in this session, move to the next one
            break;
          }
        }
      }
    }
    
    toast({
      title: "PC 견적 생성 완료",
      description: "기존 대화에서 PC 견적이 생성되었습니다.",
    });
  } catch (error) {
    console.error('Error generating builds:', error);
    toast({
      title: "PC 견적 생성 실패",
      description: "PC 견적을 생성하는 중 오류가 발생했습니다.",
      variant: "destructive",
    });
  }
};
