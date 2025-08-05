// admin.js

// 初期データ（空配列またはGitHubからfetchで読み込み可能）
let events = [];

// 各DOM参照
const form = document.getElementById('event-form');
const editIndexInput = document.getElementById('edit-index');
const titleInput = document.getElementById('title');
const yearInput = document.getElementById('year');
const imgInput = document.getElementById('img');
const linkInput = document.getElementById('link');
const keywordsInput = document.getElementById('keywords');
const eventsContainer = document.getElementById('events-container');
const jsonOutput = document.getElementById('json-output');

// 表示更新関数
function renderEvents() {
  eventsContainer.innerHTML = '';
  events.forEach((event, index) => {
    const div = document.createElement('div');
    div.className = 'event-item';
    div.innerHTML = `
      <div class="event-info">
        <strong>${event.title}</strong> (${event.year})<br>
        <small>リンク: ${event.link}</small><br>
        <small>キーワード: ${event.keywords.join(', ')}</small>
      </div>
      <div class="event-actions">
        <button onclick="editEvent(${index})">編集</button>
        <button class="delete" onclick="deleteEvent(${index})">削除</button>
      </div>
    `;
    eventsContainer.appendChild(div);
  });
  // JSON出力も更新
  jsonOutput.textContent = JSON.stringify(events, null, 2);
}

// 登録・更新処理
form.addEventListener('submit', e => {
  e.preventDefault();

  const title = titleInput.value.trim();
  const year = parseInt(yearInput.value);
  const img = imgInput.value.trim();
  const link = linkInput.value.trim();
  const keywords = keywordsInput.value.split(',').map(s => s.trim()).filter(s => s !== '');

  if (!title || !year || !link) {
    alert('タイトル・開催年・リンクは必須です');
    return;
  }

  const newEvent = { title, year, img, link, keywords };

  const editIndex = editIndexInput.value;

  if (editIndex === '') {
    // 新規追加
    events.push(newEvent);
  } else {
    // 編集更新
    events[editIndex] = newEvent;
  }

  clearForm();
  renderEvents();
});

// 編集ボタン用関数（グローバルに設定）
window.editEvent = function(index) {
  const event = events[index];
  titleInput.value = event.title;
  yearInput.value = event.year;
  imgInput.value = event.img;
  linkInput.value = event.link;
  keywordsInput.value = event.keywords.join(', ');
  editIndexInput.value = index;
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

// 削除ボタン用関数（グローバルに設定）
window.deleteEvent = function(index) {
  if (confirm('本当に削除しますか？')) {
    events.splice(index, 1);
    renderEvents();
  }
};

function clearForm() {
  form.reset();
  editIndexInput.value = '';
}

// 初期表示
renderEvents();
