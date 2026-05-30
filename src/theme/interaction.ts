// ============================================================================
// LottoStats interaction 토큰 — interactive 컴포넌트 state opacity (mode 무관)
// ============================================================================
//
// pressed / disabled는 즉시 적용. hover / focus는 후속 RN-Web 호환 진입 시점
// 도입 예약 — 본 토큰만 정의해두고 사용 0.
//
// 사용 예) opacity: ${({ theme }) => theme.interaction.pressedOpacity}
//
// 값 본문:
//   hoverOpacity   0.08  // M3 hover state layer (8%) — RN-Web 호환 시점 활용
//   focusOpacity   0.10  // M3 focus state layer (10%) — RN-Web 호환 시점 활용
//   pressedOpacity 0.70  // 단순 alpha 패턴 (Button/Chip/Tabs/Switch 등 다수 일관)
//   disabledOpacity 0.50 // 단순 alpha 패턴 (FAB/Chip/Switch/Checkbox/Radio 등 다수 일관)
//
// M3 표준(pressed 0.10 / disabled content 0.38)은 별도 overlay layer 패턴 전용
// — 단순 alpha 적용 시 시각 변화 약하거나 과도. 본 라이브러리는 단순 alpha
// 패턴 일관. M3 overlay 패턴은 후속 StateLayer 컴포넌트 도입 시 적용.
// ============================================================================

export const interaction = {
  hoverOpacity: 0.08,
  focusOpacity: 0.10,
  pressedOpacity: 0.70,
  disabledOpacity: 0.50,
} as const;

export type Interaction = typeof interaction;
