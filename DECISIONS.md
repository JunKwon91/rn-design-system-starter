# Architecture Decision Records (ADR)

각 ADR은 상황(Context) / 선택(Decision) / 포기한 옵션(Considered Alternatives) / 근거(Rationale) / 결과(Consequences) 구조를 따른다.

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

> **modal 카테고리 신설 갱신**: ADR-33 결정으로 modal 카테고리 신설. feedback에서 Toast/Dialog/BottomSheet 3개를 modal 카테고리로 이동. 갱신 후 분포: primitives(3) · surface(3) · action(3) · input(6) · display(5) · list(1) · feedback(6) · **modal(3)** = **30개**, 8 카테고리. feedback 잔존(EmptyState/ErrorView/LoadingView/Skeleton/Progress/Tooltip) — "사용자에게 상태/결과를 알림" 의미. modal 신설(Toast/Dialog/BottomSheet + 예정 Popup) — "화면 위에 떠 있는 인터페이스" 의미 + 전역 호스트 패턴 공통.

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

> **Reanimated 마이그레이션 갱신**: Reanimated v4로 마이그레이션 완료 (ADR-26). 초기 결정은 단순 transition 200ms에 RN core Animated로 충분했으나, BottomSheet 작업에 Reanimated가 사실상 필수가 되며 라이브러리 전체 일관성을 위해 Reanimated 마이그레이션 작업에서 전환. **측정값 81/81 정합 그대로 유지** (SIZE_SPEC, padOff/padOn, trackW-thumbOn-padOn 계산식 모두 동일). 200ms `Easing.inOut(Easing.ease)` 동일. 5 RN Animated.interpolate → 1 `useSharedValue` + 2 `useAnimatedStyle` (trackStyle / thumbStyle) 통합. Track styled-Animated 패턴은 `styled(Animated.View)` (패턴 1)로 통일 — 마이그레이션 6/6 일관.

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
- **근거**: react-native-paper FAB가 정원형(M3 적용 + 모바일 RN 사용자 익숙)이고 시뮬레이터 검증에서 정원형이 IconButton과 인지적으로 구분되어 더 명확. extended pill 모양도 정원 연장(height/2)으로 시각 일관. 1 color는 FAB의 본질("primary action 강조 buton") 정합 — secondary는 일반 Button으로 대체 가능. action 카테고리 — 액션 트리거 컴포넌트이므로.

---

## ADR-23: Skeleton API — discriminated props (rect/circle/text)

- **상황**: Skeleton placeholder 3 type 시연 필요. 단일 prop + 옵셔널(props 조합 추론) vs discriminated union vs compound 컴포넌트(Skeleton.Rect 등) 중 선택. 애니메이션 라이브러리도 같이 결정 — Reanimated 미설치 상태.
- **선택**: **discriminated union 타입** `SkeletonProps = { type: 'rect'; width; height } | { type: 'circle'; size } | { type: 'text'; lines?; lineWidths?; lineHeight? }`. **RN core `Animated.Value` + `Animated.loop`** 사용 (의존성 0 추가). backgroundColor interpolation으로 `surface/containerHigh` ↔ `border/default` 750ms × 2 (1.5s cycle) 무한 반복.

> **shimmer 토큰 결정 변경 이력**: 초기 Figma 사양은 `surface/containerHigh` ↔ `surface/container` (대비 Light 1.06 / Dark 1.13)였으나, 시뮬레이터 검증에서 두 surface 토큰 명도 차이가 너무 작아 placeholder 인지 불가 → highlight 끝점을 `border/default`로 변경 (대비 Light ~1.41 / Dark ~1.5 — 인지 가능 수준). Figma Skeleton 페이지(23 placeholder 노드)도 같은 토큰으로 갱신해 코드↔Figma 1:1 정합 유지. 토큰 차원 이슈로 **v1.x 후순위 항목 추가** — surface 토큰 계층(container-lowest/low/base/high/highest 5단) 명도 재설계 검토 (현재 인접 단계 대비 1.06~1.13으로 시각 인지에 부족).
- **포기한 옵션**: 단일 prop + 옵셔널 (type 없이 props 조합으로 분기 — 타입 안전성 부족), compound `Skeleton.Rect`/`Skeleton.Circle` (Badge `type` prop 패턴(ADR-21)과 불일치), Reanimated 도입(미설치 + sysclock 1.5s 단순 transition에 core Animated 충분), translateX shimmer + LinearGradient(linear-gradient 미설치).
- **근거**: Badge `type='dot'\|'count'\|'label'` + value 패턴 정합 — 라이브러리 내 type-discriminated API 일관. discriminated union으로 IDE 자동 완성·런타임 안전성 확보. RN core Animated는 Switch(ADR-17)에서 동일 패턴 검증 완료 — 의존성 추가 0 원칙 유지(누적 신규 토큰 0 + 신규 의존성 0).

> **Reanimated 마이그레이션 갱신**: Reanimated v4로 마이그레이션 완료 (ADR-26). shimmer 토큰 매핑(`surface.containerHigh` ↔ `border.default`)은 그대로 유지 — Figma 정합 16/16 영향 0. `Animated.loop(Animated.sequence([timing, timing]))` → `withRepeat(withSequence(withTiming, withTiming), -1, false)` + `interpolateColor` + `useAnimatedStyle`로 전환. `cancelAnimation` cleanup 추가로 unmount 시 메모리 leak 방지. RectBox/CircleBox/TextLine 3개 모두 styled-Animated 패턴 1 (`styled(Animated.View)`)로 통일 — 마이그레이션 6/6 일관. 초기 "의존성 0 추가" 원칙은 Reanimated 마이그레이션에서 의도된 의존성 추가(ADR-26 정당화)로 정책 변경.

---

## ADR-24: Chip 4 variant + lucide-react-native 표준 점유율

- **상황**: Material 3 Chip 4 variant(Filter/Assist/Input/Suggestion) 시각 차별화 + 아이콘 점유율 결정. compound vs 단일 컴포넌트 + variant prop, 100% / 75% 통일 점유율 vs lucide 비대칭 점유율 중 선택.
- **선택**: **단일 컴포넌트 + variant prop** (`<Chip variant='filter'\|... />`). **lucide-react-native 표준 비대칭 점유율** 그대로 채택 — Check 67/46%, Plus 58%, Star 67/83%, X 50% (viewBox 24 기준). RN 코드에서 `lucide-react-native`의 `<Check>` `<Plus>` `<Star>` `<X>` 컴포넌트 import → Figma도 동일 lucide path scaled로 작성 → **Figma↔코드 1:1 자동 정합** (Switch 81/81 정합 패턴 재현). variant별 시각: Filter outlined(selected 시 filled primary), Assist outlined + 좌측 icon, Input filled + 좌측 icon + close X, Suggestion outlined + text/muted 옅음.
- **포기한 옵션**: compound `Chip.Filter`/`Chip.Assist` (Badge/FAB type prop 패턴과 불일치), 75% 단일 점유율(Check가 selected 의미 강조에 약함 + 모든 아이콘 단조), 100% 점유율(visible 영역 과대 + 의미적 시각 무게 차이 사라짐), 자체 path 작성(lucide 표준 일관성 손실).
- **근거**: lucide 비대칭 점유율은 아이콘 의미적 무게(Check selected 보조 < Star 콘텐츠 > X close 보조)와 일관 — Material Symbols + lucide 표준이 이미 가이드라인 검증. Figma 정합 — Chip Figma 작업에서 frame-wrap 패턴으로 점유율 정합(각 아이콘 vector frame 14/16 size + inner vector lucide path scaled + 중앙 정렬) → RN 코드의 lucide import와 visual 1:1 정합. **신규 토큰 0 추가** (Badge/FAB 패턴 유지) — `border/control`(ADR-15 추가) + `surface/containerHigh` + `text/secondary` + `text/muted` + `primary/action` + `primary/onAction` 모두 기존 토큰 재사용.

---

## ADR-25: 신규 컴포넌트 검증 체크리스트

