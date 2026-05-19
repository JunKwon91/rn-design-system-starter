// ============================================================================
// ListScreen — List 카테고리 갤러리
// ============================================================================
// SettingsRow
// ============================================================================

import { useState } from 'react';
import styled, { useTheme } from 'styled-components/native';

import { SettingsRow } from '@/components/list';
import { Divider } from '@/components/primitives';
import { Screen, Section } from '@/components/surface';

const SettingsRowPanel = styled.View`
  border-radius: ${({ theme }) => theme.radius.lg}px;
  overflow: hidden;
`;

export default function ListScreen() {
  const theme = useTheme();
  const [darkOn, setDarkOn] = useState(true);
  const [notifyOn, setNotifyOn] = useState(false);

  return (
    <Screen
      scroll
      edges={['bottom']}
      contentContainerStyle={{ paddingVertical: theme.spacing.lg }}
    >
      <Section title="SettingsRow · variants (변형)">
        <SettingsRowPanel>
          <SettingsRow kind="default" label="언어" value="한국어" />
          <Divider color="subtle" />
          <SettingsRow kind="default" label="버전" value="v1.0.0" />
          <Divider color="subtle" />
          <SettingsRow
            kind="toggle"
            label="다크 모드"
            value={darkOn}
            onChange={setDarkOn}
          />
          <Divider color="subtle" />
          <SettingsRow
            kind="toggle"
            label="알림"
            value={notifyOn}
            onChange={setNotifyOn}
          />
          <Divider color="subtle" />
          <SettingsRow
            kind="picker"
            label="기본값"
            value="옵션 A"
            onPress={() => console.log('picker pressed')}
          />
          <Divider color="subtle" />
          <SettingsRow
            kind="link"
            label="개인정보 처리방침"
            onPress={() => console.log('link pressed')}
          />
          <Divider color="subtle" />
          <SettingsRow
            kind="action"
            label="약관 보기"
            onPress={() => console.log('action pressed')}
          />
        </SettingsRowPanel>
      </Section>
    </Screen>
  );
}
