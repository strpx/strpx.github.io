# 🔥 Firebase アップグレードガイド

複数デバイスでのリアルタイム共有を実現するためのFirebase実装ガイド

## 🎯 なぜFirebaseか？

### メリット
✅ リアルタイム同期（100ms以下）  
✅ 無料プラン（Spark）で十分  
✅ セットアップが簡単  
✅ スケーラブル  
✅ 認証機能も利用可能  
✅ GitHubPagesと相性が良い  

### 無料プランの制限
- 同時接続: 100
- ストレージ: 1GB
- ダウンロード: 10GB/月
- リアルタイムDB: 100,000 同時接続

→ 小〜中規模のイベントには十分！

## 🚀 実装手順

### ステップ1: Firebaseプロジェクト作成

1. https://console.firebase.google.com/ にアクセス
2. 「プロジェクトを追加」をクリック
3. プロジェクト名入力（例: seat-lottery-app）
4. Googleアナリティクス無効（オプション）
5. プロジェクト作成完了

### ステップ2: Realtime Database有効化

1. 左メニュー「Realtime Database」をクリック
2. 「データベースを作成」
3. ロケーション選択（asia-southeast1推奨）
4. セキュリティルール選択:
   - **テストモード**: 開発時
   - **ロックモード**: 本番時（後でルール設定）

### ステップ3: Web アプリ追加

1. プロジェクト設定（歯車アイコン）
2. 「アプリを追加」→ Web アイコン
3. アプリ名入力
4. Firebase Hosting設定（スキップ可）
5. 設定情報をコピー

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "your-app.firebaseapp.com",
  databaseURL: "https://your-app.firebaseio.com",
  projectId: "your-app",
  storageBucket: "your-app.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};
```

### ステップ4: セキュリティルール設定

```json
{
  "rules": {
    "sessions": {
      "$session_id": {
        ".read": true,
        ".write": true
      }
    },
    "seat_assignments": {
      "$session_id": {
        ".read": true,
        ".write": true,
        ".indexOn": ["session_id", "seat_number"]
      }
    }
  }
}
```

## 💻 コード実装

### index-firebase.html（簡易版）

```html
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <title>席くじ引きアプリ - Firebase版</title>
    
    <!-- Firebase SDKs -->
    <script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-database-compat.js"></script>
    
    <style>
        /* ... 既存のスタイルをコピー ... */
    </style>
