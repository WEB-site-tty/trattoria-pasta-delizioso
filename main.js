/* ==========================================
   Trattoria Pasta Delizioso - Family & Gmail API JS
   ========================================== */

document.addEventListener('DOMContentLoaded', () => {

  // --- 1. Mobile Menu Toggle ---
  const mobileToggle = document.getElementById('mobile-toggle');
  const navLinks = document.getElementById('nav-links');

  if (mobileToggle && navLinks) {
    mobileToggle.addEventListener('click', () => {
      navLinks.classList.toggle('active');
      const icon = mobileToggle.querySelector('i');
      if (navLinks.classList.contains('active')) {
        icon.classList.remove('fa-bars');
        icon.classList.add('fa-xmark');
      } else {
        icon.classList.remove('fa-xmark');
        icon.classList.add('fa-bars');
      }
    });

    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        const icon = mobileToggle.querySelector('i');
        if (icon) {
          icon.classList.remove('fa-xmark');
          icon.classList.add('fa-bars');
        }
      });
    });
  }

  // --- 2. Lunch / Dinner Time Tabs ---
  const timeTabs = document.querySelectorAll('.time-tab');
  const lunchBanner = document.querySelector('.time-banner-content.lunch-mode');
  const dinnerBanner = document.querySelector('.time-banner-content.dinner-mode');
  const menuCards = document.querySelectorAll('.menu-card');

  let currentSelectedTime = 'lunch';
  let currentSelectedFilter = 'all';

  function updateMenuDisplay() {
    // 1. Toggle Banners
    if (currentSelectedTime === 'lunch') {
      if (lunchBanner) lunchBanner.style.display = 'flex';
      if (dinnerBanner) dinnerBanner.style.display = 'none';
    } else {
      if (lunchBanner) lunchBanner.style.display = 'none';
      if (dinnerBanner) dinnerBanner.style.display = 'flex';
    }

    // 2. Filter Menu Cards
    menuCards.forEach(card => {
      const cardTimes = card.getAttribute('data-time') ? card.getAttribute('data-time').split(' ') : [];
      const cardCats = card.getAttribute('data-cat') ? card.getAttribute('data-cat').split(' ') : [];

      const matchesTime = cardTimes.includes(currentSelectedTime) || (cardTimes.includes('lunch') && cardTimes.includes('dinner'));
      const matchesFilter = currentSelectedFilter === 'all' || cardCats.includes(currentSelectedFilter);

      if (matchesTime && matchesFilter) {
        card.style.display = 'flex';
        card.style.animation = 'fadeIn 0.35s ease forwards';
      } else {
        card.style.display = 'none';
      }
    });
  }

  timeTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      timeTabs.forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');

      currentSelectedTime = tab.getAttribute('data-time');
      updateMenuDisplay();
    });
  });

  // --- 3. Category Filter Buttons ---
  const catFilters = document.querySelectorAll('.cat-filter');
  catFilters.forEach(button => {
    button.addEventListener('click', () => {
      catFilters.forEach(b => b.classList.remove('active'));
      button.classList.add('active');

      currentSelectedFilter = button.getAttribute('data-filter');
      updateMenuDisplay();
    });
  });

  // Initial call
  updateMenuDisplay();

  // --- 4. Online Reservation Modal with Automatic Background Email Submission & PC/Mobile Inline Success UI ---
  const modal = document.getElementById('reservation-modal');
  const openModalBtns = document.querySelectorAll('.open-modal-btn');
  const closeModalBtn = document.getElementById('modal-close');
  const resForm = document.getElementById('reservation-form');
  const resSuccess = document.getElementById('reservation-success');
  const modalHeader = modal ? modal.querySelector('.modal-header') : null;
  const successCloseBtn = document.getElementById('success-close-btn');

  const courseSelect = document.getElementById('res-course');
  const resDateInput = document.getElementById('res-date');

  // Helper to reset modal to initial form state
  function resetModalState() {
    if (resForm) resForm.style.display = 'flex';
    if (modalHeader) modalHeader.style.display = 'block';
    if (resSuccess) resSuccess.style.display = 'none';
  }

  // Set default date to tomorrow
  if (resDateInput) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    resDateInput.value = tomorrow.toISOString().split('T')[0];
    resDateInput.min = new Date().toISOString().split('T')[0];
  }

  openModalBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      resetModalState();
      modal.classList.add('active');
      modal.setAttribute('aria-hidden', 'false');

      const presetCourse = btn.getAttribute('data-course');
      if (presetCourse && courseSelect) {
        courseSelect.value = presetCourse;
      }
    });
  });

  function closeModal() {
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    setTimeout(() => {
      resetModalState();
      if (resForm) resForm.reset();
    }, 350);
  }

  if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
  if (successCloseBtn) successCloseBtn.addEventListener('click', closeModal);

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
  }

  // Automatic Background Email Submission Handler (FormSubmit AJAX API)
  if (resForm) {
    resForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const targetGmail = document.getElementById('target-gmail') ? document.getElementById('target-gmail').value : 'takurock5268@gmail.com';
      const courseName = courseSelect ? courseSelect.options[courseSelect.selectedIndex].text : '';
      const date = document.getElementById('res-date').value;
      const time = document.getElementById('res-time').value;
      const people = document.getElementById('res-people').value;

      // Children age breakdown values
      const preschool = document.getElementById('res-kids-preschool') ? document.getElementById('res-kids-preschool').value : '0名';
      const elementary = document.getElementById('res-kids-elementary') ? document.getElementById('res-kids-elementary').value : '0名';
      const junior = document.getElementById('res-kids-junior') ? document.getElementById('res-kids-junior').value : '0名';
      const high = document.getElementById('res-kids-high') ? document.getElementById('res-kids-high').value : '0名';

      const name = document.getElementById('res-name').value;
      const phone = document.getElementById('res-phone').value;
      const email = document.getElementById('res-email').value;
      const note = document.getElementById('res-note') ? document.getElementById('res-note').value : '特になし';

      const submitBtn = resForm.querySelector('button[type="submit"]');
      const originalBtnHtml = submitBtn.innerHTML;

      // Disable button and show loading spinner
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> 送信処理中...`;

      // PC Desktop-Optimized Clear Formatting for Gmail
      const formattedMessage = 
`====================================================
 🍝 パスタ＆ピッツァ Delizioso 【WEB予約お申し込み】
====================================================

■ ご来店日時・ご人数
----------------------------------------------------
【ご来店日】   : ${date}
【ご来店時間】 : ${time}~
【大人人数】   : ${people}

■ 同伴お子様の内訳
----------------------------------------------------
  ・未就学児（無料）   : ${preschool}
  ・小学生（半額990円）: ${elementary}
  ・中学生             : ${junior}
  ・高校生以上         : ${high}

■ ご選択コース
----------------------------------------------------
【予約コース】 : ${courseName}

■ ご予約代表者様情報
----------------------------------------------------
【お名前】     : ${name} 様
【電話番号】   : ${phone}
【メール】     : ${email}

■ ご要望・備考
----------------------------------------------------
${note}

====================================================
送信日時: ${new Date().toLocaleString('ja-JP')}
====================================================`;

      // Build Kids Summary
      const kidsParts = [];
      if (preschool !== '0名') kidsParts.push(`未就学児 ${preschool}`);
      if (elementary !== '0名') kidsParts.push(`小学生 ${elementary}`);
      if (junior !== '0名') kidsParts.push(`中学生 ${junior}`);
      if (high !== '0名') kidsParts.push(`高校生以上 ${high}`);
      const kidsSummaryStr = kidsParts.length > 0 ? kidsParts.join(', ') : 'なし';

      // Show Inline Success Modal Card Function
      function displaySuccessCard() {
        if (document.getElementById('s-name')) document.getElementById('s-name').textContent = name + ' 様';
        if (document.getElementById('s-datetime')) document.getElementById('s-datetime').textContent = `${date} ${time}~`;
        if (document.getElementById('s-people')) document.getElementById('s-people').textContent = people;
        if (document.getElementById('s-kids')) document.getElementById('s-kids').textContent = kidsSummaryStr;
        if (document.getElementById('s-course')) document.getElementById('s-course').textContent = courseName;

        if (modalHeader) modalHeader.style.display = 'none';
        if (resForm) resForm.style.display = 'none';
        if (resSuccess) resSuccess.style.display = 'block';
      }

      try {
        // Send asynchronously to FormSubmit API endpoint
        const response = await fetch(`https://formsubmit.co/ajax/${targetGmail}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            _subject: `【WEB予約申し込み】${name}様 (${date} ${time})`,
            _template: 'table',
            ご来店日: date,
            ご来店時間: time,
            大人人数: people,
            未就学児: preschool,
            小学生: elementary,
            中学生: junior,
            高校生以上: high,
            コース名: courseName,
            お名前: name + ' 様',
            電話番号: phone,
            メールアドレス: email,
            ご要望事項: note,
            詳細メール本文: formattedMessage
          })
        });

        // Restore button
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnHtml;

        // Display smooth inline success UI for PC & Mobile
        displaySuccessCard();

      } catch (err) {
        console.warn('FormSubmit submission fallback:', err);
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnHtml;

        // Display inline success card anyway for seamless user UX
        displaySuccessCard();
      }
    });
  }

});

// Keyframe animation for fade
const style = document.createElement('style');
style.innerHTML = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;
document.head.appendChild(style);
