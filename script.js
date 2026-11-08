// mise & register レジまわりの作業代行：ページの動き

// ---- 1. よくある質問：質問を押すと答えが開く・閉じる ----
document.querySelectorAll('#faq dt').forEach(function (dt, index) {
  const dd = dt.nextElementSibling;
  if (!dd || dd.tagName !== 'DD') return;

  // 質問の文字をボタンに入れかえる（キーボードでも操作できるように）
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'faq-question';
  button.textContent = dt.textContent;
  button.setAttribute('aria-expanded', 'false');

  dd.id = 'faq-answer-' + (index + 1);
  button.setAttribute('aria-controls', dd.id);
  dd.hidden = true; // 最初は答えを閉じておく

  dt.textContent = '';
  dt.appendChild(button);

  button.addEventListener('click', function () {
    const isOpen = button.getAttribute('aria-expanded') === 'true';
    button.setAttribute('aria-expanded', String(!isOpen));
    dd.hidden = isOpen;
  });
});

// ---- 2. サービスの見本：画像を押すと大きく表示する ----
const dialog = document.getElementById('sample-dialog');
const dialogImage = document.getElementById('sample-dialog-image');
const dialogCaption = document.getElementById('sample-dialog-caption');

document.querySelectorAll('.sample-open').forEach(function (button) {
  button.addEventListener('click', function () {
    const thumb = button.querySelector('img');
    dialogImage.src = button.dataset.src;
    dialogImage.alt = thumb.alt;
    dialogCaption.textContent = button.dataset.caption;
    dialog.showModal(); // Esc キーでも閉じられる
  });
});

// ×ボタン、または画像の外側（暗い所）を押したら閉じる
dialog.querySelector('.dialog-close').addEventListener('click', function () {
  dialog.close();
});
dialog.addEventListener('click', function (event) {
  if (event.target === dialog) dialog.close();
});

// ---- 3. 開業準備チェックリスト：チェックの数で進み具合と応援の言葉が変わる ----
const checks = document.querySelectorAll('.startup-check');
const progressBar = document.getElementById('progress-bar');
const progressTrack = document.querySelector('.progress-track');
const progressCount = document.getElementById('progress-count');
const progressMessage = document.getElementById('progress-message');
const STORAGE_KEY = 'mise-register-startup';

function updateProgress() {
  const total = checks.length;
  let done = 0;
  checks.forEach(function (check) {
    if (check.checked) done++;
  });

  progressBar.style.width = (done / total) * 100 + '%';
  progressTrack.setAttribute('aria-valuenow', String(done));
  progressCount.textContent = done + ' / ' + total;

  if (done === 0) {
    progressMessage.textContent = 'まずは 1 つ目から始めましょう';
  } else if (done < total / 2) {
    progressMessage.textContent = 'いいスタートです！';
  } else if (done < total) {
    progressMessage.textContent = 'あと少しで準備完了です';
  } else {
    progressMessage.textContent = '準備ばっちり！開業おめでとうございます 🎉';
  }
  progressBar.classList.toggle('is-complete', done === total);
}

// チェックした内容は、このブラウザーの中だけに覚えておく（どこにも送らない）
function saveChecks() {
  const states = Array.from(checks).map(function (check) { return check.checked; });
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(states));
  } catch (error) {
    // 保存できないブラウザーでも、ページはそのまま使える
  }
}

try {
  const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  checks.forEach(function (check, i) { check.checked = saved[i] === true; });
} catch (error) {
  // 読み込めなくても、チェックなしの状態から始める
}

checks.forEach(function (check) {
  check.addEventListener('change', function () {
    updateProgress();
    saveChecks();
  });
});
updateProgress();

// ---- 4. 見積もり相談：サービスを選ぶ → 入力 → 確認 → 完了 のステップ式（送信はしない） ----
const form = document.getElementById('estimate-form');
const message = document.getElementById('form-message');
const steps = form.querySelectorAll('.form-step');
const stepperItems = form.querySelectorAll('.stepper li');
const serviceInputs = form.querySelectorAll('input[name="service"]');
const shopName = document.getElementById('shop-name');
const email = document.getElementById('email');
const consult = document.getElementById('message');
let currentStep = 1;

