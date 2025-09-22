const nav = document.getElementById('nav');
const links = Array.from(nav.querySelectorAll('a'));
const panels = Array.from(document.querySelectorAll('.panel'));

function canUseHistory() {
  try {
    return typeof history.replaceState === 'function' && !location.href.startsWith('about:');
  } catch (e) {
    return false;
  }
}

function activate(id) {
  panels.forEach(p => p.classList.toggle('active', p.id === id));
  links.forEach(a => a.classList.toggle('active', a.dataset.nav === id));

  if (canUseHistory()) {
    try {
      history.replaceState(null, '', '#' + id);
    } catch (e) {}
  }
}

links.forEach(a => {
  a.addEventListener('click', e => {
    e.preventDefault();
    activate(a.dataset.nav);
  });
});

window.addEventListener('load', () => {
  const id = (location.hash || '#overview').slice(1);
  activate(id);
});

const mini = document.querySelector('header.min .nav');
if (mini) {
  mini.innerHTML = nav.innerHTML;
  Array.from(mini.querySelectorAll('a')).forEach(a => 
    a.addEventListener('click', e => {
      e.preventDefault();
      activate(a.dataset.nav);
    })
  );
}

const hire = document.getElementById('hire');
if (hire) {
  hire.addEventListener('click', () => activate('contact'));
}

const go = document.getElementById('go-services');
if (go) {
  go.addEventListener('click', () => activate('overview'));
}

const gop = document.getElementById('go-projects');
if (gop) {
  gop.addEventListener('click', () => {
    activate('projects')
  });
}

const gosk = document.getElementById('go-skills');
if (gosk) {
  gosk.addEventListener('click', () => {
    activate('skills')
  });
}

const skillCloud = document.getElementById('skillCloud');
const skillPanels = document.getElementById('skillPanels').querySelectorAll('.card');

if (skillCloud) {
  skillCloud.addEventListener('click', e => {
    const t = e.target.closest('.skill');
    if (!t) return;

    const on = t.getAttribute('aria-pressed') === 'true';
    t.setAttribute('aria-pressed', (!on).toString());

    const active = Array.from(skillCloud.querySelectorAll('.skill[aria-pressed="true"]'))
      .map(x => x.dataset.skill);

    skillPanels.forEach(card => {
      const g = card.dataset.group || '';
      if (active.length === 0) {
        card.style.display = 'block';
      } else {
        card.style.display = active.includes(g) ? 'block' : 'none';
      }
    });
  });
}