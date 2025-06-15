
# PC 견적 AI 어시스턴트

PC 견적 추천, 부품 상담, 호환성 검사 등을 제공하는 AI 기반 웹 애플리케이션입니다.

## 🚀 주요 기능

### 💬 지능형 채팅 시스템
- **다중 채팅 모드**: 견적 추천, 부품 추천, 호환성 검사, 견적 평가, 스펙 업그레이드, 범용 검색
- **전문가 수준별 맞춤 응답**: 초보자, 중급자, 전문가 수준에 따른 차별화된 설명
- **실시간 대화**: 사용자와 AI 간의 자연스러운 대화형 인터페이스

### 🖥️ PC 견적 관리
- **AI 견적 생성**: 사용자 요구사항 기반 맞춤형 PC 견적 자동 생성
- **견적 저장 및 관리**: 생성된 견적을 개인 계정에 저장하고 관리
- **상세 견적 보기**: 부품별 상세 정보, 가격, 추천 이유, 구매 링크 제공
- **PDF 내보내기**: 견적서를 PDF 파일로 다운로드

### 📊 부품 분석 및 추천
- **부품별 상세 분석**: CPU, GPU, 메모리, 저장장치 등 각 부품의 성능 분석
- **호환성 검사**: 선택한 부품들 간의 호환성 자동 검증
- **성능 평가**: 게임, 작업, 가성비 등 다각도 성능 평가
- **업그레이드 제안**: 기존 PC의 업그레이드 방안 제시

## 🛠️ 기술 스택

### Frontend
- **React 18** - 모던 리액트 기반 사용자 인터페이스
- **TypeScript** - 타입 안전성과 코드 품질 보장
- **Vite** - 빠른 개발 서버와 번들링
- **Tailwind CSS** - 유틸리티 기반 스타일링
- **shadcn/ui** - 일관성 있는 UI 컴포넌트 라이브러리

### 상태 관리 및 데이터
- **@tanstack/react-query** - 서버 상태 관리 및 데이터 페칭
- **React Router** - SPA 라우팅
- **Zustand** (커스텀 훅 기반) - 클라이언트 상태 관리

### 백엔드 연동
- **Supabase** - 데이터베이스 및 인증
- **Axios** - HTTP 클라이언트
- **Edge Functions** - 서버리스 API 엔드포인트

### UI/UX 라이브러리
- **Lucide React** - 아이콘 라이브러리
- **React Markdown** - 마크다운 렌더링
- **Recharts** - 데이터 시각화
- **Sonner** - 토스트 알림

## 📁 프로젝트 구조

```
src/
├── components/           # 재사용 가능한 UI 컴포넌트
│   ├── ui/              # shadcn/ui 기본 컴포넌트
│   ├── responseRenderers/   # AI 응답 렌더링 컴포넌트
│   ├── ChatLayout.tsx   # 메인 레이아웃
│   ├── ChatMain.tsx     # 채팅 인터페이스
│   ├── ChatMessage.tsx  # 메시지 컴포넌트
│   ├── BuildsList.tsx   # 견적 목록
│   └── EstimateDetailsModal.tsx  # 견적 상세 모달
├── hooks/               # 커스텀 리액트 훅
│   ├── useConversationState.tsx  # 대화 상태 관리
│   ├── useMessageActions.tsx     # 메시지 처리
│   ├── useSessionManagement.tsx  # 세션 관리
│   ├── useEstimates.tsx         # 견적 관리
│   └── useBuildActions.tsx      # 빌드 액션
├── modules/             # 응답 처리 모듈
│   └── responseModules/ # 채팅 모드별 응답 처리
├── services/            # API 서비스 레이어
│   ├── apiService.ts    # 메인 API 서비스
│   ├── sessionApiService.ts     # 세션 API
│   └── estimatesApiService.ts   # 견적 API
├── types/               # TypeScript 타입 정의
├── utils/               # 유틸리티 함수
└── pages/               # 페이지 컴포넌트
```

