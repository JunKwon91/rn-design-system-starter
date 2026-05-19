// ============================================================================
// ActionScreen — Action 카테고리 갤러리
// ============================================================================
// Button · IconButton — 컴포넌트 단위 2 탭, 각 탭 안 세부 변형 세로 스크롤.
// ============================================================================

import { useState } from 'react';
import { ScrollView } from 'react-native';
import { ChevronLeft, Plus, Settings, Star, X } from 'lucide-react-native';
import styled, { useTheme } from 'styled-components/native';

import { Button, IconButton } from '@/components/action';
import { Tabs } from '@/components/display';
import { Spacer, Text } from '@/components/primitives';
import { Card, Screen, Section } from '@/components/surface';

const noop = () => {};

const Row = styled.View`
  flex-direction: row;
  align-items: center;
`;

const SECTIONS = [
  { value: 'button', label: 'Button (버튼)' },
  { value: 'iconbutton', label: 'IconButton (아이콘 버튼)' },
] as const;

type SectionValue = typeof SECTIONS[number]['value'];

export default function ActionScreen() {
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
        {activeSection === 'button' && (
          <>
            <Section title="Button · variants × sizes (변형 × 크기)">
              <Card>
                <Button label="Primary sm" variant="primary" size="sm" onPress={noop} />
                <Spacer size="sm" />
                <Button label="Primary md" variant="primary" size="md" onPress={noop} />
                <Spacer size="sm" />
                <Button label="Primary lg" variant="primary" size="lg" onPress={noop} />
              </Card>
              <Card>
                <Button label="Secondary sm" variant="secondary" size="sm" onPress={noop} />
                <Spacer size="sm" />
                <Button label="Secondary md" variant="secondary" size="md" onPress={noop} />
                <Spacer size="sm" />
                <Button label="Secondary lg" variant="secondary" size="lg" onPress={noop} />
              </Card>
            </Section>
            <Spacer size="2xl" />

            <Section title="Button · states & options (상태와 옵션)">
              <Card>
                <Button label="disabled" disabled onPress={noop} />
                <Spacer size="sm" />
                <Button label="loading" loading onPress={noop} />
                <Spacer size="sm" />
                <Button label="fullWidth" fullWidth onPress={noop} />
              </Card>
              <Card>
                <Button
                  label="추가하기"
                  size="sm"
                  leftIcon={<Plus size={14} color={theme.colors.primary.onAction} />}
                  onPress={noop}
                />
                <Spacer size="sm" />
                <Button
                  label="추가하기"
                  variant="secondary"
                  size="sm"
                  leftIcon={<Plus size={14} color={theme.colors.text.secondary} />}
                  onPress={noop}
                />
              </Card>
            </Section>
          </>
        )}

        {activeSection === 'iconbutton' && (
          <>
            <Section title="IconButton · sizes × colors (크기 × 색상)">
              <Card>
                <Text variant="labelSm" color="muted">sm (24×24)</Text>
                <Spacer size="sm" />
                <Row>
                  <IconButton icon={<Settings />} size="sm" color="primary" accessibilityLabel="설정 primary" onPress={noop} />
                  <Spacer size="md" axis="horizontal" />
                  <IconButton icon={<Settings />} size="sm" color="secondary" accessibilityLabel="설정 secondary" onPress={noop} />
                  <Spacer size="md" axis="horizontal" />
                  <IconButton icon={<Settings />} size="sm" color="muted" accessibilityLabel="설정 muted" onPress={noop} />
                  <Spacer size="md" axis="horizontal" />
                  <IconButton icon={<Settings />} size="sm" color="accent" accessibilityLabel="설정 accent" onPress={noop} />
                </Row>
                <Text variant="labelSm" color="muted">md (32×32) — default</Text>
                <Spacer size="sm" />
                <Row>
                  <IconButton icon={<ChevronLeft />} color="primary" accessibilityLabel="뒤로 primary" onPress={noop} />
                  <Spacer size="md" axis="horizontal" />
                  <IconButton icon={<ChevronLeft />} color="secondary" accessibilityLabel="뒤로 secondary" onPress={noop} />
                  <Spacer size="md" axis="horizontal" />
                  <IconButton icon={<ChevronLeft />} color="muted" accessibilityLabel="뒤로 muted" onPress={noop} />
                  <Spacer size="md" axis="horizontal" />
                  <IconButton icon={<ChevronLeft />} color="accent" accessibilityLabel="뒤로 accent" onPress={noop} />
                </Row>
                <Text variant="labelSm" color="muted">lg (44×44) — Apple HIG 권장</Text>
                <Spacer size="sm" />
                <Row>
                  <IconButton icon={<Star />} size="lg" color="primary" accessibilityLabel="별표 primary" onPress={noop} />
                  <Spacer size="md" axis="horizontal" />
                  <IconButton icon={<Star />} size="lg" color="secondary" accessibilityLabel="별표 secondary" onPress={noop} />
                  <Spacer size="md" axis="horizontal" />
                  <IconButton icon={<Star />} size="lg" color="muted" accessibilityLabel="별표 muted" onPress={noop} />
                  <Spacer size="md" axis="horizontal" />
                  <IconButton icon={<Star />} size="lg" color="accent" accessibilityLabel="별표 accent" onPress={noop} />
                </Row>
              </Card>
            </Section>
            <Spacer size="2xl" />

            <Section title="IconButton · disabled (비활성)">
              <Card>
                <Row>
                  <IconButton icon={<X />} accessibilityLabel="닫기" onPress={noop} />
                  <Spacer size="md" axis="horizontal" />
                  <IconButton icon={<X />} disabled accessibilityLabel="닫기 disabled" onPress={noop} />
                </Row>
              </Card>
            </Section>
          </>
        )}
      </ScrollView>
    </Screen>
  );
}
