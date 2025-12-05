
# PRD: meemee (미미) - v1.0

## 1. Product Overview
**meemee**는 "기록의 재미"에 초점을 맞춘 힙하고 감각적인 미식 로그 서비스입니다. 단순한 별점 평가를 넘어, **미식 MBTI** 분석과 나만의 언어로 남기는 **테이스팅 노트**를 통해 나의 취향을 발견하고, 비슷한 입맛을 가진 친구들과 연결되는 경험을 제공합니다.

---

## 2. Core Value Proposition
1.  **Smart Recording**: 사진만 찍으면 메뉴, 장소, 태그까지 AI가 분석해주어 기록의 편의성을 높입니다.
2.  **Manual Gourmet Note**: AI가 써주는 글이 아닌, 전문적인 미식 키워드를 활용해 **사용자가 직접 작성하는 깊이 있는 기록**을 지향합니다.
3.  **Identity Discovery**: "나 맵찔이인가?" 같은 막연한 생각을 **구체적인 데이터(Taste DNA)**와 **유형(MBTI)**으로 정의해줍니다.

---

## 3. User Personas
- **The Collector (20대 여)**: 예쁜 카페와 맛집을 찾아다니며 인스타그램에 올릴 사진을 찍고, 짧더라도 감각적인 기록을 남기고 싶어 함.
- **The Analyst (30대 남)**: 음식의 맛과 향을 분석적으로 기록하고, 나만의 맛집 리스트를 체계적으로 관리하고 싶어 함.
- **The Follower**: 메뉴 결정장애가 있어, 믿을 수 있는 친구나 데이터 기반의 추천을 원함.

---

## 4. Key Feature Specifications

### A. Gourmet MBTI System (4-Axis)
사용자의 모든 미식 기록(Taste Profile 1~5점)을 평균내어 4가지 축으로 분석합니다.

| 축 (Axis) | Code | 의미 (Left vs Right) | 기준 |
| :--- | :--- | :--- | :--- |
| **1. Intensity** | **B** / **M** | **Bold(강렬)** vs **Mild(섬세)** | 전체 5대 맛 평균 점수 |
| **2. Main Note** | **S** / **Z** | **Sweet(달콤)** vs **Zesty(감칠맛/짠맛)** | 단맛 vs 짠맛 우위 비교 |
| **3. Body** | **R** / **L** | **Rich(묵직)** vs **Light(산뜻)** | 풍미 vs 산미 우위 비교 |
| **4. Kick** | **H** / **P** | **Hot(매콤)** vs **Pure(담백)** | 매운맛 임계점(2.5) 돌파 여부 |

*   **Output**: 16가지 유형 (예: `BZRH` - 도파민 사냥꾼)
*   **Nuance**: 점수 분산도에 따른 동적 설명 생성 (예: "단맛에는 관대하지만 짠맛에는 엄격함")

### B. Creation Flow (Manual Writing)
1.  **Photo Upload**: 다중 이미지 업로드, EXIF 데이터(날짜, GPS) 추출.
2.  **AI Vision Analysis (Gemini 2.5)**:
    *   `Place Name`: 간판/메뉴판 텍스트 인식 또는 분위기 기반 가상 이름 생성.
    *   `Menu`: 음식 종류 식별.
    *   `Area`: 지역 추론 (성수, 강남 등).
    *   `Keywords`: 분위기/식감 키워드 추천.
3.  **Taste Evaluation**: 5가지 맛 슬라이더 (Weak - Balanced - Bold) 조절.
4.  **Detailed Evaluation**: 
    *   **The Palate (Menu)**: 식감(Texture), 향미(Flavor), 뉘앙스(Note) 전문 키워드 선택.
    *   **The Vibe (Venue)**: 분위기, 서비스 태그 선택.
5.  **Manual Writing**: 선택한 키워드를 프롬프트 삼아 사용자가 **직접** 테이스팅 노트를 작성. (명조체 적용)
6.  **Ranking (Binary Search)**: '좋아요' 선택 시 기존 맛집과 1:1 토너먼트 대결로 정확한 순위 산정.

### C. Gamification & Badge
*   **Level System**: 기록 수(XP)에 따른 레벨업 및 Circular Progress UI.
*   **Badges**: 특정 조건 달성 시 해금 (예: 맵부심 - 매운맛 3점 이상 3회).
*   **Restaurant Master**: 특정 POI 최다 방문자에게 'Crown' 부여 및 경쟁 유도.

### D. Social Feed & Discover
*   **Feed**: 릴스/앨범 스타일의 몰입형 UI (대형 이미지 + 최소한의 텍스트).
*   **Taste Match**: 친구 프로필 방문 시 유클리드 거리 기반 입맛 일치도(%) 계산 및 시각화.
*   **Recommendation Engine**:
    *   *Personalized*: 내 Taste DNA와 유사한 식당.
    *   *Social*: 내 친구들이 방문한 곳.
    *   *Challenge*: 내가 평소에 먹지 않는 카테고리 제안.

### E. My Lists & Map
*   **Auto Collections**: Top 20, 카테고리별, 태그별 폴더 자동 생성.
*   **Relative Map View**: API 키 없이도 작동하는 좌표 기반 상대적 위치 시각화 (목업 데이터 활용 시).

---

## 5. Data Structure (TypeScript Interfaces)

### ReviewRecord
핵심 데이터 단위.
```typescript
interface ReviewRecord {
  id: string;
  title: string;      // 식당명
  category: string;   // 한식, 일식 등
  preference: '좋아요' | '보통' | '별로';
  tasteProfile: {     // 1~5점
    spiciness: number;
    sweetness: number;
    ...
  };
  detailedEvaluation: {
      venue: { atmosphere: string[], service: string[] };
      menu: { texture: string[], flavor: string[], note: string[] };
  };
  reviewText: string; // 사용자 직접 작성 리뷰
  rank?: number;      // 개인 랭킹
  location?: { lat, lng, address };
  // ...
}
```

---

## 6. UX/UI Guidelines
*   **Theme**: Premium Dark (Cards) + Warm White (Background). 미식의 깊이감을 주는 블랙/오렌지 포인트.
*   **Typography**:
    *   UI 요소: Sans-serif (Inter/Pretendard) - 가독성.
    *   **테이스팅 노트 본문**: **Serif (명조)** - 감성, 진지함, 잡지 느낌.
*   **Interaction**:
    *   하단 탭바 (Bottom Tab): Liquid Glass (Floating Pill).
    *   플로팅 버튼 (FAB): 기록하기 접근성 강화.

---

## 7. Future Roadmap (v2.0)
*   **Real Map Integration**: Google Maps / Naver Maps API 연동.
*   **Backend**: Firebase/Supabase 연동을 통한 실시간 소셜 데이터 동기화.
*   **Import**: 인스타그램 스토리/피드 자동 가져오기.
