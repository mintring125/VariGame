// 전체 퀴즈 문제 풀 (20문제)
const quizPool = [
    { question: "고래는 물고기다", answer: false, emoji: "🐋", explanation: "포유류입니다" },
    { question: "펭귄은 날 수 없다", answer: true, emoji: "🐧", explanation: "" },
    { question: "강아지는 땀을 혀로 식힌다", answer: true, emoji: "🐕", explanation: "" },
    { question: "뱀은 귀가 있다", answer: false, emoji: "🐍", explanation: "귀가 없어요" },
    { question: "기린은 목이 길다", answer: true, emoji: "🦒", explanation: "" },
    { question: "토끼는 당근만 먹는다", answer: false, emoji: "🐰", explanation: "풀도 먹어요" },
    { question: "문어는 심장이 3개다", answer: true, emoji: "🐙", explanation: "" },
    { question: "코끼리는 점프를 못 한다", answer: true, emoji: "🐘", explanation: "" },
    { question: "고양이는 색을 볼 수 없다", answer: false, emoji: "🐱", explanation: "일부 색을 봐요" },
    { question: "별가사리는 뇌가 없다", answer: true, emoji: "⭐", explanation: "" },
    { question: "돌고래는 한쪽 눈을 뜨고 잔다", answer: true, emoji: "🐬", explanation: "" },
    { question: "하마는 수영을 잘 한다", answer: false, emoji: "🦛", explanation: "걸어다녀요" },
    { question: "무당벌레는 겨울잠을 잔다", answer: true, emoji: "🐞", explanation: "" },
    { question: "독수리는 시력이 좋다", answer: true, emoji: "🦅", explanation: "" },
    { question: "타조알은 세상에서 가장 큰 알이다", answer: true, emoji: "🥚", explanation: "" },
    { question: "나비는 발로 맛을 본다", answer: true, emoji: "🦋", explanation: "" },
    { question: "북극곰의 피부는 흰색이다", answer: false, emoji: "🐻‍❄️", explanation: "검은색이에요" },
    { question: "개미는 자기 몸무게의 50배를 들 수 있다", answer: true, emoji: "🐜", explanation: "" },
    { question: "악어는 혀를 움직일 수 없다", answer: true, emoji: "🐊", explanation: "" },
    { question: "판다는 고기를 먹지 않는다", answer: false, emoji: "🐼", explanation: "가끔 먹어요" }
];

// 게임 상태
let gameState = {
    selectedQuizzes: [],
    currentQuestionIndex: 0,
    currentPlayer: 1, // 1: 부엉이, 2: 샐리
    scores: { player1: 0, player2: 0 },
    isAnswering: false,
    isSuddenDeath: false
};

// 게임 초기화
function initGame() {
    // 20문제 중 10문제 랜덤 선택
    gameState.selectedQuizzes = getRandomQuizzes(quizPool, 10);
    gameState.currentQuestionIndex = 0;
    gameState.currentPlayer = 1;
    gameState.scores = { player1: 0, player2: 0 };
    gameState.isAnswering = false;
    gameState.isSuddenDeath = false;

    updateUI();
    loadQuestion();
}

// 랜덤 퀴즈 선택 (중복 없이)
function getRandomQuizzes(pool, count) {
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
}

// UI 업데이트
function updateUI() {
    // 점수 업데이트
    document.getElementById('score1').textContent = `${gameState.scores.player1}점`;
    document.getElementById('score2').textContent = `${gameState.scores.player2}점`;

    // 라운드 정보 업데이트
    const totalQuestions = gameState.selectedQuizzes.length;
    const currentRound = Math.min(gameState.currentQuestionIndex + 1, totalQuestions);
    document.getElementById('currentRound').textContent = currentRound;

    // 현재 플레이어 표시
    const playerName = gameState.currentPlayer === 1 ? '부엉이' : '샐리';
    document.getElementById('currentPlayer').textContent = playerName;

    // 플레이어 활성화 표시
    document.querySelectorAll('.player').forEach(p => p.classList.remove('active'));
    document.querySelector(`.player${gameState.currentPlayer}`).classList.add('active');

    // 서든데스 표시
    if (gameState.isSuddenDeath) {
        document.getElementById('currentRound').textContent = '⚡';
        document.querySelector('.round-info').innerHTML = '<span style="color: #FF6B9D; font-weight: bold;">⚡ 서든데스 ⚡</span>';
    }
}

