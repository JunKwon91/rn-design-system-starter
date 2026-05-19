# Architecture Decision Records (ADR)

각 결정은 **상황 / 선택 / 포기한 옵션 / 근거** 4개 슬롯으로 구성. 일부는 관련 블로그 글 링크 포함.

---

## ADR-01: Atomic Design 분기형 포기

- **상황**: 컴포넌트 디렉토리 구조 결정 시점. Atomic Design (atoms / molecules / organisms / templates / pages)이 RN 디자인 시스템 표준 패턴으로 자주 인용됨.
- **선택**: 의미 기반 7 카테고리 분류 (`primitives / surface / action / input / display / list / feedback`).
- **포기한 옵션**: Atomic Design 5단계.
- **근거**: atoms vs molecules 경계가 컴포넌트 추가 때마다 모호해져 분류 회의가 반복 발생. 의미 기반 카테고리는 "이 컴포넌트가 무엇을 하는가"로 결정되어 경계가 안정적. 7개로 묶으면 20개 컴포넌트가 카테고리당 1~5개로 균등 분포.
- **블로그**: <https://twinspika.tistory.com/45>

---

## ADR-02: styled-components/native 채택

- **상황**: 스타일링 방식 선택. RN에는 StyleSheet, Tailwind RN(nativewind), styled-components, emotion 등 다수 옵션.
- **선택**: `styled-components/native` 6.4 + `DefaultTheme` module augmentation.
- **포기한 옵션**: StyleSheet (RN 기본), NativeWind (Tailwind 문법).
- **근거**: theme provider로 라이트/다크 색상 토큰 주입이 자연스러움. CSS-in-JS의 template literal로 토큰 직접 바인딩 (`${({ theme }) => theme.colors.x}`). `$prop` transient props로 variant 처리가 깔끔. StyleSheet는 동적 토큰 바인딩에 inline style 의존도가 높아짐.

---

## ADR-03: Zustand 기반 전역 Toast/Dialog

- **상황**: Toast·Dialog는 화면 여러 곳에서 호출되며 결과 반환이 필요(Dialog). React Context로 처리하면 매번 Provider depth 증가.
- **선택**: Zustand store (`useToastStore`, `useDialogStore`) + 호스트 컴포넌트 (`<ToastHost />`, `<DialogHost />`) 패턴.
- **포기한 옵션**: React Context Provider, ref forwarding 패턴.
- **근거**: Zustand는 hook 외 `getState()`로 React tree 밖에서도 호출 가능 → `toast.success(...)` / `await dialog.confirm(...)` 같은 일반 함수형 API 가능. 호스트는 App 루트 1회만 마운트, 큐 처리·애니메이션·키보드 대응을 단일 위치에서 관리.

---

## ADR-04: Light/Dark mode swap 100%

- **상황**: 토큰을 라이트만 정의하고 다크는 부분 override? 아니면 두 모드 모두 풀 정의?
- **선택**: `lightColors` / `darkColors` 두 객체 모두 `ColorsShape` 인터페이스 100% 만족.
- **포기한 옵션**: 다크 모드 부분 override (`{ ...lightColors, text: { ... } }`).
- **근거**: 부분 override는 시간이 지나며 새 토큰 추가 시 다크 매핑 누락 위험. TypeScript 인터페이스로 두 객체 키 동일성을 컴파일타임 강제 → 신규 토큰 추가 시 두 모드 모두 정의 안 하면 빌드 실패.

---

## ADR-05: 2-tier 색상 토큰 구조 (primitives + semantic)

- **상황**: 색상 토큰 계층 깊이. 단일 평면 vs 다단 계층.
- **선택**: 2단계 — `primitives` (raw hex: `blue/600 #3B82F6`) → `semantic` (역할 명명: `color/primary/action`, mode-aware alias).
- **포기한 옵션**: 1단계 (semantic만), 3단계+ (primitives → component → semantic).
- **근거**: 컴포넌트는 항상 semantic 토큰만 참조 → 디자이너가 같은 의미를 다른 raw 색상으로 교체해도 컴포넌트 코드 변경 없음. 3단계 이상은 추적 부담 대비 이득 미미. Material 3, Polaris 등 메이저 디자인 시스템도 2~3단 패턴.

---

## ADR-06: Manrope + Inter 폰트 페어링

- **상황**: 타이포그래피 폰트 선택. 단일 폰트 vs 페어링.
- **선택**: 제목·숫자에 **Manrope** (display/headline/numericMd), 본문·라벨에 **Inter** (body/label).
- **포기한 옵션**: 단일 폰트 (Inter only / SF Pro only).
- **근거**: Manrope는 geometric sans로 큰 사이즈에서 visual weight가 강함 → 제목·수치 강조에 적합. Inter는 본문 가독성·다국어(한글) 지원이 우수. 두 폰트 모두 OFL 라이선스라 라이브러리 배포 자유로움.

---

## ADR-07: Path alias `@/*` 채택

- **상황**: 깊은 디렉토리에서 상대 경로 import (`../../../components/...`) 가독성 저하.
- **선택**: `@/*` → `src/*` 매핑. `babel-plugin-module-resolver` (런타임) + `tsconfig.paths` (컴파일타임) 양쪽 정합.
- **포기한 옵션**: 상대 경로 유지, 별도 `~`/`#` 접두어.
- **근거**: `@`는 RN/Next.js 커뮤니티 사실상 표준. babel/tsc 양쪽 설정 정합으로 IDE auto-import + 런타임 모두 정상 작동.

---

## ADR-08: Figma Variable Library 1:1 정합

