// 1. スクリプトが死んでいないかの確認用ログ
console.log("🚀 script.js の読み込みに成功しました！");

// 2. データベースの接続設定
const SUPABASE_URL = 'https://qpqwbfktdmffbexuupow.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFwcXdiZmt0ZG1mZmJleHV1cG93Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAyMDMzNDYsImV4cCI6MjA5NTc3OTM0Nn0.tfuVcmkQRjqhBvtUKgEvpH3WHEJFI-vWyIPfs2CeJO8';
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 3. 初期読み込み
document.addEventListener("DOMContentLoaded", () => {
    loadVoteCounts();
    checkAlreadyVoted(); // 【追加】画面を開いた時に「投票済み」かチェックする
});

// 4. 票数を取得して画面に反映する関数
async function loadVoteCounts() {
    const { data, error } = await supabaseClient.from('votes').select('entry_id');
    
    if (error) {
        console.error("❌ データ取得エラー:", error);
        return;
    }

    const counts = { "entry01": 0, "entry02": 0, "entry03": 0, "entry04": 0 };
    
    data.forEach(vote => {
        if (counts[vote.entry_id] !== undefined) counts[vote.entry_id]++;
    });

    Object.keys(counts).forEach(id => {
        const countElement = document.getElementById(`count-${id}`);
        if (countElement) countElement.textContent = `${counts[id]} クソ`;
    });
}

// 5. 投票ボタンが押された時の処理
window.handleVote = async function(entryId) {
    // 【追加】すでにブラウザに投票履歴があるかチェック
    if (localStorage.getItem(`voted_${entryId}`)) {
        alert("このアンケートにはすでに投票済みです！");
        return;
    }

    console.log(`🔘 [${entryId}] のボタンが押されました！`);

    const button = document.querySelector(`[data-entry-id="${entryId}"] .vote-button`);
    if(button) button.disabled = true;

    try {
        const { error } = await supabaseClient.from('votes').insert([{ entry_id: entryId }]);
        if (error) throw error;

        alert(`エントリー [${entryId}] にクソ投票しました！`);

        // 【追加】ブラウザ（LocalStorage）に「この作品に投票した」という記憶を保存
        localStorage.setItem(`voted_${entryId}`, 'true');
        
        // 【追加】ボタンの色をグレーにして「投票済み」に変更
        if(button) {
            button.textContent = "投票済み";
            button.style.backgroundColor = "#999";
            button.style.cursor = "not-allowed";
        }

        await loadVoteCounts();
        
    } catch (error) {
        alert("投票エラー。コンソールを確認してください。");
        console.error("❌ 投票処理でエラー:", error);
        if(button) button.disabled = false; // エラーが起きた時だけボタンを復活させる
    }
};

// 6. 【新規追加】ページをリロードしても「投票済み」状態をキープする関数
function checkAlreadyVoted() {
    const cards = document.querySelectorAll('.entry-card');
    cards.forEach(card => {
        const entryId = card.getAttribute('data-entry-id');
        
        // もしブラウザに投票履歴が残っていたら、ボタンをグレーアウトさせる
        if (localStorage.getItem(`voted_${entryId}`)) {
            const button = card.querySelector('.vote-button');
            if (button) {
                button.disabled = true;
                button.textContent = "投票済み";
                button.style.backgroundColor = "#999";
                button.style.cursor = "not-allowed";
            }
        }
    });
}
