import { useState, useEffect } from 'react';
import { getDatabase, ref, set, get } from 'firebase/database';
import './AdminSettings.css';

interface PredefinedSeat {
  name: string;
  seat: number;
}

interface AdminSettingsProps {
  sessionId: string;
  onBack: () => void;
}

function AdminSettings({ sessionId, onBack }: AdminSettingsProps) {
  const [predefinedSeats, setPredefinedSeats] = useState<PredefinedSeat[]>([]);
  const [newName, setNewName] = useState('');
  const [newSeat, setNewSeat] = useState<number>(1);
  const [sessionName, setSessionName] = useState('');
  const [totalSeats, setTotalSeats] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  const database = getDatabase();

  // セッション情報と事前設定を取得
  useEffect(() => {
    loadSessionData();
  }, [sessionId]);

  const loadSessionData = async () => {
    const sessionRef = ref(database, `sessions/${sessionId}`);
    const snapshot = await get(sessionRef);
    
    if (snapshot.exists()) {
      const data = snapshot.val();
      setSessionName(data.name);
      setTotalSeats(data.totalSeats);
      
      if (data.predefinedSeats) {
        const seats: PredefinedSeat[] = Object.entries(data.predefinedSeats).map(([name, seat]) => ({
          name,
          seat: seat as number
        }));
        setPredefinedSeats(seats);
      }
    }
  };

  const addPredefinedSeat = () => {
    if (!newName.trim()) {
      alert('名前を入力してください');
      return;
    }

    if (newSeat < 1 || newSeat > totalSeats) {
      alert(`席番号は1〜${totalSeats}の範囲で入力してください`);
      return;
    }

    if (predefinedSeats.some(s => s.name === newName)) {
      alert('この名前はすでに登録されています');
      return;
    }

    setPredefinedSeats([...predefinedSeats, { name: newName, seat: newSeat }]);
    setNewName('');
    setNewSeat(1);
  };

  const removePredefinedSeat = (name: string) => {
    setPredefinedSeats(predefinedSeats.filter(s => s.name !== name));
  };

  const saveSettings = async () => {
    setIsSaving(true);
    
    try {
      const predefinedSeatsObj: { [key: string]: number } = {};
      predefinedSeats.forEach(seat => {
        predefinedSeatsObj[seat.name] = seat.seat;
      });

      const predefinedRef = ref(database, `sessions/${sessionId}/predefinedSeats`);
      await set(predefinedRef, predefinedSeatsObj);

      alert('✅ 設定を保存しました！');
    } catch (error) {
      console.error('保存エラー:', error);
      alert('❌ 保存に失敗しました');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="app">
      <div className="container">
        <h1 className="title">🔒 管理者設定</h1>
        <p className="subtitle">隠し機能：事前座席設定</p>

        <div className="session-info">
          <h3>{sessionName}</h3>
          <p>セッションID: <strong>{sessionId}</strong></p>
          <p>総席数: {totalSeats}</p>
        </div>

        <div className="admin-section">
          <h3>🎯 事前設定された席</h3>
          <p className="info-text">
            特定の名前を入力した人に、指定した席番号を自動的に割り当てます。
            <br />他の参加者にはバレないように、通常通りのアニメーションが表示されます。
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
                  value={newSeat}
                  onChange={(e) => setNewSeat(parseInt(e.target.value) || 1)}
                  min="1"
                  max={totalSeats}
                  placeholder="例: 1"
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
            {isSaving ? '保存中...' : '💾 設定を保存'}
          </button>

          <button className="btn btn-secondary" onClick={onBack}>
            ← セッションに戻る
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdminSettings;
