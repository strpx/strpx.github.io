# 🔥 Firebase セットアップガイド

## 📋 概要

このガイドでは、席くじ引きアプリにFirebaseを統合する手順を説明します。

## 🚀 クイックスタート（5分で完了）

### ステップ1: Firebaseプロジェクトの作成

1. [Firebase Console](https://console.firebase.google.com/) にアクセス
2. 「プロジェクトを追加」をクリック
3. プロジェクト名を入力（例: `seat-lottery-app`）
4. Google Analyticsは不要なのでオフにしてもOK
5. 「プロジェクトを作成」をクリック

### ステップ2: Realtime Databaseの有効化

1. 左メニューから「構築」→「Realtime Database」を選択
2. 「データベースを作成」をクリック
3. ロケーションを選択（`asia-southeast1` など）
4. セキュリティルールは「テストモードで開始」を選択
   - ⚠️ 本番環境では後でルールを変更してください
5. 「有効にする」をクリック

### ステップ3: Firebase設定の取得

1. プロジェクト設定（⚙️アイコン）を開く
2. 「全般」タブを選択
3. 下にスクロールして「マイアプリ」セクションを見つける
4. 「</>」（ウェブアイコン）をクリック
5. アプリのニックネームを入力（例: `Seat Lottery Web`）
6. 「Firebase Hostingを設定」はチェック不要
7. 「アプリを登録」をクリック
8. 表示される **firebaseConfig** をコピー

### ステップ4: アプリに設定を追加

`seat-lottery-firebase.html` を開いて、以下の部分を編集：

```javascript
// Firebase設定（ここに自分のFirebase設定を入れる）
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",              // ← ここを変更
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    databaseURL: "https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};
```

実際の設定例：
```javascript
const firebaseConfig = {
    apiKey: "AIzaSyC1234567890abcdefghijklmnopqrst",
    authDomain: "seat-lottery-app.firebaseapp.com",
    databaseURL: "https://seat-lottery-app-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "seat-lottery-app",
    storageBucket: "seat-lottery-app.appspot.com",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:abcdef1234567890"
};
```

### ステップ5: セキュリティルールの設定（重要！）

開発・テスト段階では以下のルールを使用できます：

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

**本番環境用の推奨ルール**（より安全）：

```json
{
  "rules": {
    "sessions": {
      "$sessionId": {
        ".read": true,
        ".write": "!data.exists() || (data.exists() && !data.child('status').exists()) || data.child('status').val() === 'active'",
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
              ".validate": "newData.isNumber() && newData.val() >= 1 && newData.val() <= root.child('sessions').child($sessionId).child('totalSeats').val()"
            },
            "timestamp": {
              ".validate": "newData.isNumber()"
            }
          }
        }
      }
    }
  }
}
```

ルールの設定方法：
1. Firebase Console → Realtime Database → ルール
2. 上記のJSONをコピー＆ペースト
3. 「公開」をクリック

## ✅ 動作確認

1. ブラウザで `seat-lottery-firebase.html` を開く
2. 右上に「接続済み」と表示されることを確認
3. セッションを作成してテスト
4. 別のデバイス/ブラウザでQRコードを読み取って参加
5. リアルタイムで結果が同期されることを確認

## 🔧 トラブルシューティング

### 「接続できません」エラー

**原因1: Firebase設定が間違っている**
- `firebaseConfig` の値を再確認
- コピー＆ペーストミスがないか確認

**原因2: Realtime Databaseが有効化されていない**
- Firebase Consoleで「Realtime Database」を確認
- データベースURLが設定に含まれているか確認

**原因3: ブラウザの開発者ツールでエラーを確認**
- F12キーで開発者ツールを開く
- Consoleタブでエラーメッセージを確認

### 「権限がありません」エラー

**原因: セキュリティルールが厳しすぎる**
- Firebase Console → Realtime Database → ルール
- テストモード用のルールに変更（上記参照）

### データが同期されない

**原因1: インターネット接続**
- Wi-Fiやモバイルデータ接続を確認

**原因2: ブラウザのキャッシュ**
- Ctrl+Shift+R（Windows）または Cmd+Shift+R（Mac）で強制リロード

## 📊 Firebase データ構造

```
seat-lottery-app (Realtime Database)
└── sessions/
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

## 💰 料金について

Firebase Realtime Databaseの無料枠：
- **ストレージ**: 1GB
- **ダウンロード**: 10GB/月
- **同時接続**: 100接続

席くじ引きアプリの推定使用量：
- 1セッション: 約5KB
- 100セッション: 約500KB
- 接続時間: セッション中のみ（数分〜数十分）

**→ 小規模〜中規模の使用なら無料枠で十分です！**

詳細: [Firebase料金プラン](https://firebase.google.com/pricing)

## 🔒 セキュリティのベストプラクティス

### 1. APIキーの管理

- `apiKey` は公開されても問題ありません（クライアント用）
- セキュリティはFirebase Rulesで制御します

### 2. データの有効期限

古いセッションを自動削除する場合は、Cloud Functionsを使用：

```javascript
// functions/index.js
const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

exports.cleanupOldSessions = functions.pubsub
  .schedule('every 24 hours')
  .onRun(async (context) => {
    const db = admin.database();
    const now = Date.now();
    const cutoff = now - (7 * 24 * 60 * 60 * 1000); // 7日前
    
    const snapshot = await db.ref('sessions').once('value');
    const updates = {};
    
    snapshot.forEach((child) => {
      if (child.val().createdAt < cutoff) {
        updates[child.key] = null;
      }
    });
    
    return db.ref('sessions').update(updates);
  });
```

### 3. 不正なデータの防止

セキュリティルールで入力値を検証：
- 名前の長さ制限
- 席番号の範囲チェック
- 重複チェック（より高度なルール）

## 🚀 さらなる改善案

### 1. 認証の追加

Firebase Authenticationを使って：
- セッション作成者の識別
- セッションの編集権限管理

### 2. オフライン対応

Firebase のオフラインサポート：
```javascript
import { enableNetwork, disableNetwork } from 'firebase/database';

// オフラインモード有効化
database.goOffline();

// オンラインモード復帰
database.goOnline();
```

### 3. 分析機能

Firebase Analyticsを追加：
- セッション作成数
- ユーザー数
- 人気の時間帯

## 📱 デプロイオプション

### オプション1: Firebase Hosting

```bash
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```

### オプション2: GitHub Pages

`seat-lottery-firebase.html` を `index.html` にリネームしてGitHub Pagesで公開

### オプション3: Netlify/Vercel

ドラッグ＆ドロップで簡単デプロイ

## 📞 サポート

問題が発生した場合：
1. [Firebase ドキュメント](https://firebase.google.com/docs)
2. [Stack Overflow](https://stackoverflow.com/questions/tagged/firebase)
3. [Firebase サポート](https://firebase.google.com/support)

---

**更新日**: 2025年10月25日  
**バージョン**: 1.0.0
