
# PC 견적 AI 어시스턴트 Frontend - Design Specification

## 1. 프로젝트 개요 (Project Overview)

### 1.1 목표 (Objectives)
- **주요 목표**: 사용자가 원하는 용도에 맞는 컴퓨터 견적을 AI를 통해 추천받을 수 있는 웹 애플리케이션
- **사용자 경험**: 직관적이고 반응형인 채팅 인터페이스를 통한 견적 상담
- **기능적 목표**:
  - 실시간 채팅 기반 견적 상담
  - 다양한 모드별 전문 상담 (범용 검색, 부품 추천, 호환성 검사, 견적 추천, 스펙 업그레이드, 견적 평가)
  - 세션 기반 대화 관리
  - 생성된 견적 목록 관리
  - 첫 응답 기반 자동 세션 제목 생성

### 1.2 기술 스택 (Technology Stack)
- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS + shadcn/ui components
- **State Management**: React Hooks (useState, useEffect, custom hooks)
- **HTTP Client**: Axios
- **Routing**: React Router DOM
- **Icons**: Lucide React
- **Backend Integration**: Supabase

## 2. 시스템 아키텍처 (System Architecture)

### 2.1 전체 시스템 아키텍처 (Overall System Architecture)

```mermaid
graph TB
    subgraph "Frontend Application"
        subgraph "Presentation Layer"
            A[ChatLayout] --> B[ChatMain]
            A --> C[Sidebar - Conversations]
            A --> D[Sidebar - Builds]
            B --> E[ChatMessages]
            E --> F[ChatMessage]
            F --> G[ResponseRenderer]
            G --> H[Mode-specific Renderers]
            C --> I[ChatConversationList]
            D --> J[BuildsList]
        end
        
        subgraph "Business Logic Layer"
            K[useConversationState] --> L[useSessionManagement]
            K --> M[useMessageActions]
            K --> N[useBuildActions]
            K --> O[useChatMode]
        end
        
        subgraph "Service Layer"
            P[sessionApiService]
            Q[messageService]
            R[apiService]
        end
        
        subgraph "Data Layer"
            S[TypeScript Types]
            T[API Response Types]
            U[Session Types]
            V[Message Types]
        end
    end
    
    subgraph "Backend Services"
        W[Supabase Database]
        X[AI Processing Service]
        Y[Authentication Service]
    end
    
    H --> P
    H --> Q
    H --> R
    P --> W
    Q --> X
    R --> Y
    
    L --> P
    M --> Q
    N --> R
```

### 2.2 컴포넌트 계층 구조 (Component Hierarchy)

```mermaid
graph TD
    A[App] --> B[Index]
    B --> C[ChatLayout]
    
    C --> D[Sidebar Left]
    C --> E[ChatMain]
    C --> F[Sidebar Right]
    
    D --> G[ChatConversationList]
    G --> H[Session Items]
    
    E --> I[ChatHeader]
    E --> J[ChatMessages]
    E --> K[MessageInput]
    
    J --> L[ChatMessage]
    L --> M[ResponseRenderer]
    
    M --> N[GeneralSearchRenderer]
    M --> O[PartRecommendationRenderer]
    M --> P[CompatibilityCheckRenderer]
    M --> Q[BuildRecommendationRenderer]
    M --> R[SpecUpgradeRenderer]
    M --> S[BuildEvaluationRenderer]
    
    F --> T[BuildsList]
    T --> U[Build Items]
    
    style A fill:#e1f5fe
    style C fill:#f3e5f5
    style E fill:#e8f5e8
    style M fill:#fff3e0
```

### 2.3 데이터 흐름 아키텍처 (Data Flow Architecture)

```mermaid
graph LR
    subgraph "User Interface"
        A[User Input] --> B[MessageInput]
        B --> C[ChatMain]
    end
    
    subgraph "State Management"
        C --> D[useConversationState]
        D --> E[useSessionManagement]
        D --> F[useMessageActions]
        D --> G[useBuildActions]
    end
    
    subgraph "API Services"
        E --> H[sessionApiService]
        F --> I[messageService]
        G --> J[apiService]
    end
    
    subgraph "Backend"
        H --> K[Supabase Sessions]
        I --> L[AI Processing]
        J --> M[Build Management]
    end
    
    subgraph "Response Processing"
        L --> N[ResponseRenderer]
        N --> O[Mode-specific Display]
        M --> P[BuildsList Update]
    end
    
    O --> Q[UI Update]
    P --> Q
    K --> R[Session List Update]
    R --> Q
```

