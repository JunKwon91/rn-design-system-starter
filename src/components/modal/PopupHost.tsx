// ============================================================================
// PopupHost — 중앙 표시 Popup 렌더링·애니메이션·키보드 호스트
// ============================================================================
//
// App 루트에 단 1회만 마운트. usePopupStore.isVisible을 구독해 Popup enter /
// exit + 키보드 양립을 처리. DialogHost 패턴 변형 (scale + fade) + 사이클 5.3
// BottomSheet useAnimatedKeyboard worklet 패턴.
//
// [동작 사양]
// - Backdrop (overlay.scrim) + 탭 dismiss
// - 중앙 카드 (max-width 360, corner-radius 28, padding 24, elevation 4)
// - enter: scale 0.95→1 + fade 0→1 (250ms, Easing.out(Easing.cubic))
// - exit: scale 1→0.95 + fade 1→0 (200ms, Easing.in(Easing.cubic))
// - shouldRender state (exit 애니메이션 완료 후 unmount)
// - BackHandler (Android) 자동 dismiss
// - useAnimatedKeyboard worklet — 키보드 출현 시 카드가 키보드 위로 이동
//   (중앙 기준: -keyboard.height / 2 만큼 위로 — 양쪽 여백 분산)
// ============================================================================

import { useEffect, useState } from 'react';
import { BackHandler, Pressable } from 'react-native';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedKeyboard,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import styled from 'styled-components/native';

import { usePopupStore } from '@/stores/popupStore';

const ENTER_DURATION = 250;
const EXIT_DURATION = 200;
const BACKDROP_DURATION = 200;
const ENTER_EASING = Easing.out(Easing.cubic);
const EXIT_EASING = Easing.in(Easing.cubic);

const Backdrop = styled(Animated.View)`
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  background-color: ${({ theme }) => theme.colors.overlay.scrim};
`;

const BackdropPressable = styled(Pressable)`
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
`;

const Center = styled(Animated.View)`
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  align-items: center;
  justify-content: center;
  padding-left: 16px;
  padding-right: 16px;
`;

const Card = styled(Animated.View)`
  width: 100%;
  max-width: 360px;
  background-color: ${({ theme }) => theme.colors.surface.container};
  border-radius: 28px;
  padding: 24px;
  shadow-color: #000;
  shadow-offset: 0px 4px;
  shadow-opacity: 0.18;
  shadow-radius: 12px;
  elevation: 4;
`;

export default function PopupHost() {
  const isVisible = usePopupStore(s => s.isVisible);
  const children = usePopupStore(s => s.children);
  const close = usePopupStore(s => s.close);
  const keyboard = useAnimatedKeyboard();

  const [shouldRender, setShouldRender] = useState(false);

  const backdropOpacity = useSharedValue(0);
  const cardOpacity = useSharedValue(0);
  const cardScale = useSharedValue(0.95);

  useEffect(() => {
    if (isVisible) {
      setShouldRender(true);
      backdropOpacity.value = withTiming(1, { duration: BACKDROP_DURATION });
      cardOpacity.value = withTiming(1, {
        duration: ENTER_DURATION,
        easing: ENTER_EASING,
      });
      cardScale.value = withTiming(1, {
        duration: ENTER_DURATION,
        easing: ENTER_EASING,
      });
    } else if (shouldRender) {
      backdropOpacity.value = withTiming(0, { duration: EXIT_DURATION });
      cardScale.value = withTiming(0.95, {
        duration: EXIT_DURATION,
        easing: EXIT_EASING,
      });
      cardOpacity.value = withTiming(
        0,
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

  useEffect(() => {
    if (!isVisible) return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      close();
      return true;
    });
    return () => sub.remove();
  }, [isVisible, close]);

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  // 키보드 양립 — 중앙 카드를 키보드 출현 시 위로 이동.
  // 중앙 기준이라 keyboard.height / 2 만큼 위로 이동하면 양쪽 여백이 자연 분산.
  const centerStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: -keyboard.height.value / 2 }],
  }));

  const cardStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
    transform: [{ scale: cardScale.value }],
  }));

  if (!shouldRender) return null;

  return (
    <>
      <Backdrop style={backdropStyle}>
        <BackdropPressable onPress={close} accessibilityLabel="팝업 닫기" />
      </Backdrop>
      <Center style={centerStyle} pointerEvents="box-none">
        <Card style={cardStyle} accessibilityViewIsModal>
          {children}
        </Card>
      </Center>
    </>
  );
}
