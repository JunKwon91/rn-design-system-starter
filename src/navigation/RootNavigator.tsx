// ============================================================================
// RootNavigator — Native Stack Navigator
// ============================================================================
// 8개 화면: 홈(메뉴) + 7 카테고리. 헤더는 useTheme으로 라이트/다크 모드 자동
// 전환. iOS는 뒤로가기 chevron만 표시(headerBackButtonDisplayMode='minimal').
// ============================================================================

import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from 'styled-components/native';

import GalleryHomeScreen from '@/screens/GalleryHomeScreen';
import PrimitivesScreen from '@/screens/gallery/PrimitivesScreen';
import SurfaceScreen from '@/screens/gallery/SurfaceScreen';
import ActionScreen from '@/screens/gallery/ActionScreen';
import InputScreen from '@/screens/gallery/InputScreen';
import DisplayScreen from '@/screens/gallery/DisplayScreen';
import ListScreen from '@/screens/gallery/ListScreen';
import FeedbackScreen from '@/screens/gallery/FeedbackScreen';

import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const theme = useTheme();

  return (
    <Stack.Navigator
      initialRouteName="GalleryHome"
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.bg.canvas,
        },
        headerTitleStyle: {
          color: theme.colors.text.primary,
          fontFamily: theme.typography.headlineSm.fontFamily,
          fontSize: theme.typography.headlineSm.fontSize,
          fontWeight: theme.typography.headlineSm.fontWeight,
        },
        headerTintColor: theme.colors.text.primary,
        headerBackButtonDisplayMode: 'minimal',
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="GalleryHome"
        component={GalleryHomeScreen}
        options={{ title: 'Design System Gallery (디자인 시스템 갤러리)' }}
      />
      <Stack.Screen
        name="Primitives"
        component={PrimitivesScreen}
        options={{ title: 'Primitives (기본 요소)' }}
      />
      <Stack.Screen
        name="Surface"
        component={SurfaceScreen}
        options={{ title: 'Surface (표면)' }}
      />
      <Stack.Screen
        name="Action"
        component={ActionScreen}
        options={{ title: 'Action (액션)' }}
      />
      <Stack.Screen
        name="Input"
        component={InputScreen}
        options={{ title: 'Input (입력)' }}
      />
      <Stack.Screen
        name="Display"
        component={DisplayScreen}
        options={{ title: 'Display (표시)' }}
      />
      <Stack.Screen
        name="List"
        component={ListScreen}
        options={{ title: 'List (리스트)' }}
      />
      <Stack.Screen
        name="Feedback"
        component={FeedbackScreen}
        options={{ title: 'Feedback (피드백)' }}
      />
    </Stack.Navigator>
  );
}