## 3. 컴포넌트 클래스 다이어그램 (Component Class Diagrams)

### 3.1 Core Components Class Diagram

```mermaid
classDiagram
    class ChatLayout {
        -leftSidebarOpen: boolean
        -rightSidebarOpen: boolean
        +useConversationState(): ConversationState
        +useEffect(): void
        +toggleLeftSidebar(): void
        +toggleRightSidebar(): void
        +render(): JSX.Element
    }

    class ChatMain {
        +messages: UIMessage[]
        +isLoading: boolean
        +showExample: boolean
        +chatMode: string
        +setChatMode(mode: string): void
        +sendMessage(text: string): Promise~void~
        +getExamplePrompt(): string
        +sessionId: string
        +onTitleExtracted(title: string): void
        +render(): JSX.Element
    }

    class ChatMessages {
        +messages: UIMessage[]
        +sessionId: string
        +isLoading: boolean
        +chatMode: string
        +onTitleExtracted(title: string): void
        +useEffect(): void
        +scrollToBottom(): void
        +render(): JSX.Element
    }

    class ChatMessage {
        +message: UIMessage
        +sessionId: string
        +chatMode: string
        +onTitleExtracted(title: string): void
        +isFirstAssistantMessage: boolean
        +formatTimestamp(): string
        +render(): JSX.Element
    }

    class Sidebar {
        +isOpen: boolean
        +onToggle(): void
        +title: string
        +position: 'left' | 'right'
        +children: React.ReactNode
        +getToggleIcon(): JSX.Element
        +render(): JSX.Element
    }

    class ResponseRenderer {
        +content: string
        +chatMode: string
        +sessionId: string
        +isCompatibilityRequest: boolean
        +expertiseLevel: ExpertiseLevel
        +onTitleExtracted(title: string): void
        +selectRenderer(): JSX.Element
        +extractTitle(): void
    }

    ChatLayout --> ChatMain
    ChatLayout --> Sidebar
    ChatMain --> ChatMessages
    ChatMessages --> ChatMessage
    ChatMessage --> ResponseRenderer
```

### 3.2 Hooks Class Diagram

```mermaid
classDiagram
    class useConversationState {
        -messages: UIMessage[]
        -isLoading: boolean
        -autoRefreshTriggered: boolean
        +startNewConversation(): Promise~Session~
        +selectConversation(session: Session): void
        +sendMessage(text: string): Promise~void~
        +handleDeleteConversation(sessionId: string): Promise~void~
        +handleTitleExtracted(title: string): void
        +syncMessagesFromDB(apiMessages: ApiMessage[]): void
    }

    class useSessionManagement {
        -currentSession: Session | null
        -sessions: Session[]
        -showExample: boolean
        -sessionsLoading: boolean
        -titleUpdatingSessionId: number | null
        +fetchSessions(): Promise~void~
        +startNewConversation(): Promise~Session~
        +selectConversation(session: Session): void
        +handleDeleteConversation(sessionId: string): Promise~void~
        +updateSessionTitle(sessionId: number, title: string): Promise~boolean~
    }

    class useMessageActions {
        -dbMessages: ApiMessage[]
        -msgLoading: boolean
        +loadMessages(sessionId: string): Promise~void~
        +sendMessage(text: string, expertiseLevel: string, chatMode: string, sessionToUse: Session): Promise~void~
        +processMessageResponse(response: any): void
    }

    class useBuildActions {
        -builds: Build[]
        -isGeneratingBuilds: boolean
        -autoSwitchDisabled: boolean
        +loadBuilds(): Promise~void~
        +handleDeleteBuild(buildId: string): Promise~void~
        +handleViewBuild(buildId: string): void
        +checkForNewBuilds(): Promise~void~
        +disableAutoSwitch(): void
    }

    class useChatMode {
        -chatMode: string
        +setChatMode(mode: string): void
        +getExamplePrompt(): string
        +validateChatMode(mode: string): boolean
    }

    useConversationState --> useSessionManagement
    useConversationState --> useMessageActions
    useConversationState --> useBuildActions
    useConversationState --> useChatMode
```

