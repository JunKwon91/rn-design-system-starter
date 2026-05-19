// ============================================================================
// Tabs — 가로 스크롤 탭 컨트롤 (Material 3 underline pattern)
// ============================================================================
//
// 5개 이상의 카테고리를 가로 스크롤로 전환할 때 사용. 라벨 길이에 따라 각 탭이
// 자연 확장되며, 활성 탭은 라벨 하단에 2px primary.action underline으로 표시.
// SegmentedControl(2~4개 균등 분할 enclosed)과 대비되는 navigational 패턴.
//
// 사용 예:
//   type TabValue = 'all' | 'analysis' | 'favorites' | 'stats';
//   const [current, setCurrent] = useState<TabValue>('all');
//   <Tabs
//     tabs={[
//       { value: 'all', label: '전체' },
//       { value: 'analysis', label: '분석' },
//       { value: 'favorites', label: '즐겨찾기' },
//       { value: 'stats', label: '통계' },
//     ]}
//     value={current}
//     onChange={setCurrent}
//   />
//
// [디자인 토큰]
// 컨테이너: ScrollView horizontal, showsHorizontalScrollIndicator=false
//   하단 1px base line (border.subtle) — 스크롤 시 탭들과 함께 이동해 활성
//   underline overlay 위치 정합.
// 각 탭: padding 16 H / 12 T / 0 B, gap 4 (label↔underline), align center
// Label: typography.labelLg (Inter Semi Bold 14 / lineHeight 20)
//   - Active   — text.primary
//   - Inactive — text.muted
// Underline: 2px, label 폭으로 stretch
//   - Active   — primary.action
//   - Inactive — transparent (height 유지로 row 정렬 안정)
// Pressed 피드백: opacity 0.7 (Button·SegmentedControl 패턴 일관)
//
// [SegmentedControl과의 차이]
// - 분할 방식: SegmentedControl 균등(flex 1) / Tabs HUG(라벨 길이 자연 확장)
// - 활성 표시: SegmentedControl pillbox 배경 / Tabs flat 2px underline
// - 외곽: SegmentedControl rounded enclosed / Tabs base line만
// - 적정 개수: SegmentedControl 2~4 / Tabs 5~10+ (가로 스크롤)
// - 의미: SegmentedControl selection control / Tabs navigation
// ============================================================================

import { Pressable, ScrollView } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import styled, { useTheme } from 'styled-components/native';

import Text from '@/components/primitives/Text';

export interface TabItem<T extends string = string> {
  /** 내부 값 — onChange 콜백에 전달되는 식별자. */
  value: T;
  /** 표시 라벨. */
  label: string;
}

export interface TabsProps<T extends string = string> {
  tabs: TabItem<T>[];
  /** 현재 선택된 value — 제어 컴포넌트로 사용. */
  value: T;
  onChange: (value: T) => void;
  /** ScrollView 외부 컨테이너 스타일 override. */
  style?: StyleProp<ViewStyle>;
}

const Row = styled.View`
  flex-direction: row;
`;

const TabColumn = styled.View`
  flex-direction: column;
  align-items: center;
  padding: 12px 16px 0px 16px;
  gap: 4px;
`;

const Underline = styled.View<{ $active: boolean }>`
  height: 2px;
  align-self: stretch;
  background-color: ${({ theme, $active }) =>
    $active ? theme.colors.primary.action : 'transparent'};
`;

const BaseLine = styled.View`
  height: 1px;
  align-self: stretch;
  background-color: ${({ theme }) => theme.colors.border.subtle};
`;

const Wrap = styled.View`
  flex-direction: column;
`;

/**
 * 가로 스크롤 탭 컨트롤.
 *
 * Generic<T extends string>로 tabs[].value와 prop value의 타입이 일치하도록 강제.
 * 5개 이상의 카테고리 전환에 적합. SegmentedControl과 달리 라벨 길이에 따라
 * 각 탭이 자연 확장되며, 활성 탭은 하단 2px underline으로 표시.
 *
 * @example
 * <Tabs
 *   tabs={[
 *     { value: 'all', label: '전체' },
 *     { value: 'analysis', label: '분석' },
 *     { value: 'favorites', label: '즐겨찾기' },
 *     { value: 'stats', label: '통계' },
 *   ]}
 *   value={current}
 *   onChange={setCurrent}
 * />
 */
function Tabs<T extends string>({
  tabs,
  value,
  onChange,
  style,
}: TabsProps<T>) {
  const theme = useTheme();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={style}
      accessibilityRole="tablist"
    >
      <Wrap>
        <Row>
          {tabs.map(tab => {
            const isActive = tab.value === value;
            return (
              <Pressable
                key={tab.value}
                onPress={() => onChange(tab.value)}
                accessibilityRole="tab"
                accessibilityState={{ selected: isActive }}
                accessibilityLabel={tab.label}
                style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
              >
                <TabColumn>
                  <Text
                    variant="labelLg"
                    style={{
                      color: isActive
                        ? theme.colors.text.primary
                        : theme.colors.text.muted,
                    }}
                  >
                    {tab.label}
                  </Text>
                  <Underline $active={isActive} />
                </TabColumn>
              </Pressable>
            );
          })}
        </Row>
        <BaseLine />
      </Wrap>
    </ScrollView>
  );
}

export default Tabs;