### 상황

시각 사양 정합은 코드/Figma 비교로 검증되지만, onPress/onChange 콜백 동작 검증 누락이 Skeleton / Chip 작업 후반에 반복 발견(Skeleton 의도 / Input 가로 정합 / Star→X 렌더링 / SettingsRow toggle 흐름 / Button destructive `#FFFFFF` 하드코딩 / Skeleton shimmer 토큰 Figma 미동기화). 검증 절차를 단일 체크리스트로 명문화.

### 선택

신규 컴포넌트 도입 시 다음 9항목 검증:

| # | 항목 | 검증 방법 |
|---|------|---------|
| 1 | Figma → RN 측정값 정합 | width/height/padding/radius/font-size/icon size px 단위 일치 |
| 2 | Light/Dark 양 모드 | mode-aware 토큰 swap 작동 (`text.primary` / `surface.containerHigh` 등) |
| 3 | accessibility | `accessibilityRole` / `accessibilityState` / `accessibilityLabel` 누락 없음 |
| 4 | 상태별 시각 | default / pressed (opacity 0.7) / disabled (0.4~0.5) / selected / loading |
| 5 | 콜백 시뮬레이터 검증 | 시각 변화 있음 → 선택 텍스트 표시 / 변화 없음 → `Alert.alert` 시연 |
| 6 | 48×48 터치 영역 | sm 사이즈는 `hitSlop` 적용 (예: IconButton sm hitSlop 12 → 48×48) |
| 7 | Figma↔RN 정합 카운트 명시 | N/N 형식 (예: Switch 81/81). 의도된 정정은 별도 표기 |
| 8 | 인라인 스타일 분류 A = 0 | `grep -rn "style={{" src/` 전수 점검 + 토큰 우회 정정 |
| 9 | 측정값/코드 라인 인용 | 검증 근거 추적성 (보고 시 라인 번호 명시) |

### 포기한 옵션

| 옵션 | 사유 |
|------|------|
| 시각 사양 검증만 유지 | 콜백 누락 패턴 재발 |
| 컴포넌트별 개별 체크리스트 | 공통 항목 중복 + 관리 부담 |
| 자동화 테스트 (`@testing-library/react-native`) | v1.x 의존성 0 정책 위반 |
| 정합 카운트 비명시 | 불일치 발견 시 식별 지점 부재 |
| 인라인 스타일 미관리 | 토큰 시스템 우회 누적 |

### 근거

Skeleton / Chip 작업 후반 누락 사례가 모두 단순 수치 일치로는 잡히지 않고 흐름·렌더링 검증이 필요한 케이스. `Alert.alert`는 의존성 추가 없이 RN core API로 onPress 동작을 즉시 확인. `hitSlop`은 시각 영역과 별개로 터치 영역만 확장하므로 M3 권장 영역(48×48) 보장이 시각 사양에 영향 없음. 정합 카운트는 Switch 81/81 / Chip 38/38 / Button 18/18 / Skeleton 16/16 패턴을 표준 보고 형식으로 승격 — 불일치 발견 시 즉시 식별 가능. 인라인 스타일 점검은 토큰 시스템 우회의 단일 지점 정기 검사. 자동화 테스트는 v2.x 이후 검토.

### 결과

- Progress 작업 이후 본 체크리스트가 모든 신규 컴포넌트에 적용됨
- 누적 정합 카운트 208/208 (Switch 81 + Chip 38 + Button 18 + Skeleton 16 + Progress 42 + Tooltip 13)
- 인라인 스타일 분류 A 0건 유지 (v1.x 누적, BottomSheet 단일 snap 단계까지 포함)
- 신규 의존성 0건 유지

---

## ADR-26: Reanimated v4 도입 + 애니메이션 컴포넌트 일괄 마이그레이션

### 상황

초기 5개 컴포넌트(ToastHost / DialogHost / Skeleton / Switch / SegmentedControl)가 RN core `Animated` 사용. BottomSheet 작업에서 Reanimated가 사실상 필수(Gesture Handler + UI 스레드 worklet + drag/snap/swipe). Progress 작업 진입 전, 별도 마이그레이션 작업을 분리하여 Reanimated 도입 + 기존 5개 컴포넌트 일괄 전환 + styled-Animated 패턴 통일.

### 선택

**Reanimated v4.3.1 도입 + 5개 컴포넌트 일괄 전환 + `styled(Animated.View)` 패턴 통일**.

- v4는 RN 0.85 New Architecture(Fabric) 기본값과 정합
- `react-native-worklets` peer dependency v0.8.3 동반 설치
- `useNativeDriver` 옵션 자동 (항상 UI 스레드 worklet)
- babel plugin: `react-native-worklets/plugin` 마지막 위치
- iOS Pod install: 81 dependencies / 80 pods

API 전환 패턴:

| 변경 전 (RN core) | 변경 후 (Reanimated v4) |
|------|------|
| `useRef(new Animated.Value())` | `useSharedValue()` |
| `Animated.timing(...).start()` | `withTiming(...)` |
| `anim.interpolate({...})` | `useAnimatedStyle(() => ({ ... }))` + `interpolate()` |
| `Animated.loop` | `withRepeat(withSequence(...), -1, false)` |
| exit callback | `'worklet'; runOnJS(...)` |

styled-Animated 패턴 통일: `styled(Animated.View)` 6/6 (옵션 A). 라인 절약 + styled-components 관용 패턴. 정적 styled 부적합 케이스 3건(ToastHost / DialogHost card / Switch thumb)은 직접 `<Animated.View>` 유지.

### 포기한 옵션

| 옵션 | 사유 |
|------|------|
| Progress 작업과 마이그레이션 동시 진행 | 작업 단위 과대, 회귀 추적 어려움 |
| Progress 작업부터만 Reanimated, 기존 5개는 RN core 유지 | 두 애니메이션 라이브러리 영구 공존, 일관성 훼손 |
| BottomSheet 작업까지 RN core Animated 유지 | BottomSheet 구현 한계 (Gesture Handler + worklet) |
| Reanimated v3 | RN 0.85 + New Architecture에서 v4가 적절 |
| `Animated.createAnimatedComponent` 패턴 | 코드 라인 증가, 사용처 `Animated.` 접두 강제 |
| "신규 의존성 0" 원칙 무조건 유지 | BottomSheet 등 후속 컴포넌트 구현 한계 |

### 근거

**일관성**: 디자인 시스템 라이브러리의 핵심 가치는 일관된 패턴. 두 애니메이션 라이브러리 공존 또는 styled-Animated 패턴 혼재는 장기 부담. Progress 작업 진입 전이 마이그레이션 비용 최소 시점.

**기술**: Reanimated v4의 UI 스레드 worklet으로 60fps 보장 + JS 스레드 부담 없음. `useSharedValue` + `useAnimatedStyle`이 RN 커뮤니티 표준. Gesture Handler v2.31.2(이미 peer로 설치)와 자연 통합 — BottomSheet 작업 사전 셋업.

**검증 결과**: ADR-25 9항목 체크리스트 통과 — 측정값 변경 0건 (Switch 81/81 + Skeleton 16/16 유지), 정합 카운트 153/153 유지, 인라인 스타일 분류 A 0건 유지(B는 -4건 감소, `useAnimatedStyle` 통합 효과), RN core Animated 5개 파일 완전 제거.

### 결과

- **의존성 정책 갱신**: 초기 "신규 의존성 0 추가" → 마이그레이션 이후 "정당화된 의존성 추가 가능 (ADR 사유 명시 필수)". 토큰 0 추가 원칙은 유지.
- 후속 컴포넌트(Progress / Tooltip / BottomSheet)가 모두 Reanimated v4 일관 패턴 적용
- Gesture Handler 통합 준비 완료 — BottomSheet 단일 snap 단계의 `Gesture.Pan()` 즉시 활용

---

## ADR-27: Progress 컴포넌트 + react-native-svg 결합 + 갤러리 동적 시연

### 상황