### 3.3 Service Layer Class Diagram

```mermaid
classDiagram
    class sessionApiService {
        +createSession(): Promise~Session~
        +getSessions(): Promise~Session[]~
        +deleteSession(sessionId: number): Promise~void~
        +updateSession(sessionId: number, data: Partial~Session~): Promise~Session~
        +getSessionMessages(sessionId: string): Promise~ApiMessage[]~
    }

    class messageService {
        +processMessage(messages: MessageRequest[], chatMode: string, sessionId: string): Promise~string~
        +formatMessageForAPI(message: UIMessage): MessageRequest
        +parseAPIResponse(response: any): string
    }

    class apiService {
        +request(config: AxiosRequestConfig): Promise~any~
        +get(url: string, config?: AxiosRequestConfig): Promise~any~
        +post(url: string, data?: any, config?: AxiosRequestConfig): Promise~any~
        +delete(url: string, config?: AxiosRequestConfig): Promise~any~
        +handleError(error: any): void
    }

    sessionApiService --> apiService
    messageService --> apiService
```

## 4. 시퀀스 다이어그램 (Sequence Diagrams)

### 4.1 세션 생성 및 첫 메시지 전송 시퀀스

```mermaid
sequenceDiagram
    participant User as 사용자
    participant UI as ChatMain
    participant State as useConversationState
    participant Session as useSessionManagement
    participant Message as useMessageActions
    participant API as API Service
    participant Backend as Backend

    User->>UI: 첫 메시지 입력
    UI->>State: sendMessage(text)
    State->>Session: startNewConversation()
    Session->>API: createSession()
    API->>Backend: POST /api/sessions/
    Backend-->>API: 새 세션 데이터
    API-->>Session: Session 객체 반환
    Session->>Session: setCurrentSession(newSession)
    Session->>Session: setSessions([newSession, ...prev])
    Session-->>State: 새 세션 반환
    
    State->>Message: sendMessage(text, expertiseLevel, chatMode, session)
    Message->>API: processMessage(messages, chatMode, sessionId)
    API->>Backend: AI 처리 요청
    Backend-->>API: AI 응답 (title 포함)
    API-->>Message: 응답 데이터
    Message->>Message: DB 메시지 업데이트
    Message-->>State: 메시지 동기화
    
    State->>State: onTitleExtracted 콜백 호출
    State->>Session: updateSessionTitle(sessionId, title)
    Session->>Session: 로컬 상태 업데이트
    Session->>Session: setTitleUpdatingSessionId(sessionId)
    
    Note over Session: 2초간 애니메이션 표시
    Session->>Session: setTitleUpdatingSessionId(null)
    
    State-->>UI: 업데이트된 상태
    UI-->>User: 새 메시지 및 제목 업데이트 표시
```

### 4.2 응답 렌더링 및 제목 추출 시퀀스

```mermaid
sequenceDiagram
    participant ChatMessage as ChatMessage
    participant Renderer as ResponseRenderer
    participant State as useConversationState
    participant Session as useSessionManagement
    participant UI as ConversationList

    ChatMessage->>Renderer: render(content, chatMode, onTitleExtracted)
    Renderer->>Renderer: useEffect 실행
    Renderer->>Renderer: JSON.parse(content) 시도
    
    alt JSON 파싱 성공
        Renderer->>Renderer: parsed.title 확인
        Renderer->>State: onTitleExtracted(title)
    else JSON 파싱 실패
        Renderer->>Renderer: 마크다운 패턴 매칭
        Renderer->>State: onTitleExtracted(title)
    end
    
    State->>Session: updateSessionTitle(sessionId, title)
    Session->>Session: 세션 목록 업데이트
    Session->>Session: 현재 세션 업데이트
    Session->>UI: titleUpdatingSessionId 설정
    UI->>UI: 반짝임 애니메이션 시작
    
    Note over UI: 2초간 파란색 배경 + 펄스 효과
    
    Session->>UI: titleUpdatingSessionId 초기화
    UI->>UI: 애니메이션 종료
```

