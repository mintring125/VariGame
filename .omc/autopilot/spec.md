# Autopilot Spec: 2학년 딸과 할만한 퍼즐 게임 추가

## Requirements

### Target Audience
- 2학년 (8세) 아이와 아빠가 함께 플레이
- 규칙이 간단하고 직관적
- 2인 대전 (부엉이 vs 샐리 테마 유지)

### Functional Requirements
1. 기존 게임 컬렉션에 퍼즐 게임 3개 추가
2. 각 게임은 기존 패턴 준수 (index.html + game.js + style.css)
3. 다크모드 지원
4. 풀스크린 지원
5. 승리 영상 재생
6. 메인 페이지에 게임 카드 추가

### Selected Puzzle Games

1. **숫자 퍼즐 (2048 배틀)** - 2048-battle
   - 2인 교대 플레이 2048 변형
   - 각자 4x4 보드에서 번갈아 한 번씩 슬라이드
   - 먼저 2048 타일을 만들거나, 둘 다 못 만들면 높은 점수 승리
   - 8세가 이해하기 쉬운 숫자 합치기 개념

2. **길 연결 퍼즐 (파이프 연결)** - pipe-puzzle
   - 2인 교대 플레이
   - 6x6 보드에서 파이프 조각을 회전시켜 길 연결
   - 자기 색 시작점에서 끝점까지 먼저 연결하면 승리
   - 공간 추론 능력 발달에 좋음

3. **블록 맞추기 (테트리스 퍼즐)** - block-puzzle
   - 2인 교대 플레이
   - 8x8 보드에 테트로미노 블록을 번갈아 배치
   - 줄을 완성하면 점수 획득, 블록을 놓을 수 없으면 턴 종료
   - 더 많은 점수를 얻은 플레이어 승리

## Technical Spec

### Architecture
- Vanilla HTML/CSS/JS (기존 패턴 준수)
- 각 게임: `games/{game-name}/index.html`, `game.js`, `style.css`
- 공유 자산: victory-video, fullscreen 스크립트/CSS 연결

### File Structure
```
games/
├── 2048-battle/
│   ├── index.html
│   ├── game.js
│   └── style.css
├── pipe-puzzle/
│   ├── index.html
│   ├── game.js
│   └── style.css
└── block-puzzle/
    ├── index.html
    ├── game.js
    └── style.css
```

### Common Patterns to Follow
- CSS variables with light/dark mode
- 'Jua' Google Font
- Player avatars (celeste.png, sally.png)
- Turn-based system with currentPlayer
- initGame(), renderBoard(), updateUI(), updateMessage()
- showVictoryVideo() on win
- Modal for game over
- Home button (🏠) linking to ../../index.html
- Responsive layout (landscape/portrait)

### Index.html Updates
- 3개의 새 게임 카드 추가
- 퍼즐 카테고리 아이콘 사용
