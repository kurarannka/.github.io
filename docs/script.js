// 1. スクリプトが死んでいないかの確認用ログ
console.log("🚀 script.js の読み込みに成功しました！");

// 2. データベースの接続設定
const SUPABASE_URL = 'https://qpqwbfktdmffbexuupow.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFwcXdiZmt0ZG1mZmJleHV1cG93Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAyMDMzNDYsImV4cCI6MjA5NTc3OTM0Nn0.tfuVcmkQRjqhBvtUKgEvpH3WHEJFI-vWyIPfs2CeJO8';

// 【修正】変数名を「supabase」から「supabaseClient」に変更して衝突を回避！
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 3. 初期読み込み
document.addEventListener("DOMContentLoaded", () => {
    loadVoteCounts();
});

// 4. 票数を取得して画面に反映する関数
async function loadVoteCounts() {
    // 【修正】supabaseClient を使用
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
    console.log(`🔘 [${entryId}] のボタンが押されました！`);

    const button = document.querySelector(`[data-entry-id="${entryId}"] .vote-button`);
    if(button) button.disabled = true;

    try {
        // 【修正】supabaseClient を使用
        const { error } = await supabaseClient.from('votes').insert([{ entry_id: entryId }]);
        if (error) throw error;

        alert(`エントリー [${entryId}] にクソ投票しました！`);
        await loadVoteCounts();
        
    } catch (error) {
        alert("投票エラー。コンソールを確認してください。");
        console.error("❌ 投票処理でエラー:", error);
    } finally {
        if(button) button.disabled = false;
    }
};