### 4.3 세션 관리 시퀀스

```mermaid
sequenceDiagram
    participant User as 사용자
    participant List as ChatConversationList
    participant State as useConversationState
    participant Session as useSessionManagement
    participant API as sessionApiService

    User->>List: 새 대화 버튼 클릭
    List->>State: startNewConversation()
    State->>Session: startNewConversation()
    Session->>API: createSession()
    API-->>Session: 새 세션 데이터
    Session->>Session: setCurrentSession(newSession)
    Session->>Session: setSessions([newSession, ...prev])
    Session->>Session: setShowExample(false)
    Session-->>State: 새 세션 반환
    State-->>List: 새 세션으로 UI 업데이트

    User->>List: 기존 세션 선택
    List->>State: selectConversation(session)
    State->>Session: selectConversation(session)
    Session->>Session: setCurrentSession(session)
    Session->>Session: setShowExample(false)
    Session-->>State: 세션 변경 완료
    State->>State: loadMessages(sessionId)
    State-->>List: 선택된 세션의 메시지 로드

    User->>List: 세션 삭제 버튼 클릭
    List->>State: handleDeleteConversation(sessionId)
    State->>Session: handleDeleteConversation(sessionId)
    Session->>API: deleteSession(sessionId)
    API-->>Session: 삭제 완료
    Session->>Session: setSessions(filtered)
    alt 현재 세션이 삭제된 경우
        Session->>Session: setCurrentSession(null)
        Session->>Session: setShowExample(true)
    end
    Session-->>State: 삭제 완료
    State-->>List: 업데이트된 세션 목록
```

## 5. 데이터 타입 정의 (Data Type Definitions)

### 5.1 Core Data Types

```typescript
// 세션 관련 타입
interface Session {
  id: number;
  session_name: string;
  last_modified: string;
  messages: any[];
}

// API 메시지 타입 (백엔드 응답)
interface ApiMessage {
  content: string;
  role: 'user' | 'assistant';
  mode: string;
  id: number;
  session_id: number;
  created_at: string;
}

// UI 메시지 타입 (프론트엔드 사용)
interface UIMessage {
  text: string;
  isUser: boolean;
  chatMode?: string;
  expertiseLevel?: 'beginner' | 'intermediate' | 'expert';
}

// 메시지 요청 타입
interface MessageRequest {
  role: string;
  content: string;
}
```

### 5.2 Response Types

```typescript
// 범용 검색 응답
interface GeneralSearchResponse {
  content: string;
  expertiseLevel: 'beginner' | 'intermediate' | 'expert';
}

// 부품 추천 응답
interface PartRecommendationResponse {
  parts: {
    [key: string]: {
      name: string;
      reason: string;
      price: string;
      specs: string;
      link: string;
      image_url: string;
    };
  };
  suggestion: string;
}

// 호환성 검사 응답
interface CompatibilityCheckResponse {
  components: string[];
  [key: string]: boolean | string | string[] | null;
  edge_case?: boolean;
  edge_reason?: string;
  suggestion?: string;
}

// 견적 추천 응답
interface BuildRecommendationResponse {
  title: string;
  parts: {
    [key: string]: {
      name: string;
      price: string;
      specs: string;
      reason: string;
      link: string;
      image_url: string;
    };
  };
  total_price: string;
  total_reason: string;
  suggestion: string;
}

// 견적 평가 응답
interface BuildEvaluationResponse {
  performance: {
    score: number;
    comment: string;
  };
  price_performance: {
    score: number;
    comment: string;
  };
  expandability: {
    score: number;
    comment: string;
  };
  noise: {
    score: number;
    comment: string;
  };
  average_score: number;
  suggestion?: string;
}
```

### 5.3 Build and Component Types

