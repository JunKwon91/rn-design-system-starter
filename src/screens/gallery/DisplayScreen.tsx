// ============================================================================
// DisplayScreen — Display 카테고리 갤러리
// ============================================================================
// DataTable · SegmentedControl · Tabs — 컴포넌트 단위 3 탭.
// Typography tokens 섹션은 Primitives Text variants로 통합되어 제거됨.
// ============================================================================

import { useMemo, useState } from 'react';
import { ScrollView } from 'react-native';
import { useTheme } from 'styled-components/native';

import {
  DataTable,
  SegmentedControl,
  Tabs,
  type DataTableColumn,
  type DataTableSortDirection,
} from '@/components/display';
import { Spacer, Text } from '@/components/primitives';
import { Screen, Section } from '@/components/surface';

type SampleRow = {
  id: number;
  count: number;
  daysAgo: number;
  trend: 'up' | 'down' | null;
};

const sampleData: SampleRow[] = [
  { id: 24, count: 142, daysAgo: 12, trend: 'up' },
  { id: 7, count: 138, daysAgo: 3, trend: null },
  { id: 43, count: 135, daysAgo: 28, trend: null },
  { id: 11, count: 120, daysAgo: 45, trend: 'down' },
  { id: 33, count: 118, daysAgo: 7, trend: null },
];

const SECTIONS = [
  { value: 'datatable', label: 'DataTable (데이터 테이블)' },
  { value: 'segmented', label: 'SegmentedControl (분할 컨트롤)' },
  { value: 'tabs', label: 'Tabs (탭)' },
] as const;

type SectionValue = typeof SECTIONS[number]['value'];

// ---------------- Tabs Demo sub-components ----------------

type Tabs2Value = 'all' | 'stats';
const TABS_2: { value: Tabs2Value; label: string }[] = [
  { value: 'all', label: '전체 (All)' },
  { value: 'stats', label: '통계 (Stats)' },
];

function TabsDemo2() {
  const [active, setActive] = useState<Tabs2Value>('all');
  const label = TABS_2.find(t => t.value === active)?.label ?? '';
  return (
    <Section title="Tabs · 2 tabs (2 탭)">
      <Tabs tabs={TABS_2} value={active} onChange={setActive} />
      <Spacer size="md" />
      <Text variant="bodySm" color="muted">
        선택: {label}
      </Text>
    </Section>
  );
}

type Tabs5Value = 'all' | 'analysis' | 'recommend' | 'favorites' | 'stats';
const TABS_5: { value: Tabs5Value; label: string }[] = [
  { value: 'all', label: '전체' },
  { value: 'analysis', label: '분석' },
  { value: 'recommend', label: '추천' },
  { value: 'favorites', label: '즐겨찾기' },
  { value: 'stats', label: '통계' },
];

function TabsDemo5() {
  const [active, setActive] = useState<Tabs5Value>('all');
  const label = TABS_5.find(t => t.value === active)?.label ?? '';
  return (
    <Section title="Tabs · 5 tabs (5 탭)">
      <Tabs tabs={TABS_5} value={active} onChange={setActive} />
      <Spacer size="md" />
      <Text variant="bodySm" color="muted">
        선택: {label}
      </Text>
    </Section>
  );
}

type Tabs8Value =
  | 'home' | 'analysis' | 'recommend' | 'favorites'
  | 'stats' | 'settings' | 'notifications' | 'profile';
const TABS_8: { value: Tabs8Value; label: string }[] = [
  { value: 'home', label: '홈' },
  { value: 'analysis', label: '분석' },
  { value: 'recommend', label: '추천' },
  { value: 'favorites', label: '즐겨찾기' },
  { value: 'stats', label: '통계' },
  { value: 'settings', label: '설정' },
  { value: 'notifications', label: '알림' },
  { value: 'profile', label: '프로필' },
];

function TabsDemo8() {
  const [active, setActive] = useState<Tabs8Value>('home');
  const label = TABS_8.find(t => t.value === active)?.label ?? '';
  return (
    <Section title="Tabs · scrollable (가로 스크롤, 8 탭)">
      <Tabs tabs={TABS_8} value={active} onChange={setActive} />
      <Spacer size="md" />
      <Text variant="bodySm" color="muted">
        선택: {label}
      </Text>
    </Section>
  );
}

// ---------------- Screen ----------------

