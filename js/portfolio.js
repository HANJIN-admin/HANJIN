// 시공사례 목록 페이지: 카테고리 필터 + 페이지네이션 (Signature 카드 그리드)
(function () {
  const grid = document.getElementById("pf-grid");
  if (!grid) return;
  const PAGE_SIZE = 15;
  const params = new URLSearchParams(location.search);
  let activeCat = params.get("cat") || "전체";
  let page = 1;
  let allItems = [];

  function esc(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  function render() {
    const filtered = activeCat === "전체" ? allItems : allItems.filter((i) => i.category === activeCat);
    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    if (page > totalPages) page = totalPages;
    const start = (page - 1) * PAGE_SIZE;
    const pageItems = filtered.slice(start, start + PAGE_SIZE);

    document.querySelectorAll("#cat-tabs button").forEach((b) => {
      b.classList.toggle("active", b.dataset.cat === activeCat);
    });

    if (!pageItems.length) {
      grid.innerHTML = '<div class="empty-state">해당 분야의 시공사례가 아직 없습니다.</div>';
    } else {
      grid.innerHTML = pageItems
        .map(
          (it) => `<a class="pf-card" href="portfolio-detail.html?id=${it.id}">
        <div class="pf-thumb" style="background-image:url(${it.thumb || it.image})"></div>
        <div class="pf-meta"><span class="pf-cat">${esc(it.category)}</span><span class="pf-date">${esc(it.date)}</span></div>
        <h3>${esc(it.title)}</h3>
      </a>`
        )
        .join("");
    }

    const pager = document.getElementById("pf-pager");
    if (totalPages <= 1) {
      pager.innerHTML = "";
    } else {
      let html = `<button class="pg-prev" ${page === 1 ? "disabled" : ""} data-p="${page - 1}">‹ 이전</button>`;
      for (let p = 1; p <= totalPages; p++) {
        html += `<button class="${p === page ? "active" : ""}" data-p="${p}">${p}</button>`;
      }
      html += `<button class="pg-next" ${page === totalPages ? "disabled" : ""} data-p="${page + 1}">다음 ›</button>`;
      pager.innerHTML = html;
      pager.querySelectorAll("button:not(.active):not(:disabled)").forEach((b) => {
        b.addEventListener("click", () => {
          page = parseInt(b.dataset.p, 10);
          render();
          window.scrollTo({ top: grid.offsetTop - 100, behavior: "smooth" });
        });
      });
    }

    const countEl = document.getElementById("pf-count");
    if (countEl) countEl.textContent = `총 ${filtered.length}건 · 최신순`;
  }

  document.querySelectorAll("#cat-tabs button").forEach((b) => {
    b.addEventListener("click", () => {
      activeCat = b.dataset.cat;
      page = 1;
      const url = new URL(location.href);
      if (activeCat === "전체") url.searchParams.delete("cat");
      else url.searchParams.set("cat", activeCat);
      history.replaceState(null, "", url);
      render();
    });
  });

  fetch("content/portfolio.json")
    .then((r) => r.json())
    .then((data) => {
      allItems = (data.items || []).slice().sort((a, b) => (a.date < b.date ? 1 : -1));
      render();
    });
})();
