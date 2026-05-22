// ============================================================================
// Badge — 상태·카운트·라벨 표시 컴포넌트
// ============================================================================
//
// 3 types(dot/count/label) × 2 sizes(sm/md) × 4 colors(primary/destructive/
// success/warning). Material 3 small/large badge 패턴 차용.
//
// 사용 예:
//   <Badge type="dot" color="success" />
//   <Badge type="count" value={3} color="destructive" />
//   <Badge type="count" value={150} />  // 99+ 자동 표시
//   <Badge type="label" value="NEW" color="warning" />
//
// [디자인 토큰]
// Dot: sm 6×6 / md 8×8, cornerRadius = size/2 (정원), 텍스트 없음
// Count: sm 16×16 / md 20×20, cornerRadius = size/2 (정원),
//   숫자 1-99 표시, > 99 시 "99+" 자동 처리
// Label: sm height 16 / md height 20, cornerRadius = height/2 (pill),
//   width auto + paddingHorizontal (sm 6 / md 8)
// 색상:
//   primary     — primary.action + text.onPrimaryAction
//   destructive — state.error + text.onPrimaryAction
//   success     — state.success + text.onPrimaryAction
//   warning     — state.warning + text.onPrimaryAction
// 폰트: Inter Semi Bold, sm 10 / md 11
// ============================================================================

import type { StyleProp, ViewStyle } from 'react-native';
import styled, { useTheme } from 'styled-components/native';

export type BadgeType = 'dot' | 'count' | 'label';
export type BadgeSize = 'sm' | 'md';
export type BadgeColor = 'primary' | 'destructive' | 'success' | 'warning';

export interface BadgeProps {
  type?: BadgeType;
  size?: BadgeSize;
  color?: BadgeColor;
  /** type='count'일 때 숫자(>99는 "99+" 자동), type='label'일 때 텍스트. */
  value?: number | string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

const DOT_SIZE: Record<BadgeSize, number> = { sm: 6, md: 8 };
const COUNT_SIZE: Record<BadgeSize, number> = { sm: 16, md: 20 };
const LABEL_HEIGHT: Record<BadgeSize, number> = { sm: 16, md: 20 };
const LABEL_PAD: Record<BadgeSize, number> = { sm: 6, md: 8 };
const FONT_SIZE: Record<BadgeSize, number> = { sm: 10, md: 11 };

const Dot = styled.View<{ $size: number; $color: string }>`
  width: ${({ $size }) => $size}px;
  height: ${({ $size }) => $size}px;
  border-radius: ${({ $size }) => $size / 2}px;
  background-color: ${({ $color }) => $color};
`;

const Count = styled.View<{ $size: number; $color: string }>`
  min-width: ${({ $size }) => $size}px;
  height: ${({ $size }) => $size}px;
  border-radius: ${({ $size }) => $size / 2}px;
  background-color: ${({ $color }) => $color};
  padding-left: 4px;
  padding-right: 4px;
  align-items: center;
  justify-content: center;
`;

const Label = styled.View<{ $h: number; $pad: number; $color: string }>`
  height: ${({ $h }) => $h}px;
  border-radius: ${({ $h }) => $h / 2}px;
  background-color: ${({ $color }) => $color};
  padding-left: ${({ $pad }) => $pad}px;
  padding-right: ${({ $pad }) => $pad}px;
  align-items: center;
  justify-content: center;
`;

const BadgeText = styled.Text<{ $size: number; $color: string }>`
  font-family: 'Inter';
  font-size: ${({ $size }) => $size}px;
  font-weight: 600;
  color: ${({ $color }) => $color};
  line-height: ${({ $size }) => $size + 2}px;
  include-font-padding: false;
`;

function formatCount(value: number | string | undefined): string {
  if (typeof value === 'number') {
    return value > 99 ? '99+' : String(value);
  }
  return value !== undefined ? String(value) : '';
}

/**
 * 상태·카운트·라벨 표시 Badge.
 *
 * @example
 * <Badge type="dot" color="success" />
 * <Badge type="count" value={3} color="destructive" />
 * <Badge type="count" value={150} /> // → "99+"
 * <Badge type="label" value="NEW" color="warning" />
 */
function Badge({
  type = 'dot',
  size = 'md',
  color = 'primary',
  value,
  style,
  testID,
}: BadgeProps) {
  const theme = useTheme();
  const bg =
    color === 'primary'
      ? theme.colors.primary.action
      : color === 'destructive'
        ? theme.colors.state.error
        : color === 'success'
          ? theme.colors.state.success
          : theme.colors.state.warning;
  const fg = theme.colors.primary.onAction;

  if (type === 'dot') {
    return <Dot $size={DOT_SIZE[size]} $color={bg} style={style} testID={testID} />;
  }
  if (type === 'count') {
    return (
      <Count $size={COUNT_SIZE[size]} $color={bg} style={style} testID={testID}>
        <BadgeText $size={FONT_SIZE[size]} $color={fg}>
          {formatCount(value)}
        </BadgeText>
      </Count>
    );
  }
  return (
    <Label
      $h={LABEL_HEIGHT[size]}
      $pad={LABEL_PAD[size]}
      $color={bg}
      style={style}
      testID={testID}
    >
      <BadgeText $size={FONT_SIZE[size]} $color={fg}>
        {value !== undefined ? String(value) : ''}
      </BadgeText>
    </Label>
  );
}

export default Badge;
