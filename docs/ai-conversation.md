# AI Conversation Log

This log documents the iterative development process using Codex CLI, from initial concept to the final tested solution.

This document contains relevant excerpts from the Codex CLI conversation used during the development of this case study.

The conversation was manually copied and structured into Markdown for readability. Long tool outputs, repeated browser API documentation, local file paths, and unrelated debug noise were shortened or omitted. The relevant prompts, implementation decisions, review steps, and testing-related parts were preserved.

## Notes on shortening

- Long browser, Playwright, MCP and API documentation outputs were omitted.
- Local file paths were replaced with `[local user path omitted]` or `[local Codex path omitted]`.
- Repeated DOM snapshots and non-relevant debug output were shortened.
- The raw conversation log can be provided separately if required.

## Conversation excerpts

> Erstelle mir ein Konzept für die Aufgabe und erstelle mir eine javascript datei mit dem Code, den ich in der Browser Konsole verwenden kann. Schau dir dazu auch die Website an: https://metaflow-x-casestudy.lovable.app/?name=Name

> _[Shortened for readability: 11 previous messages omitted. Full raw Codex/tool output removed from this curated version.]_

Erledigt:

- [Konzept](../konzept.md)
- [JavaScript für die Browser-Konsole](../stayai-de.js)

Das Skript übersetzt statische und dynamische React-Inhalte, Dialoge und Attribute. Außerdem formatiert es Datum, Uhrzeit und Euro-Beträge nach `de-DE`.

Geprüft wurden alle Hauptseiten sowie Pause-, Storno-, Adress- und Geschmacksdialoge. Syntaxcheck und sechs Formatierungstests sind erfolgreich. Für den Live-Test einfach den vollständigen Inhalt von `stayai-de.js` in die Browser-Konsole einfügen.

> erstelle mir eine agent.md für dieses Projekt

> erstelle mir eine agent.md für dieses Projekt und überprüfe die js datei nach best practices und strukturiere die md dateien sinnvoll. Erkläre mir hinterher sinnvoll die js datei und deren funktionen

> _[Shortened for readability: 8 previous messages omitted. Full raw Codex/tool output removed from this curated version.]_

Erstellt und überarbeitet:

- [agent.md](../agent.md)
- [README.md](../README.md)
- [tasks.md](../tasks.md)
- [konzept.md](../konzept.md)
- [aufgabe.md](../aufgabe.md)
- [Tests](../stayai-de.test.js)

**JavaScript-Aufbau**
- Die IIFE kapselt das Skript und beendet vor einer erneuten Ausführung die alte Instanz.
- `exactTranslations` enthält feste Übersetzungen.
- `replacements` übersetzt variable Texte wie Abonnementnummern, Mengen und Laufzeiten.
- `formatEnglishDates()` konvertiert englische Datumsangaben.
- `formatTimes()` wandelt AM/PM-Zeiten ins 24-Stunden-Format um.
- `parseLocalizedNumber()` und `formatEuroAmounts()` unterstützen deutsche und englische Zahlenformate.
- `translateText()` führt alle Übersetzungs- und Formatierungsschritte zusammen.
- `processNode()` bearbeitet DOM-Texte und relevante Accessibility-Attribute, überspringt aber technische Inhalte.
- Der `MutationObserver` erkennt neue React-Inhalte und bündelt Änderungen performant.
- `window.StayAIDe` stellt `refresh()`, `translateText()` und `stop()` bereit.

Der vollständige Aufbau ist in [`stayai-de.js`](../stayai-de.js) dokumentiert.

Verbessert wurden Idempotenz, Währungsparser, Zeitvalidierung, Performance und der Schutz von Script-, Style-, Template- und Formulardaten. Syntaxprüfung und alle sechs automatisierten Tests sind erfolgreich. Die manuelle Browser-Abschlussprüfung ist in `tasks.md` bewusst noch offen.

> ist das javascript sinnvoll geschrieben? Benutzt man wirklich jede funktion dort für die Übersetzung und Formatierung für Datum, Währung und Uhrzeit? Bitte schreiben auch auf englisch sinnvolle Kommentare an die Funktionen

> _[Shortened for readability: 4 previous messages omitted. Full raw Codex/tool output removed from this curated version.]_

Ja, das JavaScript ist für eine DOM-basierte Konsolenlösung sinnvoll strukturiert. Jede benannte Funktion wird verwendet, aber nicht jede formatiert direkt:

