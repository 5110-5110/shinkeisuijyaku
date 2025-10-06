// --- 定数と初期データ ---
const GAME_BOARD = document.getElementById('game-board');
const MOVES_COUNT_DISPLAY = document.getElementById('moves-count');
const GAME_MESSAGE = document.getElementById('game-message');
const RESET_BUTTON = document.getElementById('reset-button');

// 使用するカードの値 (8種類) -  画像パスではなく絵文字に戻します 
const CARD_VALUES = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
// 16枚のカードを生成 (8種類 * 2枚)
let cards = [...CARD_VALUES, ...CARD_VALUES]; 

// --- ゲームの状態変数 ---
let flippedCards = []; // 現在めくられているカード（最大2枚）
let lockBoard = false; // 2枚めくられている間は操作ロック
let moves = 0; // 試行回数
let matches = 0; // 一致したペアの数 (最大8)

// --- 初期化処理 ---

function initializeGame() {
    // 状態をリセット
    flippedCards = [];
    lockBoard = false;
    moves = 0;
    matches = 0;
    
    // UIを更新
    MOVES_COUNT_DISPLAY.textContent = moves;
    GAME_MESSAGE.textContent = 'カードをクリックしてスタート！';
    GAME_BOARD.innerHTML = '';
    
    // カードをシャッフルしてボードを生成
    shuffleCards();
    createBoard();
}

// 配列のシャッフル (フィッシャー・イェーツ・シャッフル)
function shuffleCards() {
    for (let i = cards.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [cards[i], cards[j]] = [cards[j], cards[i]];
    }
}

// ゲームボードのHTML要素を生成
function createBoard() {
    cards.forEach((value, index) => {
        const card = document.createElement('div');
        card.classList.add('card');
        card.dataset.value = value;
        card.dataset.index = index;
        card.addEventListener('click', flipCard);

        card.innerHTML = `
            <div class="card-inner">
                <div class="card-face card-front">${value}</div>
                <div class="card-face card-back">?</div>
            </div>
        `;
        GAME_BOARD.appendChild(card);
    });
}

// --- イベント処理とゲームロジック ---

function flipCard(event) {
    const card = event.currentTarget;

    // ロック中、既にめくられている、既に一致しているカードは無視
    if (lockBoard || card.classList.contains('is-flipped') || card.classList.contains('matched')) {
        return;
    }

    // カードをめくる
    card.classList.add('is-flipped');
    flippedCards.push(card);

    if (flippedCards.length === 2) {
        // 2枚目のカードがめくられたら、操作をロックして判定
        lockBoard = true;
        checkMatch();
        
        // 試行回数をカウントアップ
        moves++;
        MOVES_COUNT_DISPLAY.textContent = moves;
    }
}

function checkMatch() {
    const [card1, card2] = flippedCards;
    
    if (card1.dataset.value === card2.dataset.value) {
        // --- 一致した場合 ---
        
        // "matched" クラスを追加して操作不能にし、アニメーションも停止
        card1.classList.add('matched');
        card2.classList.add('matched');
        
        // 状態をリセットし、ロック解除
        resetTurn();
        
        // マッチ数をカウントアップ
        matches++;
        checkGameEnd();

    } else {
        // --- 一致しなかった場合 ---
        
        // 1秒後に自動で裏返す
        setTimeout(() => {
            card1.classList.remove('is-flipped');
            card2.classList.remove('is-flipped');
            resetTurn();
        }, 1000);
    }
}

// ターン終了後の状態リセット
function resetTurn() {
    [flippedCards] = [[], false]; // flippedCardsを空にし、lockBoardを解除
    lockBoard = false;
}

// ゲーム終了判定
function checkGameEnd() {
    if (matches === CARD_VALUES.length) { // 8ペアすべて一致
        GAME_MESSAGE.textContent = ` ゲームクリア！ ${moves}回で全て一致させました！`;
        RESET_BUTTON.style.display = 'block';
    }
}

// --- メイン処理 ---
RESET_BUTTON.addEventListener('click', initializeGame);
initializeGame();
