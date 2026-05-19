// ============================================================================
// GalleryHomeScreen — 디자인 시스템 갤러리 메뉴 화면
// ============================================================================
// 7개 카테고리 카드. 각 카드 탭 시 해당 카테고리 화면으로 navigate.
// ============================================================================

import { Pressable } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import styled, { useTheme } from 'styled-components/native';

import { Spacer, Text } from '@/components/primitives';
import { Card, Screen, Section } from '@/components/surface';
import type { RootStackParamList } from '@/navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

type CategoryRoute = Exclude<keyof RootStackParamList, 'GalleryHome'>;

interface CategoryEntry {
  route: CategoryRoute;
  label: string;
  subtitle: string;
  count: number;
}

const CATEGORIES: CategoryEntry[] = [
  { route: 'Primitives', label: 'Primitives (기본 요소)', subtitle: 'Text · Spacer · Divider', count: 3 },
  { route: 'Surface', label: 'Surface (표면)', subtitle: 'Screen · Card · Section', count: 3 },
  { route: 'Action', label: 'Action (액션)', subtitle: 'Button · IconButton', count: 2 },
  { route: 'Input', label: 'Input (입력)', subtitle: 'Input · SearchInput', count: 2 },
  { route: 'Display', label: 'Display (표시)', subtitle: 'DataTable · SegmentedControl · Tabs', count: 3 },
  { route: 'List', label: 'List (리스트)', subtitle: 'SettingsRow', count: 1 },
  {
    route: 'Feedback',
    label: 'Feedback (피드백)',
    subtitle: 'EmptyState · ErrorView · LoadingView · Toast · Dialog',
    count: 5,
  },
];

const CardRow = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 12px;
`;

const TitleColumn = styled.View`
  flex: 1;
`;

const CountBadge = styled.View`
  min-width: 28px;
  height: 24px;
  padding: 0 8px;
  border-radius: 12px;
  background-color: ${({ theme }) => theme.colors.surface.containerHigh};
  align-items: center;
  justify-content: center;
`;

function CategoryCard({ entry }: { entry: CategoryEntry }) {
  const navigation = useNavigation<Nav>();
  const theme = useTheme();

  return (
    <Pressable
      onPress={() => navigation.navigate(entry.route)}
      accessibilityRole="button"
      accessibilityLabel={`${entry.label} 갤러리 열기`}
      style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
    >
      <Card>
        <CardRow>
          <TitleColumn>
            <Text variant="headlineMd">{entry.label}</Text>
            <Spacer size="xs" />
            <Text variant="bodySm" color="muted">
              {entry.subtitle}
            </Text>
          </TitleColumn>
          <CountBadge>
            <Text variant="labelSm" color="secondary">
              {entry.count}
            </Text>
          </CountBadge>
          <ChevronRight size={20} color={theme.colors.text.muted} />
        </CardRow>
      </Card>
    </Pressable>
  );
}

export default function GalleryHomeScreen() {
  const theme = useTheme();

  return (
    <Screen
      scroll
      edges={['bottom']}
      contentContainerStyle={{ paddingVertical: theme.spacing.lg }}
    >
      <Section title="Categories">
        {CATEGORIES.map(entry => (
          <CategoryCard key={entry.route} entry={entry} />
        ))}
      </Section>
    </Screen>
  );
}