M3 표준 Progress 컴포넌트 추가. determinate + indeterminate 양 variant 필요. Linear는 View 기반(`useAnimatedStyle`), Circular는 SVG 기반(`useAnimatedProps` + react-native-svg)으로 구현 본질이 다름. Reanimated v4와 react-native-svg를 결합하는 첫 사례.

### 선택

**LinearProgress + CircularProgress 별도 컴포넌트, 단일 파일 (`src/components/feedback/Progress.tsx`)**.

API:

```ts
type ProgressProps =
  | { variant?: 'determinate'; value: number }   // 0~100, 자동 clamp
  | { variant: 'indeterminate' };
```

| 사양 | LinearProgress | CircularProgress |
|------|----------------|------------------|
| 베이스 | View + `styled(Animated.View)` | `<Svg><Circle/>` (react-native-svg) |
| determinate 애니메이션 | `withTiming(value, 300ms)` width % | `useAnimatedProps`로 `strokeDashoffset` |
| indeterminate 애니메이션 | `translateX -fillW → trackWidth` 무한 반복 | `rotate 0 → 360deg` + arc 35% |
| 시작 위치 | 좌측 | 12시 (`transform="rotate(-90 cx cy)"`) |
| 라인 처리 | — | `strokeLinecap="round"` (M3) |
| accessibility | `progressbar` role + `accessibilityValue {min:0, max:100, now}` (determinate) / `accessibilityState {busy: true}` (indeterminate) | 동일 |

`cancelAnimation` cleanup으로 unmount 시 worklet leak 방지.

갤러리: 24 정적 인스턴스 (Figma 1:1 정합 42/42) + 동적 데모 2 인스턴스 (다운로드 시뮬레이션, `useDownloadProgress` hook, 500ms +5% / 10초 cycle).

### 포기한 옵션

| 옵션 | 사유 |
|------|------|
| `value === undefined`로 indeterminate 암묵 분기 | TypeScript 추론 어려움, 명시성 부족 |
| 단일 Progress + `type` prop | View vs SVG 본질 다름 |
| 디렉토리 분리 (`Progress/LinearProgress.tsx` 등) | Skeleton 단일 파일 패턴 일관성 깨짐 |
| value 범위 0~1 | MUI 퍼센트 표준이 더 보편적 |
| Circular indeterminate M3 표준 (arc 길이 변화 + 회전) | 복잡도 증가, v2.x 진화 |
| Linear indeterminate M3 표준 (두 fill 교대 슬라이드) | v2.x 진화 |
| 갤러리 정적 시연만 | determinate variant의 실제 가치(value 변화) 시연 부재 |

### 근거

**Reanimated v4 + react-native-svg 첫 결합 패턴**: `Animated.createAnimatedComponent(Circle)` + `useAnimatedProps`로 `strokeDashoffset`을 60fps UI 스레드 worklet 처리. determinate `withTiming` 300ms로 value 변경 부드러운 transition. indeterminate `withRepeat(withTiming, -1, false)`로 무한 반복.

**SVG primitive는 styled-components props 매핑 부적합** (`<Circle>` 등은 SVG attr 기반이라 styled-components의 transient props $-prefix 패턴과 충돌). 직접 사용 정당화.

**갤러리 동적 시연 패턴 도입**: 정적 인스턴스만으로는 determinate variant의 핵심 가치(value 변화에 따른 부드러운 transition) 시연 불가. 다운로드 시뮬레이션 hook은 후속 Tooltip / BottomSheet 시연에서도 재사용.

### 결과

- Figma↔RN 정합 42/42 (Linear 18 + Circular 24)
- 누적 정합 195/195 (Progress 작업까지 누적)
- 인라인 스타일 분류 A 0건 유지
- 신규 토큰 0개 (Progress 작업까지 누적 0)
- react-native-svg는 lucide-react-native의 peer로 이미 설치되어 직접 import만 추가 — 의존성 추가 아님
- v2.x 진화 예정: Interactive 시연 (slider value 조정) / Circular indeterminate M3 표준 / Linear indeterminate M3 표준 / buffer variant / value smooth interpolation prop

---

## ADR-28: Tooltip + `surface/inverse` 토큰 추가 + 토큰 정책 갱신

### 상황

M3 표준 Tooltip(Plain variant)을 라이브러리에 추가. M3 사양은 max-width 200dp + inverse 배경 + inverse on-surface 텍스트가 필수.

라이브러리의 inverse 토큰 군은 text(3개) + primary(1개) 총 4개만 있고 **`surface/inverse` 영역만 누락**. 기존 `surface/container-highest` 또는 `bg/section-main` 재사용은 M3 inverse 의미를 손실. 기존 신규 토큰 0 원칙을 유지하면 M3 정합 불가능.

### 선택

**신규 토큰 `color/surface/inverse` 1개 추가** + Tooltip 컴포넌트 도입.

**토큰**: Light `#1A1F2E` / Dark `#F8FAFC`, scope `FRAME_FILL + SHAPE_FILL`. 텍스트는 기존 `color/text/inverse` 재사용 — 추가 1개로 최소화.

**Tooltip API**:

```tsx
<Tooltip text="설명" position="top">
  <IconButton icon={<Settings />} />
</Tooltip>
```

| 항목 | 사양 |
|------|------|
| 트리거 | 롱프레스 (500ms, RN `Pressable.onLongPress`) + `visible` prop 외부 제어 |
| position | `'top' \| 'bottom' \| 'left' \| 'right'`, default `'top'` |
| 표시 위치 | 인라인 절대 위치 (`position: relative` 부모 + `position: absolute` Tooltip) |
| dismiss | 1500ms 자동 |
| 콘텐츠 | string, max-width 200dp (M3 Plain) |
| children 주입 | `cloneElement`로 `onLongPress` 추가 |
| 애니메이션 | Reanimated v4 + `useAnimatedStyle` fade in/out |
| 파일 | 단일 `Tooltip.tsx` |
| arrow | 미표시 (M3 표준) |

**`InteractivePressableProps` Pick 상속 도입** — `cloneElement`가 라이브러리 컴포넌트에 도달하려면 `onLongPress`를 받아야 함. `src/types/interactive.ts`에 다음 정의 후 IconButton / Button / FAB / Chip / Switch 5개에 적용:

```ts
type InteractivePressableProps = Pick<
  PressableProps,
  | 'onLongPress' | 'onPressIn' | 'onPressOut'
  | 'delayLongPress' | 'hitSlop'
  | 'accessibilityHint' | 'testID'
>;
```

5개 컴포넌트가 `extends InteractivePressableProps` + 내부 `Pressable`에 `...pressableProps` spread.

### 포기한 옵션

| 옵션 | 사유 |
|------|------|
| `surface/container-highest` 재사용 | M3 inverse 의미 손실, 강조 효과 약함 |
| `bg/section-main` 재사용 | 페이지 wrapper 의미와 충돌, 향후 결합 위험 |
| 신규 토큰 0 원칙 무조건 유지 | M3 정합 불가, inverse 토큰 군 불완전 |
| `Pressable` wrap 패턴 | children을 외부 `Pressable`로 감싸면 children이 `Pressable`일 때 RN nested Pressable 충돌 — inner `Pressable`이 모든 touch 이벤트 capture → Tooltip 표시 0. `cloneElement` 패턴으로 복원 |
| `IconButton`만 `onLongPress` 명시 추가 | 5개 인터랙티브 모두 동일 필요 — Pick 상속이 일관 |
| release 시 즉시 dismiss (M3 기본) | 메시지 읽을 시간 부족 — 1500ms 자동 dismiss만 사용 |
| 12방향 placement | 단순성 우선, v2.x |
| 자동 position fallback (viewport flip) | `measure()` + 계산 복잡, v2.x |
| TooltipHost 전역 | Tooltip은 target 종속이라 Toast/Dialog 호스트 패턴과 본질 다름 |
| Rich variant (title + description + action) | v2.x |
| 비-인터랙티브 element (`View` 등) 자동 wrap | RN Touch Responder System 한계 — 사용자가 `Pressable` wrap 필요. v2.x Gesture Handler 검토 |

