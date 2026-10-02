# 웹 화면 (MJPEG) — 보내기 · 받기 · 프론트에 띄우기

2026-10-01 · 대상: 웹(프론트) 개발자 · 비전 운영

비전이 **박스 · 트랙 번호 · 기준선 · 상태 띠가 그려진 화면**을 그대로 브라우저로 내보낸다.
받는 쪽은 `<img>` 한 줄이면 보인다.

```html
<img src="http://192.168.0.92:8200/stream/2.mjpg">
```

| | 주소 |
|---|---|
| 비전 (영상) | `http://192.168.0.92:8200` |
| 백엔드 (라인 상태) | `http://192.168.0.101:8100` |

유선으로 바꾸면 IP 가 바뀔 수 있다. 바뀌면 이 표와 프론트 설정만 고친다.

### 다른 사람 프론트로 가져갈 때 — 넘겨줄 것

| 무엇 | 어디 |
|---|---|
| 이 문서 (2~4장이 받는 쪽 이야기) | `docs/STREAM.md` |
| 플레이어 JS 한 파일 — `MjpegView` | `sources/modules/vision/mjpeg-view.js`. 비전에서 바로 받아도 된다: `curl -O http://192.168.0.92:8200/mjpeg-view.js` |
| 주소 두 개 | 비전 `http://192.168.0.92:8200` · 백엔드 `http://192.168.0.101:8100`. **프론트 코드에 박지 말고 설정(`.env` 등)으로** — 유선으로 바꾸면 바뀐다 |
| 카메라 없이 개발할 때 | 데모 서버 — 3.5 |

프론트 쪽 서버는 따로 손댈 게 없다. 영상과 상태는 **보는 사람의 브라우저가 비전 · 백엔드에 직접**
받으러 간다. 그래서 그 브라우저가 두 주소에 닿기만 하면 된다 (같은 망). 영상 · JS 모두 CORS 가
열려 있어 프론트를 어느 서버에서 띄워도 된다 — 다른 주소에서 띄운 페이지가 비전의
`mjpeg-view.js` 를 불러 영상을 그리는 것까지 확인했다 (2026-10-01, Chromium).

---

## 1. 보내는 쪽 (비전) — 이미 붙어 있다

`multi` 를 띄우면 영상도 같이 나간다. 따로 띄울 것은 없다.

```bash
./scripts/vision.sh multi --start --api          # 영상 + 조정자 보고
```

```text
테스트 API  http://0.0.0.0:8200
웹 화면     http://0.0.0.0:8200/view   ·   /stream/{1,2,3,all}.mjpg
```

| 파일 | 하는 일 |
|---|---|
| `sources/modules/vision/stream.py` | 인코딩 · 나눠 주기 · HTTP 경로 (`FrameHub`) |
| `sources/modules/vision/mjpeg-view.js` | 프론트에 넘기는 플레이어 (`MjpegView`) — `/mjpeg-view.js` 로도 나간다. **원본은 이 파일 하나** |
| `sources/modules/vision/stream_viewer.html` | 참고용 페이지 — `/view` 로 열린다. 플레이어는 위 파일을 불러 쓴다 |
| `sources/modules/vision/multi.py` | 8200 서버에 경로를 붙이고, 그린 화면을 매 루프 넘긴다 |
| `tests/test_vision_stream.py` | 카메라 없이 시험 (14개) |

**어떻게 도나**

```text
카메라 루프 (초당 20~30번)
  └─ 그린 화면을 hub.publish(카메라번호, 화면)   ← 참조만 넘긴다. 보는 사람이 없거나
                                                    STREAM_FPS 를 넘으면 그 자리에서 버린다
인코딩 스레드 (hub 안)
  └─ 카메라마다 최신 한 장을 JPEG 으로 한 번만 만든다ㅇㅇㅇs
HTTP 스레드 (보는 사람마다)
  └─ 그 JPEG 을 나눠 준다. 느린 손님에게는 중간 장을 버린다 (화면이 늦어지지 않게)
```

* 한 장을 **한 번만** 인코딩해서 보는 사람 전원에게 준다 — 보는 사람이 늘어도 CPU 는 거의 그대로
* **보는 사람이 없으면 인코딩하지 않는다** — 비전 루프에 부담이 없다
* 합친 화면(`all`)은 누가 볼 때, 그것도 보낼 차례(초당 STREAM_FPS 번)에만 만든다

**설정** — `sources/modules/vision/config.py`

