/**
 * FPT Landing Page - Google Ads Conversion Tracking Engine
 * Quản lý & kích hoạt 5 hành động chuyển đổi theo đúng chuẩn Google Ads:
 * 1. Hoàn tất form đăng ký (Chính - Primary)
 * 2. Click nút Zalo (Chính - Primary)
 * 3. Click nút gọi điện (Chính - Primary)
 * 4. Click nút CTA (Phụ - Secondary)
 * 5. Click nút contact (Phụ - Secondary)
 */
(function() {
  'use strict';

  // Cấu hình Google Ads Conversion Tags
  // Khi bạn có mã Google Tag (AW-...) và các Conversion Labels, chỉ cần điền vào đây:
  var GADS_CONFIG = window.GOOGLE_ADS_CONFIG || {
    tagId: '', // Ví dụ: 'AW-1040654903'
    labels: {
      phone: '',       // Click nút gọi điện (Chính)
      zalo: '',        // Click nút Zalo (Chính)
      formSubmit: '',  // Hoàn tất form đăng ký (Chính)
      cta: '',         // Click nút CTA (Phụ)
      contact: ''      // Click nút contact (Phụ)
    }
  };

  window.GOOGLE_ADS_CONFIG = GADS_CONFIG;

  // Tự động tải gtag.js nếu có tagId
  if (GADS_CONFIG.tagId) {
    var script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(GADS_CONFIG.tagId);
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    function gtag(){ window.dataLayer.push(arguments); }
    window.gtag = gtag;
    gtag('js', new Date());
    gtag('config', GADS_CONFIG.tagId);
  }

  // Hàm bắn sự kiện chuyển đổi dùng chung
  window.triggerGoogleAdsConversion = function(actionType, extraData) {
    if (!window.gtag || !GADS_CONFIG.tagId) return;

    var label = GADS_CONFIG.labels ? GADS_CONFIG.labels[actionType] : '';
    var sendTo = label ? (GADS_CONFIG.tagId + '/' + label) : GADS_CONFIG.tagId;

    var payload = {
      send_to: sendTo
    };

    if (actionType === 'formSubmit') {
      payload.value = (extraData && extraData.value) || 1.0;
      payload.currency = 'VND';
    }

    if (extraData && extraData.label) {
      payload.event_label = extraData.label;
    }

    try {
      window.gtag('event', 'conversion', payload);
      console.log('[Google Ads Conversion Triggered]:', actionType, sendTo);
    } catch (err) {
      console.warn('[Google Ads Conversion Error]:', err);
    }
  };

})();