```typescript
// 견적 타입
interface Build {
  id: number;
  created_at: string;
  name: string;
  session_id: number;
  total_price: number;
  parts: any;
  components: any[];
  recommendation: string;
  rating?: any;
}

// 컴포넌트 세부사항
interface PartDetail {
  name: string;
  price: string;
  specs: string;
  reason: string;
  link: string;
  image?: string;
  image_url?: string;
}

// 견적 데이터
interface BuildData {
  title: string;
  parts: PartDetail[] | Record<string, PartDetail>;
  total_price: string;
  total_reason: string;
  suggestion?: string;
}

// 호환성 데이터
interface CompatibilityData {
  [key: string]: boolean | string | string[] | undefined;
  components?: string[];
}
```

### 5.4 Hook State Types

```typescript
// 대화 상태 타입
interface ConversationState {
  // 세션 관리
  currentConversation: Session | null;
  conversations: Session[];
  convoLoading: boolean;
  titleUpdatingSessionId: number | null;

  // 메시지 관리
  messages: UIMessage[];
  dbMessages: ApiMessage[];
  isLoading: boolean;
  msgLoading: boolean;

  // 견적 관리
  builds: Build[];
  buildsLoading: boolean;
  isGeneratingBuilds: boolean;

  // UI 상태
  showExample: boolean;
  chatMode: string;
  autoSwitchDisabled: boolean;
  sessionId?: string;
}

// 컴포넌트 Props 타입
interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  title: string;
  position: 'left' | 'right';
  children: React.ReactNode;
}

interface ChatMainProps {
  messages: UIMessage[];
  isLoading: boolean;
  showExample: boolean;
  chatMode: string;
  setChatMode: (mode: string) => void;
  sendMessage: (text: string) => Promise<void>;
  getExamplePrompt: () => string;
  sessionId?: string;
  onTitleExtracted?: (title: string) => void;
}
```

## 6. 상태 관리 아키텍처 (State Management Architecture)

### 6.1 상태 흐름 다이어그램

```mermaid
stateDiagram-v2
    [*] --> AppInit
    AppInit --> SessionLoading
    SessionLoading --> NoSession
    SessionLoading --> HasSessions
    
    NoSession --> NewSession : 첫 메시지 전송
    HasSessions --> SessionSelected : 세션 선택
    HasSessions --> NewSession : 새 대화 시작
    
    NewSession --> MessageSending : 메시지 전송
    SessionSelected --> MessageSending : 메시지 전송
    
    MessageSending --> ResponseReceived : AI 응답 수신
    ResponseReceived --> TitleExtraction : 첫 응답인 경우
    ResponseReceived --> MessageComplete : 일반 응답
    
    TitleExtraction --> TitleUpdating : 제목 추출 성공
    TitleUpdating --> MessageComplete : 제목 업데이트 완료
    
    MessageComplete --> SessionSelected : 대화 계속
    SessionSelected --> SessionDeleted : 세션 삭제
    SessionDeleted --> NoSession : 현재 세션 삭제된 경우
    SessionDeleted --> HasSessions : 다른 세션 존재
```

### 6.2 Hook 의존성 그래프

```mermaid
graph TD
    A[useConversationState] --> B[useSessionManagement]
    A --> C[useMessageActions]
    A --> D[useBuildActions]
    A --> E[useChatMode]
    
    B --> F[sessionApiService]
    C --> G[messageService]
    D --> H[apiService]
    
    F --> I[Supabase Client]
    G --> I
    H --> I
    
    J[ChatLayout] --> A
    K[ChatMain] --> A
    L[ChatMessages] --> A
    M[Sidebar] --> A
    
    style A fill:#e1f5fe
    style I fill:#ffebee
```

## 7. API 통신 아키텍처 (API Communication Architecture)

### 7.1 API 엔드포인트 매핑

```mermaid
graph LR
    subgraph "Frontend Services"
        A[sessionApiService]
        B[messageService]
        C[apiService]
    end
    
    subgraph "API Endpoints"
        D[POST /api/sessions/]
        E[GET /api/sessions]
        F[GET /api/{sessionId}/messages/]
        G[DELETE /api/sessions/{sessionId}]
        H[POST /chat-completion]
    end
    
    subgraph "Backend Services"
        I[Session Management]
        J[Message Processing]
        K[AI Integration]
    end
    
    A --> D
    A --> E
    A --> F
    A --> G
    B --> H
    
    D --> I
    E --> I
    F --> I
    G --> I
    H --> J
    J --> K
```

