// ============================================================================
// DisplayScreen — Display 카테고리 갤러리
// ============================================================================
// DataTable · SegmentedControl · Tabs — 컴포넌트 단위 3 탭.
// Typography tokens 섹션은 Primitives Text variants로 통합되어 제거됨.
// ============================================================================

import { useMemo, useState } from 'react';
import { Alert, ScrollView } from 'react-native';
import styled, { useTheme } from 'styled-components/native';

const BadgeRow = styled.View`
  flex-direction: row;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
`;

const ChipRow = styled.View`
  flex-direction: row;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
`;

import { Bell, Home, Plus, Settings, Star, User } from 'lucide-react-native';

import {
  Badge,
  Chip,
  DataTable,
  SegmentedControl,
  Tabs,
  type DataTableColumn,
  type DataTableSortDirection,
} from '@/components/display';
import { Spacer, Text } from '@/components/primitives';
import { Screen, Section } from '@/components/surface';

type SampleStatus = 'active' | 'pending' | 'archived';

type SampleRow = {
  id: number;
  count: number;
  daysAgo: number;
  status: SampleStatus;
};

const sampleData: SampleRow[] = [
  { id: 24, count: 142, daysAgo: 12, status: 'active' },
  { id: 7, count: 138, daysAgo: 3, status: 'pending' },
  { id: 43, count: 135, daysAgo: 28, status: 'archived' },
  { id: 11, count: 120, daysAgo: 45, status: 'active' },
  { id: 33, count: 118, daysAgo: 7, status: 'pending' },
];

