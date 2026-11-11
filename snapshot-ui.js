/* Standalone interactions for the captured FPT frontend. */
(() => {
  // Landing scope: discard cards/sections whose outbound links were removed,
  // before measuring carousel slide widths.
  if(document.querySelector('link[href="/fpt-lap-mang/landing.css"]')){
    document.querySelectorAll('h2').forEach(h=>{
      if(h.textContent.trim().startsWith('FPT Play - Gói xem truyền hình'))h.parentElement.remove();
    });
    document.querySelectorAll('[data-slot="carousel"]').forEach(root=>{
      root.querySelectorAll('[data-slot="carousel-item"]').forEach(item=>{
        if(!item.textContent.trim()&&!item.querySelector('img,video,svg'))item.remove();
      });
      const count=root.querySelectorAll('[data-slot="carousel-item"]').length;
      root.querySelectorAll('button[aria-label^="Go to slide"]').forEach((button,i)=>{if(i>=count)button.remove()});
      if(!count){const section=root.closest('.container');(section||root).remove()}
    });
  }
  const templates=window.__FPT_UI_TEMPLATES__||{};
  const closedHeader=()=>templates.headerClosed||document.querySelector('header')?.outerHTML;
  let currentMenu='';
  const bottomNav=document.querySelector('[data-sp-area="nav_bottom"]')?.parentElement;
  if(bottomNav){
    const syncBottomNav=()=>{
      const visible=innerWidth<=768&&scrollY>=500;
      bottomNav.className=(visible?'animate-slideInBottom fixed right-0 bottom-0 left-0':'hidden')+' z-30 flex h-[78px] items-center justify-center gap-x-3 bg-white shadow-md';
    };
    addEventListener('scroll',syncBottomNav,{passive:true});
    addEventListener('resize',syncBottomNav);syncBottomNav();
  }
  function dismissCookieBanner(button){
    let element=button;
    while(element&&element!==document.body){
      if(getComputedStyle(element).position==='fixed'&&/cookie/i.test(element.textContent)){
        element.remove();localStorage.setItem('fpt-clone-cookie-choice',button.textContent.trim());return true;
      }
      element=element.parentElement;
    }
    return false;
  }
  if(localStorage.getItem('fpt-clone-cookie-choice')){
    const button=[...document.querySelectorAll('button')].find(b=>b.textContent.trim()==='Không, cảm ơn');
    if(button)dismissCookieBanner(button);
  }
  const swapHeader=(html,state='')=>{
    const old=document.querySelector('header');if(!old||!html)return;
    const tpl=document.createElement('template');tpl.innerHTML=html;
    old.replaceWith(tpl.content);currentMenu=state;
  };
  document.addEventListener('pointerover',e=>{
    if(innerWidth<1024)return;
    const button=e.target.closest('header nav button');if(!button)return;
    const name=button.textContent.trim();
    if(templates[name]&&currentMenu!==name)swapHeader(templates[name],name);
  });
  document.addEventListener('pointerout',e=>{
    if(innerWidth<1024||!currentMenu||currentMenu==='mobile')return;
    const header=document.querySelector('header');
    if(header?.contains(e.target)&&!header.contains(e.relatedTarget))swapHeader(closedHeader());
  });
  document.addEventListener('keydown',e=>{
    if(e.key==='Escape'){if(currentMenu)swapHeader(closedHeader());document.querySelector('[data-local-location]')?.remove();document.body.style.overflow='';}
  });

  const carousels=new Map();
  const carouselEngines=new Map();
  const inView=new IntersectionObserver(entries=>{
    for(const entry of entries){
      if(!entry.isIntersecting)continue;
      entry.target.classList.add('carousel-in-view');
      inView.unobserve(entry.target);
    }
  },{threshold:0.1});
  function updateCarousel(root,index){
    carouselEngines.get(root)?.scrollTo(index);
  }
  function syncCarousel(root,api){
    const index=api.selectedScrollSnap();
    root.querySelectorAll('button[aria-label^="Go to slide"]').forEach((b,i)=>{
      const d=b.firstElementChild;if(!d)return;
      d.className=d.className.replace(/\bw-6\b|\bmd:w-8\b|\bbg-white(?:\/20)?\b/g,'').trim()+(i===index?' w-6 bg-white md:w-8':' bg-white/20');
    });
    const prev=root.querySelector(':scope > button');
    const next=prev?.nextElementSibling;
    if(prev?.tagName==='BUTTON')prev.disabled=!api.canScrollPrev();
    if(next?.tagName==='BUTTON')next.disabled=!api.canScrollNext();
    carousels.set(root,index);
  }
  document.querySelectorAll('[data-slot="carousel"]').forEach(root=>{
    const viewport=root.querySelector(':scope > [data-slot="carousel-content"]');
    const track=viewport?.firstElementChild;
    if(!track||!window.FptCarouselEngine)return;
    track.style.transition='none';track.style.removeProperty('transform');
    [...track.children].forEach(item=>{item.style.removeProperty('transform');item.style.willChange='auto'});
    viewport.style.touchAction='pan-y pinch-zoom';viewport.style.cursor='grab';
    viewport.querySelectorAll('img').forEach(img=>{img.draggable=false});
    const banner=!!root.querySelector('button[aria-label^="Go to slide"]');
    const api=window.FptCarouselEngine(viewport,banner?{align:'center',loop:true}:{align:'start',loop:false,breakpoints:{'(max-width: 768px)':{align:'center'}}});
    root.fptCarouselApi=api;carouselEngines.set(root,api);
    let press=null;
    viewport.addEventListener('pointerdown',event=>{press={x:event.clientX,y:event.clientY};root.fptPreventClickUntil=0},{passive:true});
    viewport.addEventListener('pointermove',event=>{
      if(!press||(!event.buttons&&event.pointerType==='mouse'))return;
      const dx=Math.abs(event.clientX-press.x),dy=Math.abs(event.clientY-press.y);
      if(dx>10&&dx>dy)root.fptPreventClickUntil=performance.now()+500;
    },{passive:true});
    addEventListener('pointerup',()=>{press=null},{passive:true});
    addEventListener('pointercancel',()=>{press=null},{passive:true});
    api.on('select',()=>syncCarousel(root,api)).on('reInit',()=>syncCarousel(root,api));
    api.on('pointerDown',()=>{viewport.style.cursor='grabbing'}).on('pointerUp',()=>{viewport.style.cursor='grab'});
    viewport.addEventListener('dragstart',event=>event.preventDefault());
    root.addEventListener('keydown',event=>{
      if(event.target.closest('input,textarea,select'))return;
      if(event.key==='ArrowLeft'){event.preventDefault();api.scrollPrev()}
      if(event.key==='ArrowRight'){event.preventDefault();api.scrollNext()}
    });
    syncCarousel(root,api);
    if(track)inView.observe(track);
    if(banner){
      const advance=()=>{if(!document.hidden)api.scrollNext()};
      let timer=setInterval(advance,7000);
      root.addEventListener('mouseenter',()=>clearInterval(timer));
      root.addEventListener('mouseleave',()=>{clearInterval(timer);timer=setInterval(advance,7000)});
      api.on('pointerDown',()=>clearInterval(timer));
    }
  });
  let previousLayoutWidth=innerWidth;
  addEventListener('resize',()=>{
    // Chromium emits a resize during captureBeyondViewport even when the
    // layout width is unchanged. Rebuilding every carousel at that point
    // invalidates image layers while the screenshot is being painted.
    if(innerWidth===previousLayoutWidth)return;
    previousLayoutWidth=innerWidth;
    // The original engine observes resize and preserves the selected slide.
    document.querySelectorAll('[class*="PageContent_pageContent"].overflow-y-hidden').forEach(e=>{if(e.dataset.expanded!=='true')e.style.height=innerWidth<=768?'200px':'320px'});
  });
  document.querySelectorAll('[class*="PageContent_pageContent"].overflow-y-hidden').forEach(e=>e.style.height=innerWidth<=768?'200px':'320px');
  document.querySelectorAll('main button[aria-controls]').forEach(b=>{const panel=document.getElementById(b.getAttribute('aria-controls'));if(panel){panel.hidden=true;panel.dataset.state='closed';b.setAttribute('aria-expanded','false');b.dataset.state='closed'}});
  document.querySelectorAll('.slider-viewport,.sv').forEach(viewport=>{
    viewport.style.overflowX='auto';viewport.style.scrollbarWidth='none';
    const track=viewport.firstElementChild;if(track){track.style.transform='translate3d(0,0,0)';track.style.removeProperty('will-change')}
  });

  function locationDialog(){
    if(!templates.locationDialog)return;
    const overlay=document.createElement('div');overlay.dataset.localLocation='';
    overlay.style.cssText='position:fixed;inset:0;z-index:100;background:#0008';
    overlay.innerHTML=templates.locationDialog;
    const dialog=overlay.querySelector('[role=dialog]');
    if(dialog){dialog.style.zIndex='101';dialog.dataset.state='open'}
    overlay.addEventListener('click',e=>{if(e.target===overlay||e.target.closest('button[aria-label="Close"],button[data-slot="dialog-close"]')){overlay.remove();document.body.style.overflow=''}});
    document.body.append(overlay);document.body.style.overflow='hidden';
    const fixture=(window.__FPT_API_FIXTURES__||[]).find(f=>f.url.includes('/locations/provinces/list'));
    let list=fixture?.data?.data;list=Array.isArray(list)?list:list?.items||list?.data||[];
    dialog?.addEventListener('click',e=>{
      const button=e.target.closest('button');if(!button)return;
      if(/Chọn tỉnh|Chọn thành phố|Tỉnh\/Thành|Chọn vị trí/i.test(button.textContent)){
        overlay.querySelector('[data-province-options]')?.remove();
        const options=document.createElement('div');options.dataset.provinceOptions='';options.style.cssText='max-height:280px;overflow:auto;border:1px solid #ddd;background:white;border-radius:8px;padding:8px;margin-top:8px';
        list.forEach(item=>{const name=item.name||item.province_name||item.title;if(!name)return;const row=document.createElement('button');row.type='button';row.textContent=name;row.style.cssText='display:block;width:100%;padding:9px;text-align:left';row.onclick=()=>{document.querySelectorAll('header button').forEach(b=>{if(b.textContent.trim()==='Chọn vị trí')b.querySelector('p')?b.querySelector('p').textContent=name:b.textContent=name});const status=document.querySelector('[data-location-status]');if(status){status.textContent='Khu vực đã chọn: '+name+'. Liên hệ tư vấn để xác nhận giá theo địa chỉ.';status.hidden=false}overlay.remove();document.body.style.overflow=''};options.append(row)});
        button.after(options);
      }
    });
  }
  document.addEventListener('click',e=>{
    const button=e.target.closest('button');if(!button)return;
    if(['Không, cảm ơn','Đồng ý'].includes(button.textContent.trim())&&dismissCookieBanner(button))return;
    if(button.matches('[aria-label="Toggle menu"]')){
      swapHeader(currentMenu==='mobile'?closedHeader():templates.headerMobileOpen,currentMenu==='mobile'?'':'mobile');return;
    }
    if(button.hasAttribute('data-select-location')||button.textContent.trim()==='Chọn vị trí'){locationDialog();return}
    if(button.closest('#mobile-menu')&&templates.mobilePanels?.[button.textContent.trim()]){
      const id=button.getAttribute('aria-controls');
      let panel=document.getElementById(id);
      const open=button.getAttribute('aria-expanded')!=='true';
      if(open){
        const tpl=document.createElement('template');tpl.innerHTML=templates.mobilePanels[button.textContent.trim()];
        const replacement=tpl.content.firstElementChild;replacement.id=id;
        if(panel)panel.replaceWith(replacement);else button.parentElement.after(replacement);
        panel=replacement;panel.hidden=false;panel.dataset.state='open';panel.style.height='auto';
      }else if(panel){panel.hidden=true;panel.dataset.state='closed'}
      button.setAttribute('aria-expanded',String(open));button.dataset.state=open?'open':'closed';return;
    }
    const carousel=button.closest('[data-slot="carousel"]');
    if(carousel){
      const label=button.getAttribute('aria-label')||button.textContent.trim();
      const number=label.match(/Go to slide (\d+)/);
      if(number)updateCarousel(carousel,Number(number[1])-1);
      else if(/Next slide/.test(label))updateCarousel(carousel,(carousels.get(carousel)||0)+1);
      else if(/Previous slide/.test(label))updateCarousel(carousel,(carousels.get(carousel)||0)-1);
    }
    const controls=button.getAttribute('aria-controls');
    const panel=controls&&document.getElementById(controls);
    if(panel&&button.hasAttribute('aria-expanded')&&!button.closest('header')){
      const open=button.getAttribute('aria-expanded')!=='true';button.setAttribute('aria-expanded',String(open));button.dataset.state=open?'open':'closed';panel.hidden=!open;panel.dataset.state=open?'open':'closed';
      panel.style.height=open?'auto':'';
    }
    if(/^(Xem thêm|Thu gọn)$/.test(button.textContent.trim())){
      const section=button.closest('[data-sp-area]')?.parentElement?.closest('[data-sp-area]')||button.closest('[data-sp-area]');
      const content=section?.querySelector('[class*="PageContent_pageContent"]');
      if(content){const open=content.dataset.expanded!=='true';content.dataset.expanded=String(open);content.style.height=open?'auto':innerWidth<=768?'200px':'320px';button.childNodes.forEach(n=>{if(n.nodeType===3)n.textContent=open?'Thu gọn':'Xem thêm'});const wrap=button.parentElement;wrap.style.position=open?'static':'absolute';wrap.style.paddingTop=open?'16px':'113px'}
    }
    if(button.closest('header')&&templates[button.textContent.trim()]&&innerWidth>=1024)swapHeader(templates[button.textContent.trim()],button.textContent.trim());
  });
})();