### 7.2 에러 처리 플로우

```mermaid
flowchart TD
    A[API 요청] --> B{요청 성공?}
    B -->|예| C[응답 데이터 처리]
    B -->|아니오| D[에러 타입 확인]
    
    D --> E{네트워크 에러?}
    D --> F{인증 에러?}
    D --> G{서버 에러?}
    D --> H{클라이언트 에러?}
    
    E -->|예| I[재시도 로직]
    F -->|예| J[로그인 페이지 리다이렉트]
    G -->|예| K[서버 에러 토스트]
    H -->|예| L[클라이언트 에러 토스트]
    
    I --> M[최대 재시도 횟수 확인]
    M -->|재시도 가능| A
    M -->|재시도 불가| K
    
    C --> N[상태 업데이트]
    J --> O[인증 상태 초기화]
    K --> P[에러 상태 설정]
    L --> P
```

## 8. 컴포넌트 라이프사이클 (Component Lifecycle)

### 8.1 ChatLayout 라이프사이클

```mermaid
sequenceDiagram
    participant Mount as Component Mount
    participant Hooks as Custom Hooks
    participant API as API Services
    participant State as Local State

    Mount->>Hooks: useConversationState() 초기화
    Hooks->>API: fetchSessions() 호출
    API-->>Hooks: 세션 목록 반환
    Hooks->>State: 상태 업데이트
    State-->>Mount: 초기 렌더링 완료
    
    Note over Mount: 사용자 상호작용
    
    Mount->>Hooks: 메시지 전송
    Hooks->>API: sendMessage() 호출
    API-->>Hooks: AI 응답 반환
    Hooks->>State: 메시지 상태 업데이트
    State-->>Mount: UI 업데이트
    
    Note over Mount: 제목 추출 (첫 응답)
    
    Hooks->>State: 제목 업데이트
    State->>State: 애니메이션 트리거
    State-->>Mount: 제목 업데이트 완료
```

## 9. 성능 최적화 전략 (Performance Optimization)

### 9.1 렌더링 최적화

- **React.memo**: 불필요한 리렌더링 방지
- **useCallback**: 함수 메모이제이션
- **useMemo**: 계산 결과 메모이제이션
- **지연 로딩**: 큰 컴포넌트의 동적 임포트

### 9.2 상태 최적화

- **로컬 상태 분리**: 전역 상태와 로컬 상태 적절한 분리
- **낙관적 업데이트**: 사용자 경험 향상을 위한 즉시 UI 업데이트
- **배치 업데이트**: 여러 상태 변경을 하나로 묶어 처리

### 9.3 네트워크 최적화

- **요청 캐싱**: 중복 API 요청 방지
- **요청 병합**: 동시 요청 최적화
- **에러 재시도**: 네트워크 불안정 상황 대응

## 10. 보안 고려사항 (Security Considerations)

### 10.1 데이터 보호
- 사용자 입력 검증 및 새니타이징
- XSS 방지를 위한 안전한 렌더링
- 민감한 데이터 로컬 저장 금지

### 10.2 API 보안
- HTTPS 통신 강제
- 적절한 에러 메시지 처리
- 세션 관리 보안

### 10.3 인증 및 권한
- Supabase 인증 시스템 활용
- 세션 기반 권한 관리
- API 키 보안 관리

## 11. 테스트 전략 (Testing Strategy)

### 11.1 단위 테스트
- 개별 컴포넌트 테스트
- 커스텀 훅 테스트
- 유틸리티 함수 테스트

### 11.2 통합 테스트
- 컴포넌트 간 상호작용 테스트
- API 통신 테스트
- 상태 관리 테스트

### 11.3 E2E 테스트
- 사용자 플로우 테스트
- 크로스 브라우저 테스트
- 반응형 디자인 테스트

이 Design Specification은 PC 견적 AI 어시스턴트 Frontend의 전체적인 구조와 설계 원칙을 제시하며, 개발팀이 일관된 방향으로 개발을 진행할 수 있도록 상세한 가이드라인을 제공합니다.
