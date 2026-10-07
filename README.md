# AVIS — 웨어러블 실시간 모니터링 대시보드

디엑스솔루션즈(DXSolutions) 전시회 시연용 웹 대시보드입니다.
Vuzix M4000 웨어러블의 실시간 화면(미러링)과 컨베이어 벨트 IP 카메라 영상을 브라우저에 띄웁니다.

- Next.js 16 (App Router, `src` 폴더 없음) + styled-components 6
- 한국어 / 日本語 / English 지원 (기본값: 일본어, 오른쪽 위 ⚙ 설정에서 변경)

## 화면 구성

| 경로 | 화면 | 동작 |
| --- | --- | --- |
| `/` | 메인 — 왼쪽 AVIS 미러링, 오른쪽 위 시연 영상 3종 순차 반복, 오른쪽 아래 컨베이어 카메라 1 | 미러링 더블클릭 → `/mirror`, 컨베이어 더블클릭 → `/conveyor` |
| `/mirror` | 왼쪽 AVIS 미러링 확대 + 시연 영상 PiP, 오른쪽 카메라 1 · 2 · 3 세로 배치 | 미러링 더블클릭 또는 [메인으로] → `/` |
| `/conveyor` | 컨베이어 카메라 1(전체 라인) 크게 보기 | 왼쪽 아래 [자세히 보기] → `/conveyor/detail` |
| `/conveyor/detail` | 왼쪽 카메라 1, 오른쪽 위 품목 정보, 오른쪽 아래 카메라 2 · 3 | 왼쪽 아래 [크게보기] → `/conveyor` |

