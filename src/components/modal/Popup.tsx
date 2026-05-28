// ============================================================================
// Popup — 중앙 표시 입력 모달 (controlled mode wrapper)
// ============================================================================
//
// 전역 호스트(PopupHost) 기반 — App 루트에 PopupHost를 1회 마운트 후 사용.
// 본 컴포넌트는 visible prop으로 store를 제어하는 controlled wrapper.
// imperative API는 `popup.open / close` 사용 (BottomSheet 패턴 일관).
//
// Dialog와 차별화: Dialog.prompt는 단일 string 입력만 제공. Popup은 children
// 자유 — 다중 Input / RadioGroup / Checkbox / Switch 등 입력 컴포넌트를
// 자유 배치하여 form 구성 가능.
//
// 사용 예 (controlled):
//   const [visible, setVisible] = useState(false);
//   <Popup visible={visible} onDismiss={() => setVisible(false)}>
//     <Text variant="headlineSm">필터 설정</Text>
//     <RadioGroup value={sort} onValueChange={setSort}>
//       <Radio value="recent" label="최신순" />
//       <Radio value="popular" label="인기순" />
//     </RadioGroup>
//     <Button label="적용" onPress={() => { apply(); setVisible(false); }} />
//   </Popup>
//
// 사용 예 (imperative):
//   import { popup } from '@/stores/popupStore';
//   popup.open({
//     children: <FilterForm onApply={() => popup.close()} />,
//     onDismiss: () => saveDraft(),
//   });
// ============================================================================

import { useEffect } from 'react';
import type { ReactNode } from 'react';

import { usePopupStore } from '@/stores/popupStore';

export interface PopupProps {
  /** Popup 표시 상태 — 외부에서 제어. */
  visible: boolean;
  /** dismiss 시 호출 (백드롭 탭 / API close / BackHandler). */
  onDismiss: () => void;
  /** Popup 카드 안 콘텐츠 (자유). */
  children: ReactNode;
}

/**
 * Popup — controlled 모드 wrapper.
 *
 * 실제 렌더링은 App 루트의 `<PopupHost />`가 담당. 본 컴포넌트는 visible
 * prop을 store에 동기화하는 역할.
 */
function Popup({ visible, onDismiss, children }: PopupProps) {
  useEffect(() => {
    if (visible) {
      usePopupStore.getState().open({ children, onDismiss });
    } else {
      const store = usePopupStore.getState();
      if (store.isVisible) {
        usePopupStore.setState({
          isVisible: false,
          children: null,
          onDismiss: undefined,
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  useEffect(() => {
    if (!visible) return;
    usePopupStore.setState({ children });
  }, [visible, children]);

  return null;
}

export default Popup;
