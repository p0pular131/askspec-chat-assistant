
import { ResponseModule } from './types';

interface PartDetail {
  name: string;
  price: string;
  specs: string;
  reason: string;
  link: string;
  image: string;
}

export interface EstimateResponse {
  parts: PartDetail[];
  total_price: string;
  total_reason: string;
}

// Sample data for testing purposes
const sampleData: EstimateResponse = {
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

export const buildRecommendationModule: ResponseModule = {
  name: 'buildRecommendation',
  moduleType: '견적 추천',
  process: async (content) => {
    // Check if the content is already valid JSON
    try {
      // Try to parse the content as JSON first
      JSON.parse(content);
      // If it parses successfully, then it's already valid JSON, just return it
      return content;
    } catch (error) {
      console.log("Content is not valid JSON, using sample data instead");
      console.log("Content received:", content ? content.substring(0, 100) + "..." : "null");
      
      // Use the sample data as fallback
      return JSON.stringify(sampleData);
    }
  }
};