```text
MutationObserver
→ schedule()
→ processNode()
→ translateTextNode() / translateElementAttributes()
→ translateText()
→ Datum + Uhrzeit + Währung
```

`parseLocalizedNumber()` ist eine Hilfsfunktion für die Währungsformatierung. `processNode()` und `schedule()` sind für dynamische React-Inhalte und Performance zuständig.

Ich habe alle Funktionen in [stayai-de.js](../stayai-de.js) mit kurzen englischen Kommentaren versehen. Syntaxprüfung und alle sechs Tests laufen weiterhin erfolgreich.

Die einzige grundsätzliche Einschränkung: Eine DOM-Übersetzung ist ein pragmatischer Fallback. Ein natives i18n-System wäre robuster, steht bei dieser Drittanbieter-App aber nicht zur Verfügung.

> Währungsformatierung passt nicht. Ist in einem span-Tag und € Zeichen ist vor Summe das entspricht nicht de Standard

> _[Shortened for readability: 6 previous messages omitted. Full raw Codex/tool output removed from this curated version.]_

Du hattest recht: React rendert `€` und `89.92` teilweise als zwei getrennte Textknoten innerhalb eines `span` oder `td`. Die bisherige Logik konnte sie deshalb nicht gemeinsam formatieren.

[formatSplitEuroAmount()](../stayai-de.js) verbindet sie logisch und erzeugt:

```text
89,92 €
```

Die React-Knotenstruktur bleibt dabei erhalten. Ein entsprechender [Regressionstest](../stayai-de.test.js) wurde ergänzt. Alle sieben Tests sind erfolgreich.

> ich find eimmer noch fehler in den texten mit den styling klassen text-sm text-muted-foreground. Es steht dort "started on" das ist falsch

> _[Shortened for readability: 4 previous messages omitted. Full raw Codex/tool output removed from this curated version.]_

Fehler gefunden und behoben: React trennt `"Started on "` und das Datum in zwei Textknoten. Durch das vorherige `trim()` konnte die alte Regex nicht greifen.

Die Regel in [stayai-de.js](../stayai-de.js) funktioniert jetzt für beide DOM-Varianten:

```text
Started on Jun 22, 2026
→ Gestartet am 22. Juni 2026
```

Auch `Next delivery`, `Skipped until` und `Paused until` wurden entsprechend korrigiert. Alle acht Tests bestehen.

Wichtig: Den aktualisierten vollständigen Code erneut in die Browser-Konsole einfügen, da bereits ausgeführter Konsolencode nicht automatisch durch Dateiänderungen aktualisiert wird.

> Suche mir für Kommend ein besseres naming. Passender wäre im deutschen "offen" oder "in Bearbeitung". Styling Klassen der Stelle: inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-primary text-primary
>
> User context
>
> Images:
> - `[Screenshot omitted]`

> _[Shortened for readability: 2 previous messages omitted. Full raw Codex/tool output removed from this curated version.]_

Ich habe **„Geplant“** gewählt:

- **Geplant:** präzise für eine zukünftige Lieferung
- **Offen:** möglich, aber unspezifisch
- **In Bearbeitung:** irreführend, solange Fulfillment noch nicht begonnen hat

`Kommend` und `Upcoming` werden nun beide zu `Geplant` übersetzt. Die vorhandenen Styling-Klassen bleiben unverändert. Alle acht Tests bestehen.

> es gibt auch date picker auf der website wie zum beispiel mit der id react-day-picker-1 dort  sind die monate noch auf englisch, analysiere die website auf day-picker

> _[Shortened for readability: 4 previous messages omitted. Full raw Codex/tool output removed from this curated version.]_

Der Date Picker wurde analysiert. `react-day-picker-1` ist nur die Monatsüberschrift; der eigentliche Kalender liegt im `.rdp`-Container.

Ergänzt wurden:

- `June 2026` → `Juni 2026`
- `Su/Tu/We/Th` → `So/Di/Mi/Do`
- Englische `aria-label`-Wochentage → Deutsch
- `Go to previous/next month` → deutsche Navigationsbeschriftungen
- Dynamische Aktualisierung beim Monatswechsel

Die Übersetzungen sind bewusst auf `.rdp` begrenzt ([stayai-de.js](../stayai-de.js)). Alle neun Tests bestehen.