## 🏗️ 아키텍처 개요

### 컴포넌트 계층 구조
```
App
└── ChatLayout (메인 레이아웃)
    ├── Sidebar (좌측: 메뉴/대화목록)
    ├── ChatMain (중앙: 채팅 인터페이스)
    │   ├── ChatHeader (헤더)
    │   ├── ChatMessages (메시지 목록)
    │   │   └── ChatMessage (개별 메시지)
    │   │       └── ResponseRenderer (AI 응답 렌더링)
    │   └── MessageInput (입력 영역)
    └── Sidebar (우측: 전문가 수준 설문)
```

### 데이터 플로우
```
사용자 입력 → MessageInput → useConversationState → useMessageActions
                                      ↓
ResponseModule → API 호출 → AI 응답 → ResponseRenderer → 화면 표시
                                      ↓
견적 데이터 → useEstimates → BuildsList/EstimateDetailsModal
```

## 🔧 주요 기능별 상세 설명

### 💬 채팅 시스템
- **세션 관리**: 각 대화는 독립적인 세션으로 관리
- **실시간 응답**: 사용자 메시지 즉시 표시, AI 응답 스트리밍
- **모드별 처리**: 채팅 모드에 따라 다른 AI 모델과 프롬프트 사용

### 🖥️ 견적 생성 과정
1. 사용자 요구사항 입력 ("게임용 PC 100만원 예산")
2. AI가 요구사항 분석 및 적합한 부품 선택
3. 견적 데이터 구조화 (부품별 상세 정보 포함)
4. 견적 저장 및 PDF 생성 옵션 제공

### 📊 응답 렌더링 시스템
각 응답 타입별로 특화된 렌더러 제공:
- `BuildRecommendationRenderer`: 견적 추천 결과
- `PartRecommendationRenderer`: 부품 추천 결과
- `CompatibilityCheckRenderer`: 호환성 검사 결과
- `BuildEvaluationRenderer`: 견적 평가 결과
- `SpecUpgradeRenderer`: 업그레이드 제안
- `GeneralSearchRenderer`: 일반 검색 결과

## 🚀 시작하기

### 필수 요구사항
- Node.js 18+
- npm 또는 yarn

### 설치 및 실행
```bash
# 저장소 클론
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>

# 의존성 설치
npm install

# 개발 서버 시작
npm run dev
```

### 환경 설정
Supabase 프로젝트 설정 및 환경 변수 구성이 필요합니다.

## 📱 사용자 가이드

### 1. 채팅 모드 선택
- 견적 추천: 완전한 PC 견적이 필요할 때
- 부품 추천: 특정 부품만 찾을 때  
- 호환성 검사: 부품들이 잘 맞는지 확인할 때
- 견적 평가: 기존 견적을 분석하고 싶을 때
- 스펙 업그레이드: 현재 PC를 업그레이드하고 싶을 때

### 2. 전문가 수준 설정
- 초보자: 쉬운 용어와 기본적인 설명
- 중급자: 적절한 기술적 세부사항 포함
- 전문가: 상세한 기술 스펙과 전문 용어 사용

### 3. 견적 관리
- 생성된 견적은 "PC 견적" 탭에서 확인
- 각 견적의 상세 정보 조회 가능
- PDF로 다운로드하여 오프라인에서도 확인

## 🎯 향후 개발 계획

- [ ] 가격 비교 기능 강화
- [ ] 부품 재고 실시간 확인
- [ ] 커뮤니티 견적 공유 기능
- [ ] 모바일 앱 개발
- [ ] 다국어 지원

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 제공됩니다.

## 🤝 기여하기

버그 리포트, 기능 제안, 풀 리퀘스트를 환영합니다!

---

**개발 문의**: [프로젝트 이슈](https://github.com/your-repo/issues)를 통해 연락주세요.
