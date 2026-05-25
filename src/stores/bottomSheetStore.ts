// ============================================================================
// bottomSheetStore — BottomSheet 전역 표시 상태 (Zustand)
// ============================================================================
//
// 한 번에 1개의 BottomSheet만 표시. 사이클 5.1 사양은 단일 snap 높이
// (동적 prop) — 다중 snap / scrollable / 키보드 정밀은 사이클 5.2·5.3 도입.
// DialogHost 패턴 일관 (전역 호스트 + imperative API + controlled mode).
//
// 사용 예 (imperative):
//   bottomSheet.open({
//     children: <Text>내용</Text>,
//     height: '50%',
//     onDismiss: () => console.log('닫힘'),
//   });
//   bottomSheet.close();
//
// 사용 예 (controlled):
//   <BottomSheet visible={visible} onDismiss={() => setVisible(false)} height={400}>
//     <Text>내용</Text>
//   </BottomSheet>
// ============================================================================

import type { ReactNode } from 'react';
import { create } from 'zustand';

/** 시트 높이 — 'auto'(default 50%) / 백분율 문자열('50%') / 픽셀 숫자. */
export type BottomSheetHeight = 'auto' | `${number}%` | number;

export interface BottomSheetConfig {
  /** 시트 안 콘텐츠. */
  children: ReactNode;
  /** 시트 높이. @default 'auto' (화면의 50%) */
  height?: BottomSheetHeight;
  /** 사용자 dismiss 시 호출 (swipe / 백드롭 / API close). */
  onDismiss?: () => void;
}

interface BottomSheetStore {
  isVisible: boolean;
  height: BottomSheetHeight;
  children: ReactNode;
  onDismiss: (() => void) | undefined;

  open: (config: BottomSheetConfig) => void;
  /** 시트 닫기 + onDismiss 콜백 호출. */
  close: () => void;
}

export const useBottomSheetStore = create<BottomSheetStore>(set => ({
  isVisible: false,
  height: 'auto',
  children: null,
  onDismiss: undefined,

  open: config =>
    set({
      isVisible: true,
      height: config.height ?? 'auto',
      children: config.children,
      onDismiss: config.onDismiss,
    }),

  close: () =>
    set(state => {
      state.onDismiss?.();
      return {
        isVisible: false,
        children: null,
        onDismiss: undefined,
      };
    }),
}));

/**
 * React 외부에서도 호출 가능한 편의 헬퍼 (DialogHost `dialog` 패턴 일관).
 *
 * @example
 *   bottomSheet.open({
 *     height: '50%',
 *     children: <SettingsForm />,
 *     onDismiss: () => saveDraft(),
 *   });
 */
export const bottomSheet = {
  open: (config: BottomSheetConfig) =>
    useBottomSheetStore.getState().open(config),
  close: () => useBottomSheetStore.getState().close(),
};