### 근거

**inverse 토큰 군 완성**: 기존 `text/primary-inverse` + `text/secondary-inverse` + `text/inverse` + `primary/inverse` 4개에 `surface/inverse`를 추가하여 5개 inverse 토큰 군 완결. M3 표준 정합 + 라이브러리 패턴 일관.

**`cloneElement` + Pick 상속 조합**: `Pressable` wrap이 nested Pressable 충돌로 실패한 후 `cloneElement`로 복원. 라이브러리 5개 인터랙티브 컴포넌트가 `InteractivePressableProps` Pick 상속으로 `onLongPress`를 자동 수용하므로 `cloneElement` 도달이 보장됨. 라이브러리 내 `onLongPress` 사용 0건이라 prop 충돌 없음.

**RN Touch Responder System 한계**: `View` 등 비-인터랙티브 element는 wrap만으로 `onLongPress`를 받지 못함. 갤러리 검증 섹션(`Pressable` / `View` / `TouchableOpacity` 3 케이스 시연)으로 종속성 명문화 — RN 표준 `PressableProps` 수용 컴포넌트(라이브러리 5개 + RN core + 외부 라이브러리)와 자유 결합 가능, 비-인터랙티브는 `Pressable` wrap 필요.

**기술 상세**: 4방향 수동 prop으로 `measure()` 회피. inline 절대 위치(`position: relative` 부모). `accessibilityHint`로 롱프레스 안내.

### 결과

- **토큰 정책 갱신**: 이전 "신규 토큰 0 추가" → 이후 "정당화된 토큰 추가 가능 (ADR 사유 명시 필수)". ADR-26(의존성)과 동일 구조. 누적 신규 토큰 1개(`surface/inverse`).
- **인터랙티브 컴포넌트 5개에 `InteractivePressableProps` Pick 상속 표준화** — IconButton / Button / FAB / Chip / Switch 모두 RN `Pressable` props 일부를 일관 수용. 외부 컴포넌트 wrap도 동일 패턴 제공 가능.
- Figma↔RN 정합 13/13 (padding 8h/4v + cornerRadius 4 + max-width 200 + gap 4 + 4 position + 토큰 binding 2 + 폰트 2)
- 누적 정합 195 → 208
- 인라인 스타일 분류 A 0건 유지
- v2.x 진화 예정: 12방향 placement / 자동 viewport flip / Rich variant / 외부 영역 탭 dismiss / arrow prop / hover 유지 (WCAG 2.2 SC 1.4.13) / 비-인터랙티브 element 자동 wrap (Gesture Handler) / `measure()` helper hook 추출

---

## ADR-29: BottomSheet 자체 구현 (단일 snap 단계)

### 상황

M3 Modal Bottom Sheet를 라이브러리에 추가. 두 가지 구현 옵션:

- (A) `@gorhom/bottom-sheet` 패키지 도입
- (B) DialogHost / ToastHost 패턴 확장 (자체 구현)

BottomSheet 사양 범위가 단일 작업 단위로 다루기에 큼(다중 snap / scrollable / 키보드 정밀). 작업 단위를 분할:

- **단일 snap 단계**: 단일 snap + drag dismiss (본 ADR)
- **다중 snap 단계**: 다중 snap + scrollable content
- **키보드 정밀 단계**: 키보드 + safe-area 정밀 보정

### 선택

자체 구현. 단일 snap 단계 사양:

| 항목 | 사양 |
|------|------|
| height prop | `'auto' \| \`${number}%\` \| number` (template literal type) — default `'auto'` = 화면 50% |
| drag dismiss | 거리 30% OR velocity > 500px/s (결합 임계값) |
| handle bar | 32×4dp, `border.default` 토큰 |
| 백드롭 | `overlay.scrim` 토큰 |
| 카드 | `surface.container` 토큰, top cornerRadius 28dp, elevation 3 |
| content padding | 16h / 24v, `paddingBottom: 24 + insets.bottom` (safe-area 자동) |
| enter 애니메이션 | `withTiming(0, 250ms, Easing.out(Easing.cubic))` (M3 emphasized decelerate) |
| exit 애니메이션 | `withTiming(totalHeight, 200ms, Easing.in(Easing.cubic))` + 완료 콜백 `setShouldRender(false)` (M3 emphasized accelerate) |
| 호스트 | 전역 `BottomSheetHost` + Zustand store (DialogHost 패턴) |
| API | imperative `bottomSheet.open / close` + controlled `<BottomSheet visible onDismiss height>` |
| Gesture | gesture-handler v2 `Gesture.Pan()` — App 루트 `GestureHandlerRootView` 추가 |
| BackHandler | Android 자동 dismiss |
| safe-area | `useSafeAreaInsets` 하단 inset 자동 |

```tsx
// imperative
bottomSheet.open({
  height: '50%',
  children: <SettingsForm />,
  onDismiss: () => saveDraft(),
});

// controlled
<BottomSheet visible={open} onDismiss={() => setOpen(false)} height={400}>
  <Text>시트 콘텐츠</Text>
</BottomSheet>
```

### 포기한 옵션

| 옵션 | 사유 |
|------|------|
| `@gorhom/bottom-sheet` 도입 | 단일 컴포넌트 wrap이 디자인 시스템 정체성과 충돌. Reanimated · Gesture Handler · Zustand 같은 인프라 의존성은 다수 컴포넌트 공유, `@gorhom`은 BottomSheet 하나만 활용 |
| v2.x로 미루기 | M3 Modal Bottom Sheet는 v1.x에 포함되어야 할 표준 |
| 단일 작업 단위 완성 | 다중 snap · scrollable · 키보드를 한 번에 다루면 작업 단위 과대 |
| enter `withSpring` | overshoot / bounce가 BottomSheet UX에 부적합. M3는 emphasized easing 표준 |
| `withSpring + overshootClamping` | DialogHost timing 패턴과 일관 깨짐 |
| 즉시 unmount on `isVisible=false` | exit 애니메이션 발동 불가. `shouldRender` state로 콜백 완료 후 unmount하여 해결 |
| store 레벨 unmount 시점 제어 (DialogHost 동일) | store 구조 변경 큼. 컴포넌트 내부 `shouldRender`로 동일 효과 달성 가능 |
| drag cancel `withSpring` 복귀 | spring overshoot로 출렁임. `withTiming` 일관 |

### 근거

**의존성 분류**: Reanimated · Gesture Handler · safe-area-context · Zustand는 다수 컴포넌트가 공유하는 인프라 의존성. `@gorhom/bottom-sheet`는 단일 컴포넌트 wrap. ADR-26의 의도된 의존성 정책은 전자에 한정.

**호스트 패턴 일관**: DialogHost / ToastHost와 동일 구조 (Zustand + imperative API + App 루트 1회 마운트 + Reanimated v4 + safe-area). 신규 패턴 도입 없이 기존 인프라 활용.

**M3 Material Motion**: spring 물리 모델 대신 emphasized decelerate / accelerate easing 적용. BottomSheet UX에 자연스러운 슬라이드 동작 보장.

**unmount 처리**: DialogHost는 `store.displayed`(객체 또는 null)로 unmount 시점을 자연 제어 — exit 애니메이션 완료 콜백 안에서 `dismiss()` 호출하여 store가 null로 바뀜. BottomSheetHost는 `isVisible: boolean` 단순 구조이므로 컴포넌트 내부 `shouldRender` state로 동일 효과 달성 (store 구조 변경 회피, 변경 범위 컴포넌트 내부 한정).

**기술 상세**:

