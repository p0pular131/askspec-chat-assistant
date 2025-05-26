
import { ResponseModule } from './types';

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

export const specUpgradeModule: ResponseModule = {
  name: 'specUpgrade',
  moduleType: '스펙 업그레이드',
  process: async () => {
    // Always return the sample data as a JSON string
    return JSON.stringify(sampleSpecUpgradeData);
  }
};
