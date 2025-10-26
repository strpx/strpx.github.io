import { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, onValue, push, get } from 'firebase/database';
import { QRCodeSVG } from 'qrcode.react';
import AdminSettings from './AdminSettings';
import PreConfig from './PreConfig';
import GlobalSettings from './GlobalSettings';
import './App.css';

// Firebase設定
const firebaseConfig = {
  apiKey: "AIzaSyCPZ89dzyZu4SOQmC1GWQZ64PlBNpqcuYk",
  authDomain: "strap-9e1ba.firebaseapp.com",
  databaseURL: "https://strap-9e1ba-default-rtdb.firebaseio.com",
  projectId: "strap-9e1ba",
  storageBucket: "strap-9e1ba.firebasestorage.app",
  messagingSenderId: "6273757983",
  appId: "1:6273757983:web:384d833700a30e8365362a",
  measurementId: "G-10WY33CRQB"
};

// Firebase初期化
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

interface Assignment {
  name: string;
  seat: number;
  timestamp: number;
}

interface Session {
  name: string;
  totalSeats: number;
  createdAt: number;
  assignments: Assignment[];
  predefinedSeats?: { [key: string]: number };
}

type Screen = 'create' | 'session' | 'drawing' | 'result' | 'admin' | 'preconfig' | 'global';

