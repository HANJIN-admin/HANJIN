// 공지사항 · 보도자료 (Signature: 탭 + 에디토리얼 리스트)
(function () {
  function esc(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }
  const params = new URLSearchParams(location.search);
  let activeType = params.get("type") || "공지사항";
  let allItems = [];

  function updateTabs() {
    document.querySelectorAll(".news-tabs a").forEach((a) => {
      a.classList.toggle("active", a.dataset.type === activeType);
      const cnt = allItems.filter((n) => n.type === a.dataset.type).length;
      let cntEl = a.querySelector(".cnt");
      if (!cntEl) {
        cntEl = document.createElement("span");
        cntEl.className = "cnt";
        a.appendChild(cntEl);
      }
      cntEl.textContent = cnt;
    });
  }

  document.querySelectorAll(".news-tabs a").forEach((a) => {
    a.addEventListener("click", (e) => {
      e.preventDefault();
      activeType = a.dataset.type;
      const url = new URL(location.href);
      if (activeType === "공지사항") url.searchParams.delete("type");
      else url.searchParams.set("type", activeType);
      history.replaceState(null, "", url);
      updateTabs();
      render();
    });
  });

  function render() {
    const filtered = allItems.filter((n) => n.type === activeType).sort((a, b) => (a.date < b.date ? 1 : -1));
    const root = document.getElementById("news-root");
    if (!filtered.length) {
      root.innerHTML = `<div class="empty-state" style="margin-top:1.6rem;">등록된 ${esc(activeType)}가 없습니다.</div>`;
      return;
    }
    root.innerHTML = `<div class="news-list">
      ${filtered
        .map(
          (n) => `<div class="news-item">
        <div class="nmeta"><span class="ntag">${esc(n.type)}</span><span class="ndate">${esc(n.date)}</span></div>
        <h3>${esc(n.title)}</h3>
        <p>${esc(n.body || "")}</p>
        <div class="nauthor">작성자 · ${esc(n.author || "관리자")}</div>
      </div>`
        )
        .join("")}
    </div>`;
  }

  fetch("content/news.json")
    .then((r) => r.json())
    .then((data) => {
      allItems = data.items || [];
      updateTabs();
      render();
    });
})();
