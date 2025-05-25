/**
 * Centralized sample data for all modules
 * This file contains all the sample data used across the application
 * to ensure consistency and ease of maintenance
 */

// Sample data for build recommendations
export const sampleBuildRecommendation = {
  "title": "150만원대 게이밍 컴퓨터 견적",
  "parts": [
    {
      "name": "AMD 라이젠5 5600X",
      "price": "₩250,000",
      "specs": "6코어 12스레드, 기본 클럭 3.7GHz, 최대 부스트 클럭 4.6GHz",
      "reason": "게임 성능이 우수한 6코어 12스레드의 프로세서입니다.",
      "link": "https://www.amd.com/ko/products/cpu/amd-ryzen-5-5600x",
      "image": "https://media.istockphoto.com/id/1397047877/ko/%EC%82%AC%EC%A7%84/%EB%A7%88%EB%8D%94%EB%B3%B4%EB%93%9C%EC%9D%98-%EB%A9%94%EC%9D%B8-%EB%A7%88%EC%9D%B4%ED%81%AC%EB%A1%9C%EC%B9%A9.jpg?s=612x612&w=0&k=20&c=aOkQm6fZ6ApeaYu983FGI8f9KbURequCJJgyYPYUniQ="
    },
    {
      "name": "ASUS TUF Gaming B550-PLUS",
      "price": "₩180,000",
      "specs": "ATX 폼팩터, AM4 소켓, DDR4 메모리 지원",
      "reason": "안정성과 확장성이 뛰어난 메인보드입니다.",
      "link": "https://www.asus.com/kr/Motherboards-Components/Motherboards/TUF-Gaming/TUF-GAMING-B550-PLUS/",
      "image": "https://media.istockphoto.com/id/958956392/ko/%EC%82%AC%EC%A7%84/%EC%BB%B4%ED%93%A8%ED%84%B0-%EB%B3%B4%EB%93%9C-%ED%95%98%EB%93%9C%EC%9B%A8%EC%96%B4-%EB%A7%88%EB%8D%94%EB%B3%B4%EB%93%9C-%EB%A7%88%EC%9D%B4%ED%81%AC%EB%A1%9C-%EC%84%9C%EB%B2%84-cpu-%EC%B9%A9-%EB%B0%98%EB%8F%84%EC%B2%B4-%ED%9A%8C%EB%A1%9C-%EB%B8%94%EB%A3%A8-%EC%BD%94%EC%96%B4-%EA%B8%B0%EC%88%A0-%EB%B0%B0%EA%B2%BD%EC%9D%B4-%EB%82%98-%EB%B8%94%EB%A3%A8-%ED%85%8D%EC%8A%A4%EC%B2%98-%ED%94%84%EB%A1%9C%EC%84%B8%EC%84%9C-%EA%B0%9C%EB%85%90-%EC%A0%84%EC%9E%90-%EC%9E%A5%EC%B9%98.jpg?s=612x612&w=0&k=20&c=YODzWyYGg0ZH3C3XtrUEaxSfyojF4PXyPmOzgssJDws="
    },
    {
      "name": "삼성전자 DDR4-3200 16GB (8GB x2)",
      "price": "₩100,000",
      "specs": "DDR4, 3200MHz, 16GB (8GB x2)",
      "reason": "빠른 속도와 안정성을 제공하는 메모리입니다.",
      "link": "https://www.samsung.com/semiconductor/dram/module/consumer-ddr4/",
      "image": "https://media.istockphoto.com/id/1365598557/ko/%EC%82%AC%EC%A7%84/%EC%BB%B4%ED%93%A8%ED%84%B0-%EB%9E%A8-%EC%9E%A5%EC%B9%98-%EC%B9%A9-%EC%BB%B4%ED%93%A8%ED%84%B0-%EB%A9%94%EB%AA%A8%EB%A6%AC-%EB%B3%B4%EB%93%9C-%EC%A0%84%EC%9E%90-%ED%95%98%EB%93%9C%EC%9B%A8%EC%96%B4-%EA%B8%B0%EC%88%A0-ram-%EB%B3%B4%EB%93%9C-%EC%9D%B4%EB%AF%B8%EC%A7%80.jpg?s=612x612&w=0&k=20&c=kBe1gi3c7cDaLagLGXERLb9NDPZIbBaEJsNLGZZgOD4="
    },
    {
      "name": "삼성전자 970 EVO Plus M.2 NVMe 1TB",
      "price": "₩150,000",
      "specs": "M.2 NVMe, 1TB, 최대 읽기 속도 3,500MB/s",
      "reason": "빠른 읽기/쓰기 속도를 제공하는 SSD입니다.",
      "link": "https://www.samsung.com/semiconductor/minisite/ssd/product/consumer/970evoplus/",
      "image": "https://media.istockphoto.com/id/1330486154/ko/%EC%82%AC%EC%A7%84/ssd-%EC%86%94%EB%A6%AC%EB%93%9C-%EC%8A%A4%ED%85%8C%EC%9D%B4%ED%8A%B8-%EB%B0%95%EB%B6%80-%ED%95%98%EB%93%9C-%EB%93%9C%EB%9D%BC%EC%9D%B4%EB%B8%8C-%EC%BB%B4%ED%93%A8%ED%84%B0%EC%9A%A9-%EC%BB%B4%ED%93%A8%ED%84%B0-%EC%BB%B4%ED%8F%AC%EB%84%8C%ED%8A%B8-%EB%B0%8F-%EC%BB%B4%ED%93%A8%ED%84%B0-%EC%97%85%EA%B7%B8%EB%A0%88%EC%9D%B4%EB%93%9C-%EA%B0%9C%EB%85%90.jpg?s=612x612&w=0&k=20&c=IYylyFVn4aNcFZBnVQcCxEIAOpypUevdRbZXTgMKZ8E="
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
      "image": "https://media.istockphoto.com/id/622847180/ko/%EC%82%AC%EC%A7%84/%EC%BB%B4%ED%93%A8%ED%84%B0-%EC%A0%84%EC%9B%90-%EA%B3%B5%EA%B8%89-%EC%9E%A5%EC%B9%98.jpg?s=612x612&w=0&k=20&c=K9imPdgnVoRGZ_VuNKX-Pl80PLq2sDXg0chcpIWOl1U="
    },
    {
      "name": "ABKO NCORE 식스팬 강화유리",
      "price": "₩60,000",
      "specs": "미들 타워, 강화유리, 6개의 쿨링 팬 포함",
      "reason": "효율적인 쿨링과 디자인을 갖춘 케이스입니다.",
      "link": "https://www.abko.co.kr/product/ncore-sixfan/",
      "image": "https://media.istockphoto.com/id/1419050553/ko/%EC%82%AC%EC%A7%84/%EC%BB%B4%ED%93%A8%ED%84%B0-%ED%95%98%EB%93%9C%EC%9B%A8%EC%96%B4-%EC%9E%90%EC%84%B8%ED%95%9C-%EC%BB%B4%ED%93%A8%ED%84%B0-%ED%95%98%EB%93%9C%EC%9B%A8%EC%96%B4-%ED%85%8C%EB%A7%88-%EA%B0%80%EA%B9%8C%EC%9A%B4-%EA%B2%80%EC%9D%80-%EB%B0%B0%EA%B2%BD.jpg?s=612x612&w=0&k=20&c=Rig4MuWqkO1pdP_GXhnFZ9DxrkXTjO14gcofOYO5j0o="
    },
    {
      "name": "잘만 CNPS10X PERFORMA BLACK",
      "price": "₩50,000",
      "specs": "120mm 팬, 4개의 히트파이프",
      "reason": "효율적인 CPU 쿨링을 위한 공랭 쿨러입니다.",
      "link": "https://www.zalman.com/kr/product/cnps10x-performa-black/",
      "image": "https://media.istockphoto.com/id/175195279/ko/%EC%82%AC%EC%A7%84/%EC%BB%B4%ED%93%A8%ED%84%B0-%EC%BF%A8%EB%9F%AC.jpg?s=612x612&w=0&k=20&c=LJcbNpQSacHkuMWms0Rs8n9srQijX6nRJjpQa9X0_Dg="
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

// Sample data for part recommendations (new format)
export const samplePartRecommendations = {
  "parts": {
    "part1": {
      "name": "인텔 코어i5 13400",
      "reason": "최신 13세대 인텔 i5 CPU로, 6코어 12쓰레드 및 DDR4/DDR5 지원 등 최신 플랫폼을 사용하는 범용성과 성능이 우수합니다.",
      "price": "₩238,340",
      "specs": "6코어 12쓰레드, 베이스 2.5GHz / 부스트 4.6GHz, L3 캐시 20MB, DDR5/DDR4 지원, PCIe 5.0/4.0, 인텔 UHD 730 내장그래픽, 기본 쿨러 포함",
      "link": "https://www.danawa.com/product/?pcode=18640286",
      "image_url": "https://img.danawa.com/prod_img/500000/286/640/img/18640286_1.jpg"
    },
    "part2": {
      "name": "인텔 코어i3 13100",
      "reason": "4코어 8쓰레드, DDR4/DDR5 지원 등 예산 대비 최신 기능을 포함한 엔트리급 사무/가벼운 작업용으로 적합합니다.",
      "price": "₩166,450",
      "specs": "4코어 8쓰레드, 베이스 3.4GHz / 부스트 4.5GHz, L3 캐시 12MB, DDR5/DDR4 지원, PCIe 5.0/4.0, 인텔 UHD 730 내장그래픽, 기본 쿨러 포함",
      "link": "https://www.danawa.com/product/?pcode=18640205",
      "image_url": "https://img.danawa.com/prod_img/500000/205/640/img/18640205_1.jpg"
    },
    "part3": {
      "name": "인텔 코어i5 11400F",
      "reason": "6코어 12쓰레드, DDR4 및 PCIe 4.0 지원 등 가성비가 우수하며, 내장 그래픽이 필요 없는 사용자에게 알맞습니다.", 
      "price": "₩140,020",
      "specs": "6코어 12쓰레드, 베이스 2.6GHz/부스트 4.4GHz, L3 캐시 12MB, DDR4, PCIe 4.0, 내장그래픽 미탑재, 기본 쿨러 포함",
      "link": "https://www.danawa.com/product/?pcode=13753394",
      "image_url": "https://img.danawa.com/prod_img/500000/394/753/img/13753394_1.jpg"
    }
  },
  "suggestion": "게임용 CPU를 찾고 계신다면 i5 13400이 가장 균형잡힌 선택입니다. 예산이 제한적이라면 i3 13100으로도 충분하며, 별도 그래픽카드 사용 시 i5 11400F가 가성비 면에서 우수합니다."
};

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

// Sample data for build evaluations
export const sampleBuildEvaluationData = {
  "price_performance": {
    "score": 85,
    "comment": "이 시스템은 인텔 코어 i5-13600K와 RTX 4070을 조합하여 우수한 성능을 제공하며, 가격 대비 성능이 뛰어납니다. 특히 최신 게임에서도 높은 프레임을 유지할 수 있습니다."
  },
  "performance": {
    "score": 90,
    "comment": "i5-13600K는 멀티코어 성능이 향상되어 다양한 작업에서 우수한 성능을 발휘합니다. RTX 4070과의 조합으로 대부분의 게임과 작업에서 높은 성능을 기대할 수 있습니다."
  },
  "expandability": {
    "score": 75,
    "comment": "ASRock B860M-X 메인보드는 M.2 슬롯과 SATA 포트가 제한적일 수 있어 확장성에 일부 제약이 있습니다. 그러나 PSU 용량이 충분하여 향후 더 높은 성능의 GPU로 업그레이드가 가능합니다."
  },
  "noise": {
    "score": 80,
    "comment": "NOCTUA NH-U12S 쿨러와 NZXT H9 Flow 케이스의 조합으로 효과적인 쿨링과 저소음을 기대할 수 있습니다. 그러나 고성능 부품 사용으로 부하 시 소음이 증가할 수 있습니다."
  },
  "average_score": 83
};

// Sample data for general search responses by expertise level
export const sampleGeneralSearchResponses = {
  beginner: "GPU는 '그래픽 처리 장치'로, 컴퓨터에서 화면에 그림이나 영상을 표시할 때 필요한 부품입니다. 쉽게 말하면, 게임을 하거나 영상을 볼 때 그림이 끊기지 않고 부드럽게 나오도록 도와주는 역할을 합니다. GPU를 구매할 때는, 주로 어떤 용도로 쓸지 먼저 생각해야 합니다. 게임이나 영상 작업처럼 그래픽 작업이 많은 경우 더 성능이 좋은 GPU가 필요하며, 단순히 인터넷이나 문서 작업 정도면 보통 내장 그래픽으로도 충분합니다. 예산, 사용할 프로그램, 모니터 해상도 등도 함께 고려해야 합니다.",
  
  intermediate: "GPU는 'Graphics Processing Unit'의 약자로, 그래픽 카드를 구성하는 핵심 부품입니다. GPU는 주로 3D 그래픽 연산, 영상 렌더링, 딥러닝 등의 복잡한 계산을 담당합니다. GPU를 구매할 때는 목적에 따라 성능과 메모리 용량, 발열, 호환성, 가격 등을 고려해야 합니다. 예를 들어 게임용이라면 최신 아키텍처와 충분한 VRAM이 중요하며, 딥러닝이나 영상 편집 용도라면 단일·더블 프리시전 성능 및 CUDA 코어 수, VRAM 용량이 중요한 선택 기준이 됩니다. 또한 사용하려는 케이스에 장착 가능한 크기와, 파워 서플라이의 용량도 확인해야 안정적인 시스템 구성이 가능합니다.",
  
  expert: "GPU는 컴퓨터에서 그래픽 연산을 담당하는 부품으로, 주로 게임, 영상 편집, 딥러닝 등 높은 연산 성능을 요구하는 작업에서 필수적입니다. GPU를 구매할 때는 사용하는 목적에 따라 VRAM 용량, 연산 능력(예: CUDA 또는 RT 코어 수), 지원하는 최신 기술(DLSS, 하드웨어 인코딩/디코딩 등), 모니터와의 호환성(출력 단자, 최대 해상도 지원), 그리고 전력 소비량과 쿨링 시스템을 고려해야 합니다. 예를 들어, NVIDIA의 RTX 40 시리즈는 DLSS3와 4세대 NVENC를 지원해 게임뿐만 아니라 영상 인코딩 및 AI 워크플로우에도 최적의 선택지입니다."
};
