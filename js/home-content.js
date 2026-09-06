// 메인 홈 화면: 관리자 화면(content/home.json)에서 배너 사진/문구, 상단 통계 숫자를 읽어와 채워넣음.
// index.html에는 관리자 저장 내용이 아직 없거나 로딩 전일 때 보일 기본값이 하드코딩되어 있고,
// 이 스크립트가 로드되면 그 값을 content/home.json 내용으로 덮어씀.
(function () {
  function esc(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }
  // 여러 줄 문구를 <br>로 변환
  function nl2br(s) {
    return esc(s).replace(/\n/g, "<br>");
  }
  // 문장 끝 마지막 단어가 홀로 다음 줄로 넘어가 어색해지는 것을 막기 위해
  // 마지막 단어를 줄바꿈 없는 span으로 감싼다 (기존 하드코딩 문구의 동작을 그대로 유지).
  function withNoWrapTail(s) {
    const escaped = esc(s);
    const lastSpace = escaped.lastIndexOf(" ");
    if (lastSpace === -1) return escaped;
    return escaped.slice(0, lastSpace + 1) + '<span style="white-space:nowrap;">' + escaped.slice(lastSpace + 1) + "</span>";
  }

  fetch("content/home.json")
    .then((r) => r.json())
    .then((data) => {
      const hero = data.hero || {};
      const heroSection = document.getElementById("hero");
      if (heroSection && hero.image) {
        heroSection.style.backgroundImage = "url(" + hero.image + ")";
      }
      const eyebrowEl = document.getElementById("hero-eyebrow");
      if (eyebrowEl && hero.eyebrow) eyebrowEl.textContent = hero.eyebrow;

      const titleEl = document.getElementById("hero-title");
      if (titleEl && hero.title) titleEl.innerHTML = nl2br(hero.title);

      const subEl = document.getElementById("hero-sub");
      if (subEl && hero.subtitle) subEl.innerHTML = withNoWrapTail(hero.subtitle);

      const creditEl = document.getElementById("hero-credit");
      if (creditEl && (hero.credit_title || hero.credit_meta)) {
        creditEl.innerHTML = (hero.credit_title ? "<b>" + esc(hero.credit_title) + "</b>" : "") + esc(hero.credit_meta || "");
        creditEl.style.display = "";
      } else if (creditEl) {
        creditEl.style.display = "none";
      }

      const statsWrap = document.getElementById("stats-wrap");
      if (statsWrap && Array.isArray(data.stats) && data.stats.length) {
        statsWrap.innerHTML = data.stats
          .map(
            (s) =>
              `<div class="stat"><div class="num${s.is_text ? " kr" : ""}">${esc(s.num)}<span>${esc(s.unit || "")}</span></div><div class="label">${esc(s.label || "")}</div></div>`
          )
          .join("");
      }
    })
    .catch(() => {
      // content/home.json을 못 읽어와도 index.html에 있는 기본 문구가 그대로 보이므로 화면이 깨지지 않음.
    });
})();
