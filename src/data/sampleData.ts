/**
 * Centralized sample data for all modules
 * This file contains all the sample data used across the application
 * to ensure consistency and ease of maintenance
 */

// Sample data for build recommendations
export const sampleBuildRecommendation = {
  "title": "150만 게이밍 PC",
  "parts": {
    "VGA": {
      "name": "EVGA 지포스 RTX 3060 XC GAMING D6 12GB LHR",
      "reason": "150만원 예산의 게이밍 PC에 적합하며 요청한 550,000~650,000원 VGA 가격 조건(₩499,900)에 부합하고, 요청하신 RTX 3060 급 성능과 12GB VRAM으로 최근 게임에도 충분한 그래픽 성능을 제공합니다.",
      "price": "₩499,900",
      "specs": "메모리: 12GB GDDR6, 부스트클럭: 1882MHz, 스트림프로세서: 3584개, 출력포트: HDMI2.1/DP1.4, 길이 201.8mm, 권장파워 550W, PCIe 4.0 x16 지원, 3DMark: 8997, 1080p 고옵션 평균 FPS: 100",
      "link": "",
      "image_url": "https://img.danawa.com/prod_img/500000/852/753/img/14753852_1.jpg"
    },
    "CPU": {
      "name": "AMD 라이젠5 5600X",
      "reason": "150만원 예산의 게이밍 PC 구성에 적합하며, 사용자가 요청한 180,000~230,000원 가격대에 부합하는 검색 결과입니다. 6코어 12스레드와 높은 게이밍 성능, 그리고 쿨러 기본 제공으로 가성비가 매우 뛰어남. 경쟁 인텔 i5 (LGA1700) 대비 가격이 낮으면서도 게임 성능에서 강점을 보여 추천드립니다.",
      "price": "₩180,000",
      "specs": "6코어 12스레드 / AM4 소켓 / DDR4 지원 / 베이스 3.7GHz, 최대 4.6GHz / L3 캐시 32MB / TDP 65W / Wraith Stealth 쿨러 포함 / PCIe 4.0",
      "link": "",
      "image_url": "https://img.danawa.com/prod_img/500000/265/625/img/12625265_1.jpg"
    },
    "Motherboard": {
      "name": "ASUS PRIME B550-PLUS 대원CTS",
      "reason": "120,000~160,000원 예산에 맞는 AM4 소켓, DDR4 메모리 지원, ATX 규격의 제품으로 게이밍 PC의 안정성과 확장성을 갖춘 메인보드입니다. 라이젠 5000 시리즈 CPU 호환 및 게이밍에 필요한 기본 확장성을 모두 제공합니다.",
      "price": "₩142,000",
      "specs": "AMD B550 칩셋 / ATX / 소켓 AM4 / DDR4 메모리 지원 / PCIe 4.0 / 4개의 메모리 슬롯(최대 128GB) / M.2 슬롯 2개 / USB 3.2 / 2.5GbE LAN / HDMI, DP / 다채로운 확장성 및 게이밍용 기본기 제공",
      "link": "https://prod.danawa.com/info/?pcode=11461747",
      "image_url": "https://img.danawa.com/prod_img/500000/747/461/img/11461747_1.jpg"
    },
    "Memory": {
      "name": "G.SKILL DDR4-4000 CL18 TRIDENT Z RGB 패키지 (16GB(8Gx2))",
      "reason": "예산 80,000~120,000원 내에서 16GB(8GBx2) 구성, 3000MHz 이상 게이밍에 적합한 고클럭 메모리로 RGB 디자인까지 갖추어 가성비와 성능 모두 충족합니다.",
      "price": "₩72,290",
      "specs": "DDR4, 16GB (8GBx2), 4000MHz, CL18-22-22-42, RGB, 게이밍 전용",
      "link": "",
      "image_url": "https://img.danawa.com/prod_img/500000/896/792/img/15792896_1.jpg"
    },
    "Storage": {
      "name": "이메이션 Q831 M.2 NVMe",
      "reason": "1TB 용량에, 읽기 2,300MB/s 및 쓰기 1,700MB/s로 빠른 속도를 제공하며, 요청하신 예산(8만원~12만원) 내에 해당되는 최고의 가성비 제품입니다. 게이밍 PC 저장장치로 적합합니다.",
      "price": "₩77,900",
      "specs": "M.2 (2280) NVMe, 1TB, 순차 읽기 2,300MB/s, 순차 쓰기 1,700MB/s, MTBF 150만시간, 두께 2.15mm",
      "link": "",
      "image_url": "https://img.danawa.com/prod_img/500000/613/808/img/15808613_1.jpg"
    },
    "PSU": {
      "name": "DEEPCOOL PN750M 80PLUS골드 풀모듈러 ATX3.1",
      "reason": "요청하신 60,000~100,000원 예산에서는 750W, 80PLUS Bronze 이상의 인증, 높은 안정성, 그리고 최근 시스템 호환성이 뛰어난 제품 선택이 중요합니다. DEEPCOOL PN750M 80PLUS골드 풀모듈러는 80PLUS 골드 인증, 풀모듈러 구성, 750W 출력, 12V 싱글레일 등으로 안전성과 확장성을 보장하며, 최신 ATX3.1 지원을 통해 추후 업그레이드도 용이합니다. 예산 상한을 소폭 초과하나, 더욱 신뢰성 있는 선택이라 우선 추천합니다.",
      "price": "₩134000.0",
      "specs": "풀모듈러, 80PLUS 골드, ATX3.1, 750W, 24핀(20+4) 메인, 8핀(4+4) 2개, PCIe 16핀(12V2x6) 1개, PCIe 8핀 3개, SATA 8개, +12V 싱글레일",
      "link": "",
      "image_url": "https://img.danawa.com/prod_img/500000/603/035/img/63035603_1.jpg"
    },
    "Case": {
      "name": "CORSAIR 4000D RGB AIRFLOW (트루 화이트)",
      "reason": "40,000~80,000원 예산을 고려한 미들타워 ATX 지원 케이스 중 내부 쿨링 성능과 선정리 구성이 우수하고, RGB 팬이 기본 제공되어 가성비와 감성을 동시에 만족합니다.",
      "price": "₩180,000",
      "specs": "폼팩터: E-ATX, ATX, M-ATX, M-ITX / 최대 GPU 길이: 360mm / 최대 CPU 쿨러 높이: 170mm / 폭: 230mm, 깊이: 453mm, 높이: 466mm / 파워서플라이 최대 길이: 180mm / 미들타워",
      "link": "",
      "image_url": "https://img.danawa.com/prod_img/500000/650/918/img/18918650_1.jpg"
    },
    "Cooler": {
      "name": "PCCOOLER CPS RC400-53",
      "reason": "Intel LGA1700 및 AMD AM4 소켓 모두 완벽히 지원하며, 30,000~40,000원 예산에 근접한 제품 중 정숙성(최대 31.2dBA)과 준수한 쿨링 성능(43 CFM)이 균형을 이루고 있는 공랭 쿨러입니다. 슬림한 크기로 호환성과 조립 편의성도 우수합니다.",
      "price": "₩42,900",
      "specs": "소켓: Intel LGA1700, AMD AM4/AM5 지원, 최대 풍량: 43CFM, 소음도: 31.2dBA, 높이: 53.5mm, 공랭 방식, 4핀 커넥터",
      "link": "",
      "image_url": "https://img.danawa.com/prod_img/500000/096/560/img/63560096_1.jpg"
    }
  },
  "total_price": "₩1,328,990",
  "total_reason": "150만원 예산 안에서 최신 게임을 부드럽게 즐길 수 있도록 그래픽카드와 CPU를 중심으로 구성했습니다. 다양한 게임 플레이와 원활한 컴퓨터 사용을 위한 성능과 확장성을 고려했습니다. 입문자도 사용하기 쉽도록 호환성과 안정성에 신경 썼습니다.",
  "suggestion": "견적이 마음에 들었다면, 견적을 저장해 나중에도 볼 수 있습니다. **견적 호환성 검사**에서 견적 호환 여부를 받아볼 수 있습니다. 또한, **견적 평가 기능**을 통해 추천된 견적의 성능과 가성비를 확인해보세요."
};
  
