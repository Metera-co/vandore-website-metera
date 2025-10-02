(function () {
  const NAV_DATA_URL = "/data/navigation.json";

  function renderNav(container, items) {
    container.innerHTML = "";
    items.forEach((item, index) => {
      const wrapper = document.createElement("div");
      wrapper.className = "navigation";

      const label = document.createElement("span");
      label.className = "header-text editable";
      if (item.i18n) {
        label.setAttribute("data-i18n", item.i18n);
      }
      const prefix = item.number ? `${item.number} ` : "";
      label.textContent = `${prefix}${item.label ?? ""}`.trim();
      wrapper.appendChild(label);

      if (item.href) {
        const link = document.createElement("a");
        link.className = "d-flex editable";
        link.href = item.href;
        link.style.justifySelf = "end";

        const icon = document.createElement("i");
        icon.className = item.iconClass || "rtmicon rtmicon-arrow-right fs-1 fw-bold";
        link.appendChild(icon);
        wrapper.appendChild(link);
      }

      container.appendChild(wrapper);
      if (index < items.length - 1) {
        container.appendChild(document.createElement("hr"));
      }
    });
  }

  function renderContact(container, contact) {
    container.innerHTML = "";
    if (!contact) {
      return;
    }

    if (contact.heading?.text) {
      const heading = document.createElement("h6");
      heading.className = "editable";
      if (contact.heading.i18n) {
        heading.setAttribute("data-i18n", contact.heading.i18n);
      }
      heading.textContent = contact.heading.text;
      container.appendChild(heading);
    }

    if (Array.isArray(contact.lines) && contact.lines.length) {
      const linesWrapper = document.createElement("div");
      linesWrapper.className = "d-flex flex-column gap-3";
      contact.lines.forEach((line) => {
        const span = document.createElement("span");
        span.className = "editable";
        if (line.i18n) {
          span.setAttribute("data-i18n", line.i18n);
        }
        span.textContent = line.text ?? "";
        linesWrapper.appendChild(span);
      });
      container.appendChild(linesWrapper);
    }
  }

  async function hydrateNavigation() {
    const navContainers = Array.from(document.querySelectorAll("[data-nav-list]"));
    const contactContainers = Array.from(document.querySelectorAll("[data-nav-contact]"));
    if (!navContainers.length && !contactContainers.length) {
      return;
    }

    try {
      const response = await fetch(NAV_DATA_URL, { cache: "no-cache" });
      if (!response.ok) {
        throw new Error(`Failed to load navigation data: ${response.status}`);
      }
      const data = await response.json();
      const navItems = Array.isArray(data?.primary) ? data.primary : [];
      navContainers.forEach((container) => renderNav(container, navItems));
      contactContainers.forEach((container) => renderContact(container, data?.contact));
    } catch (error) {
      console.error("Navigation hydration failed", error);
    }
  }

  document.addEventListener("DOMContentLoaded", hydrateNavigation);
})();
