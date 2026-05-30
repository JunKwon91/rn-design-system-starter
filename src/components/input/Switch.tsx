// ============================================================================
// Switch — Material 3 토글 스위치 (filled track + thumb size 변화)
// ============================================================================
//
// 단일 boolean state를 토글하는 스위치. SettingsRow toggle kind에서도 동일
// 컴포넌트를 사용해 시각·동작 정합을 보장한다.
//
// 사용 예:
//   const [enabled, setEnabled] = useState(false);
//   <Switch value={enabled} onValueChange={setEnabled} label="알림" />
//   <Switch value={enabled} onValueChange={setEnabled} size="lg" />
//   <Switch value disabled />
//
// [디자인 토큰]
// Track:
//   sm 40×20 / md 52×32 / lg 64×40, cornerRadius = height/2 (pillbox)
//   Off — fill border.default
//   On  — fill primary.action (Reanimated transition)
// Thumb (정원):
//   sm off 14 / on 16
//   md off 20 / on 24
//   lg off 24 / on 28
//   fill primary.onAction (흰색)
//   off→on 시 size + position 동시 변화 (M3 시그니처)
// Disabled: Row opacity 0.5
// Label: 우측 8px gap, Text variant labelMd
//   enabled  — text.primary
//   disabled — text.secondary opacity 0.7
//
// [애니메이션]
// Reanimated v4 useSharedValue + withTiming (200ms, Easing.inOut(Easing.ease))
//   - track backgroundColor — interpolateColor (off color → on color)
//   - thumb width/height/borderRadius — interpolate (thumbOff → thumbOn)
//   - thumb left — interpolate (좌측 padding → 우측 padding)
//   - thumb top — interpolate (off padY → on padY)
//   - 전부 UI 스레드 worklet 실행 (v4 기본)
// ============================================================================

import { useEffect } from 'react';
import { Pressable } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import styled, { useTheme } from 'styled-components/native';

import Text from '@/components/primitives/Text';
import type { InteractivePressableProps } from '@/types/interactive';

export type SwitchSize = 'sm' | 'md' | 'lg';

export interface SwitchProps extends InteractivePressableProps {
  value: boolean;
  onValueChange?: (value: boolean) => void;
  label?: React.ReactNode;
  size?: SwitchSize;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}

interface SizeSpec {
  trackW: number;
  trackH: number;
  thumbOff: number;
  thumbOn: number;
}

const SIZE_SPEC: Record<SwitchSize, SizeSpec> = {
  sm: { trackW: 40, trackH: 20, thumbOff: 14, thumbOn: 16 },
  md: { trackW: 52, trackH: 32, thumbOff: 20, thumbOn: 24 },
  lg: { trackW: 64, trackH: 40, thumbOff: 24, thumbOn: 28 },
};

const Row = styled.View<{ $disabled: boolean; $pressed: boolean }>`
  flex-direction: row;
  align-items: center;
  gap: 8px;
  opacity: ${({ theme, $disabled, $pressed }) =>
    $disabled ? theme.interaction.disabledOpacity : $pressed ? theme.interaction.pressedOpacity : 1};
`;

const Track = styled(Animated.View)<{ $w: number; $h: number }>`
  width: ${({ $w }) => $w}px;
  height: ${({ $h }) => $h}px;
  border-radius: ${({ $h }) => $h / 2}px;
  justify-content: center;
`;

const Label = styled(Text)<{ $disabled: boolean }>`
  opacity: ${({ $disabled }) => ($disabled ? 0.7 : 1)};
`;

/**
 * Material 3 토글 스위치.
 *
 * value/onValueChange로 외부 제어. 토글 시 트랙 색 + thumb 사이즈/위치가
 * 200ms 부드러운 transition으로 동시에 변화.
 *
 * @example
 * const [dark, setDark] = useState(false);
 * <Switch value={dark} onValueChange={setDark} label="다크 모드" />
 */
function Switch({
  value,
  onValueChange,
  label,
  size = 'md',
  disabled = false,
  style,
  accessibilityLabel,
  ...pressableProps
}: SwitchProps) {
  const theme = useTheme();
  const spec = SIZE_SPEC[size];
  const padOff = (spec.trackH - spec.thumbOff) / 2;
  const padOn = (spec.trackH - spec.thumbOn) / 2;

  const progress = useSharedValue(value ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(value ? 1 : 0, {
      duration: 200,
      easing: Easing.inOut(Easing.ease),
    });
  }, [value, progress]);

  const trackStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      progress.value,
      [0, 1],
      [theme.colors.border.default, theme.colors.primary.action],
    ),
  }), [theme]);

  const thumbStyle = useAnimatedStyle(() => {
    const thumbW = interpolate(
      progress.value,
      [0, 1],
      [spec.thumbOff, spec.thumbOn],
    );
    return {
      position: 'absolute',
      width: thumbW,
      height: thumbW,
      borderRadius: interpolate(
        progress.value,
        [0, 1],
        [spec.thumbOff / 2, spec.thumbOn / 2],
      ),
      backgroundColor: theme.colors.primary.onAction,
      left: interpolate(
        progress.value,
        [0, 1],
        [padOff, spec.trackW - spec.thumbOn - padOn],
      ),
      top: interpolate(progress.value, [0, 1], [padOff, padOn]),
    };
  }, [theme, spec, padOff, padOn]);

  const handlePress = () => {
    if (disabled) return;
    onValueChange?.(!value);
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      accessibilityRole="switch"
      accessibilityState={{ checked: value, disabled }}
      accessibilityLabel={accessibilityLabel}
      style={style}
      {...pressableProps}
    >
      {({ pressed }) => (
        <Row $disabled={disabled} $pressed={pressed}>
          <Track $w={spec.trackW} $h={spec.trackH} style={trackStyle}>
            <Animated.View style={thumbStyle} />
          </Track>
          {label !== undefined && label !== null && (
            <Label
              variant="labelMd"
              color={disabled ? 'secondary' : 'primary'}
              $disabled={disabled}
            >
              {label}
            </Label>
          )}
        </Row>
      )}
    </Pressable>
  );
}

export default Switch;