const SECTIONS = [
  { value: 'datatable', label: 'DataTable (데이터 테이블)' },
  { value: 'segmented', label: 'SegmentedControl (분할 컨트롤)' },
  { value: 'tabs', label: 'Tabs (탭)' },
  { value: 'badge', label: 'Badge (배지)' },
  { value: 'chip', label: 'Chip (칩)' },
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

type TabsExtValue = 'home' | 'alerts' | 'settings' | 'profile';

function TabsDemoExtended() {
  const [active, setActive] = useState<TabsExtValue>('home');
  const theme = useTheme();
  const iconColor = theme.colors.text.muted;
  return (
    <Section title="Tabs · API 확장 (icon · badge · disabled)">
      <Tabs<TabsExtValue>
        tabs={[
          { value: 'home', label: '홈', icon: <Home size={16} color={iconColor} /> },
          { value: 'alerts', label: '알림', icon: <Bell size={16} color={iconColor} />, badge: 3 },
          { value: 'settings', label: '설정', icon: <Settings size={16} color={iconColor} />, disabled: true },
          { value: 'profile', label: '프로필', icon: <User size={16} color={iconColor} />, badge: 'NEW' },
        ]}
        value={active}
        onChange={setActive}
      />
      <Spacer size="md" />
      <Text variant="bodySm" color="muted">
        홈(icon) · 알림(icon + count badge 3) · 설정(disabled) · 프로필(icon + label badge "NEW")
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
      key: 'status',
      header: 'Status',
      render: row => {
        const colorMap: Record<SampleStatus, string> = {
          active: theme.colors.state.success,
          pending: theme.colors.state.warning,
          archived: theme.colors.text.muted,
        };
        return (
          <Text variant="labelCaps" style={{ color: colorMap[row.status] }}>
            {row.status}
          </Text>
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
              <Spacer size="md" />
              <Text variant="bodySm" color="muted">
                선택: {sortOrder}
              </Text>
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
              <Spacer size="md" />
              <Text variant="bodySm" color="muted">
                선택: {themeMode}
              </Text>
            </Section>
            <Spacer size="2xl" />

            <Section title="SegmentedControl · disabled segment (시스템 비활성)">
              <SegmentedControl
                segments={[
                  { value: 'dark', label: '다크' },
                  { value: 'light', label: '라이트' },
                  { value: 'system', label: '시스템', disabled: true },
                ]}
                value={themeMode === 'system' ? 'dark' : themeMode}
                onChange={setThemeMode}
              />
              <Spacer size="md" />
              <Text variant="bodySm" color="muted">
                "시스템" 세그먼트 disabled — opacity 0.5 + onPress 차단
              </Text>
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
            <Spacer size="2xl" />
            <TabsDemoExtended />
          </>
        )}

        {activeSection === 'badge' && (
          <>
            <Section title="Badge · dot (4 colors × 2 sizes)">
              <BadgeRow>
                <Badge type="dot" color="primary" />
                <Badge type="dot" color="destructive" />
                <Badge type="dot" color="success" />
                <Badge type="dot" color="warning" />
                <Badge type="dot" color="primary" size="sm" />
                <Badge type="dot" color="destructive" size="sm" />
                <Badge type="dot" color="success" size="sm" />
                <Badge type="dot" color="warning" size="sm" />
              </BadgeRow>
            </Section>
            <Spacer size="2xl" />

            <Section title="Badge · count (1-99, 100+ → 99+)">
              <BadgeRow>
                <Badge type="count" value={1} color="primary" />
                <Badge type="count" value={9} color="destructive" />
                <Badge type="count" value={42} color="success" />
                <Badge type="count" value={99} color="warning" />
                <Badge type="count" value={150} color="destructive" />
              </BadgeRow>
              <BadgeRow>
                <Badge type="count" value={1} color="primary" size="sm" />
                <Badge type="count" value={9} color="destructive" size="sm" />
                <Badge type="count" value={42} color="success" size="sm" />
                <Badge type="count" value={99} color="warning" size="sm" />
                <Badge type="count" value={150} color="destructive" size="sm" />
              </BadgeRow>
            </Section>
            <Spacer size="2xl" />

            <Section title="Badge · label (텍스트 라벨)">
              <BadgeRow>
                <Badge type="label" value="NEW" color="primary" />
                <Badge type="label" value="HOT" color="destructive" />
                <Badge type="label" value="OK" color="success" />
                <Badge type="label" value="BETA" color="warning" />
              </BadgeRow>
              <BadgeRow>
                <Badge type="label" value="NEW" color="primary" size="sm" />
                <Badge type="label" value="HOT" color="destructive" size="sm" />
                <Badge type="label" value="OK" color="success" size="sm" />
                <Badge type="label" value="BETA" color="warning" size="sm" />
              </BadgeRow>
            </Section>
          </>
        )}

        {activeSection === 'chip' && <ChipDemo />}
      </ScrollView>
    </Screen>
  );
}

function ChipDemo() {
  const [filterMd, setFilterMd] = useState(false);
  const [filterSm, setFilterSm] = useState(true);
  const [tags, setTags] = useState<string[]>(['#디자인', '#개발', '#모바일']);

  return (
    <>
      <Section title="Chip · Filter (toggle 가능)">
        <ChipRow>
          <Chip
            variant="filter"
            label="필터"
            selected={filterMd}
            onPress={() => {
              setFilterMd(s => !s);
              Alert.alert('Chip · Filter', '필터 클릭됨 (toggle 가능)');
            }}
          />
          <Chip
            variant="filter"
            label="비활성"
            disabled
            onPress={() => Alert.alert('Chip · Filter', '비활성 클릭됨')}
          />
          <Chip
            variant="filter"
            label="작게"
            size="sm"
            selected={filterSm}
            onPress={() => {
              setFilterSm(s => !s);
              Alert.alert('Chip · Filter · sm', '작게 클릭됨');
            }}
          />
        </ChipRow>
      </Section>
      <Spacer size="2xl" />

      <Section title="Chip · Assist (단발 액션 + leading 아이콘)">
        <ChipRow>
          <Chip
            variant="assist"
            label="추가"
            icon={<Plus />}
            onPress={() => Alert.alert('Chip · Assist', '추가 액션 클릭됨')}
          />
          <Chip
            variant="assist"
            label="비활성"
            icon={<Plus />}
            disabled
            onPress={() => Alert.alert('Chip · Assist', '비활성 클릭됨')}
          />
          <Chip
            variant="assist"
            label="작게"
            icon={<Plus />}
            size="sm"
            onPress={() => Alert.alert('Chip · Assist · sm', '작게 클릭됨')}
          />
        </ChipRow>
      </Section>
      <Spacer size="2xl" />

      <Section title="Chip · Input (사용자 입력 결과 + close X)">
        <Text variant="labelSm" color="muted">
          icon은 선택 — hashtag 태그는 아이콘 없이, 즐겨찾기는 ★ 아이콘
        </Text>
        <ChipRow>
          {tags.map(t => (
            <Chip
              key={t}
              variant="input"
              label={t}
              onPress={() => Alert.alert('Chip · Input · 본체', `${t} 본체 클릭됨`)}
              onClose={() => {
                setTags(prev => prev.filter(x => x !== t));
                Alert.alert('Chip · Input · close', `${t} 제거 클릭됨`);
              }}
            />
          ))}
          <Chip
            variant="input"
            label="즐겨찾기"
            icon={<Star />}
            onPress={() => Alert.alert('Chip · Input · 본체', '즐겨찾기 본체 클릭됨')}
            onClose={() => Alert.alert('Chip · Input · close', '즐겨찾기 제거')}
          />
          <Chip
            variant="input"
            label="잠금"
            icon={<Star />}
            disabled
            onClose={() => Alert.alert('Chip · Input · close', '잠금 제거')}
          />
        </ChipRow>
      </Section>
      <Spacer size="2xl" />

      <Section title="Chip · Suggestion (옅은 보조 제안)">
        <ChipRow>
          <Chip
            variant="suggestion"
            label="제안"
            onPress={() => Alert.alert('Chip · Suggestion', '제안 채택됨')}
          />
          <Chip
            variant="suggestion"
            label="비활성"
            disabled
            onPress={() => Alert.alert('Chip · Suggestion', '비활성 채택됨')}
          />
          <Chip
            variant="suggestion"
            label="작게"
            size="sm"
            onPress={() => Alert.alert('Chip · Suggestion · sm', '작게 채택됨')}
          />
        </ChipRow>
      </Section>
    </>
  );
}