export default function DisplayScreen() {
  const theme = useTheme();
  const [activeSection, setActiveSection] = useState<SectionValue>(
    SECTIONS[0].value,
  );
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [themeMode, setThemeMode] = useState<'dark' | 'light' | 'system'>(
    'dark',
  );
  const [sortKey, setSortKey] = useState<string>('count');
  const [sortDir, setSortDir] = useState<DataTableSortDirection>('desc');

  const sortedSampleData = useMemo(() => {
    const sorted = [...sampleData];
    sorted.sort((a, b) => {
      const av = a[sortKey as keyof SampleRow];
      const bv = b[sortKey as keyof SampleRow];
      if (av === null && bv === null) return 0;
      if (av === null) return 1;
      if (bv === null) return -1;
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [sortKey, sortDir]);

  const sampleColumns: DataTableColumn<SampleRow>[] = [
    {
      key: 'id',
      header: 'ID',
      render: row => <Text variant="numericMd">{row.id}</Text>,
      flex: 1,
      sortable: true,
    },
    {
      key: 'count',
      header: 'Count',
      render: row => <Text variant="numericMd">{row.count}×</Text>,
      flex: 1,
      sortable: true,
    },
    {
      key: 'daysAgo',
      header: 'Recency',
      render: row => (
        <Text variant="bodySm" color="secondary">
          {row.daysAgo} days
        </Text>
      ),
      flex: 1.2,
      sortable: true,
    },
    {
      key: 'trend',
      header: 'Trend',
      render: row => {
        if (row.trend === 'up') {
          return (
            <Text variant="labelCaps" style={{ color: theme.colors.state.hot }}>
              up
            </Text>
          );
        }
        if (row.trend === 'down') {
          return (
            <Text variant="labelCaps" style={{ color: theme.colors.state.cold }}>
              down
            </Text>
          );
        }
        return (
          <Text variant="bodySm" color="muted">—</Text>
        );
      },
      flex: 0.8,
    },
  ];

  return (
    <Screen edges={['bottom']} padded={false}>
      <Tabs
        tabs={[...SECTIONS]}
        value={activeSection}
        onChange={setActiveSection}
        style={{ marginTop: theme.spacing.xs }}
      />
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: theme.spacing.containerMargin,
          paddingTop: theme.spacing.lg,
          paddingBottom: theme.spacing['2xl'],
        }}
      >
        {activeSection === 'datatable' && (
          <>
            <Section title="DataTable · default density (기본 밀도)">
              <DataTable
                columns={sampleColumns}
                data={sampleData}
                keyExtractor={row => String(row.id)}
              />
            </Section>
            <Spacer size="2xl" />

            <Section title="DataTable · compact density (좁은 밀도)">
              <DataTable
                columns={sampleColumns}
                data={sampleData}
                density="compact"
                keyExtractor={row => String(row.id)}
              />
            </Section>
            <Spacer size="2xl" />

            <Section title="DataTable · sortable (정렬 가능)">
              <Text variant="labelSm" color="muted">
                헤더 탭으로 asc/desc 토글
              </Text>
              <DataTable
                columns={sampleColumns}
                data={sortedSampleData}
                sortable
                sortKey={sortKey}
                sortDirection={sortDir}
                onSort={(k, d) => {
                  setSortKey(k);
                  setSortDir(d);
                }}
                keyExtractor={row => String(row.id)}
              />
            </Section>
          </>
        )}

        {activeSection === 'segmented' && (
          <>
            <Section title="SegmentedControl · 2 segments (2분할)">
              <SegmentedControl
                segments={[
                  { value: 'newest', label: '최신순' },
                  { value: 'oldest', label: '오래된순' },
                ]}
                value={sortOrder}
                onChange={setSortOrder}
              />
            </Section>
            <Spacer size="2xl" />

            <Section title="SegmentedControl · 3 segments (3분할)">
              <SegmentedControl
                segments={[
                  { value: 'dark', label: '다크' },
                  { value: 'light', label: '라이트' },
                  { value: 'system', label: '시스템' },
                ]}
                value={themeMode}
                onChange={setThemeMode}
              />
            </Section>
          </>
        )}

        {activeSection === 'tabs' && (
          <>
            <TabsDemo2 />
            <Spacer size="2xl" />
            <TabsDemo5 />
            <Spacer size="2xl" />
            <TabsDemo8 />
          </>
        )}
      </ScrollView>
    </Screen>
  );
}
