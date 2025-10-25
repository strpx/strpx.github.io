// グローバル変数
let currentSession = null;
let pollingInterval = null;
let usedSeats = new Set();

// ユーティリティ: ランダムなIDを生成
function generateId() {
    return 'sess_' + Math.random().toString(36).substring(2, 15);
}

// セッション作成
async function createSession() {
    const sessionName = document.getElementById('sessionName').value.trim();
    const totalSeats = parseInt(document.getElementById('totalSeats').value);

    if (!sessionName) {
        alert('セッション名を入力してください');
        return;
    }

    if (totalSeats < 2 || totalSeats > 100) {
        alert('席の数は2〜100の範囲で指定してください');
        return;
    }

    const sessionId = generateId();
    const sessionData = {
        id: sessionId,
        session_name: sessionName,
        total_seats: totalSeats,
        status: 'active',
        last_updated: Date.now()
    };

    try {
        const response = await fetch('/tables/sessions', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(sessionData)
        });

        if (response.ok) {
            const result = await response.json();
            currentSession = result;
            showDrawScreen();
        } else {
            alert('セッションの作成に失敗しました');
        }
    } catch (error) {
        console.error('Error creating session:', error);
        alert('エラーが発生しました');
    }
}

// セッション参加
async function joinSession() {
    const sessionId = document.getElementById('sessionId').value.trim();

    if (!sessionId) {
        alert('セッションIDを入力してください');
        return;
    }

    try {
        const response = await fetch(`/tables/sessions?search=${sessionId}&limit=1`);
        const data = await response.json();

        if (data.data && data.data.length > 0) {
            currentSession = data.data[0];
            showDrawScreen();
        } else {
            alert('セッションが見つかりませんでした');
        }
    } catch (error) {
        console.error('Error joining session:', error);
        alert('エラーが発生しました');
    }
}

// くじ引き画面を表示
function showDrawScreen() {
    document.getElementById('setupScreen').classList.remove('active');
    document.getElementById('drawScreen').classList.add('active');

    document.getElementById('currentSessionName').textContent = currentSession.session_name;
    document.getElementById('currentSessionId').textContent = currentSession.id;
    document.getElementById('currentTotalSeats').textContent = currentSession.total_seats;

    // リアルタイム更新を開始
    startPolling();
    loadResults();
}

// セッションIDをコピー
function copySessionId() {
    const sessionId = currentSession.id;
    navigator.clipboard.writeText(sessionId).then(() => {
        alert('セッションIDをコピーしました！');
    });
}

// くじ引き実行
async function drawSeat() {
    const participantName = document.getElementById('participantName').value.trim();

    if (!participantName) {
        alert('名前を入力してください');
        return;
    }

    // ボタンを無効化
    const drawButton = document.getElementById('drawButton');
    drawButton.disabled = true;

    // アニメーション開始
    showDrawAnimation();

    // 利用可能な席番号を取得
    await loadUsedSeats();
    const availableSeats = [];
    for (let i = 1; i <= currentSession.total_seats; i++) {
        if (!usedSeats.has(i)) {
            availableSeats.push(i);
        }
    }

    if (availableSeats.length === 0) {
        alert('すべての席が埋まっています');
        hideDrawAnimation();
        drawButton.disabled = false;
        return;
    }

    // ランダムに席を選択
    const randomIndex = Math.floor(Math.random() * availableSeats.length);
    const selectedSeat = availableSeats[randomIndex];

    // アニメーション演出（2秒間）
    let counter = 0;
    const animationInterval = setInterval(() => {
        const randomNum = Math.floor(Math.random() * currentSession.total_seats) + 1;
        document.getElementById('rouletteNumber').textContent = randomNum;
        counter++;
        if (counter > 20) {
            clearInterval(animationInterval);
            finalizeDraw(participantName, selectedSeat);
        }
    }, 100);
}