Hinweis: Der Kalender beginnt weiterhin sonntags. Für einen echten Wochenbeginn am Montag müsste React Day Picker selbst mit deutscher Locale konfiguriert werden; ein nachträgliches Umsortieren des DOM wäre riskant. Den aktualisierten Code erneut vollständig in der Konsole ausführen.

> es gibt auch eine snack bar, wenn man auf fortsetzen klickt. Diese snack bar ist nicht übersetzt

> _[Shortened for readability: 4 previous messages omitted. Full raw Codex/tool output removed from this curated version.]_

Die Snackbar wurde analysiert. Sie wird dynamisch als Sonner-Toast mit `role="status"` eingefügt und enthält:

```text
Subscription resumed
```

Dafür wurde ergänzt:

```text
Abonnement fortgesetzt
```

Der bestehende `MutationObserver` übersetzt die Snackbar automatisch beim Einblenden. Alle neun Tests bestehen. Bitte den aktualisierten Code erneut vollständig in der Browser-Konsole ausführen.

> die h3 mit der styling klasse class="font-medium" wurde noch nicht komplett übersetzt. Bitte untersuche noch mal jeden Screen und prüfe jeden Text in den Tags. Wenn es mehrere Texte enthält machst du fehler

> _[Shortened for readability: 8 previous messages omitted. Full raw Codex/tool output removed from this curated version.]_

Der vollständige Screen-Audit hat drei Mehrknotenfehler gefunden und behoben:

```text
Selected flavors: (4 flavors for 4 weeks)
→ Ausgewählte Geschmacksrichtungen: (4 Geschmacksrichtungen für 4 Wochen)

You have selected 0 of 4 flavors
→ Du hast 0 von 4 Geschmacksrichtungen ausgewählt

Billed every 4 weeks
→ Abrechnung alle 4 Wochen
```

Die neuen [Split-Text-Regeln](../stayai-de.js) erhalten alle React- und Zahlenknoten. Dashboard, Abonnements, neues/bearbeitetes Abonnement, Verlauf, Profil, Einstellungen, Dialoge, Kalender und Snackbar wurden geprüft.

Alle zehn Tests bestehen. Den aktualisierten Code bitte erneut vollständig in der Browser-Konsole ausführen.

> aktualisiere die agent.md und füge kommentare in die js datei. Mache sie human readable friendly, dass sie einfach und schnell zu verstehen ist. Innerhalb eines Meetings schnell zu überschauen. Kommentare auch an die Funktionen wie Währung, Format, Datumsformat etc. damit sie schnell zu finden sind

> _[Shortened for readability: 6 previous messages omitted. Full raw Codex/tool output removed from this curated version.]_

Aktualisiert:

- [stayai-de.js](../stayai-de.js) hat jetzt einen Code-Guide und sechs klar erkennbare Bereiche.
- Alle Funktionen besitzen kurze englische Kommentare.
- Datum, Uhrzeit und Währung enthalten konkrete Beispiele wie `€89.92 → 89,92 €`.
- Lange Konfigurationen und reguläre Ausdrücke wurden besser umgebrochen.
- [agent.md](../agent.md) enthält verbindliche Regeln für verständlichen, Meeting-tauglichen Code.

Alle zehn Tests laufen weiterhin erfolgreich.

> bitte prüfe die website mit den neuen skript nochmal intensiv und passe die funktion nach best practices an. Sie soll aber weiterhin gut les- und wartbar sein. Zusätzlich achte auf performance.

> _[Shortened for readability: 25 previous messages omitted. Full raw Codex/tool output removed from this curated version.]_

Intensive Prüfung abgeschlossen:

- 685 echte DOM-Elemente aus zwölf Seiten- und Dialogzuständen geprüft
- Keine sichtbaren englischen Resttexte gefunden
- Datums-RegEx werden nur einmal kompiliert
- Reine Zahlenknoten werden früh übersprungen
- Überlappende Observer-Mutationen werden gebündelt
- React-Preisupdates bleiben stabil
- Elf Tests bestehen

Performance: ca. `0,30 ms` pro Dashboard-Durchlauf und rund `650.000` Texttransformationen pro Sekunde im lokalen Referenzlauf.

Aktualisiert wurden [stayai-de.js](../stayai-de.js), [Tests](../stayai-de.test.js), [Konzept](../konzept.md) und [agent.md](../agent.md).

