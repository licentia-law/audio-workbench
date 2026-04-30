# 실행 가이드

> 이 프로젝트의 `.venv`는 `Activate.ps1`이 없는 환경이다.  
> 가상환경 활성화 없이 `.venv\Scripts\` 내부 실행 파일을 직접 지정한다.

---

## 백엔드 실행 (port 8000)

```powershell
cd C:\Users\mycho\Downloads\_Licentia\Coding\audio-workbench\backend
.\.venv\Scripts\uvicorn.exe app.main:app --reload --host 127.0.0.1 --port 8000
```

정상 실행 확인:
```
http://localhost:8000/api/health
```

---

## 프론트엔드 실행 (port 5173)

```powershell
cd C:\Users\mycho\Downloads\_Licentia\Coding\audio-workbench\frontend
npm run dev
```

접속 주소:
```
http://localhost:5173
```

---

## 패키지 설치 (필요 시)

```powershell
cd C:\Users\mycho\Downloads\_Licentia\Coding\audio-workbench\backend
.\.venv\Scripts\pip.exe install -r requirements.txt
```

---

## 주의사항

- 백엔드를 **먼저** 실행한 뒤 프론트엔드를 실행한다.
- 백엔드 재시작 시 업로드된 파일과 세션이 초기화된다 (임시 파일 정책).