- `Gesture.Pan().onUpdate(e)`: `e.translationY > 0`만 반영 (위쪽 drag 차단)
- `onEnd(e)`: 결합 임계값 검증 (거리 30% OR velocity 500) → `runOnJS(close)()` 또는 `withTiming(0)` 원위치
- drag dismiss → store false → `useEffect` 발동 → exit 애니메이션이 현재 `translateY` 위치에서 자연 이어짐
- `shouldRender` 초기값 false + `else if (shouldRender)` 가드 → 첫 mount 시 exit 분기 진입 차단 (idempotent)
- `translateY.value = totalHeight` 재설정 → `withTiming(0)` — 재오픈 또는 totalHeight 변경 케이스 대응
- 의존성 배열 `[isVisible]`만 — totalHeight 변경 시 트리거 회피 (사이즈 변경 도중 시트 재시작 점프 방지)

### 결과

- 의존성 추가 0건. ADR-26 의존성 정책의 첫 적용 사례 — 정책 갱신 후 결과는 "추가 없음".
- 토큰 추가 0건. ADR-28 토큰 정책의 둘째 적용 사례 — 기존 토큰(`surface.container` / `overlay.scrim` / `border.default`) 활용.
- 호스트 패턴 일관: DialogHost / ToastHost / BottomSheetHost — modal-style 컴포넌트의 공통 구조.
- TypeScript template literal type 활용 — `height` prop의 잘못된 string 컴파일 시점 차단.
- 문서·스크린샷 갱신은 BottomSheet 작업 전체 종료(키보드 정밀 단계 직후)에 일괄 처리. 부분 사양이 완성 가이드로 오해되는 것을 방지.
- v2.x 진화 예정: Standard variant (영구 표시 + 메인 UI 공존) / Expanded variant (전체 화면 가까이) / 사용자 정의 handle prop / Section sub-component (header / footer / divider) / snap point별 spring config / unmount 시점 store 격상.

---

## ADR-30: BottomSheet 다중 snap + drag·scroll 양립 (다중 snap 단계)

### 상황

BottomSheet 단일 snap (ADR-29) 기반에서 다중 snap + scrollable content 본질 확장. M3 Modal Bottom Sheet는 다중 snap이 표준 (Compact / Default / Tall 또는 임의 snapPoints array), 콘텐츠 영역이 ScrollView일 때 시트 drag와 콘텐츠 scroll의 양립 본질이 핵심.

iOS SwiftUI `presentationDetents([.medium, .large])` 및 `@gorhom/bottom-sheet`의 `snapPoints` array 패턴이 다중 snap 표준에 가깝다. 본 라이브러리는 ADR-29의 자체 구현 결정을 일관 유지.

### 선택

**snapPoints array API + handle bar 영역만 drag + velocity projection snap 선택**. 단일 snap 단계 사양:

| 항목 | 사양 |
|------|------|
| snapPoints prop | `BottomSheetSnap[]` — `'auto' \| \`${number}%\` \| number` 각 element. 정렬은 사용자 의도 보존 (자동 정렬 안 함) |
| height prop 호환 | snapPoints 미지정 시 fallback. 동시 지정 시 `__DEV__` 경고 + snapPoints 우선 |
| initialSnap | 초기 snap 인덱스 (default 0). 범위 밖이면 clamp |
| imperative API | `bottomSheet.open({ snapPoints, initialSnap, onSnapChange, ... })` + `bottomSheet.snapTo(index)` |
| controlled API | `<BottomSheet snapPoints={...} initialSnap onSnapChange visible onDismiss>` |
| snap 사이 이동 | `withTiming(targetY, 250ms, Easing.out(Easing.cubic))` — 단일 snap 단계의 enter/cancel timing 일관 |
| drag activation | `GestureDetector`를 Handle 영역(`HandleArea`)만 감싸기. Sheet body는 외부 → 콘텐츠 영역(RNGH ScrollView 등)은 native gesture 자유 |
| snap 선택 알고리즘 | velocity > 500px/s 시 projection 0.15s 후 가장 가까운 snap, 그 외 현재 위치에서 가장 가까운 snap |
| dismiss 본질 | 가장 낮은 snap에서 추가 거리 30% 또는 velocity > 500px/s — 단일 snap 단계 임계값 일관 |
| scrollable 콘텐츠 | 사용자가 `react-native-gesture-handler`의 `ScrollView` 직접 wrap. BottomSheet API 변경 없음 |
| Content height 동적 | `useAnimatedStyle` worklet으로 `translateY` 기반 `visibleHeight = totalHeight - translateY` 계산 → ScrollView 등 flex 자식이 가시 영역(현재 snap)과 본질 일치 |
| paddingBottom | `12 + insets.bottom` (M3 24 → 12 정정 — safe-area 결합 시 시각 자연 우선) |

```tsx
// imperative — 다중 snap + onSnapChange
bottomSheet.open({
  snapPoints: ['25%', '50%', '90%'],
  initialSnap: 1,
  onSnapChange: index => console.log('snap', index),
  children: <SettingsForm />,
});
bottomSheet.snapTo(2);

// controlled + scrollable
import { ScrollView } from 'react-native-gesture-handler';

<BottomSheet
  visible={open}
  onDismiss={() => setOpen(false)}
  snapPoints={['50%', '90%']}
>
  <ScrollView>{/* 긴 콘텐츠 */}</ScrollView>
</BottomSheet>
```

### 포기한 옵션

| 옵션 | 사유 |
|------|------|
| snap 사이 spring | 단일 snap 단계의 timing 본질 배제 결정 일관 — spring overshoot가 라이브러리 UX 본질과 충돌 |
| 시트 전체 drag (단일 snap 단계 동작 유지) | scrollable 양립 불가 (drag와 scroll 충돌). 단일 snap 케이스도 handle bar drag로 일관 |
| `BottomSheetScrollView` sub-component | 라이브러리 API 단순 유지 + 의존성 0 추가. 사용자가 RNGH `ScrollView` 직접 import (v2.x sub-component 군 검토) |
| `Gesture.Simultaneous(pan, native)` 명시 | handle bar만 GestureDetector로 감싸면 콘텐츠 영역은 자동 native gesture 우선. Simultaneous 코드 0건으로 단순 |
| snap 선택 거리만 | velocity 무시 → 사용자 의도 정합 약함. projection 결합이 자연 |
| closed snap을 snapPoints에 포함 | snap 선택과 dismiss 본질 혼재. dismiss는 별도 임계값(거리 30% + velocity 500)으로 단일 snap 단계 본질 보존 |
| snapPoints 단독 API (height 제거) | 단일 snap 단계 사용자 코드 breaking change |
| 콘텐츠 영역 조건부 drag (scroll top + 아래 방향일 때만 drag 활성) | `useAnimatedScrollHandler` worklet으로 scroll offset 추적 필요 — 구현 복잡. v2.x 또는 키보드 정밀 단계 검토 |
| Content `flex-shrink: 1` 유지 (단일 snap 단계 본질) | Sheet height = `totalHeight`(가장 큰 snap 기준) 고정. ScrollView가 부모 영역을 인지하나 가시 영역(현재 snap)과 불일치 — 25% / 50% snap에서 콘텐츠 잘림 또는 닫기 가시 영역 밖 |
| ScrollView `max-height: 400` 고정 cap | 25% / 50% snap에서 시트 본체 가시 영역이 400보다 작은 경우 ScrollView 일부 또는 닫기 버튼 가시 영역 밖 |
| Content `flex: 1` + 중첩 flex wrap 신규 | 부모 height 결정 없는 중첩 flex 구조에서 ScrollView height 0 — 콘텐츠 사라짐 |
| Content `flex: 1` 단순 변경 | Sheet height = `totalHeight` 고정이라 Content가 Sheet 전체 채워도 가시 영역(현재 snap) 인지 불가 — ScrollView가 가시 영역과 불일치 |
| paddingBottom `24 + insets.bottom` (M3 표준 그대로) | iOS safe-area inset 34 결합 시 58px 본질적 과대 — 시각 부자연. 12 + insets.bottom로 정정 |

### 근거

**timing 일관**: 단일 snap 단계에서 spring 배제 결정의 본질은 overshoot/bounce 제거. snap 사이 이동도 동일 본질 적용 — `Easing.out(Easing.cubic)` 250ms로 자연 도착. M3 Material Motion의 emphasized decelerate 표준 일관.