</head>
<body>
    <!-- ... 既存のHTMLをコピー ... -->

    <script>
        // Firebase設定
        const firebaseConfig = {
            apiKey: "YOUR_API_KEY",
            authDomain: "your-app.firebaseapp.com",
            databaseURL: "https://your-app.firebaseio.com",
            projectId: "your-app"
        };

        // Firebase初期化
        firebase.initializeApp(firebaseConfig);
        const db = firebase.database();

        // グローバル変数
        let currentSession = null;
        let sessionListener = null;

        // セッション作成
        async function createSession() {
            const sessionName = document.getElementById('sessionName').value.trim();
            const totalSeats = parseInt(document.getElementById('totalSeats').value);

            if (!sessionName || totalSeats < 2 || totalSeats > 100) {
                alert('入力を確認してください');
                return;
            }

            const sessionId = 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            const session = {
                session_id: sessionId,
                session_name: sessionName,
                total_seats: totalSeats,
                status: 'active',
                created_at: firebase.database.ServerValue.TIMESTAMP
            };

            try {
                await db.ref('sessions/' + sessionId).set(session);
                currentSession = { ...session, session_id: sessionId };
                showDrawScreen();
            } catch (error) {
                console.error('Error:', error);
                alert('セッション作成に失敗しました');
            }
        }

        // セッション参加
        async function joinSession() {
            const sessionId = document.getElementById('sessionId').value.trim();
            if (!sessionId) return;

            try {
                const snapshot = await db.ref('sessions/' + sessionId).once('value');
                if (snapshot.exists()) {
                    currentSession = { ...snapshot.val(), session_id: sessionId };
                    showDrawScreen();
                } else {
                    alert('セッションが見つかりません');
                }
            } catch (error) {
                console.error('Error:', error);
                alert('エラーが発生しました');
            }
        }

        // くじ引き実行
        async function drawSeat() {
            const participantName = document.getElementById('participantName').value.trim();
            if (!participantName) {
                alert('名前を入力してください');
                return;
            }

            document.getElementById('drawButton').disabled = true;
            showDrawAnimation();

            try {
                // 使用済み席番号を取得
                const assignmentsSnapshot = await db.ref('seat_assignments/' + currentSession.session_id).once('value');
                const usedSeats = new Set();
                
                if (assignmentsSnapshot.exists()) {
                    assignmentsSnapshot.forEach(child => {
                        usedSeats.add(child.val().seat_number);
                    });
                }

                // 利用可能な席を計算
                const availableSeats = [];
                for (let i = 1; i <= currentSession.total_seats; i++) {
                    if (!usedSeats.has(i)) {
                        availableSeats.push(i);
                    }
                }

                if (availableSeats.length === 0) {
                    alert('すべての席が埋まっています');
                    hideDrawAnimation();
                    document.getElementById('drawButton').disabled = false;
                    return;
                }

                // ランダム選択
                const selectedSeat = availableSeats[Math.floor(Math.random() * availableSeats.length)];

                // アニメーション（2秒）
                let counter = 0;
                const interval = setInterval(() => {
                    document.getElementById('rouletteNumber').textContent = 
                        Math.floor(Math.random() * currentSession.total_seats) + 1;
                    counter++;
                    if (counter >= 20) {
                        clearInterval(interval);
                        finalizeDraw(participantName, selectedSeat);
                    }
                }, 100);

            } catch (error) {
                console.error('Error:', error);
                alert('エラーが発生しました');
                hideDrawAnimation();
                document.getElementById('drawButton').disabled = false;
            }
        }

        // くじ引き確定
        async function finalizeDraw(participantName, seatNumber) {
            const assignmentId = 'assign_' + Date.now();
            const assignment = {
                participant_name: participantName,
                seat_number: seatNumber,
                session_id: currentSession.session_id,
                created_at: firebase.database.ServerValue.TIMESTAMP
            };

            try {
                await db.ref('seat_assignments/' + currentSession.session_id + '/' + assignmentId).set(assignment);
                hideDrawAnimation();
                showResult(participantName, seatNumber);
                document.getElementById('drawButton').disabled = false;
                document.getElementById('participantName').value = '';
            } catch (error) {
                console.error('Error:', error);
                alert('保存に失敗しました');
            }
        }

        // リアルタイム結果監視
        function startRealtimeSync() {
            if (sessionListener) {
                sessionListener.off();
            }

            sessionListener = db.ref('seat_assignments/' + currentSession.session_id);
            sessionListener.on('value', (snapshot) => {
                const results = [];
                if (snapshot.exists()) {
                    snapshot.forEach(child => {
                        results.push(child.val());
                    });
                }

                // 表示更新
                displayResults(results);
            });
        }

        // 結果表示
        function displayResults(results) {
            const resultsList = document.getElementById('resultsList');
            
            if (results.length === 0) {
                resultsList.innerHTML = '<p class="empty-message">まだ誰もくじを引いていません</p>';
                return;
            }

            results.sort((a, b) => a.seat_number - b.seat_number);
            
            resultsList.innerHTML = results.map(item => `
                <div class="result-item">
                    <span class="result-item-name">${escapeHtml(item.participant_name)}</span>
                    <span class="result-item-seat">席 ${item.seat_number}</span>
                </div>
            `).join('');
        }

        // 画面表示
        function showDrawScreen() {
            document.getElementById('setupScreen').classList.remove('active');
            document.getElementById('drawScreen').classList.add('active');
            document.getElementById('currentSessionName').textContent = currentSession.session_name;
            document.getElementById('currentSessionId').textContent = currentSession.session_id;
            document.getElementById('currentTotalSeats').textContent = currentSession.total_seats;
            startRealtimeSync();
        }

        // その他のヘルパー関数
        function showDrawAnimation() {
            document.getElementById('drawAnimation').classList.add('active');
            document.getElementById('resultCard').classList.remove('active');
        }

        function hideDrawAnimation() {
            document.getElementById('drawAnimation').classList.remove('active');
        }

        function showResult(name, seatNumber) {
            document.getElementById('resultName').textContent = name + ' さん';
            document.getElementById('resultSeatNumber').textContent = seatNumber;
            document.getElementById('resultCard').classList.add('active');
        }

        function copySessionId() {
            navigator.clipboard.writeText(currentSession.session_id).then(() => {
                alert('セッションIDをコピーしました！');
            }).catch(() => {
                prompt('セッションIDをコピーしてください:', currentSession.session_id);
            });
        }

        function backToSetup() {
            if (sessionListener) {
                sessionListener.off();
            }
            document.getElementById('drawScreen').classList.remove('active');
            document.getElementById('setupScreen').classList.add('active');
            currentSession = null;
        }

        function escapeHtml(text) {
            const map = {'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'};
            return text.replace(/[&<>"']/g, m => map[m]);
        }

        function generateId() {
            return 'sess_' + Math.random().toString(36).substring(2, 15);
        }
    </script>
</body>
</html>
```

## 🔒 セキュリティ強化

### より安全なルール

```json
{
  "rules": {
    "sessions": {
      "$session_id": {
        ".read": true,
        ".write": "!data.exists() || data.child('status').val() === 'active'"
      }
    },
    "seat_assignments": {
      "$session_id": {
        "$assignment_id": {
          ".read": true,
          ".write": "!data.exists()",
          ".validate": "newData.hasChildren(['participant_name', 'seat_number', 'session_id'])"
        }
      }
    }
  }
}
```

## 📊 コスト試算

### 無料プラン（Spark）での制限

**1イベント（50人参加）の場合:**
- データベース書き込み: 約50回
- リアルタイム接続: 最大50同時
- データ転送: 約1MB

**月間想定:**
- 20イベント実施
- 総データ転送: 20MB
- → 無料プランで十分！✅

## 🎯 まとめ

| 項目 | LocalStorage版 | Firebase版 |
|------|---------------|-----------|
| 複数デバイス共有 | ❌ | ✅ |
| リアルタイム同期 | 同一ブラウザのみ | 全デバイス |
| セットアップ | 不要 | 必要（30分） |
| コスト | 無料 | 無料（制限内） |
| オフライン | ✅ | ❌ |
| スケーラビリティ | 低 | 高 |

**推奨:**
- 対面イベント → LocalStorage版
- リモート参加 → Firebase版
- 両方提供 → ユーザーが選択

---

**次のステップ**: Firebase版を `index-firebase.html` として実装し、README.mdに選択肢として記載
