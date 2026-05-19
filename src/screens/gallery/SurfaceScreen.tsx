// ============================================================================
// SurfaceScreen — Surface 카테고리 갤러리
// ============================================================================
// Card · Surface tokens · Section — 컴포넌트 단위 3 탭, 세부 변형 세로 스크롤.
// ============================================================================

import { useState } from 'react';
import { ScrollView } from 'react-native';
import styled, { useTheme } from 'styled-components/native';

import { Tabs } from '@/components/display';
import { Spacer, Text } from '@/components/primitives';
import { Card, Screen, Section } from '@/components/surface';

const SurfaceSampleBox = styled.View<{ $bg: string }>`
  height: 56px;
  border-radius: ${({ theme }) => theme.radius.md}px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.border.subtle};
  background-color: ${({ $bg }) => $bg};
  justify-content: center;
  padding-left: ${({ theme }) => theme.spacing.md}px;
  padding-right: ${({ theme }) => theme.spacing.md}px;
`;

const SECTIONS = [
  { value: 'card', label: 'Card (카드)' },
  { value: 'surface', label: 'Surface tokens (표면 토큰)' },
  { value: 'section', label: 'Section (섹션)' },
] as const;

type SectionValue = typeof SECTIONS[number]['value'];

export default function SurfaceScreen() {
  const theme = useTheme();
  const [activeSection, setActiveSection] = useState<SectionValue>(
    SECTIONS[0].value,
  );

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
        {activeSection === 'card' && (
          <Section title="Card (카드)">
            <Text variant="labelSm" color="muted">
              variant (default · elevated)
            </Text>
            <Card>
              <Text>default variant (보더 있음)</Text>
            </Card>
            <Card variant="elevated">
              <Text>elevated variant (보더 없음)</Text>
            </Card>
            <Text variant="labelSm" color="muted">
              density (default · compact)
            </Text>
            <Card title="default density" meta="padding 16">
              <Text>일반 카드</Text>
            </Card>
            <Card density="compact" title="compact density" meta="padding 12">
              <Text>컴팩트 카드</Text>
            </Card>
            <Text variant="labelSm" color="muted">
              title + meta + showDivider
            </Text>
            <Card title="개요" meta="이번 달" showDivider>
              <Text>showDivider가 true면 헤더 아래 구분선이 나타난다.</Text>
            </Card>
          </Section>
        )}

        {activeSection === 'surface' && (
          <Section title="Surface tokens (표면 토큰)" spacing="compact">
            <SurfaceSampleBox $bg={theme.colors.surface.containerLowest}>
              <Text variant="bodySm">surface.containerLowest</Text>
            </SurfaceSampleBox>
            <SurfaceSampleBox $bg={theme.colors.surface.base}>
              <Text variant="bodySm">surface.base</Text>
            </SurfaceSampleBox>
            <SurfaceSampleBox $bg={theme.colors.surface.container}>
              <Text variant="bodySm">surface.container</Text>
            </SurfaceSampleBox>
          </Section>
        )}

        {activeSection === 'section' && (
          <>
            <Section title="Section · default spacing (기본 간격)">
              <Card><Text>card 1</Text></Card>
              <Card><Text>card 2</Text></Card>
              <Card><Text>card 3</Text></Card>
            </Section>
            <Spacer size="2xl" />

            <Section title="Section · compact spacing (좁은 간격)" spacing="compact">
              <Card density="compact"><Text>card 1</Text></Card>
              <Card density="compact"><Text>card 2</Text></Card>
              <Card density="compact"><Text>card 3</Text></Card>
            </Section>
            <Spacer size="2xl" />

            <Section title="Section · roomy spacing (넓은 간격)" spacing="roomy">
              <Card><Text>card 1</Text></Card>
              <Card><Text>card 2</Text></Card>
            </Section>
            <Spacer size="2xl" />

            <Section
              title="Section with action (액션 포함)"
              action={
                <Text variant="bodySm" color="accent">전체 보기</Text>
              }
            >
              <Card><Text>action prop 검증용 컨텐츠</Text></Card>
            </Section>
          </>
        )}
      </ScrollView>
    </Screen>
  );
}
