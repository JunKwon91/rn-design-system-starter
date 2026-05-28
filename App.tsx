// ============================================================================
// rn-design-system-starter 앱 진입점
// ============================================================================
// Provider 중첩 구조:
//   GestureHandlerRootView     ← react-native-gesture-handler 루트 (사이클 5 BottomSheet)
//     ThemeProvider            ← styled-components: 모드(light/dark) 테마 주입
//       SafeAreaProvider       ← Notch/Dynamic Island Safe Area 정보 제공
//         SystemBars           ← iOS·Android status bar 통합 관리
//         NavigationContainer  ← React Navigation 루트
//           RootNavigator      ← 카테고리 메뉴 + 7개 상세 화면
//         DialogHost           ← 전역 다이얼로그 호스트 (네비 위 오버레이)
//         ToastHost            ← 전역 토스트 호스트 (네비 위 오버레이)
//         BottomSheetHost      ← 전역 바텀시트 호스트 (drag + safe-area, 사이클 5.1)
//
// useColorScheme()으로 시스템 다크/라이트 모드를 감지하여 자동 테마 전환.
//
// SystemBars (react-native-edge-to-edge):
//   RN StatusBar 대체. Android 15 edge-to-edge enforcement를 패키지가 정합
//   관리하므로 native-stack 헤더와의 inset 중복 적용이 해소된다. iOS에서는
//   내부적으로 RN StatusBar API를 사용해 동일 동작을 유지하며 Info.plist의
//   UIViewControllerBasedStatusBarAppearance 설정 의존성이 없다.
//
// GestureHandlerRootView (사이클 5.1 신규):
//   react-native-gesture-handler v2의 PanGesture를 BottomSheetHost가 사용
//   하려면 앱 최상위 루트에 GestureHandlerRootView 마운트 필요. flex:1로
//   전체 화면을 차지하며 그 안의 Gesture.Pan() 등이 정상 작동.
// ============================================================================

import { useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SystemBars } from 'react-native-edge-to-edge';
import { NavigationContainer } from '@react-navigation/native';
import { ThemeProvider } from 'styled-components/native';

import {
  BottomSheetHost,
  DialogHost,
  ToastHost,
} from '@/components/modal';
import RootNavigator from '@/navigation/RootNavigator';
import { darkTheme, lightTheme } from '@/theme';

export default function App() {
  const isDark = useColorScheme() === 'dark';
  const theme = isDark ? darkTheme : lightTheme;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider theme={theme}>
        <SafeAreaProvider>
          <SystemBars style={isDark ? 'light' : 'dark'} />
          <NavigationContainer>
            <RootNavigator />
          </NavigationContainer>
          <DialogHost />
          <ToastHost />
          <BottomSheetHost />
        </SafeAreaProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
