(() => {
  "use strict";

  /*
   * StayAI German translation layer
   *
   * Quick code map:
   * 1. Configuration and translation dictionaries
   * 2. Translation rules and locale formatters
   * 3. Main text translation pipeline
   * 4. React-specific text handling
   * 5. DOM processing and dynamic updates
   * 6. Public console API
   */

  // === 1. Configuration and translation dictionaries ========================

  const API_NAME = "StayAIDe";

  // Allow the script to be pasted into the console more than once.
  window[API_NAME]?.stop?.();

  const exactTranslations = new Map([
    ["Subscription Manager", "Abo-Verwaltung"],
    ["Notifications", "Benachrichtigungen"],
    ["Notifications (F8)", "Benachrichtigungen (F8)"],
    ["Notifications alt+T", "Benachrichtigungen Alt+T"],
    ["Name updated", "Name aktualisiert"],
    ["Flavors updated", "Geschmacksrichtungen aktualisiert"],
    // Handles text left partially translated by an earlier script version.
    ["Geschmacksrichtungen updated", "Geschmacksrichtungen aktualisiert"],
    ["Dashboard", "Übersicht"],
    ["Subscriptions", "Abonnements"],
    ["New Subscription", "Neues Abonnement"],
    ["Meine Subscriptions", "Meine Abonnements"],
    ["Active", "Aktiv"],
    ["Paused", "Pausiert"],
    ["Skipped", "Übersprungen"],
    ["Upcoming", "Geplant"],
    ["Kommend", "Geplant"],
    ["Delivery Address", "Lieferadresse"],
    [
      "Update your delivery address for subscriptions",
      "Aktualisiere deine Lieferadresse für Abonnements",
    ],
    ["Street Address", "Straße und Hausnummer"],
    ["City", "Ort"],
    ["Postal Code", "Postleitzahl"],
    ["Country", "Land"],
    ["Germany", "Deutschland"],
    ["Edit Address", "Adresse bearbeiten"],
    ["Save Address", "Adresse speichern"],
    ["Cancel", "Abbrechen"],
    ["Close", "Schließen"],
    ["Pause subscription", "Abonnement pausieren"],
    [
      "Select a date until when you want to pause your subscription.",
      "Wähle aus, bis wann du dein Abonnement pausieren möchtest.",
    ],
    ["Pause until", "Pausieren bis"],
    ["Pause Subscription", "Abonnement pausieren"],
    ["Subscription paused", "Abonnement pausiert"],
    ["Subscription resumed", "Abonnement fortgesetzt"],
    ["Subscription bearbeiten", "Abonnement bearbeiten"],
    ["Subscription pausieren", "Abonnement pausieren"],
    ["Subscription stornieren", "Abonnement stornieren"],
    ["Subscription behalten", "Abonnement behalten"],
    ["Subscription Preis:", "Abonnementpreis:"],
    ["Subscription Preis", "Abonnementpreis"],
    ["Paused Subscriptions", "Pausierte Abonnements"],
    ["Stornierte Subscriptions", "Stornierte Abonnements"],
  ]);

  const translatableAttributes = ["aria-label", "alt", "placeholder", "title"];
  const skippedTagNames = new Set(["NOSCRIPT", "SCRIPT", "STYLE", "TEMPLATE", "TEXTAREA"]);
  const editableContainerSelector =
    '[contenteditable]:not([contenteditable="false"]), [role="textbox"]';
  const customerDataLabels = new Set(["Name", "E-Mail-Adresse", "Email Address"]);
  const dayPickerTranslations = new Map([
    ["Su", "So"],
    ["Tu", "Di"],
    ["We", "Mi"],
    ["Th", "Do"],
    ["Sunday", "Sonntag"],
    ["Monday", "Montag"],
    ["Tuesday", "Dienstag"],
    ["Wednesday", "Mittwoch"],
    ["Thursday", "Donnerstag"],
    ["Friday", "Freitag"],
    ["Saturday", "Samstag"],
    ["Go to previous month", "Zum vorherigen Monat"],
    ["Go to next month", "Zum nächsten Monat"],
  ]);

  const monthNames = {
    jan: "Januar",
    january: "Januar",
    feb: "Februar",
    february: "Februar",
    mar: "März",
    march: "März",
    apr: "April",
    april: "April",
    may: "Mai",
    jun: "Juni",
    june: "Juni",
    jul: "Juli",
    july: "Juli",
    aug: "August",
    august: "August",
    sep: "September",
    sept: "September",
    september: "September",
    oct: "Oktober",
    october: "Oktober",
    nov: "November",
    november: "November",
    dec: "Dezember",
    december: "Dezember",
  };

  const weekdayNames = {
    monday: "Montag",
    tuesday: "Dienstag",
    wednesday: "Mittwoch",
    thursday: "Donnerstag",
    friday: "Freitag",
    saturday: "Samstag",
    sunday: "Sonntag",
  };

  const monthPattern = [
    "Jan(?:uary)?",
    "Feb(?:ruary)?",
    "Mar(?:ch)?",
    "Apr(?:il)?",
    "May",
    "Jun(?:e)?",
    "Jul(?:y)?",
    "Aug(?:ust)?",
    "Sep(?:t(?:ember)?|tember)?",
    "Oct(?:ober)?",
    "Nov(?:ember)?",
    "Dec(?:ember)?",
  ].join("|");
  const weekdayPattern = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ].join("|");

  // The date patterns are global so one text can contain several dates.
  // String.replace resets lastIndex for global RegExp objects before matching.
  const weekdayMonthDatePattern = new RegExp(
    `\\b(${weekdayPattern}),?\\s+(${monthPattern})\\s+(\\d{1,2})(?:st|nd|rd|th)?[,]?\\s+(\\d{4})\\b`,
    "gi",
  );
  const monthDatePattern = new RegExp(
    `\\b(${monthPattern})\\s+(\\d{1,2})(?:st|nd|rd|th)?[,]?\\s+(\\d{4})\\b`,
    "gi",
  );
  const dateMonthPattern = new RegExp(
    `\\b(\\d{1,2})\\s+(${monthPattern})(?:[,]?\\s+(\\d{4}))?\\b`,
    "gi",
  );
  const monthYearPattern = new RegExp(`\\b(${monthPattern})\\s+(\\d{4})\\b`, "gi");
  const isoDatePattern = /\b(\d{4})-(\d{2})-(\d{2})\b/g;
  const isoDateHintPattern = /\d{4}-\d{2}-\d{2}/;
  const translationHintPattern = /[A-Za-z€]/;
  const currencyMarkerAttribute = "data-stayai-currency";
  const euroAmountPattern = "(?:\\d[\\d.,]*\\d|\\d)";
  const euroPrefixPattern = new RegExp(`(?:\\bEUR|€)\\s*(${euroAmountPattern})`, "gi");
  const euroSuffixPattern = new RegExp(`(${euroAmountPattern})\\s*EUR\\b`, "gi");
  const euroFormatter = new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
  });

  // === 2. Translation rules and locale formatters ============================

  // Converts English and ISO dates, e.g. "Jun 22, 2026" -> "22. Juni 2026".
  function formatEnglishDates(value) {
    let result = value;

    result = result.replace(
      weekdayMonthDatePattern,
      (_, weekday, month, day, year) => {
        const germanWeekday = weekdayNames[weekday.toLowerCase()];
        const germanMonth = monthNames[month.toLowerCase()];
        return `${germanWeekday}, ${Number(day)}. ${germanMonth} ${year}`;
      },
    );

    result = result.replace(
      monthDatePattern,
      (_, month, day, year) => `${Number(day)}. ${monthNames[month.toLowerCase()]} ${year}`,
    );

    result = result.replace(
      dateMonthPattern,
      (_, day, month, year) => {
        const germanMonth = monthNames[month.toLowerCase()];
        return `${Number(day)}. ${germanMonth}${year ? ` ${year}` : ""}`;
      },
    );

    result = result.replace(
      monthYearPattern,
      (_, month, year) => `${monthNames[month.toLowerCase()]} ${year}`,
    );

    result = result.replace(
      isoDatePattern,
      (_, year, month, day) => `${Number(day)}.${Number(month)}.${year}`,
    );

    return result;
  }

  // === Text translation rules ================================================

  // Selects the German singular or plural unit, e.g. 1 -> "Woche".
  function getGermanUnit(count, singular, plural) {
    return Number(count) === 1 ? singular : plural;
  }

  // Rules for complete or independently translatable text nodes.
  const replacements = [
    [/\bSubscription #(\d+)\b/gi, "Abonnement #$1"],
    [
      /\bSubscription skipped for (\d+) weeks?\b/gi,
      (_, weeks) => {
        const unit = getGermanUnit(weeks, "Woche", "Wochen");
        return `Abonnement für ${weeks} ${unit} übersprungen`;
      },
    ],
    [/\bStarted on\b/gi, "Gestartet am"],
    [/\bNext delivery:/gi, "Nächste Lieferung:"],
    [/\bSelected flavors:/gi, "Ausgewählte Geschmacksrichtungen:"],
    [
      /\b(\d+) flavors? for (\d+) weeks?\b/gi,
      (_, flavors, weeks) => {
        const flavorUnit = getGermanUnit(
          flavors,
          "Geschmacksrichtung",
          "Geschmacksrichtungen",
        );
        const weekUnit = getGermanUnit(weeks, "Woche", "Wochen");
        return `${flavors} ${flavorUnit} für ${weeks} ${weekUnit}`;
      },
    ],
    [
      /\bYou have selected (\d+) of (\d+) flavors?\b/gi,
      "Du hast $1 von $2 Geschmacksrichtungen ausgewählt",
    ],
    [
      /\bBilled every (\d+) weeks?\b/gi,
      (_, weeks) => `Abrechnung alle ${weeks} ${getGermanUnit(weeks, "Woche", "Wochen")}`,
    ],
    [/\bSkipped until\b/gi, "Übersprungen bis"],
    [/\bPaused until\b/gi, "Pausiert bis"],
    [/\bat\s+(?=\d{1,2}(?::\d{2})?\s*(?:a\.m\.|p\.m\.|am|pm))/gi, "um "],
    [
      /\/\s*(\d+) weeks?\b/gi,
      (_, weeks) => `/ ${weeks} ${getGermanUnit(weeks, "Woche", "Wochen")}`,
    ],
    [/\bPaused\s*\((\d+)\)/gi, "Pausiert ($1)"],
    [/\bActive\b/g, "Aktiv"],
    [/\bPaused\b/g, "Pausiert"],
    [/\bSkipped\b/g, "Übersprungen"],
    [/\bNew Subscription\b/gi, "Neues Abonnement"],
    [/\bSubscriptions\b/g, "Abonnements"],
    [/\bSubscription\b/g, "Abonnement"],
    [/\bflavors\b/gi, "Geschmacksrichtungen"],
    [/\bweeks\b/gi, "Wochen"],
  ];

  // Rules for sentences that React renders as several adjacent text nodes.
  const splitTextRules = [
    {
      pattern: /^(?:Flavors|Geschmacksrichtungen) updated$/i,
      fragments: () => ["Geschmacksrichtungen ", "aktualisiert"],
    },
    {
      pattern: /^Subscription skipped for (\d+) weeks?$/i,
      fragments: (match) => [
        "Abonnement für ",
        match[1],
        ` ${getGermanUnit(match[1], "Woche", "Wochen")} übersprungen`,
      ],
    },
    {
      pattern: /^Selected flavors: \((\d+) flavors? for (\d+) weeks?\)$/i,
      fragments: (match) => {
        const flavorUnit = getGermanUnit(
          match[1],
          " Geschmacksrichtung für ",
          " Geschmacksrichtungen für ",
        );
        const weekUnit = ` ${getGermanUnit(match[2], "Woche", "Wochen")})`;
        return [
          "Ausgewählte Geschmacksrichtungen: (",
          match[1],
          flavorUnit,
          match[2],
          weekUnit,
        ];
      },
    },
    {
      pattern: /^You have selected (\d+) of (\d+) flavors$/i,
      fragments: (match) => [
        "Du hast ",
        match[1],
        " von ",
        match[2],
        " Geschmacksrichtungen ausgewählt",
      ],
    },
    {
      pattern: /^Billed every (\d+) weeks?$/i,
      fragments: (match) => [
        "Abrechnung alle ",
        match[1],
        ` ${getGermanUnit(match[1], "Woche", "Wochen")}`,
      ],
    },
  ];
  const blockedSplitTextElements = new WeakSet();

  // Converts 12-hour times, e.g. "3:30 PM" -> "15:30 Uhr".
  function formatTimes(value) {
    return value.replace(
      /\b(\d{1,2})(?::(\d{2}))?\s*(a\.m\.|p\.m\.|am|pm)(?=$|\s|[.,)])/gi,
      (match, rawHour, rawMinute = "00", meridiem) => {
        const hour12 = Number(rawHour);
        const minute = Number(rawMinute);
        if (hour12 < 1 || hour12 > 12 || minute > 59) return match;

        let hour = hour12 % 12;
        if (meridiem.toLowerCase().startsWith("p")) hour += 12;
        return `${String(hour).padStart(2, "0")}:${rawMinute} Uhr`;
      },
    );
  }

  // Parses English and German numbers, e.g. "1,234.56" and "1.234,56".
  function parseLocalizedNumber(rawValue) {
    const compactValue = rawValue.replace(/\s/g, "");
    const lastComma = compactValue.lastIndexOf(",");
    const lastDot = compactValue.lastIndexOf(".");
    let decimalSeparator = null;

    if (lastComma >= 0 && lastDot >= 0) {
      decimalSeparator = lastComma > lastDot ? "," : ".";
    } else {
      const separatorIndex = Math.max(lastComma, lastDot);
      const fractionLength = separatorIndex >= 0 ? compactValue.length - separatorIndex - 1 : 0;
      if (fractionLength === 1 || fractionLength === 2) {
        decimalSeparator = compactValue[separatorIndex];
      }
    }

    let normalized;
    if (decimalSeparator) {
      const decimalIndex = compactValue.lastIndexOf(decimalSeparator);
      const integerPart = compactValue.slice(0, decimalIndex).replace(/[.,]/g, "");
      const fractionPart = compactValue.slice(decimalIndex + 1).replace(/[.,]/g, "");
      normalized = `${integerPart}.${fractionPart}`;
    } else {
      normalized = compactValue.replace(/[.,]/g, "");
    }

    const number = Number(normalized);
    return Number.isFinite(number) ? number : null;
  }

  // Formats EUR values, e.g. "€89.92" -> "89,92 €".
  function formatEuroAmounts(value) {
    const formatAmount = (match, amount) => {
      const number = parseLocalizedNumber(amount);
      return number === null ? match : euroFormatter.format(number);
    };

    const result = value.replace(euroPrefixPattern, formatAmount);
    return result.replace(euroSuffixPattern, formatAmount);
  }

  // === 3. Main text translation pipeline =====================================

  // Applies translations, dates, times and currency while preserving whitespace.
  function translateText(input) {
    if (!input || !input.trim()) return input;

    const leadingWhitespace = input.match(/^\s*/)?.[0] ?? "";
    const trailingWhitespace = input.match(/\s*$/)?.[0] ?? "";
    let value = input.trim();

    // Most calendar cells and counters contain only numbers and need no processing.
    if (!translationHintPattern.test(value) && !isoDateHintPattern.test(value)) return input;

    value = exactTranslations.get(value) ?? value;

    for (const [pattern, replacement] of replacements) {
      value = value.replace(pattern, replacement);
    }

    value = formatEnglishDates(value);
    value = formatTimes(value);
    value = formatEuroAmounts(value);

    return `${leadingWhitespace}${value}${trailingWhitespace}`;
  }

  // === 4. React-specific text handling =======================================

  // Localizes month navigation and weekday labels only inside React Day Picker.
  function translateDayPickerText(input, element) {
    if (!input || !element?.closest?.(".rdp")) return input;

    const value = input.trim();
    const translatedValue = dayPickerTranslations.get(value);
    return translatedValue ? input.replace(value, translatedValue) : input;
  }

  // Translates accessibility and helper attributes, but never form values.
  function translateElementAttributes(element) {
    for (const attribute of translatableAttributes) {
      if (!element.hasAttribute(attribute)) continue;

      const currentValue = element.getAttribute(attribute);
      const dayPickerValue = translateDayPickerText(currentValue, element);
      const translatedValue = translateText(dayPickerValue);
      if (translatedValue !== currentValue) element.setAttribute(attribute, translatedValue);
    }
  }

  // Returns direct text children without traversing the complete subtree.
  function getDirectTextNodes(element) {
    if (!element?.childNodes) return [];
    return Array.from(element.childNodes).filter(
      (childNode) => childNode.nodeType === Node.TEXT_NODE,
    );
  }

  // Returns the visible text stored directly on one element.
  function getDirectText(element) {
    return getDirectTextNodes(element)
      .map((textNode) => textNode.nodeValue)
      .join("")
      .trim();
  }

  // Identifies the customer values observed in the greeting and profile view.
  function isCustomerDataDisplayElement(element) {
    if (!element) return false;

    const isHeading = /^H[1-6]$/.test(element.tagName);
    if (!isHeading && element.tagName !== "P") return false;
    if (isHeading) return getDirectText(element).startsWith("Willkommen zurück,");

    const labelElement = element.previousElementSibling;
    if (labelElement?.tagName !== "P") return false;

    return customerDataLabels.has(getDirectText(labelElement));
  }

  // Extends customer-data protection to nested spans and other descendants.
  function isInsideCustomerDataDisplay(element) {
    for (let currentElement = element; currentElement; currentElement = currentElement.parentElement) {
      if (isCustomerDataDisplayElement(currentElement)) return true;
    }
    return false;
  }

  // Protects editable content and known customer values from text translation.
  function shouldSkipTextNode(textNode) {
    const parentElement = textNode.parentElement;
    if (!parentElement || skippedTagNames.has(parentElement.tagName)) return true;
    if (parentElement.closest?.(editableContainerSelector)) return true;
    return isInsideCustomerDataDisplay(parentElement);
  }

  // Localizes displayed profile values without changing the underlying form fields.
  function formatAddressDisplayElement(element) {
    if (element?.tagName !== "P" || element.childElementCount > 0) return;

    const labelElement = element.previousElementSibling;
    if (labelElement?.tagName !== "P") return;

    const label = getDirectText(labelElement);
    const valueNodes = getDirectTextNodes(element);
    if (valueNodes.length !== 1) return;

    const valueNode = valueNodes[0];
    const value = valueNode.nodeValue.trim();

    if (label === "Street Address" || label === "Straße und Hausnummer") {
      const addressMatch = value.match(/^(\d+[A-Za-z]?(?:[-/]\d+[A-Za-z]?)?)\s+(.+)$/);
      if (addressMatch) {
        valueNode.nodeValue = valueNode.nodeValue.replace(
          value,
          `${addressMatch[2]} ${addressMatch[1]}`,
        );
      }
    } else if ((label === "Country" || label === "Land") && value === "Germany") {
      valueNode.nodeValue = valueNode.nodeValue.replace(value, "Deutschland");
    }
  }

  // Rebuilds known split sentences without merging or removing React text nodes.
  function translateSplitTextElement(element) {
    if (!element) return;

    blockedSplitTextElements.delete(element);
    if (element.childElementCount > 0) return;

    const textNodes = getDirectTextNodes(element);
    if (textNodes.length < 2) return;

    const currentValue = textNodes.map((textNode) => textNode.nodeValue).join("");
    for (const rule of splitTextRules) {
      const match = currentValue.match(rule.pattern);
      if (!match) continue;

      const translatedFragments = rule.fragments(match);
      if (translatedFragments.length !== textNodes.length) {
        blockedSplitTextElements.add(element);
        return;
      }

      textNodes.forEach((textNode, index) => {
        if (textNode.nodeValue !== translatedFragments[index]) {
          textNode.nodeValue = translatedFragments[index];
        }
      });
      return;
    }
  }

  // Keeps the formatted price in React's amount node when "€" and amount are split.
  function formatSplitEuroAmount(element) {
    if (!element || element.childElementCount > 0) return;

    const textNodes = getDirectTextNodes(element);
    if (textNodes.length < 2) return;

    const currencyNode = textNodes.find((textNode) => /^\s*(?:€|EUR)\s*$/i.test(textNode.nodeValue));
    const hasCurrencyMarker = element.getAttribute?.(currencyMarkerAttribute) === "EUR";
    if (!currencyNode && !hasCurrencyMarker) return;

    const amountNode = textNodes.find(
      (textNode) => textNode !== currencyNode && /\d/.test(textNode.nodeValue),
    );
    if (!amountNode) return;

    const amountMatch = amountNode.nodeValue.match(/(?:\d[\d.,]*\d|\d)/);
    const amountTokenMatch = amountNode.nodeValue.match(
      /(?:\d[\d.,]*\d|\d)(?:\s*(?:€|EUR))?/i,
    );
    if (!amountMatch || !amountTokenMatch) return;

    const amount = parseLocalizedNumber(amountMatch[0]);
    if (amount === null) return;

    if (currencyNode) currencyNode.nodeValue = "";
    amountNode.nodeValue = amountNode.nodeValue.replace(
      amountTokenMatch[0],
      euroFormatter.format(amount),
    );
    element.setAttribute?.(currencyMarkerAttribute, "EUR");
  }

  // Applies all element-level transformations in their required order.
  function processElement(element) {
    if (!element || skippedTagNames.has(element.tagName)) return;
    if (element.closest?.(editableContainerSelector)) return;
    if (isInsideCustomerDataDisplay(element)) return;

    formatAddressDisplayElement(element);
    translateSplitTextElement(element);
    formatSplitEuroAmount(element);
    translateElementAttributes(element);
  }

  // === 5. DOM processing and dynamic updates =================================

  // Translates one text node unless it belongs to a technical/editable container.
  function translateTextNode(textNode, processParent = true) {
    if (shouldSkipTextNode(textNode)) return;

    if (processParent) processElement(textNode.parentElement);
    if (blockedSplitTextElements.has(textNode.parentElement)) return;

    const dayPickerValue = translateDayPickerText(textNode.nodeValue, textNode.parentElement);
    const translatedValue = translateText(dayPickerValue);
    if (translatedValue !== textNode.nodeValue) textNode.nodeValue = translatedValue;
  }

  // Processes a DOM subtree: split text, prices, visible text and attributes.
  function processNode(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      translateTextNode(node);
      return;
    }

    if (node.nodeType !== Node.ELEMENT_NODE && node.nodeType !== Node.DOCUMENT_NODE) return;
    if (node.nodeType === Node.ELEMENT_NODE && skippedTagNames.has(node.tagName)) return;

    if (node.nodeType === Node.ELEMENT_NODE) processElement(node);

    const walker = document.createTreeWalker(
      node,
      NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT,
    );
    let processedTextParent = node.nodeType === Node.ELEMENT_NODE ? node : null;

    while (walker.nextNode()) {
      const current = walker.currentNode;
      if (current.nodeType === Node.TEXT_NODE) {
        const shouldProcessParent = current.parentElement !== processedTextParent;
        translateTextNode(current, shouldProcessParent);
        processedTextParent = current.parentElement;
      } else if (!skippedTagNames.has(current.tagName)) {
        processElement(current);
        processedTextParent = current;
      }
    }
  }

  const pendingNodes = new Set();
  let animationFrame = null;

  // Batches React DOM changes into one animation frame for better performance.
  function schedule(node) {
    if (!node) return;

    // Keep only the highest pending subtree when mutations overlap.
    for (const pendingNode of pendingNodes) {
      if (pendingNode === node || pendingNode.contains?.(node)) return;
      if (node.contains?.(pendingNode)) pendingNodes.delete(pendingNode);
    }

    pendingNodes.add(node);
    if (animationFrame !== null) return;

    animationFrame = requestAnimationFrame(() => {
      animationFrame = null;
      for (const pendingNode of pendingNodes) processNode(pendingNode);
      pendingNodes.clear();
      // Ignore mutation records created by our own text and attribute updates.
      observer.takeRecords?.();
    });
  }

  // Watches dialogs, snackbars, route changes and other dynamically rendered content.
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === "childList") {
        mutation.addedNodes.forEach(schedule);
      } else if (mutation.type === "characterData") {
        schedule(mutation.target.parentElement ?? mutation.target);
      } else {
        schedule(mutation.target);
      }
    }
  });

  document.documentElement.lang = "de";
  processNode(document.documentElement);
  observer.observe(document.documentElement, {
    subtree: true,
    childList: true,
    characterData: true,
    attributes: true,
    attributeFilter: translatableAttributes,
  });

  // === 6. Public console API ==================================================

  // Exposes manual refresh, isolated text testing and cleanup for live demos.
  window[API_NAME] = {
    refresh: () => processNode(document.documentElement),
    translateText,
    stop: () => {
      observer.disconnect();
      if (animationFrame !== null) {
        cancelAnimationFrame(animationFrame);
        animationFrame = null;
      }
      pendingNodes.clear();
      console.info("StayAI-DE wurde gestoppt.");
    },
  };

  console.info("StayAI-DE aktiv. API: window.StayAIDe");
})();
