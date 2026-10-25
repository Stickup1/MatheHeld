# MatheHeld

## Produktkonzept

**MatheHeld** ist eine Mathelern-App für Kinder der 5. Klasse. In einer freundlichen Superheldenwelt lösen die Kinder kurze, automatisch erstellte Missionen und bauen dabei ihre Fähigkeiten aus. Im Mittelpunkt stehen verständliche Aufgaben, sichtbarer Lernfortschritt und das Gefühl, durch Übung besser zu werden; Belohnungen unterstützen das Lernen, ersetzen es aber nicht.

## Spielerlebnis

Die Startseite zeigt das aktive Heldenprofil, das aktuelle Level, den Fortschritt zum nächsten Level und die nächste empfohlene Mission. Eine Mission dauert etwa 5 bis 10 Minuten und behandelt ein klar benanntes Thema. Vor der ersten Aufgabe gibt es einen kurzen, kindgerechten Hinweis oder ein Beispiel. Nach jeder Antwort folgt direkt eine Erklärung: Was war richtig, welcher Rechenweg hilft und worauf sollte man beim nächsten Mal achten?

Die Welt besteht aus thematischen Einsatzgebieten, zum Beispiel **Zahlenstadt**, **Bruchgebirge**, **Einheitenhafen** und **Geometrie-Akademie**. Jedes Gebiet enthält mehrere Level. Eine Mission kann aus einer Mischung aus Kopfrechnen, Eingabeaufgaben, Zuordnungen und einfachen Sachaufgaben bestehen. Eine optionale, nicht strafende „Heldentipp“-Hilfe gibt einen Denkanstoß, ohne sofort die Lösung zu verraten.

## Lerninhalte und Aufgabengenerator

Die App erzeugt Aufgaben lokal aus geprüften Vorlagen und Regeln, statt zufällige Zahlen ohne Lernziel zusammenzustellen. Jede Aufgabe erhält intern Angaben zu Thema, Unterthema, Schwierigkeitsstufe, Zahlenbereich, Antwortformat und Lösungserklärung. Der Generator setzt passende Werte ein und prüft vor der Anzeige, dass die Aufgabe lösbar ist und die berechnete Lösung zur Erklärung passt.

Geeignete Themen für den Einstieg in Klasse 5:

- Natürliche Zahlen: Stellenwert, Zahlen ordnen, addieren, subtrahieren, multiplizieren und dividieren
- Rechenregeln und einfache Klammeraufgaben
- Überschlagen und Plausibilität von Ergebnissen
- Einfache Brüche und Anteile
- Größen und Einheiten, zum Beispiel Zeit, Länge und Masse
- Geometrische Grundbegriffe, Umfang und einfache Figuren
- Sachaufgaben mit alltagsnahen, kindgerechten Kontexten

Die Schwierigkeit passt sich vorsichtig an die letzten Antworten an: Bei sicher gelösten Aufgaben werden Zahlen oder Zwischenschritte anspruchsvoller; bei wiederholten Fehlern folgen ein Hinweis, ein leichteres Beispiel und später eine neue Übungsaufgabe zum selben Lernziel. Fehler kosten weder Leben noch bereits verdiente Belohnungen. Eine Mission bleibt jederzeit pausierbar.

## Level und Abzeichen

- **Level** stehen für den langfristigen Lernweg. Erfahrungspunkte gibt es für abgeschlossene Übung und regelmäßige Wiederholung, nicht nur für fehlerfreie Serien.
- **Gebietslevel** werden durch bearbeitete Missionen und gezeigte Sicherheit in einem Thema freigeschaltet. So ist erkennbar, was bereits geübt wurde und was als Nächstes kommt.
- **Abzeichen** würdigen konkrete Lernleistungen, etwa „Zahlen-Entdecker“ für Stellenwertaufgaben, „Dranbleiber“ für mehrere Lerntage oder „Erklär-Held“ für sorgfältig bearbeitete Aufgaben.
- Belohnungen bleiben freundlich und nicht beschämend: keine Ranglisten, keine öffentlichen Profile, keine Bestrafung für Pausen und keine kostenpflichtigen Zufallsbelohnungen.

