
/**
 * Centralized sample data for all modules
 * This file contains all the sample data used across the application
 * to ensure consistency and ease of maintenance
 */

// Sample data for build recommendations
export const sampleBuildRecommendation = {
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

// Sample data for compatibility checks
export const sampleCompatibilityData = {
  components: ["CPU", "GPU", "RAM", "Motherboard", "Storage", "PSU", "Case", "Cooler"],
  "CPU_Memory": true,
  "CPU_Memory_Reason": "인텔 코어 i5-13600K 프로세서는 DDR5-5600 메모리를 지원합니다. 따라서 SK하이닉스 DDR5-5600 (16GB) 메모리와 호환됩니다.",
  "CPU_Motherboard": false,
  "CPU_Motherboard_Reason": "인텔 코어 i5-13600K 프로세서는 LGA 1700 소켓을 사용하며, ASRock B860M-X 메인보드는 해당 소켓을 지원하지 않습니다. 따라서 두 부품은 호환되지 않습니다.",
  "Memory_Motherboard": true,
  "Memory_Motherboard_Reason": "ASRock B860M-X 메인보드는 DDR5 메모리를 지원하며, SK하이닉스 DDR5-5600 16GB 메모리는 데스크탑용 DDR5 메모리로 호환됩니다.",
  "Motherboard_Case": true,
  "Motherboard_Case_Reason": "NZXT H9 Flow 케이스는 Micro-ATX 폼팩터를 지원하며, ASRock B860M-X 메인보드는 Micro-ATX 폼팩터로 두 부품은 호환됩니다.",
  "Case_PSU": true,
  "Case_PSU_Reason": "NZXT H9 Flow 케이스는 ATX 규격의 파워서플라이를 지원하며, 시소닉 NEW FOCUS V4 GX-750 GOLD는 ATX 규격으로 호환됩니다. 또한, 파워서플라이의 깊이(140mm)는 케이스 내부 공간에 적합합니다.",
  "Case_GPU": true,
  "Case_GPU_Reason": "NZXT H9 Flow 케이스는 최대 435mm 길이의 그래픽카드를 지원하며, ASUS DUAL 지포스 RTX 4070 O12G EVO OC D6X 12GB의 길이는 227.2mm로 호환됩니다.",
  "Cooler_CPU": false,
  "Cooler_CPU_Reason": "NOCTUA NH-U12S는 인텔 코어 i5-13600K와 물리적으로 호환되지만, 고부하 시 온도 관리에 한계가 있을 수 있습니다. 더 나은 냉각 성능을 위해 NH-U14S와 같은 상위 모델을 고려하는 것이 좋습니다.",
  "Cooler_Motherboard": true,
  "Cooler_Motherboard_Reason": "NOCTUA NH-U12S는 LGA1851 소켓을 지원하며, ASRock B860M-X 메인보드는 LGA1851 소켓을 사용하므로 호환됩니다.",
  "EdgeCase": null,
  "Replace": null
};

// Sample data for part recommendations
export const samplePartRecommendations = [
  {
    name: "AMD Ryzen 5 5600X",
    reason: "Excellent price-to-performance ratio for gaming and productivity tasks",
    price: "₩189,000",
    specs: "6 cores, 12 threads, 3.7GHz base clock, 4.6GHz boost clock",
    link: "https://www.example.com/amd-ryzen-5-5600x",
    image: "https://via.placeholder.com/100x100.png?text=AMD+5600X"
  },
  {
    name: "NVIDIA RTX 3060 Ti",
    reason: "Great 1440p gaming performance with ray tracing capabilities",
    price: "₩599,000",
    specs: "8GB GDDR6, 4864 CUDA cores, 1.67 GHz boost clock",
    link: "https://www.example.com/nvidia-rtx-3060-ti",
    image: "https://via.placeholder.com/100x100.png?text=RTX+3060Ti"
  },
  {
    name: "Samsung 970 EVO Plus 1TB",
    reason: "Fast NVMe SSD with excellent reliability and performance",
    price: "₩159,000",
    specs: "3,500MB/s read, 3,300MB/s write, 5-year warranty",
    link: "https://www.example.com/samsung-970-evo-plus-1tb",
    image: "https://via.placeholder.com/100x100.png?text=970+EVO+Plus"
  }
];

// Sample data for spec upgrades (placeholder for future implementation)
export const sampleSpecUpgradeData = {
  currentSpecs: {
    cpu: "Intel Core i5-9600K",
    gpu: "NVIDIA GeForce GTX 1660",
    ram: "16GB DDR4-2666",
    motherboard: "MSI Z390-A PRO",
    storage: "Samsung 860 EVO 500GB",
    psu: "Corsair CX550M",
    case: "NZXT H510"
  },
  recommendedUpgrades: [
    {
      component: "GPU",
      currentPart: "NVIDIA GeForce GTX 1660",
      recommendedPart: "NVIDIA GeForce RTX 3070",
      price: "₩799,000",
      reason: "Significant performance increase for modern games at 1440p with ray tracing support",
      priority: "High"
    },
    {
      component: "CPU",
      currentPart: "Intel Core i5-9600K",
      recommendedPart: "Intel Core i7-12700K",
      price: "₩499,000",
      reason: "Much better multi-threaded performance for streaming and productivity tasks",
      priority: "Medium"
    },
    {
      component: "RAM",
      currentPart: "16GB DDR4-2666",
      recommendedPart: "32GB DDR4-3600",
      price: "₩189,000",
      reason: "Faster memory and larger capacity for improved multitasking",
      priority: "Low"
    }
  ],
  totalCost: "₩1,487,000",
  performanceGain: "Approximately 85% increase in gaming performance and 70% in productivity tasks"
};

// Sample data for build evaluations (placeholder for future implementation)
export const sampleBuildEvaluationData = {
  overallRating: 8.5,
  pricePerformance: 9.0,
  buildQuality: 8.0,
  futureProofing: 7.5,
  thermals: 8.5,
  noiseLevel: 9.0,
  powerEfficiency: 8.0,
  components: [
    {
      name: "AMD Ryzen 7 5800X",
      rating: 9.0,
      comments: "Excellent CPU choice for gaming and productivity, good value for money"
    },
    {
      name: "NVIDIA RTX 3070",
      rating: 9.5,
      comments: "Powerful GPU that handles all modern games at 1440p with high frame rates"
    },
    {
      name: "32GB DDR4-3600 CL16",
      rating: 9.0,
      comments: "Plenty of fast memory, good for multitasking and future needs"
    },
    {
      name: "MSI MAG B550 TOMAHAWK",
      rating: 8.0,
      comments: "Good motherboard with solid VRMs and feature set for the price"
    },
    {
      name: "Samsung 970 EVO Plus 1TB",
      rating: 9.0,
      comments: "Fast NVMe storage, good capacity for OS and games"
    }
  ],
  recommendations: [
    "Consider adding a secondary HDD for mass storage",
    "CPU cooler could be upgraded for lower noise levels",
    "Case airflow could be improved with additional front fans"
  ],
  summary: "A well-balanced high-end gaming PC with good component choices. Offers excellent performance now and should remain capable for several years."
};
