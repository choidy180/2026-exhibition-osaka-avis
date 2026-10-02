import type { Locale } from "./locales";

const ko = {
  app: {
    tagline: "웨어러블 AI 실시간 모니터링",
    company: "디엑스솔루션즈",
  },
  nav: {
    label: "화면 이동",
    main: "메인",
    mirror: "AVIS 미러링",
    conveyor: "컨베이어",
    detail: "컨베이어 상세",
  },
  panel: {
    mirror: "AVIS 미러링 화면",
    demo: "AVIS 실제 시연 영상",
    conveyor1: "컨베이어 카메라 1",
    conveyor1Sub: "전체 라인",
    conveyor2: "컨베이어 카메라 2",
    conveyor3: "컨베이어 카메라 3",
    item: "품목 정보",
  },
  action: {
    back: "메인으로",
    details: "자세히 보기",
    enlarge: "크게보기",
    settings: "설정",
    close: "닫기",
    fullscreen: "전체 화면",
    exitFullscreen: "전체 화면 종료",
  },
  hint: {
    dblclickExpand: "더블클릭하여 크게 보기",
    dblclickBack: "더블클릭하여 메인으로",
    dblclickDetails: "더블클릭하여 자세히 보기",
    autoLoop: "순차 자동 반복 재생",
  },
  stream: {
    live: "LIVE",
    connecting: "연결 중…",
    noSignal: "신호 없음",
    reconnectIn: "{s}초 후 다시 연결합니다",
    unconfigured: "스트림 미설정",
    unconfiguredHint: "avis.config.json 에 주소를 입력하세요",
  },
  playlist: {
    empty: "재생할 시연 영상이 없습니다",
    loadError: "영상을 불러올 수 없어 다음 영상으로 넘어갑니다",
  },
  settings: {
    title: "설정",
    language: "언어",
    languageHint: "화면에 표시되는 언어를 선택하세요.",
  },
  item: {
    realtime: "실시간",
    name: "품명",
    serial: "시리얼 넘버",
    color: "색상",
    worker: "작업자",
    status: "작업 상태",
    progress: "공정 진행",
    recent: "최근 완료 이력",
    time: "완료 시각",
    statuses: {
      waiting: "작업 대기",
      working: "작업 중",
      inspecting: "검사 중",
      done: "작업 완료",
    },
  },
  mock: {
    productName: "이너드럼",
    colors: { silver: "실버", graphite: "그라파이트", white: "화이트" },
    workers: { w1: "김도윤", w2: "이서연", w3: "박지훈" },
  },
};

type Widen<T> = { [K in keyof T]: T[K] extends string ? string : Widen<T[K]> };
export type Dictionary = Widen<typeof ko>;

const ja: Dictionary = {
  app: {
    tagline: "ウェアラブルAI リアルタイムモニタリング",
    company: "DXソリューションズ",
  },
  nav: {
    label: "画面切り替え",
    main: "メイン",
    mirror: "AVIS ミラーリング",
    conveyor: "コンベヤ",
    detail: "コンベヤ詳細",
  },
  panel: {
    mirror: "AVIS ミラーリング画面",
    demo: "AVIS 実演映像",
    conveyor1: "コンベヤカメラ 1",
    conveyor1Sub: "ライン全体",
    conveyor2: "コンベヤカメラ 2",
    conveyor3: "コンベヤカメラ 3",
    item: "品目情報",
  },
  action: {
    back: "メインへ",
    details: "詳しく見る",
    enlarge: "大きく表示",
    settings: "設定",
    close: "閉じる",
    fullscreen: "全画面表示",
    exitFullscreen: "全画面表示を終了",
  },
  hint: {
    dblclickExpand: "ダブルクリックで拡大表示",
    dblclickBack: "ダブルクリックでメインへ",
    dblclickDetails: "ダブルクリックで詳細表示",
    autoLoop: "順番に自動リピート再生",
  },
  stream: {
    live: "LIVE",
    connecting: "接続中…",
    noSignal: "信号なし",
    reconnectIn: "{s}秒後に再接続します",
    unconfigured: "ストリーム未設定",
    unconfiguredHint: "avis.config.json にアドレスを入力してください",
  },
  playlist: {
    empty: "再生できる実演映像がありません",
    loadError: "映像を読み込めないため、次の映像に切り替えます",
  },
  settings: {
    title: "設定",
    language: "言語",
    languageHint: "画面に表示する言語を選択してください。",
  },
  item: {
    realtime: "リアルタイム",
    name: "品名",
    serial: "シリアル番号",
    color: "カラー",
    worker: "作業者",
    status: "作業状態",
    progress: "工程の進捗",
    recent: "最近の完了履歴",
    time: "完了時刻",
    statuses: {
      waiting: "作業待ち",
      working: "作業中",
      inspecting: "検査中",
      done: "作業完了",
    },
  },
  mock: {
    productName: "インナードラム",
    colors: { silver: "シルバー", graphite: "グラファイト", white: "ホワイト" },
    workers: { w1: "キム・ドユン", w2: "イ・ソヨン", w3: "パク・ジフン" },
  },
};

const en: Dictionary = {
  app: {
    tagline: "Wearable AI Live Monitoring",
    company: "DXSolutions",
  },
  nav: {
    label: "Screens",
    main: "Main",
    mirror: "AVIS Mirroring",
    conveyor: "Conveyor",
    detail: "Conveyor Details",
  },
  panel: {
    mirror: "AVIS Mirroring",
    demo: "AVIS Live Demo Videos",
    conveyor1: "Conveyor Camera 1",
    conveyor1Sub: "Full line",
    conveyor2: "Conveyor Camera 2",
    conveyor3: "Conveyor Camera 3",
    item: "Item Information",
  },
  action: {
    back: "Back to Main",
    details: "View Details",
    enlarge: "View Larger",
    settings: "Settings",
    close: "Close",
    fullscreen: "Full screen",
    exitFullscreen: "Exit full screen",
  },
  hint: {
    dblclickExpand: "Double-click to enlarge",
    dblclickBack: "Double-click to return to Main",
    dblclickDetails: "Double-click for details",
    autoLoop: "Plays in sequence, on loop",
  },
  stream: {
    live: "LIVE",
    connecting: "Connecting…",
    noSignal: "No signal",
    reconnectIn: "Reconnecting in {s}s",
    unconfigured: "Stream not configured",
    unconfiguredHint: "Add the address in avis.config.json",
  },
  playlist: {
    empty: "No demo videos to play",
    loadError: "Couldn't load this video. Skipping to the next one.",
  },
  settings: {
    title: "Settings",
    language: "Language",
    languageHint: "Choose the display language.",
  },
  item: {
    realtime: "Real-time",
    name: "Item",
    serial: "Serial No.",
    color: "Color",
    worker: "Operator",
    status: "Work status",
    progress: "Process progress",
    recent: "Recently completed",
    time: "Completed at",
    statuses: {
      waiting: "Waiting",
      working: "In progress",
      inspecting: "Inspecting",
      done: "Completed",
    },
  },
  mock: {
    productName: "Inner Drum",
    colors: { silver: "Silver", graphite: "Graphite", white: "White" },
    workers: { w1: "Doyun Kim", w2: "Seoyeon Lee", w3: "Jihoon Park" },
  },
};

export const dictionaries: Record<Locale, Dictionary> = { ko, ja, en };

/** "{s}초 후" 같은 자리표시자를 채운다 */
export function format(template: string, values: Record<string, string | number>) {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => String(values[key] ?? ""));
}