## Profile und Fortschritt ohne Datenbank

Zum Start wird kein Konto und kein Server benötigt. Auf einem Gerät können mehrere Profile angelegt werden, zum Beispiel für verschiedene Kinder. Jedes Profil hat einen frei wählbaren Namen und getrennte Einstellungen, Lernstände, Level, Abzeichen und Missionsverläufe. Ein Profilwechsel ist direkt über die Startseite möglich.

Die Daten bleiben im Browser auf dem verwendeten Gerät. **IndexedDB** eignet sich als lokaler Speicher für Profile, Fortschritt und Aufgabenverläufe; eine kleine Versionsangabe im gespeicherten Format ermöglicht spätere Datenmigrationen. Falls IndexedDB nicht verfügbar ist, sollte die App verständlich darauf hinweisen, statt unbemerkt Fortschritt zu verlieren. Lokale Browserdaten sind nicht mit einem Backup gleichzusetzen: Werden Browserdaten gelöscht oder Gerät beziehungsweise Browser gewechselt, hilft der Export beim Wiederherstellen.

## Export und Datenschutz

- Fortschritt pro Profil als JSON exportieren und später in der App wieder importieren. Der Export enthält Profilname, bearbeitete Themen, Ergebnisse, Level, Abzeichen und Exportzeitpunkt.
- Aufgaben einer Mission als druckfreundliches PDF exportieren; optional mit separatem Lösungsblatt. Zusätzlich kann ein maschinenlesbarer JSON-Export für Aufgaben angeboten werden.
- Vor dem Import eine Vorschau zeigen und klarstellen, welches Profil ergänzt oder ersetzt wird. Fehlerhafte oder unbekannte Exportdateien dürfen vorhandene Daten nicht überschreiben.
- Daten ausschließlich lokal verarbeiten. Keine Anmeldung, Werbung, Analyse-Tracker oder Übertragung an einen Server im ersten Ausbauschritt.
- Profile und einzelne Verläufe müssen löschbar sein; vor dem Löschen gibt es eine Bestätigung.

## Beispiel für eine Mission

**Einsatz: Die Brücke zur Zahlenstadt** — Thema: schriftliche Multiplikation. Die App zeigt ein kurzes Beispiel, stellt anschließend Aufgaben mit kontrolliert wachsendem Zahlenbereich und gibt nach jeder Antwort eine passende Rückmeldung. Am Ende sieht das Kind, welche Aufgaben sicher waren, was es noch einmal üben kann und wie viel Fortschritt im Gebiet erzielt wurde. Ein neues Abzeichen gibt es nur, wenn eine passende Lernleistung erreicht wurde.

## Erster sinnvoller Ausbau

1. Startseite, Profilanlage und Profilwechsel
2. Ein Themengebiet mit lokalem Aufgabengenerator, Antwortprüfung und Erklärungen
3. Missionsabschluss, Erfahrungspunkte, Level und erste Abzeichen
4. Speichern und Wiederherstellen des Lernstands im Browser
5. Fortschritts-JSON sowie druckfreundlicher Aufgabenexport
6. Weitere Themengebiete und adaptive Wiederholungsmissionen

Vor einem Einsatz mit Kindern sollten Aufgaben und Lösungen fachlich geprüft, auf kleinen Bildschirmen getestet und Import, Export sowie Verhalten bei gelöschten Browserdaten gezielt erprobt werden.# MatheHeld

## Produktkonzept

**MatheHeld** ist eine Mathelern-App für Kinder der 5. Klasse. In einer freundlichen Superheldenwelt lösen die Kinder kurze, automatisch erstellte Missionen und bauen dabei ihre Fähigkeiten aus. Im Mittelpunkt stehen verständliche Aufgaben, sichtbarer Lernfortschritt und das Gefühl, durch Übung besser zu werden; Belohnungen unterstützen das Lernen, ersetzen es aber nicht.

