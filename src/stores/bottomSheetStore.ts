// ============================================================================
// bottomSheetStore — BottomSheet 전역 표시 상태 (Zustand)
// ============================================================================
//
// 한 번에 1개의 BottomSheet만 표시. DialogHost 패턴 일관 (전역 호스트 +
// imperative API + controlled mode).
//
// 사용 예 (imperative · 단일 snap):
//   bottomSheet.open({
//     children: <Text>내용</Text>,
//     height: '50%',
//     onDismiss: () => console.log('닫힘'),
//   });
//
// 사용 예 (imperative · 다중 snap):
//   bottomSheet.open({
//     children: <ScrollView>...</ScrollView>,
//     snapPoints: ['25%', '50%', '90%'],
//     initialSnap: 1,
//     onSnapChange: index => console.log('snap', index),
//   });
//   bottomSheet.snapTo(2);   // 90%로 이동
//   bottomSheet.close();
//
// 사용 예 (controlled):
//   <BottomSheet
//     visible={visible}
//     onDismiss={() => setVisible(false)}
//     snapPoints={['25%', '50%', '90%']}
//   >
//     <Text>내용</Text>
//   </BottomSheet>
// ============================================================================

import type { ReactNode } from 'react';
import { create } from 'zustand';

/** snap 한 지점의 높이 — 'auto'(default 50%) / 백분율 문자열('50%') / 픽셀 숫자. */
export type BottomSheetSnap = 'auto' | `${number}%` | number;

export interface BottomSheetConfig {
  /** 시트 안 콘텐츠. */
  children: ReactNode;
  /** 단일 snap 높이. snapPoints 미지정 시 사용. @default 'auto' (화면의 50%) */
  height?: BottomSheetSnap;
  /** 다중 snap 배열. 지정 시 height 무시. */
  snapPoints?: BottomSheetSnap[];
  /** 초기 snap 인덱스 (snapPoints 기준). @default 0 */
  initialSnap?: number;
  /** 사용자 dismiss 시 호출 (swipe / 백드롭 / API close). */
  onDismiss?: () => void;
  /** snap 변경 시 호출 (drag / snapTo 양쪽 모두). */
  onSnapChange?: (index: number) => void;
}

interface BottomSheetStore {
  isVisible: boolean;
  snapPoints: BottomSheetSnap[];
  currentSnapIndex: number;
  children: ReactNode;
  onDismiss: (() => void) | undefined;
  onSnapChange: ((index: number) => void) | undefined;

  open: (config: BottomSheetConfig) => void;
  /** 시트 닫기 + onDismiss 콜백 호출. */
  close: () => void;
  /** 특정 snap 인덱스로 이동 (외부 API). 범위 밖이면 무시. */
  snapTo: (index: number) => void;
  /** 내부 — BottomSheetHost가 drag end 후 호출. onSnapChange 트리거. */
  setCurrentSnapIndex: (index: number) => void;
}

export const useBottomSheetStore = create<BottomSheetStore>((set, get) => ({
  isVisible: false,
  snapPoints: ['auto'],
  currentSnapIndex: 0,
  children: null,
  onDismiss: undefined,
  onSnapChange: undefined,

  open: config => {
    if (__DEV__ && config.height !== undefined && config.snapPoints !== undefined) {
      console.warn(
        '[BottomSheet] height와 snapPoints 동시 지정 — snapPoints 우선',
      );
    }
    const snapPoints = config.snapPoints ?? [config.height ?? 'auto'];
    const requestedSnap = config.initialSnap ?? 0;
    const initialSnap = Math.max(
      0,
      Math.min(requestedSnap, snapPoints.length - 1),
    );
    set({
      isVisible: true,
      snapPoints,
      currentSnapIndex: initialSnap,
      children: config.children,
      onDismiss: config.onDismiss,
      onSnapChange: config.onSnapChange,
    });
  },

  close: () =>
    set(state => {
      state.onDismiss?.();
      return {
        isVisible: false,
        children: null,
        onDismiss: undefined,
        onSnapChange: undefined,
      };
    }),

  snapTo: index => {
    const state = get();
    if (index < 0 || index >= state.snapPoints.length) return;
    if (state.currentSnapIndex === index) return;
    set({ currentSnapIndex: index });
    state.onSnapChange?.(index);
  },

  setCurrentSnapIndex: index => {
    const state = get();
    if (state.currentSnapIndex === index) return;
    set({ currentSnapIndex: index });
    state.onSnapChange?.(index);
  },
}));

/**
 * React 외부에서도 호출 가능한 편의 헬퍼 (DialogHost `dialog` 패턴 일관).
 *
 * @example
 *   bottomSheet.open({
 *     snapPoints: ['25%', '50%', '90%'],
 *     initialSnap: 1,
 *     children: <Form />,
 *   });
 *   bottomSheet.snapTo(2);
 */
export const bottomSheet = {
  open: (config: BottomSheetConfig) =>
    useBottomSheetStore.getState().open(config),
  close: () => useBottomSheetStore.getState().close(),
  snapTo: (index: number) => useBottomSheetStore.getState().snapTo(index),
};
