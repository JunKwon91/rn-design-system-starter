// ============================================================================
// Radio — 정원형 라디오 버튼 (RadioGroup 내부 전용)
// ============================================================================
//
// 단독 사용 불가 — 반드시 <RadioGroup> 내부에 렌더. 그룹의 value와 자신의
// value를 비교해 selected 여부를 결정한다.
//
// 사용 예:
//   <RadioGroup value={pick} onValueChange={setPick}>
//     <Radio value="a" label="옵션 A" />
//     <Radio value="b" label="옵션 B" size="lg" />
//     <Radio value="c" label="옵션 C" disabled />
//   </RadioGroup>
//
// [디자인 토큰]
// Box: cornerRadius = box/2 (정원)
//   sm 16×16 / stroke 1.5 / inner dot 6×6
//   md 20×20 / stroke 2   / inner dot 8×8
//   lg 24×24 / stroke 2   / inner dot 10×10
// Unselected: stroke border.control
// Selected:   stroke primary.action + 중앙 dot fill primary.action
// Disabled:   Row opacity 0.5
// Label:      우측 8px gap, Text variant labelMd
//   enabled  — text.primary
//   disabled — text.secondary opacity 0.7
// ============================================================================

import { Pressable } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import styled from 'styled-components/native';

import Text from '@/components/primitives/Text';

import { useRadioGroup } from './RadioGroup';

export type RadioSize = 'sm' | 'md' | 'lg';

export interface RadioProps {
  /** 그룹 안에서 이 옵션을 식별하는 고유값. RadioGroup.value와 일치 시 selected. */
  value: string;
  label?: React.ReactNode;
  size?: RadioSize;
  /** 개별 Radio disabled. 그룹 disabled와 OR로 결합. */
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  accessibilityLabel?: string;
}

interface SizeSpec {
  box: number;
  stroke: number;
  dot: number;
}

const SIZE_SPEC: Record<RadioSize, SizeSpec> = {
  sm: { box: 16, stroke: 1.5, dot: 6 },
  md: { box: 20, stroke: 2,   dot: 8 },
  lg: { box: 24, stroke: 2,   dot: 10 },
};

const Row = styled.View<{ $disabled: boolean; $pressed: boolean }>`
  flex-direction: row;
  align-items: center;
  gap: 8px;
  opacity: ${({ theme, $disabled, $pressed }) =>
    $disabled ? theme.interaction.disabledOpacity : $pressed ? theme.interaction.pressedOpacity : 1};
`;

const Box = styled.View<{ $size: number; $stroke: number; $selected: boolean }>`
  width: ${({ $size }) => $size}px;
  height: ${({ $size }) => $size}px;
  border-radius: ${({ $size }) => $size / 2}px;
  border-width: ${({ $stroke }) => $stroke}px;
  border-color: ${({ theme, $selected }) =>
    $selected ? theme.colors.primary.action : theme.colors.border.control};
  align-items: center;
  justify-content: center;
`;

const Dot = styled.View<{ $size: number }>`
  width: ${({ $size }) => $size}px;
  height: ${({ $size }) => $size}px;
  border-radius: ${({ $size }) => $size / 2}px;
  background-color: ${({ theme }) => theme.colors.primary.action};
`;

const Label = styled(Text)<{ $disabled: boolean }>`
  opacity: ${({ $disabled }) => ($disabled ? 0.7 : 1)};
`;

/**
 * 정원형 라디오 버튼. RadioGroup 내부에서만 사용 가능.
 *
 * @example
 * <RadioGroup value={pick} onValueChange={setPick}>
 *   <Radio value="a" label="옵션 A" />
 *   <Radio value="b" label="옵션 B" />
 * </RadioGroup>
 */
function Radio({
  value,
  label,
  size = 'md',
  disabled = false,
  style,
  testID,
  accessibilityLabel,
}: RadioProps) {
  const group = useRadioGroup();
  const spec = SIZE_SPEC[size];
  const isSelected = group.value === value;
  const effectiveDisabled = group.disabled || disabled;

  const handlePress = () => {
    if (effectiveDisabled) return;
    group.onValueChange(value);
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={effectiveDisabled}
      accessibilityRole="radio"
      accessibilityState={{ selected: isSelected, disabled: effectiveDisabled }}
      accessibilityLabel={accessibilityLabel}
      testID={testID}
      style={style}
    >
      {({ pressed }) => (
        <Row $disabled={effectiveDisabled} $pressed={pressed}>
          <Box $size={spec.box} $stroke={spec.stroke} $selected={isSelected}>
            {isSelected && <Dot $size={spec.dot} />}
          </Box>
          {label !== undefined && label !== null && (
            <Label
              variant="labelMd"
              color={effectiveDisabled ? 'secondary' : 'primary'}
              $disabled={effectiveDisabled}
            >
              {label}
            </Label>
          )}
        </Row>
      )}
    </Pressable>
  );
}

export default Radio;