## Spielerlebnis

Die Startseite zeigt das aktive Heldenprofil, das aktuelle Level, den Fortschritt zum nächsten Level und die nächste empfohlene Mission. Eine Mission dauert etwa 5 bis 10 Minuten und behandelt ein klar benanntes Thema. Vor der ersten Aufgabe gibt es einen kurzen, kindgerechten Hinweis oder ein Beispiel. Nach jeder Antwort folgt direkt eine Erklärung: Was war richtig, welcher Rechenweg hilft und worauf sollte man beim nächsten Mal achten?

Die Welt besteht aus thematischen Einsatzgebieten, zum Beispiel **Zahlenstadt**, **Bruchgebirge**, **Einheitenhafen** und **Geometrie-Akademie**. Jedes Gebiet enthält mehrere Level. Eine Mission kann aus einer Mischung aus Kopfrechnen, Eingabeaufgaben, Zuordnungen und einfachen Sachaufgaben bestehen. Eine optionale, nicht strafende „Heldentipp“-Hilfe gibt einen Denkanstoß, ohne sofort die Lösung zu verraten.

## Lerninhalte und Aufgabengenerator

Die App erzeugt Aufgaben lokal aus geprüften Vorlagen und Regeln, statt zufällige Zahlen ohne Lernziel zusammenzustellen. Jede Aufgabe erhält intern Angaben zu Thema, Unterthema, Schwierigkeitsstufe, Zahlenbereich, Antwortformat und Lösungserklärung. Der Generator setzt passende Werte ein und prüft vor der Anzeige, dass die Aufgabe lösbar ist und die berechnete Lösung zur Erklärung passt.

Geeignete Themen für den Einstieg in Klasse 5:

- Natürliche Zahlen: Stellenwert, Zahlen ordnen, addieren, subtrahieren, multiplizieren und dividieren
- Rechenregeln und einfache Klammeraufgaben
- Überschlagen und Plausibilität von Ergebnissen
- Einfache Brüche und Anteile
- Größen und Einheiten, zum Beispiel Zeit, Länge und Masse
- Geometrische Grundbegriffe, Umfang und einfache Figuren
- Sachaufgaben mit alltagsnahen, kindgerechten Kontexten

Die Schwierigkeit passt sich vorsichtig an die letzten Antworten an: Bei sicher gelösten Aufgaben werden Zahlen oder Zwischenschritte anspruchsvoller; bei wiederholten Fehlern folgen ein Hinweis, ein leichteres Beispiel und später eine neue Übungsaufgabe zum selben Lernziel. Fehler kosten weder Leben noch bereits verdiente Belohnungen. Eine Mission bleibt jederzeit pausierbar.

## Level und Abzeichen

- **Level** stehen für den langfristigen Lernweg. Erfahrungspunkte gibt es für abgeschlossene Übung und regelmäßige Wiederholung, nicht nur für fehlerfreie Serien.
- **Gebietslevel** werden durch bearbeitete Missionen und gezeigte Sicherheit in einem Thema freigeschaltet. So ist erkennbar, was bereits geübt wurde und was als Nächstes kommt.
- **Abzeichen** würdigen konkrete Lernleistungen, etwa „Zahlen-Entdecker“ für Stellenwertaufgaben, „Dranbleiber“ für mehrere Lerntage oder „Erklär-Held“ für sorgfältig bearbeitete Aufgaben.
- Belohnungen bleiben freundlich und nicht beschämend: keine Ranglisten, keine öffentlichen Profile, keine Bestrafung für Pausen und keine kostenpflichtigen Zufallsbelohnungen.

## Profile und Fortschritt ohne Datenbank

