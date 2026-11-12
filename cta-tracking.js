/**
 * FPT Landing Page - CTA & Button Click Tracking
 * Chuẩn setup-tracking-cta-contact-va-form-ggsheet
 * Lưu vào Sheet 'Click CTA' và gửi email thông báo về havanvanpod@gmail.com
 * Tích hợp sẵn bộ kích hoạt Google Ads Conversion Tracking (Gọi điện, Zalo, CTA, Contact)
 */
(function() {
  'use strict';

  var lastClickTime = 0;
  var CLICK_THROTTLE_MS = 2500;

  function trackCtaClick(channel, label, targetUrl) {
    var now = Date.now();
    if (now - lastClickTime < CLICK_THROTTLE_MS) return;
    lastClickTime = now;

    // 1. Kích hoạt Google Ads Conversion (nếu đã cấu hình)
    if (window.triggerGoogleAdsConversion) {
      if (channel === 'phone') {
        window.triggerGoogleAdsConversion('phone', { label: label });
      } else if (channel === 'zalo') {
        window.triggerGoogleAdsConversion('zalo', { label: label });
      } else if (channel === 'form') {
        window.triggerGoogleAdsConversion('cta', { label: label });
      } else if (channel === 'contact') {
        window.triggerGoogleAdsConversion('contact', { label: label });
      }
    }

    // 2. Gửi dữ liệu về Google Apps Script & Google Sheet
    var t = window.FPT_TRACKING || {};
    if (t.isInternal) return; // Bỏ qua nếu nội bộ

    var webAppUrl = t.webAppUrl || 'https://script.google.com/macros/s/AKfycbzEmiAgZdEhE1JYaKJxRFijbfUA4h19JR7LyblBYYeppJNmRfElLUbvFMS8afYf3xg2Pg/exec';

    var pingUrl = webAppUrl + '?eventType=cta_click'
      + '&sessionId=' + encodeURIComponent(t.sessionId || '')
      + '&channel=' + encodeURIComponent(channel)
      + '&label=' + encodeURIComponent(label || channel)
      + '&targetUrl=' + encodeURIComponent(targetUrl || '')
      + '&trafficType=' + encodeURIComponent(t.trafficType || 'Direct')
      + '&device=' + encodeURIComponent(t.device || 'desktop')
      + '&ipAddress=' + encodeURIComponent(t.ipAddress || '');

    if (navigator.sendBeacon) {
      navigator.sendBeacon(pingUrl);
    } else {
      var img = new Image();
      img.src = pingUrl;
    }
  }

  // Lắng nghe sự kiện click toàn trang
  document.addEventListener('click', function(e) {
    // 1. Click Hotline (tel:)
    var phoneLink = e.target.closest('a[href^="tel:"]');
    if (phoneLink) {
      var phoneNum = phoneLink.getAttribute('href').replace('tel:', '').trim();
      var labelText = (phoneLink.textContent || phoneNum).trim();
      trackCtaClick('phone', 'Hotline ' + (labelText || '0378.760.348'), phoneLink.getAttribute('href'));
      return;
    }

    // 2. Click Zalo (zalo.me)
    var zaloLink = e.target.closest('a[href*="zalo.me"]');
    if (zaloLink) {
      trackCtaClick('zalo', 'Chat Zalo Tư Vấn', zaloLink.getAttribute('href'));
      return;
    }

    // 3. Click Floating contact pill (Nút liên hệ nhanh góc màn hình)
    var contactPill = e.target.closest('.fpt-contact-family-pill');
    if (contactPill && !contactPill.getAttribute('href')) {
      trackCtaClick('contact', 'Bấm nút contact nổi', window.location.href);
      return;
    }

    // 4. Click nút Mở form đăng ký / Nhận tư vấn (CTA)
    var formBtn = e.target.closest('button[data-cta="consultation"], a[data-register-plan], .fpt-lp-header-cta');
    if (formBtn) {
      var plan = formBtn.getAttribute('data-register-plan') || formBtn.getAttribute('data-plan') || '';
      var btnLabel = formBtn.textContent ? formBtn.textContent.trim().replace(/\s+/g, ' ') : 'Mở Form Đăng Ký';
      if (plan) {
        btnLabel += ' (' + plan + ')';
      }
      trackCtaClick('form', btnLabel, window.location.href);
      return;
    }
  }, true);

})();
