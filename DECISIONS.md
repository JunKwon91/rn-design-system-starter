# Architecture Decision Records (ADR)

각 결정은 **상황 / 선택 / 포기한 옵션 / 근거** 4개 슬롯으로 구성. 일부는 관련 블로그 글 링크 포함.

---

## ADR-01: Atomic Design 분기형 포기

- **상황**: 컴포넌트 디렉토리 구조 결정 시점. Atomic Design (atoms / molecules / organisms / templates / pages)이 RN 디자인 시스템 표준 패턴으로 자주 인용됨.
- **선택**: 의미 기반 7 카테고리 분류 (`primitives / surface / action / input / display / list / feedback`).
- **포기한 옵션**: Atomic Design 5단계.
- **근거**: atoms vs molecules 경계가 컴포넌트 추가 때마다 모호해져 분류 회의가 반복 발생. 의미 기반 카테고리는 "이 컴포넌트가 무엇을 하는가"로 결정되어 경계가 안정적. 7개로 묶으면 20개 컴포넌트가 카테고리당 1~5개로 균등 분포.

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

---

## ADR-14: Checkbox/Radio API (value + onValueChange) + RadioGroup Context

- **상황**: 신규 Checkbox·Radio 컴포넌트 API 명명. `checked`/`onChange` (HTML 스타일) vs `value`/`onValueChange` (RN core Switch 스타일) 중 선택.
- **선택**: **`value` + `onValueChange`** (RN Switch와 동일 페어). Radio는 `<RadioGroup value onValueChange>` 컨테이너 + 자식 `<Radio value="...">` 패턴. 그룹은 React Context로 자식에 상태·핸들러 주입.
- **포기한 옵션**: `checked`/`onChange` (HTML 스타일), `selected`/`onSelectChange`, ref imperative API, Radio 단독 사용 (RadioGroup 없이 individual onChange).
- **근거**: RN core `<Switch value onValueChange>`와 의미·이름 정합 → 학습 비용 0. Radio는 그룹 단위 의미가 본질이라 RadioGroup 컨테이너 강제 (단독 사용 시 `useRadioGroup()` 훅이 에러) → 그룹 외부 단일 Radio라는 안티패턴 차단 + 접근성 `radiogroup` role 자동 부여. Context 전달은 자식 prop drilling 없이 그룹 내 단일 선택 보장.

---

## ADR-15: `color/border/control` 신규 토큰 추가

- **상황**: Checkbox/Radio enabled border가 기존 `color/border/default` 사용 시 surface/container 배경 위 WCAG 대비 Light 1.48 / Dark 1.76 ✗ (UI 컴포넌트 기준 3.0 미달). 의도된 옅음이 아닌 식별 불가 수준.
- **선택**: **신규 토큰 `color/border/control`** 추가. Light `#757680` (slate-450) / Dark `#9CA0AD` (slateDark-450). 대비 Light 4.51 / Dark 6.25 → UI 3.0 + 일반 텍스트 4.5 모두 충족. Checkbox/Radio 18 variants의 stroke만 신규 토큰으로 바인딩.
- **포기한 옵션**: `border/default` 토큰 자체 색 변경 (Divider 3-tier 구조 영향 21건), `border/strong` 재사용 (액션 컨트롤 강조 의도와 충돌), Checkbox만 색 조정 (Radio도 동일 문제).
- **근거**: 다른 컴포넌트(Input/SearchInput/Card/SegmentedControl은 의도된 옅은 outline) 미영향. 토큰 추가는 1개로 최소화. Material 3 / Polaris도 interactive control과 informational border를 분리하는 별도 토큰을 두는 패턴. Figma `color/border/control` (VariableID 2079:2)과 1:1 정합.

---

## ADR-16: `color/border/strong` Light 색 조정 (slate-400 → slate-500)

