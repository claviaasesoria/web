(function(){
  var STORAGE_KEY = 'clavia_attribution';
  var TRACKING_KEYS = [
    'gclid','gbraid','wbraid',
    'utm_source','utm_medium','utm_campaign','utm_term','utm_content',
    'gad_campaignid','gad_adgroupid','gad_creative','gad_keyword','gad_matchtype','gad_device','gad_network'
  ];
  var GA_ID = 'G-JMYYM5NKN8';
  var ADS_ID = 'AW-17976955492';

  function parseStored(){
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); }
    catch(e){ return {}; }
  }

  function clean(obj){
    var out = {};
    Object.keys(obj || {}).forEach(function(key){
      if(obj[key] !== undefined && obj[key] !== null && String(obj[key]).trim() !== '') out[key] = String(obj[key]);
    });
    return out;
  }

  function saveAttribution(){
    var params = new URLSearchParams(window.location.search);
    var current = {};
    TRACKING_KEYS.forEach(function(key){
      var value = params.get(key);
      if(value) current[key] = value;
    });
    if(Object.keys(current).length){
      var stored = parseStored();
      var merged = Object.assign({}, stored, current, {
        landing_page: stored.landing_page || window.location.pathname,
        captured_at: new Date().toISOString()
      });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    }
  }

  function attribution(){
    var stored = parseStored();
    try {
      var sessionStored = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || '{}');
      stored = Object.assign({}, stored, sessionStored);
    } catch(e){}
    return clean(stored);
  }

  function withTracking(url, extra){
    var data = attribution();
    var filtered = {};
    TRACKING_KEYS.forEach(function(key){
      if(data[key]) filtered[key] = data[key];
    });
    var merged = Object.assign({}, filtered, clean(extra || {}));
    var target;
    try { target = new URL(url, window.location.origin); }
    catch(e){ return url; }
    Object.keys(merged).forEach(function(key){
      if(!target.searchParams.has(key)) target.searchParams.set(key, merged[key]);
    });
    return target.toString();
  }

  function decorateLinks(){
    var selector = [
      'a[href^="/empezar"]',
      'a[href^="/contratar"]',
      'a[href^="/tramites"]',
      'a[href*="tally.so/r/WOo5KN"]'
    ].join(',');
    document.querySelectorAll(selector).forEach(function(link){
      var extra = link.href.indexOf('tally.so/r/WOo5KN') !== -1 ? {lead_source:'tally'} : {};
      link.href = withTracking(link.getAttribute('href'), extra);
    });
  }

  function ensureGtag(){
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function(){ window.dataLayer.push(arguments); };
    if(!window.__claviaConsentDefault){
      var granted = localStorage.getItem('clavia_consent') === 'accepted';
      gtag('consent','default', granted ? {
        analytics_storage:'granted',
        ad_storage:'granted',
        ad_user_data:'granted',
        ad_personalization:'granted'
      } : {
        analytics_storage:'denied',
        ad_storage:'denied',
        ad_user_data:'denied',
        ad_personalization:'denied',
        wait_for_update:500
      });
      window.__claviaConsentDefault = true;
    }
    if(!document.querySelector('script[src*="googletagmanager.com/gtag/js?id=' + GA_ID + '"]')){
      var script = document.createElement('script');
      script.async = true;
      script.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
      document.head.appendChild(script);
    }
    if(!window.__claviaGtagStarted){
      gtag('js', new Date());
      window.__claviaGtagStarted = true;
    }
    window.__claviaConfiguredIds = window.__claviaConfiguredIds || {};
    [GA_ID, ADS_ID].forEach(function(id){
      if(!window.__claviaConfiguredIds[id]){
        gtag('config', id);
        window.__claviaConfiguredIds[id] = true;
      }
    });
  }

  function track(name, params){
    if(typeof window.gtag === 'function') gtag('event', name, params || {});
  }

  function trackClicks(){
    document.addEventListener('click', function(e){
      var el = e.target.closest('[data-track], a, button');
      if(!el) return;
      var label = el.getAttribute('data-track') || el.id || el.textContent.trim().slice(0,80);
      if(label) track('click_cta', {event_category:'CTA', event_label:label});
    });
  }

  function applyFormAttribution(formId){
    var form = document.getElementById(formId);
    if(!form) return;
    var data = attribution();
    Object.keys(data).forEach(function(key){
      var input = form.querySelector('[name="' + key + '"]');
      if(!input){
        input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        form.appendChild(input);
      }
      input.value = data[key];
    });
    var redirect = form.querySelector('[name="redirect"]');
    if(redirect) redirect.value = withTracking('https://clavia.es/gracias', {lead_source:'web3forms'});
  }

  function init(options){
    options = options || {};
    saveAttribution();
    if(options.gtag !== false) ensureGtag();
    decorateLinks();
    if(options.trackClicks) trackClicks();
    if(options.formId) applyFormAttribution(options.formId);
  }

  window.ClaviaTracking = {
    init:init,
    withTracking:withTracking,
    open:function(url, target, extra){ window.open(withTracking(url, extra), target || '_self'); },
    track:track,
    applyFormAttribution:applyFormAttribution,
    attribution:attribution
  };
})();
