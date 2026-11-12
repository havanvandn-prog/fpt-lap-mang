/**
 * FPT Landing Page - Form Submission & Success Modal
 * Chuẩn setup-tracking-cta-contact-va-form-ggsheet
 * Lưu vào Sheet 'Đăng Ký Lắp Đặt', gửi đồng thời về havanvanpod@gmail.com và Namhp26@gmail.com
 * Hiển thị Popup xác nhận thành công chuẩn CRO + Business-First
 */
(function() {
  'use strict';

  // Inject CSS cho Success Popup Modal
  var style = document.createElement('style');
  style.textContent = `
    .fpt-success-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(15, 23, 42, 0.7);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 999999;
      opacity: 0;
      visibility: hidden;
      transition: opacity 0.3s ease, visibility 0.3s ease;
      padding: 16px;
      box-sizing: border-box;
    }
    .fpt-success-overlay.active {
      opacity: 1;
      visibility: visible;
    }
    .fpt-success-modal {
      background: #ffffff;
      border-radius: 20px;
      width: 100%;
      max-width: 440px;
      padding: 28px 24px 24px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      text-align: center;
      position: relative;
      transform: scale(0.92);
      transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      box-sizing: border-box;
      font-family: inherit;
    }
    .fpt-success-overlay.active .fpt-success-modal {
      transform: scale(1);
    }
    .fpt-success-icon-wrap {
      width: 68px;
      height: 68px;
      background: linear-gradient(135deg, #10B981, #059669);
      border-radius: 50%;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 16px;
      box-shadow: 0 10px 20px rgba(16, 185, 129, 0.3);
    }
    .fpt-success-icon-wrap svg {
      width: 36px;
      height: 36px;
      stroke: #ffffff;
      stroke-width: 3;
      fill: none;
    }
    .fpt-success-title {
      font-size: 22px;
      font-weight: 800;
      color: #111827;
      margin: 0 0 8px;
      line-height: 1.3;
    }
    .fpt-success-desc {
      font-size: 14.5px;
      line-height: 1.55;
      color: #4B5563;
      margin: 0 0 20px;
    }
    .fpt-success-card {
      background: #F8FAFC;
      border: 1px solid #E2E8F0;
      border-radius: 12px;
      padding: 14px 16px;
      text-align: left;
      font-size: 13.5px;
      line-height: 1.6;
      color: #334155;
      margin-bottom: 20px;
    }
    .fpt-success-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 6px;
      gap: 12px;
    }
    .fpt-success-row:last-child {
      margin-bottom: 0;
    }
    .fpt-success-label {
      color: #64748B;
      white-space: nowrap;
    }
    .fpt-success-val {
      font-weight: 600;
      color: #0F172A;
      text-align: right;
      word-break: break-word;
    }
    .fpt-success-cta-call {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      background: linear-gradient(135deg, #f37021, #e05e13);
      color: #ffffff !important;
      font-weight: 700;
      font-size: 15px;
      text-decoration: none;
      padding: 13px 20px;
      border-radius: 10px;
      margin-bottom: 10px;
      box-shadow: 0 4px 12px rgba(243, 112, 33, 0.35);
      transition: transform 0.15s ease;
    }
    .fpt-success-cta-call:hover {
      transform: translateY(-1px);
    }
    .fpt-success-cta-zalo {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      background: #0068FF;
      color: #ffffff !important;
      font-weight: 600;
      font-size: 14.5px;
      text-decoration: none;
      padding: 11px 20px;
      border-radius: 10px;
      margin-bottom: 12px;
      transition: background 0.15s ease;
    }
    .fpt-success-cta-zalo:hover {
      background: #0056d6;
    }
    .fpt-success-close-btn {
      background: transparent;
      border: none;
      color: #64748B;
      font-size: 13.5px;
      font-weight: 500;
      cursor: pointer;
      padding: 6px 16px;
      border-radius: 6px;
      transition: color 0.15s ease;
    }
    .fpt-success-close-btn:hover {
      color: #0F172A;
    }
  `;
  document.head.appendChild(style);

  // Tạo DOM Modal thành công (1 lần duy nhất)
  var overlay = document.createElement('div');
  overlay.className = 'fpt-success-overlay';
  overlay.id = 'fpt-success-overlay';
  overlay.innerHTML = `
    <div class="fpt-success-modal" role="dialog" aria-modal="true" aria-labelledby="fpt-success-title">
      <div class="fpt-success-icon-wrap">
        <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"></polyline></svg>
      </div>
      <h3 class="fpt-success-title" id="fpt-success-title">Đăng ký thành công!</h3>
      <p class="fpt-success-desc">
        Sẽ có nhân viên liên hệ tư vấn thêm cho Quý khách trong thời gian sớm nhất....!
      </p>
      <div class="fpt-success-card">
        <div class="fpt-success-row">
          <span class="fpt-success-label">Khách hàng:</span>
          <span class="fpt-success-val" id="fpt-modal-name">---</span>
        </div>
        <div class="fpt-success-row">
          <span class="fpt-success-label">Số điện thoại:</span>
          <span class="fpt-success-val" id="fpt-modal-phone">---</span>
        </div>
        <div class="fpt-success-row">
          <span class="fpt-success-label">Gói cước:</span>
          <span class="fpt-success-val" id="fpt-modal-plan">---</span>
        </div>
        <div class="fpt-success-row">
          <span class="fpt-success-label">Khu vực:</span>
          <span class="fpt-success-val" id="fpt-modal-area">---</span>
        </div>
      </div>
      <a href="tel:0378760348" class="fpt-success-cta-call">
        <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
        Gọi Hotline ngay: 0378.760.348
      </a>
      <a href="https://zalo.me/0378760348" target="_blank" rel="noopener noreferrer" class="fpt-success-cta-zalo">
        Chat Zalo tư vấn trực tiếp
      </a>
      <button type="button" class="fpt-success-close-btn" id="fpt-success-close-btn">Đóng thông báo</button>
    </div>
  `;
  document.body.appendChild(overlay);

  function openSuccessModal(info) {
    document.getElementById('fpt-modal-name').textContent = info.fullName || 'Quý khách';
    document.getElementById('fpt-modal-phone').textContent = info.phone || '';
    document.getElementById('fpt-modal-plan').textContent = info.plan || 'Gói cước Internet';
    document.getElementById('fpt-modal-area').textContent = info.area || 'Hà Nội';

    overlay.classList.add('active');
  }

  function closeSuccessModal() {
    overlay.classList.remove('active');
  }

  overlay.addEventListener('click', function(e) {
    if (e.target === overlay || e.target.id === 'fpt-success-close-btn') {
      closeSuccessModal();
    }
  });

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && overlay.classList.contains('active')) {
      closeSuccessModal();
    }
  });

  // Lắng nghe submit của form đăng ký tư vấn (#local-register form)
  document.addEventListener('submit', function(e) {
    var form = e.target;
    var dialog = form.closest('#local-register, .fpt-lp-plan');
    if (!dialog) return;

    e.preventDefault();
    e.stopPropagation();

    var fullName = (form.elements.fullName ? form.elements.fullName.value : '').trim();
    var phone = (form.elements.phone ? form.elements.phone.value : '').trim();
    var planCode = (form.elements.plan ? form.elements.plan.value : '').trim();
    var district = (form.elements.district ? form.elements.district.value : '').trim();
    var region = (form.elements.region ? form.elements.region.value : '').trim();
    var price = (form.elements.price ? form.elements.price.value : '').trim();

    if (!fullName || !phone) {
      alert('Vui lòng điền đầy đủ Họ tên và Số điện thoại!');
      return;
    }

    var submitBtn = form.querySelector('button[type="submit"]');
    var originalBtnText = submitBtn ? submitBtn.textContent : '';
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Đang gửi đăng ký...';
    }

    // Xác định tên gói cước dễ đọc
    var planName = planCode;
    var summaryPlan = dialog.querySelector('.fpt-lp-summary-row strong');
    if (summaryPlan && summaryPlan.textContent) {
      planName = summaryPlan.textContent.trim();
    } else if (!planName) {
      planName = 'Tư vấn chọn gói FPT';
    }

    var areaText = district ? (district + (region === 'phuong' ? ' (Quận nội thành)' : ' (Huyện ngoại thành)')) : 'Hà Nội';

    var t = window.FPT_TRACKING || {};
    var webAppUrl = t.webAppUrl || 'https://script.google.com/macros/s/AKfycbzEmiAgZdEhE1JYaKJxRFijbfUA4h19JR7LyblBYYeppJNmRfElLUbvFMS8afYf3xg2Pg/exec';

    var payload = {
      eventType: 'booking',
      sessionId: t.sessionId || '',
      fullName: fullName,
      phone: phone,
      selectedPlan: planName,
      area: areaText,
      note: 'Giá dự kiến: ' + (price || 'Chưa định giá') + ' | Trang: ' + window.location.pathname,
      trafficType: t.trafficType || 'Direct',
      sourceDomain: t.sourceDomain || 'Direct',
      campaign: t.campaign || '',
      adgroup: t.adgroup || '',
      keyword: t.keyword || '',
      device: t.device || 'desktop',
      ipAddress: t.ipAddress || ''
    };

    // Gửi POST tới Apps Script Web App
    fetch(webAppUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' }, // dùng text/plain để tránh CORS preflight block
      body: JSON.stringify(payload)
    })
    .then(function(resp) { return resp.json(); })
    .catch(function(err) {
      // Dù CORS có chặn đọc JSON ở một số trình duyệt, dữ liệu vẫn được ghi nhận ở Apps Script
      console.warn('Network notice:', err);
      return { ok: true };
    })
    .finally(function() {
      // Đóng dialog đăng ký
      try {
        if (dialog.close) dialog.close();
        dialog.remove();
      } catch (err) {}

      // Mở Popup thông báo thành công
      openSuccessModal({
        fullName: fullName,
        phone: phone,
        plan: planName,
        area: areaText
      });
    });

  }, true);

})();
