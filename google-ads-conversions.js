/**
 * FPT Landing Page - Google Ads Conversion Tracking Engine
 * Quản lý & kích hoạt 5 hành động chuyển đổi theo đúng chuẩn Google Ads:
 * 1. Hoàn tất form đăng ký (Chính - Primary)
 * 2. Click nút Zalo (Chính - Primary)
 * 3. Click nút gọi điện (Chính - Primary)
 * 4. Click nút CTA (Phụ - Secondary)
 * 5. Click nút contact (Phụ - Secondary)
 *
 * TÍNH NĂNG KHÓA 1 LẦN CHO MỖI NGƯỜI (Session Deduplication):
 * Đảm bảo mỗi khách hàng trong 1 phiên truy cập chỉ bắn sự kiện chuyển đổi đúng 1 lần duy nhất,
 * không bị tính trùng lặp khi khách bấm gọi hoặc bấm Zalo nhiều lần.
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

  // Hàm bắn sự kiện chuyển đổi dùng chung (Khóa chặt chỉ tính 1 lần cho mỗi khách)
  window.triggerGoogleAdsConversion = function(actionType, extraData) {
    if (!window.gtag || !GADS_CONFIG.tagId) return;

    // 1. Kiểm tra chống đếm trùng: Mỗi hành động chỉ bắn 1 lần / 1 khách trong 1 phiên
    try {
      var trackedMap = JSON.parse(sessionStorage.getItem('fpt_gads_conversions_counted') || '{}');
      if (trackedMap[actionType]) {
        console.log('[Google Ads] Đã ghi nhận chuyển đổi [' + actionType + '] cho khách này trước đó. Không đếm trùng lặp.');
        return;
      }
      trackedMap[actionType] = true;
      sessionStorage.setItem('fpt_gads_conversions_counted', JSON.stringify(trackedMap));
    } catch (e) {}

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
      console.log('[Google Ads Conversion Triggered (Count: 1)]:', actionType, sendTo);
    } catch (err) {
      console.warn('[Google Ads Conversion Error]:', err);
    }
  };

})();