| 이름 | 기본 | 뜻 |
|---|---|---|
| `STREAM` | `True` | 끄면 영상 경로가 없다 (`/status` 는 그대로) |
| `STREAM_FPS` | `10` | 초당 장수. 카메라가 30fps 여도 이만큼만 보낸다 |
| `STREAM_QUALITY` | `70` | JPEG 품질 (60~85) |
| `STREAM_WIDTH` | `None` | `None` = 원본 폭(640). 숫자면 그 폭으로 줄여 보낸다 (320 이면 대역폭 약 1/4) |
| `STREAM_MAX_VIEWERS` | `20` | 카메라 하나당 동시 연결 상한. 넘으면 503 |
| `TEST_API_PORT` | `8200` | 영상과 `/status` 가 같이 쓰는 포트 (`--test-port`) |

---

## 2. 받는 쪽 — 주소

| 경로 | 무엇 |
|---|---|
| `GET /stream/{1,2,3}.mjpg` | 카메라별 실시간 영상 (`multipart/x-mixed-replace`) |
| `GET /stream/all.mjpg` | 3대를 옆으로 붙인 화면 (칸마다 480×360 → 1440×360) |
| `GET /frame/{1,2,3,all}.jpg` | 한 장 (확인 · 캡처용) |
| `GET /streams` | 목록 · 보는 사람 수 · 마지막 프레임이 몇 초 전인가 (JSON) |
| `GET /view` | 참고용 페이지 (카메라 3대 + 라인 상태) |
| `GET /mjpeg-view.js` | 플레이어 JS (ES 모듈). 받아 가거나 바로 `import` 한다 |

**카메라 번호 = 컨베이어 번호다.** 1 = conveyor/1 · 2 = conveyor/2 · 3 = conveyor/3. 카메라는
USB 포트로 컨베이어에 묶여 있어서(`config.BELT_BY_PORT`) 재부팅해도 바뀌지 않는다.

영상 · 한 장 · 목록 모두 `Access-Control-Allow-Origin: *` 다. 다른 주소에서 띄운 페이지가
`fetch` 로 읽어도 된다.

**프레임 형식** — 장마다 이런 머리가 붙는다

```text
--frame
Content-Type: image/jpeg
Content-Length: 34817
X-Frame-Seq: 1532
X-Frame-Ts: 1790820050.684          ← 비전에서 그 화면을 넘긴 시각 (epoch 초)

<JPEG 바이트>
```

`X-Frame-Ts` 와 지금 시각의 차이가 화면 지연이다. 브라우저 PC 와 비전의 시각이 맞아야
정확하다 (docs/LINE_FIXES.md N2).

**`/streams` 응답**

```json
{"fps": 10.0, "quality": 70, "width": null, "max_viewers": 20,
 "streams": {
   "1":   {"stream": "/stream/1.mjpg", "frame": "/frame/1.jpg", "viewers": 1, "last_frame_sec": 0.0},
   "all": {"stream": "/stream/all.mjpg", "frame": "/frame/all.jpg", "viewers": 0, "last_frame_sec": null}}}
```

`last_frame_sec` 가 `null` 이면 아직 아무도 안 봐서 인코딩한 적이 없는 것이다 (정상).
보는 중인데 몇 초씩 커지면 그 카메라가 멈춘 것이다.

### 화면에 그려져 있는 것

| 자리 | 무엇 |
|---|---|
| 박스 | 초록 = 정상(`part`), 빨강 = 불량. `#12 part 0.94` = 트랙 번호 · 클래스 · 점수 |
| 세로선 | 기준선. 왼쪽 → 오른쪽으로 넘으면 "도착" |
| 왼쪽 위 | FPS · 검출 수 · 추론 시간 |
| 선 옆 숫자 | 그 카메라의 생산 수 · 불량 수 |
| 아래 띠 | `10:12:02.835  conveyor/2  STOP_NORMAL  wait j-a719-190  robot/2 picked` — 밀리초 시각 · 비전 상태 · 기다리는 작업 · 로봇 상태 |
| 오른쪽 위 띠 (2초) | `ARRIVED OK #4` (보고함) / `IGNORED #7` (안 셈 — 그리퍼 등) |

---

## 3. 프론트에 띄우기

### 3.1 가장 단순하게 — `<img>`

```html
<img src="http://192.168.0.92:8200/stream/1.mjpg" width="640">
<img src="http://192.168.0.92:8200/stream/2.mjpg" width="640">
<img src="http://192.168.0.92:8200/stream/3.mjpg" width="640">
```

