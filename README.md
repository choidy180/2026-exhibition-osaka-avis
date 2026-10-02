# AVIS — 웨어러블 실시간 모니터링 대시보드

디엑스솔루션즈(DXSolutions) 전시회 시연용 웹 대시보드입니다.
Vuzix M4000 웨어러블의 실시간 화면(미러링)과 컨베이어 벨트 IP 카메라 영상을 브라우저에 띄웁니다.

- Next.js 16 (App Router, `src` 폴더 없음) + styled-components 6
- 한국어 / 日本語 / English 지원 (기본값: 일본어, 오른쪽 위 ⚙ 설정에서 변경)

## 화면 구성

| 경로 | 화면 | 동작 |
| --- | --- | --- |
| `/` | 메인 — 왼쪽 AVIS 미러링, 오른쪽 위 시연 영상 3종 순차 반복, 오른쪽 아래 컨베이어 카메라 1 | 미러링 더블클릭 → `/mirror`, 컨베이어 더블클릭 → `/conveyor` |
| `/mirror` | AVIS 미러링 전체 화면 + 오른쪽 아래 시연 영상 PiP | 더블클릭 또는 [메인으로] → `/` |
| `/conveyor` | 컨베이어 카메라 1(전체 라인) 크게 보기 | 왼쪽 아래 [자세히 보기] → `/conveyor/detail` |
| `/conveyor/detail` | 왼쪽 카메라 1, 오른쪽 위 품목 정보, 오른쪽 아래 카메라 2 · 3 | 왼쪽 아래 [크게보기] → `/conveyor` |

- 시연 영상은 메인 ↔ 미러링 화면을 오가도 재생 위치가 이어집니다.
- 품목 정보(이너드럼 / `dxs-drum-000N` / 색상 / 작업자 / 작업 상태)는 `lib/mock/items.ts` 의 임의 데이터로, 공정 단계가 자동으로 진행됩니다.
- 헤더의 ⛶ 버튼으로 전체 화면(키오스크) 전환.

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
    "mirror":    { "type": "mjpeg",  "url": "http://192.168.0.50:8080/stream.mjpeg" },
    "conveyor1": { "type": "webrtc", "url": "http://192.168.0.10:8889/conveyor1/whep" },
    "conveyor2": { "type": "webrtc", "url": "http://192.168.0.10:8889/conveyor2/whep" },
    "conveyor3": { "type": "webrtc", "url": "http://192.168.0.10:8889/conveyor3/whep", "fit": "cover" }
  }
}
```

| 키 | 화면 |
| --- | --- |
| `mirror` | Vuzix M4000 미러링 |
| `conveyor1` | 컨베이어 카메라 1 (전체 라인 — 메인 / 3·4번 화면 왼쪽) |
| `conveyor2`, `conveyor3` | 4번 화면 오른쪽 아래 |

| `type` | 용도 | `url` 예시 |
| --- | --- | --- |
| `mjpeg` | MJPEG 스트림 (`<img>`) | `http://<ip>:8080/stream.mjpeg` |
| `webrtc` | WHEP (지연 가장 낮음) | MediaMTX `http://<서버>:8889/<path>/whep` · go2rtc `http://<서버>:1984/api/webrtc?src=<name>` |
| `hls` | HLS | `http://<서버>:8888/<path>/index.m3u8` |
| `video` | mp4 등 일반 영상 주소 | `/videos/01-timecheck.mp4` |
| `iframe` | 스트리밍 서버의 웹 플레이어 페이지 | `http://<서버>:8889/<path>` |
| `webcam` | PC 에 연결된 캡처보드·USB 카메라 (`deviceLabel` 로 장치 이름 일부 지정) | — |
| `none` | 사용 안 함 | — |

- `fit`: `contain`(기본, 잘림 없이 전체) / `cover`(화면 꽉 채움)
- 연결이 끊기거나 화면이 10초 이상 멈추면 `reconnectSeconds` 후 자동 재연결합니다.

### Vuzix M4000 미러링

M4000 은 Android 기반이므로 화면 공유 앱으로 IP 스트림을 만들 수 있습니다.

1. M4000 에 **ScreenStream** 설치 → *Local (MJPEG)* 모드로 스트리밍 시작, PIN 은 끄기
2. PC 브라우저에서 앱에 표시된 주소(`http://<M4000 IP>:8080`)를 열어 화면이 나오는지 확인
3. 화면 위 영상에서 우클릭 → *이미지 주소 복사* 한 값을 `mirror.url` 에 입력 (`type: "mjpeg"`)
   - 주소 형식은 앱 버전에 따라 다를 수 있으니 반드시 직접 확인하세요.
   - 이미지 주소를 찾기 어려우면 `type: "iframe"`, `url: "http://<M4000 IP>:8080"` 으로도 표시할 수 있습니다.

Vuzix View(PC 앱) + HDMI 캡처 / OBS 가상 카메라를 쓰는 경우엔 `type: "webcam"` 으로 연결할 수 있습니다.

### 컨베이어 IP 카메라 (RTSP)

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
app/                 라우트 (page.tsx 4개, layout.tsx, template.tsx)
components/
  layout/            헤더 · 네비게이션 · 시계
  settings/          설정(언어 선택) 팝업
  media/             StreamView(연결 상태·재연결), 플레이어별 구현, 시연 영상 재생기
  views/             화면 4개
  ui/                패널 공통 스타일
lib/
  config/            avis.config.json 로딩·검증
  i18n/              한국어 / 일본어 / 영어 사전
  mock/              임의 품목 데이터
avis.config.json     스트림 주소 설정
```
"# 2026-exhibition-osaka-avis" 
