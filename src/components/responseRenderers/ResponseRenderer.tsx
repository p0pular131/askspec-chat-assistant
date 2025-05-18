
import React from 'react';
import GeneralSearchRenderer from './GeneralSearchRenderer';
import PartRecommendationRenderer from './PartRecommendationRenderer';
import CompatibilityCheckRenderer from './CompatibilityCheckRenderer';
import BuildRecommendationRenderer from './BuildRecommendationRenderer';
import SpecUpgradeRenderer from './SpecUpgradeRenderer';
import BuildEvaluationRenderer from './BuildEvaluationRenderer';

interface ResponseRendererProps {
  content: string;
  chatMode: string;
  isCompatibilityRequest?: boolean;
}

// Sample compatibility data for compatibility checks
const sampleCompatibilityData = {
    components: ["CPU", "GPU", "RAM", "Motherboard", "Storage", "PSU", "Case", "Cooler"],
    "CPU_Memory":true,
    "CPU_Memory_Reason":"인텔 코어 i5-13600K 프로세서는 DDR5-5600 메모리를 지원합니다. 따라서 SK하이닉스 DDR5-5600 (16GB) 메모리와 호환됩니다.",
    "CPU_Motherboard":false,
    "CPU_Motherboard_Reason":"인텔 코어 i5-13600K 프로세서는 LGA 1700 소켓을 사용하며, ASRock B860M-X 메인보드는 해당 소켓을 지원하지 않습니다. 따라서 두 부품은 호환되지 않습니다.",
    "Memory_Motherboard":true,
    "Memory_Motherboard_Reason":"ASRock B860M-X 메인보드는 DDR5 메모리를 지원하며, SK하이닉스 DDR5-5600 16GB 메모리는 데스크탑용 DDR5 메모리로 호환됩니다.",
    "Motherboard_Case":true,
    "Motherboard_Case_Reason":"NZXT H9 Flow 케이스는 Micro-ATX 폼팩터를 지원하며, ASRock B860M-X 메인보드는 Micro-ATX 폼팩터로 두 부품은 호환됩니다.",
    "Case_PSU":true,
    "Case_PSU_Reason":"NZXT H9 Flow 케이스는 ATX 규격의 파워서플라이를 지원하며, 시소닉 NEW FOCUS V4 GX-750 GOLD는 ATX 규격으로 호환됩니다. 또한, 파워서플라이의 깊이(140mm)는 케이스 내부 공간에 적합합니다.",
    "Case_GPU":true,
    "Case_GPU_Reason":"NZXT H9 Flow 케이스는 최대 435mm 길이의 그래픽카드를 지원하며, ASUS DUAL 지포스 RTX 4070 O12G EVO OC D6X 12GB의 길이는 227.2mm로 호환됩니다.",
    "Cooler_CPU":false,
    "Cooler_CPU_Reason":"NOCTUA NH-U12S는 인텔 코어 i5-13600K와 물리적으로 호환되지만, 고부하 시 온도 관리에 한계가 있을 수 있습니다. 더 나은 냉각 성능을 위해 NH-U14S와 같은 상위 모델을 고려하는 것이 좋습니다.",
    "Cooler_Motherboard":true,
    "Cooler_Motherboard_Reason":"NOCTUA NH-U12S는 LGA1851 소켓을 지원하며, ASRock B860M-X 메인보드는 LGA1851 소켓을 사용하므로 호환됩니다.",
    "EdgeCase":null,
    "Replace":null
};

