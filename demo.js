/* Boucle de démo : construit les écrans à partir des caractéristiques détectées. */
(function () {
  'use strict';

  var SECONDS_PER_SCREEN = 7;
  var MAX_ATOUTS = 4;
  var LEGAL_SECONDS = 24;
  var INTRO_SECONDS = 8.2; // durée de l'animation du logo (200 images × 40 ms) // durée de défilement des mentions légales Club Infinity

  // Valeurs d'exemple quand la page est ouverte hors du téléphone (test dans un navigateur).
  var SAMPLE = {
    name: 'Téléphone exemple', cpuName: '', cores: 8, maxGhz: 2.4, ramGb: 8, storageGb: 256, sdMaxTb: 1,
    screenInch: 6.7, resW: 1080, resH: 2400, hz: 120, cameraMp: 50, batteryMah: 5000, infinity: true
  };

  var specs;
  try { specs = window.Demo ? JSON.parse(window.Demo.specs()) : SAMPLE; } catch (e) { specs = SAMPLE; }

  // ---------- Outils ----------
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function fr(n) { return String(n).replace('.', ','); }
  function big(n, unit, sub) {
    return '<div class="big"><div class="n grad">' + esc(n) + '</div><div class="u"><b>' + esc(unit) + '</b>' +
      (sub ? '<span>' + esc(sub) + '</span>' : '') + '</div></div>';
  }
  function storageLabel(gb) { return gb >= 1024 ? [fr(gb / 1024), 'To'] : [gb, 'Go']; }
  var HAND = '<span class="hand"><i></i><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#F56A00" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11V5a2 2 0 0 1 4 0v6"/><path d="M13 10a2 2 0 0 1 4 0v2"/><path d="M17 11.5a2 2 0 0 1 4 0V16a6 6 0 0 1-6 6h-2a6 6 0 0 1-5-2.7L4.6 15.6a2 2 0 0 1 3.1-2.5L9 14.5"/></svg></span>';
  // Sur iPhone (mode vitrine), le client ne peut pas toucher le téléphone : on l'invite à demander à un conseiller.
  var IOS = specs.platform === 'ios';
  var FOOT = '<div class="foot"><img src="logos/boulanger-horizontal.svg" alt="Boulanger"><div class="cta">' +
    (IOS ? 'Demandez à un conseiller' : HAND + 'Touchez pour l’essayer') + '</div></div>';
  var TOUCH_ICON = '<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#F56A00" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11V5a2 2 0 0 1 4 0v6"/><path d="M13 10a2 2 0 0 1 4 0v2"/><path d="M17 11.5a2 2 0 0 1 4 0V16a6 6 0 0 1-6 6h-2a6 6 0 0 1-5-2.7L4.6 15.6a2 2 0 0 1 3.1-2.5L9 14.5"/></svg>';

  // ---------- Écrans ----------
  var screens = {
    intro: function () {
      // Vidéo plutôt que GIF : elle peut être recalée à l'image près sur l'horloge commune.
      return '<div class="screen intro"><video src="intro.mp4" muted playsinline autoplay preload="auto" aria-label="Boulanger"></video></div>';
    },

    home: function () {
      if (IOS) {
        return '<div class="screen home">' +
          '<div class="t1">' + esc(specs.name) + '</div>' +
          '<div class="t2">Reconditionné · ' + esc(storageLabel(specs.storageGb).join(' ')) + '</div>' +
          '<h1 class="grad">Envie de<br>l’essayer ?</h1>' +
          '<div class="phone"><div class="sheenbar"></div></div>' +
          '<div class="touch"><div class="pill" style="font-size:15px;padding:10px 18px">Un conseiller vous le confie</div></div>' +
          FOOT + '</div>';
      }
      return '<div class="screen home">' +
        '<div class="t1">' + esc(specs.name || 'Smartphone en démonstration') + '</div>' +
        '<div class="t2">Il est à vous le temps de l’essayer.</div>' +
        '<h1 class="grad">Prenez-le<br>en main.</h1>' +
        '<div class="phone"><div class="sheenbar"></div></div>' +
        '<div class="touch"><div class="w"><div class="ring"></div><div class="dot">' + TOUCH_ICON + '</div></div></div>' +
        FOOT + '</div>';
    },

    battery: function () {
      return '<div class="screen bat">' +
        '<div class="t1">Batterie longue autonomie</div><div class="t2">Restez connecté plus longtemps.</div>' +
        '<div class="arc"><div class="moon"><i></i></div></div>' +
        '<div style="margin-top:120px">' + big(specs.batteryMah, 'mAh') + '</div>' +
        '<div class="cells"><div><div class="cell"><i></i></div><div class="cell"><i style="animation-delay:.4s"></i></div></div></div>' +
        FOOT + '</div>';
    },

    screen: function () {
      var pills = '';
      if (specs.hz >= 90) pills += '<div class="pill">' + esc(specs.hz) + ' Hz</div>';
      if (specs.resW) pills += '<div class="pill">' + esc(specs.resH) + ' × ' + esc(specs.resW) + '</div>';
      var head, num;
      if (specs.screenTech) pills = '<div class="pill">' + esc(specs.screenTech) + '</div>' + pills;
      if (specs.screenInch > 0) {
        head = '<div class="t1">' + esc(specs.screenTitle || 'Un grand écran immersif') + '</div><div class="t2">' +
          esc(specs.screenSub || (specs.hz >= 90 ? 'Ultra fluide, confortable toute la journée.' : 'Confortable pour toute la journée.')) + '</div>';
        num = '<div class="big" style="margin-top:26px"><div class="n grad">' + esc(fr(specs.screenInch)) + '</div><div class="inch">"</div></div>';
      } else {
        // Taille non connue avec certitude : on met en avant la fluidité, mesurée de façon fiable.
        pills = specs.resW ? '<div class="pill">' + esc(specs.resH) + ' × ' + esc(specs.resW) + '</div>' : '';
        head = '<div class="t1">Un écran ultra fluide</div><div class="t2">Défilement et animations d’une grande douceur.</div>';
        num = '<div style="margin-top:26px">' + big(specs.hz, 'Hz', 'de fréquence') + '</div>';
      }
      return '<div class="screen scr">' + head + num +
        '<div class="pills" style="margin-top:8px">' + pills + '</div>' +
        '<div class="tilt"><div class="wall"></div><div class="sheenbar"></div></div>' +
        FOOT + '</div>';
    },

    storage: function () {
      var f = [
        ['Photos', '30%', 'linear-gradient(135deg,#FF9A3C,#F56A00)', 'M3 8a2 2 0 0 1 2-2h2l2-2h6l2 2h2a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM12 10a3 3 0 1 0 0 6 3 3 0 0 0 0-6z'],
        ['Vidéos', '24%', 'linear-gradient(135deg,#4A4D63,#1B1D29)', 'M4 6h11a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1zM16 10l5-3v10l-5-3'],
        ['Applis', '18%', 'linear-gradient(135deg,#B3B1F0,#7E7BDA)', 'M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z'],
        ['Musique', '10%', 'linear-gradient(135deg,#FFC48A,#E08A3C)', 'M9 18V5l12-2v13M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM21 16a3 3 0 1 1-6 0 3 3 0 0 1 6 0z']
      ];
      var icons = '', gauge = '', legend = '';
      f.forEach(function (x, i) {
        var d = (i * 0.3) + 's';
        icons += '<div style="background:' + x[2] + ';animation-delay:' + d + '"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="' + x[3] + '"/></svg></div>';
        gauge += '<div style="width:' + x[1] + ';background:' + x[2] + ';animation-delay:' + d + '"></div>';
        legend += '<div>' + x[0] + '</div>';
      });
      var s = storageLabel(specs.storageGb);
      var sd = '';
      if (specs.sdMaxTb > 0) {
        var sdl = specs.sdMaxTb >= 1 ? fr(specs.sdMaxTb) + ' To' : Math.round(specs.sdMaxTb * 1024) + ' Go';
        sd = '<div class="sd"><div class="card"><div class="pins"><i></i><i></i><i></i><i></i></div><b>microSD</b></div>' +
          '<div><div style="font-size:15px;font-weight:600">Besoin de plus ?</div><div style="font-size:14px;color:#3F434C">Extensible jusqu’à <b style="color:#C25400">' + sdl + '</b> par carte microSD</div></div></div>';
      }
      return '<div class="screen">' +
        '<div class="t1">Toute la place qu’il vous faut</div><div class="t2">Photos, vidéos, applis : gardez tout.</div>' +
        '<div style="margin-top:30px">' + big(s[0], s[1], 'de stockage') + '</div>' +
        '<div class="box"><div class="files">' + icons + '</div><div class="gauge">' + gauge + '</div><div class="legend">' + legend + '</div></div>' +
        sd + FOOT + '</div>';
    },

    cpu: function () {
      var n = Math.min(Math.max(specs.cores || 8, 4), 12), cores = '';
      for (var i = 0; i < n; i++) cores += '<i style="animation-delay:' + (i * 0.3).toFixed(1) + 's"></i>';
      var title = specs.cpuName ? esc(specs.cpuName) : 'Un processeur ' + esc(specs.cores) + ' cœurs';
      var num = specs.maxGhz > 0
        ? big(fr(specs.maxGhz), 'GHz', 'jusqu’à, sur ' + specs.cores + ' cœurs')
        : big(specs.cores, 'cœurs', 'de processeur');
      return '<div class="screen">' +
        '<div class="t1">' + title + '</div><div class="t2">' + esc(specs.cpuSub || 'Vos applis du quotidien, sans attendre.') + '</div>' +
        '<div class="chipwrap"><div class="halo"></div><div class="glow"></div><div class="chip">' + cores + '</div></div>' +
        '<div style="margin-top:26px">' + num + '</div>' + FOOT + '</div>';
    },

    ram: function () {
      var apps = [['Photos', '#FF9A3C,#F56A00'], ['Messages', '#B3B1F0,#7E7BDA'], ['Musique', '#FFC48A,#E08A3C'],
        ['Vidéo', '#4A4D63,#1B1D29'], ['Jeu', '#CAC9F6,#8E8BE0'], ['Web', '#FFB36B,#C25400']];
      var h = '';
      apps.forEach(function (a, i) {
        h += '<div style="animation-delay:' + (i * 0.4).toFixed(1) + 's"><i style="background:linear-gradient(135deg,' + a[1] + ')"></i>' + a[0] + '</div>';
      });
      return '<div class="screen">' +
        '<div class="t1">Le multitâche sans attendre</div><div class="t2">Passez d’une appli à l’autre sans rechargement.</div>' +
        '<div style="margin-top:30px">' + big(specs.ramGb, 'Go', 'de mémoire vive') + '</div>' +
        '<div class="apps">' + h + '</div>' +
        '<div class="ram"><i></i><i></i><i></i><i></i><div class="flow"></div><div class="gold"></div></div>' +
        '<div style="font-size:12px;color:#3F434C;margin-top:8px">La mémoire qui garde vos applis ouvertes</div>' +
        FOOT + '</div>';
    },

    photo: function () {
      var c = 'border-width:0;';
      return '<div class="screen">' +
        '<div class="t1">Des photos pleines de détails</div><div class="t2">Même en recadrant, tout reste net.</div>' +
        '<div style="margin-top:30px">' + big(specs.cameraMp, 'Mpx', 'capteur principal') + '</div>' +
        (specs.photoPill ? '<div class="pills" style="margin-top:8px"><div class="pill">' + esc(specs.photoPill) + '</div></div>' : '') +
        '<div class="viewer"><div class="sun"></div><div class="hill"></div>' +
        '<div class="frame"><i style="' + c + 'left:0;top:0;border-left-width:3px;border-top-width:3px"></i><i style="' + c + 'right:0;top:0;border-right-width:3px;border-top-width:3px"></i>' +
        '<i style="' + c + 'left:0;bottom:0;border-left-width:3px;border-bottom-width:3px"></i><i style="' + c + 'right:0;bottom:0;border-right-width:3px;border-bottom-width:3px"></i></div>' +
        '<div class="flashl"></div></div>' + FOOT + '</div>';
    },

    infinity: function () {
      var check = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C25400" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0"><path d="M5 12l5 5L20 7"/></svg>';
      var perks = ['Film d’écran posé en magasin **', 'Antivirus Norton 360', 'Livraison dès demain offerte', '2 % cagnottés par achat']
        .map(function (p) { return '<div>' + check + esc(p) + '</div>'; }).join('');
      return '<div class="screen inf">' +
        '<div class="logo"><img src="logo-infinity.png" alt="Boulanger Le Club Infinity" onerror="this.parentNode.classList.add(\'txt\');this.parentNode.textContent=\'Boulanger · Le Club Infinity\'"></div>' +
        '<div class="head"><div class="shield"><div class="r"></div><div class="s"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg></div></div>' +
        '<h1>On met votre smartphone sous haute protection !</h1></div>' +
        '<div class="badge">Sans franchise</div>' +
        '<div class="offers">' +
        '<div class="offer"><div class="k">Solo <sup>(2)</sup></div><div class="p grad">15,99 €</div><div class="m">par mois</div><div>1 téléphone acheté chez Boulanger<br>Casse, oxydation, vol, panne, batterie usagée</div></div>' +
        '<div class="offer"><div class="k">Famille <sup>(2)</sup></div><div class="p grad">24,99 €</div><div class="m">par mois</div><div>Jusqu’à 5 téléphones du foyer <sup>(3)</sup><br>Sinistres illimités, 2 vols/an</div></div>' +
        '</div><div class="perks">' + perks + '</div>' +
        (IOS ? '<div class="nocare">Avantages AppleCare Services non inclus pour les iPhone reconditionnés.</div>' : '') +
        '<div class="qr"><img src="qr.svg" alt="QR code vers la page Club Infinity"><div><b>Scannez pour en savoir plus</b><br><span style="color:#3F434C">ou demandez à un conseiller</span></div></div>' +
        '<div class="legalbox"><div class="legal">' + esc(window.LEGAL_INFINITY || '') + '</div></div>' +
        '</div>';
    }
  };

  // ---------- Choix des atouts les plus vendeurs ----------
  function score() {
    var s = [], v = specs;
    if (v.batteryMah >= 4000) s.push(['battery', v.batteryMah >= 5000 ? 3 + (v.batteryMah - 5000) / 1000 : 1]);
    // Écran : taille seulement si elle est connue avec certitude, sinon fluidité à partir de 90 Hz.
    if (v.screenInch > 0) s.push(['screen', (v.screenInch >= 6.5 ? 2 : 1) + (v.hz >= 120 ? 1.5 : v.hz >= 90 ? 0.5 : 0)]);
    else if (v.hz >= 90) s.push(['screen', v.hz >= 120 ? 2.5 : 1.2]);
    if (v.storageGb >= 64) s.push(['storage', (v.storageGb >= 512 ? 3.5 : v.storageGb >= 256 ? 3 : v.storageGb >= 128 ? 1.5 : 0.5) + (v.sdMaxTb > 0 ? 1 : 0)]);
    if (v.ramGb >= 6) s.push(['ram', v.ramGb >= 12 ? 3 : v.ramGb >= 8 ? 2 : 0.6]);
    if (v.cores) s.push(['cpu', v.cpuName ? 3 : (v.maxGhz >= 2.8 ? 2 : v.maxGhz >= 2.2 ? 1.2 : 0.4)]);
    // Photo : seulement à partir de 48 Mpx (la lecture ne peut que sous-estimer, jamais gonfler la valeur).
    if (v.cameraMp >= 48) s.push(['photo', v.cameraMp >= 108 ? 3.2 : 2.2]);
    s.sort(function (a, b) { return b[1] - a[1]; });
    var picked = s.filter(function (x) { return x[1] >= 1; }).slice(0, MAX_ATOUTS);
    if (picked.length < 2) picked = s.slice(0, 2);
    return picked.map(function (x) { return x[0]; });
  }


  // ---------- Affichage et enchaînement ----------
  var stage = document.getElementById('stage');
  // Anti-marquage des écrans OLED : tout le contenu se décale doucement de quelques pixels chaque minute.
  var shiftX = 0, shiftY = 0;
  function fit() {
    var k = Math.min(window.innerWidth / 390, window.innerHeight / 844);
    stage.style.transform = 'translate(calc(-50% + ' + shiftX + 'px), calc(-50% + ' + shiftY + 'px)) scale(' + k + ')';
  }
  window.addEventListener('resize', fit);
  fit();
  setInterval(function () {
    stage.classList.add('drift'); // transition douce seulement pour le décalage, pas au démarrage
    shiftX = Math.round(Math.random() * 12 - 6);
    shiftY = Math.round(Math.random() * 12 - 6);
    fit();
  }, 60000);

  var EFFECTS = ['fx-slide', 'fx-zoom', 'fx-up', ''];

  // ---------- Synchronisation entre téléphones ----------
  // Tous les téléphones (Android et iPhone) suivent la même horloge réseau : la boucle dure CYCLE_MS
  // et redémarre à chaque multiple exact de CYCLE_MS. Aucun échange entre téléphones n'est nécessaire.
  var INTRO_MS = 8200, HOME_MS = 6800, ATOUTS_MS = 28000, INF_MS = (LEGAL_SECONDS + 3) * 1000;
  var CYCLE_MS = INTRO_MS + HOME_MS + ATOUTS_MS + INF_MS; // 70 secondes
  var atouts = score();
  if (!atouts.length) atouts = ['home'];

  // Écran prévu à l'instant t, avec le début et la fin de son créneau.
  function slotAt(t) {
    var start = Math.floor(t / CYCLE_MS) * CYCLE_MS, a = start;
    if (t < a + INTRO_MS) return { name: 'intro', key: start + ':intro', from: a, to: a + INTRO_MS };
    a += INTRO_MS;
    if (t < a + HOME_MS) return { name: 'home', key: start + ':home', from: a, to: a + HOME_MS };
    a += HOME_MS;
    if (t < a + ATOUTS_MS) {
      // Les atouts se partagent le même temps total : chaque modèle arrive au Club Infinity en même temps.
      var d = ATOUTS_MS / atouts.length, i = Math.min(atouts.length - 1, Math.floor((t - a) / d));
      return { name: atouts[i], key: start + ':atout' + i, from: a + i * d, to: a + (i + 1) * d };
    }
    a += ATOUTS_MS;
    return { name: specs.infinity ? 'infinity' : 'home', key: start + ':fin', from: a, to: a + INF_MS };
  }

  function now() {
    var o = 0;
    try { if (window.Demo && window.Demo.clockOffset) o = Number(window.Demo.clockOffset()) || 0; } catch (e) {}
    return Date.now() + o;
  }

  // Cale la vidéo du logo sur l'horloge commune (au chargement, puis à chaque seconde).
  var introVideo = null, introFrom = 0;
  function syncIntro() {
    var v = introVideo;
    if (!v || !(v.readyState >= 1)) return;
    var target = Math.max(0, (now() - introFrom) / 1000);
    if (isFinite(v.duration) && target >= v.duration) return;
    if (Math.abs(v.currentTime - target) > 0.12) { try { v.currentTime = target; } catch (e) {} }
    if (v.paused) { var pr = v.play(); if (pr && pr.catch) pr.catch(function () {}); }
  }

  var current = null, currentName = null, count = 0;
  function show(slot, now) {
    var name = slot.name, late = Math.max(0, now - slot.from);
    if (name === 'home' && currentName === 'home') return;
    var holder = document.createElement('div');
    holder.innerHTML = screens[name]();
    var el = holder.firstChild;
    var fx = name === 'intro' ? '' : EFFECTS[count++ % EFFECTS.length];
    if (fx) el.classList.add(fx);
    stage.appendChild(el);
    // Reflow puis fondu : relance aussi les animations à chaque passage.
    void el.offsetWidth;
    el.classList.add('on');
    var old = current;
    current = el; currentName = name;
    if (old) {
      old.classList.remove('on');
      old.classList.add('off');
      setTimeout(function () { if (old.parentNode) old.parentNode.removeChild(old); }, 900);
    }
    document.body.classList.toggle('orange', name === 'intro');
    introVideo = null;
    if (name === 'intro') {
      var v = el.querySelector('video');
      introVideo = v; introFrom = slot.from;
      v.addEventListener('loadedmetadata', syncIntro);
      v.addEventListener('canplay', syncIntro);
      // Vidéo illisible : retour au GIF animé.
      v.addEventListener('error', function () {
        var img = document.createElement('img');
        img.src = 'boulanger-intro.gif?r=' + Date.now(); img.alt = 'Boulanger';
        if (v.parentNode) v.parentNode.replaceChild(img, v);
        introVideo = null;
      });
    }
    if (name === 'infinity') {
      // Défilement des mentions légales, recalé si le téléphone arrive en cours de créneau.
      var legal = el.querySelector('.legal'), box = el.querySelector('.legalbox');
      var dist = legal && box ? Math.max(0, legal.scrollHeight - box.clientHeight + 10) : 0;
      if (dist && legal.animate) {
        var anim = legal.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(-' + dist + 'px)' }],
          { duration: LEGAL_SECONDS * 1000, delay: 1500, fill: 'forwards', easing: 'linear' });
        if (late > 0) anim.currentTime = late;
      }
    }
  }

  var shownKey = null;
  function tick() {
    var t = now(), slot = slotAt(t);
    if (slot.key !== shownKey) { shownKey = slot.key; show(slot, t); }
    syncIntro();
    // Prochain contrôle à la fin du créneau, et au moins chaque seconde (si l'heure du téléphone est corrigée).
    setTimeout(tick, Math.max(40, Math.min(1000, slot.to - now() + 15)));
  }
  tick();

  // Premier toucher : on rend le téléphone au client.
  document.addEventListener('pointerdown', function () {
    if (window.Demo && window.Demo.exit) window.Demo.exit();
  });
})();
