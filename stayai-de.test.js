"use strict";

const assert = require("node:assert/strict");
const { after, describe, test } = require("node:test");

let animationFrameCallback;
let cancelledAnimationFrameId;
let mutationObserverCallback;
let observerDisconnectCalls;

// Runs setup or cleanup without adding production log messages to test output.
function withoutConsoleInfo(callback) {
  const originalInfo = console.info;
  try {
    console.info = () => {};
    return callback();
  } finally {
    console.info = originalInfo;
  }
}

// Creates the small browser surface that stayai-de.js needs in Node.js.
function installBrowserMocks() {
  cancelledAnimationFrameId = null;
  observerDisconnectCalls = 0;
  global.window = {};
  global.Node = { DOCUMENT_NODE: 9, ELEMENT_NODE: 1, TEXT_NODE: 3 };
  global.NodeFilter = { SHOW_ELEMENT: 1, SHOW_TEXT: 4 };

  global.document = {
    documentElement: {
      hasAttribute: () => false,
      lang: "",
      nodeType: Node.ELEMENT_NODE,
      tagName: "HTML",
    },
    createTreeWalker: () => ({ nextNode: () => false }),
  };

  global.MutationObserver = class {
    constructor(callback) {
      mutationObserverCallback = callback;
    }

    disconnect() {
      observerDisconnectCalls += 1;
    }
    observe() {}

    takeRecords() {
      return [];
    }
  };

  global.requestAnimationFrame = (callback) => {
    animationFrameCallback = callback;
    return 1;
  };
  global.cancelAnimationFrame = (animationFrameId) => {
    cancelledAnimationFrameId = animationFrameId;
    animationFrameCallback = null;
  };
}

// Loads the console script once and returns its public test API.
function loadTranslationApi() {
  installBrowserMocks();

  withoutConsoleInfo(() => {
    require("./stayai-de.js");
  });

  return window.StayAIDe;
}

// Builds a lightweight DOM element with one or more direct text nodes.
function createElement(values, options = {}) {
  const {
    attributes = {},
    insideEditable = false,
    insideDayPicker = false,
    parentElement = null,
    previousElementSibling = null,
    tagName = "DIV",
    value,
  } = options;
  const textValues = Array.isArray(values) ? values : [values];

  const element = {
    attributes: { ...attributes },
    childElementCount: 0,
    childNodes: [],
    closest: (selector) => {
      if (insideDayPicker && selector === ".rdp") return element;
      if (insideEditable && selector.includes("[contenteditable]")) return element;
      return null;
    },
    getAttribute(name) {
      return this.attributes[name] ?? null;
    },
    hasAttribute(name) {
      return Object.hasOwn(this.attributes, name);
    },
    nodeType: Node.ELEMENT_NODE,
    parentElement,
    previousElementSibling,
    setAttribute(name, attributeValue) {
      this.attributes[name] = attributeValue;
    },
    tagName,
    value,
  };

  element.childNodes = textValues.map((nodeValue) => ({
    nodeType: Node.TEXT_NODE,
    nodeValue,
    parentElement: element,
  }));

  return element;
}

// Returns the visible text represented by an element's direct text nodes.
function textOf(element) {
  return element.childNodes.map((node) => node.nodeValue).join("");
}

// Makes createTreeWalker return the supplied elements and their text nodes.
function installDomFixture(...elements) {
  const nodes = elements.flatMap((element) => [element, ...element.childNodes]);

  document.createTreeWalker = () => ({
    currentNode: null,
    nextNode() {
      this.currentNode = nodes.shift();
      return Boolean(this.currentNode);
    },
  });
}

// Processes a fixture through the same public refresh used in the browser.
function refreshElements(...elements) {
  installDomFixture(...elements);
  api.refresh();
}

// Simulates MutationObserver delivery followed by the scheduled animation frame.
function flushMutations(mutations) {
  assert.equal(
    typeof mutationObserverCallback,
    "function",
    "Der MutationObserver wurde nicht initialisiert.",
  );
  mutationObserverCallback(mutations);

  const callback = animationFrameCallback;
  animationFrameCallback = null;
  assert.equal(
    typeof callback,
    "function",
    "Die DOM-Aktualisierung wurde nicht eingeplant.",
  );
  callback();
}

const api = loadTranslationApi();

after(() => withoutConsoleInfo(() => api.stop()));

