(function () {
'use strict';
if (window.__pc2Booted) return;
window.__pc2Booted = true;
document.documentElement.classList.add('pc2-js');
var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
var $ = function (s, c) { return (c || document).querySelector(s); };
var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
var hd = $('[data-hd]'), dr = $('#dr2'), burger = $('.hd-burger'), lastFocus = null;
var FOCUSABLE = 'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';
function menuOpen() { return !!dr && dr.classList.contains('open'); }
function setMenu(open) {
if (!dr || !burger || menuOpen() === open) return;
document.body.classList.toggle('menu-open', open);
dr.classList.toggle('open', open);
dr.setAttribute('aria-hidden', String(!open));
if (open) dr.removeAttribute('inert'); else dr.setAttribute('inert', '');
burger.setAttribute('aria-expanded', String(open));
burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
document.body.style.overflow = open ? 'hidden' : '';
$$('nav a, .dr2-foot > *', dr).forEach(function (a, i) { a.style.transitionDelay = open && !reduce ? (0.15 + i * 0.025) + 's' : '0s'; });
if (open) {
lastFocus = document.activeElement;
if (hd) hd.classList.remove('hd--hide');
var first = $('nav a', dr); if (first) first.focus({ preventScroll: true });
} else if (lastFocus && lastFocus.focus) {
lastFocus.focus({ preventScroll: true });
}
}
if (dr && burger) {
burger.addEventListener('click', function () { setMenu(!menuOpen()); });
dr.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
document.addEventListener('keydown', function (e) {
if (!menuOpen()) return;
if (e.key === 'Escape') { setMenu(false); return; }
if (e.key !== 'Tab') return;
var f = [burger].concat($$(FOCUSABLE, dr).filter(function (el) { return el.offsetParent !== null; }));
var first = f[0], last = f[f.length - 1];
if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
});
var wide = window.matchMedia('(min-width: 1201px)');
var onWide = function (m) { if (m.matches) setMenu(false); };
if (wide.addEventListener) wide.addEventListener('change', onWide); else if (wide.addListener) wide.addListener(onWide);
}
var hv = $('[data-hero-video]');
var saveData = navigator.connection && navigator.connection.saveData;
if (hv && !reduce && !saveData) {
$$('source[data-src]', hv).forEach(function (s) { s.src = s.getAttribute('data-src'); });
hv.load();
hv.addEventListener('playing', function () { hv.classList.add('is-playing'); }, { once: true });
var play = function () { var pr = hv.play(); if (pr && pr.catch) pr.catch(function () {}); };
play();
if ('IntersectionObserver' in window) {
new IntersectionObserver(function (es) { es.forEach(function (en) { if (en.isIntersecting) play(); else hv.pause(); }); }).observe(hv);
}
}
var reveal = $$('[data-anim], .rv');
if ('IntersectionObserver' in window && !reduce) {
var watch = [];
var io = new IntersectionObserver(function (es) {
es.forEach(function (en) {
if (!en.isIntersecting) return;
watch.forEach(function (w) { if (w.t === en.target) w.el.classList.add('on'); });
io.unobserve(en.target);
});
}, { threshold: 0.15, rootMargin: '0px 0px -6% 0px' });
reveal.forEach(function (el) {
var t = el.getAttribute('data-anim') === 'wipe' ? el.parentElement : el;
watch.push({ el: el, t: t }); io.observe(t);
});
} else { reveal.forEach(function (el) { el.classList.add('on'); }); }
function count(el) {
var to = +el.getAttribute('data-count'), from = +(el.getAttribute('data-from') || 0), t0 = null, d = 1600;
function step(ts) {
if (!t0) t0 = ts;
var k = Math.min(1, (ts - t0) / d); k = 1 - Math.pow(1 - k, 4);
el.textContent = Math.round(from + (to - from) * k);
if (k < 1) requestAnimationFrame(step);
}
requestAnimationFrame(step);
}
if ('IntersectionObserver' in window && !reduce) {
var co = new IntersectionObserver(function (es) {
es.forEach(function (en) { if (en.isIntersecting) { count(en.target); co.unobserve(en.target); } });
}, { threshold: 0.6 });
$$('[data-count]').forEach(function (el) { co.observe(el); });
}
var par = $$('[data-parallax]');
var lines = $$('[data-progress]').map(function (l) { var t = l.closest('.tl'); return { el: l, wrap: t, steps: $$('.tl-i', t) }; });
var lastY = window.scrollY;
function frame() {
var y = window.scrollY, vh = window.innerHeight, w = [];
if (hd) {
var solid = y > 80, hide = y > 400 && y > lastY + 2 && !menuOpen() && !hd.contains(document.activeElement);
var show = y < lastY - 2 || y <= 400;
w.push(function () { hd.classList.toggle('hd--solid', solid); if (hide) hd.classList.add('hd--hide'); else if (show) hd.classList.remove('hd--hide'); });
lastY = y;
}
if (!reduce) {
par.forEach(function (el) {
var r = el.parentElement.getBoundingClientRect();
if (r.bottom < 0 || r.top > vh) return;
var s = +el.getAttribute('data-parallax') || 0.15, t = r.top * -s;
w.push(function () { el.style.transform = 'translate3d(0,' + t.toFixed(1) + 'px,0)'; });
});
}
lines.forEach(function (L) {
var r = L.wrap.getBoundingClientRect();
if (r.bottom < -vh || r.top > vh * 2) return;
var mark = vh * 0.6, lp = reduce ? 1 : Math.min(1, Math.max(0, (mark - r.top) / r.height));
var on = L.steps.map(function (s) { return reduce || s.getBoundingClientRect().top + 30 < mark; });
w.push(function () { L.el.style.setProperty('--p', (lp * 100).toFixed(2) + '%'); L.steps.forEach(function (s, i) { s.classList.toggle('is-lit', on[i]); }); });
});
for (var i = 0; i < w.length; i++) w[i]();
}
var ticking = false;
function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(function () { ticking = false; frame(); }); } }
window.addEventListener('scroll', onScroll, { passive: true });
window.addEventListener('resize', onScroll);
frame();
$$('[data-areas]').forEach(function (box) {
var img = $('.fa-photo img', box), cap = $('.fa-cap', box), links = $$('.fa-list a[data-img]', box), cur = null, t = null;
if (!img) return;
links.forEach(function (a) { var pre = new Image(); pre.src = a.getAttribute('data-img'); });   // warm the cache
img.removeAttribute('srcset'); img.removeAttribute('sizes');
function show(a) {
if (a === cur) return;
cur = a;
links.forEach(function (l) { l.classList.toggle('is-on', l === a); });
var src = a.getAttribute('data-img'), name = a.getAttribute('data-city-name') || '';
if (reduce) { img.src = src; if (cap) cap.textContent = name; return; }
clearTimeout(t);
img.classList.add('is-fading');
t = setTimeout(function () { img.src = src; if (cap) cap.textContent = name; img.classList.remove('is-fading'); }, 250);
}
links.forEach(function (a) {
a.addEventListener('mouseenter', function () { show(a); });
a.addEventListener('focus', function () { show(a); });
});
});
$$('[data-reviews]').forEach(function (rv) {
var sl = $$('.rv2-slide', rv), dots = $$('.rv2-dots button', rv), stage = $('.rv2-stage', rv), pb = $('.rv2-pause', rv);
var i = 0, timer = null, paused = reduce, hovering = false;
function go(n) {
sl[i].classList.remove('on'); sl[i].setAttribute('aria-hidden', 'true');
dots[i].classList.remove('on'); dots[i].removeAttribute('aria-current');
i = (n + sl.length) % sl.length;
sl[i].classList.add('on'); sl[i].removeAttribute('aria-hidden');
dots[i].classList.add('on'); dots[i].setAttribute('aria-current', 'true');
}
function run() {
clearInterval(timer); timer = null;
var auto = !paused && !hovering;
if (auto) timer = setInterval(function () { go(i + 1); }, 7000);
stage.setAttribute('aria-live', auto ? 'off' : 'polite');
}
function setPaused(v) {
paused = v;
if (pb) { pb.classList.toggle('is-paused', v); pb.setAttribute('aria-label', v ? 'Play automatic review rotation' : 'Pause automatic review rotation'); }
run();
}
dots.forEach(function (d, n) { d.addEventListener('click', function () { go(n); run(); }); });
if (pb) pb.addEventListener('click', function () { setPaused(!paused); });
rv.addEventListener('mouseenter', function () { hovering = true; run(); });
rv.addEventListener('mouseleave', function () { hovering = false; run(); });
rv.addEventListener('focusin', function () { hovering = true; run(); });
rv.addEventListener('focusout', function (e) { if (!rv.contains(e.relatedTarget)) { hovering = false; run(); } });
if (sl.length < 2 && pb) pb.hidden = true;
setPaused(paused);
});
$$('.acc-q').forEach(function (q) {
q.addEventListener('click', function () {
var it = q.closest('.acc-i'), open = !it.classList.contains('open');
it.classList.toggle('open', open); q.setAttribute('aria-expanded', String(open));
});
});
$$('.areas').forEach(function (box) {
var current = null;
function mark(city) {
if (city === current) return;
current = city;
$$('[data-city]', box).forEach(function (el) { el.classList.toggle('is-active', !!city && el.getAttribute('data-city') === city); });
}
['mouseover', 'focusin'].forEach(function (ev) {
box.addEventListener(ev, function (e) { var el = e.target.closest && e.target.closest('[data-city]'); mark(el ? el.getAttribute('data-city') : null); });
});
box.addEventListener('mouseleave', function () { mark(null); });
});
var MSG = { name: 'Please enter your name.', phone: 'Please enter a phone number we can reach you on.', email: 'Please enter a valid email address, like name@example.com.' };
function fieldError(input) {
var v = input.validity;
if (v.valid) return '';
if (input.name === 'phone' && !v.valueMissing) return 'Please enter a valid phone number.';
return MSG[input.name] || 'Please fill in this field.';
}
function showError(input, msg) {
var slot = document.getElementById(input.id + '-err');
if (slot) slot.textContent = msg;
if (msg) input.setAttribute('aria-invalid', 'true'); else input.removeAttribute('aria-invalid');
}
function mailtoFrom(form) {
var d = new FormData(form), out = [];
[['Name', 'name'], ['Phone', 'phone'], ['Email', 'email'], ['Project type', 'service'], ['Project city', 'city'],
['Planning stage', 'stage'], ['Sent from', 'page']].forEach(function (f) { if (d.get(f[1])) out.push(f[0] + ': ' + d.get(f[1])); });
if (d.get('message')) out.push('', d.get('message'));
return 'mailto:' + form.getAttribute('data-recipients') + '?subject=' + encodeURIComponent(d.get('_subject') || 'Website inquiry') +
'&body=' + encodeURIComponent(out.join('\n'));
}
$$('form.form').forEach(function (form) {
var ok = $('.form-ok', form), err = $('.form-err', form), btn = $('button[type="submit"]', form);
var phoneLink = $('a[href^="tel:"]'), recips = (form.getAttribute('data-recipients') || '').split(',');
$$('[required]', form).forEach(function (input) {
input.addEventListener('input', function () { if (input.getAttribute('aria-invalid')) showError(input, fieldError(input)); });
input.addEventListener('blur', function () { if (input.value) showError(input, fieldError(input)); });
});
function sent(text) { form.classList.remove('has-error'); form.classList.add('sent'); ok.textContent = text; form.reset(); ok.focus(); }
function fail() {
err.innerHTML = 'Sorry, your inquiry couldn’t be sent. Please try again, call <a href="' + (phoneLink ? phoneLink.getAttribute('href') : '#') + '">' +
(phoneLink ? phoneLink.textContent.trim() : '') + '</a>, or email <a href="mailto:' + recips[0] + '">' + recips[0] + '</a>.';
form.classList.add('has-error'); err.focus();
}
form.addEventListener('submit', function (e) {
e.preventDefault();
form.classList.remove('has-error');
var firstBad = null;
$$('[required]', form).forEach(function (input) { var m = fieldError(input); showError(input, m); if (m && !firstBad) firstBad = input; });
if (firstBad) { firstBad.focus(); return; }
var hp = $('[name="_gotcha"]', form);
if (hp && hp.value) { sent('Thanks, your inquiry has been sent.'); return; }   // bot: pretend success
var ep = form.getAttribute('data-endpoint');
if (!ep) {
window.location.href = mailtoFrom(form);
sent('Your email app should open with your inquiry addressed to Connor and Rob. Press send there to finish. If nothing opened, email ' + recips.join(' and ') + '.');
return;
}
btn.disabled = true; btn.setAttribute('aria-busy', 'true');
fetch(ep, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
.then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); sent('Thanks, your inquiry has been sent. Connor or Rob will be in touch during business hours.'); })
.catch(fail)
.then(function () { btn.disabled = false; btn.removeAttribute('aria-busy'); });
});
});
var yr = $('#yr'); if (yr) yr.textContent = new Date().getFullYear();
})();