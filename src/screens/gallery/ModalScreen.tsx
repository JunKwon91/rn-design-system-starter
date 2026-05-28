// ============================================================================
// ModalScreen — modal 카테고리 갤러리
// ============================================================================
// Toast · Dialog · BottomSheet (3 그룹 탭 패턴). 전역 호스트 + Zustand store +
// imperative API 일관. FeedbackScreen 패턴 동일.
// ============================================================================

import { useState } from 'react';
import { Alert, ScrollView } from 'react-native';
import { ScrollView as RNGHScrollView } from 'react-native-gesture-handler';
import styled, { useTheme } from 'styled-components/native';

import { Button } from '@/components/action';
import { Tabs } from '@/components/display';
import { Input } from '@/components/input';
import { BottomSheet } from '@/components/modal';
import { Spacer, Text } from '@/components/primitives';
import { Screen, Section } from '@/components/surface';
import { bottomSheet } from '@/stores/bottomSheetStore';
import { dialog } from '@/stores/dialogStore';
import { toast, useToastStore } from '@/stores/toastStore';

const StackedButtons = styled.View`
  gap: 8px;
`;

const BottomSheetCaseColumn = styled.View`
  gap: ${({ theme }) => theme.spacing.md}px;
`;

const BottomSheetCase = styled.View`
  gap: ${({ theme }) => theme.spacing.xs}px;
`;

const SheetContentWrap = styled.View`
  gap: ${({ theme }) => theme.spacing.md}px;
`;

const SheetActions = styled.View`
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing.sm}px;
  justify-content: flex-end;
`;

const SheetScrollContainer = styled(RNGHScrollView)`
  flex: 1;
`;

const ScrollItem = styled.View`
  padding-top: ${({ theme }) => theme.spacing.sm}px;
  padding-bottom: ${({ theme }) => theme.spacing.sm}px;
  border-bottom-width: 1px;
  border-bottom-color: ${({ theme }) => theme.colors.border.subtle};
`;

const GROUPS = [
  { value: 'toast', label: 'Toast (토스트)' },
  { value: 'dialog', label: 'Dialog (다이얼로그)' },
  { value: 'bottom-sheet', label: 'BottomSheet (바텀시트)' },
] as const;

type GroupValue = typeof GROUPS[number]['value'];

function DemoBottomSheetControlled() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <BottomSheetCase>
      <Text variant="labelSm" color="muted">
        5) controlled mode (visible prop)
      </Text>
      <Button
        label="controlled BottomSheet 열기 (height 60%)"
        variant="secondary"
        onPress={() => setIsOpen(true)}
      />
      <BottomSheet
        visible={isOpen}
        onDismiss={() => setIsOpen(false)}
        height="60%"
      >
        <SheetContentWrap>
          <Text variant="headlineSm" color="primary">
            controlled mode
          </Text>
          <Text variant="bodyBase" color="secondary">
            visible prop으로 외부 제어. drag-down · 백드롭 탭 · Android
            BackHandler · 아래 닫기 버튼 모두 dismiss.
          </Text>
          <SheetActions>
            <Button
              label="닫기"
              variant="secondary"
              onPress={() => setIsOpen(false)}
            />
          </SheetActions>
        </SheetContentWrap>
      </BottomSheet>
    </BottomSheetCase>
  );
}

