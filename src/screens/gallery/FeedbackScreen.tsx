// ============================================================================
// FeedbackScreen — Feedback 카테고리 갤러리
// ============================================================================
// EmptyState · ErrorView · LoadingView · Skeleton · Progress · Tooltip (6 그룹
// 탭 패턴). Toast / Dialog / BottomSheet는 ModalScreen으로 이동.
// ============================================================================

import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, TouchableOpacity, View } from 'react-native';
import { HelpCircle, Inbox, Search, Settings, Star, Trash } from 'lucide-react-native';
import styled, { useTheme } from 'styled-components/native';

import { IconButton } from '@/components/action';
import { Tabs } from '@/components/display';
import {
  CircularProgress,
  EmptyState,
  ErrorView,
  LinearProgress,
  LoadingView,
  Skeleton,
  Tooltip,
} from '@/components/feedback';
import { Spacer, Text } from '@/components/primitives';
import { Screen, Section } from '@/components/surface';

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

const TooltipGrid = styled.View`
  gap: 56px;
  padding-top: 32px;
  padding-bottom: 32px;
`;

const TooltipGridRow = styled.View`
  flex-direction: row;
  justify-content: space-evenly;
  align-items: center;
`;

const TooltipItem = styled.View`
  align-items: center;
  gap: 12px;
  width: 140px;
`;

const TooltipCenter = styled.View`
  align-items: center;
  padding-top: 48px;
  padding-bottom: 16px;
`;

// 라이브러리 종속성 검증 섹션 (RN Pressable / View / TouchableOpacity)
const VerifyColumn = styled.View`
  align-items: center;
  gap: 24px;
  padding-top: 48px;
  padding-bottom: 16px;
`;

const VerifyBox = styled(Pressable)`
  padding-left: 16px;
  padding-right: 16px;
  padding-top: 10px;
  padding-bottom: 10px;
  border-radius: 8px;
  background-color: ${({ theme }) => theme.colors.surface.container};
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.border.default};
`;

const VerifyBoxView = styled(View)`
  padding-left: 16px;
  padding-right: 16px;
  padding-top: 10px;
  padding-bottom: 10px;
  border-radius: 8px;
  background-color: ${({ theme }) => theme.colors.surface.container};
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.border.default};
`;

const VerifyBoxTouchable = styled(TouchableOpacity)`
  padding-left: 16px;
  padding-right: 16px;
  padding-top: 10px;
  padding-bottom: 10px;
  border-radius: 8px;
  background-color: ${({ theme }) => theme.colors.surface.container};
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.border.default};
`;

const VerifyCase = styled.View`
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm}px;
`;

const GROUPS = [
  { value: 'empty-state', label: 'EmptyState (빈 상태)' },
  { value: 'error-view', label: 'ErrorView (오류)' },
  { value: 'loading-view', label: 'LoadingView (로딩)' },
  { value: 'skeleton', label: 'Skeleton (스켈레톤)' },
  { value: 'progress', label: 'Progress (진행률)' },
  { value: 'tooltip', label: 'Tooltip (도구 설명)' },
] as const;

type GroupValue = typeof GROUPS[number]['value'];

const DOWNLOAD_STEP = 5;
const DOWNLOAD_INTERVAL = 500;

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

