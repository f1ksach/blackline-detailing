'use strict';
document.addEventListener('DOMContentLoaded', () => {
  const $ = (selector) => document.querySelector(selector);
  const menu = $('.menu-toggle');
  const nav = $('.nav');
  menu?.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    menu.setAttribute('aria-expanded', String(open));
    menu.textContent = open ? '✕' : '☰';
  });
  nav?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    nav.classList.remove('open'); menu.setAttribute('aria-expanded','false'); menu.textContent = '☰';
  }));

  // Анимации: без библиотек сайт остаётся видимым и работоспособным.
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (window.gsap && !reduceMotion) {
    gsap.from('.hero .eyebrow', {y:24, opacity:0, duration:.8});
    gsap.from('.hero h1', {y:60, opacity:0, duration:1.1, delay:.12, ease:'power3.out'});
    gsap.from('.hero-copy', {y:30, opacity:0, duration:.9, delay:.35});
    gsap.from('.hero-actions', {y:25, opacity:0, duration:.9, delay:.5});
    if (window.ScrollTrigger) {
      gsap.registerPlugin(ScrollTrigger);
      gsap.utils.toArray('.reveal').forEach(el => {
        gsap.from(el, {scrollTrigger:{trigger:el,start:'top 92%',once:true},y:35,opacity:0,duration:.75,ease:'power2.out'});
      });
    }
  }

  // Сравнение фотографий.
  const comparison = $('#comparison-widget');
  const range = $('#compare-range');
  range?.addEventListener('input', () => comparison.style.setProperty('--split', `${range.value}%`));

  // Выбор услуги из карточки автоматически заполняет форму.
  document.querySelectorAll('[data-service]').forEach(link => link.addEventListener('click', () => {
    $('#client-service').value = link.dataset.service;
  }));

  // Демо-заявка: данные остаются только в браузере пользователя.
  const form = $('#booking-form');
  const status = $('#form-status');
  const share = $('#telegram-share');
  form?.addEventListener('submit', event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const name = $('#client-name').value.trim();
    const phone = $('#client-phone').value.trim();
    const service = $('#client-service').value;
    const comment = $('#client-comment').value.trim();
    if (!name || !/^[+\d\s()\-]{7,25}$/.test(phone) || !service) {
      status.textContent = 'Проверьте имя, номер телефона и услугу.';
      return;
    }
    const request = {name,phone,service,comment,createdAt:new Date().toISOString()};
    try {
      const previous = JSON.parse(localStorage.getItem('blackline-demo-requests') || '[]');
      const requests = Array.isArray(previous) ? previous.slice(-19) : [];
      requests.push(request);
      localStorage.setItem('blackline-demo-requests', JSON.stringify(requests));
      status.textContent = 'Демо-заявка сохранена в этом браузере. Она НЕ отправлена студии.';
    } catch (_) {
      status.textContent = 'Демо-заявка создана, но браузер запретил локальное сохранение.';
    }
    const message = `Демо-заявка BLACKLINE DETAILING\nИмя: ${name}\nТелефон: ${phone}\nУслуга: ${service}\nКомментарий: ${comment || '—'}`;
    share.href = `https://t.me/share/url?url=${encodeURIComponent('https://example.com')}&text=${encodeURIComponent(message)}`;
    share.hidden = false;
  });
  $('#clear-data')?.addEventListener('click', () => {
    try {localStorage.removeItem('blackline-demo-requests'); status.textContent='Локальные демо-заявки удалены.';}
    catch (_) {status.textContent='Не удалось удалить данные в этом браузере.';}
    share.hidden = true;
  });

  // Porsche 911 загружается из локального файла porsche-911.glb.
  const modelElement = $('#real-car');
  if (modelElement) {
    // Плавный поворот при скролле, не мешая вращению мышкой.
    let lastOrbit = 35;
    let scrollFrame = 0;
    const updateCarOnScroll = () => {
      scrollFrame = 0;
      const stage = $('#car-stage');
      if (!stage) return;
      const bounds = stage.getBoundingClientRect();
      const windowHeight = window.innerHeight || 800;
      if (bounds.bottom < 0 || bounds.top > windowHeight) return;
      const progress = Math.min(1, Math.max(0, (windowHeight - bounds.top) / (windowHeight + bounds.height)));
      const orbit = 35 + progress * 145;
      if (Math.abs(orbit - lastOrbit) > 0.15) {
        modelElement.cameraOrbit = `${orbit.toFixed(2)}deg 70deg auto`;
        lastOrbit = orbit;
      }
    };
    window.addEventListener('scroll', () => {
      if (!scrollFrame && !reduceMotion) scrollFrame = requestAnimationFrame(updateCarOnScroll);
    }, {passive:true});
  }

  // Управление настоящей GLB-моделью через model-viewer.
  const car = $('#real-car');
  const spin = $('#explode-btn');
  spin?.addEventListener('click', () => {
    if (!car) return;
    car.autoRotate = !car.autoRotate;
    spin.textContent = car.autoRotate ? 'Остановить вращение ◼' : 'Включить вращение ↻';
  });
  $('#reset-btn')?.addEventListener('click', () => {
    if (!car) return;
    car.cameraOrbit = '35deg 70deg auto';
    car.fieldOfView = 'auto';
    car.jumpCameraToGoal?.();
  });
});
