(() => {
  const measurementId = "G-E1FEJMS44X";
  const consentStorageKey = "ssa_cookie_consent_v1";
  const granted = "granted";
  const denied = "denied";

  function getStoredConsent() {
    try {
      return localStorage.getItem(consentStorageKey);
    } catch {
      return null;
    }
  }

  function storeConsent(value) {
    try {
      localStorage.setItem(consentStorageKey, value);
    } catch {
      // If local storage is unavailable, the choice applies to the current page only.
    }
  }

  function loadGoogleAnalytics() {
    if (document.documentElement.dataset.analyticsLoaded === "true") return;

    document.documentElement.dataset.analyticsLoaded = "true";
    window[`ga-disable-${measurementId}`] = false;
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function gtag() {
      window.dataLayer.push(arguments);
    };

    window.gtag("consent", "default", {
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
      analytics_storage: "denied",
    });
    window.gtag("consent", "update", {
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
      analytics_storage: "granted",
    });
    window.gtag("js", new Date());
    window.gtag("config", measurementId, {
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
    });

    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
    document.head.append(script);
  }

  function removeAnalyticsCookies() {
    const hostname = window.location.hostname;
    const domainParts = hostname.split(".");
    const domains = [hostname, `.${hostname}`];

    if (domainParts.length > 2) {
      const rootDomain = domainParts.slice(-2).join(".");
      domains.push(rootDomain, `.${rootDomain}`);
    }

    document.cookie
      .split(";")
      .map((cookie) => cookie.split("=")[0].trim())
      .filter((name) => name === "_ga" || name.startsWith("_ga_"))
      .forEach((name) => {
        document.cookie = `${name}=; Max-Age=0; path=/; SameSite=Lax`;
        domains.forEach((domain) => {
          document.cookie = `${name}=; Max-Age=0; path=/; domain=${domain}; SameSite=Lax`;
        });
      });
  }

  function initializeConsentInterface() {
    const footerNav = document.querySelector(".site-footer nav");
    const settingsButton = document.createElement("button");
    settingsButton.type = "button";
    settingsButton.className = "cookie-settings-button";
    settingsButton.textContent = "Cookie-beállítások";
    footerNav?.append(settingsButton);

    const banner = document.createElement("section");
    banner.className = "cookie-consent";
    banner.setAttribute("aria-labelledby", "cookie-consent-title");
    banner.setAttribute("role", "region");
    banner.hidden = Boolean(getStoredConsent());
    banner.innerHTML = `
      <div class="cookie-consent__content">
        <div>
          <h2 id="cookie-consent-title" tabindex="-1">Statisztikai sütik</h2>
          <p>A weboldal látogatottságát Google Analytics segítségével, kizárólag az Ön hozzájárulása után mérjük. A statisztikai sütik elutasítása nem befolyásolja az oldal használatát. <a href="adatvedelmi-tajekoztato.html#sutik-es-analytics">Részletes tájékoztató</a></p>
        </div>
        <div class="cookie-consent__actions">
          <button class="button button-primary" type="button" data-cookie-accept>Elfogadom</button>
          <button class="button button-secondary" type="button" data-cookie-reject>Elutasítom</button>
        </div>
      </div>`;
    document.body.append(banner);

    const title = banner.querySelector("#cookie-consent-title");

    function hideBanner() {
      banner.hidden = true;
    }

    function showBanner() {
      banner.hidden = false;
      title?.focus();
    }

    banner.querySelector("[data-cookie-accept]")?.addEventListener("click", () => {
      storeConsent(granted);
      loadGoogleAnalytics();
      hideBanner();
    });

    banner.querySelector("[data-cookie-reject]")?.addEventListener("click", () => {
      const analyticsWasLoaded = document.documentElement.dataset.analyticsLoaded === "true";
      storeConsent(denied);
      window[`ga-disable-${measurementId}`] = true;
      removeAnalyticsCookies();
      hideBanner();

      if (analyticsWasLoaded) window.location.reload();
    });

    settingsButton.addEventListener("click", showBanner);
  }

  const storedConsent = getStoredConsent();
  if (storedConsent === granted) {
    loadGoogleAnalytics();
  } else {
    window[`ga-disable-${measurementId}`] = true;
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeConsentInterface);
  } else {
    initializeConsentInterface();
  }
})();
