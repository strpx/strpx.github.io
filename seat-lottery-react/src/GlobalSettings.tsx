import { useState, useEffect } from 'react';
import { getDatabase, ref, set, get, remove } from 'firebase/database';
import './AdminSettings.css';

interface PredefinedSeat {
  name: string;
  seat: number;
}

function GlobalSettings() {
  const [predefinedSeats, setPredefinedSeats] = useState<PredefinedSeat[]>([]);
  const [newName, setNewName] = useState('');
  const [newSeat, setNewSeat] = useState<number>(0);
  const [isSaving, setIsSaving] = useState(false);

  const database = getDatabase();

  // グローバル設定を読み込む
  useEffect(() => {
    loadGlobalSettings();
  }, []);

  const loadGlobalSettings = async () => {
    const globalRef = ref(database, 'globalSettings/predefinedSeats');
    const snapshot = await get(globalRef);
    
    if (snapshot.exists()) {
      const data = snapshot.val();
      const seats: PredefinedSeat[] = Object.entries(data).map(([name, seat]) => ({
        name,
        seat: seat as number
      }));
      setPredefinedSeats(seats);
    }
  };

  const addPredefinedSeat = () => {
    if (!newName.trim()) {
      alert('名前を入力してください');
      return;
    }

    if (newSeat === 0 || newSeat < 1 || newSeat > 100) {
      alert('席番号は1〜100の範囲で入力してください');
      return;
    }

    // 大文字に統一して重複チェック
    const upperName = newName.toUpperCase();
    if (predefinedSeats.some(s => s.name.toUpperCase() === upperName)) {
      alert('この名前はすでに登録されています');
      return;
    }

    setPredefinedSeats([...predefinedSeats, { name: upperName, seat: newSeat }]);
    setNewName('');
    setNewSeat(0);
  };

  const removePredefinedSeat = (name: string) => {
    setPredefinedSeats(predefinedSeats.filter(s => s.name !== name));
  };

  const saveSettings = async () => {
    setIsSaving(true);
    
    try {
      const predefinedSeatsObj: { [key: string]: number } = {};
      predefinedSeats.forEach(seat => {
        // 名前を大文字に統一して保存
        predefinedSeatsObj[seat.name.toUpperCase()] = seat.seat;
      });

      const globalRef = ref(database, 'globalSettings/predefinedSeats');
      await set(globalRef, predefinedSeatsObj);

      alert('✅ グローバル設定を保存しました！\nすべての新規セッションに適用されます。');
    } catch (error: any) {
      console.error('保存エラー:', error);
      const errorMessage = error?.message || '不明なエラー';
      alert(`❌ 保存に失敗しました\n\nエラー: ${errorMessage}\n\nFirebaseのセキュリティルールを確認してください。`);
    } finally {
      setIsSaving(false);
    }
  };

  const resetSettings = async () => {
    if (!confirm('本当にすべての設定をリセットしますか？\nこの操作は取り消せません。')) {
      return;
    }

    try {
      const globalRef = ref(database, 'globalSettings/predefinedSeats');
      await remove(globalRef);
      setPredefinedSeats([]);
      alert('✅ すべての設定をリセットしました');
    } catch (error: any) {
      console.error('リセットエラー:', error);
      const errorMessage = error?.message || '不明なエラー';
      alert(`❌ リセットに失敗しました\n\nエラー: ${errorMessage}\n\nFirebaseのセキュリティルールを確認してください。`);
    }
  };

  return (
    <div className="app">
      <div className="container">
        <h1 className="title">🔧 グローバル設定</h1>
        <p className="subtitle">全セッション共通の事前座席設定</p>

        <div className="session-info" style={{ background: '#fff3cd', borderLeft: '4px solid #ffc107' }}>
          <h3 style={{ color: '#856404' }}>⚠️ 重要</h3>
          <p style={{ color: '#856404' }}>
            ここで設定した内容は、<strong>すべてのセッション</strong>に適用されます。
            <br />既存のセッションにも即座に反映されます。
          </p>
        </div>

        <div className="admin-section">
          <h3>🎯 グローバル事前設定</h3>
          <p className="info-text">
            特定の名前を入力した人に、指定した席番号を自動的に割り当てます。
            <br />他の参加者にはバレないように、通常通りのアニメーションが表示されます。
            <br /><strong>すべてのセッションで共通して使用されます。</strong>
          </p>

          <div className="predefined-list">
            {predefinedSeats.length === 0 ? (
              <div className="empty-state">まだ設定がありません</div>
            ) : (
              predefinedSeats.map((seat, index) => (
                <div key={index} className="predefined-item">
                  <div className="predefined-info">
                    <span className="predefined-name">{seat.name}</span>
                    <span className="arrow">→</span>
                    <span className="predefined-seat">{seat.seat}番席</span>
                  </div>
                  <button 
                    className="remove-btn"
                    onClick={() => removePredefinedSeat(seat.name)}
                  >
                    削除
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="add-section">
            <h4>➕ 新しい設定を追加</h4>
            <div className="add-form">
              <div className="form-group">
                <label>名前</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="例: YT"
                />
              </div>
              <div className="form-group">
                <label>席番号</label>
                <input
                  type="number"
                  value={newSeat === 0 ? '' : newSeat}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === '') {
                      setNewSeat(0);
                    } else {
                      setNewSeat(parseInt(value) || 0);
                    }
                  }}
                  min="1"
                  max="100"
                  placeholder="例: 1"
                  inputMode="numeric"
                />
              </div>
              <button className="btn btn-secondary" onClick={addPredefinedSeat}>
                追加
              </button>
            </div>
          </div>

          <button 
            className="btn btn-primary" 
            onClick={saveSettings}
            disabled={isSaving}
          >
            {isSaving ? '保存中...' : '💾 グローバル設定を保存'}
          </button>

          <button 
            className="btn btn-danger" 
            onClick={resetSettings}
            style={{ 
              background: '#dc3545',
              marginTop: '10px'
            }}
          >
            🗑️ すべての設定をリセット
          </button>

          <div style={{ marginTop: '20px', padding: '15px', background: '#f8f9fa', borderRadius: '10px' }}>
            <p style={{ fontSize: '0.9em', color: '#666', margin: 0 }}>
              💡 <strong>アクセス方法:</strong> このページのURLをブックマークしておくと便利です
              <br />URL: <code style={{ background: '#fff', padding: '2px 6px', borderRadius: '4px' }}>
                {window.location.origin}{window.location.pathname}?global
              </code>
            </p>
          </div>

          <div style={{ marginTop: '15px', padding: '15px', background: '#fff3cd', borderRadius: '10px', borderLeft: '4px solid #ffc107' }}>
            <p style={{ fontSize: '0.85em', color: '#856404', margin: 0, lineHeight: '1.6' }}>
              ⚠️ <strong>保存/リセットが失敗する場合:</strong>
              <br />Firebaseコンソールでデータベースルールを更新してください：
              <br /><code style={{ background: '#fff', padding: '2px 6px', borderRadius: '4px', display: 'block', marginTop: '8px', fontSize: '0.85em' }}>
                {`{`}
                <br />&nbsp;&nbsp;"rules": {`{`}
                <br />&nbsp;&nbsp;&nbsp;&nbsp;"globalSettings": {`{`}
                <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;".read": true,
                <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;".write": true
                <br />&nbsp;&nbsp;&nbsp;&nbsp;{`}`}
                <br />&nbsp;&nbsp;{`}`}
                <br />{`}`}
              </code>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GlobalSettings;
