
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
      "image": "https://www.amd.com/system/files/2020-10/1260x709-ryzen-5-5600x.jpg"
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
