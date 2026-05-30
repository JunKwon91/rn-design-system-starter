// ============================================================================
// LottoStats interaction 토큰 — interactive 컴포넌트 state opacity (mode 무관)
// ============================================================================
//
// 사용 예) opacity: ${({ theme }) => theme.interaction.pressedOpacity}
//
// 값 본문:
//   pressedOpacity 0.70  // 단순 alpha 패턴 (Button/Chip/Tabs/Switch 등 다수 일관)
//   disabledOpacity 0.50 // 단순 alpha 패턴 (FAB/Chip/Switch/Checkbox/Radio 등 다수 일관)
// ============================================================================

export const interaction = {
  pressedOpacity: 0.70,
  disabledOpacity: 0.50,
} as const;

export type Interaction = typeof interaction;
