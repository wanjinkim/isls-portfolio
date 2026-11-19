(()=>{

 const dialog=document.getElementById('project-dialog'),scroll=dialog.querySelector('.project-dialog-scroll');

 const store=document.getElementById('evidence-store'),printHost=document.getElementById('print-details');

 const groups=[...store.querySelectorAll(':scope > .evidence-group')];

 const cards=[...document.querySelectorAll('[data-open-project]')];

 const content=document.getElementById('project-evidence'),search=document.getElementById('case-search'),status=document.getElementById('case-search-status');

 const projects=window.portfolioProjects;

 const overview=document.getElementById('project-overview'),cover=document.getElementById('modal-cover');

 const meta=dialog.querySelector('.modal-meta'),jump=document.getElementById('jump-to-cases');

 const caseHeading=document.getElementById('project-cases-title');

 let current=0,opener=null,printing=false,printState=null;

 const title=document.getElementById('project-dialog-title');

 const searchStates=new Map();

 const resetSearch=()=>{search.value='';status.textContent='';searchStates.forEach((open,d)=>d.open=open);searchStates.clear();groups.forEach(g=>{g.hidden=false;g.querySelectorAll('.case-entry').forEach(d=>d.hidden=false)})};

 function parkGroups(){for(const g of groups)store.append(g)}

 function populate(index){

  current=index;const p=projects[current];

  resetSearch();parkGroups();

  title.textContent=p.title;document.getElementById('modal-subtitle').textContent=p.subtitle;

  const shared=p.key.startsWith('shared');

  dialog.dataset.project=p.key;

  overview.hidden=cover.hidden=meta.hidden=jump.hidden=shared;

  caseHeading.textContent=shared?'공통 구현 사례':'구현과 검증';

  cover.replaceChildren();

  if(!shared){

   document.getElementById('related-transfer').href=p.key==='interm'?'#birdview-child-control':'#controller-file-transfer';

   cover.append(document.getElementById('cover-'+p.key).content.cloneNode(true));

   document.getElementById('modal-overview').textContent=p.overview;

   document.getElementById('modal-problem').textContent=p.problem;

   document.getElementById('modal-product').textContent=p.product;

   const stack=document.getElementById('modal-stack');

   stack.replaceChildren();

   for(const text of p.skills){

    const li=document.createElement('li');

    li.className='chip';

    li.textContent=text;

    stack.append(li);

   }

  }

  const selectedGroups=p.key==='shared'

   ?groups.filter(group=>group.dataset.project.startsWith('shared-'))

   :groups.filter(group=>group.dataset.project===p.key);

  content.append(...selectedGroups);

  dialog.classList.toggle('shows-all-topics',p.key==='shared');

 }

 function replaceHash(hash){try{history.replaceState(null,'',hash)}catch{}}

 function openProject(index,from=null,updateHash=true){

  if(from)opener=from;populate(index);

  if(!dialog.open)dialog.showModal();document.documentElement.classList.add('has-project');

  scroll.scrollTop=0;requestAnimationFrame(()=>scroll.scrollTop=0);

  if(updateHash)replaceHash('#project-'+projects[current].key);

  document.getElementById('project-close').focus({preventScroll:true});

 }

 function closeProject(){if(dialog.open)dialog.close()}

 cards.forEach(card=>card.addEventListener('click',()=>openProject(Number(card.dataset.openProject),card)));

 jump.addEventListener('click',()=>{

  caseHeading.focus({preventScroll:true});

  caseHeading.scrollIntoView({block:'start'});

 });

 document.getElementById('project-close').addEventListener('click',closeProject);

 dialog.addEventListener('close',()=>{

  if(printing||dialog.open)return;

  document.documentElement.classList.remove('has-project');resetSearch();parkGroups();

  const section=opener?.closest('section[id]')?.id;

  const fallback=projects[current].key.startsWith('shared')?'engineering-cases':'projects';

  replaceHash('#'+(section||fallback));

  opener?.focus({preventScroll:true});

 });

 dialog.addEventListener('click',e=>{if(e.target!==dialog)return;const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeProject()});

 search.addEventListener('input',()=>{

  const q=search.value.trim().toLocaleLowerCase();let count=0;

  for(const group of content.querySelectorAll('.evidence-group')){

   let groupCount=0;

   for(const wrapper of group.querySelectorAll('.case-entry')){

    const match=!q||wrapper.textContent.toLocaleLowerCase().includes(q);wrapper.hidden=!match;

    if(q&&match&&wrapper.matches('details')){if(!searchStates.has(wrapper))searchStates.set(wrapper,wrapper.open);wrapper.open=true}

    if(!q&&searchStates.has(wrapper)){wrapper.open=searchStates.get(wrapper);searchStates.delete(wrapper)}

    if(match){count++;groupCount++}

   }group.hidden=groupCount===0;

  }status.textContent=q?count+'개 내용이 검색되었습니다.':'';

 });

 function followCaseHash(hash){

  const id=decodeURIComponent(hash.replace(/^#/,''));

  const pidx=projects.findIndex(p=>'project-'+p.key===id);

  if(pidx>=0){openProject(pidx,null,false);return true}

  const target=document.getElementById(id);const article=target?.closest('article.case');

  if(!article)return false;

  const group=article.closest('.evidence-group');

  const index=projects.findIndex(p=>p.key===group?.dataset.project);

  if(index<0)return false;

  if(!dialog.open||current!==index)openProject(index,null,false);

  resetSearch();

  let ancestor=target.parentElement;while(ancestor&&ancestor!==dialog){if(ancestor.tagName==='DETAILS')ancestor.open=true;ancestor=ancestor.parentElement}

  requestAnimationFrame(()=>target.scrollIntoView({behavior:'auto',block:'start'}));return true;

 }

 document.addEventListener('click',e=>{const a=e.target.closest('a[href^="#"]');if(!a)return;const hash=a.getAttribute('href');if(followCaseHash(hash)){e.preventDefault();replaceHash(hash)}});

 window.addEventListener('hashchange',()=>followCaseHash(location.hash));

 if(location.hash)followCaseHash(location.hash);

 const motion=matchMedia('(prefers-reduced-motion: reduce)');

 if('IntersectionObserver' in window){const observer=new IntersectionObserver(entries=>{for(const item of entries){if(!item.isIntersecting)continue;if(!motion.matches)item.target.querySelectorAll('.metric-bar').forEach((bar,i)=>bar.animate([{transform:'scaleX(0)'},{transform:'scaleX(1)'}],{duration:1150,delay:i*130,easing:'cubic-bezier(0.16, 1, 0.3, 1)',fill:'backwards'}));observer.unobserve(item.target)}},{threshold:.2});document.querySelectorAll('.metric-chart').forEach(x=>observer.observe(x))}

 motion.addEventListener('change',e=>{if(e.matches)document.getAnimations().forEach(a=>a.cancel())});

 document.querySelectorAll('.process-flow').forEach(flow=>flow.style.setProperty('--steps',flow.children.length));

 function preparePrint(){

  if(printing)return;printing=true;

  printState={open:dialog.open,index:current,scrollTop:scroll.scrollTop,details:[...document.querySelectorAll('.case-disclosure,article.case details')].map(d=>({d,open:d.open}))};

  closeProject();document.documentElement.classList.remove('has-project');resetSearch();parkGroups();

  for(const group of groups)printHost.append(group);

  document.querySelectorAll('.case-disclosure,article.case details').forEach(d=>{d.hidden=false;d.open=true});

  document.getAnimations().forEach(a=>{try{a.finish()}catch{a.cancel()}});

 }

 function finishPrint(){

  if(!printing)return;const previous=printState;

  parkGroups();previous.details.forEach(x=>x.d.open=x.open);printing=false;printState=null;

  if(previous.open){

   openProject(previous.index,null,false);

   requestAnimationFrame(()=>scroll.scrollTop=previous.scrollTop);

  }

 }

 document.querySelector('[data-print]').addEventListener('click',()=>{preparePrint();window.print();finishPrint()});

 window.addEventListener('beforeprint',preparePrint);window.addEventListener('afterprint',finishPrint);

})();

