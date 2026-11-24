/* MySee – Vanilla JS */
(() => {
  'use strict';
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  document.documentElement.classList.add('js');

  /* WhatsApp da MySee (DDI+DDD+número) */
  const WHATSAPP = '5592992881821';

  /* ---------- Menu mobile (ARIA) ---------- */
  const burger = $('.burger'), menu = $('#menu');
  const setMenu = open => {
    burger.setAttribute('aria-expanded', open);
    burger.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    menu.classList.toggle('is-open', open);
  };
  burger.addEventListener('click', () => setMenu(burger.getAttribute('aria-expanded') !== 'true'));
  menu.addEventListener('click', e => e.target.closest('a') && setMenu(false));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') { setMenu(false); burger.focus(); } });

  /* ---------- Reveal on scroll ---------- */
  const revealIO = new IntersectionObserver((entries, io) => {
    entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('is-visible'); io.unobserve(en.target); } });
  }, { threshold: .12 });
  $$('.reveal').forEach((el, i) => { el.style.transitionDelay = `${(i % 4) * 80}ms`; revealIO.observe(el); });

  /* ---------- ScrollSpy ---------- */
  const links = $$('.nav__links a[href*="#"]:not(.btn)').filter(a => a.pathname === location.pathname);
  const spy = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      links.forEach(a => a.classList.toggle('is-active', a.hash === '#' + en.target.id));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  links.forEach(a => { const s = a.hash && $(a.hash); s && spy.observe(s); });

  /* ---------- Relógio do painel + ano ---------- */
  const clock = $('#clock');
  const tick = () => clock && (clock.textContent = new Date().toLocaleTimeString('pt-BR'));
  if (clock) { tick(); setInterval(tick, 1000); }
  const yr = $('#year'); if (yr) yr.textContent = new Date().getFullYear();

  /* ---------- Accordion (um item por vez) ---------- */
  const btns = $$('.acc__btn');
  btns.forEach(btn => btn.addEventListener('click', () => {
    const open = btn.getAttribute('aria-expanded') === 'true';
    btns.forEach(b => b.setAttribute('aria-expanded', 'false'));
    btn.setAttribute('aria-expanded', String(!open));
  }));

  /* ---------- Cotador multi-step ---------- */
  const form = $('#quote-form');
  if (!form) return; // páginas sem cotador
  const steps = $$('.step', form);
  const next = $('#btn-next'), prev = $('#btn-prev');
  const bar = $('.progress', form);
  let cur = 0;
  
  // Resumo dinâmico + estimativa
  const update = () => {
    const tipo = $('input[name="tipo"]:checked', form);
    const svcs = $$('input[name="svc"]:checked', form);
    $('#sum-type').textContent = 'O que proteger: ' + (tipo ? tipo.value : 'não selecionado');
    $('#sum-list').innerHTML = svcs.length ? svcs.map(s => `<li>${s.value}</li>`).join('') : '<li>Nenhum serviço selecionado</li>';
  };
  form.addEventListener('change', e => { update(); if (e.target.name) setErr(e.target.name, ''); });

  // Máscara de telefone BR: (99) 99999-9999
  const whats = $('#whats');
  whats.addEventListener('input', () => {
    let d = whats.value.replace(/\D/g, '').slice(0, 11);
    d = d.replace(/^(\d{2})(\d)/, '($1) $2');
    d = d.length > 10 ? d.replace(/(\d{5})(\d{4})$/, '$1-$2') : d.replace(/(\d{4})(\d{1,4})$/, '$1-$2');
    whats.value = d;
  });

  // Validação
  const setErr = (name, msg) => { const p = $(`[data-err="${name}"]`, form); if (p) p.textContent = msg; };
  const rules = {
    nome: v => v.trim().split(/\s+/).filter(w => w.length > 1).length >= 2 ? '' : 'Informe nome e sobrenome.',
    whats: v => /^\(\d{2}\) 9?\d{4}-\d{4}$/.test(v) ? '' : 'Digite um WhatsApp válido com DDD.',
    cidade: v => v.trim().length >= 2 ? '' : 'Informe sua cidade.'
  };
  const check = el => {
    const msg = rules[el.name](el.value);
    setErr(el.name, msg);
    el.classList.toggle('is-invalid', !!msg);
    el.classList.toggle('is-valid', !msg);
    el.setAttribute('aria-invalid', !!msg);
    return !msg;
  };
  Object.keys(rules).forEach(n => {
    const el = form.elements[n];
    el.addEventListener('blur', () => check(el));
    el.addEventListener('input', () => el.classList.contains('is-invalid') && check(el)); // feedback em tempo real
  });

  const validStep = () => {
    if (cur === 0 && !$('input[name="tipo"]:checked', form)) { setErr('tipo', 'Selecione o tipo de imóvel.'); return false; }
    if (cur === 1 && !$('input[name="svc"]:checked', form)) { setErr('svc', 'Escolha ao menos um serviço.'); return false; }
    if (cur === 2) return Object.keys(rules).map(n => check(form.elements[n])).every(Boolean);
    return true;
  };

  const show = i => {
    cur = i;
    steps.forEach((s, n) => s.classList.toggle('is-active', n === i));
    bar.firstElementChild.style.width = ((i + 1) / steps.length * 100) + '%';
    bar.setAttribute('aria-valuenow', i + 1);
    prev.hidden = i === 0;
    next.textContent = i === steps.length - 1 ? 'Enviar pedido' : 'Continuar';
  };
  prev.addEventListener('click', () => show(cur - 1));
  next.addEventListener('click', () => {
    if (!validStep()) return;
    if (cur < steps.length - 1) return show(cur + 1);
    submit();
  });
  form.addEventListener('submit', e => { e.preventDefault(); next.click(); });

  // Envio (simulado) + sucesso com link de WhatsApp
  const submit = () => {
    next.setAttribute('aria-busy', 'true'); next.textContent = 'Enviando…';
    setTimeout(() => {
      const f = form.elements;
      const svcs = $$('input[name="svc"]:checked', form).map(s => s.value).join(', ');
      const msg = `Olá! Sou ${f.nome.value}, de ${f.cidade.value}. Quero orçamento. Proteger: ${$('input[name="tipo"]:checked', form).value}: ${svcs}. WhatsApp: ${f.whats.value}`;
      $('#ok-name').textContent = f.nome.value.split(' ')[0];
      $('#ok-wa').href = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`;
      steps.forEach(s => s.classList.remove('is-active'));
      $('.form__nav', form).hidden = true;
      bar.firstElementChild.style.width = '100%';
      $('.success', form).hidden = false;
      next.removeAttribute('aria-busy');
      // Envio via WhatsApp (o projeto não possui endpoint de leads). Para salvar leads no Django, crie uma view POST aqui.
    }, 900);
  };
  update(); show(0);
})();
