document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.main-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
    });
  }

  // Langue de la page (<html lang="en"> pour la version anglaise, dossier /en/).
  const isEn = (document.documentElement.lang || '').toLowerCase().startsWith('en');

  const contactForm = document.querySelector('#contact-form');
  // Version hors Azure (GitHub Pages) : pas de serveur à nous. Le formulaire est
  // transmis au service gratuit FormSubmit qui envoie un courriel à
  // info@kentekod.com — aucune fonction ni base de données à maintenir.
  if (contactForm) {
    const statusEl = document.createElement('p');
    statusEl.className = 'form-status';
    contactForm.appendChild(statusEl);
    const submitBtn = contactForm.querySelector('button[type="submit"]');

    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const fields = Object.fromEntries(new FormData(contactForm));

      statusEl.textContent = '';
      statusEl.className = 'form-status';
      if (submitBtn) submitBtn.disabled = true;

      try {
        // Champ piège rempli => robot : on fait semblant de réussir, sans rien envoyer.
        if (!fields.website) {
          const res = await fetch('https://formsubmit.co/ajax/info@kentekod.com', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify(fields),
          });
          const result = await res.json().catch(() => ({}));
          if (!res.ok || String(result.success) === 'false') throw new Error('request_failed');
        }
        contactForm.reset();
        statusEl.textContent = isEn
          ? 'Thank you! Your request has been sent — we will get back to you shortly.'
          : 'Merci ! Votre demande a bien été envoyée, nous vous répondrons rapidement.';
        statusEl.classList.add('is-success');
      } catch (err) {
        statusEl.textContent = isEn
          ? 'Something went wrong while sending. You can also write to us directly at info@kentekod.com.'
          : "Une erreur est survenue lors de l'envoi. Vous pouvez aussi nous écrire directement à info@kentekod.com.";
        statusEl.classList.add('is-error');
      } finally {
        if (submitBtn) submitBtn.disabled = false;
      }
    });
  }

  const copyEmailBtn = document.querySelector('#copy-email-btn');
  if (copyEmailBtn) {
    const originalLabel = copyEmailBtn.textContent;
    copyEmailBtn.addEventListener('click', async () => {
      const email = copyEmailBtn.dataset.email || '';
      try {
        await navigator.clipboard.writeText(email);
      } catch {
        // Repli si l'API Clipboard est indisponible (contexte non sécurisé, permission refusée…)
        const helper = document.createElement('textarea');
        helper.value = email;
        helper.style.position = 'fixed';
        helper.style.opacity = '0';
        document.body.appendChild(helper);
        helper.select();
        document.execCommand('copy');
        document.body.removeChild(helper);
      }
      copyEmailBtn.textContent = isEn ? 'Address copied!' : 'Adresse copiée !';
      setTimeout(() => { copyEmailBtn.textContent = originalLabel; }, 2000);
    });
  }

  const revealEls = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window && revealEls.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  }
  // L'alerte courriel de visite (géolocalisation) vit dans la version Azure du
  // site (site-vitrine/api/src/functions/track-visit.js). Elle sera rétablie
  // quand le site sera relié à nouveau à Azure.
});