const sampleBuildRecommendationData = {
  "parts": [
    {
      "name": "AMD 라이젠5 5600X",
      "price": "₩250,000",
      "specs": "6코어 12스레드, 기본 클럭 3.7GHz, 최대 부스트 클럭 4.6GHz",
      "reason": "게임 성능이 우수한 6코어 12스레드의 프로세서입니다.",
      "link": "https://www.amd.com/ko/products/cpu/amd-ryzen-5-5600x",
      "image": "data:image/jpeg;base64,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"
    },
    {
      "name": "ASUS TUF Gaming B550-PLUS",
      "price": "₩180,000",
      "specs": "ATX 폼팩터, AM4 소켓, DDR4 메모리 지원",
      "reason": "안정성과 확장성이 뛰어난 메인보드입니다.",
      "link": "https://www.asus.com/kr/Motherboards-Components/Motherboards/TUF-Gaming/TUF-GAMING-B550-PLUS/",
      "image": "https://dlcdnwebimgs.asus.com/gain/8B0A0A0A-0A0A-4A0A-8A0A-0A0A0A0A0A0A/w1000/h732"
    },
    {
      "name": "삼성전자 DDR4-3200 16GB (8GB x2)",
      "price": "₩100,000",
      "specs": "DDR4, 3200MHz, 16GB (8GB x2)",
      "reason": "빠른 속도와 안정성을 제공하는 메모리입니다.",
      "link": "https://www.samsung.com/semiconductor/dram/module/consumer-ddr4/",
      "image": "https://images.samsung.com/is/image/samsung/p6pim/kr/feature/consumer-ddr4-3200-16gb-8gb-x2-1"
    },
    {
      "name": "삼성전자 970 EVO Plus M.2 NVMe 1TB",
      "price": "₩150,000",
      "specs": "M.2 NVMe, 1TB, 최대 읽기 속도 3,500MB/s",
      "reason": "빠른 읽기/쓰기 속도를 제공하는 SSD입니다.",
      "link": "https://www.samsung.com/semiconductor/minisite/ssd/product/consumer/970evoplus/",
      "image": "https://images.samsung.com/is/image/samsung/p6pim/kr/feature/970-evo-plus-m-2-nvme-1tb-1"
    },
    {
      "name": "NVIDIA 지포스 RTX 4060 Ti",
      "price": "₩500,000",
      "specs": "8GB GDDR6, 레이 트레이싱 및 DLSS 지원",
      "reason": "최신 게임을 원활하게 실행할 수 있는 그래픽 카드입니다.",
      "link": "https://www.nvidia.com/ko-kr/geforce/graphics-cards/40-series/rtx-4060-ti/",
      "image": "https://www.nvidia.com/content/dam/en-zz/Solutions/geforce/graphics-cards/40-series/rtx-4060-ti/gallery/geforce-rtx-4060-ti-1-1200-p@2x.jpg"
    },
    {
      "name": "마이크로닉스 Classic II 700W 80PLUS Bronze",
      "price": "₩80,000",
      "specs": "700W, 80PLUS Bronze 인증",
      "reason": "안정적인 전력 공급을 위한 파워 서플라이입니다.",
      "link": "https://www.micronics.co.kr/power/classic-ii-700w-80plus-bronze/",
      "image": "https://www.micronics.co.kr/wp-content/uploads/2020/09/classic-ii-700w-80plus-bronze-1.jpg"
    },
    {
      "name": "ABKO NCORE 식스팬 강화유리",
      "price": "₩60,000",
      "specs": "미들 타워, 강화유리, 6개의 쿨링 팬 포함",
      "reason": "효율적인 쿨링과 디자인을 갖춘 케이스입니다.",
      "link": "https://www.abko.co.kr/product/ncore-sixfan/",
      "image": "https://www.abko.co.kr/wp-content/uploads/2020/09/ncore-sixfan-1.jpg"
    },
    {
      "name": "잘만 CNPS10X PERFORMA BLACK",
      "price": "₩50,000",
      "specs": "120mm 팬, 4개의 히트파이프",
      "reason": "효율적인 CPU 쿨링을 위한 공랭 쿨러입니다.",
      "link": "https://www.zalman.com/kr/product/cnps10x-performa-black/",
      "image": "https://www.zalman.com/kr/wp-content/uploads/2020/09/cnps10x-performa-black-1.jpg"
    }
  ],
  "total_price": "₩1,370,000",
  "total_reason": "150만원 예산 내에서 최신 게임을 원활하게 실행할 수 있는 성능을 제공하는 부품들로 구성하였습니다."
};

const ResponseRenderer: React.FC<ResponseRendererProps> = ({ content, chatMode, isCompatibilityRequest }) => {
  // Select the appropriate renderer based on chat mode
  switch (chatMode) {
    case '범용 검색':
      return <GeneralSearchRenderer content={content} />;
    case '부품 추천':
      return <PartRecommendationRenderer content={content} />;
    case '호환성 검사':
      return <CompatibilityCheckRenderer content={content} compatibilityData={sampleCompatibilityData} />;
    case '견적 추천':
      return <BuildRecommendationRenderer content={content} recommendationData={sampleBuildRecommendationData} />;
    case '스펙 업그레이드':
      return <SpecUpgradeRenderer content={content} />;
    case '견적 평가':
      return <BuildEvaluationRenderer content={content} />;
    default:
      // For compatibility checks detected in other modes
      if (isCompatibilityRequest) {
        return <CompatibilityCheckRenderer content={content} compatibilityData={sampleCompatibilityData} />;
      }
      // Default to general search renderer
      return <GeneralSearchRenderer content={content} />;
  }
};

export default ResponseRenderer;