- 시연 영상은 메인 ↔ 미러링 화면을 오가도 재생 위치가 이어집니다.
- 품목 정보의 **작업 상태 · 작업 진행 · 상태 변경 이력**은 글래스의 시연 단계(백엔드 `GET /v1/wearable/stage`)를 1초마다 받아 표시합니다 — 아래 [품목 정보 — 글래스 단계](#품목-정보--글래스-단계).
  품명 · 시리얼 · 색상 · 작업자는 `lib/mock/items.ts` 의 고정값입니다.
- 헤더의 ⛶ 버튼으로 전체 화면(키오스크) 전환, 🧪 버튼으로 품목 정보 테스트 모드 전환.

## 실행

```bash
npm install
npm run dev          # 개발: http://localhost:3000
npm run build && npm run start   # 전시장 운영 권장
```

> 폰트(Noto Sans JP/KR, JetBrains Mono)는 빌드 시 내려받아 함께 배포되므로, 전시장이 오프라인이라면 **인터넷이 되는 곳에서 미리 `npm run build`** 해 두세요.

### 시연 영상

`public/videos/` 에 아래 파일이 있어야 합니다 (용량이 커서 git 에는 포함하지 않음).

| 파일 | 원본 |
| --- | --- |
| `01-timecheck.mp4` | DXS_초거대제조AI_웨어러블_타임체크_v1.1.mp4 |
| `02-idle-management.mp4` | DXS_초거대제조AI_웨어러블_무작업관리_v1.3.mp4 |
| `03-defect-traceability.mp4` | DXS_초거대제조AI_웨어러블_불량역추적_v1.2.mp4 |

순서·제목을 바꾸려면 `avis.config.json` 의 `demoVideos` 를 수정하세요.

## 스트림 연결 설정 — `avis.config.json`

프로젝트 루트의 `avis.config.json` 은 **요청마다 다시 읽습니다.** 전시장에서 IP 가 바뀌면 파일만 고치고 브라우저를 새로고침하면 됩니다 (재빌드 불필요).

```json
{
  "reconnectSeconds": 5,
  "streams": {
    "mirror":    { "type": "avis-live", "url": "http://192.168.0.160:8080" },
    "conveyor1": { "type": "vision", "url": "http://192.168.0.92:8200/stream/1.mjpg" },
    "conveyor2": { "type": "vision", "url": "http://192.168.0.92:8200/stream/2.mjpg" },
    "conveyor3": { "type": "vision", "url": "http://192.168.0.92:8200/stream/3.mjpg" }
  }
}
```

| 키 | 화면 |
| --- | --- |
| `mirror` | Vuzix M4000 미러링 |
| `conveyor1` | 컨베이어 카메라 1 (전체 라인 — 메인 / 2번 화면 오른쪽 위 / 3·4번 화면 왼쪽) |
| `conveyor2`, `conveyor3` | 2번 화면 오른쪽 중간·아래 / 4번 화면 오른쪽 아래 |

| `type` | 용도 | `url` 예시 |
| --- | --- | --- |
| `mjpeg` | MJPEG 스트림 (`<img>`) | `http://<ip>:8080/stream.mjpeg` |
| `avis-live` | 글래스 AVIS Live 화면 공유 (`/api/live` 중계 + MediaSource) | `http://<글래스 IP>:8080` |
| `vision` | AVIS 비전 서버 MJPEG (`/api/vision` 중계 + canvas — 멈추면 3초 안에 감지해 재연결) | `http://<비전>:8200/stream/1.mjpg` |
| `webrtc` | WHEP (지연 가장 낮음) | MediaMTX `http://<서버>:8889/<path>/whep` · go2rtc `http://<서버>:1984/api/webrtc?src=<name>` |
| `hls` | HLS | `http://<서버>:8888/<path>/index.m3u8` |
| `video` | mp4 등 일반 영상 주소 | `/videos/01-timecheck.mp4` |
| `iframe` | 스트리밍 서버의 웹 플레이어 페이지 | `http://<서버>:8889/<path>` |
| `webcam` | PC 에 연결된 캡처보드·USB 카메라 (`deviceLabel` 로 장치 이름 일부 지정) | — |
| `none` | 사용 안 함 | — |

- `fit`: `contain`(기본, 잘림 없이 전체) / `cover`(화면 꽉 채움)
- 연결이 끊기거나 화면이 10초 이상 멈추면 `reconnectSeconds` 후 자동 재연결합니다.

### Vuzix M4000 미러링

글래스의 AVIS 앱이 웹 화면 공유를 켜면 `http://<글래스 IP>:8080` 에서 화면을 내보냅니다 (현재 `http://192.168.0.160:8080`).
`mirror` 에 `type: "avis-live"` 와 그 주소를 그대로 넣으면 됩니다.

- 글래스는 `/status`(코덱 · 시청자 수) 와 `/stream`(fMP4 조각) 을 주며, 대시보드는 이를 MediaSource 로 재생합니다 (지연 약 0.2~0.5초).
- 글래스가 CORS 를 열지 않아 브라우저가 직접 받을 수 없으므로, 대시보드 서버의 `/api/live/status` · `/api/live/stream` 이 중계합니다.
  `avis.config.json` 에 등록된 `avis-live` 주소만 중계합니다.
- **글래스는 동시 시청자가 3명까지입니다.** 다른 PC · 탭에서 `http://<글래스 IP>:8080` 을 열어 두면 그만큼 자리가 줄고,
  넘치면 대시보드에 `stream HTTP 503` 이 뜹니다. 지금 몇 명이 보는지는 `curl http://<글래스 IP>:8080/status` 의 `viewers` 로 확인합니다.
- 10초 동안 받은 데이터가 없으면 끊긴 것으로 보고 `reconnectSeconds` 뒤 다시 붙습니다. 화면을 떠나면 글래스 쪽 연결도 바로 닫습니다.

#### 다른 방법 — ScreenStream

1. M4000 에 **ScreenStream** 설치 → *Local (MJPEG)* 모드로 스트리밍 시작, PIN 은 끄기
2. PC 브라우저에서 앱에 표시된 주소(`http://<M4000 IP>:8080`)를 열어 화면이 나오는지 확인
3. 화면 위 영상에서 우클릭 → *이미지 주소 복사* 한 값을 `mirror.url` 에 입력 (`type: "mjpeg"`)
   - 주소 형식은 앱 버전에 따라 다를 수 있으니 반드시 직접 확인하세요.
   - 이미지 주소를 찾기 어려우면 `type: "iframe"`, `url: "http://<M4000 IP>:8080"` 으로도 표시할 수 있습니다.

Vuzix View(PC 앱) + HDMI 캡처 / OBS 가상 카메라를 쓰는 경우엔 `type: "webcam"` 으로 연결할 수 있습니다.

### 컨베이어 카메라 — AVIS 비전 서버

비전이 박스 · 트랙 번호 · 기준선 · 상태 띠를 그린 화면을 MJPEG 로 내보냅니다 (자세한 내용은 [STREAM.md](STREAM.md)).
비전에서 `./scripts/vision.sh multi --start --api` 가 떠 있으면 따로 띄울 것은 없습니다.

| 키 | 주소 |
| --- | --- |
| `conveyor1` | `http://192.168.0.92:8200/stream/1.mjpg` |
| `conveyor2` | `http://192.168.0.92:8200/stream/2.mjpg` |
| `conveyor3` | `http://192.168.0.92:8200/stream/3.mjpg` |

- 카메라 번호 = 컨베이어 번호입니다 (비전 쪽에서 USB 포트로 고정). 3대를 옆으로 붙인 화면은 `/stream/all.mjpg` 입니다.
- 유선으로 바꿔 비전 IP 가 바뀌면 `avis.config.json` 의 세 주소만 고치고 새로고침합니다.
- `vision` 타입은 `<img>` 대신 fetch 로 받아 canvas 에 그리므로, 3초 동안 새 프레임이 없으면 끊고 `reconnectSeconds` 뒤 다시 붙습니다. 화면을 떠나면 연결을 바로 닫습니다.
- 영상은 대시보드 서버의 `/api/vision` 이 중계합니다 (`avis.config.json` 에 등록된 `vision` 주소만).
  Safari(WebKit) 는 fetch 로 받은 `multipart/x-mixed-replace` 본문을 읽지 못하고 `Load failed` 로 끊기 때문에, 바이트는 그대로 두고 Content-Type 만 바꿔 넘깁니다.
  덕분에 브라우저는 `localhost` 에만 붙으므로 macOS 의 브라우저 로컬 네트워크 권한과도 상관없습니다 (`next` 를 띄운 터미널 앱에는 권한이 있어야 합니다).
- 브라우저는 같은 주소에 연결을 6개까지만 엽니다. 영상이 모두 대시보드 주소로 오므로, 4번 화면(카메라 3대)이 가장 많이 쓰며 3개입니다 — 같은 PC 에서 대시보드 탭을 여러 개 띄우지 마세요.
- 연결 확인: `curl http://192.168.0.92:8200/streams` (목록 · 보는 사람 수 · 마지막 프레임), `curl -o f.jpg http://192.168.0.92:8200/frame/1.jpg`

### 품목 정보 — 글래스 단계

글래스(AVIS 앱)가 단계가 바뀔 때마다 백엔드에 보내고, 대시보드는 `avis.config.json` 의 `wearableStage` 주소를 1초마다 받아 4번 화면 품목 정보에 표시합니다.

```json
"wearableStage": { "url": "http://192.168.0.101:8100/v1/wearable/stage", "pollSeconds": 1 }
```

| `stage` | 표시 | 색 |
| --- | --- | --- |
| `1` | 정상 화면 | 초록 |
| `2` | 불량 대응 | 빨강 (깜빡임) |
| `3` | 설비 점검 | 주황 |
| `4` | 보고서 | 파랑 |
| `null` | 단계 대기 (백엔드가 아직 아무 단계도 받지 않음) | 회색 |

- **작업 상태**: 현재 단계 · **작업 진행**: 1→4 단계 진행과 현재 단계 경과 시간 · **상태 변경 이력**: 응답의 `history` (시작 시각 · 소요 시간)
- 영상과 같이 대시보드 서버의 `/api/stage` 가 중계합니다 (설정 파일의 주소만). 두 번 연속 응답이 없으면 오른쪽 위에 `연결 끊김` 을 띄우고, 마지막으로 받은 값은 그대로 둡니다.
- 연결 확인: `curl http://192.168.0.101:8100/v1/wearable/stage` · 단계 바꿔 보기: `curl -X POST "http://192.168.0.101:8100/v1/wearable/stage?stage=2"`

**테스트 모드** — 헤더 ⚙ 오른쪽의 🧪 버튼. 켜 있는 동안 백엔드 폴링을 멈추고 임의 이력으로 그리며, 패널 아래 도구 막대로 상태를 바꿔 볼 수 있습니다.

- `대기` · `정상 화면` · `불량 대응` · `설비 점검` · `보고서`: 그 단계로 바로 전환 (이력에 한 줄 추가)
- `연결 끊김`: 백엔드 응답이 끊긴 화면
- `자동 순환`: 4초마다 1 → 2 → 3 → 4 → 1 (켤 때 기본으로 켜짐)
- 화면을 오가도 유지되며, 버튼을 다시 누르면 실제 데이터로 돌아갑니다.

### 컨베이어 IP 카메라 (RTSP)

비전 서버 없이 IP 카메라를 직접 붙일 때 쓰는 방법입니다.

브라우저는 RTSP 를 직접 재생하지 못하므로 [MediaMTX](https://github.com/bluenviron/mediamtx) 로 WebRTC 변환을 권장합니다.

```yaml
# mediamtx.yml
paths:
  conveyor1:
    source: rtsp://admin:password@192.168.0.21:554/stream1
  conveyor2:
    source: rtsp://admin:password@192.168.0.22:554/stream1
  conveyor3:
    source: rtsp://admin:password@192.168.0.23:554/stream1
```

MediaMTX 실행 후 `http://<서버>:8889/conveyor1/whep` 를 `webrtc` 주소로 사용합니다.
카메라가 H.265 로 송출하면 브라우저에서 재생되지 않을 수 있으니 카메라 설정에서 **H.264** 로 맞춰 주세요.

### 주의

- 대시보드는 `http://` 로 띄우세요. `https` 페이지에서는 `http` 스트림이 차단됩니다(혼합 콘텐츠).
- MJPEG 는 같은 호스트에 브라우저 동시 연결이 6개로 제한됩니다. 카메라가 많으면 WebRTC 를 쓰세요.
- 전시 PC 에서는 `chrome --kiosk http://localhost:3000` 으로 실행하면 주소창 없이 표시됩니다.

## 폴더 구조

```
app/                 라우트 (page.tsx 4개, layout.tsx, template.tsx, api/ 중계)
components/
  layout/            헤더 · 네비게이션 · 시계
  settings/          설정(언어 선택) 팝업
  media/             StreamView(연결 상태·재연결), 플레이어별 구현, 시연 영상 재생기
  views/             화면 4개
  ui/                패널 공통 스타일
lib/
  config/            avis.config.json 로딩·검증
  i18n/              한국어 / 일본어 / 영어 사전
  stage/             글래스 시연 단계 폴링 · 테스트 모드
  mock/              임의 품목 데이터
avis.config.json     스트림 주소 설정
```
"# 2026-exhibition-osaka-avis" 
