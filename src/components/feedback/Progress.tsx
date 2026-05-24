// ============================================================================
// Progress — 진행률 표시 (Linear + Circular)
// ============================================================================
//
// LinearProgress / CircularProgress 별도 컴포넌트 (MUI/M3 표준 패턴).
// 각각 discriminated union으로 determinate(value 필수) vs indeterminate 분기.
//
// 사용 예:
//   <LinearProgress value={50} />                     // determinate 기본
//   <LinearProgress value={75} size="lg" />
//   <LinearProgress variant="indeterminate" />
//   <CircularProgress value={50} size="md" />
//   <CircularProgress variant="indeterminate" size="sm" />
//
// [디자인 토큰]
// track:    color/border/default (mode-aware)
// progress: color/primary/action (mode-aware)
//
// Linear sizes (height × cornerRadius):
//   sm 4×2 / md 6×3 / lg 8×4
// Circular sizes (outer × stroke):
//   sm 24×3 / md 40×4 / lg 56×6
//
// [애니메이션] Reanimated v4 (UI 스레드 worklet)
// determinate value 변경: 300ms withTiming
// indeterminate Linear: 좌→우 무한 슬라이드 1500ms linear (fill width 40%)
// indeterminate Circular: 360° 무한 회전 1500ms linear (arc 35% 고정)
// strokeLinecap 'round' (M3 표준 + Figma 정합)
// cancelAnimation cleanup (메모리 leak 방지)
//
// [a11y]
// accessibilityRole 'progressbar'
// determinate:   accessibilityValue { min: 0, max: 100, now: value }
// indeterminate: accessibilityState { busy: true }
// ============================================================================

import { useEffect, useState } from 'react';
import type { LayoutChangeEvent, StyleProp, ViewStyle } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import styled, { useTheme } from 'styled-components/native';

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

// ============================================================================
// LinearProgress
// ============================================================================

export type LinearProgressSize = 'sm' | 'md' | 'lg';

interface LinearBaseProps {
  size?: LinearProgressSize;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  accessibilityLabel?: string;
}

export type LinearProgressProps =
  | (LinearBaseProps & { variant?: 'determinate'; value: number })
  | (LinearBaseProps & { variant: 'indeterminate' });

const LINEAR_SIZE_SPEC: Record<LinearProgressSize, { h: number; r: number }> = {
  sm: { h: 4, r: 2 },
  md: { h: 6, r: 3 },
  lg: { h: 8, r: 4 },
};

const LinearTrack = styled(Animated.View)<{ $h: number; $r: number }>`
  width: 100%;
  height: ${({ $h }) => $h}px;
  border-radius: ${({ $r }) => $r}px;
  background-color: ${({ theme }) => theme.colors.border.default};
  overflow: hidden;
`;

const LinearFill = styled(Animated.View)<{ $h: number; $r: number }>`
  height: ${({ $h }) => $h}px;
  border-radius: ${({ $r }) => $r}px;
  background-color: ${({ theme }) => theme.colors.primary.action};
`;

/**
 * Linear 진행률 표시.
 *
 * @example
 * <LinearProgress value={50} />
 * <LinearProgress variant="indeterminate" size="lg" />
 */
export function LinearProgress(props: LinearProgressProps) {
  const { size = 'md', style, testID, accessibilityLabel } = props;
  const spec = LINEAR_SIZE_SPEC[size];
  const isIndet = props.variant === 'indeterminate';
  const valueProp = props.variant === 'indeterminate' ? undefined : props.value;
  const clamped = valueProp !== undefined ? clamp(valueProp, 0, 100) : 0;

  const progress = useSharedValue(clamped);
  const [trackWidth, setTrackWidth] = useState(0);
  const offset = useSharedValue(0);

  // determinate value transition
  useEffect(() => {
    if (isIndet) return;
    progress.value = withTiming(clamped, { duration: 300 });
  }, [isIndet, clamped, progress]);

  // indeterminate slide animation
  useEffect(() => {
    if (!isIndet || trackWidth === 0) return;
    const fillW = trackWidth * 0.4;
    offset.value = -fillW;
    offset.value = withRepeat(
      withTiming(trackWidth, { duration: 1500, easing: Easing.linear }),
      -1,
      false,
    );
    return () => cancelAnimation(offset);
  }, [isIndet, trackWidth, offset]);

  const determinateStyle = useAnimatedStyle(() => ({
    width: `${progress.value}%`,
  }));

  const indeterminateStyle = useAnimatedStyle(
    () => ({
      width: trackWidth * 0.4,
      transform: [{ translateX: offset.value }],
    }),
    [trackWidth],
  );

  const handleLayout = (e: LayoutChangeEvent) => {
    setTrackWidth(e.nativeEvent.layout.width);
  };

  return (
    <LinearTrack
      $h={spec.h}
      $r={spec.r}
      style={style}
      testID={testID}
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={isIndet ? { busy: true } : undefined}
      accessibilityValue={
        !isIndet ? { min: 0, max: 100, now: clamped } : undefined
      }
      onLayout={isIndet ? handleLayout : undefined}
    >
      <LinearFill
        $h={spec.h}
        $r={spec.r}
        style={isIndet ? indeterminateStyle : determinateStyle}
      />
    </LinearTrack>
  );
}

