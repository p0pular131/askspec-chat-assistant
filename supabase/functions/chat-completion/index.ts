
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";

// Sample responses for different chat modes
const sampleResponses = {
  '범용 검색': `컴퓨터 하드웨어에 관한 질문에 답변드립니다. 컴퓨터 부품은 CPU, GPU, 메모리, 저장장치, 메인보드, 파워 서플라이, 케이스 등으로 구성됩니다. 각 부품은 서로 다른 역할을 하며 호환성을 고려하여 선택해야 합니다.`,
  
  '부품 추천': `요청하신 부품 추천입니다:

1. **CPU**: AMD Ryzen 7 5800X
   - 8코어 16스레드로 게임과 멀티태스킹에 강력한 성능을 제공합니다.
   
2. **그래픽카드**: NVIDIA GeForce RTX 3070
   - 2K 게이밍에 최적화된 성능을 제공하며 레이 트레이싱을 지원합니다.
   
3. **메모리**: G.SKILL Trident Z Neo 32GB (16GB x2) DDR4-3600
   - 게임과 영상 편집에 충분한 용량과 속도를 제공합니다.`,
  
  '견적 추천': `게이밍 PC 견적을 추천드립니다:

- CPU: Intel Core i7-12700K (₩450,000)
- GPU: NVIDIA RTX 3080 (₩1,200,000)  
- 메인보드: ASUS ROG STRIX Z690-A (₩350,000)
- RAM: Samsung DDR4-3600 32GB (₩180,000)
- SSD: Samsung 980 PRO 1TB (₩180,000)
- 파워: Seasonic FOCUS GX-850 (₩150,000)
- 케이스: NZXT H510 (₩120,000)
- 쿨러: NZXT Kraken X63 (₩170,000)

총 견적: ₩2,800,000

이 구성은 최신 게임을 높은 설정으로 플레이하는데 적합합니다.`,
  
  '호환성 검사': `호환성 검사 결과:

- CPU와 메인보드: ✅ 호환됨 (LGA1700 소켓 일치)
- 메인보드와 RAM: ✅ 호환됨 (DDR4 지원)
- GPU와 파워: ✅ 호환됨 (필요 전력 충분)
- 케이스와 메인보드: ✅ 호환됨 (ATX 규격 지원)
- CPU 쿨러와 CPU: ✅ 호환됨 (LGA1700 소켓 지원)

모든 부품이 서로 호환됩니다. 조립 시 문제가 없을 것으로 예상됩니다.`,
  
  '스펙 업그레이드': `현재 PC 스펙을 기반으로 다음과 같은 업그레이드를 추천합니다:

1. GPU 업그레이드: GTX 1660 → RTX 3060 Ti
   - 약 2배 이상의 게임 성능 향상
   - 비용: 약 ₩600,000
   
2. RAM 추가: 16GB → 32GB
   - 멀티태스킹 성능 향상
   - 비용: 약 ₩100,000
   
3. SSD 추가: NVMe M.2 SSD 1TB
   - 로딩 속도 대폭 향상
   - 비용: 약 ₩150,000`,
  
  '견적 평가': `제시하신 PC 견적에 대한 평가:

- 성능 점수: 8.5/10
  CPU와 GPU의 조합이 대부분의 게임과 작업에 훌륭한 성능을 제공합니다.
  
- 가성비 점수: 7/10
  3080 대신 3070 Ti를 선택하면 비용 대비 성능이 더 좋을 수 있습니다.
  
- 확장성 점수: 9/10
  향후 업그레이드 가능성이 높은 구성입니다.
  
- 호환성 점수: 10/10
  모든 부품이 완벽하게 호환됩니다.
  
총평: 좋은 구성이지만 GPU를 변경하여 비용 효율성을 높일 수 있습니다.`
};

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
    const { messages, chatMode, sessionId, expertiseLevel = 'intermediate' } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: 'Invalid messages format' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get the last user message
    const lastUserMessage = messages.findLast(msg => msg.role === 'user')?.content || '';
    
    // Select a response based on chat mode or default to general search
    const responseContent = sampleResponses[chatMode] || sampleResponses['범용 검색'];
    
    console.log(`Returning sample response for chat mode: ${chatMode}`);

    // Return the sample response
    return new Response(JSON.stringify({ 
      response: responseContent
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