// Sample data for compatibility checks
export const sampleCompatibilityData = {
  "CPU_Memory": true,
  "CPU_Memory_Reason": "AMD 라이젠5 5600X는 DDR4 메모리를 지원하며, G.SKILL DDR4-4000 CL18 TRIDENT Z RGB 패키지도 DDR4 타입이므로 호환됩니다.",
  "CPU_Motherboard": true,
  "CPU_Motherboard_Reason": "AMD 라이젠5 5600X는 AM4 소켓과 DDR4 메모리를 사용하며, ASUS PRIME B550-PLUS 메인보드는 AM4 소켓과 DDR4를 지원하므로 호환됩니다. PCIe 4.0도 양쪽 모두 지원하여 문제없이 사용할 수 있습니다.",
  "Memory_Motherboard": true,
  "Memory_Motherboard_Reason": "G.SKILL DDR4-4000 CL18 TRIDENT Z RGB 패키지는 DDR4 타입이며, ASUS PRIME B550-PLUS는 DDR4 메모리(최대 4800MHz OC)를 지원하므로 호환됩니다. 슬롯 수도 4개로 2개 메모리 장착에 문제 없습니다.",
  "Motherboard_Case": true,
  "Motherboard_Case_Reason": "ASUS PRIME B550-PLUS는 ATX 폼팩터이며, CORSAIR 4000D RGB AIRFLOW는 ATX 메인보드를 지원하므로 호환됩니다.",
  "Case_PSU": true,
  "Case_PSU_Reason": "CORSAIR 4000D RGB AIRFLOW 케이스의 파워서플라이 최대 길이는 180mm이고, DEEPCOOL PN750M의 길이는 140mm로 호환됩니다.",
  "Case_VGA": true,
  "Case_VGA_Reason": "EVGA 지포스 RTX 3060 XC GAMING D6 12GB LHR의 길이(201.8mm)는 CORSAIR 4000D RGB AIRFLOW (트루 화이트)의 최대 GPU 길이(360mm)보다 짧아 호환됩니다.",
  "Cooler_CPU": true,
  "Cooler_CPU_Reason": "PCCOOLER CPS RC400-53는 AM4 소켓을 지원하며, AMD 라이젠5 5600X도 AM4 소켓을 사용합니다. 또한 5600X의 TDP(65W)는 쿨러의 일반적인 지원 범위 내에 있어 호환됩니다.",
  "Cooler_Motherboard": true,
  "Cooler_Motherboard_Reason": "PCCOOLER CPS RC400-53는 AM4 소켓을 지원하며, ASUS PRIME B550-PLUS는 AMD AM4 소켓 메인보드입니다. 따라서 두 부품은 호환됩니다.",
  "Storage_Motherboard": true,
  "Storage_Motherboard_Reason": "이메이션 Q831 M.2 NVMe(2280 폼팩터)는 ASUS PRIME B550-PLUS의 M.2 슬롯(2280 지원)에 장착 가능합니다. 폼팩터 및 인터페이스 모두 호환됩니다.",
  "VGA_PSU": true,
  "VGA_PSU_Reason": "EVGA 지포스 RTX 3060 XC GAMING D6 12GB LHR는 8핀 x1 보조전원이 필요하며, DEEPCOOL PN750M 80PLUS골드 풀모듈러 ATX3.1는 PCIe 8핀 커넥터 3개와 750W 정격출력을 제공해 호환됩니다.",
  "Cooler_Case": true,
  "Cooler_Case_Reason": "PCCOOLER CPS RC400-53의 높이(53.5mm)는 CORSAIR 4000D RGB AIRFLOW의 최대 CPU 쿨러 높이(170mm)보다 작으므로 호환됩니다.",
  "EdgeCase": true,
  "EdgeCase_Reason": "PSU 출력 부족 가능성: 시스템의 총 소비 전력이 PSU의 최대 출력인 750W에 근접하거나 초과할 수 있습니다. 특히, 고성능 작업이나 오버클럭 시 전력 소모가 증가할 수 있으므로 주의가 필요합니다.",
  "suggestion": "**견적 평가 기능**에서 견적 점수를 받아볼 수 있습니다."
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
  "title": "게이밍 100만원 업글 견적",
  "parts": {
    "Cooler": {
      "name": "PCCOOLER CPS RC400-53",
      "price": "₩42,900.0",
      "specs": "intel_sockets: LGA1851, LGA1700, LGA1200, LGA115x; amd_sockets: AM5, AM4; width: 93mm; depth: 95mm; height: 53.5mm; max_airflow: 43 CFM; static_pressure: 2.2mmH₂O; max_noise: 31.2dBA; cooling_method: 공랭; tower_design: 일반형; connector: 4핀",
      "reason": "게이밍 성능 향상을 위한 업그레이드된 쿨러로, 기존 쿨러 대비 향상된 냉각 성능을 제공합니다.",
      "link": "",
      "image_url": "https://img.danawa.com/prod_img/500000/096/560/img/63560096_1.jpg"
    },
    "Case": {
      "name": "CORSAIR 4000D RGB AIRFLOW (트루 화이트)",
      "price": "₩180,000.0",
      "specs": "form_factor: E-ATX, ATX, M-ATX, M-ITX; max_gpu_length: 360mm; max_cpu_cooler_height: 170mm; width: 230mm; depth: 453mm; height: 466mm; power_supply_max_length: 180mm; case_size_category: 미들타워",
      "reason": "뛰어난 확장성과 쿨링 성능을 제공하는 미들타워 케이스로 업그레이드를 위한 최적의 선택입니다.",
      "link": "",
      "image_url": "https://img.danawa.com/prod_img/500000/650/918/img/18918650_1.jpg"
    },
    "Storage": {
      "name": "이메이션 Q971 M.2 NVMe",
      "price": "₩92,900.0",
      "specs": "capacity: 1TB; mtbf: 150만시간; thickness: 2.15mm; form_factor: M.2 (2280); sequential_read: 5,000Mbs; sequential_write: 3,400Mbs; category: SSD",
      "reason": "기존 대비 2배 큰 용량과 5배 빠른 속도로 게임 로딩 시간을 대폭 단축시킵니다.",
      "link": "",
      "image_url": "https://img.danawa.com/prod_img/500000/611/313/img/20313611_1.jpg"
    },
    "VGA": {
      "name": "XFX 라데온 RX 6800 SWFT 319 CORE D6 16GB",
      "price": "₩545530.0",
      "specs": "memory_capacity: 16GB; power_ports: 8핀 x2; length: 340mm; boost_clock: 2105MHz; stream_processors: 3840개; chipset: RX 6800; pcie_interface: PCIe4.0x16; psu_requirement: 650W 이상; 3d_mark: 14601; geekbench6_opencl: 135060; blender_gpu: 1887; average_fps_by_1080p_high: 157; average_fps_by_1080p_ultra: 129; average_fps_by_1440p_ultra: 96; average_fps_by_4k_high: 55",
      "reason": "현세대 고성능 그래픽카드로 업그레이드하여 4K 게이밍과 고사양 게임에서 뛰어난 성능을 발휘합니다.",
      "link": "",
      "image_url": "https://img.danawa.com/prod_img/500000/225/545/img/15545225_1.jpg"
    },
    "PSU": {
      "name": "DEEPCOOL PN750M 80PLUS골드 풀모듈러 ATX3.1",
      "price": "₩134,000.0",
      "specs": "modular_type: 풀모듈러; eta_certification: GOLD; depth: 140mm; main_power_connectors: 24핀(20+4); aux_power_connectors: 8핀(4+4) 2개; pcie_16pin_connectors: 12V2x6 1개; pcie_8pin_connectors: 3개; sata_connectors: 8개; ide_4pin_connectors: 2개; wattage: 750W; efficiency: 80 PLUS 골드; rail_info: +12V 싱글레일",
      "reason": "업그레이드된 고성능 부품들을 안정적으로 지원할 수 있는 충분한 전력 공급 장치입니다.",
      "link": "",
      "image_url": "https://img.danawa.com/prod_img/500000/603/035/img/63035603_1.jpg"
    },
    "Memory": {
      "name": "G.SKILL DDR4-4000 CL18 TRIDENT Z RGB 패키지 (16GB(8Gx2))",
      "price": "₩72,290.0",
      "specs": "timings: CL18-22-22-42; ram_count: 2개; memory_type: DDR4; frequency: 4000MHz (PC4-32000)",
      "reason": "고클럭 메모리로 업그레이드하여 시스템 전체 성능을 향상시킵니다.",
      "link": "",
      "image_url": "https://img.danawa.com/prod_img/500000/896/792/img/15792896_1.jpg"
    },
    "CPU": {
      "name": "AMD 라이젠9 5950X",
      "price": "₩610000.0",
      "specs": "memory_type: DDR4; integrated_graphics: 미탑재; base_clock: 3.4GHz; boost_clock: 4.9GHz; l2_cache: 8MB; l3_cache: 64MB; tdp: 105W; supported_features: SMT(하이퍼스레딩), StoreMI, AMD Ryzen Master, VR Ready 프리미엄; cooler: 미포함; manufacturer: AMD; socket: AM4; cores: 16; threads: 32; pcie_versions: 4.0; max_memory_clock: 3200MHz; cinebench_r23_single: 1614; cinebench_r23_multi: 26017; geekbench6_single: 2276; geekbench6_multi: 12728; blender_cpu: 413",
      "reason": "16코어 32스레드의 플래그십 CPU로 업그레이드하여 게이밍과 멀티태스킹에서 최고 성능을 발휘합니다.",
      "link": "",
      "image_url": "https://img.danawa.com/prod_img/500000/722/630/img/18630722_1.jpg"
    },
    "Motherboard": {
      "name": "ASUS PRIME B550-PLUS 대원CTS",
      "price": "₩142,000",
      "specs": "ASUS PRIME B550-PLUS는 AMD B550 칩셋 기반의 ATX 메인보드로, AMD AM4 소켓을 지원하여 3세대 AMD Ryzen™ 프로세서와 호환됩니다. 듀얼 M.2 슬롯을 제공하며, PCIe 4.0을 지원하여 빠른 데이터 전송이 가능합니다.",
      "reason": "업그레이드된 CPU와 완벽한 호환성을 제공하며 확장성이 뛰어난 메인보드입니다.",
      "link": "https://search.danawa.com/dsearch.php?query=ASUS%20PRIME%20B550-PLUS%20%EB%8C%80%EC%9B%90CTS",
      "image_url": "https://dlcdnwebimgs.asus.com/gain/8B3A0A3A-0A3A-4A3A-8A3A-0A3A0A3A0A3A/w1000/h732"
    }
  },
  "total_price": "₩1,677,620",
  "total_reason": "그래픽카드와 CPU 모두 한 단계 이상 성능이 높은 부품으로 바꿔, 게임이 훨씬 더 부드럽고 빠르게 실행됩니다. 저장장치도 2배 더 크고 최대 5배 빠른 모델로 업그레이드되어, 게임 설치 및 로딩 속도도 크게 향상됩니다. 기존과 같은 케이스, 쿨러, 메모리는 그대로 사용해 안정성과 조립 편의성도 유지됩니다.",
  "suggestion": "업그레이드된 견적을 확인하셨습니다! 이제 '업그레이드 결과를 저장'하여 나중에 참고할 수 있도록 하세요. 또한, '호환성 검사'를 통해 모든 부품이 잘 맞는지 확인하거나, '견적 평가'를 통해 업그레이드된 견적의 성능을 평가해보세요."
};

