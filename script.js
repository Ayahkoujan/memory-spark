// 1. تعريف البيانات الأساسية
const itemsData = {
    boy: ["watch-boy", "belt1-boy", "bowBlack-boy", "bowRed-boy", "glasses1-boy","watch2-boy", "belt2-boy", "glasses2-boy", "shoes1-boy", "shoes2-boy", "tool4-boy", "tool1-boy", "tool2-boy", "tool3-boy", "tool5-boy", "wallet1-boy", "wallet2-boy", "tool3-boy"],
    girl: ["cream2-girl", "cream3-girl", "creem-girl", "makeup1-girl", "makeup2-girl","makeup3-girl","makeup4-girl","mirror-girl","perfome1-girl","perfome2-girl"],
    general: ["bread1", "bread2", "apple1", "apple2", "chips1", "cereal1", "banana", "chips2", "chips3", "chips4","eggs","snak1","snak2","snak3","tomato"]
};

// 2. المتغيرات العامة
let userGender = ""; 
let currentPool = []; 
let selectedItems = [];
let foundItems = []; 
let correctClicks = 0;
let errors = 0;
let timeLeft = 45;
let timer;
let currentLevel = 1; // أضفنا تعريف المستوى
let cardsCount = 5;   // عدد الكروت الابتدائي

// ---------------------------------------------------------
const sounds = {
    bg: new Audio('sounds/bg-music.mpeg'),
    click: new Audio('sounds/click.mpeg'),
    correct: new Audio('sounds/correct.mpeg'),
    wrong: new Audio('sounds/wrong.mpeg'),
    win: new Audio('sounds/win.mpeg'),
    lose: new Audio('sounds/lose.mpeg')
};

// ضبط الإعدادات الافتراضية
sounds.bg.loop = true;      // الموسيقى الخلفية تتكرر
sounds.bg.volume = 0.2;     // هادئة جداً في الخلفية   // متوسطة للأزرار
sounds.correct.volume = 0.8;
sounds.wrong.volume = 0.6;
sounds.win.volume = 0.6;
sounds.lose.volume = 0.6;
function startGameSetup() {
    sounds.bg.play(); // تبدأ الموسيقى هنا وتستمر طوال اللعبة
    sounds.click.play();
    document.getElementById("startScreen").style.display = "none";
    document.getElementById("characterScreen").style.display = "block";
    
    // تصفير القيم
    document.getElementById("errorsContainer").innerHTML = "";
    document.getElementById("correctContainer").innerHTML = "";
    timeLeft = 45;
    currentLevel = 1;
    cardsCount = 5;
    foundItems = [];
}

function selectGender(gender) {
    userGender = gender;
     sounds.click.play();
    document.getElementById("characterScreen").style.display = "none";
    document.getElementById("flashScreen").style.display = "block";

    currentPool = itemsData[gender].concat(itemsData.general);
    selectedItems = getRandomItems(currentPool, cardsCount);
    
    showFlashCards();
}

