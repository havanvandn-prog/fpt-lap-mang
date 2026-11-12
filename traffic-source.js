/**
 * FPT Landing Page - Traffic Source & Session Tracking
 * Chuẩn setup-tracking-cta-contact-va-form-ggsheet
 */
(function() {
  'use strict';

  var WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbzEmiAgZdEhE1JYaKJxRFijbfUA4h19JR7LyblBYYeppJNmRfElLUbvFMS8afYf3xg2Pg/exec';

  // 1. Kiểm tra tham số nội bộ ?internal=1 hoặc ?internal=0
  var urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('internal') === '1') {
    localStorage.setItem('fpt_internal_traffic', '1');
    console.log('[FPT Tracking] Chế độ xem nội bộ: BẬT (Không ghi dữ liệu tracking)');
  } else if (urlParams.get('internal') === '0') {
    localStorage.removeItem('fpt_internal_traffic');
    console.log('[FPT Tracking] Chế độ xem nội bộ: TẮT (Ghi dữ liệu bình thường)');
  }

  var isInternal = localStorage.getItem('fpt_internal_traffic') === '1';

  // 2. Nhận diện thiết bị
  function getDeviceType() {
    var ua = navigator.userAgent || '';
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) return 'tablet';
    if (/Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Kindle|NetFront|Silk-Accelerated|(hpw|web)OS|Fennec|Minimo|Opera M(obi|ini)|Blazer/i.test(ua)) return 'mobile';
    return 'desktop';
  }

  // 3. Phân loại nguồn truy cập
  function parseTrafficSource() {
    var p = urlParams;
    var ref = document.referrer || '';
    var refLower = ref.toLowerCase();

    var gclid = p.get('gclid') || p.get('gbraid') || p.get('wbraid');
    var fbclid = p.get('fbclid');
    var utmSource = p.get('utm_source') || '';
    var utmMedium = p.get('utm_medium') || '';
    var utmCampaign = p.get('utm_campaign') || '';
    var utmTerm = p.get('utm_term') || '';

    var trafficType = 'Direct';
    var sourceDomain = 'Direct';

    if (gclid || p.get('gad_source') || utmMedium.toLowerCase() === 'cpc' || utmSource.toLowerCase().indexOf('google') !== -1) {
      trafficType = 'Google Ads';
      sourceDomain = 'google.com';
    } else if (fbclid || utmSource.toLowerCase().indexOf('facebook') !== -1 || refLower.indexOf('facebook.com') !== -1 || refLower.indexOf('fb.com') !== -1) {
      trafficType = 'Facebook Ads';
      sourceDomain = 'facebook.com';
    } else if (refLower.indexOf('zalo.me') !== -1 || refLower.indexOf('zalo') !== -1) {
      trafficType = 'Zalo In-App';
      sourceDomain = 'zalo.me';
    } else if (ref) {
      try {
        var refUrl = new URL(ref);
        sourceDomain = refUrl.hostname;
        if (/google|bing|yahoo|coccoc|duckduckgo/i.test(sourceDomain)) {
          trafficType = 'Organic Search';
        } else {
          trafficType = 'Referral';
        }
      } catch (e) {
        sourceDomain = ref.substring(0, 50);
        trafficType = 'Referral';
      }
    }

    return {
      trafficType: trafficType,
      sourceDomain: sourceDomain,
      campaign: utmCampaign || (gclid ? 'Search Campaign' : ''),
      adgroup: p.get('utm_content') || '',
      keyword: utmTerm || '',
      matchType: p.get('matchtype') || '',
      gclid: gclid || ''
    };
  }

  // 4. Quản lý Session ID
  var SESSION_KEY = 'fpt_tracking_session_id';
  var sessionId = sessionStorage.getItem(SESSION_KEY);
  var isNewSession = false;

  if (!sessionId) {
    sessionId = 'fpt_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8);
    sessionStorage.setItem(SESSION_KEY, sessionId);
    isNewSession = true;
  }

  var sourceInfo = parseTrafficSource();
  var device = getDeviceType();

  // Đối tượng lưu trữ toàn cục
  window.FPT_TRACKING = {
    webAppUrl: WEB_APP_URL,
    isInternal: isInternal,
    sessionId: sessionId,
    trafficType: sourceInfo.trafficType,
    sourceDomain: sourceInfo.sourceDomain,
    campaign: sourceInfo.campaign,
    adgroup: sourceInfo.adgroup,
    keyword: sourceInfo.keyword,
    matchType: sourceInfo.matchType,
    gclid: sourceInfo.gclid,
    device: device,
    ipAddress: '',
    landingPage: window.location.href
  };

  // 5. Lấy IP người dùng & gửi Pageview ping
  function pingSession(ip) {
    window.FPT_TRACKING.ipAddress = ip || '';
    if (isInternal) return; // Không ghi nhận traffic nội bộ

    var pingUrl = WEB_APP_URL + '?eventType=pageview'
      + '&sessionId=' + encodeURIComponent(sessionId)
      + '&landingPage=' + encodeURIComponent(window.location.href)
      + '&referrer=' + encodeURIComponent(document.referrer || '')
      + '&trafficType=' + encodeURIComponent(sourceInfo.trafficType)
      + '&sourceDomain=' + encodeURIComponent(sourceInfo.sourceDomain)
      + '&campaign=' + encodeURIComponent(sourceInfo.campaign)
      + '&adgroup=' + encodeURIComponent(sourceInfo.adgroup)
      + '&keyword=' + encodeURIComponent(sourceInfo.keyword)
      + '&matchType=' + encodeURIComponent(sourceInfo.matchType)
      + '&device=' + encodeURIComponent(device)
      + '&ipAddress=' + encodeURIComponent(window.FPT_TRACKING.ipAddress);

    // Dùng beacon hoặc fetch
    if (navigator.sendBeacon) {
      navigator.sendBeacon(pingUrl);
    } else {
      var img = new Image();
      img.src = pingUrl;
    }
  }

  // Lấy IP nhanh từ ipify
  var ipFetched = false;
  var ipTimeout = setTimeout(function() {
    if (!ipFetched) {
      ipFetched = true;
      pingSession('');
    }
  }, 2000);

  fetch('https://api.ipify.org?format=json')
    .then(function(r) { return r.json(); })
    .then(function(data) {
      if (!ipFetched) {
        ipFetched = true;
        clearTimeout(ipTimeout);
        pingSession(data.ip || '');
      }
    })
    .catch(function() {
      if (!ipFetched) {
        ipFetched = true;
        clearTimeout(ipTimeout);
        pingSession('');
      }
    });

})();
