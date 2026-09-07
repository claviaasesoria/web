(function () {
  "use strict";

  var PIXEL_ID = "FyAHH8A8mD7uNPqv7Jh4dz";
  var CONSENT_KEY = "clavia_consent";
  var EVENT_PREFIX = "clavia_openai_lead_";

  function hasMeasurementConsent() {
    return localStorage.getItem(CONSENT_KEY) === "accepted";
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
    }
  };
})();
