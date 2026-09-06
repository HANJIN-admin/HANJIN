// 시공사례 상세 페이지 (Signature: 공사개요 구조화 표 + 상세 설명 분리)
(function () {
  const params = new URLSearchParams(location.search);
  const id = params.get("id");

  // 발주처/위치/공사기간/규모/주요공종 — 값이 채워진 항목만 표로 노출.
  // 지금은 portfolio.json에 이 필드가 없어 전부 비어있으므로, 관리자 페이지에서
  // 채우면 자동으로 표가 채워진다는 정직한 안내를 대신 보여준다.
  const OVERVIEW_FIELDS = [
    ["발주처", "client"],
    ["위치", "location"],
    ["공사기간", "period"],
    ["규모", "scale"],
    ["주요공종", "work_type"],
  ];

  function esc(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  function buildOverview(item) {
    const rows = OVERVIEW_FIELDS.filter(([, key]) => item[key]).map(([label, key]) => [label, item[key]]);
    if (!rows.length) {
      return (
        '<div class="pd-overview-empty">발주처·위치·공사기간·규모·주요공종 항목은 아직 입력된 값이 없습니다.' +
        "<br>관리자 페이지에서 프로젝트별로 값을 채우면, 채워진 항목만 이 자리에 자동으로 표로 정리되어 나타납니다.</div>"
      );
    }
    return (
      '<div class="pd-overview">' +
      rows.map(([label, val]) => `<div class="ov-row"><span class="k">${esc(label)}</span><span class="v">${esc(val)}</span></div>`).join("") +
      "</div>"
    );
  }

  fetch("content/portfolio.json")
    .then((r) => r.json())
    .then((data) => {
      const items = data.items || [];
      const item = items.find((i) => i.id === id);
      if (!item) {
        document.getElementById("pd-root").innerHTML =
          '<div style="padding:4rem 0;"><p>요청하신 시공사례를 찾을 수 없습니다. <a href="portfolio.html" style="color:var(--green-deep);font-weight:700;">시공사례 목록으로 돌아가기</a></p></div>';
        return;
      }

      document.title = `${item.title} | (주)한진종합건설`;
      document.getElementById("pd-crumb-title").textContent = item.title;
      document.getElementById("pd-title").textContent = item.title;
      document.getElementById("pd-cat").textContent = item.category;
      document.getElementById("pd-date").textContent = item.date;
      document.getElementById("pd-figure").style.backgroundImage = `url(${item.image || item.thumb})`;

      const galleryEl = document.getElementById("pd-thumbs");
      if (item.gallery && item.gallery.length) {
        galleryEl.style.display = "grid";
        galleryEl.innerHTML = item.gallery.map((g) => `<div style="background-image:url(${g})"></div>`).join("");
      } else {
        galleryEl.style.display = "none";
      }

      document.getElementById("pd-overview").innerHTML = buildOverview(item);

      const bodyEl = document.getElementById("pd-body");
      if (item.body) {
        bodyEl.innerHTML = `<p>${esc(item.body).replace(/\n/g, "<br>")}</p>`;
      } else {
        bodyEl.innerHTML = '<p class="fallback">등록된 상세 설명이 아직 없습니다. 자유 서술형 설명은 관리자 페이지에서 추가로 입력할 수 있습니다.</p>';
      }

      // prev/next within same category, sorted by date desc
      const sameCat = items.filter((i) => i.category === item.category).sort((a, b) => (a.date < b.date ? 1 : -1));
      const idx = sameCat.findIndex((i) => i.id === item.id);
      const prev = sameCat[idx - 1];
      const next = sameCat[idx + 1];
      const nav = document.getElementById("pd-nav");
      nav.innerHTML = `
        ${prev ? `<a href="portfolio-detail.html?id=${prev.id}"><span class="dir">← PREV</span><span class="ttl">${esc(prev.title)}</span></a>` : '<span class="empty">← PREV<br>같은 분야의 이전 글이 없습니다</span>'}
        ${next ? `<a href="portfolio-detail.html?id=${next.id}" style="text-align:right;"><span class="dir">NEXT →</span><span class="ttl">${esc(next.title)}</span></a>` : '<span class="empty" style="text-align:right;">NEXT →<br>같은 분야의 다음 글이 없습니다</span>'}
      `;
    });
})();
