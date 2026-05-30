// ============================================================================
// Checkbox — Material 3 둥근 사각형 체크박스 (label 옵션)
// ============================================================================
//
// 단일 boolean state를 토글하는 체크박스. label이 있을 경우 우측에 표시되며
// label 영역을 포함한 전체가 터치 영역.
//
// API는 RN core의 Switch와 동일한 value/onValueChange 페어. 외부에서 제어 컴
// 포넌트로 사용한다.
//
// 사용 예:
//   const [checked, setChecked] = useState(false);
//   <Checkbox value={checked} onValueChange={setChecked} label="동의합니다" />
//   <Checkbox value={checked} onValueChange={setChecked} size="lg" />
//   <Checkbox value disabled />
//
// [디자인 토큰]
// Box: cornerRadius 2
//   sm 16×16 / stroke 1.5 — Check icon size 10 strokeWidth 1.5
//   md 20×20 / stroke 2   — Check icon size 12 strokeWidth 2
//   lg 24×24 / stroke 2   — Check icon size 16 strokeWidth 2.5
// Unchecked: stroke border.control, fill transparent
// Checked:   fill primary.action, lucide Check 아이콘 color primary.onAction
// Disabled:  Row opacity 0.5
// Label:     우측 8px gap, Text variant labelMd
//   enabled  — text.primary
//   disabled — text.secondary opacity 0.7
// ============================================================================

import { Check } from 'lucide-react-native';
import { Pressable } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import styled, { useTheme } from 'styled-components/native';

import Text from '@/components/primitives/Text';

export type CheckboxSize = 'sm' | 'md' | 'lg';

export interface CheckboxProps {
  value: boolean;
  onValueChange?: (value: boolean) => void;
  label?: React.ReactNode;
  size?: CheckboxSize;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  accessibilityLabel?: string;
}

interface SizeSpec {
  box: number;
  stroke: number;
  check: number;
  checkStroke: number;
}

const SIZE_SPEC: Record<CheckboxSize, SizeSpec> = {
  sm: { box: 16, stroke: 1.5, check: 10, checkStroke: 1.5 },
  md: { box: 20, stroke: 2, check: 12, checkStroke: 2 },
  lg: { box: 24, stroke: 2, check: 16, checkStroke: 2.5 },
};

const Row = styled.View<{ $disabled: boolean; $pressed: boolean }>`
  flex-direction: row;
  align-items: center;
  gap: 8px;
  opacity: ${({ theme, $disabled, $pressed }) =>
    $disabled ? theme.interaction.disabledOpacity : $pressed ? theme.interaction.pressedOpacity : 1};
`;

const Box = styled.View<{ $size: number; $stroke: number; $checked: boolean }>`
  width: ${({ $size }) => $size}px;
  height: ${({ $size }) => $size}px;
  border-radius: 2px;
  border-width: ${({ $checked, $stroke }) => ($checked ? 0 : $stroke)}px;
  border-color: ${({ theme }) => theme.colors.border.control};
  background-color: ${({ theme, $checked }) =>
    $checked ? theme.colors.primary.action : 'transparent'};
  align-items: center;
  justify-content: center;
`;

const Label = styled(Text)<{ $disabled: boolean }>`
  opacity: ${({ $disabled }) => ($disabled ? 0.7 : 1)};
`;

/**
 * Material 3 둥근 사각형 체크박스.
 *
 * value/onValueChange로 외부 제어. disabled 시 onValueChange 호출되지 않으며
 * Row opacity 0.5로 시각 신호 부여. label 영역도 터치 영역에 포함.
 *
 * @example
 * const [agreed, setAgreed] = useState(false);
 * <Checkbox value={agreed} onValueChange={setAgreed} label="약관에 동의합니다" />
 */
function Checkbox({
  value,
  onValueChange,
  label,
  size = 'md',
  disabled = false,
  style,
  testID,
  accessibilityLabel,
}: CheckboxProps) {
  const theme = useTheme();
  const spec = SIZE_SPEC[size];

  const handlePress = () => {
    if (disabled) return;
    onValueChange?.(!value);
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: value, disabled }}
      accessibilityLabel={accessibilityLabel}
      testID={testID}
      style={style}
    >
      {({ pressed }) => (
        <Row $disabled={disabled} $pressed={pressed}>
          <Box $size={spec.box} $stroke={spec.stroke} $checked={value}>
            {value && (
              <Check
                size={spec.check}
                color={theme.colors.primary.onAction}
                strokeWidth={spec.checkStroke}
              />
            )}
          </Box>
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

export default Checkbox;