// Sample data for build evaluations
export const sampleBuildEvaluationData = {
  "price_performance": {
    "score": 85,
    "comment": "이 구성은 성능 대비 가격이 우수하여, 예산을 고려하는 사용자에게 적합합니다. 특히, AMD 라이젠 5 5600X와 RTX 3060의 조합은 가성비가 뛰어납니다."
  },
  "performance": {
    "score": 75,
    "comment": "이 시스템은 최신 게임과 멀티태스킹 작업을 원활하게 수행할 수 있는 성능을 제공합니다. 그러나 최고 사양의 게임이나 전문적인 작업에서는 약간의 성능 한계가 있을 수 있습니다."
  },
  "expandability": {
    "score": 74,
    "comment": "제안하신 PC 구성은 확장성 측면에서 우수한 편입니다. 추후 메모리, 저장장치, 그래픽 카드 등의 업그레이드에 충분한 여유가 있습니다."
  },
  "noise": {
    "score": 90,
    "comment": "이 PC 구성은 비교적 조용하게 동작하여, 소음에 민감한 사용자에게 적합합니다."
  },
  "average_score": 81,
  "suggestion": "현재 구성은 성능, 소음, 확장성 측면에서 전반적으로 우수한 평가를 받았습니다. 특히, 소음에 민감한 사용자에게 적합한 조용한 시스템입니다. 평균 점수도 높으므로, 이 견적을 저장해두는 것을 추천드립니다. 만약 성능을 더 향상시키고 싶다면, 그래픽 카드 업그레이드를 고려해보실 수 있습니다. 추가적인 부품 검색이나 업그레이드가 필요하다면, 관련 기능을 활용해보세요."
};

