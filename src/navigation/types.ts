// ============================================================================
// Root Stack 라우트 타입
// ============================================================================
// 8개 화면 모두 params 없음 — 홈에서 각 카테고리로 단순 navigate.
// 향후 카테고리 내 sub-route가 생기면 여기에 추가.
// ============================================================================

export type RootStackParamList = {
  GalleryHome: undefined;
  Primitives: undefined;
  Surface: undefined;
  Action: undefined;
  Input: undefined;
  Display: undefined;
  List: undefined;
  Feedback: undefined;
};
