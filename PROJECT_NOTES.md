# Project Notes

이 문서는 `Six Bugs` 프로젝트에서 작업할 때 기억해야 할 핵심 결정사항, 금지사항, 검증 방법을 정리한 메모입니다.

## 프로젝트 개요

- 게임 이름은 `Six Bugs`입니다.
- 6 nimmt! 규칙을 바탕으로 만든 실시간 멀티플레이 카드 게임입니다.
- 서버는 `server.js`에서 Express + Socket.IO로 동작합니다.
- 프론트엔드는 `index.html`, `css/style.css`, `js/ui.js`, `js/main.js` 중심으로 구성됩니다.
- 순수 게임 규칙과 상태 처리 로직은 `js/gameLogic.js`에 모아 둡니다.
- 실행 명령은 일반적으로 `npm start`, 개발 실행은 `npm run dev`입니다.

## 폴더와 파일 역할

- `css/style.css`: 화면 스타일, 카드 스타일, 보드/애니메이션/레이아웃 CSS.
- `js/gameLogic.js`: 카드 점수 계산, 덱 생성, 라운드/턴/행 배치 규칙 등 순수 로직.
- `js/ui.js`: DOM 렌더링, 화면 이벤트 바인딩, UI 상태 표시.
- `js/main.js`: Socket.IO 연결, 서버 이벤트 처리, 클라이언트 앱 초기화.
- `server.js`: 방 생성/입장, 재접속, 제출 상태, 채팅, 수동 배치 턴, AI 처리, 상태 브로드캐스트.
- `node_modules/`: 설치된 의존성이므로 직접 수정하지 않습니다.

## 아키텍처 원칙

- 서버가 심판입니다. 클라이언트는 게임 결과를 직접 계산하지 않고 서버가 내려주는 상태를 렌더링합니다.
- UI 코드와 게임 규칙 코드는 분리합니다. DOM 조작은 `ui.js`, 게임 규칙은 `gameLogic.js` 또는 서버 로직에서 처리합니다.
- 일반 모드에서는 사람이 직접 행을 선택해야 하며, 서버가 자동으로 배치하면 안 됩니다.
- AI 모드에서는 사람의 차례는 수동 선택, 봇의 차례는 서버 AI가 자동 선택합니다.
- 제출된 카드는 블라인드 처리합니다. 다른 사람의 카드는 실제로 행에 배치되는 순간에만 공개합니다.
- 새로고침 후에도 진행 중인 방으로 복구할 수 있도록 세션 정보를 저장하고 재접속 로직을 유지합니다.

## UI/UX에서 유지할 것

- 다크 그린/청록 계열의 보드 테마를 유지합니다.
- 카드 공개 영역은 내 카드 덱 아래에 유지합니다.
- 카드 로그는 왼쪽 패널에 따로 두고, 최근 로그만 제한적으로 보여줍니다.
- 플레이어 패널에는 내 프로필과 상대 프로필이 함께 보이며, 벌점이 잘 보여야 합니다.
- 내 배치 차례에는 `Your Hand` 영역 테두리에 부드러운 Pulse/Glow 효과를 줍니다.
- 내 배치 차례 안내 문구는 세로 공간을 과하게 늘리지 않도록 오른쪽 또는 같은 줄에 배치합니다.
- 청소 연출은 6번째 카드 규칙과 너무 작은 카드로 줄을 먹는 경우 모두 적용합니다.
- 청소 문구는 `청소부`, `바닥쓸기장인`, `인간청소기`, `다 내꺼야`, `인간 다이슨`, `환경미화원`, `배고픈` 계열을 랜덤으로 사용합니다.

## 하지 말아야 할 것

- 사용자 요청 없이 `git reset --hard`, `git checkout --`, 강제 삭제 같은 되돌리기/파괴 작업을 하지 않습니다.
- 사용자 요청 없이 커밋, 푸시, 브랜치 변경을 하지 않습니다.
- `node_modules/` 내부 파일을 직접 수정하지 않습니다.
- 서버와 클라이언트의 Socket.IO 이벤트 이름이나 payload 구조를 한쪽만 바꾸지 않습니다.
- 클라이언트에서 서버 권한 로직을 우회하거나 게임 결과를 임의로 계산하지 않습니다.
- 제출된 다른 플레이어의 카드 숫자를 배치 전에 노출하지 않습니다.
- 한글 문자열이 깨진 상태로 새로 저장하지 않습니다. 파일은 UTF-8 기준으로 유지합니다.
- 전체 파일을 무작정 덮어쓰기 전에 기존 기능과 이벤트 바인딩을 확인합니다.
- CSS 클래스를 삭제할 때는 `js/ui.js`에서 동적으로 생성하는 클래스까지 검색합니다.

## 작업할 때 주의할 점

- 이 저장소는 Git safe.directory 이슈가 있을 수 있으므로 Git 명령이 필요하면 아래처럼 실행합니다.

```powershell
git -c safe.directory=C:/Users/DL3500W11/Desktop/gong/IBC/card status --short
```

- `rg`가 권한 문제로 실패하면 PowerShell `Select-String`, `Get-ChildItem`로 대체합니다.
- 한글이 깨졌는지 확인할 때는 이상한 한자, 물음표, 깨진 자모 조합이 남아 있는지 검색합니다.
- 수동 편집은 가능하면 `apply_patch`로 처리합니다. 단, 한글 인코딩이 깨지는 경우에는 .NET으로 UTF-8 저장을 확인합니다.
- 큰 리팩토링 전에는 `server.js`, `js/main.js`, `js/ui.js`의 이벤트 흐름을 먼저 확인합니다.

## 검증 체크리스트

작업 후 최소한 아래 문법 검사를 실행합니다.

```powershell
node --check server.js
node --check js/gameLogic.js
node --check js/ui.js
node --check js/main.js
```

게임 로직을 건드렸다면 간단한 smoke test도 실행합니다.

```powershell
node -e "import('./js/gameLogic.js').then(({GameState,prepareRound})=>{const g=new GameState({players:[{id:'p1',nickname:'A'},{id:'p2',nickname:'B'}]}); prepareRound(g,1); const c1=g.getPlayer('p1').hand[0].number; const c2=g.getPlayer('p2').hand[0].number; g.playTurn('p1',c1); const r=g.playTurn('p2',c2); if(!r.readyToResolve) throw new Error('turn did not resolve'); console.log('smoke ok');})"
```

## 최근 자주 발생한 문제

- 한글 문자열이 깨지는 문제가 있었으므로 저장 전후로 인코딩과 실제 표시 문구를 확인해야 합니다.
- 새로고침 후 방에서 나가지는 문제는 세션 저장/복구 로직과 서버 재접속 이벤트를 함께 봐야 합니다.
- 나가기 모달은 새로고침 후에도 확인 버튼이 비활성화되지 않아야 합니다.
- 채팅은 내 화면에서만 중복 표시되는 문제가 있었으므로 optimistic append와 서버 broadcast 중복을 주의합니다.
- 카드 선택 시 확대 효과가 부모 컨테이너에 잘리지 않도록 `overflow`와 카드 크기를 함께 조정해야 합니다.