// くじ引き確定
async function finalizeDraw(participantName, seatNumber) {
    const assignmentData = {
        id: generateId(),
        session_id: currentSession.id,
        participant_name: participantName,
        seat_number: seatNumber,
        drawn_at: Date.now()
    };

    try {
        const response = await fetch('/tables/seat_assignments', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(assignmentData)
        });

        if (response.ok) {
            hideDrawAnimation();
            showResult(participantName, seatNumber);
            loadResults();

            // ボタンを再有効化
            document.getElementById('drawButton').disabled = false;
            document.getElementById('participantName').value = '';
        } else {
            alert('くじ引きの保存に失敗しました');
            hideDrawAnimation();
            document.getElementById('drawButton').disabled = false;
        }
    } catch (error) {
        console.error('Error saving draw:', error);
        alert('エラーが発生しました');
        hideDrawAnimation();
        document.getElementById('drawButton').disabled = false;
    }
}

// アニメーション表示
function showDrawAnimation() {
    document.getElementById('drawAnimation').classList.add('active');
    document.getElementById('resultCard').classList.remove('active');
}

// アニメーション非表示
function hideDrawAnimation() {
    document.getElementById('drawAnimation').classList.remove('active');
}

// 結果表示
function showResult(name, seatNumber) {
    document.getElementById('resultName').textContent = name + ' さん';
    document.getElementById('resultSeatNumber').textContent = seatNumber;
    document.getElementById('resultCard').classList.add('active');
}

// 使用済み席番号を読み込み
async function loadUsedSeats() {
    try {
        const response = await fetch(`/tables/seat_assignments?search=${currentSession.id}&limit=1000`);
        const data = await response.json();

        usedSeats.clear();
        if (data.data) {
            data.data.forEach(assignment => {
                if (assignment.session_id === currentSession.id) {
                    usedSeats.add(assignment.seat_number);
                }
            });
        }
    } catch (error) {
        console.error('Error loading used seats:', error);
    }
}

// 結果リストを読み込み
async function loadResults() {
    try {
        const response = await fetch(`/tables/seat_assignments?search=${currentSession.id}&limit=1000&sort=-drawn_at`);
        const data = await response.json();

        const resultsList = document.getElementById('resultsList');
        
        if (!data.data || data.data.length === 0) {
            resultsList.innerHTML = '<p class="empty-message">まだ誰もくじを引いていません</p>';
            return;
        }

        // セッションに関連する結果のみフィルタリング
        const sessionResults = data.data.filter(item => item.session_id === currentSession.id);

        if (sessionResults.length === 0) {
            resultsList.innerHTML = '<p class="empty-message">まだ誰もくじを引いていません</p>';
            return;
        }

        // 席番号順にソート
        sessionResults.sort((a, b) => a.seat_number - b.seat_number);

        resultsList.innerHTML = sessionResults.map(item => `
            <div class="result-item">
                <span class="result-item-name">${escapeHtml(item.participant_name)}</span>
                <span class="result-item-seat">席 ${item.seat_number}</span>
            </div>
        `).join('');

        // 使用済み席を更新
        usedSeats.clear();
        sessionResults.forEach(item => {
            usedSeats.add(item.seat_number);
        });

    } catch (error) {
        console.error('Error loading results:', error);
    }
}

// リアルタイム更新開始
function startPolling() {
    // 既存のポーリングを停止
    if (pollingInterval) {
        clearInterval(pollingInterval);
    }

    // 3秒ごとに結果を更新
    pollingInterval = setInterval(() => {
        loadResults();
    }, 3000);
}

// リアルタイム更新停止
function stopPolling() {
    if (pollingInterval) {
        clearInterval(pollingInterval);
        pollingInterval = null;
    }
}

// セットアップ画面に戻る
function backToSetup() {
    stopPolling();
    currentSession = null;
    usedSeats.clear();

    document.getElementById('drawScreen').classList.remove('active');
    document.getElementById('setupScreen').classList.add('active');
    document.getElementById('resultCard').classList.remove('active');
    document.getElementById('participantName').value = '';
}

// HTMLエスケープ
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

// ページ離脱時にポーリング停止
window.addEventListener('beforeunload', () => {
    stopPolling();
});
