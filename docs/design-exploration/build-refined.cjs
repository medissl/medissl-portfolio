const fs = require('node:fs');
const path = require('node:path');
const root = __dirname;
const existing = JSON.parse(fs.readFileSync(path.join(root, 'projects.json'), 'utf8'));
const sakiko = {
  id: 'sakiko', title: 'SAKIKO', kind: 'Games', type: 'First-person horror · Windows',
  image: 'sakiko-menu.png', second: 'sakiko-corridor-night.png',
  text: 'A Japanese school after dark. Explore the empty halls, piece together the evidence, and find a way out.',
  role: 'Game development', tech: 'Godot / GDScript / Windows',
  repo: 'https://github.com/medissl/SAKIKO',
  link: 'https://github.com/medissl/SAKIKO/releases',
  evidence: ['First-person exploration, object inspection and a journal.', 'Connected classroom routes and a hand-operated shutter.', 'Eight task checkpoints retain completed tasks when retrying.']
};
const projects = [sakiko, ...['jellink','maucuan','shoot','wildfeast','rundori'].map(id => existing.find(p => p.id === id))];
const artwork = existing.filter(p => p.kind === 'Artwork' && p.id !== 'mewdi');
fs.writeFileSync(path.join(root, 'refined-content.json'), JSON.stringify({ projects, artwork }, null, 2));
const escape = text => text.replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;');
const caption = p => `<div class="caption"><div><h2><button data-open="${p.id}">${p.title}</button></h2><p>${p.type}</p></div><button class="inspect" data-open="${p.id}" aria-label="Inspect ${escape(p.title)}">↗</button></div>`;
const img = (file, alt, extra = '') => `<img src="assets/${file}" alt="${escape(alt)}" ${extra}>`;
const card = p => `<article class="project ${p.id}" data-category="${p.kind}"><button class="stage" data-open="${p.id}" aria-label="Inspect ${escape(p.title)}">${p.id === 'sakiko' ? img(p.image,'SAKIKO actual main menu') : p.second && p.shape === 'portrait' ? `<span class="screens">${img(p.second,p.title+' alternate screen')}${img(p.image,p.title+' actual screen')}</span>` : img(p.image,p.title+' actual screenshot')}</button>${caption(p)}${p.id === 'sakiko' ? `<div class="preview-controls"><p id="preview-caption" aria-live="polite">Main menu</p><button id="preview-next">Next screenshot →</button></div>` : ''}</article>`;
const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>medissl — Projects & artwork / A refined</title><link rel="stylesheet" href="refined.css"></head><body>
<a class="skip" href="#main">Skip to work</a>
<aside class="rail"><a class="wordmark" href="a-refined.html" aria-label="medissl home">medissl</a><div class="identity"><p>Medianto Susilo</p><p>Software, games<br> & interface design.</p></div><nav aria-label="Portfolio collections"><a href="#projects" data-view="projects" aria-current="page">Projects <span>06</span></a><a href="#artwork" data-view="artwork">Artwork <span>03</span></a></nav><div class="rail-bottom"><a href="https://github.com/medissl" target="_blank" rel="noreferrer">GitHub ↗</a><a href="mailto:mediantozeng@gmail.com">Get in touch ↗</a><a class="review-link" href="index.html">Concept comparison</a></div></aside>
<main id="main"><section id="projects"><header class="collection-top"><h1>Selected projects</h1><div class="filters" aria-label="Project category"><button data-filter="All" aria-pressed="true">All</button><button data-filter="Games" aria-pressed="false">Games</button><button data-filter="Software" aria-pressed="false">Software</button></div></header><div class="project-grid">${projects.slice(0,5).map(card).join('')}<article class="project rundori" data-category="Software"><div class="build-note"><span>Web application</span><h2><button data-open="rundori">Rundori</button></h2><p>Private receipts.<br>A complete staff workflow.</p><p class="build-tech">Next.js · Supabase · R2</p><button class="text-link" data-open="rundori">Inside the build ↗</button></div></article></div><section class="development"><p>Also in development</p><a href="https://github.com/medissl/lantern-lot" target="_blank" rel="noreferrer"><strong>Lantern Lot</strong><span>Secondhand-shop game · Early prototype</span><span aria-hidden="true">↗</span></a></section></section>
<section id="artwork" hidden><header class="collection-top"><h1>Artwork</h1><p>Drawings & studies</p></header><p class="art-intro">Digital illustration and drawings on paper.</p><div class="art-grid">${artwork.map(p=>`<article><button class="art-stage" data-open="${p.id}" aria-label="View ${escape(p.title)}">${img(p.image,p.title)}</button>${caption(p)}</article>`).join('')}</div></section>
<footer><p>Medianto Susilo</p><a href="mailto:mediantozeng@gmail.com">Get in touch ↗</a></footer></main>
<dialog aria-labelledby="detail-title"><div class="detail-bar"><p id="detail-kind">Project detail</p><button id="close-detail" autofocus>Close ×</button></div><div id="detail-content"></div></dialog>
<script>const items=${JSON.stringify([...projects,...artwork])};
const views=document.querySelectorAll('[data-view]');
function showView(){const view=location.hash==='#artwork'?'artwork':'projects';document.querySelector('#projects').hidden=view!=='projects';document.querySelector('#artwork').hidden=view!=='artwork';views.forEach(a=>{if(a.dataset.view===view)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current')});}
window.addEventListener('hashchange',showView);showView();
document.querySelectorAll('[data-filter]').forEach(button=>button.addEventListener('click',()=>{const kind=button.dataset.filter;document.querySelectorAll('[data-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));document.querySelectorAll('[data-category]').forEach(p=>p.hidden=kind!=='All'&&p.dataset.category!==kind);document.querySelector('.project-grid').classList.toggle('filtered',kind!=='All');}));
const dialog=document.querySelector('dialog');
document.querySelectorAll('[data-open]').forEach(button=>button.addEventListener('click',()=>{const p=items.find(p=>p.id===button.dataset.open);document.querySelector('#detail-content').innerHTML='<div class="detail-image '+(p.shape||'wide')+'"><img src="assets/'+p.image+'" alt="'+p.title+'"></div><section class="detail-copy"><p>'+p.type+'</p><h2 id="detail-title">'+p.title+'</h2><p class="description">'+p.text+'</p><dl><dt>My work</dt><dd>'+p.role+'</dd><dt>Built with</dt><dd>'+p.tech+'</dd></dl><ul>'+p.evidence.map(e=>'<li>'+e+'</li>').join('')+'</ul><a class="primary-link" href="'+(p.link||p.repo)+'" target="_blank" rel="noreferrer">'+(p.kind==='Artwork'?'View original artwork':'Open project')+' ↗</a></section>';document.querySelector('#detail-kind').textContent=p.kind==='Artwork'?'Artwork detail':'Project detail';if(p.kind==='Artwork'){document.querySelector('.detail-copy ul').remove();document.querySelector('.detail-copy dl').innerHTML='<dt>Medium</dt><dd>'+p.tech+'</dd>';}dialog.showModal();}));
document.querySelector('#close-detail').addEventListener('click',()=>dialog.close());
let frame=0;const frames=[['sakiko-menu.png','Main menu'],['sakiko-corridor-night.png','After everyone has gone'],['sakiko-classroom-day.png','Before the last bell']];
document.querySelector('#preview-next').addEventListener('click',()=>{frame=(frame+1)%frames.length;const image=document.querySelector('.sakiko .stage img');image.src='assets/'+frames[frame][0];image.alt='SAKIKO — '+frames[frame][1];document.querySelector('#preview-caption').textContent=frames[frame][1];});
</script></body></html>`;
fs.writeFileSync(path.join(root,'a-refined.html'),html);
console.log('Wrote refined A prototype with six projects and a separate three-piece artwork collection.');
