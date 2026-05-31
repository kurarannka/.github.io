document.addEventListener('DOMContentLoaded', () => {

    // ==========================================
    // 状態変数の定義
    // ==========================================
    const kusoWindow = document.getElementById('kusoWindow');
    let currentMdIndex = 0;
    let currentSliderVal = 3;

    // ==========================================
    // ウィンドウ位置の動的制御
    // ==========================================
    function updateWindowPosition() {
        const winWidth = kusoWindow.offsetWidth;
        const winHeight = kusoWindow.offsetHeight;
        const viewWidth = window.innerWidth;
        const viewHeight = window.innerHeight;

        const maxOffsetX = Math.max(0, (viewWidth - winWidth) / 2);
        const xOffset = (currentSliderVal - 3) * (maxOffsetX / 2);

        const maxY = Math.max(0, viewHeight - winHeight);
        const yOffset = (currentMdIndex / Math.max(1, monthDayArray.length - 1)) * maxY;

        kusoWindow.style.transform = `translate(calc(-50% + ${xOffset}px), ${yOffset}px)`;
    }

    window.addEventListener('resize', updateWindowPosition);

    // ==========================================
    // 年月日の生成と入力制御
    // ==========================================
    const yearSelect = document.getElementById('startYear');
    const today = new Date();
    
    // 年のセレクトボックス生成
    yearSelect.appendChild(new Option("年を選択", ""));
    const currentYear = today.getFullYear();
    const yearFragment = document.createDocumentFragment();
    for (let y = 1; y <= currentYear; y++) {
        const option = document.createElement('option');
        option.value = y;
        option.textContent = String(y).padStart(4, '0') + '年';
        yearFragment.appendChild(option);
    }
    yearSelect.appendChild(yearFragment);

    // 月日配列の生成 (うるう年対応)
    const monthDayArray = [];
    const tempDate = new Date(2024, 0, 1); 
    while (tempDate.getFullYear() === 2024) {
        const m = String(tempDate.getMonth() + 1).padStart(2, '0');
        const d = String(tempDate.getDate()).padStart(2, '0');
        monthDayArray.push(`${m}月${d}日`);
        tempDate.setDate(tempDate.getDate() + 1);
    }

    // 月日の増減ボタン制御
    const mdInput = document.getElementById('startMonthDay');
    mdInput.value = monthDayArray[currentMdIndex];

    document.getElementById('btnUp').addEventListener('click', () => {
        if (currentMdIndex > 0) {
            currentMdIndex--;
            mdInput.value = monthDayArray[currentMdIndex];
            updateWindowPosition();
        }
    });

    document.getElementById('btnDown').addEventListener('click', () => {
        if (currentMdIndex < monthDayArray.length - 1) {
            currentMdIndex++;
            mdInput.value = monthDayArray[currentMdIndex];
            updateWindowPosition();
        }
    });

    // ==========================================
    // スライダー制御
    // ==========================================
    const worldSlider = document.getElementById('worldSlider');
    const ticks = [0, 12, 45, 65, 80];

    worldSlider.addEventListener('input', (e) => {
        let val = parseInt(e.target.value, 10);
        let closest = ticks.reduce((prev, curr) => Math.abs(curr - val) < Math.abs(prev - val) ? curr : prev);
        
        worldSlider.value = closest; 
        currentSliderVal = ticks.indexOf(closest) + 1;
        
        updateWindowPosition();
    });

    // ==========================================
    // フォーム送信・独自バリデーション
    // ==========================================
    const form = document.getElementById('kusoForm');

    form.addEventListener('submit', (event) => {
        event.preventDefault();

        // [バリデーション] 日付整合性
        const selectedYear = parseInt(yearSelect.value, 10);
        const selectedMonthDay = mdInput.value;
        
        if (!selectedYear || !selectedMonthDay) {
            alert('日付が正しく選択されていません。');
            return;
        }

        const mMatch = selectedMonthDay.match(/(\d{2})月/);
        const dMatch = selectedMonthDay.match(/(\d{2})日/);
        const m = parseInt(mMatch[1], 10) - 1;
        const d = parseInt(dMatch[1], 10);
        const checkDate = new Date(selectedYear, m, d);
        
        if (checkDate.getMonth() !== m) {
            alert(`選択された日付（${String(selectedYear).padStart(4, '0')}年${selectedMonthDay}）は存在しません。`);
            return;
        }

        const todayAtMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        if (checkDate > todayAtMidnight) {
            alert('未来の日付は選択できません。');
            return;
        }

        // [バリデーション] 名前 (文字種の混在必須)
        const nameValue = document.getElementById('name').value;
        if (!/[\u3040-\u309F]/.test(nameValue) || !/[\u30A0-\u30FF]/.test(nameValue) || !/[a-zA-Z]/.test(nameValue)) {
            alert('名前にエラーがあります。\nひらがな、カタカナ、アルファベットがすべて含まれている必要があります。');
            return;
        }

        // [バリデーション] メールアドレス (全角化必須)
        const emailValue = document.getElementById('email').value;
        if (emailValue.includes('@') || emailValue.includes('.')) {
            alert('メールアドレスにエラーがあります。\n例：(torineru.1@gmail.com) -> (とりねる。１＠gまいl。cおm)');
            return;
        }
        if (!emailValue.includes('＠') || !emailValue.includes('。')) {
            alert('メールアドレスにエラーがあります。\n例：(torineru.1@gmail.com) -> (とりねる。１＠gまいl。cおm)');
            return;
        }

        // [バリデーション] ワールド入力 (スライダー値とリンク形式の検証)
        for (let i = 1; i <= 5; i++) {
            const id = `world_${i}`;
            const val = document.getElementById(id).value.trim();
            const isRequired = (i <= currentSliderVal);

            if (isRequired) {
                if (val === '') {
                    alert(`ワールドの入力エラーがあります。\nスライダーで指定した番号の入力欄は必須です。`);
                    return;
                }
                if (!val.startsWith('http')) {
                    alert(`好きなワールドにエラーがあります。\nワールドのリンクを入力してください。`);
                    return;
                }
            } else {
                if (val !== '') {
                    alert(`ワールドの入力エラーがあります。\nスライダーで指定した番号以外は空にしてください。`);
                    return;
                }
            }
        }

        // [バリデーション] エピソード (厳密な文字数指定)
        const episodeValue = document.getElementById('episode').value;
        if (episodeValue.length !== 60) {
            alert(`エピソードの文字数にエラーがあります。\n60文字で入力してください。`);
            return;
        }

        // 送信成功処理・初期化
        alert('送信成功！');
        form.reset();
        
        currentMdIndex = 0;
        mdInput.value = monthDayArray[0];
        currentSliderVal = 3;
        worldSlider.value = 45;
        updateWindowPosition();
    });
});
