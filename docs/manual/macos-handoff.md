# MacBook 개발 이관 가이드

Windows에서 작업하던 Audio Workbench를 MacBook에서 이어서 개발하는 절차입니다. 아래 명령은 macOS 터미널의 기본 셸인 zsh 기준입니다.

## 1. 저장소 받기와 자료 이관

GitHub 저장소에 접근할 수 있는 계정으로 인증한 뒤, 작업할 상위 폴더에서 실행합니다. 이후 변경사항도 GitHub에 올릴 수 있도록 ZIP 다운로드 대신 Git으로 복제합니다.

```zsh
git clone --branch main https://github.com/licentia-law/audio-workbench.git
cd audio-workbench
```

| 구분 | 이관 방법 |
|---|---|
| 소스, 설계 문서, UI 시안, 실행 설정 | Git 저장소에 포함됩니다. 개발에 착수하기 전에 루트의 [AGENTS.md](../../AGENTS.md)를 확인합니다. |
| 테스트용 MP3, 원본 음원, 다운로드한 결과 MP3 | 계속 사용할 파일만 별도로 복사합니다. 결과물은 Windows의 브라우저 다운로드 폴더를 먼저 확인합니다. |
| 사용자 지정 환경설정과 작업 메모 | 따로 만든 `backend/.env`, 셸 환경변수, 저장소 밖 메모가 있을 때만 필요한 항목을 이관합니다. `.env`는 기본 실행에 필수는 아니며, 비밀값은 Git에 올리지 않습니다. |
| Windows 가상환경, 패키지, 캐시, 세션 | `backend/.venv`, `frontend/node_modules`, `backend/temp`, `tmp_runtime`은 복사하지 않습니다. 새 기기에서 의존성을 설치하고 필요한 음원을 다시 업로드합니다. |

Git 명령이 없다면 터미널에서 `xcode-select --install`을 실행해 Command Line Tools를 설치합니다.

## 2. macOS 도구 설치

먼저 [Homebrew 설치 안내](https://brew.sh/)에 따라 Homebrew를 설치하고, 설치 프로그램이 출력하는 PATH 설정을 적용합니다. Apple Silicon Mac이라면 Rosetta를 사용하지 않는 터미널에서 `uname -m`이 `arm64`인지 확인합니다. Intel Mac에서는 `x86_64`가 표시됩니다.

```zsh
brew install python@3.12 node@24 ffmpeg-full
export PATH="$(brew --prefix ffmpeg-full)/bin:$(brew --prefix node@24)/bin:$PATH"

python3.12 --version
node --version
npm --version
command -v ffmpeg ffprobe
ffprobe -version
ffmpeg -hide_banner -filters | grep -w rubberband
ffmpeg -hide_banner -encoders | grep -w libmp3lame
```

`export PATH=...` 명령을 각 실행 터미널에 적용합니다. 새 터미널에서도 자동 적용하려면 `~/.zshrc`에서 Homebrew PATH 설정 뒤에 같은 줄을 추가합니다.

Key 변환은 FFmpeg의 내장 `rubberband` 필터를 사용합니다. 필터 확인 명령에서 `rubberband` 행이 나오고 인코더 목록에는 `libmp3lame`이 표시되어야 합니다. 누락되면 `command -v ffmpeg`로 실제 선택된 바이너리를 확인합니다. [Homebrew ffmpeg-full](https://formulae.brew.sh/formula/ffmpeg-full)

## 3. 프로젝트 의존성 설치

저장소 루트에서 실행합니다. 프론트는 `package-lock.json`으로 설치하고, 백엔드는 `requirements.txt`의 버전 범위에 맞춰 새 가상환경에 설치합니다.

```zsh
python3.12 -m venv backend/.venv
backend/.venv/bin/python -m pip install --upgrade pip
```

Apple Silicon Mac:

```zsh
backend/.venv/bin/python -m pip install -r backend/requirements.txt
```

Intel Mac은 위 설치 명령 대신 아래 명령을 실행합니다. PyTorch의 Intel macOS 지원은 2.2.x까지이며, 이 조합에는 NumPy 1.x를 사용합니다. [PyTorch Intel Mac 지원 안내](https://pytorch.org/blog/pytorch2-2/)

```zsh
backend/.venv/bin/python -m pip install -r backend/requirements.txt \
  'torch==2.2.2' 'torchaudio==2.2.2' 'numpy<2'
```

설치가 끝나면 아래 명령으로 의존성과 도구 동작을 확인합니다.

```zsh
npm --prefix frontend ci
backend/.venv/bin/python -m pip check
backend/.venv/bin/python -m demucs --help
```

Demucs 모델은 첫 스템 분리 요청 때 다운로드될 수 있으므로 인터넷이 연결된 상태에서 처음 실행합니다. `demucs --help`는 설치 확인용이고, 실제 모델 다운로드와 오디오 처리는 브라우저에서 스템을 분리해 확인합니다. [Demucs 모델 안내](https://github.com/facebookresearch/demucs#separating-tracks)

## 4. 개발 서버 실행

터미널 두 개를 열어 각각 저장소 루트에서 시작합니다. 두 터미널 모두 2단계의 PATH 설정이 적용되어 있어야 합니다.

**터미널 1 · 백엔드**

```zsh
cd backend
.venv/bin/python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

**터미널 2 · 프론트엔드**

```zsh
cd frontend
NODE_OPTIONS=--dns-result-order=ipv4first npm run dev -- --host 127.0.0.1 --strictPort
```

Vite가 API 프록시의 `localhost:8000`을 해석할 때 IPv4를 우선하도록 지정했습니다. `8000` 또는 `5173`이 이미 사용 중이면 `lsof -nP -iTCP:8000 -iTCP:5173 -sTCP:LISTEN`으로 해당 프로세스를 확인합니다.

## 5. 동작 확인

두 서버를 켜둔 상태로 터미널을 하나 더 열어 확인합니다.

```zsh
curl -fsS http://127.0.0.1:8000/api/health
curl -fsS http://127.0.0.1:5173/api/health
```

두 응답 모두 `"ok":true`와 동일한 `session_id`를 반환하면 백엔드와 프록시가 연결된 상태입니다. [로컬 앱](http://127.0.0.1:5173)을 Chrome으로 열고 10분 미만, 20MB 미만의 짧은 MP3로 아래 항목을 확인합니다.

1. MP3 업로드 후 파일 정보와 파형이 표시되고 재생되는지 확인합니다.
2. 구간 자르기, Key 변환, 음량 증폭을 실행하고 결과 MP3가 다운로드되는지 확인합니다.
3. 음원 분석 결과가 표시되는지, 스템 분리 후 4개 채널이 나오고 믹스 MP3가 저장되는지 확인합니다.

별도로 프로덕션 빌드를 검사하려면 저장소 루트에서 `npm --prefix frontend run build`를 실행합니다. 이관 가이드 작성 시점의 코드에는 `frontend/src/components/common/Modal.tsx`에서 사용하지 않는 `Icon` import로 인한 `TS6133` 오류가 있습니다. 개발 서버 점검과 별도로 빌드 결과를 확인합니다.

다른 기기에서 올린 최신 변경사항은 작업을 시작하기 전에 `git pull --ff-only`로 가져옵니다. 새 기기에서도 변경사항은 커밋한 뒤 GitHub에 푸시합니다.