function DemoTooltipBlink() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const id = setInterval(() => {
      setVisible(v => !v);
    }, 2000);
    return () => clearInterval(id);
  }, []);
  return (
    <TooltipItem>
      <Tooltip
        text={visible ? '표시 중 (visible=true)' : '곧 다시 표시'}
        position="top"
        visible={visible}
      >
        <IconButton
          icon={<HelpCircle />}
          onPress={() => undefined}
          accessibilityLabel="자동 점멸 데모"
        />
      </Tooltip>
      <Text variant="labelSm" color="muted">
        현재 visible={String(visible)}
      </Text>
    </TooltipItem>
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

            <Section title="Circular · indeterminate (3 sizes, 1s 시계 방향 회전)">
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

            <Section title="다운로드 시뮬레이션 (500ms +5% 10초 cycle)">
              <DemoLinearDownload />
              <Spacer size="lg" />
              <DemoCircularDownload />
            </Section>
          </>
        )}

        {activeGroup === 'tooltip' && (
          <>
            <Section title="Tooltip · 4 position (롱프레스 500ms → 자동 dismiss 1500ms)">
              <TooltipGrid>
                <TooltipGridRow>
                  <TooltipItem>
                    <Tooltip text="위쪽 도구 설명" position="top">
                      <IconButton
                        icon={<Settings />}
                        onPress={() => undefined}
                        accessibilityLabel="설정"
                      />
                    </Tooltip>
                    <Text variant="labelSm" color="muted">top</Text>
                  </TooltipItem>
                  <TooltipItem>
                    <Tooltip text="아래쪽 도구 설명" position="bottom">
                      <IconButton
                        icon={<Star />}
                        onPress={() => undefined}
                        accessibilityLabel="즐겨찾기"
                      />
                    </Tooltip>
                    <Text variant="labelSm" color="muted">bottom</Text>
                  </TooltipItem>
                </TooltipGridRow>
                <TooltipGridRow>
                  <TooltipItem>
                    <Tooltip text="오른쪽 도구 설명" position="right">
                      <IconButton
                        icon={<Trash />}
                        onPress={() => undefined}
                        accessibilityLabel="삭제"
                      />
                    </Tooltip>
                    <Text variant="labelSm" color="muted">right</Text>
                  </TooltipItem>
                  <TooltipItem>
                    <Tooltip text="왼쪽 도구 설명" position="left">
                      <IconButton
                        icon={<Search />}
                        onPress={() => undefined}
                        accessibilityLabel="검색"
                      />
                    </Tooltip>
                    <Text variant="labelSm" color="muted">left</Text>
                  </TooltipItem>
                </TooltipGridRow>
              </TooltipGrid>
            </Section>
            <Spacer size="2xl" />

            <Section title="Tooltip · visible prop (외부 제어 자동 점멸 2초)">
              <TooltipCenter>
                <DemoTooltipBlink />
              </TooltipCenter>
            </Section>
            <Spacer size="2xl" />

            <Section title="라이브러리 종속성 검증 (3 케이스 — RN 표준 PressableProps 수용)">
              <VerifyColumn>
                <VerifyCase>
                  <Text variant="labelSm" color="muted">RN Pressable</Text>
                  <Tooltip text="RN Pressable wrap 정상 작동" position="top">
                    <VerifyBox
                      onPress={() => Alert.alert('Pressable', '클릭됨')}
                    >
                      <Text variant="bodyBase" color="primary">
                        Pressable (롱프레스로 Tooltip)
                      </Text>
                    </VerifyBox>
                  </Tooltip>
                </VerifyCase>
                <VerifyCase>
                  <Text variant="labelSm" color="muted">RN View (Pressable wrap)</Text>
                  <Tooltip text="View는 onLongPress 미수용 → Pressable wrap 필요" position="top">
                    <Pressable
                      onPress={() => Alert.alert('View+Pressable', '클릭됨')}
                    >
                      <VerifyBoxView>
                        <Text variant="bodyBase" color="primary">
                          View (Pressable로 직접 wrap)
                        </Text>
                      </VerifyBoxView>
                    </Pressable>
                  </Tooltip>
                </VerifyCase>
                <VerifyCase>
                  <Text variant="labelSm" color="muted">RN TouchableOpacity</Text>
                  <Tooltip text="TouchableOpacity는 onLongPress 수용" position="top">
                    <VerifyBoxTouchable
                      onPress={() => Alert.alert('TouchableOpacity', '클릭됨')}
                    >
                      <Text variant="bodyBase" color="primary">
                        TouchableOpacity (롱프레스로 Tooltip)
                      </Text>
                    </VerifyBoxTouchable>
                  </Tooltip>
                </VerifyCase>
              </VerifyColumn>
            </Section>
          </>
        )}
      </ScrollView>
    </Screen>
  );
}
