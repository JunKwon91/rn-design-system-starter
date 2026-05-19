// ============================================================================
// PrimitivesScreen — Primitives 카테고리 갤러리
// ============================================================================
// Text · Spacer · Divider — 컴포넌트 단위 3 탭, 세부 변형 세로 스크롤.
// ============================================================================

import { Fragment, useState } from 'react';
import { ScrollView, View } from 'react-native';
import styled, { useTheme } from 'styled-components/native';

import { Tabs } from '@/components/display';
import {
  Divider,
  Spacer,
  Text,
  type DividerColor,
  type SpacerSize,
  type TextColor,
  type TextVariant,
} from '@/components/primitives';
import { Screen, Section } from '@/components/surface';

const variantSamples: { key: TextVariant; label: string }[] = [
  { key: 'displayLg', label: 'DisplayLg — 메인 큰 제목 (Manrope 32 / 700)' },
  { key: 'headlineMd', label: 'HeadlineMd — 카드 제목 (Manrope 20 / 600)' },
  { key: 'headlineSm', label: 'HeadlineSm — Stack 헤더 (Manrope 17 / 600)' },
  { key: 'bodyBase', label: 'BodyBase — 기본 본문 (Inter 16 / 400)' },
  { key: 'bodySm', label: 'BodySm — 보조 본문 (Inter 14 / 400)' },
  { key: 'labelSm', label: 'LabelSm — 탭 라벨 (Inter 11 / 600)' },
  { key: 'labelMd', label: 'LabelMd — Input·Settings Row 라벨 (Inter 13 / 600)' },
  { key: 'labelLg', label: 'LabelLg — Segmented·BottomTab active (Inter 14 / 600)' },
  { key: 'labelCaps', label: 'labelcaps · uppercase + letterspacing' },
  { key: 'numericMd', label: 'NumericMd — Data Table·통계 수치 (Manrope 14 / 700)' },
];

const colorSamples: { key: Exclude<TextColor, 'inverse'>; label: string }[] = [
  { key: 'primary', label: 'primary — 본문 기본' },
  { key: 'secondary', label: 'secondary — 부제' },
  { key: 'muted', label: 'muted — 메타데이터' },
  { key: 'accent', label: 'accent — 강조 (primary.action)' },
];

const alignSamples = ['left', 'center', 'right'] as const;

const verticalSpacerSamples: { size: SpacerSize; label: string }[] = [
  { size: 'xs', label: 'xs (4px)' },
  { size: 'sm', label: 'sm (8px)' },
  { size: 'md', label: 'md (12px)' },
  { size: 'lg', label: 'lg (16px)' },
  { size: 'xl', label: 'xl (24px)' },
];

const horizontalSpacerSamples: SpacerSize[] = ['xs', 'sm', 'md', 'lg'];

const dividerColorSamples: DividerColor[] = ['subtle', 'default', 'strong'];

const InverseBox = styled.View`
  padding: ${({ theme }) => theme.spacing.md}px;
  background-color: ${({ theme }) => theme.colors.bg.sectionMain};
  border-radius: ${({ theme }) => theme.radius.base}px;
`;

const Box = styled.View`
  background-color: ${({ theme }) => theme.colors.state.error};
  height: 8px;
  width: 100%;
`;

const SmallBox = styled.View`
  background-color: ${({ theme }) => theme.colors.state.error};
  width: 40px;
  height: 24px;
`;

const Row = styled.View`
  flex-direction: row;
  align-items: center;
`;

const InsetDemoBox = styled.View`
  padding-top: ${({ theme }) => theme.spacing.md}px;
  padding-bottom: ${({ theme }) => theme.spacing.md}px;
  background-color: ${({ theme }) => theme.colors.state.error};
`;

const SECTIONS = [
  { value: 'text', label: 'Text (텍스트)' },
  { value: 'spacer', label: 'Spacer (간격)' },
  { value: 'divider', label: 'Divider (구분선)' },
] as const;

type SectionValue = typeof SECTIONS[number]['value'];

export default function PrimitivesScreen() {
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
        {activeSection === 'text' && (
          <>
            <Section title="Text · variants (텍스트 변형)">
              {variantSamples.map(({ key, label }) => (
                <Text key={key} variant={key}>{label}</Text>
              ))}
            </Section>
            <Spacer size="2xl" />

            <Section title="Text · colors (텍스트 색상)">
              {colorSamples.map(({ key, label }) => (
                <Text key={key} variant="bodyBase" color={key}>{label}</Text>
              ))}
              <InverseBox>
                <Text variant="bodyBase" color="inverse">
                  inverse — 반전 텍스트 (어두운 배경 위)
                </Text>
              </InverseBox>
            </Section>
            <Spacer size="2xl" />

            <Section title="Text · aligns (텍스트 정렬)">
              {alignSamples.map(a => (
                <Text key={a} variant="bodyBase" align={a}>
                  {a} — 정렬 샘플 텍스트
                </Text>
              ))}
            </Section>
          </>
        )}

        {activeSection === 'spacer' && (
          <>
            <Section title="Spacer · vertical (세로 간격)">
              {verticalSpacerSamples.map(({ size, label }) => (
                <View key={size}>
                  <Box />
                  <Text variant="labelSm" color="muted">{label}</Text>
                  <Spacer size={size} />
                  <Box />
                </View>
              ))}
            </Section>
            <Spacer size="2xl" />

            <Section title="Spacer · horizontal (가로 간격)">
              <Row>
                <SmallBox />
                {horizontalSpacerSamples.map(size => (
                  <Fragment key={size}>
                    <Spacer size={size} axis="horizontal" />
                    <SmallBox />
                  </Fragment>
                ))}
              </Row>
            </Section>
          </>
        )}

        {activeSection === 'divider' && (
          <Section title="Divider (구분선)">
            {dividerColorSamples.map(c => (
              <View key={c}>
                <Text variant="labelSm" color="muted">{c}</Text>
                <Spacer size="xs" />
                <Divider color={c} />
              </View>
            ))}
            <Text variant="labelSm" color="muted">
              orientation · vertical (inset 4)
            </Text>
            <Row>
              <Text>왼쪽</Text>
              <Spacer size="sm" axis="horizontal" />
              <Divider orientation="vertical" color="default" inset={4} />
              <Spacer size="sm" axis="horizontal" />
              <Text>오른쪽</Text>
            </Row>
            <Text variant="labelSm" color="muted">
              inset 차이 (0 vs 32)
            </Text>
            <InsetDemoBox>
              <Divider color="strong" />
              <Spacer size="md" />
              <Divider color="strong" inset={32} />
            </InsetDemoBox>
          </Section>
        )}
      </ScrollView>
    </Screen>
  );
}
