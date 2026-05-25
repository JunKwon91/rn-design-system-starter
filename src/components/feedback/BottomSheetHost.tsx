// ============================================================================
// BottomSheetHost — 단일 BottomSheet 렌더링·애니메이션·드래그 호스트
// ============================================================================
//
// App 루트에 단 1회만 마운트. useBottomSheetStore.isVisible을 구독해 시트의
// enter/exit + drag dismiss를 처리. DialogHost 패턴 일관 (전역 호스트 +
// Reanimated v4 + safe-area).
//
// [동작 사양 — 사이클 5.1]
// - 단일 snap 높이 (height prop: 'auto' / '50%' / number)
// - drag dismiss 임계값: drag 거리 > sheetHeight × 0.3 또는 velocity > 500px/s
// - enter: spring (Reanimated default), exit: withTiming 150ms
// - 백드롭 fade 200ms (DialogHost와 같은 토큰 — overlay.scrim)
// - BackHandler(Android) 자동 dismiss
// - safe-area 하단 inset 자동 적용
//
// [사이클 5.2·5.3 확장 예정]
// - 다중 snap points
// - BottomSheetScrollView (drag + scroll 양립)
// - 키보드 정밀 보정
// ============================================================================

import { useEffect, useState } from 'react';
import {
  BackHandler,
  Pressable,
  useWindowDimensions,
} from 'react-native';
import {
  Gesture,
  GestureDetector,
} from 'react-native-gesture-handler';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import styled from 'styled-components/native';

import { useBottomSheetStore, type BottomSheetHeight } from '@/stores/bottomSheetStore';

const ENTER_DURATION = 250;
const EXIT_DURATION = 200;
const BACKDROP_DURATION = 200;
const ENTER_EASING = Easing.out(Easing.cubic); // M3 emphasized decelerate
const EXIT_EASING = Easing.in(Easing.cubic); // M3 emphasized accelerate
const DRAG_DISTANCE_THRESHOLD = 0.3; // sheetHeight의 30%
const DRAG_VELOCITY_THRESHOLD = 500; // px/s

const Backdrop = styled(Animated.View)`
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  background-color: ${({ theme }) => theme.colors.overlay.scrim};
`;

const Sheet = styled(Animated.View)`
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: ${({ theme }) => theme.colors.surface.container};
  border-top-left-radius: 28px;
  border-top-right-radius: 28px;
  shadow-color: #000;
  shadow-offset: 0px -2px;
  shadow-opacity: 0.18;
  shadow-radius: 6px;
  elevation: 3;
`;

const Handle = styled.View`
  width: 32px;
  height: 4px;
  border-radius: 2px;
  background-color: ${({ theme }) => theme.colors.border.default};
  align-self: center;
  margin-top: 12px;
`;

const Content = styled.View`
  padding-left: 16px;
  padding-right: 16px;
  padding-top: 24px;
  padding-bottom: 24px;
  flex-shrink: 1;
`;

const BackdropPressable = styled(Pressable)`
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
`;

function resolveSheetHeight(
  height: BottomSheetHeight,
  screenHeight: number,
): number {
  if (typeof height === 'number') return height;
  if (height === 'auto') return screenHeight * 0.5;
  // '50%' 형식 문자열
  const percent = parseFloat(height) / 100;
  return screenHeight * percent;
}

export default function BottomSheetHost() {
  const isVisible = useBottomSheetStore(s => s.isVisible);
  const height = useBottomSheetStore(s => s.height);
  const children = useBottomSheetStore(s => s.children);
  const close = useBottomSheetStore(s => s.close);
  const insets = useSafeAreaInsets();
  const { height: screenHeight } = useWindowDimensions();

  const sheetHeight = resolveSheetHeight(height, screenHeight);
  const totalHeight = sheetHeight + insets.bottom;

  // shouldRender — exit 애니메이션이 완료된 후에만 unmount (DialogHost 본질 일관).
  // isVisible로 unmount 하면 exit 애니메이션 시작 즉시 트리에서 사라져 보이지 않음.
  const [shouldRender, setShouldRender] = useState(false);

  // closed 상태 = translateY가 totalHeight (화면 밖 아래)
  const translateY = useSharedValue(totalHeight);
  const backdropOpacity = useSharedValue(0);

  // open/close 애니메이션 — slide 자연 (M3 emphasized easing, overshoot 0)
  useEffect(() => {
    if (isVisible) {
      setShouldRender(true);
      // 시작 위치 재설정 — totalHeight 변경 또는 재오픈 케이스 대응
      translateY.value = totalHeight;
      translateY.value = withTiming(0, {
        duration: ENTER_DURATION,
        easing: ENTER_EASING,
      });
      backdropOpacity.value = withTiming(1, { duration: BACKDROP_DURATION });
    } else if (shouldRender) {
      backdropOpacity.value = withTiming(0, { duration: EXIT_DURATION });
      translateY.value = withTiming(
        totalHeight,
        { duration: EXIT_DURATION, easing: EXIT_EASING },
        finished => {
          'worklet';
          if (finished) {
            runOnJS(setShouldRender)(false);
          }
        },
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVisible]);

  // BackHandler (Android) — 시트 열려있으면 close
  useEffect(() => {
    if (!isVisible) return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      close();
      return true;
    });
    return () => sub.remove();
  }, [isVisible, close]);

  // drag 제스처
  const panGesture = Gesture.Pan()
    .onUpdate(e => {
      if (e.translationY > 0) {
        translateY.value = e.translationY;
      }
    })
    .onEnd(e => {
      const shouldDismiss =
        e.translationY > sheetHeight * DRAG_DISTANCE_THRESHOLD ||
        e.velocityY > DRAG_VELOCITY_THRESHOLD;
      if (shouldDismiss) {
        runOnJS(close)();
      } else {
        // drag cancel 복귀 — timing 일관 (spring overshoot 제거)
        translateY.value = withTiming(0, {
          duration: ENTER_DURATION,
          easing: ENTER_EASING,
        });
      }
    });

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const sheetStyle = useAnimatedStyle(() => ({
    height: totalHeight,
    transform: [{ translateY: translateY.value }],
  }));

  if (!shouldRender) return null;

  return (
    <>
      <Backdrop style={backdropStyle} pointerEvents="auto">
        <BackdropPressable onPress={close} accessibilityLabel="시트 닫기" />
      </Backdrop>
      <GestureDetector gesture={panGesture}>
        <Sheet style={sheetStyle} accessibilityViewIsModal>
          <Handle />
          <Content style={{ paddingBottom: 24 + insets.bottom }}>
            {children}
          </Content>
        </Sheet>
      </GestureDetector>
    </>
  );
}
