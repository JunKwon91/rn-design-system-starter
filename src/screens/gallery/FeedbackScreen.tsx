// ============================================================================
// FeedbackScreen — Feedback 카테고리 갤러리
// ============================================================================
// EmptyState · ErrorView · LoadingView · Toast · Dialog (5 그룹 탭 패턴).
// 17개 섹션을 5 그룹으로 묶고 Tabs로 전환. 각 그룹 안의 섹션은 세로 스크롤.
// ============================================================================

import { useEffect, useState } from 'react';
import { Alert, ScrollView } from 'react-native';
import { Inbox, Search, Star } from 'lucide-react-native';
import styled, { useTheme } from 'styled-components/native';

const SkeletonRow = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 16px;
`;

const SkeletonCard = styled.View`
  background-color: ${({ theme }) => theme.colors.surface.container};
  border-radius: 16px;
  padding: 24px;
`;

const SkeletonListRow = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 12px;
`;

const SkeletonCommentRow = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 16px;
`;

const SkeletonCommentLines = styled.View`
  flex: 1;
`;

const StackedButtons = styled.View`
  gap: 8px;
`;

const ProgressList = styled.View`
  gap: 16px;
`;

const ProgressColumn = styled.View`
  gap: 6px;
`;

const CircularRow = styled.View`
  flex-direction: row;
  align-items: flex-start;
  gap: 24px;
  flex-wrap: wrap;
`;

const CircularItem = styled.View`
  align-items: center;
  gap: 8px;