// ============================================================================
// CircularProgress
// ============================================================================

export type CircularProgressSize = 'sm' | 'md' | 'lg';

interface CircularBaseProps {
  size?: CircularProgressSize;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  accessibilityLabel?: string;
}

export type CircularProgressProps =
  | (CircularBaseProps & { variant?: 'determinate'; value: number })
  | (CircularBaseProps & { variant: 'indeterminate' });

const CIRCULAR_SIZE_SPEC: Record<
  CircularProgressSize,
  { outer: number; stroke: number }
> = {
  sm: { outer: 24, stroke: 3 },
  md: { outer: 40, stroke: 4 },
  lg: { outer: 56, stroke: 6 },
};

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const CircularWrap = styled(Animated.View)<{ $size: number }>`
  width: ${({ $size }) => $size}px;
  height: ${({ $size }) => $size}px;
`;

/**
 * Circular 진행률 표시 (12시 시작, 시계 방향).
 *
 * @example
 * <CircularProgress value={75} />
 * <CircularProgress variant="indeterminate" size="sm" />
 */
export function CircularProgress(props: CircularProgressProps) {
  const theme = useTheme();
  const { size = 'md', style, testID, accessibilityLabel } = props;
  const spec = CIRCULAR_SIZE_SPEC[size];
  const isIndet = props.variant === 'indeterminate';
  const valueProp = props.variant === 'indeterminate' ? undefined : props.value;
  const clamped = valueProp !== undefined ? clamp(valueProp, 0, 100) : 0;

  const center = spec.outer / 2;
  const radius = (spec.outer - spec.stroke) / 2;
  const circumference = 2 * Math.PI * radius;

  const progress = useSharedValue(clamped);
  const rotation = useSharedValue(0);

  // determinate value transition
  useEffect(() => {
    if (isIndet) return;
    progress.value = withTiming(clamped, { duration: 300 });
  }, [isIndet, clamped, progress]);

  // indeterminate rotation animation
  useEffect(() => {
    if (!isIndet) return;
    rotation.value = 0;
    rotation.value = withRepeat(
      withTiming(360, { duration: 1500, easing: Easing.linear }),
      -1,
      false,
    );
    return () => cancelAnimation(rotation);
  }, [isIndet, rotation]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - progress.value / 100),
  }));

  const rotateStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const arc35 = circumference * 0.35;
  const gap65 = circumference - arc35;

  return (
    <CircularWrap
      $size={spec.outer}
      style={[style, isIndet ? rotateStyle : undefined]}
      testID={testID}
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={isIndet ? { busy: true } : undefined}
      accessibilityValue={
        !isIndet ? { min: 0, max: 100, now: clamped } : undefined
      }
    >
      <Svg width={spec.outer} height={spec.outer}>
        {/* track (정원) */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={theme.colors.border.default}
          strokeWidth={spec.stroke}
          fill="transparent"
        />
        {isIndet ? (
          /* indeterminate arc 35% 고정 */
          <Circle
            cx={center}
            cy={center}
            r={radius}
            stroke={theme.colors.primary.action}
            strokeWidth={spec.stroke}
            fill="transparent"
            strokeDasharray={`${arc35} ${gap65}`}
            strokeLinecap="round"
            transform={`rotate(-90 ${center} ${center})`}
          />
        ) : (
          /* determinate arc (strokeDashoffset 동적) */
          <AnimatedCircle
            cx={center}
            cy={center}
            r={radius}
            stroke={theme.colors.primary.action}
            strokeWidth={spec.stroke}
            fill="transparent"
            strokeDasharray={circumference}
            strokeLinecap="round"
            animatedProps={animatedProps}
            transform={`rotate(-90 ${center} ${center})`}
          />
        )}
      </Svg>
    </CircularWrap>
  );
}
