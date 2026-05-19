// ============================================================================
// FeedbackScreen — Feedback 카테고리 갤러리
// ============================================================================
// EmptyState · ErrorView · LoadingView · Toast · Dialog (5 그룹 탭 패턴).
// 17개 섹션을 5 그룹으로 묶고 Tabs로 전환. 각 그룹 안의 섹션은 세로 스크롤.
// ============================================================================

import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Inbox, Search, Star } from 'lucide-react-native';
import { useTheme } from 'styled-components/native';

import { Button } from '@/components/action';
import { Tabs } from '@/components/display';
import {
  EmptyState,
  ErrorView,
  LoadingView,
} from '@/components/feedback';
import { Spacer } from '@/components/primitives';
import { Screen, Section } from '@/components/surface';
import { dialog } from '@/stores/dialogStore';
import { toast, useToastStore } from '@/stores/toastStore';

const GROUPS = [
  { value: 'empty-state', label: 'EmptyState (빈 상태)' },
  { value: 'error-view', label: 'ErrorView (오류)' },
  { value: 'loading-view', label: 'LoadingView (로딩)' },
  { value: 'toast', label: 'Toast (토스트)' },
  { value: 'dialog', label: 'Dialog (다이얼로그)' },
] as const;

type GroupValue = typeof GROUPS[number]['value'];

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
                  onPress: () => console.log('reset search'),
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
                  onPress: () => console.log('retry'),
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

        {activeGroup === 'toast' && (
          <>
            <Section title="Toast · 3 types (3가지 유형)">
              <View style={{ gap: 8 }}>
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
              </View>
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
              <View style={{ gap: 8 }}>
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
              </View>
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
