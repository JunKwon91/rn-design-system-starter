// ============================================================================
// InputScreen — Input 카테고리 갤러리
// ============================================================================
// Input · SearchInput — Tabs 전환 패턴
// ============================================================================

import { useState } from 'react';
import { ScrollView } from 'react-native';
import { useTheme } from 'styled-components/native';

import { Tabs } from '@/components/display';
import { Input, SearchInput } from '@/components/input';
import { Spacer, Text } from '@/components/primitives';
import { Screen, Section } from '@/components/surface';

const SECTIONS = [
  { value: 'input', label: 'Input (입력)' },
  { value: 'searchinput', label: 'SearchInput (검색 입력)' },
] as const;

type SectionValue = typeof SECTIONS[number]['value'];

export default function InputScreen() {
  const theme = useTheme();
  const [activeSection, setActiveSection] = useState<SectionValue>(
    SECTIONS[0].value,
  );
  const [searchEmpty, setSearchEmpty] = useState('');
  const [searchFilled, setSearchFilled] = useState('옵션 A');

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
        {activeSection === 'input' && (
          <Section title="Input · states (상태)">
            <Text variant="labelSm" color="muted">
              Default (탭하면 Focus 상태로 전환)
            </Text>
            <Input
              label="텍스트"
              placeholder="값을 입력하세요"
              helper="값을 입력하세요."
            />
            <Text variant="labelSm" color="muted">
              Error
            </Text>
            <Input
              label="텍스트"
              placeholder="값을 입력하세요"
              error="유효하지 않은 값입니다"
            />
            <Text variant="labelSm" color="muted">
              Disabled
            </Text>
            <Input
              label="텍스트"
              placeholder="값을 입력하세요"
              helper="값을 입력하세요."
              disabled
            />
            <Text variant="labelSm" color="muted">
              showHelper = false
            </Text>
            <Input
              label="텍스트"
              placeholder="값을 입력하세요"
              helper="값을 입력하세요."
              showHelper={false}
            />
          </Section>
        )}

        {activeSection === 'searchinput' && (
          <Section title="SearchInput · states (상태)">
            <Text variant="labelSm" color="muted">
              Empty (타이핑하면 X 버튼 등장)
            </Text>
            <SearchInput
              value={searchEmpty}
              placeholder="검색어 입력"
              onChangeText={setSearchEmpty}
            />
            <Text variant="labelSm" color="muted">
              Filled (X 탭으로 클리어)
            </Text>
            <SearchInput
              value={searchFilled}
              placeholder="검색어 입력"
              onChangeText={setSearchFilled}
            />
          </Section>
        )}
        <Spacer size="lg" />
      </ScrollView>
    </Screen>
  );
}