function App() {
  const [screen, setScreen] = useState<Screen>('create');
  const [sessionName, setSessionName] = useState('');
  const [totalSeats, setTotalSeats] = useState<number>(10);
  const [sessionId, setSessionId] = useState('');
  const [session, setSession] = useState<Session | null>(null);
  const [participantName, setParticipantName] = useState('');
  const [drawingNumber, setDrawingNumber] = useState<number>(0);
  const [resultSeat, setResultSeat] = useState<number>(0);
  const [isDrawing, setIsDrawing] = useState(false);

  const shareUrl = `${window.location.origin}/index-react.html?s=${sessionId}`;

  // URLパラメータからセッションIDと管理者モードを取得
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const isGlobal = params.has('global');
    const sid = params.get('s');
    const adminId = params.get('admin');
    const preconfigId = params.get('preconfig');
    
    if (isGlobal) {
      // グローバル設定ページ
      setScreen('global');
    } else if (preconfigId) {
      // 事前設定ページ（セッション作成直後）
      setSessionId(preconfigId);
      setScreen('preconfig');
    } else if (adminId) {
      // 管理者設定ページ
      setSessionId(adminId);
      setScreen('admin');
    } else if (sid) {
      // 通常のセッション参加
      joinSession(sid);
    }
  }, []);

  // セッションのリアルタイム監視（グローバル設定も統合）
  useEffect(() => {
    if (!sessionId) return;

    const sessionRef = ref(database, `sessions/${sessionId}`);
    const globalRef = ref(database, 'globalSettings/predefinedSeats');
    
    const unsubscribe = onValue(sessionRef, async (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const assignments: Assignment[] = [];
        if (data.assignments) {
          Object.values(data.assignments).forEach((a: any) => {
            assignments.push(a);
          });
        }
        
        // グローバル設定を取得して統合
        const globalSnapshot = await get(globalRef);
        let combinedPredefined = data.predefinedSeats ? { ...data.predefinedSeats } : {};
        
        if (globalSnapshot.exists()) {
          const globalSettings = globalSnapshot.val();
          console.log('🔧 グローバル設定:', globalSettings);
          // グローバル設定を優先的に適用
          combinedPredefined = { ...combinedPredefined, ...globalSettings };
        }
        
        console.log('✅ 統合された事前設定:', combinedPredefined);
        
        setSession({
          name: data.name,
          totalSeats: data.totalSeats,
          createdAt: data.createdAt,
          assignments,
          predefinedSeats: combinedPredefined
        });
      }
    });

    return () => unsubscribe();
  }, [sessionId]);

  const generateSessionId = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const createSession = async () => {
    if (!sessionName || totalSeats < 1 || totalSeats > 100) {
      alert('セッション名と席の数を正しく入力してください');
      return;
    }

    const sid = generateSessionId();
    const sessionRef = ref(database, `sessions/${sid}`);
    
    await set(sessionRef, {
      name: sessionName,
      totalSeats,
      createdAt: Date.now(),
      status: 'active'
    });

    setSessionId(sid);
    setScreen('session');
    
    // URLを更新
    window.history.pushState({}, '', `?s=${sid}`);
  };

  const joinSession = async (sid: string) => {
    const sessionRef = ref(database, `sessions/${sid}`);
    const snapshot = await get(sessionRef);
    
    if (snapshot.exists()) {
      setSessionId(sid);
      setScreen('session');
    } else {
      alert('セッションが見つかりません');
    }
  };

  const drawSeat = async () => {
    if (!participantName.trim()) {
      alert('名前を入力してください');
      return;
    }

    if (!session) return;

    // 既に引いているかチェック
    if (session.assignments.some(a => a.name === participantName)) {
      alert('この名前はすでにくじを引いています');
      return;
    }

    // 残り席を計算
    const usedSeats = session.assignments.map(a => a.seat);
    const availableSeats: number[] = [];
    for (let i = 1; i <= session.totalSeats; i++) {
      if (!usedSeats.includes(i)) {
        availableSeats.push(i);
      }
    }

    if (availableSeats.length === 0) {
      alert('すべての席が埋まりました');
      return;
    }

    // 🔒 隠し機能: Firebaseから事前設定された席を取得
    const predefinedSeats = session.predefinedSeats || {};
    console.log('🎯 事前設定:', predefinedSeats);
    console.log('👤 入力された名前:', participantName);
    console.log('🔤 大文字変換後:', participantName.toUpperCase());
    
    // 特定の名前かチェック（大文字に統一して比較）
    const predefinedSeat = predefinedSeats[participantName.toUpperCase()];
    console.log('🎲 事前設定された席:', predefinedSeat);
    
    // 事前設定された席がある場合
    if (predefinedSeat !== undefined) {
      // その席がまだ空いているかチェック
      if (usedSeats.includes(predefinedSeat)) {
        // すでに使われている場合は通常のランダム抽選
        setIsDrawing(true);
        setScreen('drawing');
        
        let count = 0;
        const maxCount = 20;
        const interval = setInterval(() => {
          const randomSeat = availableSeats[Math.floor(Math.random() * availableSeats.length)];
          setDrawingNumber(randomSeat);
          count++;

          if (count >= maxCount) {
            clearInterval(interval);
            finalizeDraw(availableSeats);
          }
        }, 100);
      } else {
        // 事前設定された席が空いている場合、アニメーション付きで割り当て
        setIsDrawing(true);
        setScreen('drawing');
        
        let count = 0;
        const maxCount = 20;
        const interval = setInterval(() => {
          // アニメーション中はランダムに見せる
          const randomSeat = availableSeats[Math.floor(Math.random() * availableSeats.length)];
          setDrawingNumber(randomSeat);
          count++;

          if (count >= maxCount) {
            clearInterval(interval);
            // 最後に事前設定された席を割り当て
            finalizeDrawWithSeat(predefinedSeat);
          }
        }, 100);
      }
      return;
    }

    // 通常のランダム抽選
    setIsDrawing(true);
    setScreen('drawing');

    // 2秒のアニメーション
    let count = 0;
    const maxCount = 20;
    const interval = setInterval(() => {
      const randomSeat = availableSeats[Math.floor(Math.random() * availableSeats.length)];
      setDrawingNumber(randomSeat);
      count++;

      if (count >= maxCount) {
        clearInterval(interval);
        finalizeDraw(availableSeats);
      }
    }, 100);
  };

  const finalizeDraw = async (availableSeats: number[]) => {
    const selectedSeat = availableSeats[Math.floor(Math.random() * availableSeats.length)];
    
    const assignmentsRef = ref(database, `sessions/${sessionId}/assignments`);
    await push(assignmentsRef, {
      name: participantName,
      seat: selectedSeat,
      timestamp: Date.now()
    });

    setResultSeat(selectedSeat);
    setIsDrawing(false);
    setScreen('result');
  };

  // 🔒 事前設定された席番号で確定する（隠し機能用）
  const finalizeDrawWithSeat = async (seat: number) => {
    const assignmentsRef = ref(database, `sessions/${sessionId}/assignments`);
    await push(assignmentsRef, {
      name: participantName,
      seat: seat,
      timestamp: Date.now()
    });

    setResultSeat(seat);
    setIsDrawing(false);
    setScreen('result');
  };

  const backToSession = () => {
    setScreen('session');
    setParticipantName('');
  };

  const copyUrl = () => {
    navigator.clipboard.writeText(shareUrl);
    alert('URLをコピーしました！');
  };

  const backFromAdmin = () => {
    window.history.pushState({}, '', `?s=${sessionId}`);
    setScreen('session');
  };

  const completePreConfig = () => {
    window.history.pushState({}, '', `?s=${sessionId}`);
    setScreen('session');
  };

  return (
    <>
      {/* グローバル設定画面 */}
      {screen === 'global' && (
        <GlobalSettings />
      )}

      {/* 事前設定画面（セッション作成直後） */}
      {screen === 'preconfig' && sessionId && session && (
        <PreConfig 
          sessionId={sessionId} 
          totalSeats={session.totalSeats}
          onComplete={completePreConfig} 
        />
      )}

      {/* 管理者設定画面 */}
      {screen === 'admin' && sessionId && (
        <AdminSettings sessionId={sessionId} onBack={backFromAdmin} />
      )}

      {/* 通常画面 */}
      {screen !== 'admin' && screen !== 'preconfig' && screen !== 'global' && (
        <div className="app">
          <div className="container">
            <h1 className="title">🎲 席くじ引きアプリ</h1>

            {/* セッション作成画面 */}
            {screen === 'create' && (
          <div className="screen">
            <div className="form-group">
              <label>セッション名</label>
              <input
                type="text"
                value={sessionName}
                onChange={(e) => setSessionName(e.target.value)}
                placeholder="例: 新年会 2025"
              />
            </div>
            <div className="form-group">
              <label>席の数</label>
              <input
                type="number"
                value={totalSeats}
                onChange={(e) => setTotalSeats(parseInt(e.target.value) || 10)}
                min="1"
                max="100"
                placeholder="例: 10"
              />
            </div>
            <button className="btn btn-primary" onClick={createSession}>
              セッション作成
            </button>
          </div>
        )}

        {/* セッション画面 */}
        {screen === 'session' && session && (
          <div className="screen">
            <div className="session-info">
              <h3>{session.name}</h3>
              <p>席の数: {session.totalSeats}</p>
              <p>セッションID: <strong>{sessionId}</strong></p>
            </div>

            <div className="stats">
              <div className="stat-item">
                <div className="stat-value">{session.assignments.length}</div>
                <div className="stat-label">抽選済み</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{session.totalSeats - session.assignments.length}</div>
                <div className="stat-label">残り席</div>
              </div>
            </div>

            <div className="qr-container">
              <h3>📱 QRコードで参加</h3>
              <div className="qr-code">
                <QRCodeSVG 
                  value={shareUrl} 
                  size={180}
                  bgColor="#ffffff"
                  fgColor="#667eea"
                  level="M"
                />
              </div>
              <div className="qr-info">
                スマートフォンでQRコードを読み取るか、<br />
                以下のURLをシェアしてください
              </div>
              <div className="share-url">
                <strong>{shareUrl}</strong>
                <button className="copy-btn" onClick={copyUrl}>
                  コピー
                </button>
              </div>
            </div>

            <div className="form-group">
              <label>あなたの名前</label>
              <input
                type="text"
                value={participantName}
                onChange={(e) => setParticipantName(e.target.value)}
                placeholder="例: 山田太郎"
              />
            </div>

            <button 
              className="btn btn-primary" 
              onClick={drawSeat}
              disabled={isDrawing}
            >
              🎯 くじを引く
            </button>

            {session.assignments.length > 0 && (
              <div className="results-list">
                <h3>📊 抽選結果</h3>
                {[...session.assignments]
                  .sort((a, b) => a.seat - b.seat)
                  .map((assignment, index) => (
                    <div key={index} className="result-item">
                      <span className="name">{assignment.name}</span>
                      <span className="seat">{assignment.seat}番</span>
                    </div>
                  ))}
              </div>
            )}

            {session.assignments.length === 0 && (
              <div className="status-info">まだ誰もくじを引いていません</div>
            )}
          </div>
        )}

        {/* 抽選中画面 */}
        {screen === 'drawing' && (
          <div className="screen">
            <div className="lottery-display">
              <div className="seat-number">{drawingNumber}</div>
              <p>抽選中...</p>
            </div>
          </div>
        )}

        {/* 結果画面 */}
        {screen === 'result' && (
          <div className="screen">
            <div className="status-success">🎉 おめでとうございます！</div>
            <div className="lottery-display result">
              <p>あなたの席は</p>
              <div className="result-number">{resultSeat}</div>
              <p>番です！</p>
            </div>
            <button className="btn btn-secondary" onClick={backToSession}>
              セッションに戻る
            </button>
          </div>
        )}
          </div>
        </div>
      )}
    </>
  );
}

export default App;
