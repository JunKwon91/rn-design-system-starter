// ============================================================================
// Chip — 선택·필터·태그 표시 컴포넌트 (Material 3 4 variants)
// ============================================================================
//
// 4 variants(filter/assist/input/suggestion) × 2 sizes(sm/md) × 3 states
// (default/selected/disabled). 선택적 leading 아이콘 + Input variant의 close X.
//
// 사용 예:
//   const [selected, setSelected] = useState(false);
//   <Chip variant="filter" label="필터" selected={selected}
//     onPress={() => setSelected(s => !s)} />
//
//   import { Plus } from 'lucide-react-native';
//   <Chip variant="assist" label="추가" icon={<Plus />} onPress={...} />
//
//   import { Star } from 'lucide-react-native';
//   <Chip variant="input" label="태그" icon={<Star />} onPress={...}
//     onClose={() => removeTag()} />
//
//   <Chip variant="suggestion" label="제안" onPress={...} />
//
// [디자인 토큰 — variant별]
// Filter
//   default — outlined border/control, fill transparent, text text/primary
//   selected — fill primary/action, text + check icon primary/onAction
//   disabled — opacity 0.5
// Assist
//   default — outlined border/control, fill transparent, text text/primary,
//             leading icon text/secondary
// Input
//   default — filled surface/containerHigh, text text/primary,
//             leading icon text/secondary, close X text/secondary
// Suggestion
//   default — outlined border/control, text text/muted (보조 톤), 아이콘 없음
//
// [공통 사양]
// sm — height 28, padding-h 10, font 12, icon 14 (close X 12)
// md — height 32, padding-h 12, font 13, icon 16 (close X 14)
// cornerRadius = height/2 (pill)
// itemSpacing 8 (아이콘 ↔ 라벨, 라벨 ↔ close)
// accessibilityRole — filter 'switch' / 그 외 'button'
// ============================================================================

import { Check, X } from 'lucide-react-native';
import { cloneElement, isValidElement } from 'react';
import { Pressable } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import styled, { useTheme } from 'styled-components/native';

import Text from '@/components/primitives/Text';
import type { InteractivePressableProps } from '@/types/interactive';

export type ChipVariant = 'filter' | 'assist' | 'input' | 'suggestion';
export type ChipSize = 'sm' | 'md';

export interface ChipProps extends InteractivePressableProps {
  variant: ChipVariant;
  size?: ChipSize;
  label: string;
  /** Assist/Input의 leading 아이콘 (lucide-react-native). Filter는 selected 시 ✓ 자동, Suggestion 무시. */
  icon?: React.ReactNode;
  /** Filter variant 전용. 다른 variant 무시. */
  selected?: boolean;
  onPress?: () => void;
  /** Input variant 전용. 다른 variant 무시. */
  onClose?: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}

interface SizeSpec {
  height: number;
  padH: number;
  fontSize: number;
  iconSize: number;
  closeIconSize: number;
}

const SIZE_SPEC: Record<ChipSize, SizeSpec> = {
  sm: { height: 28, padH: 10, fontSize: 12, iconSize: 14, closeIconSize: 12 },
  md: { height: 32, padH: 12, fontSize: 13, iconSize: 16, closeIconSize: 14 },
};

const Row = styled.View<{
  $h: number;
  $padH: number;
  $bg: string;
  $border: string;
  $disabled: boolean;
  $pressed: boolean;
}>`
  height: ${({ $h }) => $h}px;
  border-radius: ${({ $h }) => $h / 2}px;
  padding-left: ${({ $padH }) => $padH}px;
  padding-right: ${({ $padH }) => $padH}px;
  background-color: ${({ $bg }) => $bg};
  ${({ $border }) =>
    $border === 'none'
      ? 'border-width: 0;'
      : `border-width: 1px; border-color: ${$border};`}
  flex-direction: row;
  align-items: center;
  align-self: flex-start;
  opacity: ${({ theme, $disabled, $pressed }) =>
    $disabled ? theme.interaction.disabledOpacity : $pressed ? theme.interaction.pressedOpacity : 1};
`;

