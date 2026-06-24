# Konzept: StayAI-Übersetzungs- und Formatierungs-Layer

## Ziel und Rahmen

Die StayAI-Oberfläche soll vollständig auf Deutsch erscheinen. Dazu gehören statische UI-Texte, dynamische Abo-Inhalte und Dialoge sowie Datums-, Zeit- und Währungsangaben. Da weder der StayAI-Quellcode noch stabile Translation Keys verfügbar sind, wird der vorhandene JavaScript-Erweiterungspunkt genutzt.

Die Lösung bleibt bewusst installationsfrei: `stayai-de.js` kann direkt in der Browser-Konsole getestet und anschließend in das benutzerdefinierte JavaScript-Feld übernommen werden.

## Analyse der Test-Webseite

Auf der React-Webseite treten deutsche und englische Inhalte gleichzeitig auf:

| Bereich | Beispiele |
| --- | --- |
| Navigation | `Dashboard`, `Subscriptions`, `New Subscription` |
| Status | `Active`, `Paused`, `Skipped` |
| Abo-Details | `Started on Jun 22, 2026`, `Next delivery: Jul 06, 2026` |
| Auswahl | `You have selected 4 of 4 flavors`, `Billed every 4 weeks` |
| Profil | `Delivery Address`, `Street Address`, `Save Address` |
| Dialoge | `Pause subscription`, `July 22nd, 2026`, `Close` |
| Preise | `€89.92` statt `89,92 €` |
| Kalender | `June 2026`, `Su`, `Tu`, `Go to next month` |
| Snackbars | `Subscription paused`, `Subscription skipped for 8 weeks`, `Flavors updated` |
| Adressanzeige | `123 Main Street`, `Germany` |

Die Anwendung lädt Inhalte bei Seitenwechseln, Tabwechseln und Dialogaktionen nach. Eine einmalige Bearbeitung des DOM beim Seitenaufruf wäre deshalb unvollständig.

## Architektur

Die Verarbeitung folgt einer kleinen Pipeline:

```text
DOM-Text oder Attribut
  -> Schutzprüfung für editierbare Inhalte und Kundendaten
  -> exakte Übersetzung
  -> dynamische Übersetzungsregeln
  -> React-Mehrknotenregeln
  -> Datumsformatierung
  -> Zeitformatierung
  -> Euroformatierung
  -> kontextbezogene Anzeigeformatierung
  -> DOM-Aktualisierung nur bei Änderung
```

### Übersetzungen

Ein `Map` enthält bekannte statische UI-Texte. Wiederverwendbare reguläre Ausdrücke behandeln variable Inhalte wie Abo-Nummern, Mengen und Laufzeiten. Ein kleiner Helfer wählt für Mengen die deutsche Singular- oder Pluralform. Strukturierte Regeln übersetzen Sätze, die React auf mehrere Textknoten verteilt, ohne Zahlenknoten zusammenzuführen. Dazu gehören auch Snackbars, deren deutsche Wortstellung von der englischen Vorlage abweicht. Erkennt das Skript einen solchen Satz mit einer unerwarteten Fragmentanzahl, lässt es den vollständigen Satz unverändert, statt eine gemischtsprachige Teilausgabe zu erzeugen.

Die Begriffswahl ist aktuell auf `Abonnement` vereinheitlicht. Zukünftige Bestellungen erhalten den fachlich eindeutigen Status `Geplant` statt `Kommend`.

### Lokalisierung

- Englische Monats- und Wochentagsnamen werden in deutsche Langformen überführt.
- Dynamisch erzeugte React Day Picker erhalten deutsche Monatsüberschriften, Wochentagskürzel und Navigationsbeschriftungen.
- 12-Stunden-Zeiten mit `AM`, `PM`, `a.m.` oder `p.m.` werden als 24-Stunden-Zeit ausgegeben.
- Englische und deutsche Eingabevarianten von Eurobeträgen werden über `Intl.NumberFormat("de-DE")` normalisiert. Das gilt auch, wenn React Währungssymbol und Betrag als getrennte Textknoten rendert.

### Dynamische Inhalte

Ein `MutationObserver` erkennt nachträglich erzeugte oder geänderte DOM-Knoten. Dazu gehören auch kurz eingeblendete Sonner-Snackbars wie `Subscription resumed`, `Subscription skipped for 8 weeks` und `Flavors updated`. Änderungen werden mit `requestAnimationFrame` gebündelt. Überlappende Teilbäume und mehrere Textänderungen desselben React-Elements werden zusammengeführt; eigene Observer-Folgemutationen werden verworfen.

Für häufig aufgerufene Formatierungen werden reguläre Ausdrücke einmalig vorbereitet. Reine Zahlenknoten, etwa Kalendertage und Zähler, überspringen die Übersetzungspipeline vollständig.