Eine direkte automatisierte Konsoleninjektion wurde vom Browser verhindert. Deshalb wurde das aktuelle Skript gegen frisch ausgelesene, strukturgetreue Website-DOMs ausgeführt. Für die finale Abgabe sollte es noch einmal manuell vollständig in die Konsole eingefügt werden.

> in der snackbar steht aber noch Abonnement paused oder skipped for 8 weeks. Das ist falsch

> _[Shortened for readability: 4 previous messages omitted. Full raw Codex/tool output removed from this curated version.]_

Beide Snackbar-Texte sind korrigiert:

```text
Subscription paused
→ Abonnement pausiert

Subscription skipped for 8 weeks
→ Abonnement für 8 Wochen übersprungen
```

Die Überspringen-Regel funktioniert dynamisch auch für 1, 4 oder 12 Wochen und berücksichtigt `Woche/Wochen`. Alle elf Tests bestehen. Den aktualisierten Code bitte erneut vollständig in der Konsole ausführen.

> schau dir bitte aber auch dieses div mit diesen style klassen an: rounded-lg border bg-card text-card-foreground shadow-sm
>
> Eingetragende Straße und Hausnummer ist vom Format falsch und Land ist Germany und nicht Deutschland

> _[Shortened for readability: 4 previous messages omitted. Full raw Codex/tool output removed from this curated version.]_

Die Adresskarte wird jetzt korrekt lokalisiert:

```text
123 Main Street → Main Street 123
Germany         → Deutschland
```

Die Umstellung gilt gezielt für die Anzeige im Profil. Das Bearbeitungsformular behält weiterhin den gespeicherten Originalwert, damit keine Kundendaten unbeabsichtigt verändert werden.

Alle zwölf Tests bestehen. Den aktualisierten Code erneut vollständig in der Browser-Konsole ausführen.

> bitte passe md Dateien nach deinem neuen Wissensstand an

> _[Shortened for readability: 4 previous messages omitted. Full raw Codex/tool output removed from this curated version.]_

Die Markdown-Dateien sind aktualisiert:

- `README.md`: vollständige Featureübersicht, zwölf Tests und technische Grenzen
- `konzept.md`: Day Picker, Snackbars, Mehrknotentexte, Adressanzeige und Performance
- `tasks.md`: aktueller Umsetzungsstand
- `agent.md`: neue Regeln für Snackbars, Kundendaten und Prüfabläufe
- `aufgabe.md`: als Originalquelle unverändert

Syntaxprüfung und alle zwölf Tests sind erfolgreich.

> bitte strukturiere die js dateien human readable friendly. Die Tests müssen auch gut erklärbar sein

> _[Shortened for readability: 6 previous messages omitted. Full raw Codex/tool output removed from this curated version.]_

Beide JavaScript-Dateien sind neu strukturiert:

- `stayai-de.js`: gemeinsame Elementverarbeitung über `processElement()`, weniger Wiederholung und besser umgebrochene Formatierungslogik.
- `stayai-de.test.js`: wiederverwendbare DOM-Fixtures und vier verständliche Testbereiche:
  - Textübersetzung
  - Datum, Zeit und Währung
  - React-Mehrknotentexte
  - DOM-Sicherheit und dynamische Updates

Die Testausgabe ist dadurch im Meeting direkt erklärbar. Alle 13 Tests und beide Syntaxprüfungen sind erfolgreich. README, Tasks und Agent-Regeln wurden ebenfalls angepasst.

> schaue noch mal die test datei an

> _[Shortened for readability: 14 previous messages omitted. Full raw Codex/tool output removed from this curated version.]_

Die [Testdatei](../stayai-de.test.js) ist jetzt übersichtlich strukturiert:

- Gemeinsame Browser- und DOM-Fixtures
- Vier fachliche Test-Suites
- Separate Day-Picker-Tests für Text und `aria-label`
- Echte Prüfung unveränderter Formularwerte
- Verständliche Fehlermeldungen für Observer-Tests
- Sauberes Aufräumen der Browser-Mocks

Verifiziert: **13 Tests in 4 Suites, alle erfolgreich**. Syntaxprüfung für Skript und Tests ebenfalls bestanden.