**handle bar drag activation**: `GestureDetector`를 Handle 영역만 감싸면 PanGesture가 콘텐츠 영역에 부착되지 않음. 콘텐츠 영역의 ScrollView는 native gesture 우선 처리 — RNGH `ScrollView`가 자동 통합. `Gesture.Simultaneous` 명시 불필요.

**velocity projection snap 선택**: 사용자가 빠르게 위로 swipe하면 다음 snap으로 자연 이동. projection 시간 0.15s는 일반적 UX 패턴 (iOS sheet, gorhom 등 유사 값).

**dismiss 본질 보존**: snapPoints에 closed 상태를 포함하면 snap 선택 알고리즘이 dismiss 케이스를 흡수해야 함. 별도 임계값(가장 낮은 snap 기준 추가 거리 30% OR velocity 500)으로 분리하면 단일 snap 단계의 dismiss UX 그대로 다중 snap에서도 작동.

**호환 정규화**: `open()` 시 `snapPoints ?? [height ?? 'auto']`로 변환. 내부 로직은 항상 array. 단일 snap 케이스(`snapPoints.length === 1`)도 동일 알고리즘 — snap 선택은 단일 결과(현재 snap)로 수렴하므로 단일 snap 단계 동작 보존.

**Content height 동적 (가시 영역 일치)**: Sheet height = `totalHeight`(가장 큰 snap + insets, **고정**) + `translateY`로 snap별 위치 결정. 따라서 자식 ScrollView가 부모 영역을 기준으로 작동하면 가시 영역(현재 snap)과 불일치 — drag dismiss 25% / 50% snap에서 콘텐츠 잘림 또는 사라짐. `Content`를 `styled(Animated.View)`로 변환하고 `useAnimatedStyle` worklet으로 `translateY` 기반 `visibleHeight` 동적 계산:

```ts
const HANDLE_AREA_HEIGHT = 28; // padding 12 + handle 4 + padding 12

const contentStyle = useAnimatedStyle(() => {
  const visibleHeight = Math.max(0, totalHeight - translateY.value);
  return {
    height: Math.max(0, visibleHeight - HANDLE_AREA_HEIGHT),
    paddingBottom: 12 + insets.bottom,
  };
});
```

drag 중 `translateY` 변화 → Content height worklet 실시간 동기(60fps) → ScrollView 등 flex 자식이 항상 가시 영역과 일치. `Math.max(0, ...)`로 closed state(translateY > totalHeight) 안전 처리.

**paddingBottom 12 본질**: M3 표준 24는 safe-area 환경 없는 데스크톱/Android 기준. iOS `insets.bottom` 34(홈 인디케이터 영역, 시각적 여유 보유) 결합 시 24 + 34 = 58px → 본질적 과대. 12로 정정하면 12 + 34 = 46px → 자연 균형.

### 결과

- `BottomSheet` API 확장 (`snapPoints` + `initialSnap` + `onSnapChange`) — 단일 snap 단계 사용자 코드 호환 보존
- `bottomSheetStore` 확장 (`snapPoints` array + `currentSnapIndex` + `snapTo` + `setCurrentSnapIndex` 내부 트리거)
- `bottomSheet.snapTo(index)` imperative API 추가
- `BottomSheetHeight` 타입 → `BottomSheetSnap`으로 의미 확장 (단일 snap에 한정되지 않음)
- handle bar drag activation으로 모든 케이스 일관 (단일 snap 단계도 동일 패턴) — `HandleArea` + `HandleBar` 분리
- 의존성 추가 0건. 토큰 추가 0건.
- 인라인 스타일 분류 A 0건 유지.
- 갤러리 BottomSheet sub-tab 9 케이스 (단일 snap 단계 5 + 다중 snap 단계 4)
- **Content height 동적 worklet**: Content를 `styled(Animated.View)`로 변환 + `useAnimatedStyle`로 translateY 기반 `visibleHeight` 계산 → ScrollView 등 flex 자식이 가시 영역과 자연 일치
- **paddingBottom 24 → 12 정정** (safe-area 결합 시 시각 자연 우선) — M3 표준을 그대로 사용하지 않는 사례
- ScrollView 결합 패턴: 사용자가 ScrollView를 BottomSheet 자식으로 직접 사용 — height 별도 지정 불필요 (Content height 동적). ScrollView 자식 사이 gap은 사용자 코드 영역 (`Spacer` primitive 또는 styled padding)
- 시연 케이스 9 본질: `snapPoints: ['25%', '50%', '90%']` + 50 ScrollItem + Spacer + 닫기(SheetActions) 모두 ScrollView 내부 자식 — 모든 snap에서 스크롤로 모든 자식 접근
- 문서·스크린샷 갱신은 BottomSheet 작업 전체 종료(키보드 정밀 단계 직후)에 일괄 처리
- v2.x 진화 예정: `BottomSheetScrollView` sub-component (라이브러리 자체 ScrollView wrap + 자동 gap) / `BottomSheetSection` sub-component (header / footer / divider / actions 일관 패턴) / 콘텐츠 영역 조건부 drag (scroll top + 방향 분기) / snap point별 spring config prop / snapPoints 동적 변경 (open 후 갱신)

---

## ADR-31: BottomSheet 키보드 양립 (translateY clamp 패턴)

### 상황

BottomSheet 내부 TextInput focus 시 키보드 출현으로 콘텐츠가 가려지는 현상 발생. iOS / Android 양 환경에서 자동 처리 필요. Sheet height = `totalHeight`(가장 큰 snap 기준 고정) + `translateY`로 snap 위치 결정 구조(ADR-29·30) 기준.

### 선택

- `useAnimatedKeyboard` (Reanimated v4) worklet 통합
- `sheetStyle` `translateY` 차감 + `Math.max` clamp 패턴
- AndroidManifest `android:windowSoftInputMode="adjustResize"` (이미 설정됨)
- 사용자 코드 변경 0 — TextInput을 BottomSheet 자식으로 직접 사용

```ts
const sheetStyle = useAnimatedStyle(() => {
  const targetY = translateY.value - keyboard.height.value;
  const minTranslateY = insets.top - screenHeight + totalHeight;
  return {
    height: totalHeight,
    transform: [{ translateY: Math.max(targetY, minTranslateY) }],
  };
});
```

clamp 계산: 시트 상단 화면 좌표 = `screenHeight - totalHeight + translateY`. 시트 상단을 `insets.top`에 고정하려면 `translateY = insets.top - screenHeight + totalHeight` (= `minTranslateY`). 키보드 출현 시 `targetY`가 `minTranslateY`보다 작아지면 clamp 적용.

### 포기한 옵션

| 옵션 | 사유 |
|------|------|
| `KeyboardAvoidingView` wrap (RN core) | absolute positioning 안에서 부분 작동 + Reanimated v4 worklet 패턴(ADR-26)과 불일관 |
| `Keyboard` API `addListener` (JS thread) | 60fps 동기 어려움 + worklet 패턴 불일관 |
| `translateY` + `paddingBottom` 동시 보정 | 큰 snap에서 시트 상단이 화면 위로 나감 + 이중 보정으로 부자연 |
| `paddingBottom`만 보정 (시트 위치 그대로) | 작은 snap에서 시트 자체가 키보드보다 작아 TextInput 가려짐 |
| `keyboardBehavior` prop (`'interactive'` / `'extend'` / `'fillParent'`) | v1.x API 복잡도 과대 — v2.x 영역으로 이동 |
| focus 시 자동 snap 이동 (작은 snap → 큰 snap) | v2.x 영역 — focus 이벤트 + snapTo 결합 필요 |

### 근거

Sheet height가 가장 큰 snap 기준 고정(ADR-30)이므로, 키보드 보정은 `translateY`로 시트 자체를 위로 이동시키는 패턴이 자연. 단 큰 snap(90% 등)에서는 시트가 이미 화면을 거의 채우므로 키보드 만큼 위로 이동하면 시트 상단이 화면 위로 나감. `Math.max` clamp로 시트 상단을 화면 상단(`insets.top`) 아래로 유지.