// 문제 로드
function loadQuestion() {
    if (gameState.currentQuestionIndex >= gameState.selectedQuizzes.length) {
        endGame();
        return;
    }

    const currentQuiz = gameState.selectedQuizzes[gameState.currentQuestionIndex];
    document.getElementById('quizEmoji').textContent = currentQuiz.emoji;
    document.getElementById('quizQuestion').textContent = currentQuiz.question;

    // 피드백 숨기기
    const feedback = document.getElementById('feedback');
    feedback.classList.remove('show', 'correct', 'incorrect');
    feedback.textContent = '';

    // 버튼 활성화
    enableAnswerButtons();
}

// 답변 체크
function checkAnswer(userAnswer) {
    if (gameState.isAnswering) return;
    gameState.isAnswering = true;

    const currentQuiz = gameState.selectedQuizzes[gameState.currentQuestionIndex];
    const isCorrect = userAnswer === currentQuiz.answer;

    // 버튼 비활성화
    disableAnswerButtons();

    // 피드백 표시
    const feedback = document.getElementById('feedback');
    if (isCorrect) {
        feedback.textContent = '정답이에요! 🎉';
        feedback.classList.add('show', 'correct');

        // 점수 추가
        if (gameState.currentPlayer === 1) {
            gameState.scores.player1++;
        } else {
            gameState.scores.player2++;
        }
    } else {
        const correctAnswer = currentQuiz.answer ? 'O' : 'X';
        const explanation = currentQuiz.explanation ? ` ${currentQuiz.explanation}` : '';
        feedback.textContent = `아쉬워요~ 정답은 ${correctAnswer}예요!${explanation} 📚`;
        feedback.classList.add('show', 'incorrect');
    }

    updateUI();

    // 다음 문제로
    setTimeout(() => {
        gameState.currentQuestionIndex++;

        // 플레이어 교체 (서든데스가 아닐 때만)
        if (!gameState.isSuddenDeath) {
            gameState.currentPlayer = gameState.currentPlayer === 1 ? 2 : 1;
        }

        gameState.isAnswering = false;
        updateUI();
        loadQuestion();
    }, 3000);
}

// 게임 종료
function endGame() {
    const score1 = gameState.scores.player1;
    const score2 = gameState.scores.player2;

    // 동점 확인
    if (score1 === score2 && !gameState.isSuddenDeath) {
        // 서든데스 시작
        gameState.isSuddenDeath = true;

        // 아직 사용하지 않은 문제들 가져오기
        const unusedQuizzes = quizPool.filter(q =>
            !gameState.selectedQuizzes.some(sq => sq.question === q.question)
        );

        if (unusedQuizzes.length > 0) {
            // 서든데스 문제 추가 (1문제씩 추가)
            const suddenDeathQuiz = unusedQuizzes[Math.floor(Math.random() * unusedQuizzes.length)];
            gameState.selectedQuizzes.push(suddenDeathQuiz);

            updateUI();

            setTimeout(() => {
                loadQuestion();
            }, 1500);
            return;
        }
    }

    // 승자 결정
    let winner, winnerName;
    if (score1 > score2) {
        winner = 'celeste';
        winnerName = '부엉이';
    } else if (score2 > score1) {
        winner = 'sally';
        winnerName = '샐리';
    } else {
        // 완전 동점 (모든 서든데스 문제 소진)
        winner = null;
        winnerName = '무승부';
    }

    // 승리 모달 표시
    const modal = document.getElementById('victoryModal');
    const title = document.getElementById('victoryTitle');
    const finalScores = document.getElementById('finalScores');

    if (winner) {
        title.textContent = `🎉 ${winnerName} 승리! 🎉`;
        finalScores.innerHTML = `
            <div>부엉이: ${score1}점</div>
            <div>샐리: ${score2}점</div>
            <div style="margin-top: 15px; color: var(--ac-green); font-weight: bold;">
                ${winnerName}가 이겼어요! 축하해요! 🌟
            </div>
        `;

        // victory-video 재생
        if (typeof showVictoryVideo === 'function') {
            showVictoryVideo(winner);
        }
    } else {
        title.textContent = '🤝 무승부! 🤝';
        finalScores.innerHTML = `
            <div>부엉이: ${score1}점</div>
            <div>샐리: ${score2}점</div>
            <div style="margin-top: 15px; color: var(--ac-brown); font-weight: bold;">
                둘 다 잘했어요! 👏
            </div>
        `;
    }

    modal.classList.add('show');
}

// 버튼 제어
function enableAnswerButtons() {
    document.querySelectorAll('.answer-btn').forEach(btn => {
        btn.disabled = false;
    });
}

function disableAnswerButtons() {
    document.querySelectorAll('.answer-btn').forEach(btn => {
        btn.disabled = true;
    });
}

// 게임 시작
document.addEventListener('DOMContentLoaded', () => {
    initGame();
});
