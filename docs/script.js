// 1. スクリプトが死んでいないかの確認用ログ
console.log("🚀 script.js の読み込みに成功しました！");

// 2. データベースの接続設定
const SUPABASE_URL = 'https://qpqwbfktdmffbexuupow.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFwcXdiZmt0ZG1mZmJleHV1cG93Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAyMDMzNDYsImV4cCI6MjA5NTc3OTM0Nn0.tfuVcmkQRjqhBvtUKgEvpH3WHEJFI-vWyIPfs2CeJO8';
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 3. 初期読み込み
document.addEventListener("DOMContentLoaded", () => {
    startCountdown();
    loadVoteCounts();
    checkAlreadyTopVoted(); // トップオブクソを既に投票済みかチェック
});

// 4. 全票数を取得して画面に反映
async function loadVoteCounts() {
    // vote_typeも一緒に取得する
    const { data, error } = await supabaseClient.from('votes').select('entry_id, vote_type');
    if (error) {
        console.error("❌ データ取得エラー:", error);
        return;
    }

    // カウント用の箱（normalとtopを分ける）
    const counts = {
        normal: { "entry01": 0, "entry02": 0, "entry03": 0, "entry04": 0 },
        top: { "entry01": 0, "entry02": 0, "entry03": 0, "entry04": 0 }
    };
    
    // データを振り分けてカウント
    data.forEach(vote => {
        const type = vote.vote_type || 'normal';
        if (counts[type] && counts[type][vote.entry_id] !== undefined) {
            counts[type][vote.entry_id]++;
        }
    });

    // 画面のテキストを更新
    Object.keys(counts.normal).forEach(id => {
        const normalEl = document.getElementById(`count-normal-${id}`);
        const topEl = document.getElementById(`count-top-${id}`);
        if (normalEl) normalEl.textContent = counts.normal[id];
        if (topEl) topEl.textContent = counts.top[id];
    });
}

// 5-A. 💩 連打OKの「クソ！」ボタン処理
window.handleNormalVote = function(entryId) {
    // 【連打用演出】DBを待たずに画面の数字だけ先に「+1」する
    const countEl = document.getElementById(`count-normal-${entryId}`);
    if (countEl) {
        countEl.textContent = parseInt(countEl.textContent) + 1;
    }

    // 裏でDBに送信（vote_type: 'normal' を指定）
    supabaseClient.from('votes').insert([{ entry_id: entryId, vote_type: 'normal' }])
        .then(({ error }) => {
            if (error) console.error("ノーマル投票エラー:", error);
        });
};

// 5-B. 👑 1回限定の「トップオブクソ！」ボタン処理
window.handleTopVote = async function(entryId) {
    if (localStorage.getItem('voted_top_kuso')) {
        alert("「トップオブクソ！」は全作品の中で1回しか投票できません！");
        return;
    }

    // 一時的に全トップボタンを無効化
    lockAllTopButtons();

    try {
        const { error } = await supabaseClient.from('votes').insert([{ entry_id: entryId, vote_type: 'top' }]);
        if (error) throw error;

        alert(`👑 エントリー [${entryId}] をトップオブクソに認定しました！`);
        localStorage.setItem('voted_top_kuso', 'true');
        await loadVoteCounts();
        
    } catch (error) {
        alert("投票エラー。コンソールを確認してください。");
        console.error("トップ投票エラー:", error);
        localStorage.removeItem('voted_top_kuso'); // 失敗したら記憶を消す
        unlockAllTopButtons();
    }
};

// 6. 画面読み込み時に、既にトップ投票済みかチェックする関数
function checkAlreadyTopVoted() {
    if (localStorage.getItem('voted_top_kuso')) {
        lockAllTopButtons();
    }
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

// --------------------------------------------------
// 7. 指定時間までロック画面を表示する機能
function startCountdown() {
    const OPEN_DATE = new Date('2026-06-01T00:00:00+09:00').getTime();
    
    const lockScreen = document.getElementById('lock-screen');
    const countdownText = document.getElementById('countdown-text');

    const timer = setInterval(() => {
        const now = new Date().getTime();
        const distance = OPEN_DATE - now;

        if (distance <= 0) {
            clearInterval(timer);
            if (lockScreen) lockScreen.style.display = 'none';
        } else {
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);
            
            if (countdownText) {
                countdownText.textContent = `公開まであと ${hours}時間 ${minutes}分 ${seconds}秒`;
            }
        }
    }, 1000);
}