`useAnimatedKeyboard`는 worklet 안에서 `keyboard.height.value`를 60fps shared value로 제공 — sheetStyle worklet과 자연 결합(ADR-26 Reanimated v4 패턴 일관).

### 결과

- 모든 snap에서 TextInput focus 시 시트 자동 정렬
- 큰 snap (90% 등): 시트 상단 화면 안 clamp + TextInput 가시
- 중간 snap (50%): 시트가 키보드 위로 자연 이동
- 사용자 코드: TextInput을 BottomSheet 자식으로 직접 사용 (별도 prop 없음)
- 키보드 dismiss 시 시트 자연 복귀 (worklet 자동 동기)
- drag 중 키보드 출현/사라짐 시 60fps 자연 동기
- Light / Dark / iOS / Android 일관
- 의존성 추가 0건. 토큰 추가 0건. 인라인 스타일 분류 A 0건 유지
- 작은 snap(25% 등)에서 TextInput 사용 시 시트 가시 영역이 좁은 한계 — v2.x focus 시 자동 snap 이동 영역
- 문서·스크린샷 갱신은 BottomSheet 작업 전체 종료(키보드 정밀 단계 직후, 본 작업 단계)에 일괄 처리

### v2.x 진화 예정

- `keyboardBehavior` prop (`'interactive'` / `'extend'` / `'fillParent'`) — 사용자 선택 옵션
- focus 시 자동 snap 이동 (작은 snap → 큰 snap)
- `BottomSheetTextInput` sub-component (자동 keyboard handling + scroll into view)

---

## ADR-33: modal 카테고리 신설 + 카테고리 재분류

### 상황

전역 호스트 패턴 컴포넌트(DialogHost / ToastHost / BottomSheetHost)가 feedback 카테고리에 함께 분류되어 있었으나, 의미가 "사용자 피드백 표시"(EmptyState/ErrorView/Skeleton 등)와 "화면 위에 떠 있는 모달 인터페이스"(Toast/Dialog/BottomSheet)로 두 갈래. Popup(예정) 추가 진입 전 카테고리 의미 명확화 필요.

### 선택

- `src/components/modal/` 디렉토리 신설
- 6 파일 이동(`Dialog.tsx` / `DialogHost.tsx` / `Toast.tsx` / `ToastHost.tsx` / `BottomSheet.tsx` / `BottomSheetHost.tsx`)
- `feedback` 잔존 6개: EmptyState / ErrorView / LoadingView / Skeleton / Progress(2) / Tooltip
- `modal` 신설 3개: Dialog / Toast / BottomSheet (Popup 추가 예정)
- `ModalScreen.tsx` 갤러리 화면 신설 (FeedbackScreen 패턴 일관)
- ADR-10 갱신 (7 카테고리 → 8 카테고리, 컴포넌트 30개)
- `git mv`로 파일 history 보존

### 포기한 옵션

| 옵션 | 사유 |
|------|------|
| feedback 카테고리 유지 (현 상태) | "사용자 피드백"과 "화면 위 모달" 두 의미 혼재 — 카테고리 의미 명확성 부족 |
| `overlay` 카테고리 명칭 | `modal`이 Material Design / iOS HIG에서 더 일반적 용어 |
| modal에 Tooltip 포함 | Tooltip은 anchor 기반 + 짧은 안내 — 전역 호스트 패턴 없음, 모달 본질과 다름 |
| 카테고리 재분류 v2.x 미루기 | Popup(모달 4번째) 추가 진입 전 분리가 자연 — v1.x 일관성 우선 |
| `FeedbackScreen.tsx` 안에 모달 sub-tab 유지 | 갤러리 구조가 카테고리 분리를 반영해야 자연 — `ModalScreen.tsx` 분리가 일관 |

### 근거

**modal 카테고리 공통 패턴**:
- 전역 호스트 (App 루트 1회 마운트)
- Zustand store + imperative API (`open` / `close`)
- Reanimated v4 worklet
- shouldRender state (exit 애니메이션 완료 후 unmount)
- "화면 위에 떠 있는 임시 인터페이스" 시각 패턴

**feedback 잔존 패턴**:
- 상태 / 진행 / 오류 / 안내 / 로딩 표시 (사용자 피드백)
- 인라인 표시 (EmptyState/ErrorView/LoadingView/Skeleton/Progress) 또는 anchor 기반 (Tooltip)
- 전역 호스트 패턴 없음

두 패턴이 본질이 달라 카테고리 분리가 자연. modal 카테고리는 Popup 추가 진입 자연 영역.

### 결과

- 카테고리 의미 명확화: feedback 6 + modal 3 (Popup 추가 시 4)
- 디렉토리 구조 일관: `src/components/modal/`
- 갤러리 구조 일관: `ModalScreen.tsx` 신설, FeedbackScreen 패턴 동일
- ADR-10 갱신: 7 카테고리 → 8 카테고리, 30개 컴포넌트
- import path 영향 좁음 (App.tsx + index.ts + FeedbackScreen + GalleryHomeScreen + RootNavigator)
- 사용자 API 변경 0 (`dialog.confirm` / `toast.show` / `bottomSheet.open` 등 호출 본질 그대로)
- 신규 의존성 0 + 신규 토큰 0
- 인라인 스타일 분류 A 0건 유지
- `git mv`로 파일 history 보존

### v2.x 진화 예정

- Popup 컴포넌트 추가 (modal 4번째) — ADR-32 별도
- 다른 모달성 컴포넌트 (Drawer / Snackbar 등) 추가 영역

---

## ADR-32: Popup 컴포넌트 (중앙 입력 모달)

### 상황

modal 카테고리에 "사용자 입력을 받는 중앙 모달" 영역 부재. `Dialog.prompt`는 단일 string 입력만 (`Promise<string | null>`), BottomSheet는 하단 시트(drag / snap). 다중 입력 컴포넌트(RadioGroup / Checkbox / 다중 Input / Switch)를 자유 배치하는 중앙 모달이 필요.

### 선택

Popup 컴포넌트 신설 — 중앙 표시 + children 완전 자유 + imperative/controlled API.

- **imperative**: `popup.open({ children, onDismiss }) + popup.close()`
- **controlled**: `<Popup visible onDismiss>{children}</Popup>`
- **children 완전 자유** (title / footer prop 없음) — 사용자가 입력 컴포넌트 자유 배치 + state 직접 관리
- **카드**: 중앙 표시 + `max-width: 360`, `corner-radius: 28`, `padding: 24`, `elevation: 4` + safe-area
- **backdrop**: `overlay.scrim` 토큰 + 탭 dismiss
- **애니메이션**: scale 0.95→1 + fade (250ms enter / 200ms exit, Dialog 일관)
- **키보드**: `useAnimatedKeyboard` worklet — 중앙 카드 `-keyboard.height / 2` 보정 (양쪽 여백 자연 분산)
- **PopupHost** (DialogHost 변형 ~70%) + **popupStore** (bottomSheetStore 단순화 ~80%)

```ts
// imperative
popup.open({
  children: (
    <View>
      <Input label="이름" value={name} onChangeText={setName} />
      <RadioGroup value={plan} onValueChange={setPlan}>
        <Radio value="free" label="Free" />
        <Spacer size="md" />
        <Radio value="pro" label="Pro" />
      </RadioGroup>
      <Button label="저장" onPress={() => { save(); popup.close(); }} />
    </View>
  ),
  onDismiss: () => console.log('취소됨'),
});

// controlled
<Popup visible={open} onDismiss={() => setOpen(false)}>
  <FilterForm />
</Popup>
```

### 포기한 옵션