const LabelText = styled(Text)<{ $color: string; $fontSize: number }>`
  color: ${({ $color }) => $color};
  font-size: ${({ $fontSize }) => $fontSize}px;
  font-weight: 600;
  margin-left: 8px;
  margin-right: 8px;
`;

const FirstLabelText = styled(LabelText)`
  margin-left: 0;
`;

const LastLabelText = styled(LabelText)`
  margin-right: 0;
`;

const SoloLabelText = styled(LabelText)`
  margin-left: 0;
  margin-right: 0;
`;

const CloseButton = styled(Pressable)`
  align-items: center;
  justify-content: center;
`;

function iconWithProps(
  icon: React.ReactNode,
  size: number,
  color: string,
): React.ReactNode {
  if (!isValidElement(icon)) return icon;
  return cloneElement(
    icon as React.ReactElement<{ size?: number; color?: string }>,
    { size, color },
  );
}

/**
 * Material 3 Chip — 4 variants × 2 sizes × 3 states.
 *
 * @example
 * const [active, setActive] = useState(false);
 * <Chip variant="filter" label="필터" selected={active}
 *   onPress={() => setActive(s => !s)} />
 */
function Chip({
  variant,
  size = 'md',
  label,
  icon,
  selected = false,
  onPress,
  onClose,
  disabled = false,
  style,
  accessibilityLabel,
  ...pressableProps
}: ChipProps) {
  const theme = useTheme();
  const spec = SIZE_SPEC[size];

  // variant별 시각 토큰
  const isFilterSelected = variant === 'filter' && selected;
  const bgColor = (() => {
    if (isFilterSelected) return theme.colors.primary.action;
    if (variant === 'input') return theme.colors.surface.containerHigh;
    return 'transparent';
  })();
  const borderColor = (() => {
    if (isFilterSelected || variant === 'input') return 'none';
    return theme.colors.border.control;
  })();
  const textColor = (() => {
    if (isFilterSelected) return theme.colors.primary.onAction;
    if (variant === 'suggestion') return theme.colors.text.muted;
    return theme.colors.text.primary;
  })();
  const iconColor = isFilterSelected
    ? theme.colors.primary.onAction
    : theme.colors.text.secondary;

  // 렌더할 leading 아이콘 결정
  const renderLeading = (() => {
    if (variant === 'filter') {
      if (selected) return <Check size={spec.iconSize} color={iconColor} strokeWidth={2} />;
      return null;
    }
    if (variant === 'suggestion') return null;
    if (icon) return iconWithProps(icon, spec.iconSize, iconColor);
    return null;
  })();

  // close X (input variant만)
  const renderClose =
    variant === 'input' && onClose !== undefined ? (
      <CloseButton
        onPress={disabled ? undefined : onClose}
        disabled={disabled}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel="닫기"
      >
        <X size={spec.closeIconSize} color={iconColor} strokeWidth={2} />
      </CloseButton>
    ) : null;

  // label 컴포넌트 선택 — leading/close 유무에 따라 margin 조정
  const LabelComponent = (() => {
    if (renderLeading && renderClose) return LabelText;
    if (renderLeading && !renderClose) return LastLabelText;
    if (!renderLeading && renderClose) return FirstLabelText;
    return SoloLabelText;
  })();

  const role: 'switch' | 'button' = variant === 'filter' ? 'switch' : 'button';

  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
      accessibilityRole={role}
      accessibilityState={{
        disabled,
        ...(variant === 'filter' ? { checked: selected } : {}),
      }}
      accessibilityLabel={accessibilityLabel ?? label}
      style={style}
      {...pressableProps}
    >
      {({ pressed }) => (
        <Row
          $h={spec.height}
          $padH={spec.padH}
          $bg={bgColor}
          $border={borderColor}
          $disabled={disabled}
          $pressed={pressed}
        >
          {renderLeading}
          <LabelComponent
            variant="labelSm"
            $color={textColor}
            $fontSize={spec.fontSize}
          >
            {label}
          </LabelComponent>
          {renderClose}
        </Row>
      )}
    </Pressable>
  );
}

export default Chip;
