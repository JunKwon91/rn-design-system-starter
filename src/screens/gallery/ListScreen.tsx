// ============================================================================
// ListScreen — List 카테고리 갤러리
// ============================================================================
// SettingsRow
// ============================================================================

import { useState } from 'react';
import { Alert } from 'react-native';
import { Bell, Globe, Info, Lock, Moon, Settings } from 'lucide-react-native';
import styled, { useTheme } from 'styled-components/native';

import { SettingsRow } from '@/components/list';
import { Divider, Spacer } from '@/components/primitives';
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
            onChange={v => {
              setDarkOn(v);
              Alert.alert('SettingsRow · toggle', `다크 모드 ${v ? '켜짐' : '꺼짐'}`);
            }}
          />
          <Divider color="subtle" />
          <SettingsRow
            kind="toggle"
            label="알림"
            value={notifyOn}
            onChange={v => {
              setNotifyOn(v);
              Alert.alert('SettingsRow · toggle', `알림 ${v ? '켜짐' : '꺼짐'}`);
            }}
          />
          <Divider color="subtle" />
          <SettingsRow
            kind="picker"
            label="기본값"
            value="옵션 A"
            onPress={() => Alert.alert('SettingsRow · picker', '기본 회차 클릭됨')}
          />
          <Divider color="subtle" />
          <SettingsRow
            kind="link"
            label="개인정보 처리방침"
            onPress={() => Alert.alert('SettingsRow · link', '개인정보 클릭됨')}
          />
          <Divider color="subtle" />
          <SettingsRow
            kind="action"
            label="약관 보기"
            onPress={() => Alert.alert('SettingsRow · action', '약관 클릭됨')}
          />
        </SettingsRowPanel>
      </Section>

      <Spacer size="2xl" />

      <Section title="SettingsRow · leadingIcon (iOS HIG row 패턴)">
        <SettingsRowPanel>
          <SettingsRow
            kind="default"
            label="언어"
            value="한국어"
            leadingIcon={<Globe size={20} color={theme.colors.text.secondary} />}
          />
          <Divider color="subtle" />
          <SettingsRow
            kind="toggle"
            label="다크 모드"
            value={darkOn}
            onChange={setDarkOn}
            leadingIcon={<Moon size={20} color={theme.colors.text.secondary} />}
          />
          <Divider color="subtle" />
          <SettingsRow
            kind="toggle"
            label="알림"
            value={notifyOn}
            onChange={setNotifyOn}
            leadingIcon={<Bell size={20} color={theme.colors.text.secondary} />}
          />
          <Divider color="subtle" />
          <SettingsRow
            kind="picker"
            label="설정"
            value="기본"
            onPress={() => Alert.alert('SettingsRow · leadingIcon', '설정 클릭됨')}
            leadingIcon={<Settings size={20} color={theme.colors.text.secondary} />}
          />
          <Divider color="subtle" />
          <SettingsRow
            kind="link"
            label="개인정보 처리방침"
            onPress={() => Alert.alert('SettingsRow · leadingIcon', '개인정보 클릭됨')}
            leadingIcon={<Lock size={20} color={theme.colors.text.secondary} />}
          />
          <Divider color="subtle" />
          <SettingsRow
            kind="action"
            label="앱 정보"
            onPress={() => Alert.alert('SettingsRow · leadingIcon', '앱 정보 클릭됨')}
            leadingIcon={<Info size={20} color={theme.colors.text.secondary} />}
          />
        </SettingsRowPanel>
      </Section>
    </Screen>
  );
}
