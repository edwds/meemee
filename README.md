# meemee (미미) 🍽️

**meemee**는 단순한 맛집 리뷰를 넘어, 사용자의 미식 성향(Gourmet MBTI)을 분석하고 감각적인 테이스팅 노트를 기록하는 **미식 로그 애플리케이션**입니다.

![meemee App Preview](https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80)

## ✨ Key Features

### 1. 🪄 스마트 미식 기록 (Smart Gourmet Log)
- **AI 비전 분석**: 음식 사진만 올리면 AI(Gemini Vision)가 **메뉴명, 식당 이름, 지역, 카테고리, 추천 태그**를 자동으로 분석해 채워줍니다.
- **직접 쓰는 테이스팅 노트**: AI가 추천하는 미식 키워드(식감, 향미, 뉘앙스)를 참고하여, 나만의 감각적인 **미식 리포트**를 직접 작성합니다.
- **A/B 랭킹 시스템**: 기존의 '좋아요' 기록들과 1:1 대결(토너먼트)을 통해 나의 진정한 맛집 랭킹을 산정합니다.

### 2. 🧬 미식 MBTI (Gourmet Type Indicator)
- **16가지 미식 유형**: 사용자의 입맛을 4가지 축(**강도, 주조, 바디, 킥**)으로 분석하여 `BZRH(도파민 사냥꾼)`, `MSLP(햇살 가득 브런치)` 등 16가지 페르소나를 부여합니다.
- **Taste DNA**: 나의 입맛 분포를 직관적인 컬러 그래프로 시각화합니다.
- **Nuance Analysis**: 단순 유형을 넘어, "단맛에는 관대하지만 짠맛에는 엄격한" 구체적인 뉘앙스까지 분석합니다.

### 3. 🏆 게이미피케이션 (Gamification)
- **레벨 & 경험치**: 기록을 남길수록 레벨이 오르고(Gourmet Collector -> Explorer -> Master), 다양한 **뱃지**(맵부심, 디저트러버 등)를 획득할 수 있습니다.
- **식당 마스터(POI Master)**: 특정 식당을 가장 많이 방문한 유저는 해당 구역의 '마스터' 왕관을 차지합니다. 친구들과 경쟁하세요!

### 4. 🤝 소셜 & 디스커버 (Social & Discover)
- **입맛 궁합(Taste Match)**: 친구 프로필 방문 시 나와의 입맛 일치도(%)를 분석해줍니다.
- **미식 피드**: 친구들의 기록을 앨범 스타일의 카드로 감상하고 좋아요를 누를 수 있습니다.
- **스마트 추천**: 내 입맛 데이터, 친구의 추천, 자주 가는 지역, 도전해볼 만한 카테고리 등 다각도로 맛집을 추천합니다.

### 5. 🗺️ 내 리스트 & 지도 (My Lists & Map)
- **자동 컬렉션**: 기록이 쌓이면 '명예의 전당(Top 20)', '한식', '데이트 맛집' 등의 리스트가 자동으로 생성됩니다.
- **지도 뷰**: 리스트 내의 식당들을 지도상에서 한눈에 확인하고 이미지를 공유할 수 있습니다.

---

## 🛠️ Tech Stack

- **Framework**: React 19, Vite
- **Language**: TypeScript
- **AI Model**: Google Gemini 2.5 Flash (@google/genai)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Routing**: React Router DOM
- **Utilities**: html2canvas (이미지 공유), exif-js (GPS/날짜 추출)

---

## 🚀 Getting Started

### 1. Installation

```bash
npm install
```

### 2. Environment Setup

Gemini API 키가 필요합니다. (현재는 데모용 키 또는 클라이언트 직접 입력 방식이 아닌, 코드 내 주입 혹은 환경 변수 설정이 필요합니다.)

```bash
# .env 파일을 생성하거나 실행 컨텍스트에 API_KEY를 주입하세요.
export API_KEY="your_google_gemini_api_key"
```

### 3. Run Development Server

```bash
npm run dev
```

---

## 📂 Project Structure

```
/src
  /components    # Layout, Button, BottomTabBar 등 공통 UI
  /data          # 더미 데이터 (Discover, User, Restaurant)
  /pages         # Home, CreateRecord, Feed, Discover, Achievement 등
  /services      # Google Gemini API 연동 로직
  /utils         # Gamification, MBTI 계산 로직
  App.tsx        # 라우팅 및 전역 상태 관리
  types.ts       # TypeScript 인터페이스 정의
```