`;

import { Button } from '@/components/action';
import { Tabs } from '@/components/display';
import {
  CircularProgress,
  EmptyState,
  ErrorView,
  LinearProgress,
  LoadingView,
  Skeleton,
} from '@/components/feedback';
import { Spacer, Text } from '@/components/primitives';
import { Screen, Section } from '@/components/surface';
import { dialog } from '@/stores/dialogStore';
import { toast, useToastStore } from '@/stores/toastStore';

const GROUPS = [
  { value: 'empty-state', label: 'EmptyState (빈 상태)' },
  { value: 'error-view', label: 'ErrorView (오류)' },
  { value: 'loading-view', label: 'LoadingView (로딩)' },
  { value: 'skeleton', label: 'Skeleton (스켈레톤)' },
  { value: 'progress', label: 'Progress (진행률)' },
  { value: 'toast', label: 'Toast (토스트)' },
  { value: 'dialog', label: 'Dialog (다이얼로그)' },
] as const;

type GroupValue = typeof GROUPS[number]['value'];

// ---------------- Progress 다운로드 시뮬레이션 데모 ----------------

const DOWNLOAD_STEP = 5;       // 매 tick 5% 증가
const DOWNLOAD_INTERVAL = 500; // 500ms 간격 → 10초 cycle (0~100)

function useDownloadProgress(): number {
  const [value, setValue] = useState(0);
  useEffect(() => {
    const id = setInterval(() => {
      setValue(prev => (prev >= 100 ? 0 : prev + DOWNLOAD_STEP));
    }, DOWNLOAD_INTERVAL);
    return () => clearInterval(id);
  }, []);
  return value;
}

function DemoLinearDownload() {
  const value = useDownloadProgress();
  return (
    <ProgressColumn>
      <Text variant="labelSm" color="muted">다운로드 중 · {value}%</Text>
      <LinearProgress value={value} size="md" />
    </ProgressColumn>
  );
}

function DemoCircularDownload() {
  const value = useDownloadProgress();
  return (
    <CircularItem>
      <CircularProgress value={value} size="lg" />
      <Text variant="labelSm" color="muted">{value}%</Text>
    </CircularItem>
  );
}

export default function FeedbackScreen() {
  const theme = useTheme();
  const [activeGroup, setActiveGroup] = useState<GroupValue>(GROUPS[0].value);

  return (
    <Screen edges={['bottom']} padded={false}>
      <Tabs
        tabs={[...GROUPS]}
        value={activeGroup}
        onChange={setActiveGroup}
        style={{ marginTop: theme.spacing.xs }}
      />
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: theme.spacing.containerMargin,
          paddingTop: theme.spacing.lg,
          paddingBottom: theme.spacing['2xl'],
        }}
      >
        {activeGroup === 'empty-state' && (
          <>
            <Section title="EmptyState · standard (기본)">
              <EmptyState
                icon={<Inbox color={theme.colors.text.muted} size={32} />}
                title="저장된 항목이 없습니다"
                description="새로운 항목을 저장해 보세요."
              />
            </Section>
            <Spacer size="2xl" />

            <Section title="EmptyState · standard + action (액션 포함)">
              <EmptyState
                icon={<Search color={theme.colors.text.muted} size={32} />}
                title="검색 결과가 없습니다"
                description="다른 키워드로 다시 검색해 보세요."
                action={{
                  label: '검색 초기화',
                  onPress: () =>
                    Alert.alert('EmptyState', '검색 초기화 클릭됨'),
                }}
              />
            </Section>
            <Spacer size="2xl" />

            <Section title="EmptyState · subtle (인라인 힌트)">
              <EmptyState
                tone="subtle"
                icon={<Star color={theme.colors.text.muted} size={32} />}
                title="새로운 항목을 저장해보세요"
              />
            </Section>
          </>
        )}

        {activeGroup === 'error-view' && (
          <>
            <Section title="ErrorView · default (기본)">
              <ErrorView
                title="데이터를 불러오지 못했습니다"
                description="네트워크 상태를 확인하고 다시 시도해 주세요."
              />
            </Section>
            <Spacer size="2xl" />

            <Section title="ErrorView · with action (액션 포함)">
              <ErrorView
                title="요청에 실패했습니다"
                description="서버에 일시적인 문제가 발생했을 수 있습니다."
                action={{
                  label: '다시 시도',
                  onPress: () => Alert.alert('ErrorView', '다시 시도 클릭됨'),
                }}
              />
            </Section>
            <Spacer size="2xl" />

            <Section title="ErrorView · title only (제목만)">
              <ErrorView title="알 수 없는 오류가 발생했습니다" />
            </Section>
          </>
        )}

        {activeGroup === 'loading-view' && (
          <>
            <Section title="LoadingView · spinner only (스피너만, large)">
              <LoadingView />
            </Section>
            <Spacer size="2xl" />

            <Section title="LoadingView · with message (메시지 포함, large)">
              <LoadingView message="데이터를 불러오는 중..." />
            </Section>
            <Spacer size="2xl" />

            <Section title="LoadingView · small + message (작게, 메시지 포함)">
              <LoadingView size="small" message="처리 중..." />
            </Section>
          </>
        )}

        {activeGroup === 'skeleton' && (
          <>
            <Section title="Skeleton · variants (rect / circle / text)">
              <SkeletonRow>
                <Skeleton type="rect" width={200} height={16} />
                <Skeleton type="circle" size={40} />
              </SkeletonRow>
              <Spacer size="lg" />
              <Skeleton type="text" />
            </Section>
            <Spacer size="2xl" />

            <Section title="Skeleton · Card placeholder (Title + Avatar + 3 lines)">
              <SkeletonCard>
                <SkeletonRow>
                  <Skeleton type="circle" size={40} />
                  <Skeleton type="rect" width={180} height={20} />
                </SkeletonRow>
                <Spacer size="md" />
                <Skeleton type="text" lines={3} lineWidths={['100%', '80%', '60%']} />
              </SkeletonCard>
            </Section>
            <Spacer size="2xl" />

            <Section title="Skeleton · List item placeholder (3 rows)">
              <SkeletonCard>
                <SkeletonListRow>
                  <Skeleton type="circle" size={24} />
                  <Skeleton type="text" lines={2} lineWidths={['100%', '65%']} lineHeight={10} />
                </SkeletonListRow>
                <Spacer size="md" />
                <SkeletonListRow>
                  <Skeleton type="circle" size={24} />
                  <Skeleton type="text" lines={2} lineWidths={['100%', '65%']} lineHeight={10} />
                </SkeletonListRow>
                <Spacer size="md" />
                <SkeletonListRow>
                  <Skeleton type="circle" size={24} />
                  <Skeleton type="text" lines={2} lineWidths={['100%', '65%']} lineHeight={10} />
                </SkeletonListRow>
              </SkeletonCard>
            </Section>
            <Spacer size="2xl" />

            <Section title="Skeleton · Comment placeholder (Avatar + 3 lines)">
              <SkeletonCard>
                <SkeletonCommentRow>
                  <Skeleton type="circle" size={40} />
                  <SkeletonCommentLines>
                    <Skeleton type="text" lines={3} lineWidths={['100%', '90%', '70%']} />
                  </SkeletonCommentLines>
                </SkeletonCommentRow>
              </SkeletonCard>
            </Section>
          </>
        )}

        {activeGroup === 'progress' && (
          <>
            <Section title="Linear · determinate (3 sizes × 25/50/75%)">
              <ProgressList>
                <ProgressColumn>
                  <Text variant="labelSm" color="muted">sm · 25%</Text>
                  <LinearProgress value={25} size="sm" />
                </ProgressColumn>
                <ProgressColumn>
                  <Text variant="labelSm" color="muted">sm · 50%</Text>
                  <LinearProgress value={50} size="sm" />
                </ProgressColumn>
                <ProgressColumn>
                  <Text variant="labelSm" color="muted">sm · 75%</Text>
                  <LinearProgress value={75} size="sm" />
                </ProgressColumn>
                <ProgressColumn>
                  <Text variant="labelSm" color="muted">md · 25%</Text>
                  <LinearProgress value={25} size="md" />
                </ProgressColumn>
                <ProgressColumn>
                  <Text variant="labelSm" color="muted">md · 50%</Text>
                  <LinearProgress value={50} size="md" />
                </ProgressColumn>
                <ProgressColumn>
                  <Text variant="labelSm" color="muted">md · 75%</Text>
                  <LinearProgress value={75} size="md" />
                </ProgressColumn>
                <ProgressColumn>
                  <Text variant="labelSm" color="muted">lg · 25%</Text>
                  <LinearProgress value={25} size="lg" />
                </ProgressColumn>
                <ProgressColumn>
                  <Text variant="labelSm" color="muted">lg · 50%</Text>
                  <LinearProgress value={50} size="lg" />
                </ProgressColumn>
                <ProgressColumn>
                  <Text variant="labelSm" color="muted">lg · 75%</Text>
                  <LinearProgress value={75} size="lg" />
                </ProgressColumn>
              </ProgressList>
            </Section>
            <Spacer size="2xl" />

            <Section title="Linear · indeterminate (3 sizes, 1.5s 좌→우 무한 슬라이드)">
              <ProgressList>
                <ProgressColumn>
                  <Text variant="labelSm" color="muted">sm ↻</Text>
                  <LinearProgress variant="indeterminate" size="sm" />
                </ProgressColumn>
                <ProgressColumn>
                  <Text variant="labelSm" color="muted">md ↻</Text>
                  <LinearProgress variant="indeterminate" size="md" />
                </ProgressColumn>
                <ProgressColumn>
                  <Text variant="labelSm" color="muted">lg ↻</Text>
                  <LinearProgress variant="indeterminate" size="lg" />
                </ProgressColumn>
              </ProgressList>
            </Section>
            <Spacer size="2xl" />

            <Section title="Circular · determinate (3 sizes × 25/50/75%)">
              <CircularRow>
                <CircularItem>
                  <CircularProgress value={25} size="sm" />
                  <Text variant="labelSm" color="muted">sm 25%</Text>
                </CircularItem>
                <CircularItem>
                  <CircularProgress value={50} size="sm" />
                  <Text variant="labelSm" color="muted">sm 50%</Text>
                </CircularItem>
                <CircularItem>
                  <CircularProgress value={75} size="sm" />
                  <Text variant="labelSm" color="muted">sm 75%</Text>
                </CircularItem>
                <CircularItem>
                  <CircularProgress value={25} size="md" />
                  <Text variant="labelSm" color="muted">md 25%</Text>
                </CircularItem>
                <CircularItem>
                  <CircularProgress value={50} size="md" />
                  <Text variant="labelSm" color="muted">md 50%</Text>
                </CircularItem>
                <CircularItem>
                  <CircularProgress value={75} size="md" />
                  <Text variant="labelSm" color="muted">md 75%</Text>
                </CircularItem>
                <CircularItem>
                  <CircularProgress value={25} size="lg" />
                  <Text variant="labelSm" color="muted">lg 25%</Text>
                </CircularItem>
                <CircularItem>
                  <CircularProgress value={50} size="lg" />
                  <Text variant="labelSm" color="muted">lg 50%</Text>
                </CircularItem>
                <CircularItem>
                  <CircularProgress value={75} size="lg" />
                  <Text variant="labelSm" color="muted">lg 75%</Text>
                </CircularItem>
              </CircularRow>
            </Section>
            <Spacer size="2xl" />

            <Section title="Circular · indeterminate (3 sizes, 1.5s 회전 + arc 35%)">
              <CircularRow>
                <CircularItem>
                  <CircularProgress variant="indeterminate" size="sm" />
                  <Text variant="labelSm" color="muted">sm ↻</Text>
                </CircularItem>
                <CircularItem>
                  <CircularProgress variant="indeterminate" size="md" />
                  <Text variant="labelSm" color="muted">md ↻</Text>
                </CircularItem>
                <CircularItem>
                  <CircularProgress variant="indeterminate" size="lg" />
                  <Text variant="labelSm" color="muted">lg ↻</Text>
                </CircularItem>
              </CircularRow>
            </Section>
            <Spacer size="2xl" />

            <Section title="Linear · 다운로드 시뮬레이션 (500ms +5%, 10초 cycle)">
              <DemoLinearDownload />
            </Section>
            <Spacer size="2xl" />

            <Section title="Circular · 다운로드 시뮬레이션 (500ms +5%, 10초 cycle)">
              <CircularRow>
                <DemoCircularDownload />
              </CircularRow>
            </Section>
          </>
        )}

        {activeGroup === 'toast' && (
          <>
            <Section title="Toast · 3 types (3가지 유형)">
              <StackedButtons>
                <Button
                  label="Success Toast"
                  variant="primary"
                  onPress={() =>
                    toast.success(
                      '항목이 저장되었습니다',
                      '선택 항목이 저장되었습니다.',
                    )
                  }
                />
                <Button
                  label="Error Toast"
                  variant="primary"
                  onPress={() =>
                    toast.error('저장 실패', '네트워크 연결을 확인해주세요.')
                  }
                />
                <Button
                  label="Info Toast"
                  variant="primary"
                  onPress={() =>
                    toast.info('새 데이터 도착', '결과가 업데이트되었습니다.')
                  }
                />
              </StackedButtons>
            </Section>
            <Spacer size="2xl" />

            <Section title="Toast · sequential (3개 큐 순차 표시)">
              <Button
                label="Show 3 Toasts (순차)"
                variant="secondary"
                onPress={() => {
                  toast.success('첫 번째');
                  toast.info('두 번째');
                  toast.error('세 번째');
                }}
              />
            </Section>
            <Spacer size="2xl" />

            <Section title="Toast · queue overflow (큐 초과 → 가장 오래된 것 제거)">
              <Button
                label="Show 4 Toasts (queue overflow)"
                variant="secondary"
                onPress={() => {
                  toast.success('첫 번째 (제거됨)');
                  toast.info('두 번째');
                  toast.error('세 번째');
                  toast.info('네 번째 (최신, 보존)');
                }}
              />
            </Section>
            <Spacer size="2xl" />

            <Section title="Toast · manual dismiss (수동 닫기, duration 0)">
              <Button
                label="Show Persistent Toast"
                variant="secondary"
                onPress={() =>
                  useToastStore.getState().show({
                    type: 'info',
                    title: '수동 닫기 토스트',
                    description: 'X 버튼을 눌러 닫으세요',
                    duration: 0,
                  })
                }
              />
            </Section>
          </>
        )}

        {activeGroup === 'dialog' && (
          <>
            <Section title="Dialog · Info (정보)">
              <Button
                label="Show Info Dialog"
                variant="primary"
                onPress={async () => {
                  await dialog.info({
                    title: '네트워크 오류',
                    description:
                      '서버에 연결할 수 없습니다. 네트워크 연결을 확인하고 다시 시도해주세요.',
                  });
                  console.log('Info 닫힘');
                }}
              />
            </Section>
            <Spacer size="2xl" />

            <Section title="Dialog · Confirm (확인)">
              <StackedButtons>
                <Button
                  label="Show Confirm (Destructive)"
                  variant="primary"
                  onPress={async () => {
                    const confirmed = await dialog.confirm({
                      title: '항목 삭제',
                      description:
                        '이 항목을 삭제합니다. 이 작업은 되돌릴 수 없습니다.',
                      destructive: true,
                      confirmLabel: '삭제',
                    });
                    console.log('Confirm 결과:', confirmed);
                  }}
                />
                <Button
                  label="Show Confirm (Default)"
                  variant="secondary"
                  onPress={async () => {
                    const confirmed = await dialog.confirm({
                      title: '데이터 갱신',
                      description: '최신 데이터를 가져옵니다.',
                    });
                    console.log('Confirm 결과:', confirmed);
                  }}
                />
              </StackedButtons>
            </Section>
            <Spacer size="2xl" />

            <Section title="Dialog · Prompt (입력)">
              <Button
                label="Show Prompt Dialog"
                variant="primary"
                onPress={async () => {
                  const value = await dialog.prompt({
                    title: '텍스트 입력',
                    description: '값을 입력하세요.',
                    placeholder: '예시',
                    confirmLabel: '저장',
                  });
                  if (value !== null) {
                    console.log('Prompt 입력:', value);
                  } else {
                    console.log('Prompt 취소');
                  }
                }}
              />
            </Section>
            <Spacer size="2xl" />

            <Section title="Dialog · queueing (큐잉 테스트, 순차 표시)">
              <Button
                label="Show 2 Dialogs"
                variant="secondary"
                onPress={async () => {
                  const r1 = await dialog.confirm({
                    title: '첫 번째 (큐 테스트)',
                    description: '이 다이얼로그가 닫히면 두 번째가 표시됩니다.',
                  });
                  console.log('1번 결과:', r1);

                  await dialog.info({
                    title: '두 번째 (큐 진입)',
                    description: '큐에서 꺼내져 표시되었습니다.',
                  });
                  console.log('2번 완료');
                }}
              />
            </Section>
          </>
        )}
      </ScrollView>
    </Screen>
  );
}
