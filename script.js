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

// ---- 2. できあがりの見本：画像を押すと大きく表示する ----
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

// ---- 3. 見積もり相談フォーム：送信せず、ページ内にメッセージを出す ----
const form = document.getElementById('estimate-form');
const message = document.getElementById('form-message');
const shopName = document.getElementById('shop-name');
const email = document.getElementById('email');

form.addEventListener('submit', function (event) {
  event.preventDefault(); // ページの移動やメールソフトの起動を止める

  const name = shopName.value.trim();
  const mail = email.value.trim();

  // 前回の表示を消す
  shopName.removeAttribute('aria-invalid');
  email.removeAttribute('aria-invalid');
  message.className = 'form-message';

  if (name === '' || mail === '') {
    if (name === '') shopName.setAttribute('aria-invalid', 'true');
    if (mail === '') email.setAttribute('aria-invalid', 'true');
    message.textContent = '店名とメールアドレスを入力してください';
    message.classList.add('is-error');
    (name === '' ? shopName : email).focus();
    return;
  }

  // textContent を使うので、入力に HTML が入っていてもそのまま文字として出る
  message.textContent = name + ' 様の相談を受け付けました（デモのため送信はされません）';
  message.classList.add('is-success');
  form.reset();
});
