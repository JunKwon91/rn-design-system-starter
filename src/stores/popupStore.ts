// ============================================================================
// popupStore — Popup 전역 표시 상태 (Zustand)
// ============================================================================
//
// 한 번에 1개의 Popup만 표시 (queue 없음). bottomSheetStore 단순화 — snap /
// drag / currentSnapIndex 제거. children 완전 자유 + onDismiss 콜백.
//
// 사용 예 (imperative):
//   popup.open({
//     children: (
//       <View>
//         <Input label="이름" value={name} onChangeText={setName} />
//         <Button label="저장" onPress={() => { save(name); popup.close(); }} />
//       </View>
//     ),
//     onDismiss: () => console.log('취소됨'),
//   });
//   popup.close();
//
// 사용 예 (controlled):
//   <Popup visible={visible} onDismiss={() => setVisible(false)}>
//     <Text>내용</Text>
//   </Popup>
// ============================================================================

import type { ReactNode } from 'react';
import { create } from 'zustand';

export interface PopupConfig {
  /** Popup 카드 안 콘텐츠 (자유). */
  children: ReactNode;
  /** 사용자 dismiss 시 호출 (백드롭 탭 / API close / BackHandler). */
  onDismiss?: () => void;
}

interface PopupStore {
  isVisible: boolean;
  children: ReactNode;
  onDismiss: (() => void) | undefined;

  open: (config: PopupConfig) => void;
  /** Popup 닫기 + onDismiss 콜백 호출. */
  close: () => void;
}

export const usePopupStore = create<PopupStore>(set => ({
  isVisible: false,
  children: null,
  onDismiss: undefined,

  open: config =>
    set({
      isVisible: true,
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
 * React 외부에서도 호출 가능한 편의 헬퍼 (DialogHost / BottomSheet 패턴 일관).
 *
 * @example
 *   popup.open({
 *     children: <FilterForm />,
 *     onDismiss: () => saveDraft(),
 *   });
 */
export const popup = {
  open: (config: PopupConfig) => usePopupStore.getState().open(config),
  close: () => usePopupStore.getState().close(),
};