**한계:** `<img>` 는 끊겨도 다시 붙지 않고, 멈춘 걸 알 방법도 없다. 비전을 다시 띄우거나
망이 잠깐 끊기면 마지막 화면에서 멈춘 채로 있다. 시연 · 전시처럼 오래 켜 두는 화면이면
3.2 를 쓴다.

### 3.2 권장 — `MjpegView` (끊기면 다시 붙는다)

`mjpeg-view.js` 한 파일이다 (ES 모듈, 의존성 없음). `fetch` 로 받아 `<canvas>` 에 그린다.
가져가는 법은 둘 중 하나다.

* **복사해서** — 프로젝트의 `src/` 등에 넣고 `import { MjpegView } from "./mjpeg-view.js"`
* **비전에서 바로** — `import { MjpegView } from "http://192.168.0.92:8200/mjpeg-view.js"`
  (비전이 꺼져 있으면 페이지가 플레이어를 못 불러온다. 실서비스면 복사를 권한다)

```html
<canvas id="cam2"></canvas>
<script type="module">
  import { MjpegView } from "./mjpeg-view.js";
  const v = new MjpegView(document.getElementById("cam2"),
                          "http://192.168.0.92:8200/stream/2.mjpg").start();
  // v.frames  받은 장 수 · v.lastAt  마지막으로 그린 시각 (performance.now) · v.ts  그 화면의 X-Frame-Ts
  // 끝낼 때: v.stop()
</script>
```

`type="module"` 이라 페이지를 `file://` 로 직접 열면 안 된다 — 아무 http 서버로 띄운다
(`python3 -m http.server` 등).

하는 일

* 프레임마다 `Content-Length` 로 잘라 그린다
* **3초 동안 새 프레임이 없으면 끊고 1초 뒤 다시 연다** — 카메라가 멈췄거나 망이 끊긴 경우
* 그리는 동안은 다음을 안 읽는다 → 서버가 중간 장을 버린다 → **화면이 늦어지지 않는다**

React 에서는 `useEffect` 안에서 만들고 정리 함수에서 `stop()` 하면 된다. 주소는 설정에서 읽는다
(아래는 Vite 의 `.env` — `VITE_VISION_URL=http://192.168.0.92:8200`).

```jsx
import { useEffect, useRef } from "react";
import { MjpegView } from "./mjpeg-view.js";

const VISION = import.meta.env.VITE_VISION_URL;

export function Camera({ cam }) {           // cam: "1" | "2" | "3" | "all"
  const ref = useRef(null);
  useEffect(() => {
    const v = new MjpegView(ref.current, `${VISION}/stream/${cam}.mjpg`).start();
    return () => v.stop();                    // 화면을 떠나면 연결을 닫는다 — 안 닫으면 보는 사람 수가 쌓인다
  }, [cam]);
  return <canvas ref={ref} style={{ width: "100%", aspectRatio: "4 / 3" }} />;
}
```

Vue 도 같다 — `onMounted` 에서 `start()`, `onBeforeUnmount` 에서 `stop()`.

### 3.3 라인 상태는 백엔드에서

영상 옆에 "정상 가동 / 불량 정지" 를 띄우려면 **백엔드**의 `GET /v1/line/summary` 를 1초마다
부른다 (docs/API.md). 비전 주소에서 받지 않는다 — 이유는 4장 1번.

```js
async function poll() {
  try {
    const d = await (await fetch("http://192.168.0.101:8100/v1/line/summary", { cache: "no-store" })).json();
    // d.ok (true = 정상 · normal_stopped 포함) · d.state · d.label · d.stop_reasons[].label
    // d.produced · d.defect · d.conveyors[] · d.robots[] · d.vision.signal_mode
    show(d);
  } catch (e) {
    showOffline();                           // 백엔드 응답 없음
  }
}
poll(); setInterval(poll, 1000);
```

| `d.state` | 화면에 |
|---|---|
| `running` | 초록 — 가동 중 |
| `normal_stopped` | 초록 — 정상품 이송 중 (일부 컨베이어만 섬, 고장 아님) |
| `defect_stopped` | 빨강 — 불량, 설비 전체 정지 (`stop_reasons` 에 어느 카메라인지) |
| `fault_stopped` · `offline_stopped` | 주황/빨강 — 고장 · 연결 끊김 |
| `idle` | 회색 — 가동 전 |

### 3.4 참고 페이지를 그대로 쓰기

```text
http://192.168.0.92:8200/view                                   카메라 3대 + 라인 상태
http://192.168.0.92:8200/view?cams=all                          합친 화면 하나만
http://192.168.0.92:8200/view?backend=http://<백엔드>:8100       백엔드 주소가 다를 때
http://<어디든>/stream_viewer.html?vision=http://<비전>:8200     파일을 다른 서버에 올렸을 때
```
---

