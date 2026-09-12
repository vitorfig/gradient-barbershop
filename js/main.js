(() => {
  'use strict';

  var WA_NUMBER = '5541999707447';
  var DEFAULT_MSG = 'Olá! Quero agendar um horário na Gradient Barber Shop.';

  function waLink(service) {
    var msg = service
      ? 'Olá! Quero agendar: ' + service + '.'
      : DEFAULT_MSG;
    return 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(msg);
  }

  document.querySelectorAll('[data-wa-service]').forEach(function (el) {
    el.setAttribute('href', waLink(el.getAttribute('data-wa-service')));
  });

  // ---------- Nav scroll state + mobile menu ----------
  var nav = document.getElementById('siteNav');
  var onScroll = function () {
    if (window.scrollY > 40) nav.classList.add('is-scrolled');
    else nav.classList.remove('is-scrolled');
  };
  document.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  var navToggle = document.getElementById('navToggle');
  var navLinks = document.getElementById('navLinks');
  navToggle.addEventListener('click', function () {
    var open = navLinks.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  navLinks.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', function () {
      navLinks.classList.remove('is-open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });

  // ---------- Hero sound: click anywhere unmutes once, floating button toggles ----------
  var heroVideo = document.getElementById('heroVideo');
  var soundToggle = document.getElementById('soundToggle');
  var iconOn = soundToggle.querySelector('.icon-on');
  var iconOff = soundToggle.querySelector('.icon-off');

  function reflectSoundIcon(muted) {
    iconOn.style.display = muted ? 'none' : '';
    iconOff.style.display = muted ? '' : 'none';
    soundToggle.setAttribute('aria-pressed', muted ? 'false' : 'true');
    soundToggle.setAttribute('aria-label', muted ? 'Ativar som do site' : 'Silenciar site');
  }
  reflectSoundIcon(heroVideo.muted);

  soundToggle.addEventListener('click', function () {
    heroVideo.muted = !heroVideo.muted;
    if (!heroVideo.muted) heroVideo.play().catch(function () {});
    reflectSoundIcon(heroVideo.muted);
  });

  document.addEventListener('click', function firstInteraction(e) {
    if (soundToggle.contains(e.target)) return; // handled by its own listener
    heroVideo.muted = false;
    heroVideo.play().catch(function () {});
    reflectSoundIcon(false);
    document.removeEventListener('click', firstInteraction);
  }, { once: true });

  // ---------- Experience video: independent sound toggle ----------
  var experienceVideo = document.getElementById('experienceVideo');
  var experienceSoundBtn = document.querySelector('[data-sound-toggle]');
  if (experienceVideo && experienceSoundBtn) {
    var expOn = experienceSoundBtn.querySelector('.icon-on');
    var expOff = experienceSoundBtn.querySelector('.icon-off');
    experienceSoundBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      experienceVideo.muted = !experienceVideo.muted;
      if (!experienceVideo.muted) experienceVideo.play().catch(function () {});
      expOn.style.display = experienceVideo.muted ? 'none' : '';
      expOff.style.display = experienceVideo.muted ? '' : 'none';
      experienceSoundBtn.setAttribute('aria-pressed', experienceVideo.muted ? 'false' : 'true');
    });
  }

  // ---------- Professional videos: play only 0s-8s, then loop back to 0 ----------
  function clampVideoTo(video, endSeconds) {
    if (!video) return;
    video.addEventListener('timeupdate', function () {
      if (video.currentTime >= endSeconds) {
        video.currentTime = 0;
        video.play().catch(function () {});
      }
    });
  }
  clampVideoTo(document.getElementById('devaVideo'), 8);
  clampVideoTo(document.getElementById('maiconVideo'), 8);

  // ---------- Visagismo video: start at 35s, loop from 35s ----------
  var visagismoVideo = document.getElementById('visagismoVideo');
  if (visagismoVideo) {
    var START = 14;
    var startAt35 = function () {
      try { visagismoVideo.currentTime = START; } catch (err) {}
      visagismoVideo.play().catch(function () {});
    };
    visagismoVideo.addEventListener('loadedmetadata', startAt35);
    visagismoVideo.addEventListener('ended', startAt35);
    visagismoVideo.addEventListener('timeupdate', function () {
      if (visagismoVideo.duration && visagismoVideo.currentTime >= visagismoVideo.duration - 0.15) {
        startAt35();
      }
    });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) visagismoVideo.play().catch(function () {});
        else visagismoVideo.pause();
      });
    }, { threshold: 0.3 });
    io.observe(visagismoVideo);
  }

  // ---------- Before/after image reveal + drag slider ----------
  var baFrame = document.getElementById('baFrame');
  if (baFrame) {
    var baBefore = baFrame.querySelector('.ba-before');
    var baAfter = baFrame.querySelector('.ba-after');
    var baDivider = document.getElementById('baDivider');
    var baHandle = document.getElementById('baHandle');

    var baIo = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          baFrame.classList.add('is-revealed');
          baIo.unobserve(baFrame);
        }
      });
    }, { threshold: 0.4 });
    baIo.observe(baFrame);

    function setBaPosition(pct) {
      pct = Math.max(4, Math.min(96, pct));
      baBefore.style.clipPath = 'inset(0 ' + (100 - pct) + '% 0 0)';
      baAfter.style.clipPath = 'inset(0 0 0 ' + pct + '%)';
      baDivider.style.left = pct + '%';
      baHandle.style.left = pct + '%';
      baHandle.setAttribute('aria-valuenow', Math.round(pct));
    }

    function pctFromClientX(clientX) {
      var rect = baFrame.getBoundingClientRect();
      return ((clientX - rect.left) / rect.width) * 100;
    }

    var dragging = false;
    function startDrag(clientX) {
      dragging = true;
      baFrame.classList.add('dragging');
      setBaPosition(pctFromClientX(clientX));
    }
    function moveDrag(clientX) {
      if (!dragging) return;
      setBaPosition(pctFromClientX(clientX));
    }
    function endDrag() {
      dragging = false;
      baFrame.classList.remove('dragging');
    }

    baFrame.addEventListener('pointerdown', function (e) {
      baFrame.setPointerCapture(e.pointerId);
      startDrag(e.clientX);
    });
    baFrame.addEventListener('pointermove', function (e) { moveDrag(e.clientX); });
    baFrame.addEventListener('pointerup', endDrag);
    baFrame.addEventListener('pointercancel', endDrag);

    baHandle.addEventListener('keydown', function (e) {
      var current = parseFloat(baHandle.style.left) || 50;
      if (e.key === 'ArrowLeft') { setBaPosition(current - 5); e.preventDefault(); }
      if (e.key === 'ArrowRight') { setBaPosition(current + 5); e.preventDefault(); }
    });
  }

  // ---------- Testimonials marquee (placeholder content) ----------
  var testimonials = [
    { name: 'Rafael M.', role: 'Cliente desde 2023', quote: 'Corte impecável e o atendimento é outro nível. Saio de lá sempre satisfeito.' },
    { name: 'Thiago A.', role: 'Cliente fiel', quote: 'A análise visagista mudou meu corte pra melhor. Nunca mais fiz corte em outro lugar.' },
    { name: 'Bruno C.', role: 'Cliente desde 2022', quote: 'Ambiente muito bom, cheiro de café e um degradê perfeito. Recomendo demais.' },
    { name: 'Felipe S.', role: 'Cliente recorrente', quote: 'O Maicon é preciso no fade e ainda dá dica de manutenção. Virei cliente fiel.' },
    { name: 'Gustavo P.', role: 'Cliente desde 2023', quote: 'Barbaterapia é sensacional, toalha quente e navalha bem feita. Vale cada minuto.' },
    { name: 'Eduardo L.', role: 'Cliente novo', quote: 'Primeira vez lá e já saí com hora marcada pro próximo mês. Deva entende de visagismo de verdade.' }
  ];

  function initials(name) {
    return name.split(' ').map(function (p) { return p[0]; }).join('').slice(0, 2).toUpperCase();
  }

  function renderTestimonials() {
    var marquee = document.getElementById('marquee');
    var set = testimonials.concat(testimonials); // duplicate for seamless loop
    var html = set.map(function (t) {
      return (
        '<div class="t-card">' +
          '<div class="t-stars">★★★★★</div>' +
          '<p class="t-quote">“' + t.quote + '”</p>' +
          '<div class="t-who">' +
            '<span class="t-avatar">' + initials(t.name) + '</span>' +
            '<div><strong>' + t.name + '</strong><span>' + t.role + '</span></div>' +
          '</div>' +
        '</div>'
      );
    }).join('');
    marquee.innerHTML = html;
  }
  renderTestimonials();

  // ---------- Footer year ----------
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
