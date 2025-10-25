# 🎲 席くじ引きアプリ - Firebase版

QRコードで複数デバイス間リアルタイム共有できる席くじ引きWebアプリケーションです。

## 📋 バージョン比較

| 機能 | LocalStorage版 | QRコード版 | **Firebase版** |
|------|---------------|-----------|---------------|
| 複数デバイス共有 | ❌ | ❌ | ✅ |
| QRコード共有 | ❌ | ✅ | ✅ |
| インターネット不要 | ✅ | ✅ | ❌ |
| サーバー不要 | ✅ | ✅ | ❌ |
| 同じブラウザ内共有 | ✅ | ✅ | ✅ |
| リアルタイム同期 | タブ間のみ | タブ間のみ | **全デバイス** |
| データ永続性 | ブラウザ依存 | ブラウザ依存 | **クラウド保存** |
| セットアップ難易度 | 簡単 | 簡単 | **中程度** |

## ✨ Firebase版の特徴

### 🌟 主な機能

- ✅ **QRコード共有**: スマホで読み取るだけで参加
- ✅ **複数デバイス対応**: スマホ、タブレット、PC間で同期
- ✅ **リアルタイム更新**: 誰かがくじを引くと全員に即座に反映
- ✅ **クラウド保存**: データは安全にFirebaseに保存
- ✅ **接続状態表示**: リアルタイムで接続状態を確認
- ✅ **統計表示**: 抽選済み/残り席を一目で確認
- ✅ **2秒アニメーション**: ドキドキ感のある演出

### 🎯 使用シーン

- 📱 **イベント**: 結婚式、パーティー、忘年会
- 🏢 **会議**: 席決めが必要な会議やセミナー
- 🎓 **学校**: クラス替え、席替え
- 🎪 **ワークショップ**: グループ分け

## 🚀 クイックスタート

### ステップ1: Firebase設定（初回のみ）

**オプションA: 設定ヘルパーを使用（推奨）**