## 4. 지켜야 할 것

1. **비전 주소에는 한 페이지에서 영상을 6개보다 적게 연다.** 브라우저는 같은 주소에 연결을
   6개까지만 연다 (Chromium · Firefox 같음). 카메라 3개 + 합친 화면 = 4개는 괜찮다. 같은
   영상을 두 곳에 띄우면 연결도 두 개다. 탭을 여러 개 띄우면 합쳐서 센다.
2. **상태(`summary`)는 백엔드 주소에서 받는다.** 같은 주소에서 영상과 상태를 같이 받으면
   영상이 6개를 채우는 순간 **상태가 조용히 멈춘다** (실측: 같은 주소에 영상 6개 + 폴링 →
   10초 동안 폴링 0번 성공).
3. **페이지는 `http` 로 연다.** `https` 페이지에서는 `http` 영상이 막힌다 (mixed content).
   꼭 `https` 로 서비스해야 하면, 같은 주소의 리버스 프록시(nginx 등)로 비전 `/stream/` 을 감싼다.
4. **화면을 떠날 때 연결을 닫는다** (`v.stop()`). 안 닫으면 `STREAM_MAX_VIEWERS` 에 걸린다.
   서버도 떠난 연결을 정리하지만 몇 초 걸린다.

---

## 5. 대역폭 · 부하 (실측 — 2026-10-01, 실제 카메라 3대, 640×480, 10fps, 품질 70)

| | 값 |
|---|---|
| 카메라 한 대 영상 | 약 **2.9 Mbps** (16초에 5.0~5.7 MB) |
| 합친 화면 `all` | 약 **5 Mbps** (16초에 10 MB) |
| 한 브라우저가 3대를 다 볼 때 | 약 9 Mbps — **보는 브라우저 수만큼 곱해진다** |
| 화면 지연 (비전 장비 안에서 받았을 때) | 평균 0.01~0.02초 |
| 실제로 나간 장수 | 4개 모두 초당 10.1장 |
| 비전 CPU | 아무도 안 볼 때 코어 0.90개 → 4개를 볼 때 1.21개 (12코어 중) |

대역폭이 모자라면 화면이 **늦어지지는 않고 장수가 준다** (느린 손님에게는 중간 장을 버린다 —
시험에서 대역폭을 필요량의 60% 로 줄여도 20초 뒤 지연 1.0초 고정). 줄이려면 `STREAM_FPS`
나 `STREAM_WIDTH` 부터 낮춘다.

**제어 신호와 같은 망을 쓴다.** 유선 백본이면 문제없다. 무선으로 운영하면서 여러 명이 영상을
보면 비전의 보고 · 조정자 명령이 같이 밀릴 수 있다 (docs/LINE_FIXES.md 4장).

---

## 6. 확인 · 문제가 생기면

```bash
curl http://192.168.0.92:8200/streams                    # 목록 · 보는 사람 수 · 마지막 프레임
curl -o f.jpg http://192.168.0.92:8200/frame/2.jpg       # 한 장 받아 보기
curl -s http://192.168.0.92:8200/stream/1.mjpg | head -c 300   # 머리만 보기 (Ctrl-C)
PYTHONPATH=sources:/usr/lib/python3.8/dist-packages python3 tests/test_vision_stream.py
```

| 증상 | 원인 · 할 일 |
|---|---|
| 연결이 안 됨 | `multi` 가 안 떠 있다. `/status` 도 안 되면 비전을 띄운다 |
| 404 `없는 카메라` | 번호가 틀렸다. `/streams` 의 목록을 본다 |
| 503 `보는 사람이 너무 많다` | 떠난 페이지가 연결을 안 닫았다 (4장 4번), 또는 `STREAM_MAX_VIEWERS` 를 올린다 |
| 영상은 나오는데 상태가 멈춤 | 영상과 상태를 같은 주소에서 받는다 (4장 2번) |
| `https` 페이지에서 안 나옴 | 4장 3번 |
| 화면이 멈춤 | `MjpegView` 면 3초 뒤 다시 붙는다. `<img>` 면 새로고침해야 한다 |
| 첫 장이 몇 초 전 화면 | 접속 순간 들고 있던 마지막 장을 먼저 준다. 다음 장(0.1초 뒤)부터 실시간이다 |
| `import` 가 안 됨 | 페이지를 `file://` 로 열었다 → http 서버로 띄운다. 비전에서 바로 import 하는데 비전이 꺼져 있다 → 파일을 복사해 쓴다 |