- **상황**: 코드 토큰과 Figma 토큰 동기화 방식.
- **선택**: Figma Variables (Color/Spacing/Radius/Typography 4 컬렉션)와 코드 토큰 이름·값·모드 1:1 정합. 코드 우선 정책 (코드 변경 시 Figma 변수 수동 업데이트).
- **포기한 옵션**: Figma → 코드 자동 생성 (`figma-tokens`, `style-dictionary`), Figma 변수 미사용 (raw 색상 직접 사용).
- **근거**: 자동 생성은 RN 0.85 + styled-components 환경에서 구성 비용 큼. 수동 정합은 토큰 추가가 잦지 않은 starter 단계에서 충분히 관리 가능. 코드 우선이라 변수 부재 시 Figma에 신규 변수를 추가하는 흐름.

---

## ADR-09: SettingsScreen 갤러리 → Drill-down 메뉴 구조

- **상황**: 20 컴포넌트 갤러리를 단일 스크롤 화면(SettingsScreen)에 모았더니 1000줄 초과. 카테고리 탐색·시각 회귀 검증이 어려움.
- **선택**: `GalleryHomeScreen` (카테고리 메뉴) + 7개 카테고리 화면 (Primitives/Surface/Action/Input/Display/List/Feedback) — Native Stack drill-down.
- **포기한 옵션**: 단일 스크롤 갤러리 유지, Bottom Tab 7개.
- **근거**: 카테고리당 한 화면이라 시각 검증 범위가 명확. 메뉴 카드는 React Navigation `navigate(route)`로 단순. Bottom Tab은 시각 영역을 항상 차지해 컴포넌트 크기 비교에 방해.

---

## ADR-10: 20개 컴포넌트 카테고리 분류

- **상황**: ADR-01의 7 카테고리를 구체화하며 컴포넌트별 소속 결정.
- **선택**: primitives(3) · surface(3) · action(2) · input(2) · **display(3: DataTable, SegmentedControl, Tabs)** · list(1) · feedback(5) = **20개**.
- **포기한 옵션**: feedback을 overlay/inline으로 추가 분할, list를 surface 흡수, Tabs를 navigation 카테고리로 분리.
- **근거**: 카테고리당 1~5개로 균등 분포. feedback이 5개로 가장 많지만 모두 "사용자에게 상태/결과를 알림" 의미가 일관. list는 SettingsRow 하나지만 향후 ListItem/SwipeableRow 등 확장 여지 위해 분리 유지. v1.0.0 갤러리 UX 개선 과정에서 Tabs 컴포넌트가 추가되었다 — LottoStats Figma에 Material 3 underline tabs 스타일로 디자인 후 정식 라이브러리 컴포넌트로 승격, SegmentedControl과 동일한 display 카테고리에 편입(둘 다 가로 선택 컨트롤 의미 공유, 분할/확장 방식만 다름).

---

## ADR-11: Toast 큐잉 패턴 (displayed 1개 + queue max 3)

- **상황**: 짧은 시간에 여러 Toast 호출 시 동작. 동시 다중 표시 vs 순차 표시.
- **선택**: 한 번에 1개만 화면 표시 (`displayed`), 나머지는 큐(최대 3개) 대기. 큐 초과 시 가장 오래된 항목 제거 (FIFO overflow).
- **포기한 옵션**: 다중 동시 표시 (stack), 무제한 큐.
- **근거**: 모바일 화면 폭에서 다중 Toast는 시각 혼란. 큐 무제한은 사용자가 의도하지 않은 알림 누적. 3개 상한은 일반적 UX 패턴 (Material 3 권장).

---

## ADR-12: Dialog Promise 기반 결과 반환

- **상황**: Dialog 사용자 선택 결과 전달. callback prop vs Promise.
- **선택**: `dialog.confirm()` → `Promise<boolean>`, `dialog.prompt()` → `Promise<string | null>`, `dialog.info()` → `Promise<void>`.
- **포기한 옵션**: onConfirm/onCancel callback props, ref imperative API.
- **근거**: `await dialog.confirm(...)`이 호출 사이트에서 자연스러운 흐름 (분기·후속 작업이 같은 함수 안에 정리). callback은 흐름이 분리되어 가독성 저하. resolver Map을 store에 보관해 큐잉과 결과 반환을 통합 처리.

---

## ADR-13: react-native-edge-to-edge 도입

- **상황**: Android 15 (compileSdk/targetSdk 36)에서 edge-to-edge가 강제됨. native-stack 헤더 자체 status bar padding과 SafeAreaProvider top inset이 이중 적용되어 헤더 위 80~100px 공백 발생.
- **선택**: `react-native-edge-to-edge` 1.8 패키지 도입. App 루트에서 RN `<StatusBar>` 대신 `<SystemBars />` 사용.
- **포기한 옵션**: native-stack `statusBarTranslucent`/`statusBarStyle` 옵션 (iOS Info.plist의 `UIViewControllerBasedStatusBarAppearance=YES` 변경 요구), `headerStatusBarHeight: 0` (native-stack 7.x 타입 부재), `styles.xml`의 `windowOptOutEdgeToEdgeEnforcement` (부분 효과 + Native 설정 변경).
- **근거**: 패키지가 Android 15 edge-to-edge를 정합 관리하면서 iOS에서는 RN StatusBar API로 fallback → Info.plist 변경 불필요. 라이브러리 portability 유지 (sturt fork 사용자가 Native 설정 추가 작업 없음). bottom navigation bar 영역은 각 화면의 `<Screen edges={['bottom']}>` 으로 처리.
