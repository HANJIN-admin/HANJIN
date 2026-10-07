// 공지사항 · 보도자료 목록 (Signature: 탭 + 게시판형 리스트, 클릭하면 상세 페이지로 이동)
(function () {
  function esc(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }
  // 목록에는 본문 전체가 아니라 짧은 미리보기만 보여준다. 본문은 마크다운으로 작성되므로
  // (굵게 **, 목록 -, 이미지 ![]() 등) 그런 기호를 걷어내고 순수 텍스트만 남긴 뒤 자른다.
  function stripMarkdown(md) {
    let t = String(md || "");
    t = t.replace(/!\[[^\]]*\]\([^)]*\)/g, ""); // 이미지는 미리보기에서 제외
    t = t.replace(/\[([^\]]*)\]\([^)]*\)/g, "$1"); // 링크는 글자만 남김
    t = t.replace(/^\s{0,3}(#{1,6}|>|[-*+]|\d+[.)])\s+/gm, ""); // 줄 맨 앞 제목·목록·인용 기호
    t = t.replace(/(\*\*|__|\*|_|`{1,3}|~~)/g, ""); // 굵게·기울임·코드 기호
    t = t.replace(/\r\n|\r|\n/g, " ");
    t = t.replace(/\s+/g, " ").trim();
    return t;
  }
  function excerpt(md, max) {
    const t = stripMarkdown(md);
    return t.length > max ? t.slice(0, max).trim() + "…" : t;
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
          (n) => `<a class="news-item" href="news-detail.html?id=${encodeURIComponent(n.id)}">
        <div class="nmeta"><span class="ntag">${esc(n.type)}</span><span class="ndate">${esc(n.date)}</span></div>
        <h3>${esc(n.title)}</h3>
        <p class="nexcerpt">${esc(excerpt(n.body, 110))}</p>
        <div class="nauthor">작성자 · ${esc(n.author || "관리자")}</div>
      </a>`
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