1. `firebase-setup-helper.html` をブラウザで開く
2. [Firebase Console](https://console.firebase.google.com/) から設定をコピー
3. 貼り付けて「設定を解析」をクリック
4. 「設定済みHTMLをダウンロード」をクリック

**オプションB: 手動で設定**

1. [Firebase Console](https://console.firebase.google.com/) でプロジェクトを作成
2. Realtime Databaseを有効化
3. 設定をコピーして `seat-lottery-firebase.html` に貼り付け

詳細は [`FIREBASE_SETUP.md`](FIREBASE_SETUP.md) を参照してください。

### ステップ2: アプリを使用

1. `seat-lottery-firebase.html` をブラウザで開く
2. セッション名と席の数を入力
3. 「セッション作成」をクリック
4. QRコードが表示される
5. 参加者はスマホでQRコードを読み取る
6. 名前を入力して「くじを引く」をクリック

## 📱 使い方の流れ

### 主催者（セッション作成）

```
1. アプリを開く
   ↓
2. セッション名と席の数を入力
   ↓
3. 「セッション作成」ボタンをクリック
   ↓
4. QRコードが表示される
   ↓
5. 参加者にQRコードを見せる、またはURLを共有
```

### 参加者（くじ引き）

```
1. QRコードを読み取る or URLにアクセス
   ↓
2. セッション画面が表示される
   ↓
3. 自分の名前を入力
   ↓
4. 「🎯 くじを引く」ボタンをクリック
   ↓
5. 2秒間のアニメーション
   ↓
6. 席番号が決定！
```

## 🎬 実際の使用例

### 例1: 結婚式の席決め（50名）

1. 受付係がタブレットでセッションを作成
2. QRコードをスクリーンに投影
3. ゲストがスマホで読み取り
4. 各自がくじを引いて席番号を取得
5. 結果がリアルタイムで全員に共有される

### 例2: 会議の席決め（10名）

1. 司会者がPCでセッション作成
2. URLをチャットで共有
3. 参加者が各自のデバイスでアクセス
4. 順番にくじを引く
5. 全員が結果を確認できる

## 📊 画面構成

### 1. トップ画面
- セッション名入力
- 席の数入力
- セッション作成ボタン

### 2. QRコード表示画面
- セッション情報
- QRコード
- 共有URL
- 統計（抽選済み/残り席）
- 名前入力
- くじを引くボタン
- 抽選結果リスト

### 3. 抽選中画面
- 2秒間のアニメーション
- 回転する数字表示

### 4. 結果画面
- あなたの席番号
- セッションに戻るボタン

## 🔧 技術仕様

### フロントエンド
- **HTML5**: セマンティックなマークアップ
- **CSS3**: モダンなスタイリング、アニメーション
- **JavaScript (ES6+)**: 非同期処理、モジュール

### バックエンド
- **Firebase Realtime Database**: リアルタイムデータ同期
- **Firebase SDK 10.7.1**: 最新の Firebase JavaScript SDK

### ライブラリ
- **QRCode.js**: QRコード生成（CDN経由）
- **Firebase**: リアルタイムデータベース

### データ構造

```javascript
sessions/
  └── ABC123/
      ├── name: "新年会 2025"
      ├── totalSeats: 10
      ├── createdAt: 1234567890
      ├── status: "active"
      └── assignments/
          ├── -NxAbC123/
          │   ├── name: "山田太郎"
          │   ├── seat: 5
          │   └── timestamp: 1234567890
          └── -NxAbC456/
              ├── name: "佐藤花子"
              ├── seat: 3
              └── timestamp: 1234567891
```

## 🔐 セキュリティ

### 開発/テスト用ルール

```json
{
  "rules": {
    "sessions": {
      "$sessionId": {
        ".read": true,
        ".write": true
      }
    }
  }
}
```

### 本番環境用ルール（推奨）

```json
{
  "rules": {
    "sessions": {
      "$sessionId": {
        ".read": true,
        ".write": "!data.exists() || data.child('status').val() === 'active'",
        "name": {
          ".validate": "newData.isString() && newData.val().length <= 100"
        },
        "totalSeats": {
          ".validate": "newData.isNumber() && newData.val() >= 1 && newData.val() <= 100"
        },
        "assignments": {
          "$assignmentId": {
            ".write": true,
            "name": {
              ".validate": "newData.isString() && newData.val().length <= 50"
            },
            "seat": {
              ".validate": "newData.isNumber()"
            }
          }
        }
      }
    }
  }
}
```

## 💰 料金について

### Firebase無料枠（Sparkプラン）

- **ストレージ**: 1GB
- **ダウンロード**: 10GB/月
- **同時接続**: 100接続

### 推定使用量

- 1セッション: 約5KB
- 100セッション: 約500KB
- 接続時間: セッション中のみ（通常10〜30分）

**→ 小規模〜中規模のイベントなら無料枠で十分！**

## 📂 ファイル構成

```
.
├── seat-lottery-firebase.html      # メインアプリ（Firebase版）
├── seat-lottery-qr.html            # QRコード版（LocalStorage）
├── firebase-setup-helper.html      # Firebase設定ヘルパー
├── firebase-config.js              # Firebase設定ファイル
├── FIREBASE_SETUP.md               # 詳細セットアップガイド
├── README-FIREBASE.md              # このファイル
└── index.html                      # LocalStorage版
```

## 🛠 カスタマイズ

### アニメーション時間の変更

`animateDraw()` 関数内の値を変更：

```javascript
const maxCount = 20; // 20回 × 100ms = 2秒
// 30にすると3秒、10にすると1秒
```

### カラーテーマの変更

CSS内のグラデーション値を変更：

```css
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
/* 他のカラー例:
   赤系: #f85032 0%, #e73827 100%
   青系: #4facfe 0%, #00f2fe 100%
   緑系: #43e97b 0%, #38f9d7 100%
*/
```

### 席の最大数を変更

HTML内の入力フィールドの `max` 属性を変更：

```html
<input type="number" id="totalSeats" max="100">
<!-- 例: max="200" にすると200席まで対応 -->
```

## 🔧 トラブルシューティング

### 「接続できません」と表示される

**原因と対処法:**

1. **Firebase設定が間違っている**
   - `firebaseConfig` の値を再確認
   - firebase-setup-helper.html で設定を検証

2. **Realtime Databaseが有効化されていない**
   - Firebase Console → Realtime Database
   - 「データベースを作成」をクリック

3. **インターネット接続がない**
   - Wi-Fiやモバイルデータを確認

### QRコードが読み取れない

**対処法:**

1. カメラの焦点を合わせる
2. 明るい場所で読み取る
3. QRコードアプリを使用
4. 代わりにURLを手動でコピー

### データが同期されない

**対処法:**

1. ブラウザを強制リロード（Ctrl+Shift+R）
2. 接続状態を確認（右上の表示）
3. Firebase Consoleでデータを確認
4. セキュリティルールを確認

### くじを引いても反応しない

**対処法:**

1. 名前が入力されているか確認
2. すでに同じ名前で引いていないか確認
3. すべての席が埋まっていないか確認
4. ブラウザの開発者ツール（F12）でエラーを確認

## 🚀 デプロイオプション

### 1. Firebase Hosting（推奨）

```bash
# Firebase CLIインストール
npm install -g firebase-tools

# ログイン
firebase login

# プロジェクト初期化
firebase init hosting

# デプロイ
firebase deploy
```

### 2. GitHub Pages

1. リポジトリに `seat-lottery-firebase.html` をプッシュ
2. Settings → Pages → Source を設定
3. `https://username.github.io/repo-name/seat-lottery-firebase.html` でアクセス

### 3. Netlify

1. [Netlify](https://www.netlify.com/) にログイン
2. ファイルをドラッグ&ドロップ
3. 自動でURLが発行される

### 4. Vercel

1. [Vercel](https://vercel.com/) にログイン
2. プロジェクトをインポート
3. 自動でデプロイ

## 📈 今後の拡張案

- [ ] 認証機能（Firebase Authentication）
- [ ] セッション管理画面（編集・削除）
- [ ] 結果のCSVエクスポート
- [ ] 座席表のビジュアル表示
- [ ] 複数言語対応（i18n）
- [ ] ダークモード
- [ ] 音声効果
- [ ] アニメーション効果のカスタマイズ
- [ ] セッション履歴
- [ ] プッシュ通知

## 🤝 サポート

### 公式リソース

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Console](https://console.firebase.google.com/)
- [QRCode.js GitHub](https://github.com/soldair/node-qrcode)

### コミュニティ

- [Stack Overflow - Firebase](https://stackoverflow.com/questions/tagged/firebase)
- [Firebase Discord](https://discord.gg/firebase)

## 📝 ライセンス

このプロジェクトはMITライセンスの下で公開されています。

---

**バージョン**: 3.0.0 (Firebase版)  
**最終更新**: 2025年10月25日  
**ステータス**: Production Ready ✅  
**開発**: GenSpark AI Developer