> verbesserungsvorschläge für die tests:
> Tests (stayai-de.test.js)
> 1. Fehlende Randfälle für translateText
>
> Leere Strings und null/undefined (Guard-Zweig in translateText ist ungetestet)
> Singular-Sonderfall bei Wochen: "1 week" → "1 Woche" (aktuell nur weeks-Plural getestet)
> Zeit 12:00 PM → 12:00 Uhr und 12:00 AM → 00:00 Uhr (Mitternacht/Mittag sind Sonderfälle bei % 12)
> 2. Idempotenz-Test ist unvollständig
> Nur zwei Fälle getestet – fehlende Überprüfung für Datumsformate (z. B. "6.7.2026" bleibt unverändert) und Zeitformate ("15:30 Uhr" bleibt unverändert).
>
> 3. translateSplitTextElement bei Fragmentanzahl-Mismatch ungetestet
> Der Early-return if (translatedFragments.length !== textNodes.length) return ist nicht abgedeckt.
>
> 4. Adress-Test: Keine Überprüfung, dass das Label selbst nicht verändert wird
> Der Test prüft nur den Wert, aber nicht ob das Label-Element unverändert bleibt.
>
> Analysiere die Vorschläge, wie sinnvoll sie sind und passe es sonst dementsprechend an

> _[Shortened for readability: 6 previous messages omitted. Full raw Codex/tool output removed from this curated version.]_

Die Vorschläge waren überwiegend sinnvoll und wurden umgesetzt.

- Guard-Fälle für `""`, Leerzeichen, `null` und `undefined`
- Singular bei `Billed every 1 week` korrigiert und getestet
- Mittag und Mitternacht getestet
- Idempotenz für deutsche Datums- und Zeitformate ergänzt
- Fragmentanzahl-Mismatch abgesichert
- Adresslabels werden explizit auf korrekte Übersetzung geprüft
- Singularlogik auch für Geschmacksrichtungen und weitere Wochenangaben verbessert
- Testanzahl in [README.md](../README.md) und [tasks.md](../tasks.md) aktualisiert

Beim Adresslabel war „unverändert“ nicht ganz richtig: `Street Address` soll zu `Straße und Hausnummer` werden. Der Test prüft nun genau diese erwartete Übersetzung.

Ergebnis: **15 Tests in 4 Suites, alle erfolgreich**.

> Und im Hauptskript folgende Punkte
>
> 1. Regex-Objekte mit g-Flag werden geteilt (Bugrisiko)
> weekdayMonthDatePattern, monthDatePattern etc. sind globale Konstanten mit g-Flag. Bei wiederholten Aufrufen von formatEnglishDates mit demselben String kann lastIndex zu falschen Ergebnissen führen – allerdings schützt result.replace(...) davor, weil replace bei Regex-Objekten lastIndex intern zurücksetzt. Kein aktiver Bug, aber potenziell verwirrend.
>
> 2. splitTextRules deckt nur 3 Muster ab, replacements kennt mehr
> Z. B. "Subscription skipped for N weeks" als Split-Text-Knoten würde nicht funktionieren – aktuell aber wohl kein realer Fall.
>
> 3. formatAddressDisplayElement: Hausnummern mit Buchstaben (z. B. "12a Baker Street") werden korrekt behandelt – aber "12/1 Baker Street" auch. Ein Test dafür fehlt.
>
> 4. Kein Test für DayPicker-Attributübersetzung außerhalb des .rdp-Containers – der negative Fall (insideDayPicker: false) wird für Attribute nicht geprüft.

> _[Shortened for readability: 5 previous messages omitted. Full raw Codex/tool output removed from this curated version.]_

Alle vier Punkte sind geprüft und sinnvoll berücksichtigt:

1. **Globale RegEx:** Kein aktiver Fehler. Ein Kommentar erklärt nun ausdrücklich, dass `String.replace` den `lastIndex` zurücksetzt.
2. **Split-Texte:** `Subscription skipped for N weeks` funktioniert jetzt auch über drei React-Textknoten.
3. **Adressen:** `12a Baker Street` und `12/1 Baker Street` werden getestet.
4. **Day Picker:** `aria-label="Tuesday"` bleibt außerhalb von `.rdp` unverändert.

README und Aufgabenliste wurden auf **16 Tests** aktualisiert. Alle 16 Tests sowie beide Syntaxprüfungen bestehen.

> prüfe noch mal auf human readable friendly und merke dir das. Dies soll immer erfüllt sein. Passe außerdem die md Dateien jetzt mit dem finalen Ergebnis an. und merke dir das. Dies soll immer erfüllt sein. Passe außerdem die md Dateien jetzt mit dem finalen Ergebnis an.

> _[Shortened for readability: 10 previous messages omitted. Full raw Codex/tool output removed from this curated version.]_

