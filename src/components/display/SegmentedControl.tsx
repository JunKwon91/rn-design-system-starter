// ============================================================================
// SegmentedControl — 분절 선택 컨트롤 (M3 Segmented Button)
// ============================================================================
//
// 2~N개의 옵션 중 하나를 선택하는 가로 분절 컨트롤. 활성 indicator가 200ms
// 슬라이드 transition으로 부드럽게 이동한다. Generic<T>로 value 타입을 좁힐
// 수 있어 호출처가 잘못된 value를 넘기면 컴파일 시점에 잡힌다.
//
// 사용 예:
//   type SortValue = 'newest' | 'oldest';
//   const [sort, setSort] = useState<SortValue>('newest');
//   <SegmentedControl
//     segments={[
//       { value: 'newest', label: '최신순' },
//       { value: 'oldest', label: '오래된순' },
//     ]}
//     value={sort}
//     onChange={setSort}
//   />
//
// [디자인 토큰 — M3 Segmented Button]
// 컨테이너: height 36, borderRadius 18 (pillbox), 1.5px border.strong,
//   bg transparent, overflow hidden (active indicator + segments 모두 외곽
//   cornerRadius에 자동 clip)
// Indicator (Reanimated absolute):
//   position absolute, top -1.5 (border 영역 침범 + outer clip 처리로 외곽
//     stroke 안쪽까지 fill — visible padding 0)
//   height 36 (외곽 height와 동일, border 영역 침범)
//   left + width useSharedValue (200ms timing, Easing.inOut(Easing.ease))
//   bg primary.action
// 각 세그먼트: flex 1, height 36, margin-vertical -1.5 (border 침범 패턴)
//   Active   — 텍스트 primary.onAction
//   Inactive — 텍스트 text.secondary
// 텍스트 variant: labelLg (Inter 14/600)
// Pressed 피드백: opacity 0.7 (styled.View 내부 처리)
// ============================================================================

import { useEffect, useRef, useState } from 'react';
import type { LayoutChangeEvent, StyleProp, ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import styled from 'styled-components/native';

import Text from '@/components/primitives/Text';

export interface SegmentedControlSegment<T extends string> {
  /** 내부 값 — onChange 콜백에 전달되는 식별자. */
  value: T;
  /** 표시 라벨. */
  label: string;
}

export interface SegmentedControlProps<T extends string> {
  segments: SegmentedControlSegment<T>[];
  /** 현재 선택된 value — 제어 컴포넌트로 사용. */
  value: T;
  onChange: (value: T) => void;
  /** 컨테이너 외부 스타일 override. */
  style?: StyleProp<ViewStyle>;
}

const Container = styled.View`
  height: 36px;
  border-radius: 18px;
  flex-direction: row;
  border-width: 1.5px;
  border-color: ${({ theme }) => theme.colors.border.strong};
  background-color: transparent;
  overflow: hidden;
`;

const Indicator = styled(Animated.View)`
  position: absolute;
  height: 36px;
  top: -1.5px;
  background-color: ${({ theme }) => theme.colors.primary.action};
`;

const Segment = styled.Pressable`
  flex: 1;
  height: 36px;
  margin-top: -1.5px;
  margin-bottom: -1.5px;
`;

const SegmentInner = styled.View<{ $pressed: boolean }>`
  flex: 1;
  align-items: center;
  justify-content: center;
  opacity: ${({ $pressed }) => ($pressed ? 0.7 : 1)};
`;

const SegmentLabel = styled(Text)<{ $active: boolean }>`
  color: ${({ theme, $active }) =>
    $active ? theme.colors.primary.onAction : theme.colors.text.secondary};
`;

/**
 * 분절 선택 컨트롤 (M3 Segmented Button).
 *
 * Generic<T extends string>로 segments.value와 prop value의 타입이 일치하도록 강제.
 * 활성 indicator가 200ms 슬라이드 transition으로 부드럽게 이동한다.
 *
 * @example
 * <SegmentedControl
 *   segments={[
 *     { value: 'dark', label: '다크' },
 *     { value: 'light', label: '라이트' },
 *     { value: 'system', label: '시스템' },
 *   ]}
 *   value={mode}
 *   onChange={setMode}
 * />
 */
function SegmentedControl<T extends string>({
  segments,
  value,
  onChange,
  style,
}: SegmentedControlProps<T>) {
  const [containerWidth, setContainerWidth] = useState(0);
  const activeIndex = Math.max(
    0,
    segments.findIndex(s => s.value === value),
  );
  const segmentWidth =
    containerWidth > 0 ? containerWidth / segments.length : 0;

  const indicatorLeft = useSharedValue(0);
  const indicatorWidth = useSharedValue(0);
  const isFirstMountRef = useRef(true);

  useEffect(() => {
    if (segmentWidth === 0) return;
    const targetLeft = activeIndex * segmentWidth;
    // 첫 마운트(=onLayout으로 segmentWidth가 처음 잡힐 때): 애니메이션 없이
    // 즉시 셋팅 — 사용자가 화면에 진입한 직후 indicator가 슬라이드되는
    // 부자연스러움 방지. 이후 탭으로 activeIndex가 변하면 transition.
    if (isFirstMountRef.current) {
      indicatorLeft.value = targetLeft;
      indicatorWidth.value = segmentWidth;
      isFirstMountRef.current = false;
      return;
    }
    indicatorLeft.value = withTiming(targetLeft, {
      duration: 200,
      easing: Easing.inOut(Easing.ease),
    });
    indicatorWidth.value = withTiming(segmentWidth, {
      duration: 200,
      easing: Easing.inOut(Easing.ease),
    });
  }, [activeIndex, segmentWidth, indicatorLeft, indicatorWidth]);

  const indicatorStyle = useAnimatedStyle(() => ({
    left: indicatorLeft.value,
    width: indicatorWidth.value,
  }));

  const handleLayout = (e: LayoutChangeEvent) => {
    setContainerWidth(e.nativeEvent.layout.width);
  };

  return (
    <Container style={style} onLayout={handleLayout}>
      {segmentWidth > 0 && <Indicator style={indicatorStyle} />}
      {segments.map(seg => {
        const isActive = seg.value === value;
        return (
          <Segment
            key={seg.value}
            onPress={() => onChange(seg.value)}
            accessibilityRole="button"
            accessibilityState={{ selected: isActive }}
            accessibilityLabel={seg.label}
          >
            {({ pressed }) => (
              <SegmentInner $pressed={pressed}>
                <SegmentLabel variant="labelLg" $active={isActive}>
                  {seg.label}
                </SegmentLabel>
              </SegmentInner>
            )}
          </Segment>
        );
      })}
    </Container>
  );
}

export default SegmentedControl;