// Suites are intentionally sequential because they share one mocked document.
describe("Textübersetzung", { concurrency: false }, () => {
  test("gibt leere und fehlende Eingaben unverändert zurück", () => {
    assert.equal(api.translateText(""), "");
    assert.equal(api.translateText("   "), "   ");
    assert.equal(api.translateText(null), null);
    assert.equal(api.translateText(undefined), undefined);
  });

  test("übersetzt statische und dynamische UI-Texte", () => {
    assert.equal(api.translateText("Dashboard"), "Übersicht");
    assert.equal(api.translateText("Kommend"), "Geplant");
    assert.equal(api.translateText("Upcoming"), "Geplant");
    assert.equal(api.translateText("Subscription paused"), "Abonnement pausiert");
    assert.equal(api.translateText("Subscription resumed"), "Abonnement fortgesetzt");
    assert.equal(api.translateText("Flavors updated"), "Geschmacksrichtungen aktualisiert");
    assert.equal(
      api.translateText("Geschmacksrichtungen updated"),
      "Geschmacksrichtungen aktualisiert",
    );
    assert.equal(api.translateText("Last updated"), "Last updated");
    assert.equal(
      api.translateText("Subscription skipped for 8 weeks"),
      "Abonnement für 8 Wochen übersprungen",
    );
    assert.equal(
      api.translateText("Subscription skipped for 1 week"),
      "Abonnement für 1 Woche übersprungen",
    );
    assert.equal(api.translateText("Subscription #12 Active"), "Abonnement #12 Aktiv");
    assert.equal(
      api.translateText("You have selected 3 of 8 flavors"),
      "Du hast 3 von 8 Geschmacksrichtungen ausgewählt",
    );
    assert.equal(api.translateText("Billed every 1 week"), "Abrechnung alle 1 Woche");
  });

  test("bewahrt Leerraum und ist idempotent", () => {
    const translated = api.translateText("  Next delivery: Jul 06, 2026  ");
    const translatedCurrency = api.translateText("€89.92");
    const germanDate = "6.7.2026";
    const germanTime = "15:30 Uhr";

    assert.equal(translated, "  Nächste Lieferung: 6. Juli 2026  ");
    assert.equal(api.translateText(translated), translated);
    assert.equal(api.translateText(translatedCurrency), translatedCurrency);
    assert.equal(api.translateText(germanDate), germanDate);
    assert.equal(api.translateText(germanTime), germanTime);
  });
});

describe("Datums-, Zeit- und Währungsformate", { concurrency: false }, () => {
  test("formatiert englische Datumsangaben", () => {
    assert.equal(
      api.translateText("Started on Jun 22, 2026"),
      "Gestartet am 22. Juni 2026",
    );
    assert.equal(api.translateText("Monday, Jul 6, 2026"), "Montag, 6. Juli 2026");
    assert.equal(api.translateText("June 2026"), "Juni 2026");
    assert.equal(api.translateText("2026-07-06"), "6.7.2026");
  });

  test("formatiert gültige 12-Stunden-Zeiten und lässt ungültige Werte stehen", () => {
    assert.equal(api.translateText("3:30 PM"), "15:30 Uhr");
    assert.equal(api.translateText("12:05 a.m."), "00:05 Uhr");
    assert.equal(api.translateText("12:00 PM"), "12:00 Uhr");
    assert.equal(api.translateText("12:00 AM"), "00:00 Uhr");
    assert.equal(api.translateText("19:75 PM"), "19:75 PM");
  });

  test("normalisiert verschiedene Euroformate", () => {
    assert.equal(api.translateText("€1234.56"), "1.234,56 €");
    assert.equal(api.translateText("EUR 1,234.56"), "1.234,56 €");
    assert.equal(api.translateText("€1.234,56"), "1.234,56 €");
    assert.equal(api.translateText("89.92 EUR"), "89,92 €");
  });
});