function showStep(number) {
  currentStep = number;
  steps.forEach(function (step) {
    step.hidden = Number(step.dataset.step) !== number;
  });
  stepperItems.forEach(function (item, i) {
    item.classList.toggle('is-done', i + 1 < number);
    item.classList.toggle('is-current', i + 1 === number);
  });
  // 新しいステップの最初の入力欄（なければボタン）にフォーカスを移す
  const active = form.querySelector('.form-step[data-step="' + number + '"]');
  const first = active.querySelector('input, textarea, button');
  if (first) first.focus();
}

function showError(text) {
  message.textContent = text;
  message.className = 'form-message is-error';
}

function clearMessage() {
  message.textContent = '';
  message.className = 'form-message';
}

function selectedServices() {
  return Array.from(serviceInputs).filter(function (input) { return input.checked; });
}

// ステップごとの入力チェック。問題がなければ true を返す
function validateStep(number) {
  clearMessage();

  if (number === 1 && selectedServices().length === 0) {
    showError('サービスを 1 つ以上選んでください');
    serviceInputs[0].focus();
    return false;
  }

  if (number === 2) {
    const name = shopName.value.trim();
    const mail = email.value.trim();
    shopName.removeAttribute('aria-invalid');
    email.removeAttribute('aria-invalid');

    if (name === '' || mail === '') {
      if (name === '') shopName.setAttribute('aria-invalid', 'true');
      if (mail === '') email.setAttribute('aria-invalid', 'true');
      showError('店名とメールアドレスを入力してください');
      (name === '' ? shopName : email).focus();
      return false;
    }
    if (!email.checkValidity()) {
      email.setAttribute('aria-invalid', 'true');
      showError('メールアドレスの形を確かめてください（例：shop@example.com）');
      email.focus();
      return false;
    }
  }
  return true;
}

// 確認の画面に入力した内容を出す。textContent を使うので、HTML が入っていてもそのまま文字として出る
function fillConfirm() {
  const chosen = selectedServices();
  const total = chosen.reduce(function (sum, input) { return sum + Number(input.dataset.price); }, 0);
  document.getElementById('confirm-services').textContent = chosen.map(function (input) { return input.value; }).join('、');
  document.getElementById('confirm-total').textContent = total.toLocaleString('ja-JP') + '円〜';
  document.getElementById('confirm-shop').textContent = shopName.value.trim();
  document.getElementById('confirm-email').textContent = email.value.trim();
  document.getElementById('confirm-message').textContent = consult.value.trim() || '（なし）';
}

form.querySelectorAll('.next-step').forEach(function (button) {
  button.addEventListener('click', function () {
    if (!validateStep(currentStep)) return;
    if (currentStep === 2) fillConfirm();
    showStep(currentStep + 1);
  });
});

form.querySelectorAll('.prev-step').forEach(function (button) {
  button.addEventListener('click', function () {
    clearMessage();
    showStep(currentStep - 1);
  });
});

// 確認のステップで「この内容で相談する」を押したとき
form.addEventListener('submit', function (event) {
  event.preventDefault(); // ページの移動を止める（デモなので送信しない）

  // Enter キーで途中のステップから送信されたときは「次へ」と同じ動きにする
  if (currentStep !== 3) {
    if (!validateStep(currentStep)) return;
    if (currentStep === 2) fillConfirm();
    showStep(currentStep + 1);
    return;
  }

  document.getElementById('done-text').textContent =
    shopName.value.trim() + ' 様の相談を受け付けました（デモのため送信はされません）';
  clearMessage();
  showStep(4);
});

document.getElementById('restart').addEventListener('click', function () {
  form.reset();
  shopName.removeAttribute('aria-invalid');
  email.removeAttribute('aria-invalid');
  clearMessage();
  showStep(1);
});