export default function ModalScreen() {
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

        {activeGroup === 'bottom-sheet' && (
          <>
            <Section title="BottomSheet (단일 snap · drag dismiss · 백드롭 탭 · BackHandler)">
              <BottomSheetCaseColumn>
                <BottomSheetCase>
                  <Text variant="labelSm" color="muted">
                    1) 기본 height &apos;auto&apos; (화면 50%)
                  </Text>
                  <Button
                    label="기본 BottomSheet 열기"
                    variant="primary"
                    onPress={() =>
                      bottomSheet.open({
                        children: (
                          <SheetContentWrap>
                            <Text variant="headlineSm" color="primary">
                              기본 BottomSheet
                            </Text>
                            <Text variant="bodyBase" color="secondary">
                              height 미지정 시 화면의 50%로 표시. handle bar를 아래로 끌어 dismiss 가능.
                            </Text>
                            <SheetActions>
                              <Button
                                label="닫기"
                                variant="secondary"
                                onPress={() => bottomSheet.close()}
                              />
                            </SheetActions>
                          </SheetContentWrap>
                        ),
                      })
                    }
                  />
                </BottomSheetCase>

                <BottomSheetCase>
                  <Text variant="labelSm" color="muted">
                    2) 백분율 height (&apos;50%&apos;)
                  </Text>
                  <Button
                    label="50% BottomSheet 열기"
                    variant="secondary"
                    onPress={() =>
                      bottomSheet.open({
                        height: '50%',
                        children: (
                          <SheetContentWrap>
                            <Text variant="headlineSm" color="primary">
                              50% 높이
                            </Text>
                            <Text variant="bodyBase" color="secondary">
                              화면 높이의 50%로 명시적으로 지정. 반응형 — 디바이스마다 픽셀이 달라진다.
                            </Text>
                            <SheetActions>
                              <Button
                                label="닫기"
                                variant="secondary"
                                onPress={() => bottomSheet.close()}
                              />
                            </SheetActions>
                          </SheetContentWrap>
                        ),
                      })
                    }
                  />
                </BottomSheetCase>

                <BottomSheetCase>
                  <Text variant="labelSm" color="muted">
                    3) 픽셀 height (400px)
                  </Text>
                  <Button
                    label="400px BottomSheet 열기"
                    variant="secondary"
                    onPress={() =>
                      bottomSheet.open({
                        height: 400,
                        children: (
                          <SheetContentWrap>
                            <Text variant="headlineSm" color="primary">
                              400px 고정 높이
                            </Text>
                            <Text variant="bodyBase" color="secondary">
                              디바이스 무관 고정 픽셀 높이. 컨텐츠 양이 정해진 시트에 적합.
                            </Text>
                            <SheetActions>
                              <Button
                                label="닫기"
                                variant="secondary"
                                onPress={() => bottomSheet.close()}
                              />
                            </SheetActions>
                          </SheetContentWrap>
                        ),
                      })
                    }
                  />
                </BottomSheetCase>

                <BottomSheetCase>
                  <Text variant="labelSm" color="muted">
                    4) imperative API + onDismiss 콜백
                  </Text>
                  <Button
                    label="onDismiss 콜백 BottomSheet"
                    variant="secondary"
                    onPress={() =>
                      bottomSheet.open({
                        height: '40%',
                        onDismiss: () =>
                          Alert.alert('BottomSheet dismiss', 'onDismiss 콜백 호출됨'),
                        children: (
                          <SheetContentWrap>
                            <Text variant="headlineSm" color="primary">
                              dismiss 콜백
                            </Text>
                            <Text variant="bodyBase" color="secondary">
                              drag-down · 백드롭 탭 · 닫기 버튼 어느 경로로 닫혀도 onDismiss 콜백이 1회 호출된다.
                            </Text>
                            <SheetActions>
                              <Button
                                label="닫기"
                                variant="secondary"
                                onPress={() => bottomSheet.close()}
                              />
                            </SheetActions>
                          </SheetContentWrap>
                        ),
                      })
                    }
                  />
                </BottomSheetCase>

                <DemoBottomSheetControlled />

                <BottomSheetCase>
                  <Text variant="labelSm" color="muted">
                    6) 다중 snap 기본 (25% / 50% / 90%)
                  </Text>
                  <Button
                    label="다중 snap BottomSheet 열기"
                    variant="primary"
                    onPress={() =>
                      bottomSheet.open({
                        snapPoints: ['25%', '50%', '90%'],
                        children: (
                          <SheetContentWrap>
                            <Text variant="headlineSm" color="primary">
                              다중 snap
                            </Text>
                            <Text variant="bodyBase" color="secondary">
                              handle bar를 위·아래로 드래그하면 25% / 50% / 90% snap 사이를 이동.
                              빠른 velocity는 다음 snap 방향으로 자연 이동.
                            </Text>
                            <SheetActions>
                              <Button
                                label="닫기"
                                variant="secondary"
                                onPress={() => bottomSheet.close()}
                              />
                            </SheetActions>
                          </SheetContentWrap>
                        ),
                      })
                    }
                  />
                </BottomSheetCase>

                <BottomSheetCase>
                  <Text variant="labelSm" color="muted">
                    7) initialSnap 중간 시작 (index 1 = 50%)
                  </Text>
                  <Button
                    label="50%에서 시작하는 BottomSheet 열기"
                    variant="secondary"
                    onPress={() =>
                      bottomSheet.open({
                        snapPoints: ['25%', '50%', '90%'],
                        initialSnap: 1,
                        children: (
                          <SheetContentWrap>
                            <Text variant="headlineSm" color="primary">
                              initialSnap = 1
                            </Text>
                            <Text variant="bodyBase" color="secondary">
                              중간 snap(50%)에서 시작. drag로 위(90%) 또는 아래(25%)로 이동.
                            </Text>
                            <SheetActions>
                              <Button
                                label="닫기"
                                variant="secondary"
                                onPress={() => bottomSheet.close()}
                              />
                            </SheetActions>
                          </SheetContentWrap>
                        ),
                      })
                    }
                  />
                </BottomSheetCase>

                <BottomSheetCase>
                  <Text variant="labelSm" color="muted">
                    8) snapTo imperative API
                  </Text>
                  <Button
                    label="snapTo 시연 BottomSheet 열기"
                    variant="secondary"
                    onPress={() =>
                      bottomSheet.open({
                        snapPoints: ['25%', '50%', '90%'],
                        children: (
                          <SheetContentWrap>
                            <Text variant="headlineSm" color="primary">
                              snapTo 외부 제어
                            </Text>
                            <Text variant="bodyBase" color="secondary">
                              아래 버튼으로 외부에서 snap 변경. drag로도 이동 가능 — 둘 모두 onSnapChange 트리거.
                            </Text>
                            <SheetActions>
                              <Button
                                label="25%"
                                variant="secondary"
                                onPress={() => bottomSheet.snapTo(0)}
                              />
                              <Button
                                label="50%"
                                variant="secondary"
                                onPress={() => bottomSheet.snapTo(1)}
                              />
                              <Button
                                label="90%"
                                variant="secondary"
                                onPress={() => bottomSheet.snapTo(2)}
                              />
                            </SheetActions>
                            <SheetActions>
                              <Button
                                label="닫기"
                                variant="secondary"
                                onPress={() => bottomSheet.close()}
                              />
                            </SheetActions>
                          </SheetContentWrap>
                        ),
                      })
                    }
                  />
                </BottomSheetCase>

                <BottomSheetCase>
                  <Text variant="labelSm" color="muted">
                    9) scrollable content (긴 리스트 + drag 양립)
                  </Text>
                  <Button
                    label="scrollable BottomSheet 열기"
                    variant="secondary"
                    onPress={() =>
                      bottomSheet.open({
                        snapPoints: ['25%', '50%', '90%'],
                        children: (
                          <SheetScrollContainer>
                            <Text variant="headlineSm" color="primary">
                              scrollable content
                            </Text>
                            <Text variant="bodyBase" color="secondary">
                              handle bar drag로 snap 이동, ScrollView 자체 스크롤로 모든 항목과 닫기 버튼 접근. 모든 snap에서 가시 영역과 자연 일치.
                            </Text>
                            {Array.from({ length: 50 }).map((_, i) => (
                              <ScrollItem key={i}>
                                <Text variant="bodyBase" color="primary">
                                  항목 {i + 1}
                                </Text>
                              </ScrollItem>
                            ))}
                            <Spacer size="md" />
                            <SheetActions>
                              <Button
                                label="닫기"
                                variant="secondary"
                                onPress={() => bottomSheet.close()}
                              />
                            </SheetActions>
                          </SheetScrollContainer>
                        ),
                      })
                    }
                  />
                </BottomSheetCase>

                <BottomSheetCase>
                  <Text variant="labelSm" color="muted">
                    10) TextInput + 키보드 양립 (form 시연)
                  </Text>
                  <Button
                    label="form BottomSheet 열기"
                    variant="primary"
                    onPress={() =>
                      bottomSheet.open({
                        snapPoints: ['50%', '90%'],
                        children: (
                          <SheetContentWrap>
                            <Text variant="headlineSm" color="primary">
                              문의 양식
                            </Text>
                            <Text variant="bodyBase" color="secondary">
                              TextInput focus 시 시트가 키보드 위로 자연 이동. 다중 input 사이 focus 이동 자유.
                            </Text>
                            <Input label="이름" placeholder="홍길동" />
                            <Input
                              label="이메일"
                              placeholder="example@email.com"
                              keyboardType="email-address"
                              autoCapitalize="none"
                            />
                            <Input
                              label="메시지"
                              placeholder="문의 내용을 입력하세요"
                              multiline
                            />
                            <SheetActions>
                              <Button
                                label="닫기"
                                variant="secondary"
                                onPress={() => bottomSheet.close()}
                              />
                              <Button
                                label="제출"
                                variant="primary"
                                onPress={() => {
                                  Alert.alert(
                                    '제출 완료',
                                    '문의가 접수되었습니다.',
                                  );
                                  bottomSheet.close();
                                }}
                              />
                            </SheetActions>
                          </SheetContentWrap>
                        ),
                      })
                    }
                  />
                </BottomSheetCase>
              </BottomSheetCaseColumn>
            </Section>
          </>
        )}
      </ScrollView>
    </Screen>
  );
}