describe("React-Mehrknotentexte", { concurrency: false }, () => {
  test("übersetzt Präfix und Datum aus getrennten Textknoten", () => {
    const paragraph = createElement(["Started on ", "Jun 22, 2026"], {
      tagName: "P",
    });

    refreshElements(paragraph);

    assert.equal(textOf(paragraph), "Gestartet am 22. Juni 2026");
    assert.equal(paragraph.childNodes.length, 2);
  });

  test("übersetzt zusammengesetzte Texte ohne ihre Knotenstruktur zu verändern", () => {
    const flavorsHeading = createElement(
      ["Selected flavors: (", "4", " flavors for ", "4", " weeks)"],
      { tagName: "H3" },
    );
    const selectionHeading = createElement(
      ["You have selected ", "0", " of ", "4", " flavors"],
      { tagName: "H3" },
    );
    const billingText = createElement(["Billed every ", "4", " weeks"], {
      tagName: "P",
    });

    refreshElements(flavorsHeading, selectionHeading, billingText);

    assert.equal(
      textOf(flavorsHeading),
      "Ausgewählte Geschmacksrichtungen: (4 Geschmacksrichtungen für 4 Wochen)",
    );
    assert.equal(
      textOf(selectionHeading),
      "Du hast 0 von 4 Geschmacksrichtungen ausgewählt",
    );
    assert.equal(textOf(billingText), "Abrechnung alle 4 Wochen");
    assert.equal(flavorsHeading.childNodes.length, 5);
    assert.equal(selectionHeading.childNodes.length, 5);
    assert.equal(billingText.childNodes.length, 3);
  });

  test("übersetzt eine aufgeteilte Snackbar mit deutscher Wortstellung", () => {
    const snackbar = createElement(
      ["Subscription skipped for ", "8", " weeks"],
      { tagName: "DIV" },
    );

    refreshElements(snackbar);

    assert.equal(textOf(snackbar), "Abonnement für 8 Wochen übersprungen");
    assert.equal(snackbar.childNodes.length, 3);
  });

  test("übersetzt eine aufgeteilte Aktualisierungs-Snackbar vollständig", () => {
    const snackbar = createElement(["Flavors ", "updated"], {
      tagName: "DIV",
    });

    refreshElements(snackbar);

    assert.equal(textOf(snackbar), "Geschmacksrichtungen aktualisiert");
    assert.equal(snackbar.childNodes.length, 2);
  });

  test("bewahrt eine unbekannte Fragmentaufteilung sicher auf", () => {
    const snackbar = createElement(
      ["Subscription ", "skipped ", "for ", "8 weeks"],
      { tagName: "DIV" },
    );

    refreshElements(snackbar);

    assert.equal(textOf(snackbar), "Subscription skipped for 8 weeks");
    assert.deepEqual(
      snackbar.childNodes.map((node) => node.nodeValue),
      ["Subscription ", "skipped ", "for ", "8 weeks"],
    );
  });

  test("formatiert Eurozeichen und Betrag aus benachbarten Textknoten", () => {
    const price = createElement(["€", "89.92"], { tagName: "SPAN" });

    refreshElements(price);

    assert.equal(textOf(price), "89,92 €");
    assert.equal(price.childNodes.length, 2);
    assert.equal(price.getAttribute("data-stayai-currency"), "EUR");

    // React updates only the original amount node during a later render.
    price.childNodes[1].nodeValue = "179.84";
    refreshElements(price);

    assert.equal(textOf(price), "179,84 €");
  });
});

