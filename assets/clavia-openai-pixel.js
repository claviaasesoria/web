(function () {
  "use strict";

  var PIXEL_ID = "FyAHH8A8mD7uNPqv7Jh4dz";
  var CONSENT_KEY = "clavia_consent";
  var EVENT_PREFIX = "clavia_openai_lead_";

  function hasMeasurementConsent() {
    return localStorage.getItem(CONSENT_KEY) === "accepted";
  }

  function readCookie(name) {
    var match = document.cookie.match(new RegExp("(?:^|; )" + name.replace(/[.$?*|{}()\[\]\\/+^]/g, "\\$&") + "=([^;]*)"));
    return match ? decodeURIComponent(match[1]) : "";
  }

  // OpenAI requires consent to be set before pixel initialization. Do not default
  // to measurement consent merely because the SDK defaults to true when omitted.
  (function loadPixel() {
    if (!window.oaiq) {
      var queue = function () { queue.q.push(arguments); };
      queue.q = [];
      window.oaiq = queue;
      var script = document.createElement("script");
      script.async = true;
      script.src = "https://bzrcdn.openai.com/sdk/oaiq.min.js";
      var firstScript = document.getElementsByTagName("script")[0];
      firstScript.parentNode.insertBefore(script, firstScript);
    }

    window.oaiq("consent", hasMeasurementConsent());
    window.oaiq("init", { pixelId: PIXEL_ID });
  })();

  window.ClaviaOpenAIPixel = {
    setConsent: function (granted) {
      if (typeof window.oaiq === "function") window.oaiq("consent", Boolean(granted));
    },

    leadCreated: function (leadId) {
      if (!leadId || !hasMeasurementConsent() || typeof window.oaiq !== "function") return false;

      var eventId = EVENT_PREFIX + leadId;
      if (sessionStorage.getItem(eventId)) return false;

      window.oaiq(
        "measure",
        "lead_created",
        { type: "customer_action" },
        { event_id: eventId }
      );
      sessionStorage.setItem(eventId, "1");
      return true;
    },

    attribution: function () {
      if (!hasMeasurementConsent()) return {};
      var params = new URLSearchParams(window.location.search);
      // The Pixel's opaque first-party browser reference is the CAPI matching key.
      // Keep the click reference too when the landing URL still carries it.
      var obref = readCookie("__obref") || readCookie("__oppref");
      var oppref = params.get("oppref");
      var data = {};
      if (obref) data.openai_obref = obref;
      if (oppref) data.openai_oppref = oppref;
      return data;
    }
  };
})();
