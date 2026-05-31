// ページ読み込み時にDBから現在の票数を引っ張ってくる想定の関数
document.addEventListener("DOMContentLoaded", () => {
    loadVoteCounts();
});

function loadVoteCounts() {
    // 【のちに実装】Supabase等のAPIを叩いてデータを取得する
    // ここではテスト用のダミーデータ
    const mockData = {
        "entry01": 5,
        "entry02": 18
    };

    // 画面に票数を反映
    Object.keys(mockData).forEach(id => {
        const countElement = document.getElementById(`count-${id}`);
        if (countElement) {
            countElement.textContent = `${mockData[id]} クソ`;
        }
    });
}

// 投票ボタンが押された時の処理
function handleVote(entryId) {
    // 【のちに実装】Supabase等のテーブルに「+1」するか、インサートする処理
    alert(`エントリー [${entryId}] にクソ投票しました！`);
    
    // ひとまずフロント側だけでカウントを1増やす擬似演出
    const countElement = document.getElementById(`count-${entryId}`);
    if (countElement) {
        const currentCount = parseInt(countElement.textContent);
        countElement.textContent = `${currentCount + 1} クソ`;
    }
}