Zum Start wird kein Konto und kein Server benötigt. Auf einem Gerät können mehrere Profile angelegt werden, zum Beispiel für verschiedene Kinder. Jedes Profil hat einen frei wählbaren Namen und getrennte Einstellungen, Lernstände, Level, Abzeichen und Missionsverläufe. Ein Profilwechsel ist direkt über die Startseite möglich.

Die Daten bleiben im Browser auf dem verwendeten Gerät. **IndexedDB** eignet sich als lokaler Speicher für Profile, Fortschritt und Aufgabenverläufe; eine kleine Versionsangabe im gespeicherten Format ermöglicht spätere Datenmigrationen. Falls IndexedDB nicht verfügbar ist, sollte die App verständlich darauf hinweisen, statt unbemerkt Fortschritt zu verlieren. Lokale Browserdaten sind nicht mit einem Backup gleichzusetzen: Werden Browserdaten gelöscht oder Gerät beziehungsweise Browser gewechselt, hilft der Export beim Wiederherstellen.

## Export und Datenschutz

- Fortschritt pro Profil als JSON exportieren und später in der App wieder importieren. Der Export enthält Profilname, bearbeitete Themen, Ergebnisse, Level, Abzeichen und Exportzeitpunkt.
- Aufgaben einer Mission als druckfreundliches PDF exportieren; optional mit separatem Lösungsblatt. Zusätzlich kann ein maschinenlesbarer JSON-Export für Aufgaben angeboten werden.
- Vor dem Import eine Vorschau zeigen und klarstellen, welches Profil ergänzt oder ersetzt wird. Fehlerhafte oder unbekannte Exportdateien dürfen vorhandene Daten nicht überschreiben.
- Daten ausschließlich lokal verarbeiten. Keine Anmeldung, Werbung, Analyse-Tracker oder Übertragung an einen Server im ersten Ausbauschritt.
- Profile und einzelne Verläufe müssen löschbar sein; vor dem Löschen gibt es eine Bestätigung.

## Beispiel für eine Mission

**Einsatz: Die Brücke zur Zahlenstadt** — Thema: schriftliche Multiplikation. Die App zeigt ein kurzes Beispiel, stellt anschließend Aufgaben mit kontrolliert wachsendem Zahlenbereich und gibt nach jeder Antwort eine passende Rückmeldung. Am Ende sieht das Kind, welche Aufgaben sicher waren, was es noch einmal üben kann und wie viel Fortschritt im Gebiet erzielt wurde. Ein neues Abzeichen gibt es nur, wenn eine passende Lernleistung erreicht wurde.

## Erster sinnvoller Ausbau

1. Startseite, Profilanlage und Profilwechsel
2. Ein Themengebiet mit lokalem Aufgabengenerator, Antwortprüfung und Erklärungen
3. Missionsabschluss, Erfahrungspunkte, Level und erste Abzeichen
4. Speichern und Wiederherstellen des Lernstands im Browser
5. Fortschritts-JSON sowie druckfreundlicher Aufgabenexport
6. Weitere Themengebiete und adaptive Wiederholungsmissionen

Vor einem Einsatz mit Kindern sollten Aufgaben und Lösungen fachlich geprüft, auf kleinen Bildschirmen getestet und Import, Export sowie Verhalten bei gelöschten Browserdaten gezielt erprobt werden.

## App lokal starten

Voraussetzung ist eine aktuelle Node.js-Version. Die App benötigt keinen Server und keine Datenbank für Lernstände; Profile und Fortschritt werden im Browser über IndexedDB gespeichert.

```sh
npm install
npm run dev
```

Der Entwicklungsserver zeigt nach dem Start die lokale URL an. Für einen Produktionsbuild:

```sh
npm run build
```

Die erste Zahlenmission enthält fünf geprüfte Beispielaufgaben. Weitere Missionen werden lokal aus thematischen Rechenvorlagen mit passenden Zahlenwerten erzeugt. Fortschritt lässt sich als JSON sichern und importieren; Aufgaben können als JSON oder über den Browserdruck als PDF mit optionalem Lösungsblatt exportiert werden.