describe("DOM-Sicherheit und dynamische Updates", { concurrency: false }, () => {
  test("übersetzt sichtbare Day-Picker-Kürzel nur im Kalender", () => {
    const calendarText = createElement("Tu", {
      insideDayPicker: true,
      tagName: "TH",
    });
    const regularText = createElement("Tu", { tagName: "SPAN" });

    refreshElements(calendarText, regularText);

    assert.equal(textOf(calendarText), "Di");
    assert.equal(textOf(regularText), "Tu");
  });

  test("übersetzt zugängliche Day-Picker-Beschriftungen", () => {
    const accessibleWeekday = createElement("", {
      attributes: { "aria-label": "Tuesday" },
      insideDayPicker: true,
      tagName: "TH",
    });
    const regularWeekday = createElement("", {
      attributes: { "aria-label": "Tuesday" },
      tagName: "TH",
    });

    refreshElements(accessibleWeekday, regularWeekday);

    assert.equal(accessibleWeekday.getAttribute("aria-label"), "Dienstag");
    assert.equal(regularWeekday.getAttribute("aria-label"), "Tuesday");
  });

  test("übersetzt sichtbare DOM-Texte und überspringt technische Inhalte", () => {
    const visibleText = createElement("Dashboard", { tagName: "P" });
    const scriptText = createElement("Dashboard", { tagName: "SCRIPT" });

    refreshElements(visibleText, scriptText);

    assert.equal(textOf(visibleText), "Übersicht");
    assert.equal(textOf(scriptText), "Dashboard");
  });

  test("schützt editierbare Inhalte und bekannte Kundendatenanzeigen", () => {
    const editableText = createElement("Subscription Active", {
      insideEditable: true,
      tagName: "DIV",
    });
    const greeting = createElement("Willkommen zurück, ", {
      tagName: "H1",
    });
    greeting.childElementCount = 1;
    const greetingName = createElement("Active", {
      parentElement: greeting,
      tagName: "SPAN",
    });
    const nameLabel = createElement("Name", { tagName: "P" });
    const nameValue = createElement(["Subscription skipped for ", "8", " weeks"], {
      previousElementSibling: nameLabel,
      tagName: "P",
    });
    const emailLabel = createElement("E-Mail-Adresse", { tagName: "P" });
    const emailValue = createElement("Active@example.com", {
      previousElementSibling: emailLabel,
      tagName: "P",
    });
    const regularStatus = createElement("Active", { tagName: "SPAN" });

    refreshElements(
      editableText,
      greeting,
      greetingName,
      nameLabel,
      nameValue,
      emailLabel,
      emailValue,
      regularStatus,
    );

    assert.equal(textOf(editableText), "Subscription Active");
    assert.equal(textOf(greeting), "Willkommen zurück, ");
    assert.equal(textOf(greetingName), "Active");
    assert.equal(textOf(nameValue), "Subscription skipped for 8 weeks");
    assert.equal(textOf(emailValue), "Active@example.com");
    assert.equal(textOf(regularStatus), "Aktiv");
  });

  test("lokalisiert angezeigte Adresswerte ohne Formularfelder zu verändern", () => {
    const streetLabel = createElement("Street Address", { tagName: "P" });
    const streetValue = createElement("123 Main Street", {
      previousElementSibling: streetLabel,
      tagName: "P",
    });
    const streetValueWithLetter = createElement("12a Baker Street", {
      previousElementSibling: streetLabel,
      tagName: "P",
    });
    const streetValueWithUnit = createElement("12/1 Baker Street", {
      previousElementSibling: streetLabel,
      tagName: "P",
    });
    const countryLabel = createElement("Country", { tagName: "P" });
    const countryValue = createElement("Germany", {
      previousElementSibling: countryLabel,
      tagName: "P",
    });
    const formInput = createElement([], {
      tagName: "INPUT",
      value: "123 Main Street",
    });

    refreshElements(
      streetLabel,
      streetValue,
      streetValueWithLetter,
      streetValueWithUnit,
      countryLabel,
      countryValue,
      formInput,
    );

    assert.equal(textOf(streetLabel), "Straße und Hausnummer");
    assert.equal(textOf(streetValue), "Main Street 123");
    assert.equal(textOf(streetValueWithLetter), "Baker Street 12a");
    assert.equal(textOf(streetValueWithUnit), "Baker Street 12/1");
    assert.equal(textOf(countryLabel), "Land");
    assert.equal(textOf(countryValue), "Deutschland");
    assert.equal(formInput.value, "123 Main Street");
  });

  test("bündelt mehrere Textmutationen desselben React-Elements", () => {
    const paragraph = createElement(["Started on ", "Jun 22, 2026"], {
      tagName: "P",
    });
    paragraph.contains = (node) => paragraph.childNodes.includes(node);

    let walkerCalls = 0;
    const nodes = [...paragraph.childNodes];
    document.createTreeWalker = () => {
      walkerCalls += 1;
      return {
        currentNode: null,
        nextNode() {
          this.currentNode = nodes.shift();
          return Boolean(this.currentNode);
        },
      };
    };

    flushMutations(paragraph.childNodes.map((target) => ({
      target,
      type: "characterData",
    })));

    assert.equal(walkerCalls, 1);
    assert.equal(textOf(paragraph), "Gestartet am 22. Juni 2026");
  });

  test("übersetzt neu eingefügte DOM-Teilbäume", () => {
    const addedElement = createElement("Dashboard", { tagName: "P" });
    const nodes = [...addedElement.childNodes];
    document.createTreeWalker = () => ({
      currentNode: null,
      nextNode() {
        this.currentNode = nodes.shift();
        return Boolean(this.currentNode);
      },
    });

    flushMutations([
      {
        addedNodes: [addedElement],
        target: document.documentElement,
        type: "childList",
      },
    ]);

    assert.equal(textOf(addedElement), "Übersicht");
  });

  test("übersetzt nachträglich geänderte Attribute", () => {
    const notificationButton = createElement("", {
      attributes: { "aria-label": "Notifications" },
      tagName: "BUTTON",
    });
    document.createTreeWalker = () => ({ nextNode: () => false });

    flushMutations([
      {
        attributeName: "aria-label",
        target: notificationButton,
        type: "attributes",
      },
    ]);

    assert.equal(notificationButton.getAttribute("aria-label"), "Benachrichtigungen");
  });

  test("stoppt eine bereits eingeplante DOM-Aktualisierung", () => {
    const addedText = createElement("Dashboard", { tagName: "P" }).childNodes[0];
    mutationObserverCallback([
      {
        addedNodes: [addedText],
        target: document.documentElement,
        type: "childList",
      },
    ]);

    assert.equal(typeof animationFrameCallback, "function");

    withoutConsoleInfo(() => api.stop());

    assert.equal(cancelledAnimationFrameId, 1);
    assert.equal(animationFrameCallback, null);
    assert.equal(observerDisconnectCalls, 1);
  });
});