- **상황**: Button Secondary outline + Divider strong tier + Dialog action에 사용 중인 `color/border/strong` Light 색이 surface/container 배경 위 대비 2.56으로 UI 3.0 미달. Dark `#8C909F`는 5.13 양호.
- **선택**: Light 색만 `primitives.slate[400] #94A3B8` → `primitives.slate[500] #64748B` 교체. 대비 2.56 → **4.76** ✓.
- **포기한 옵션**: Button만 별도 토큰 (사용처 분기 증가), Light/Dark 둘 다 변경 (Dark는 이미 양호), `border/strong`을 `border/control`로 통합 (3-tier 구조에서 strong과 control은 의미가 다름 — strong=강조 outline, control=interactive 컨트롤).
- **근거**: Divider 3-tier(subtle/default/strong) 톤 격차가 자연스럽게 확대 (default `#CBD5E1` → strong `#64748B`). Tailwind slate-500은 이미 `text/muted` Light와 동일 — 같은 raw 색을 두 의미(muted 텍스트 + strong 보더)로 재사용해도 의미 충돌 없음. 영향 11건 (Button 6 / Divider 2 / Dialog 3) 모두 의도된 강조 강화.

---

## ADR-17: Switch — Material 3 filled track + thumb 사이즈 변화

- **상황**: Switch 컴포넌트 신규 추가. M3 표준 outlined track / iOS-style filled track / RN Switch wrap 중 선택. 라이브러리 디자인 분석 결과 22 컴포넌트 중 M3 우세(13/22), input 카테고리는 100% M3.
- **선택**: **M3 filled track 변형** — SettingsRow의 iOS filled track 시각 패턴 + M3 thumb 사이즈 변화 시그니처 결합. track off `border/default` filled / on `primary/action` filled. thumb 정원 흰색 (`primary/onAction`), off→on 시 사이즈 + 위치 동시 변화 (sm 14→16, md 20→24, lg 24→28). 200ms Animated transition (RN core `Animated`, useNativeDriver false).
- **포기한 옵션**: M3 표준 outlined track (off 트랙 보더만 + 작은 보더 thumb), RN Switch wrap (플랫폼별 시각 다름 — iOS·Android 일관성 깨짐), Reanimated 도입 (의존성 추가 대비 효과 미미 — 200ms 단순 transition에 core Animated로 충분).
- **근거**: outlined track은 라이브러리 surface/container wrapper 위에서 가독성 약함(border/control 대비 4.51이지만 시각 인지력 부족) — 사용자 시각 검증 후 filled로 재설계. SettingsRow inline toggle도 동일 사양(`<Switch size="md" />`)으로 교체해 라이브러리 단일 진실 확보. Reanimated 미설치 상태에서 core Animated로 충분히 부드러운 transition 가능.

---

## ADR-18: SegmentedControl — M3 Segmented Button 정합

- **상황**: 라이브러리에서 유일하게 iOS HIG 시그니처를 남기던 컴포넌트 (외곽 pillbox + 내부 pillbox active fill — iOS Segmented Control 표준). M3 우세(13/22)인 라이브러리 디자인 언어와 불일치.
- **선택**: **M3 Segmented Button 패턴 (옵션 B)** — 외곽 cornerRadius height/2 (pillbox, fully rounded), padding 0, background transparent, border 1.5px `border/strong`, `overflow: hidden`으로 segments 자동 clip. 각 segment cornerRadius 0 (외곽이 clip 처리), active fill `primary/action` 유지, inactive transparent 유지.
- **포기한 옵션**: M3 Filter Chip 그룹 (외곽 묶음 컨테이너 의미 손실), 현재 iOS 유지(M3 정합 안 됨), 외곽 fill 유지하면서 미세 조정만(M3 시그니처 약함).
- **근거**: active 패턴(primary.action filled)은 그대로 유지해 Button/Switch와 일관성 보존. 외곽 stroke + pillbox로 M3 시그니처 명확화 (Button Secondary가 사용하는 `border/strong`과 동일 토큰). API 변경 없음 — `segments`/`value`/`onChange` 그대로. 사용처 INSTANCE 0건 확인 — 영향 격리.

---

## ADR-19: `color/border/default` scope 확장 (STROKE → STROKE + FRAME_FILL + SHAPE_FILL)

