// 【重要】Step 3で取得したURLとanonキーに書き換えてください
const SUPABASE_URL = 'https://qpqwbfktdmffbexuupow.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFwcXdiZmt0ZG1mZmJleHV1cG93Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAyMDMzNDYsImV4cCI6MjA5NTc3OTM0Nn0.tfuVcmkQRjqhBvtUKgEvpH3WHEJFI-vWyIPfs2CeJO8';

// Supabaseクライアントの初期化
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ページ読み込み時にDBから現在の票数を引っ張ってくる
document.addEventListener("DOMContentLoaded", () => {
    loadVoteCounts();
});

async function loadVoteCounts() {
    // votesテーブルからすべての entry_id を取得
    const { data, error } = await supabase.from('votes').select('entry_id');
    
    if (error) {
        console.error("データの取得に失敗しました:", error);
        return;
    }

    // 各エントリーの票数をカウントする用の箱を準備
    const counts = {
        "entry01": 0,
        "entry02": 0,
        "entry03": 0,
        "entry04": 0
    };

    // 取得したデータをもとにカウントアップ
    data.forEach(vote => {
        if (counts[vote.entry_id] !== undefined) {
            counts[vote.entry_id]++;
        }
    });

    // 画面の票数テキストを書き換え
    Object.keys(counts).forEach(id => {
        const countElement = document.getElementById(`count-${id}`);
        if (countElement) {
            countElement.textContent = `${counts[id]} クソ`;
        }
    });
}

// 投票ボタンが押された時の処理
async function handleVote(entryId) {
    // 連続クリック防止のためにボタンを一時無効化（オプション）
    const button = document.querySelector(`[data-entry-id="${entryId}"] .vote-button`);
    if(button) button.disabled = true;

    // DBの 'votes' テーブルにレコードを1行追加
    const { error } = await supabase
        .from('votes')
        .insert([
            { entry_id: entryId }
        ]);

    if (error) {
        alert("投票に失敗しました。もう一度お試しください。");
        console.error("投票エラー:", error);
        if(button) button.disabled = false;
        return;
    }

    alert(`エントリー [${entryId}] にクソ投票しました！`);
    
    // DBから最新の票数を再取得して画面を更新
    await loadVoteCounts();

    if(button) button.disabled = false;
}