| 옵션 | 사유 |
|------|------|
| Promise API (`await popup.show()`) | children 자유 + 복합 입력이라 결과 타입 정의 부담 — 사용자 state 직접 관리가 자연 (BottomSheet 일관) |
| title / footer prop 강제 | Popup 가치가 자유 콘텐츠 — prop 강제는 유연성 저해 |
| `KeyboardAvoidingView` (Dialog 패턴) | Reanimated v4 worklet 일관(ADR-26 마이그레이션) — `useAnimatedKeyboard` 채택 |
| anchor positioning | v2.x 영역 (중앙 표시가 v1.x 단순) |
| `@react-native-menu/menu` 의존성 | 라이브러리 정체성 (ADR-29 자체 구현 학습) |
| `Dialog.prompt` 확장으로 다중 입력 | 단일 string 한계 — 다중 입력은 별도 컴포넌트가 명확 |

### 근거

- **Dialog.prompt와 차별화**: Dialog.prompt는 단일 string만 — Popup은 다중 입력 / RadioGroup / Checkbox / 자유 콘텐츠
- **BottomSheet와 차별화**: BottomSheet는 하단 시트 + drag/snap — Popup은 중앙 표시 + 입력 위주 (작은~중간 영역)
- **imperative + controlled 둘 다**: BottomSheet 패턴 완전 일관 — `await` 불필요, 사용자가 children에서 state 관리
- **`useAnimatedKeyboard`**: 중앙 카드는 키보드 높이 절반 보정(양쪽 여백 자연 분산) — 하단 기준 BottomSheet clamp와 다른 중앙 기준 보정 패턴
- **호스트 패턴 재사용 ~75%**: PopupHost는 DialogHost(scale+fade + Backdrop + KeyboardAvoidingView를 worklet으로 대체) 변형, popupStore는 bottomSheetStore(snap/drag/currentSnapIndex 제거) 단순화

### 결과

- modal 카테고리 4개 완성 (Dialog / Toast / BottomSheet / Popup)
- 호스트 패턴 재사용 ~75%
- 컴포넌트 30 → 31
- 신규 토큰 0 + 신규 의존성 0
- 갤러리 ModalScreen popup sub-tab — 5 케이스 (RadioGroup / Checkbox / 다중 Input / controlled / onDismiss)
- Checkbox 자체 hit target으로 자연 간격 / Radio는 `<Spacer size="md" />` 명시 (InputScreen 패턴 일관)
- 인라인 스타일 분류 A 0건 유지

### v2.x 진화 예정

- Promise API (복합 결과 정의)
- anchor positioning (특정 원소 기준)
- M3 Menu sub-component (cascading menu)

---

## ADR-34: Light surface 5단 계층 재설계 + Dark destructive WCAG 측정

### 상황

v1.x 보강 단계에서 색상/토큰 영역 2가지 후순위 항목 처리:
1. WCAG Dark destructive 대비 미확인
2. Light surface 5단 계층 invisible + 단계 역행 발견

**Dark destructive WCAG 측정 결과** — 17개 케이스 측정 (Dark 10 + Light 7):

| 측정 영역 | Dark 대비 | Light 대비 | WCAG |
|---|---|---|---|
| Toast error 배경 vs text.primary | 10.6:1 | 17.4:1 | AAA |
| Button/Dialog/Badge destructive (bg + text) | 10.4:1 | 5.4:1 | AAA / AA |
| Input error helper text vs canvas | 10.9:1 | 4.6:1 | AAA / AA |
| ErrorView icon vs canvas | 10.9:1 | 4.6:1 | AAA / UI 3.0 |
| Toast error 배경 vs 아이콘 | 8.2:1 | 4.7:1 | AAA / AA |
| Input error border vs surface.container | 9.3:1 | 5.7:1 | AAA / AA |

모든 케이스 WCAG AA 충족, 대부분 AAA 7:1 이상 — Dark destructive 정정 영역 없음.

**Light surface 문제**:
- `bg.canvas` (`#F8FAFC` L=98) == `surface.containerLow` (`#F8FAFC` L=98) 동일색 → invisible
- surface 5단 명도 순서 역행 (`container` L=100 > `containerLow` L=98) — 단계 의미와 명도 불일치

### 선택

**Dark destructive**: 변경 0 (모든 측정 케이스 WCAG 충족 확인).

**Light surface M3 패턴 완전 적용 + 단계 의미 정합** — 4 토큰 변경:

| 토큰 | 변경 전 | 변경 후 | L 변화 | primitive |
|---|---|---|---|---|
| `bg.canvas` | `#F8FAFC` | `#E2E8F0` | 98 → 92 | slate-50 → slate-200 |
| `surface.dim` | `#F1F5F9` | `#CBD5E1` | 96 → 87 | slate-100 → slate-300 |
| `surface.container` | `#FFFFFF` | `#F1F5F9` | 100 → 96 | white → slate-100 |
| `surface.containerHigh` | `#F1F5F9` | `#E2E8F0` | 96 → 92 | slate-100 → slate-200 |

(`surface.containerLowest` / `surface.containerLow` / `surface.base` / `surface.inverse` / Dark 모드 / primitives / 다른 카테고리 토큰 변경 0)

**새 단계 순서 (점진 어두움)**:
`Lowest(100)` > `Low(98)` > `container(96)` > `High(92)` ≈ `canvas(92)` > `dim(87)`

- `containerLowest` = L=100 (white) — Modal / Card elevation 유지
- `canvas` = L=92 < `container` = L=96 → Card가 canvas 위 분리 가능
- `canvas` = `containerHigh` = L=92 (동일) → Toast는 elevation shadow로 분리

### 포기한 옵션

| 옵션 | 사유 |
|------|------|
| 옵션 B (canvas 유지 + 다른 surface만 변경) | invisible 영역만 정정 — 단계 역행 본문 미해결 |
| 옵션 C (surface 의미 재정의) | M3 의미와 충돌 + 라이브러리 자체 패턴만 |
| 재설계 생략 | 단계 의미 정합 실패 + invisible 미해결 |
| Dark destructive 변경 | 17 케이스 측정 결과 모두 WCAG AA 충족 (정정 영역 없음) |
| 절충 (`container`만 변경, canvas 유지) | container = canvas 충돌 발생 (둘 다 slate-100) |
| `containerHigh` → slate-300 (canvas와 분리 강화) | Toast 시각 검증 통과 — elevation shadow로 충분 분리 |

### 근거

- M3 표준 부합 — canvas + 5단 점진 어두움 패턴
- 단계 의미 정합 — Lowest=가장 밝음, dim 방향 점진 어두움
- canvas(92)와 containerLow(98) 시각 분리 가능 — invisible 본문 해결
- Modal / Card elevation 유지 — `containerLowest` L=100이 canvas L=92보다 8 더 밝음 (강한 시각 분리)
- Tailwind slate 팔레트 일관 — slate-50 / slate-100 / slate-200 / slate-300 (custom hex 0)
- Toast 시각 검증 통과 — `containerHigh` = canvas 동일색이지만 elevation shadow로 분리 충분

### 결과

- Light 모드 4 토큰 hex 변경 (`canvas` + `dim` + `container` + `containerHigh`)
- visual breaking change (사용자 API 변경 0 — 토큰 이름 / 호출 본문 그대로)
- 모든 화면 배경 색상 변경 (`canvas` slate-50 → slate-200)
- `surface.container` 사용 컴포넌트 15+ 시각 영향 (Card / SearchInput / Input / Tooltip / ErrorView / EmptyState / Skeleton / LoadingView / SettingsRow / Chip / DataTable / Dialog / BottomSheetHost / PopupHost / Toast)
- Dark 모드 변경 0 — Dark 시각 인상 완전 동일
- 신규 토큰 0 + 신규 의존성 0
- Figma 동기 별도 단계 (사용자 결정 또는 후속 진행)
- 사용자 시각 검증 6 그룹 15 항목 통과 (점진 검증 패턴)

### v2.x 진화 예정

- State Layer 패턴 도입 (pressed / hover / disabled 일관화 — M3 state layer)
- `surface.containerHighest` 토큰 추가 검토 (현재 4단, M3는 5단)
- 다른 카테고리 색상 재검토 (primary / state 등)