- **상황**: Switch off track + SettingsRow off track에 사용할 mid-tone gray 필요. 색은 `border/default`와 동일(Light #CBD5E1 / Dark #424754)이지만 scope가 `STROKE_COLOR`로 제한되어 Fill 패널에서 선택 불가.
- **선택**: **`border/default` scope 확장** — `['STROKE_COLOR', 'FRAME_FILL', 'SHAPE_FILL']`. 단일 색을 border 용도 + Switch off track 용도 양쪽에서 재사용. 토큰 추가 없음.
- **포기한 옵션**: 신규 토큰 `color/surface/inactive` 또는 `color/track/off` 추가 (색은 동일한데 별도 토큰 — 토큰 폭발), `ALL_SCOPES` 사용 (anti-pattern, 의도 외 사용 가능성 높음).
- **근거**: ADR-15에서 새 `border/control` 토큰을 도입한 것과 대조적으로, default border 색은 의미가 명확한 mid-gray로 inactive surface와 자연스럽게 호환. 색이 동일한데 토큰만 분리하면 향후 색 변경 시 두 곳을 같이 바꿔야 하는 번거로움 발생. scope 확장은 의미를 약간 넓히지만 raw 색 통일을 우선.

---

## ADR-20: SettingsRow toggle을 신규 `Switch` 컴포넌트 인스턴스로 교체

- **상황**: SettingsRow.tsx 내부에 `ToggleTrack` / `ToggleHandle` styled-components가 인라인으로 정의돼 있었고, 새 `Switch` 컴포넌트 신규 추가 후 같은 시각 패턴이 두 곳에서 중복 정의됨.
- **선택**: **SettingsRow의 내장 `Toggle` 함수와 `ToggleTrack`/`ToggleHandle` styled 정의 제거**, `kind: 'toggle'` 분기에서 `<Switch size="md" value onValueChange />` 인스턴스 렌더. `onChange` 콜백을 `onValueChange`로 그대로 전달.
- **포기한 옵션**: 내장 toggle 코드 유지 + 시각만 새 Switch 사양으로 변경 (코드 중복), Switch에 `presentation: 'inline'` 같은 prop 추가 (Switch API 복잡화).
- **근거**: 시각 사양이 동일한 컴포넌트를 두 곳에서 정의하면 향후 변경(예: 애니메이션 추가, 토큰 변경) 시 두 곳 동기화 부담. Switch 컴포넌트가 단일 진실(single source of truth) — SettingsRow는 그 인스턴스를 호출만 함. accessibilityRole `'switch'`는 Row level에서 이미 부여하고 있어 중첩되지만 RN의 accessibility는 부모 노드 우선이라 문제 없음.

---

## ADR-21: Badge — 3 types × 2 sizes × 4 colors + 99+ 자동 처리

- **상황**: Badge 신규 추가. 단일 type vs 다중 type, 텍스트 길이 처리 방식 결정.
- **선택**: **3 type 분리** (dot/count/label) — 각 type이 의미적으로 다른 사용 케이스. **2 sizes** (sm/md). **4 colors** (primary/destructive/success/warning). count는 `value > 99 → "99+"` 자동 처리. dot은 텍스트 없음(정원), count는 정원 + min-width로 1자리/2자리 모두 정원형 유지, label은 pill(height/2) + paddingHorizontal로 width hug.
- **포기한 옵션**: 단일 Badge (`variant` prop 없이 props로 분기 — API 모호), 자유 텍스트 길이 (count=120 그대로 표시 시 정원 깨짐 + 시각 비대칭), color 7개(state.info 포함 — info Badge는 의미상 primary와 중복).
- **근거**: dot/count/label 3 type은 시각·의미·layout이 모두 달라 단일 type 분기가 어색(Material 3도 small/large badge 분리). 99+ 패턴은 모바일 알림 UX의 사실상 표준(Material 3·iOS HIG 공통). 4 colors는 라이브러리 `primary/error/success/warning` 토큰과 1:1 정합. 위치는 display 카테고리 — 상태 표시이지 액션 트리거가 아니므로.

---

## ADR-22: FAB — 4 variants 정원형, 1 color, M3 + 모바일 RN 패턴

- **상황**: FAB(Floating Action Button) 신규 추가. M3 표준 둥근 사각형 vs 모바일 RN 정원형, color variant 수 결정.
- **선택**: **4 variants** (small 40 / default 56 / large 96 / extended) **× primary 단일 color**. 모든 variant `cornerRadius = height/2` (정원형 / extended는 pill). M3 Elevation 3 dual-shadow(iOS shadowColor + Android elevation 6). 아이콘은 `cloneElement`로 size·color 자동 주입(IconButton 패턴 일관).
- **포기한 옵션**: M3 표준 둥근 사각형(default cornerRadius 16) — 시각 인지 모호(IconButton과 혼동), 2 colors(primary + secondary) — secondary FAB 사용 빈도 낮음 + surface fill이 라이브러리 wrapper 위 가독성 약함, color/icon 별도 prop — IconButton과 일관성 부족.
- **근거**: react-native-paper FAB가 정원형(M3 적용 + 모바일 RN 사용자 익숙)이고 본인 사이클 시각 검증에서 정원형이 인지 명확. extended pill 모양도 정원 연장(height/2)으로 시각 일관. 1 color는 FAB의 본질("primary action 강조 buton") 정합 — secondary는 일반 Button으로 대체 가능. action 카테고리 — 액션 트리거 컴포넌트이므로.

---

## ADR-23: Skeleton API — discriminated props (rect/circle/text)

- **상황**: Skeleton placeholder 3 type 시연 필요. 단일 prop + 옵셔널(props 조합 추론) vs discriminated union vs compound 컴포넌트(Skeleton.Rect 등) 중 선택. 애니메이션 라이브러리도 같이 결정 — Reanimated 미설치 상태.
- **선택**: **discriminated union 타입** `SkeletonProps = { type: 'rect'; width; height } | { type: 'circle'; size } | { type: 'text'; lines?; lineWidths?; lineHeight? }`. **RN core `Animated.Value` + `Animated.loop`** 사용 (의존성 0 추가). backgroundColor interpolation으로 `surface/containerHigh` ↔ `border/default` 750ms × 2 (1.5s cycle) 무한 반복.

> **shimmer 토큰 결정 변경 이력**: 초기 Figma 사양은 `surface/containerHigh` ↔ `surface/container` (대비 Light 1.06 / Dark 1.13)였으나, 시뮬레이터 검증에서 두 surface 토큰 명도 차이가 너무 작아 placeholder 인지 불가. 사용자 결정으로 highlight 끝점을 `border/default`로 변경 (대비 Light ~1.41 / Dark ~1.5 — 인지 가능 수준). Figma Skeleton 페이지(23 placeholder 노드)도 같은 토큰으로 갱신해 코드↔Figma 1:1 정합 유지. 토큰 차원 이슈로 **v1.x 후순위 항목 추가** — surface 토큰 계층(container-lowest/low/base/high/highest 5단) 명도 재설계 검토 (현재 인접 단계 대비 1.06~1.13으로 시각 인지에 부족).
- **포기한 옵션**: 단일 prop + 옵셔널 (type 없이 props 조합으로 분기 — 타입 안전성 부족), compound `Skeleton.Rect`/`Skeleton.Circle` (사이클 1 Badge `type` prop 패턴과 불일치), Reanimated 도입(미설치 + sysclock 1.5s 단순 transition에 core Animated 충분), translateX shimmer + LinearGradient(linear-gradient 미설치).
- **근거**: Badge `type='dot'\|'count'\|'label'` + value 패턴 정합 — 라이브러리 내 type-discriminated API 일관. discriminated union으로 IDE 자동 완성·런타임 안전성 확보. RN core Animated는 Switch 사이클(ADR-17)에서 동일 패턴 검증 완료 — 의존성 추가 0 원칙 유지(사이클 1·2 누적 신규 토큰 0 + 신규 의존성 0).

---

## ADR-24: Chip 4 variant + lucide-react-native 표준 점유율

- **상황**: Material 3 Chip 4 variant(Filter/Assist/Input/Suggestion) 시각 차별화 + 아이콘 점유율 결정. compound vs 단일 컴포넌트 + variant prop, 100% / 75% 통일 점유율 vs lucide 비대칭 점유율 중 선택.
- **선택**: **단일 컴포넌트 + variant prop** (`<Chip variant='filter'\|... />`). **lucide-react-native 표준 비대칭 점유율** 그대로 채택 — Check 67/46%, Plus 58%, Star 67/83%, X 50% (viewBox 24 기준). RN 코드에서 `lucide-react-native`의 `<Check>` `<Plus>` `<Star>` `<X>` 컴포넌트 import → Figma도 동일 lucide path scaled로 작성 → **Figma↔코드 1:1 자동 정합** (Switch 사이클 81/81 정합 패턴 재현). variant별 시각: Filter outlined(selected 시 filled primary), Assist outlined + 좌측 icon, Input filled + 좌측 icon + close X, Suggestion outlined + text/muted 옅음.
- **포기한 옵션**: compound `Chip.Filter`/`Chip.Assist` (Badge/FAB type prop 패턴과 불일치), 75% 단일 점유율(Check가 selected 의미 강조에 약함 + 모든 아이콘 단조), 100% 점유율(visible 영역 과대 + 의미적 시각 무게 차이 사라짐), 자체 path 작성(lucide 표준 일관성 손실).
- **근거**: lucide 비대칭 점유율은 아이콘 의미적 무게(Check selected 보조 < Star 콘텐츠 > X close 보조)와 일관 — Material Symbols + lucide 표준이 이미 가이드라인 검증. Figma 정합 — 사이클 2 Figma 작업에서 frame-wrap 패턴으로 점유율 정합(각 아이콘 vector frame 14/16 size + inner vector lucide path scaled + 중앙 정렬) → RN 코드의 lucide import와 visual 1:1 정합. **신규 토큰 0 추가** (Badge/FAB 패턴 유지) — `border/control`(ADR-15 추가) + `surface/containerHigh` + `text/secondary` + `text/muted` + `primary/action` + `primary/onAction` 모두 기존 토큰 재사용.

---

## ADR-25: 인터랙티브 컴포넌트 onPress 동작 검증 체크리스트 (9항목)

- **상황**: 사이클 1·2 누적 학습 — 시각 사양만 정합 검증하다 onPress/onChange 콜백 동작 검증이 누락되는 사례 반복. 사이클 2 후반 보고-실제 불일치 4건(Skeleton CS 의도 / Input X 6·7 / Star→X 렌더링 / RN 시각 검증 누락) + SettingsRow toggle 흐름 검증 누락 + Button destructive `#FFFFFF` 하드코딩 발견 + Skeleton shimmer 토큰 갱신 시 Figma 미동기화 발견 등이 누적되어, 신규 컴포넌트 검증 절차를 단일 체크리스트로 명문화 필요. v1.x 사이클 2 정합 검증 단계에서 7항목 → 9항목으로 확장 (정합 카운트 명시 + 인라인 스타일 분류 A=0건 추가).
- **선택**: **9항목 체크리스트** — (1) **Figma 측정 → RN 1:1 정합** — width/height/paddingH/cornerRadius/font-size/icon size 모두 px 단위 일치. (2) **Light/Dark 양 모드 시각 검증** — 토큰 매핑이 두 모드 모두 의도대로 작동(`text.primary`/`surface.containerHigh`/`primary.onAction` 등 mode-aware swap 확인). (3) **accessibility 속성** — `accessibilityRole`/`accessibilityState`/`accessibilityLabel` 누락 없음(특히 IconButton·FAB·Chip 등 텍스트 단독으로 의미 전달 어려운 컴포넌트). (4) **상태별 시각 차이** — default/pressed(opacity 0.7)/disabled(opacity 0.4~0.5)/selected/loading 각 상태가 시각 토큰으로 명확히 구별. (5) **onPress/onChange/onValueChange 콜백 시뮬레이터 검증** — 시각 변화가 있는 컴포넌트(Tabs/SegmentedControl/Switch 등)는 선택 텍스트 표시로 검증, 시각 변화가 없는 컴포넌트(Button/IconButton/FAB/EmptyState action 등)는 `Alert.alert` 시연 패턴으로 검증. disabled 인스턴스도 동일 콜백 연결 후 탭 시 Alert 안 떠야 정상. (6) **M3 48×48 터치 영역 충족** — sm 사이즈(24×24·28×28 등)는 `hitSlop` 적용 필수(IconButton sm: hitSlop 12 → 48×48). (7) **보고 기준** — "본인 직접 확인 완료" 표기 + 측정값/코드 라인 인용으로 검증 근거 명시. (8) **Figma↔RN 측정값 N/N 정합 카운트 명시 보고** — 컴포넌트 추가·변경 시 측정값 1:1 비교 표 작성 + 정합 카운트 명시(사이클 1 Switch 81/81 / 사이클 2 Chip 38/38 / Button 18/18 / Skeleton 16/16 패턴). 의도된 정정은 별도 표기(예: "53/54, 의도 정정 1건 — 사용자 결정으로 토큰 변경"). (9) **인라인 스타일 분류 A = 0건 확인** — `grep -rn "style={{" src/`로 전수 조사 후 분류: A(하드코딩 색상/토큰 우회 — 정정 필요), B(Animated 동적 / Pressable callback / 토큰 사용 — 유지), C(갤러리 시연 layout — 토큰 사용 유지), D(주석 false positive). 분류 A는 사이클 종료 전 반드시 0건 도달 — `#FFFFFF` 등 하드코딩 색상은 라이브러리 토큰으로 정정, 토큰 우회 spacing/margin은 `theme.spacing.*` 또는 styled로 분리.
- **포기한 옵션**: 시각 사양 검증만 유지(흐름·동작 검증 미수행 — 사이클 2 첫 사용자 발견 누락 패턴), 컴포넌트별 개별 체크리스트(관리 부담 + 공통 항목 중복), 자동화 테스트 도입(`@testing-library/react-native` 의존성 추가 + v1.x 스타터 범위 초과 — 의존성 0 추가 원칙 위반), 보고 시 검증 근거 자유 형식(불일치 누적 차단 실패), 정합 카운트 비명시(사이클 1 Badge/FAB 종료 시 N/N 명시 누락 → 사이클 2 재검증에서 패턴 누락 학습), 인라인 스타일 미관리(라이브러리 품질 저하 — 토큰 시스템 우회가 보이지 않는 곳에서 누적).
- **근거**: 사이클 2 후반 누적 실수가 모두 "수치 일치 검증"으로는 잡히지 않고 "흐름·렌더링 검증"이 필요한 케이스 — 단일 체크리스트로 통합 관리. Alert.alert 시연은 의존성 추가 없이 onPress 호출 동작을 즉시 확인 — RN core API 사용 + 갤러리 화면 내 인라인 검증 가능. hitSlop은 시각 영역과 별개로 터치 영역만 확장하므로 M3 권장 영역(48×48) 보장이 시각 사양에 영향을 주지 않음. "본인 직접 확인" 표기는 보고-실제 불일치 차단의 marker — 측정값/라인 인용 강제로 추측 보고 방지. 정합 카운트 명시(8번)는 Switch 81/81 패턴을 재현 가능한 의무 보고 형식으로 승격 — 정합 불일치 발견 시 해당 카운트의 어느 항목이 어긋났는지 즉시 식별. 인라인 스타일 분류(9번)는 토큰 시스템이 우회되는 단일 지점을 정기 점검 — 사이클 2에서 Button `'#FFFFFF'` 2건 + Dialog `marginTop: 4` 1건 발견 후 학습. 신규 의존성 0 추가 원칙(사이클 1·2 누적) 유지 — 자동화 도입은 v2.x 이후 검토.
