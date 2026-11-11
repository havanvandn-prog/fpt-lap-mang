/* Standalone asset mapping, navigation and local-only preview forms. */
(() => {
  const runtimeUrl = document.currentScript.src;
  const imageRetries=new WeakMap();
  const retryImage=image=>{
    if(!(image instanceof HTMLImageElement)||!image.getAttribute('src'))return;
    const count=imageRetries.get(image)||0;if(count>=2)return;
    const url=new URL(image.currentSrc||image.src,location.href);
    if(url.origin!==location.origin)return;
    imageRetries.set(image,count+1);
    setTimeout(()=>{
      const bust=value=>value.split(',').map(candidate=>{
        const [path,...size]=candidate.trim().split(/\s+/);if(!path)return candidate;
        const u=new URL(path,location.href);u.searchParams.set('_asset_retry',String(Date.now()));
        return u.pathname+u.search+(size.length?' '+size.join(' '):'');
      }).join(', ');
      image.closest('picture')?.querySelectorAll('source[srcset]').forEach(source=>source.srcset=bust(source.srcset));
      if(image.srcset)image.srcset=bust(image.srcset);
      image.src=bust(image.getAttribute('src'));
    },200*(count+1));
  };
  document.addEventListener('error',event=>retryImage(event.target),true);
  addEventListener('DOMContentLoaded',()=>{
    document.querySelectorAll('img').forEach(image=>{if(image.complete&&!image.naturalWidth)retryImage(image)});
  });
  const assetMap = window.__FPT_ASSET_MAP__ || {};
  const mapAsset = value => {
    if (!value) return value;
    if (assetMap[value]) return assetMap[value];
    return value.replace(/https?:\/\/[^\s"')]+/g, url => assetMap[url] || url);
  };
  const localize = element => {
    if (!element?.getAttribute || element.tagName === 'SCRIPT') return;
    for (const attr of ['src', 'srcset', 'poster', 'style']) {
      const value = element.getAttribute(attr), mapped = mapAsset(value);
      if (value && mapped !== value) element.setAttribute(attr, mapped);
    }
  };
  new MutationObserver(records => {
    for (const record of records) {
      if (record.type === 'attributes') localize(record.target);
      for (const node of record.addedNodes) {
        if (node.nodeType !== 1) continue;
        localize(node); node.querySelectorAll('img,source,video,[style]').forEach(localize);
      }
    }
  }).observe(document.documentElement, {subtree:true,childList:true,attributes:true,attributeFilter:['src','srcset','style','poster']});
  const routes = new Set(['/', '/vi', '/internet/ca-nhan', '/internet/gia-dinh', '/internet/lap-mang-fpt', '/internet/game-thu', '/internet/doanh-nghiep'].map(r => r === '/' ? '/fpt-lap-mang/' : '/fpt-lap-mang' + r));
  const contactPhone = '0962166512';
  const contactZalo = `https://zalo.me/${contactPhone}`;

  function mountFamilyContact() {
    if (!location.pathname.includes('lap-mang-fpt') && !location.pathname.includes('gia-dinh') && !location.pathname.endsWith('fpt-lap-mang') && !location.pathname.endsWith('fpt-lap-mang/')) return;

    const contact = document.createElement('nav');
    contact.className = 'fpt-lp-contact';
    contact.setAttribute('aria-label', 'Liên hệ lắp mạng FPT');
    contact.innerHTML = `
      <button type="button" class="fpt-lp-contact-toggle" aria-label="Liên hệ tư vấn"
        aria-expanded="false" aria-controls="fpt-lp-contact-channels">
        <svg class="fpt-lp-contact-open" width="26" height="26" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8z"/>
        </svg>
        <svg class="fpt-lp-contact-close" width="24" height="24" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
          <path d="m6 6 12 12M18 6 6 18"/>
        </svg>
      </button>
      <div id="fpt-lp-contact-channels" class="fpt-lp-contact-channels" hidden>
        <a href="tel:${contactPhone}" data-cta="call" data-cta-placement="floating-contact">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.9a2 2 0 0 1-.4 2.1L8.1 10a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.9.6 2.9.7a2 2 0 0 1 1.6 1.9z"/>
          </svg>
          Cuộc gọi
        </a>
        <a href="${contactZalo}" target="_blank" rel="noopener noreferrer"
          data-cta="zalo" data-cta-placement="floating-contact">
          <span class="fpt-lp-contact-zalo" aria-hidden="true">Z</span>
          Zalo
        </a>
      </div>`;

    const toggle = contact.querySelector('button');
    const channels = contact.querySelector('.fpt-lp-contact-channels');
    const setOpen = open => {
      channels.hidden = !open;
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Đóng lựa chọn liên hệ' : 'Liên hệ tư vấn');
    };

    toggle.addEventListener('click', event => {
      // This disclosure owns its state. The shared accordion listener on
      // document would otherwise toggle aria-expanded a second time.
      event.stopPropagation();
      setOpen(channels.hidden);
    });
    contact.addEventListener('focusout', event => {
      if (!contact.contains(event.relatedTarget)) setOpen(false);
    });
    channels.addEventListener('click', event => {
      if (!event.target.closest('a')) return;
      toggle.focus();
      setOpen(false);
    });
    document.addEventListener('pointerdown', event => {
      if (!channels.hidden && !contact.contains(event.target)) setOpen(false);
    });
    document.addEventListener('keydown', event => {
      if (event.key !== 'Escape' || channels.hidden) return;
      setOpen(false);
      toggle.focus();
    });
    document.body.append(contact);
  }
  // Product detail pages on fpt.vn/internet/{plan}, updated 11/11/2026 for Hanoi Xã vs Phường.
  const plans = {
    'goi-giga': {name:'Internet Giga', price_xa:'200.000', price_phuong:'255.000', price:'200.000', download:'300 Mbps', devices:10, mesh:0,
      usage:'Phù hợp cá nhân, hộ gia đình nhỏ với nhu cầu học tập, làm việc và giải trí cơ bản.'},
    'goi-giga-f1': {name:'Internet Giga F1', price_xa:'200.000', price_phuong:'255.000', price:'200.000', download:'300 Mbps', devices:10, mesh:1,
      usage:'Phù hợp cá nhân, cặp đôi hoặc gia đình nhỏ học, làm việc và giải trí tại nhà. Một thiết bị Mesh giúp mở rộng vùng phủ giữa các phòng.'},
    'goi-sky': {name:'Internet Sky', price_xa:'215.000', price_phuong:'265.000', price:'215.000', download:'1 Gbps', devices:15, mesh:0,
      usage:'Phù hợp gia đình thường xem video 4K, họp trực tuyến hoặc chơi game trên nhiều thiết bị.'},
    'goi-sky-f1': {name:'Internet Sky F1', price_xa:'235.000', price_phuong:'285.000', price:'235.000', download:'1 Gbps', devices:15, mesh:1,
      usage:'Phù hợp gia đình dùng mạng đồng thời để xem 4K, livestream hoặc họp video, cần mở rộng vùng phủ sang phòng hoặc tầng khác.'},
    'goi-sky-f2': {name:'Internet Sky F2', price_xa:'255.000', price_phuong:'305.000', price:'255.000', download:'1 Gbps', devices:25, mesh:2,
      usage:'Phù hợp gia đình có nhiều thiết bị và nhà nhiều phòng hoặc nhiều tầng. Hai thiết bị Mesh giúp mở rộng vùng phủ đến nhiều vị trí.'}
  };

  const hanoiDistrictsXa = [
    'Hoài Đức', 'Đan Phượng', 'Gia Lâm', 'Đông Anh', 'Thanh Trì', 'Sóc Sơn',
    'Mê Linh', 'Quốc Oai', 'Thạch Thất', 'Chương Mỹ', 'Thanh Oai', 'Thường Tín',
    'Phú Xuyên', 'Ứng Hòa', 'Mỹ Đức', 'Ba Vì', 'Sơn Tây'
  ];
  const hanoiDistrictsPhuong = [
    'Cầu Giấy', 'Nam Từ Liêm', 'Bắc Từ Liêm', 'Hà Đông', 'Thanh Xuân',
    'Đống Đa', 'Ba Đình', 'Hoàn Kiếm', 'Hai Bà Trưng', 'Hoàng Mai', 'Tây Hồ', 'Long Biên'
  ];

  function getLocationState() {
    try {
      if (sessionStorage.getItem('fpt_location_confirmed') === '1') {
        const district = sessionStorage.getItem('fpt_district');
        const region = sessionStorage.getItem('fpt_region');
        const districts = region === 'phuong' ? hanoiDistrictsPhuong : hanoiDistrictsXa;
        if (['xa', 'phuong'].includes(region) && districts.includes(district)) return { district, region };
      }
    } catch(e) {}
    return { district: '', region: '' };
  }

  function applyLocation(district, region) {
    try {
      sessionStorage.setItem('fpt_district', district);
      sessionStorage.setItem('fpt_region', region);
      sessionStorage.setItem('fpt_location_confirmed', '1');
    } catch(e) {}

    // Update location labels on page
    document.querySelectorAll('[data-location-label]').forEach(el => {
      el.textContent = `Hà Nội · ${district}`;
    });

    // Update hero price
    document.querySelectorAll('[data-hero-price]').forEach(el => {
      el.textContent = (region === 'phuong' ? '255.000' : '200.000') + 'đ';
    });

    // Update card prices
    document.querySelectorAll('[data-card-price]').forEach(el => {
      const val = region === 'phuong' ? el.dataset.pricePhuong : el.dataset.priceXa;
      if (val) el.textContent = val;
    });

    // Update card secondary notes
    document.querySelectorAll('.fpt-lp-price-note').forEach(el => {
      const val = region === 'phuong' ? el.dataset.notePhuong : el.dataset.noteXa;
      if (val) el.textContent = val;
    });

    // Update active memory plans
    for (const code in plans) {
      plans[code].price = region === 'phuong' ? plans[code].price_phuong : plans[code].price_xa;
    }
  }

  function openLocationDialog() {
    document.getElementById('fpt-location-modal')?.remove();
    const cur = getLocationState();
    let selectedDistrict = cur.district;
    let selectedRegion = cur.region;
    let activeTab = selectedRegion || 'xa';

    const dialog = document.createElement('dialog');
    dialog.id = 'fpt-location-modal';
    dialog.className = 'fpt-location-modal';
    dialog.innerHTML = `
      <div class="fpt-loc-header">
        <h3>Chọn địa chỉ lắp đặt</h3>
        <p>Bạn vui lòng chọn khu vực lắp đặt tại Hà Nội để cập nhật giá cước và ưu đãi chính xác nhất</p>
        <button type="button" class="fpt-loc-close" aria-label="Đóng">×</button>
      </div>
      <div class="fpt-loc-body">
        <div class="fpt-loc-city">
          <span class="fpt-loc-city-label">Tỉnh / Thành phố:</span>
          <span class="fpt-loc-city-badge">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></svg>
            TP. Hà Nội
          </span>
        </div>
        <div class="fpt-loc-tabs" role="tablist">
          <button type="button" class="fpt-loc-tab ${activeTab === 'xa' ? 'active' : ''}" data-tab="xa">
            <span>Huyện ngoại thành (Xã)</span>
            <small>Cước ưu đãi từ 200.000đ/tháng</small>
          </button>
          <button type="button" class="fpt-loc-tab ${activeTab === 'phuong' ? 'active' : ''}" data-tab="phuong">
            <span>Quận nội thành (Phường)</span>
            <small>Cước tiêu chuẩn từ 255.000đ/tháng</small>
          </button>
        </div>
        <div class="fpt-district-grid"></div>
      </div>
      <div class="fpt-loc-footer">
        <div class="fpt-loc-selected-info">
          Khu vực: <strong data-sel-name>${selectedDistrict ? `Hà Nội · ${selectedDistrict}` : 'Chưa chọn'}</strong>
        </div>
        <button type="button" class="fpt-loc-confirm" ${selectedDistrict ? '' : 'disabled'}>Xác nhận</button>
      </div>
    `;

    const grid = dialog.querySelector('.fpt-district-grid');
    const selName = dialog.querySelector('[data-sel-name]');
    const confirmBtn = dialog.querySelector('.fpt-loc-confirm');
    const tabs = dialog.querySelectorAll('.fpt-loc-tab');

    const renderDistricts = (tab) => {
      activeTab = tab;
      tabs.forEach(t => t.classList.toggle('active', t.dataset.tab === tab));
      grid.innerHTML = '';
      const list = tab === 'xa' ? hanoiDistrictsXa : hanoiDistrictsPhuong;
      list.forEach(dist => {
        const chip = document.createElement('button');
        chip.type = 'button';
        chip.className = 'fpt-district-chip' + (dist === selectedDistrict ? ' selected' : '');
        chip.textContent = dist;
        chip.onclick = () => {
          grid.querySelectorAll('.fpt-district-chip').forEach(c => c.classList.remove('selected'));
          chip.classList.add('selected');
          selectedDistrict = dist;
          selectedRegion = tab;
          selName.textContent = `Hà Nội · ${dist}`;
          confirmBtn.disabled = false;
        };
        grid.appendChild(chip);
      });
    };

    tabs.forEach(tabBtn => {
      tabBtn.onclick = () => renderDistricts(tabBtn.dataset.tab);
    });

    renderDistricts(activeTab);

    confirmBtn.onclick = () => {
      if (!selectedDistrict) return;
      applyLocation(selectedDistrict, selectedRegion);
      dialog.close();
    };

    dialog.querySelector('.fpt-loc-close').onclick = () => dialog.close();
    dialog.onclick = (e) => { if (e.target === dialog) dialog.close(); };
    dialog.addEventListener('close', () => dialog.remove());

    document.body.appendChild(dialog);
    dialog.showModal();
  }

  function openRegister(plan = '') {
    document.getElementById('local-register')?.remove();
    const cur = getLocationState();
    const planObj = plans[plan];
    const planName = planObj?.name || plan.replaceAll('-', ' ');
    const displayPrice = planObj ? (cur.district ? '' : 'từ ') + (cur.region === 'phuong' ? planObj.price_phuong : planObj.price_xa) + 'đ/tháng' : (cur.region === 'phuong' ? 'từ 255.000đ/tháng' : 'từ 200.000đ/tháng');
    const regionTitle = cur.region === 'phuong' ? 'Quận nội thành' : 'Huyện ngoại thành';

    const dialog = document.createElement('dialog');
    dialog.id = 'local-register';
    dialog.className = 'fpt-lp-plan';
    dialog.setAttribute('aria-labelledby', 'local-register-title');
    dialog.innerHTML = `
      <div class="fpt-lp-plan-head">
        <h2 id="local-register-title">Đăng ký tư vấn lắp đặt</h2>
        <button type="button" class="fpt-lp-plan-close" aria-label="Đóng">×</button>
      </div>
      <div class="fpt-lp-plan-body fpt-lp-plan-consult">
        <div class="fpt-lp-order-summary">
          <div class="fpt-lp-summary-row">
            <span>Gói cước đã chọn:</span>
            <strong>${planName}</strong>
          </div>
          <div class="fpt-lp-summary-row">
            <span>Khu vực lắp đặt:</span>
            <div>
              <strong>${cur.district ? `${cur.district}, Hà Nội (${regionTitle})` : 'Chưa chọn khu vực'}</strong>
              <button type="button" class="fpt-lp-change-loc">${cur.district ? 'Đổi' : 'Chọn khu vực'}</button>
            </div>
          </div>
          <div class="fpt-lp-summary-row fpt-lp-summary-price">
            <span>Cước ưu đãi áp dụng:</span>
            <strong>${displayPrice}</strong>
          </div>
        </div>
        <form>
          <label>Họ và tên *<input required name="fullName" autocomplete="name" placeholder="Nguyễn Văn A"></label>
          <label>Số điện thoại *<input required type="tel" inputmode="tel" autocomplete="tel" name="phone" pattern="[+]?[0-9]{9,15}" placeholder="0962166512"></label>
          <input type="hidden" name="plan" value="${plan}">
          <input type="hidden" name="district" value="${cur.district}">
          <input type="hidden" name="region" value="${cur.region}">
          <input type="hidden" name="price" value="${displayPrice}">
          <button type="submit" style="margin-top: 8px;">Nhận tư vấn ngay</button>
          <p>Bản xem thử: thông tin đã được kiểm tra trên trình duyệt, chưa gửi đăng ký.</p>
        </form>
      </div>
    `;

    dialog.querySelector('.fpt-lp-change-loc').onclick = () => {
      dialog.close();
      openLocationDialog();
    };

    dialog.querySelector('.fpt-lp-plan-close').onclick = () => dialog.close();
    dialog.onclick = (e) => { if (e.target === dialog) dialog.close(); };
    dialog.addEventListener('close', () => dialog.remove());

    document.body.appendChild(dialog);
    dialog.showModal();
  }

  addEventListener('DOMContentLoaded', () => {
    mountFamilyContact();
    const cur = getLocationState();
    if (cur.district) applyLocation(cur.district, cur.region);
    else document.querySelectorAll('[data-location-label]').forEach(el => {
      el.textContent = 'Chọn khu vực';
    });

    const header = document.querySelector('header');
    const nav = document.createElement('nav');
    nav.className = 'landing-compact-nav';
    nav.setAttribute('aria-label', 'Các mục trên trang');
    const isLapMang = location.pathname.includes('/lap-mang-fpt') || !!document.getElementById('bang-gia');
    if (isLapMang) {
      const sectionNav = [
        {label: 'Ưu đãi', href: '#uu-dai'},
        {label: 'Bảng giá', href: '#bang-gia'},
        {label: 'Gợi ý chọn gói', href: '#chon-goi'},
        {label: 'Câu hỏi thường gặp', href: '#faq'}
      ];
      sectionNav.forEach(item => {
        const a = document.createElement('a');
        a.href = item.href;
        a.textContent = item.label;
        nav.append(a);
      });
    }
    header?.append(nav);

    document.querySelectorAll('[data-slot="carousel-item"] a[data-register-plan]').forEach(anchor => {
      const plan = plans[anchor.dataset.registerPlan];
      if (!plan) return;
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'fpt-lp-detail-trigger';
      button.dataset.planDetails = anchor.dataset.registerPlan;
      button.setAttribute('aria-haspopup', 'dialog');
      button.setAttribute('aria-label', 'Xem chi tiết ' + plan.name);
      button.textContent = 'Xem chi tiết';
      anchor.after(button);
    });

    document.querySelector('[data-sp-area="nav_bottom"]')?.parentElement.remove();
  });

  const registerFields = `
    <label>Họ và tên *<input required name="fullName" autocomplete="name" placeholder="Nguyễn Văn A"></label>
    <label>Số điện thoại *<input required type="tel" inputmode="tel" autocomplete="tel" name="phone" pattern="[+]?[0-9]{9,15}" placeholder="0962166512"></label>
    <button type="submit" style="margin-top: 8px;">Nhận tư vấn ngay</button>
    <p>Bản xem thử: thông tin đã được kiểm tra trên trình duyệt, chưa gửi đăng ký.</p>`;

  document.addEventListener('click', event => {
    const locTrigger = event.target.closest('[data-select-location], button[aria-label="Chọn vị trí"]');
    if (locTrigger) {
      event.preventDefault();
      event.stopPropagation();
      openLocationDialog();
      return;
    }

    const regAnchor = event.target.closest('a[data-register-plan]');
    if (regAnchor) {
      event.preventDefault();
      event.stopPropagation();
      openRegister(regAnchor.dataset.registerPlan);
      return;
    }

    const ctaBtn = event.target.closest('[data-cta="consultation"]:not([data-section="plan-details"])');
    if (ctaBtn) {
      event.preventDefault();
      event.stopPropagation();
      openRegister(ctaBtn.dataset.plan || '');
      return;
    }

    const detailBtn = event.target.closest('button[data-plan-details]');
    if (detailBtn) {
      event.preventDefault();
      event.stopPropagation();
      openPlanDetails(detailBtn);
      return;
    }
  }, true);

  function openPlanDetails(trigger) {
    const code=trigger.dataset.planDetails;
    const plan=plans[code];
    if(!plan||document.getElementById('fpt-plan-details'))return;
    const dialog=document.createElement('dialog');
    dialog.id='fpt-plan-details';
    dialog.className='fpt-lp-plan';
    dialog.setAttribute('aria-labelledby','fpt-plan-title');
    dialog.innerHTML=`
      <div class="fpt-lp-plan-head">
        <div><p>Thông tin gói cước</p><h2 id="fpt-plan-title">${plan.name}</h2></div>
        <div class="fpt-lp-plan-actions">
          <button type="button" class="fpt-lp-plan-cta" data-cta="consultation" data-section="plan-details" data-plan="${code}">Đăng ký gói này</button>
          <button type="button" class="fpt-lp-plan-close" aria-label="Đóng thông tin gói" autofocus>×</button>
        </div>
      </div>
      <div class="fpt-lp-plan-body">
        <div class="fpt-lp-plan-detail">
          <iframe class="fpt-lp-plan-frame" src="${new URL(`plan-content/${code}.html?v=plan-register-2`, runtimeUrl).href}" title="Chi tiết ${plan.name}"></iframe>
        </div>
        <div class="fpt-lp-plan-consult" hidden>
          <button type="button" class="fpt-lp-plan-back">← Quay lại thông tin gói</button>
          <h3>Đăng ký tư vấn</h3>
          <p>Gói đã chọn: <strong>${plan.name}</strong></p>
          <form data-plan="${code}">${registerFields}</form>
        </div>
      </div>`;
    const detail=dialog.querySelector('.fpt-lp-plan-detail');
    const frame=detail.querySelector('iframe');
    frame.addEventListener('load',()=>{
      const price=frame.contentDocument?.querySelector('[data-sp-area="product_info"][data-sp-extra*="price_"]');
      if(price)price.textContent=plan.price+'đ';
    });
    const consult=dialog.querySelector('.fpt-lp-plan-consult');
    const body=dialog.querySelector('.fpt-lp-plan-body');
    const cta=dialog.querySelector('.fpt-lp-plan-cta');
    consult.querySelector('form').addEventListener('submit',event=>event.preventDefault());
    let detailScroll=0;
    const showConsultation=()=>{
      detailScroll=body.scrollTop;
      detail.hidden=true;cta.hidden=true;consult.hidden=false;
      body.scrollTop=0;
      consult.querySelector('input').focus({preventScroll:true});
    };
    cta.onclick=showConsultation;
    const onPlanMessage=event=>{
      if(event.origin===location.origin && event.source===frame.contentWindow &&
        event.data?.type==='fpt-plan-register' && event.data.code===code)showConsultation();
    };
    window.addEventListener('message',onPlanMessage);
    dialog.addEventListener('close',()=>window.removeEventListener('message',onPlanMessage),{once:true});
    dialog.querySelector('.fpt-lp-plan-back').onclick=()=>{
      consult.hidden=true;detail.hidden=false;cta.hidden=false;
      body.scrollTop=detailScroll;
      cta.focus({preventScroll:true});
    };
    dialog.querySelector('.fpt-lp-plan-close').onclick=()=>dialog.close();
    dialog.addEventListener('close',()=>{
      document.documentElement.classList.remove('fpt-lp-plan-open');
      dialog.remove();
      trigger.focus({preventScroll:true});
    },{once:true});
    document.body.append(dialog);
    document.documentElement.classList.add('fpt-lp-plan-open');
    dialog.showModal();
  }
})();
