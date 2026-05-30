// ============================================================================
// SettingsRow — 설정 화면 단일 행 컴포넌트
// ============================================================================
//
// 5가지 kind(default/toggle/picker/link/action)를 discriminated union으로 표현.
// kind에 따라 우측 컨텐츠와 인터랙션이 결정된다. default 외 모든 kind는
// Pressable로 전체 Row를 탭 영역으로 만든다.
//
// 사용 예:
//   <SettingsRow kind="default" label="버전" value="v1.0.0" />
//   <SettingsRow kind="toggle" label="다크 모드" value={dark} onChange={setDark} />
//   <SettingsRow kind="picker" label="기본 회차" value="1043회" onPress={openPicker} />
//   <SettingsRow kind="link" label="개인정보 처리방침" onPress={openPrivacy} />
//   <SettingsRow kind="action" label="약관 보기" onPress={openTerms} />
//
// [디자인 토큰]
// Row: height 56, padding 16, gap 12
//      bg surface.container (pressed surface.containerHigh)
//      pressed 시 opacity 대신 배경 색상 변경 — iOS HIG row 패턴(Settings 앱)
//      유지를 위한 의도적 설계 (ADR-35 참조). 다른 interactive 컴포넌트는
//      theme.interaction.pressedOpacity 단순 alpha 패턴 적용.
// Label: typography.bodyBase, color text.primary
// Value: typography.bodyBase, color text.secondary
// 보조 아이콘 (ChevronRight·ExternalLink): 18px, strokeWidth 2, color text.muted
// Toggle: input.Switch 컴포넌트 인스턴스 (size=md, M3 filled track + thumb 변화)
//
// [Kind별 우측 컨텐츠]
//   default: Value 텍스트만
//   toggle:  Switch (Row 전체 탭이 onChange 트리거)
//   picker:  Value + ChevronRight
//   link:    ExternalLink 아이콘
//   action:  ChevronRight 아이콘
// ============================================================================

import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { ChevronRight, ExternalLink } from 'lucide-react-native';
import styled, { useTheme } from 'styled-components/native';

import { Switch } from '@/components/input';
import Text from '@/components/primitives/Text';

const RowBase = styled.View`
  height: 56px;
  padding: 16px;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  background-color: ${({ theme }) => theme.colors.surface.container};
`;

const PressableRowBase = styled.Pressable`
  height: 56px;
  padding: 16px;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`;

const PickerRight = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 8px;
`;

const RowLeft = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 12px;
  flex-shrink: 1;
`;

type SettingsRowCommon = {
  /** 좌측에 표시되는 본문 라벨. */
  label: string;
  /** 라벨 앞에 표시되는 leading 아이콘 (iOS HIG row 패턴, lucide-react-native 등 ReactNode). */
  leadingIcon?: ReactNode;
  /** Row 컨테이너에 적용할 외부 스타일 override. */
  style?: StyleProp<ViewStyle>;
};

export type SettingsRowProps = SettingsRowCommon &
  (
    | {
        /** 좌측 라벨 + 우측 값 텍스트. 비-인터랙티브. */
        kind: 'default';
        /** 우측에 표시되는 값 (예: 'v1.0.0'). */
        value: string;
      }
    | {
        /** 좌측 라벨 + 우측 토글 스위치. Row 전체 탭으로 onChange 트리거. */
        kind: 'toggle';
        /** 현재 on/off 값. */
        value: boolean;
        onChange: (value: boolean) => void;
      }
    | {
        /** 좌측 라벨 + 우측 값 + ChevronRight. 탭 시 onPress. */
        kind: 'picker';
        /** 현재 선택된 값. */
        value: string;
        onPress: () => void;
      }
    | {
        /** 좌측 라벨 + 우측 ExternalLink 아이콘. 외부 링크 이동용. */
        kind: 'link';
        onPress: () => void;
      }
    | {
        /** 좌측 라벨 + 우측 ChevronRight. 화면 내 진입용. */
        kind: 'action';
        onPress: () => void;
      }
  );

/**
 * 설정 화면 단일 행.
 *
 * 5 kind discriminated union으로 default 외 모든 variant는 Row 전체가 탭 영역.
 *
 * @example
 * <SettingsRow kind="toggle" label="다크 모드" value={dark} onChange={setDark} />
 */
export default function SettingsRow(props: SettingsRowProps) {
  const theme = useTheme();

  const renderRight = () => {
    switch (props.kind) {
      case 'default':
        return (
          <Text variant="bodyBase" color="secondary">
            {props.value}
          </Text>
        );
      case 'toggle':
        return (
          <Switch value={props.value} onValueChange={props.onChange} size="md" />
        );
      case 'picker':
        return (
          <PickerRight>
            <Text variant="bodyBase" color="secondary">
              {props.value}
            </Text>
            <ChevronRight
              size={18}
              color={theme.colors.text.muted}
              strokeWidth={2}
            />
          </PickerRight>
        );
      case 'link':
        return (
          <ExternalLink
            size={18}
            color={theme.colors.text.muted}
            strokeWidth={2}
          />
        );
      case 'action':
        return (
          <ChevronRight
            size={18}
            color={theme.colors.text.muted}
            strokeWidth={2}
          />
        );
    }
  };

  const labelEl = (
    <RowLeft>
      {props.leadingIcon}
      <Text variant="bodyBase">{props.label}</Text>
    </RowLeft>
  );

  if (props.kind === 'default') {
    return (
      <RowBase style={props.style}>
        {labelEl}
        {renderRight()}
      </RowBase>
    );
  }

  const handlePress = () => {
    if (props.kind === 'toggle') {
      props.onChange(!props.value);
    } else {
      props.onPress();
    }
  };

  const accessibilityRole =
    props.kind === 'toggle'
      ? 'switch'
      : props.kind === 'link'
        ? 'link'
        : 'button';

  return (
    <PressableRowBase
      onPress={handlePress}
      accessibilityRole={accessibilityRole}
      accessibilityState={
        props.kind === 'toggle' ? { checked: props.value } : undefined
      }
      style={({ pressed }) => [
        {
          backgroundColor: pressed
            ? theme.colors.surface.containerHigh
            : theme.colors.surface.container,
        },
        props.style,
      ]}
    >
      {labelEl}
      {renderRight()}
    </PressableRowBase>
  );
}
