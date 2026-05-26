// ============================================================================
// BottomSheetHost — BottomSheet 렌더링·애니메이션·드래그·snap 호스트
// ============================================================================
//
// App 루트에 단 1회만 마운트. useBottomSheetStore.isVisible을 구독해 시트의
// enter/exit + drag + snap 이동을 처리. DialogHost 패턴 일관 (전역 호스트 +
// Reanimated v4 + safe-area).
//
// [동작 사양]
// - snapPoints array (각 element: 'auto' / '50%' / number)
// - snap 사이 drag 이동 — handle bar 영역만 활성, 콘텐츠 영역은 자유
//   (RNGH ScrollView 등 scrollable 콘텐츠 자유 wrap 가능)
// - drag dismiss: 가장 낮은 snap에서 추가 거리 30% 또는 velocity > 500px/s
// - snap 선택: velocity > 500 시 projection (0.15s), 그 외 가장 가까운 snap
// - enter / snap 이동 / drag cancel: withTiming(250ms, Easing.out(Easing.cubic))
// - exit: withTiming(200ms, Easing.in(Easing.cubic)) + 콜백 setShouldRender(false)
// - 백드롭 fade 200ms (overlay.scrim 토큰)
// - BackHandler(Android) 자동 dismiss
// - safe-area 하단 inset 자동 적용
// ============================================================================

import { useEffect, useMemo, useState } from 'react';
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

import {
  useBottomSheetStore,
  type BottomSheetSnap,
} from '@/stores/bottomSheetStore';

const ENTER_DURATION = 250;
const EXIT_DURATION = 200;
const BACKDROP_DURATION = 200;
const ENTER_EASING = Easing.out(Easing.cubic); // M3 emphasized decelerate
const EXIT_EASING = Easing.in(Easing.cubic); // M3 emphasized accelerate
const DRAG_DISTANCE_THRESHOLD = 0.3;
const DRAG_VELOCITY_THRESHOLD = 500; // px/s
const SNAP_PROJECTION_TIME = 0.15; // s

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

const HandleArea = styled.View`
  align-items: center;
  padding-top: 12px;
  padding-bottom: 12px;
`;

const HandleBar = styled.View`
  width: 32px;
  height: 4px;
  border-radius: 2px;
  background-color: ${({ theme }) => theme.colors.border.default};
`;

const Content = styled.View`
  padding-left: 16px;
  padding-right: 16px;
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

function resolveSnapHeight(
  snap: BottomSheetSnap,
  screenHeight: number,
): number {
  if (typeof snap === 'number') return snap;
  if (snap === 'auto') return screenHeight * 0.5;
  // '50%' 형식 문자열
  const percent = parseFloat(snap) / 100;
  return screenHeight * percent;
}

export default function BottomSheetHost() {
  const isVisible = useBottomSheetStore(s => s.isVisible);
  const snapPoints = useBottomSheetStore(s => s.snapPoints);
  const currentSnapIndex = useBottomSheetStore(s => s.currentSnapIndex);
  const children = useBottomSheetStore(s => s.children);
  const close = useBottomSheetStore(s => s.close);
  const setCurrentSnapIndex = useBottomSheetStore(s => s.setCurrentSnapIndex);
  const insets = useSafeAreaInsets();
  const { height: screenHeight } = useWindowDimensions();

  // snap별 픽셀 높이 + Sheet 전체 height + 각 snap의 translateY 사전 계산
  const { snapTranslateYs, totalHeight, maxSnapTranslateY } = useMemo(() => {
    const heights = snapPoints.map(s => resolveSnapHeight(s, screenHeight));
    const maxHeight = Math.max(...heights);
    const translateYs = heights.map(h => maxHeight - h);
    return {
      snapTranslateYs: translateYs,
      totalHeight: maxHeight + insets.bottom,
      maxSnapTranslateY: Math.max(...translateYs), // 가장 낮은 snap의 translateY
    };
  }, [snapPoints, screenHeight, insets.bottom]);

  // shouldRender — exit 애니메이션 완료 후에만 unmount
  const [shouldRender, setShouldRender] = useState(false);

  // closed 상태 = translateY가 totalHeight (화면 밖 아래)
  const translateY = useSharedValue(totalHeight);
  const backdropOpacity = useSharedValue(0);

  // open / close 애니메이션
  useEffect(() => {
    if (isVisible) {
      setShouldRender(true);
      translateY.value = totalHeight;
      const targetY = snapTranslateYs[currentSnapIndex] ?? 0;
      translateY.value = withTiming(targetY, {
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

  // 외부 snapTo 또는 currentSnapIndex 변경 → withTiming 이동
  useEffect(() => {
    if (!isVisible) return;
    const targetY = snapTranslateYs[currentSnapIndex];
    if (targetY === undefined) return;
    translateY.value = withTiming(targetY, {
      duration: ENTER_DURATION,
      easing: ENTER_EASING,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSnapIndex]);

  // BackHandler (Android)
  useEffect(() => {
    if (!isVisible) return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      close();
      return true;
    });
    return () => sub.remove();
  }, [isVisible, close]);

  // drag 제스처 — handle bar 영역만 활성
  const panGesture = useMemo(
    () =>
      Gesture.Pan()
        .onUpdate(e => {
          'worklet';
          const baseY = snapTranslateYs[currentSnapIndex];
          if (baseY === undefined) return;
          const next = baseY + e.translationY;
          // 가장 큰 snap (translateY 0)보다 위로는 못 감
          if (next < 0) return;
          translateY.value = next;
        })
        .onEnd(e => {
          'worklet';
          const current = translateY.value;
          const velocity = e.velocityY;

          // dismiss 판정: 가장 낮은 snap에서 추가 거리 30% 또는 velocity 임계값 초과
          const extraDrag = current - maxSnapTranslateY;
          const dismissDistance =
            (totalHeight - maxSnapTranslateY) * DRAG_DISTANCE_THRESHOLD;
          if (
            extraDrag > dismissDistance ||
            (current > maxSnapTranslateY && velocity > DRAG_VELOCITY_THRESHOLD)
          ) {
            runOnJS(close)();
            return;
          }

          // snap 선택 — velocity 임계값 초과 시 projection 후 가장 가까운 snap
          const target =
            Math.abs(velocity) > DRAG_VELOCITY_THRESHOLD
              ? current + velocity * SNAP_PROJECTION_TIME
              : current;

          let nearestIndex = 0;
          let minDist = Math.abs(snapTranslateYs[0] - target);
          for (let i = 1; i < snapTranslateYs.length; i++) {
            const d = Math.abs(snapTranslateYs[i] - target);
            if (d < minDist) {
              minDist = d;
              nearestIndex = i;
            }
          }

          translateY.value = withTiming(snapTranslateYs[nearestIndex], {
            duration: ENTER_DURATION,
            easing: ENTER_EASING,
          });
          runOnJS(setCurrentSnapIndex)(nearestIndex);
        }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [snapTranslateYs, maxSnapTranslateY, totalHeight, currentSnapIndex],
  );

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
      <Sheet style={sheetStyle} accessibilityViewIsModal>
        <GestureDetector gesture={panGesture}>
          <HandleArea>
            <HandleBar />
          </HandleArea>
        </GestureDetector>
        <Content style={{ paddingBottom: 24 + insets.bottom }}>
          {children}
        </Content>
      </Sheet>
    </>
  );
}
