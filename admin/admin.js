const form = document.getElementById("eventForm");
const titleInput = document.getElementById("title");
const imgInput = document.getElementById("img");
const previewImg = document.getElementById("preview");
const linkInput = document.getElementById("link_id");
const keywordsInput = document.getElementById("keywords");
const yearInput = document.getElementById("year");
const dateInput = document.getElementById("date");
const editIndexInput = document.getElementById("editIndex");
const output = document.getElementById("output");

let events = {};

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const year = yearInput.value;
  if (!events[year]) events[year] = [];

  let keywords = [];
  document.querySelectorAll("#keywordCheckboxes input:checked").forEach(cb => {
    keywords.push(cb.value);
  });
  if (keywordsInput.value.trim()) {
    keywords = keywords.concat(
      keywordsInput.value.split(",").map(k => k.trim()).filter(k => k)
    );
  }

  const eventData = {
    title: titleInput.value,
    img: "images/" + imgInput.value,
    link: linkInput.value.startsWith("http")
      ? linkInput.value
      : "mirr:///notice/r?c=" + linkInput.value.replace(/\D/g, ""),
    keywords: keywords,
    date: dateInput.value
  };

  const editIndex = editIndexInput.value;
  if (editIndex) {
    events[year][editIndex] = eventData;
  } else {
    events[year].push(eventData);
  }

  updateOutput();
  clearForm();
});

function updateOutput() {
  output.textContent = JSON.stringify(events, null, 2);
}

function clearForm() {
  form.reset();
  editIndexInput.value = '';

  // プレビュー類もリセット
  previewImg.style.display = "none";
  const linkPreview = document.getElementById("linkPreviewContainer");
  if (linkPreview) linkPreview.style.display = "none";
  document.querySelectorAll("#keywordCheckboxes input").forEach(cb => cb.checked = false);
}

// 画像プレビュー
imgInput.addEventListener("input", () => {
  if (imgInput.value.trim()) {
    previewImg.src = "images/" + imgInput.value.trim();
    previewImg.style.display = "block";
  } else {
    previewImg.style.display = "none";
  }
});

// リンクプレビュー
linkInput.addEventListener("input", () => {
  const val = linkInput.value.trim();
  const frameContainer = document.getElementById("linkPreviewContainer");
  const frame = document.getElementById("linkPreviewFrame");
  const altLink = document.getElementById("linkPreviewAlt");

  if (!val) {
    frameContainer.style.display = "none";
    frame.src = "";
    return;
  }

  let previewUrl;
  if (/^https?:\/\//i.test(val)) {
    previewUrl = val;
  } else {
    const numericId = val.replace(/\D/g, "");
    previewUrl = `https://www.mirrativ.com/notice/r?c=${numericId}`;
  }

  frame.src = previewUrl;
  altLink.href = previewUrl;
  frameContainer.style.display = "block";
});
