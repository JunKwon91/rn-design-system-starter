// ============================================================================
// BottomSheet — Material 3 Modal Bottom Sheet (controlled mode)
// ============================================================================
//
// 전역 호스트(BottomSheetHost) 기반 — App 루트에 BottomSheetHost를 1회 마운트
// 후 사용. 본 컴포넌트는 visible prop으로 store를 제어하는 controlled wrapper.
// imperative API는 `bottomSheet.open / close / snapTo` 사용 (DialogHost 패턴 일관).
//
// 사용 예 (controlled · 단일 snap):
//   const [visible, setVisible] = useState(false);
//   <BottomSheet visible={visible} onDismiss={() => setVisible(false)} height="50%">
//     <Text>메뉴</Text>
//   </BottomSheet>
//
// 사용 예 (controlled · 다중 snap):
//   <BottomSheet
//     visible={visible}
//     onDismiss={() => setVisible(false)}
//     snapPoints={['25%', '50%', '90%']}
//     initialSnap={1}
//     onSnapChange={index => console.log('snap', index)}
//   >
//     <ScrollView>{/* RNGH ScrollView */}</ScrollView>
//   </BottomSheet>
//
// [동작 사양]
// - 단일 snap (height) 또는 다중 snap (snapPoints) — snapPoints 우선
// - drag dismiss (가장 낮은 snap에서 추가 30% 또는 velocity > 500px/s)
// - 다중 snap 시 snap 사이 drag 이동 + velocity projection snap 선택
// - drag activation: handle bar 영역만 (콘텐츠 영역은 ScrollView 등 자유)
// - 백드롭 탭 + BackHandler(Android) 모두 dismiss
// - safe-area 자동 / 키보드 정밀 보정은 후속 작업
// ============================================================================

import { useEffect } from 'react';
import type { ReactNode } from 'react';

import {
  useBottomSheetStore,
  type BottomSheetSnap,
} from '@/stores/bottomSheetStore';

export interface BottomSheetProps {
  /** 시트 표시 상태 — 외부에서 제어. */
  visible: boolean;
  /** 시트 dismiss 시 호출 (swipe / 백드롭 / API close / BackHandler). */
  onDismiss: () => void;
  /**
   * 단일 snap 높이. snapPoints 미지정 시 사용.
   * @default 'auto' (화면의 50%)
   */
  height?: BottomSheetSnap;
  /** 다중 snap 배열. 지정 시 height 무시. */
  snapPoints?: BottomSheetSnap[];
  /** 초기 snap 인덱스 (snapPoints 기준). @default 0 */
  initialSnap?: number;
  /** snap 변경 시 호출 (drag / snapTo 양쪽 모두). */
  onSnapChange?: (index: number) => void;
  /** 시트 안 콘텐츠. */
  children: ReactNode;
}

/**
 * BottomSheet — controlled 모드 wrapper.
 *
 * 실제 렌더링은 App 루트의 `<BottomSheetHost />`가 담당. 본 컴포넌트는
 * visible prop을 store에 동기화하는 역할.
 */
function BottomSheet({
  visible,
  onDismiss,
  height,
  snapPoints,
  initialSnap,
  onSnapChange,
  children,
}: BottomSheetProps) {
  useEffect(() => {
    if (visible) {
      useBottomSheetStore.getState().open({
        children,
        height,
        snapPoints,
        initialSnap,
        onDismiss,
        onSnapChange,
      });
    } else {
      // 외부 visible이 false로 바뀌면 시트도 닫기 — onDismiss 중복 호출 방지 위해 store 직접 갱신
      const store = useBottomSheetStore.getState();
      if (store.isVisible) {
        useBottomSheetStore.setState({
          isVisible: false,
          children: null,
          onDismiss: undefined,
          onSnapChange: undefined,
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  // children 변경 시 store 갱신 (open 상태일 때)
  useEffect(() => {
    if (!visible) return;
    useBottomSheetStore.setState({ children });
  }, [visible, children]);

  return null;
}

export default BottomSheet;
