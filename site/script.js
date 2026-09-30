(function () {
  "use strict";

  var cfg = window.ARACA_CONFIG || { links: {}, mensagens: {} };
  var links = cfg.links || {};
  var msgs = cfg.mensagens || {};

  function wa(text) {
    return "https://wa.me/55" + cfg.whatsapp + "?text=" + encodeURIComponent(text);
  }

  var urls = {
    avaliar: links.avaliar,
    agendar: wa(msgs.agendar || ""),
    equipe: wa(msgs.equipe || ""),
    cardapio: links.cardapio,
    instagram: links.instagram,
    maps: links.maps,
  };

  document.querySelectorAll("[data-link]").forEach(function (el) {
    var key = el.getAttribute("data-link");
    var url = urls[key];

    if (url) {
      el.setAttribute("href", url);
      el.removeAttribute("aria-disabled");
      el.classList.remove("is-soon");
    } else {
      // Sem link (ex.: cardápio ainda ausente): botão visível, porém desativado.
      el.removeAttribute("href");
      el.setAttribute("aria-disabled", "true");
      el.classList.add("is-soon");
    }
  });

  // Ponto único para plugar Google Analytics / Meta Pixel depois.
  function track(name) {
    try {
      if (typeof window.gtag === "function") {
        window.gtag("event", "click_link", { link_name: name });
      }
      if (typeof window.fbq === "function") {
        window.fbq("trackCustom", "ClickLink", { link_name: name });
      }
    } catch (e) { /* rastreamento nunca pode quebrar o site */ }
  }

  // Reflexo do vidro: o brilho especular acompanha o dedo/mouse sobre o botão.
  document.querySelectorAll(".btn").forEach(function (btn) {
    function move(ev) {
      var r = btn.getBoundingClientRect();
      btn.style.setProperty("--mx", ((ev.clientX - r.left) / r.width * 100).toFixed(1) + "%");
      btn.style.setProperty("--my", ((ev.clientY - r.top) / r.height * 100).toFixed(1) + "%");
    }
    function reset() {
      btn.style.removeProperty("--mx");
      btn.style.removeProperty("--my");
    }
    btn.addEventListener("pointermove", move);
    btn.addEventListener("pointerdown", move);
    btn.addEventListener("pointerleave", reset);
    btn.addEventListener("pointercancel", reset);
  });

  document.addEventListener("click", function (ev) {
    var el = ev.target.closest("[data-link]");
    if (!el) return;
    if (el.getAttribute("aria-disabled") === "true") {
      ev.preventDefault();
      return;
    }
    track(el.getAttribute("data-link"));
  });
})();
