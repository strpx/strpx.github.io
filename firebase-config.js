// Firebase設定ファイル
// このファイルを編集して、自分のFirebase設定を入力してください

export const firebaseConfig = {
    // Firebase Consoleから取得した設定を貼り付けてください
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    databaseURL: "https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// 設定例（参考用 - 実際の値に置き換えてください）
/*
export const firebaseConfig = {
    apiKey: "AIzaSyC1234567890abcdefghijklmnopqrst",
    authDomain: "seat-lottery-app.firebaseapp.com",
    databaseURL: "https://seat-lottery-app-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "seat-lottery-app",
    storageBucket: "seat-lottery-app.appspot.com",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:abcdef1234567890"
};
*/

// 設定の検証
export function validateConfig() {
    const required = ['apiKey', 'authDomain', 'databaseURL', 'projectId', 'appId'];
    const missing = required.filter(key => 
        !firebaseConfig[key] || firebaseConfig[key].startsWith('YOUR_')
    );
    
    if (missing.length > 0) {
        console.error('❌ Firebase設定が不完全です。以下の項目を設定してください:');
        console.error(missing.join(', '));
        return false;
    }
    
    console.log('✅ Firebase設定は有効です');
    return true;
}

// 使用方法：
// 1. Firebase Consoleから設定をコピー
// 2. 上記の firebaseConfig オブジェクトに貼り付け
// 3. seat-lottery-firebase.html でこのファイルをインポート
