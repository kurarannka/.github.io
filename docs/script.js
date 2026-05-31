// 1. スクリプトが死んでいないかの確認用ログ
console.log("🚀 script.js の読み込みに成功しました！");

// 2. データベースの接続設定
const SUPABASE_URL = 'https://qpqwbfktdmffbexuupow.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFwcXdiZmt0ZG1mZmJleHV1cG93Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAyMDMzNDYsImV4cCI6MjA5NTc3OTM0Nn0.tfuVcmkQRjqhBvtUKgEvpH3WHEJFI-vWyIPfs2CeJO8';
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 3. 初期読み込み
document.addEventListener("DOMContentLoaded", () => {
    loadVoteCounts();
    checkAlreadyVoted(); 
});

// 4. 全票数を取得して【合計】を画面に反映
async function loadVoteCounts() {
    const { data, error } = await supabaseClient.from('votes').select('entry_id, vote_type');
    if (error) {
        console.error("❌ データ取得エラー:", error);
        return;
    }

    const counts = { "entry01": 0, "entry02": 0, "entry03": 0, "entry04": 0 };
    
    // 通常もトップも同じ合算プールに足していく
    data.forEach(vote => {
        if (counts[vote.entry_id] !== undefined) {
            // 【変更可能】もしトップ投票を「+2票」の重みにしたい場合は、
            // ここの += 1 を += (vote.vote_type === 'top' ? 2 : 1) に変更してください。
            counts[vote.entry_id] += 1;
        }
    });

    Object.keys(counts).forEach(id => {
        const countEl = document.getElementById(`count-${id}`);
        if (countEl) countEl.textContent = counts[id];
    });
}

// 5-A. 💩 1コンテンツにつき1回だけの「通常クソ！」ボタン処理
window.handleNormalVote = async function(entryId) {
    if (localStorage.getItem(`voted_normal_${entryId}`)) {
        alert("この作品の「クソ！」にはすでに投票済みです！");
        return;
    }

    // 画面の数字を先に+1する（サクサク演出）
    const countEl = document.getElementById(`count-${entryId}`);
    if (countEl) countEl.textContent = parseInt(countEl.textContent) + 1;

    const button = document.querySelector(`[data-entry-id="${entryId}"] .normal-btn`);
    if(button) button.disabled = true;

    try {
        const { error } = await supabaseClient.from('votes').insert([{ entry_id: entryId, vote_type: 'normal' }]);
        if (error) throw error;

        alert(`エントリー [${entryId}] に通常クソ投票しました！`);
        localStorage.setItem(`voted_normal_${entryId}`, 'true');
        
        if(button) {
            button.innerHTML = "💩 投票済";
            button.style.background = "#999";
            button.style.cursor = "not-allowed";
            button.style.transform = "none";
        }
        await loadVoteCounts();
        
    } catch (error) {
        alert("投票エラー。コンソールを確認してください。");
        console.error("ノーマル投票エラー:", error);
        if(button) button.disabled = false;
    }
};

// 5-B. 👑 1回限定の「トップオブクソ！」ボタン処理
window.handleTopVote = async function(entryId) {
    if (localStorage.getItem('voted_top_kuso')) {
        alert("「トップオブクソ！」は全作品の中で1回しか投票できません！");
        return;
    }

    // 画面の数字を先に+1する（「1票多く」追加）
    const countEl = document.getElementById(`count-${entryId}`);
    if (countEl) countEl.textContent = parseInt(countEl.textContent) + 1;

    lockAllTopButtons();

    try {
        const { error } = await supabaseClient.from('votes').insert([{ entry_id: entryId, vote_type: 'top' }]);
        if (error) throw error;

        alert(`👑 エントリー [${entryId}] にトップオブクソ投票を追加しました！`);
        localStorage.setItem('voted_top_kuso', 'true');
        await loadVoteCounts();
        
    } catch (error) {
        alert("投票エラー。コンソールを確認してください。");
        console.error("トップ投票エラー:", error);
        localStorage.removeItem('voted_top_kuso');
        unlockAllTopButtons();
    }
};

// 6. 画面読み込み時に、既に投票済みかチェックする関数
function checkAlreadyVoted() {
    if (localStorage.getItem('voted_top_kuso')) {
        lockAllTopButtons();
    }

    document.querySelectorAll('.entry-card').forEach(card => {
        const entryId = card.getAttribute('data-entry-id');
        if (localStorage.getItem(`voted_normal_${entryId}`)) {
            const normalBtn = card.querySelector('.normal-btn');
            if (normalBtn) {
                normalBtn.disabled = true;
                normalBtn.innerHTML = "💩 投票済";
                normalBtn.style.background = "#999";
                normalBtn.style.cursor = "not-allowed";
                normalBtn.style.transform = "none";
            }
        }
    });
}

// 全てのトップボタンを灰色にして押せなくする関数
function lockAllTopButtons() {
    document.querySelectorAll('.top-btn').forEach(btn => {
        btn.disabled = true;
        btn.innerHTML = "👑 投票済<br><small>(あざす)</small>";
        btn.style.background = "#999";
        btn.style.cursor = "not-allowed";
        btn.style.transform = "none";
        btn.style.filter = "none";
    });
}

// エラー時にトップボタンを復活させる関数
function unlockAllTopButtons() {
    document.querySelectorAll('.top-btn').forEach(btn => {
        btn.disabled = false;
        btn.innerHTML = "👑 トップ！<br><small>(1人1回のみ)</small>";
        btn.style.background = "linear-gradient(135deg, #ffd700, #ff8c00)";
        btn.style.cursor = "pointer";
    });
}