// Sample data for general search responses by expertise level
export const sampleGeneralSearchResponses = {
  beginner: "GPU는 '그래픽 처리 장치'로, 컴퓨터에서 화면에 그림이나 영상을 표시할 때 필요한 부품입니다. 쉽게 말하면, 게임을 하거나 영상을 볼 때 그림이 끊기지 않고 부드럽게 나오도록 도와주는 역할을 합니다. GPU를 구매할 때는, 주로 어떤 용도로 쓸지 먼저 생각해야 합니다. 게임이나 영상 작업처럼 그래픽 작업이 많은 경우 더 성능이 좋은 GPU가 필요하며, 단순히 인터넷이나 문서 작업 정도면 보통 내장 그래픽으로도 충분합니다. 예산, 사용할 프로그램, 모니터 해상도 등도 함께 고려해야 합니다.",
  
  intermediate: "GPU는 'Graphics Processing Unit'의 약자로, 그래픽 카드를 구성하는 핵심 부품입니다. GPU는 주로 3D 그래픽 연산, 영상 렌더링, 딥러닝 등의 복잡한 계산을 담당합니다. GPU를 구매할 때는 목적에 따라 성능과 메모리 용량, 발열, 호환성, 가격 등을 고려해야 합니다. 예를 들어 게임용이라면 최신 아키텍처와 충분한 VRAM이 중요하며, 딥러닝이나 영상 편집 용도라면 단일·더블 프리시전 성능 및 CUDA 코어 수, VRAM 용량이 중요한 선택 기준이 됩니다. 또한 사용하려는 케이스에 장착 가능한 크기와, 파워 서플라이의 용량도 확인해야 안정적인 시스템 구성이 가능합니다.",
  
  expert: "GPU는 컴퓨터에서 그래픽 연산을 담당하는 부품으로, 주로 게임, 영상 편집, 딥러닝 등 높은 연산 성능을 요구하는 작업에서 필수적입니다. GPU를 구매할 때는 사용하는 목적에 따라 VRAM 용량, 연산 능력(예: CUDA 또는 RT 코어 수), 지원하는 최신 기술(DLSS, 하드웨어 인코딩/디코딩 등), 모니터와의 호환성(출력 단자, 최대 해상도 지원), 그리고 전력 소비량과 쿨링 시스템을 고려해야 합니다. 예를 들어, NVIDIA의 RTX 40 시리즈는 DLSS3와 4세대 NVENC를 지원해 게임뿐만 아니라 영상 인코딩 및 AI 워크플로우에도 최적의 선택지입니다."
};
