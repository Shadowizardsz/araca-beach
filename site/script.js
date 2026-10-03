(function () {
  "use strict";

  var cfg = window.ARACA_CONFIG || {};
  var links = cfg.links || {};
  var msgs = cfg.mensagens || {};

  // SEGURANÇA: só aceita endereços https:// (bloqueia javascript:, data:, http: etc.)
  function safeUrl(value) {
    if (typeof value !== "string" || !value) return "";
    try {
      var u = new URL(value.trim());
      return u.protocol === "https:" ? u.href : "";
    } catch (e) {
      return "";
    }
  }

  // WhatsApp: só dígitos (DDD + número), limitado a 11 caracteres
  function wa(text) {
    var phone = String(cfg.whatsapp || "").replace(/\D/g, "").slice(0, 11);
    if (phone.length < 10) return "";
    return safeUrl("https://wa.me/55" + phone + "?text=" + encodeURIComponent(String(text || "").slice(0, 300)));
  }

  var urls = {
    avaliar: safeUrl(links.avaliar),
    agendar: wa(msgs.agendar),
    matricula: wa(msgs.matricula),
    equipe: wa(msgs.equipe),
    cardapio: safeUrl(links.cardapio),
    instagram: safeUrl(links.instagram),
    maps: safeUrl(links.maps),
  };

  document.querySelectorAll("[data-link]").forEach(function (el) {
    var url = urls[el.getAttribute("data-link")];

    if (url) {
      el.setAttribute("href", url);
      el.removeAttribute("aria-disabled");
      el.classList.remove("is-soon");
    } else {
      // Sem link válido (ex.: cardápio ainda ausente): botão visível, porém desativado.
      el.removeAttribute("href");
      el.setAttribute("aria-disabled", "true");
      el.classList.add("is-soon");
    }
  });

  // Reflexo do vidro: o brilho especular acompanha o dedo/mouse sobre o botão.
  document.querySelectorAll(".btn").forEach(function (btn) {
    var raf = 0;
    function move(ev) {
      if (raf) return;
      raf = requestAnimationFrame(function () {
        raf = 0;
        var r = btn.getBoundingClientRect();
        if (!r.width || !r.height) return;
        btn.style.setProperty("--mx", ((ev.clientX - r.left) / r.width * 100).toFixed(1) + "%");
        btn.style.setProperty("--my", ((ev.clientY - r.top) / r.height * 100).toFixed(1) + "%");
      });
    }
    function reset() {
      btn.style.removeProperty("--mx");
      btn.style.removeProperty("--my");
    }
    btn.addEventListener("pointermove", move, { passive: true });
    btn.addEventListener("pointerdown", move, { passive: true });
    btn.addEventListener("pointerleave", reset);
    btn.addEventListener("pointercancel", reset);
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