Finaler Lesbarkeitsdurchgang abgeschlossen:

- `stayai-de.js`: Singular-/Plural-Helfer ergänzt, Monatstabelle entzerrt
- `stayai-de.test.js`: wiederholte Konsolenlogik durch verständlichen Helfer ersetzt
- `agent.md`: Human-Readable-Regel dauerhaft und verpflichtend festgehalten
- `README.md`, `konzept.md` und `tasks.md`: finalen Funktions- und Teststand dokumentiert
- `aufgabe.md` blieb als unveränderte Originalanforderung erhalten

Verifiziert: **16 Tests bestanden**, beide JavaScript-Dateien syntaktisch korrekt, keine auffällig langen Codezeilen.

> ich habe für die read me noch vorschläge:
> 1. Badges ganz oben – Zeigt auf einen Blick den Projektstatus:
>
> (Statische Badges, kein CI nötig)
>
> 2. Vorher/Nachher-Screenshot – Du hast es angesprochen: Ein einziges Bild des Dashboards vor und nach dem Einfügen des Skripts. Zwischen ## Schnellstart und der Schritt-Liste platziert.
>
> 3. Problemstellung in einem Satz – Die erste Zeile erklärt was, aber nicht warum es schwierig ist. Ein kurzer Kontext-Satz hilft Bewertern, die Aufgabe einzuschätzen:
>
> Da kein Quellcodezugriff und keine Translation Keys existieren, muss die Übersetzung auf DOM-Ebene arbeiten und React-Rendering-Besonderheiten berücksichtigen.
>
> 4. Testanzahl in ## Lokale Prüfung korrigieren – Steht 16 Tests, die Testsuite hat aber 13. Das fällt Prüfern sofort auf.
>
> 5. Sprachkonsistenz – README ist komplett auf Deutsch, das ist für eine deutsche Case Study korrekt. Konsistent lassen.

> _[Shortened for readability: 21 previous messages omitted. Full raw Codex/tool output removed from this curated version.]_

Die Vorschläge sind umgesetzt. Die Testzahl blieb bei **16**, da die aktuelle Suite tatsächlich 16 Tests enthält.

![Dashboard vorher](../assets/dashboard-before.png)

![Dashboard nachher](../assets/dashboard-after.png)

[README.md](../README.md) enthält jetzt:

- drei statische Status-Badges
- präzisierte Problemstellung
- echte Vorher-/Nachher-Screenshots
- weiterhin vollständig deutsche Sprache
- aktualisierte Projektstruktur

Alle 16 Tests bestehen weiterhin.

> er hat in der snackbar immer noch fehler wie: "Geschmacksrichtungen updated"

Die Geschmacksupdate-Snackbar wurde vollständig lokalisiert:

```text
Flavors updated
→ Geschmacksrichtungen aktualisiert
```

Ein Regressionstest deckt sowohl einen vollständigen Textknoten als auch die Aufteilung auf zwei React-Textknoten ab.

> ist flavors updated nicht auch falsch? Flavors ist auch englisch

Ja. Beide englischen Bestandteile werden gemeinsam übersetzt. Die Regel wurde anschließend auf die bekannte Snackbar begrenzt, damit andere Texte wie `Last updated` nicht nur teilweise übersetzt werden.

> bitte prüfe noch einmal das Projekt nach best practices und human friendly readable, gibt es in den md Dateien noch Anpassungen?

Der Review bestätigte den klaren, meetingtauglichen Aufbau von Skript und Tests. Gefunden wurden eine zu breite `updated`-Regel, veraltete Angaben mit 16 Tests, fehlerhafte relative Links in diesem Dokument und fehlende Dokumentation der neuen Snackbar.

> bitte passe alle punkte an

Alle Reviewpunkte wurden umgesetzt:

- kontextbezogene Übersetzung von `Flavors updated` bei ein- und mehrknotigem Rendering
- negativer Regressionstest für `Last updated`
- README, Konzept und Aufgabenstatus auf 17 Tests und den neuen Snackbar-Fall aktualisiert
- relative Repository-Links in diesem kuratierten Verlauf korrigiert
- frühere Website-Prüfung zeitlich eingeordnet, ohne einen dauerhaft fehlerfreien Zustand zu behaupten

---

*End of conversation log. Final state: 17 tests passing, zero dependencies, and regression coverage for all observed localization cases.*