Ein lokaler Referenzlauf mit der ausgelesenen Dashboard-Struktur verarbeitet einen vollständigen Durchlauf über 89 Elemente im Mittel in rund `0,30 ms`. Die reine Textpipeline erreichte im Node-Benchmark rund `650.000` Übersetzungen pro Sekunde. Diese Werte dienen als Vergleichsgröße und nicht als Browser-Garantie.

### Schutz vor Nebenwirkungen

Das Skript verändert nur Textknoten und übersetzungsrelevante Attribute. Formularwerte, `contenteditable`-Bereiche, Elemente mit `role="textbox"` und technische Inhalte in `script`, `style`, `template`, `noscript` und `textarea` bleiben unverändert. Bereits deutsche Ausgaben werden bei einem zweiten Lauf nicht erneut verändert.

Die auf der Test-Webseite identifizierten Namens- und E-Mail-Anzeigen werden als Kundendaten geschützt. In der Profilanzeige wird nur die fachlich gewünschte Adressdarstellung angepasst: Eine vorangestellte Hausnummer wechselt in die deutsche Reihenfolge `Straßenname Hausnummer`, und `Germany` erscheint als `Deutschland`. Die Werte der Adress-Eingabefelder bleiben dabei unverändert.

## Qualitätsstrategie

Automatisierte Node-Tests prüfen:

- statische und dynamische Übersetzungen
- leere und fehlende Eingaben sowie Singular- und Pluralformen
- englische Datumsangaben und ISO-Daten
- gültige und ungültige 12-Stunden-Zeiten einschließlich Mittag und Mitternacht
- verschiedene englische und deutsche Euroformate
- Erhalt von Leerraum sowie Idempotenz von Text, Datum, Zeit und Währung
- Batching mehrerer React-Textmutationen
- dynamische Snackbar-Sätze mit variablen Wochenwerten und getrennten Textknoten
- vollständige Geschmacksupdate-Snackbars bei ein- und mehrknotigem React-Rendering
- sichere Behandlung einer unerwarteten React-Fragmentanzahl
- React-stabile Preisupdates
- Day-Picker-Texte und Accessibility-Attribute mit positivem und negativem Kontexttest
- Anzeigeformatierung von Straße, Hausnummern wie `12a` und `12/1` sowie Land bei unveränderten Formularwerten
- Schutz editierbarer Inhalte sowie bekannter Namens- und E-Mail-Anzeigen
- neue Teilbäume, Attributmutationen und Abbruch ausstehender Aktualisierungen

Die manuelle Testmatrix umfasst Dashboard, Abo-Tabs, neues Abo, Bestellverlauf, Profil sowie Pause-, Überspringen-, Storno- und Adressdialoge. Details zur Ausführung stehen in `README.md`.

Beim damaligen DOM-Abgleich wurden 685 echte Elemente aus sechs Hauptseiten und sechs dynamischen Zuständen gegen das Skript geprüft. Zusätzlich wurden die originalen Pause-, Resume- und Überspringen-Snackbars sowie die Profiladresskarte gezielt ausgelesen. Technische IDs wurden aus der Sprachprüfung ausgeschlossen; in diesem Prüfstand wurden keine weiteren sichtbaren englischen Resttexte gefunden. Später entdeckte UI-Texte, etwa `Flavors updated`, wurden als eigene Regressionstests ergänzt.

## Abwägungen und Risiken

- DOM-basierte Übersetzung ist ein pragmatischer Fallback. Neue StayAI-Texte können zusätzliche Regeln benötigen.
- Ein natives i18n-System mit Translation Keys wäre langfristig robuster, kann ohne Kontrolle über die Drittanbieter-App aber nicht nachgerüstet werden.
- Die fachliche Begriffswahl `Abonnement` versus `Abo` und das bevorzugte deutsche Datumsformat sollten vor dem Produktiveinsatz bestätigt werden.
- Vor der produktiven Nutzung sind Tests mit echten Kundenzuständen sowie aktuellen Desktop- und Mobile-Browsern erforderlich.
- Weitere Kundendatenbereiche einer produktiven Version müssen anhand ihrer DOM-Struktur als geschützt erfasst werden.
- Der Day Picker bleibt ohne Zugriff auf seine React-Konfiguration sonntagsbasiert; die DOM-Schicht übersetzt nur Darstellung und Accessibility-Texte.

## Präsentationsablauf

1. Ausgangslage und konkrete Fehler zeigen (2 Minuten).
2. DOM-Pipeline und technische Entscheidungen erklären (4 Minuten).
3. Skript live in der Browser-Konsole ausführen (4 Minuten).
4. Navigation, Dialoge und Formatierung demonstrieren (3 Minuten).
5. Tests, Risiken und nächste Schritte zusammenfassen (2 Minuten).