function getRandomItems(array, count){
    let shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

function showFlashCards() {
    const flash = document.getElementById("flashScreen");
    const container = document.getElementById("flashItemsContainer");
    const flashBar = document.getElementById("flashTimerBar");
    
    container.innerHTML = ""; 
    flash.style.display = "flex";
    
    // إعادة تعيين الشريط للحجم الكامل
    flashBar.style.width = "100%";

    let numColumns = Math.ceil(selectedItems.length / 2);
    container.style.gridTemplateColumns = `repeat(${numColumns}, auto)`;

    selectedItems.forEach(item => {
        let img = document.createElement("img");
        img.src = "images/" + item + ".png"; 
        container.appendChild(img);
    });

    // حساب وقت عرض الكروت (مثلاً 1.5 ثانية لكل كرت)
    const displayTime = selectedItems.length * 2000; 
    let startTime = Date.now();

    // دالة لتحديث الشريط البني
    const updateFlashBar = setInterval(() => {
        let elapsedTime = Date.now() - startTime;
        let remainingPercent = 100 - (elapsedTime / displayTime * 100);
        
        if (remainingPercent <= 0) {
            flashBar.style.width = "0%";
            clearInterval(updateFlashBar);
        } else {
            flashBar.style.width = remainingPercent + "%";
        }
    }, 100);

    // الانتقال لبدء اللعبة بعد انتهاء الوقت
    setTimeout(() => {
        clearInterval(updateFlashBar);
        startGame();
    }, displayTime);
}

function startGame() {
    document.getElementById("flashScreen").style.display = "none";
    document.getElementById("gameScreen").style.display = "block";

    let correctItems = [...selectedItems];
    let wrongItems = currentPool.filter(i => !selectedItems.includes(i));
    
    // الحل: دمج العناصر بحيث تظهر العناصر الصحيحة أكثر من مرة في "الدورة الواحدة"
    // أو التأكد من أنها في بداية السير
    let singleRound = [];
    
    // نكرر العناصر الصحيحة مرتين داخل كل دورة لزيادة فرص ظهورها
    singleRound = correctItems.concat(correctItems).concat(wrongItems);

    let totalGameItems = [];
    for (let i = 0; i < 4; i++) {
        let shuffledRound = [...singleRound].sort(() => 0.5 - Math.random());
        totalGameItems = totalGameItems.concat(shuffledRound);
    }

    // مسح السير القديم
    const gameScreen = document.getElementById("gameScreen");
    const oldItems = gameScreen.querySelectorAll('.item-container');
    oldItems.forEach(el => el.remove());

    totalGameItems.forEach((item, index) => {
        createItem(item, index);
    });

    startTimer();
}

function createItem(item, index) {
    let container = document.createElement("div");
    container.className = "item-container";
    container.style.animationDelay = (index * 1.2) + "s";

    let img = document.createElement("img");
    img.src = "images/" + item + ".png";
    
    container.appendChild(img);
    container.onclick = (event) => checkAnswer(container, item);

    document.getElementById("gameScreen").appendChild(container);
}

function checkAnswer(container, item) {
    if (foundItems.includes(item)) return;

    if (selectedItems.includes(item)) {
        foundItems.push(item);
        
        container.onclick = null; // نمنع النقر مرة أخرى
        
        // --- حركة التراكم في السلة ---
        // نستخدم عدد العناصر الموجودة حالياً لعمل إزاحة بسيطة
        container.style.setProperty('--offset', foundItems.length);
        
        // إضافة الكلاس الذي يرسلها للسلة
        container.classList.add("in-basket");
        
        // ملاحظة: حذفنا سطر container.remove() لكي يظل العنصر ظاهراً
        // ---------------------------

        addEmojiToBar("correctContainer", "✅");
        correctClicks++;
        sounds.correct.play();
        
        if (correctClicks === selectedItems.length) {
            setTimeout(winGame, 1200); // تأخير بسيط لنسمح لآخر عنصر بالوصول للسلة
        }
    } else {
        // ... كود الخطأ كما هو بدون تغيير ...
        showMark(container, "❌");
        addEmojiToBar("errorsContainer", "❌");
        errors++;
        sounds.wrong.play();
        if (errors >= 3) {
            setTimeout(() => loseGame("Too many mistakes!"), 500);
        }
    }
}

// دالة مساعدة لإضافة الإيموجي للبار
function addEmojiToBar(containerId, emoji) {
    const barContainer = document.getElementById(containerId);
    const span = document.createElement("span");
    span.className = "status-emoji";
    span.innerText = emoji;
    barContainer.appendChild(span);
}

function showMark(container, symbol){
    let mark = document.createElement("span");
    mark.className = "mark";
    mark.innerText = symbol;
    container.appendChild(mark); 
}

function startTimer() {
    timeLeft = 45;
    let timerBar = document.getElementById("timerBar");
    
    // تنظيف أي مؤقت قديم قبل البدء لضمان عدم التداخل
    if (timer) clearInterval(timer); 

    timer = setInterval(() => {
        timeLeft--;
        
        // تحديث عرض الشريط الأزرق
        let widthPercent = (timeLeft / 45) * 100;
        timerBar.style.width = widthPercent + "%";

        if (timeLeft <= 0) {
            clearInterval(timer); // إيقاف المؤقت
            loseGame("Time is Up!"); // استدعاء دالة الخسارة الموجودة في كودك
        }
    }, 1000);
}
function winGame() {
    clearInterval(timer);
    sounds.bg.pause();
    sounds.win.play();
    
    document.getElementById("winTitle").innerText = `🎉 Level ${currentLevel} Complete!`;
    document.getElementById("winScreen").style.display = "flex";
}

// 4. تعديل دالة loseGame
function loseGame(msg) {
    clearInterval(timer);
    sounds.bg.pause();
    sounds.lose.play();
    
    document.getElementById("loseReason").innerText = msg;
    document.getElementById("loseScreen").style.display = "flex";
}

function retryLevel() {
    // تصفير العدادات الخاصة بالليفل الحالي فقط
    foundItems = [];
    correctClicks = 0;
    errors = 0;
    timeLeft = 45;

    // إخفاء شاشة الخسارة وإظهار الفلاش كارد مجدداً
    document.getElementById("loseScreen").style.display = "none";
    document.getElementById("gameScreen").style.display = "none";
    
    // تنظيف الإيموجيات القديمة من البار
    document.getElementById("errorsContainer").innerHTML = "";
    document.getElementById("correctContainer").innerHTML = "";

    // إعادة اختيار عناصر عشوائية جديدة من نفس الـ Pool الحالي (نفس الصعوبة)
    selectedItems = getRandomItems(currentPool, cardsCount);
    
    // العودة لشاشة الفلاش كارد
    document.getElementById("flashScreen").style.display = "block";
    showFlashCards();
}

// دالة الليفل التالي
function nextLevel() {
    currentLevel++;
    cardsCount++; // زيادة الصعوبة
    timeLeft = 45;    // إعادة الوقت
    foundItems = [];
    correctClicks = 0;
    errors = 0;
    
    document.getElementById("winScreen").style.display = "none";
    document.getElementById("gameScreen").style.display = "none";
    document.getElementById("errorsContainer").innerHTML = "";
    document.getElementById("correctContainer").innerHTML = "";
    
    // اختيار كروت جديدة بناءً على الصعوبة الجديدة
    selectedItems = getRandomItems(currentPool, cardsCount);
    document.getElementById("flashScreen").style.display = "block";
    showFlashCards();
}

function exitToStart(){
    location.reload();
}
// كود لتشغيل الموسيقى فور أول نقرة في أي مكان بالشاشة
window.onclick = () => {
    if (sounds.bg.paused) {
        sounds.bg.play();
    }
};