# Übersetzungsprüfung – Spyglass Weather Card

Diese Liste wurde direkt aus `SPYGLASS_DE` im Branch `feat/german-localization` erzeugt. Sie enthält 238 Einträge. **Es ist die Liste der vorhandenen Zuordnungen**, keine Zusicherung, dass bereits alle Texte in der Oberfläche die Übersetzung verwenden. Texte aus Pirate Weather bleiben separat.

**Feedback:** Im Pull Request unter **Files changed** direkt eine Zeile kommentieren oder die CSV in Excel bearbeiten (Spalten `Prüfstatus`, `Eigener Vorschlag`, `Kommentar / Kontext`). Die Spalte `Priorität` ist nur ein automatischer Hinweis, keine abschließende fachliche Bewertung. Platzhalter in geschweiften Klammern wie `{time}` oder `{value}` bitte unverändert lassen.

## Dynamische Wettertexte

| ID | Englisch | Deutsch aktuell | Hinweis |
|---:|---|---|---|
| 001 | night | Nacht | Kann in Debug-Anzeige vorkommen. Kontext prüfen. |
| 002 | several times, first at {time} | mehrmals, erstmals um {time} |  |
| 003 | at {first}, {second}, and {third} | um {first}, {second} und {third} |  |
| 004 | at {first} and {second} | um {first} und {second} |  |
| 005 | at {time} | um {time} |  |
| 006 | high of {value} {when}, low of {low} {lowWhen} | Höchstwert {value} {when}, Tiefstwert {low} {lowWhen} |  |
| 007 | and | und |  |
| 008 | of rain | Regen |  |
| 009 | of snow | Schnee |  |
| 010 | {condition} in the evening | abends {condition} |  |
| 011 | {condition} in the afternoon | nachmittags {condition} |  |
| 012 | {condition} in the morning | vormittags {condition} |  |
| 013 | {condition} all day | Den ganzen Tag {condition} |  |
| 014 | peaking | Maximum | Zusammen mit „UV …“ auf natürliche Formulierung prüfen. |
| 015 | peaks | Maximum | Zusammen mit „UV …“ auf natürliche Formulierung prüfen. |
| 016 | UV peaks at {value} ({level}). | Voraussichtlicher UV-Höchstwert {value} ({level}). |  |
| 017 | UV peaked at {value} ({level}). | UV-Höchstwert {value} ({level}). |  |
| 018 | UV {form} at {value} ({level}) around {time} | UV {form} bei {value} ({level}) gegen {time} | Zusammengesetzter Satz; Grammatik im angezeigten Kontext prüfen. |
| 019 | Gusts up to {value} {unit} around {time} | Böen bis {value} {unit} gegen {time} |  |
| 020 | High of {high} around {highTime}, low of {low} around {lowTime} | Höchstwert {high} gegen {highTime}, Tiefstwert {low} gegen {lowTime} |  |
| 021 | Gusts:  | Böen:  |  |
| 022 | Fire risk is {level}. | Waldbrandgefahr: {level}. |  |
| 023 | Smoke is {value} {unit}, {quality}. | Rauchbelastung: {value} {unit} ({quality}). |  |
| 024 | Today, a {range}. | Heute: {range}. |  |
| 025 | {scale} is {value}, {quality}. | {scale} liegt bei {value} ({quality}). |  |
| 026 | Smoke peaked at {value} {unit} around {time}. | Der Rauchwert erreichte gegen {time} einen Höchststand von {value} {unit}. |  |
| 027 | Sunrise in: {duration} | Sonnenaufgang in: {duration} |  |
| 028 | Chart error: {error} | Diagrammfehler: {error} |  |
| 029 | The air is close to saturation, so fog or dew is likely. | Die Luft ist nahezu gesättigt; Nebel oder Tau ist wahrscheinlich. |  |
| 030 | The air is close to saturation and below freezing, so frost is likely. | Die Luft ist nahezu gesättigt und unter dem Gefrierpunkt; Frost ist wahrscheinlich. |  |
| 031 | The air is saturated. | Die Luft ist gesättigt. |  |
| 032 | Today it ranges from {range}. | Heute bewegt er sich im Bereich {range}. |  |
| 033 | Dew point is currently {value}°, {level}. | Der Taupunkt liegt aktuell bei {value}° ({level}). |  |
| 034 | Today's peak is {value} ({level}). | Heutiger Höchstwert: {value} ({level}). |  |
| 035 | UV index is currently {value}, {level}. | Der UV-Index liegt aktuell bei {value} ({level}). |  |
| 036 | , with gusts up to {gust} {unit} | , mit Böen bis {gust} {unit} |  |
| 037 | Wind speeds are {low} to {high} {unit} | Die Windgeschwindigkeiten liegen zwischen {low} und {high} {unit} |  |
| 038 | Wind speeds were {low} to {high} {unit} | Die Windgeschwindigkeiten lagen zwischen {low} und {high} {unit} |  |
| 039 | Today, wind speeds are {low} to {high} {unit} | Heute liegen die Windgeschwindigkeiten zwischen {low} und {high} {unit} |  |
| 040 |  from the {direction} |  aus {direction} |  |
| 041 | Wind is currently {speed} {unit}{direction}.  | Aktuell weht der Wind mit {speed} {unit}{direction}.  |  |

## Sonne, Mond und Zeit

| ID | Englisch | Deutsch aktuell | Hinweis |
|---:|---|---|---|
| 042 | Feels like | Gefühlt |  |
| 043 | First light | Beginn der Morgendämmerung | Astronomisch: zivile Morgendämmerung; Begriff kontextabhängig. |
| 044 | Last light | Ende der Abenddämmerung | Astronomisch: zivile Abenddämmerung; Begriff kontextabhängig. |
| 045 | Total daylight | Tageslichtdauer |  |
| 046 | Sunrise | Sonnenaufgang |  |
| 047 | Sunset | Sonnenuntergang |  |
| 048 | Solar noon | Sonnenhöchststand |  |
| 049 | Daylight | Tageslicht |  |
| 050 | Sunlight | Sonneneinstrahlung |  |
| 051 | Sun | Sonne |  |
| 052 | Moon | Mond |  |
| 053 | Moon phase | Mondphase |  |
| 054 | Full moon | Vollmond |  |
| 055 | New moon | Neumond |  |
| 056 | First quarter | Zunehmender Halbmond |  |
| 057 | Last quarter | Abnehmender Halbmond |  |
| 058 | Waxing crescent | Zunehmende Mondsichel |  |
| 059 | Waning crescent | Abnehmende Mondsichel |  |
| 060 | Waxing gibbous | Zunehmender Mond | Möglicherweise präziser: „Zunehmender Dreiviertelmond“. |
| 061 | Waning gibbous | Abnehmender Mond | Möglicherweise präziser: „Abnehmender Dreiviertelmond“. |
| 062 | Today | Heute |  |
| 063 | Tomorrow | Morgen |  |
| 064 | Yesterday | Gestern |  |
| 065 | This day | Dieser Tag |  |
| 066 | Now | Jetzt |  |
| 067 | Currently | Derzeit |  |
| 068 | tonight | heute Nacht |  |
| 069 | tomorrow | morgen |  |
| 070 | Tonight | Heute Nacht |  |

## Wetterwerte

| ID | Englisch | Deutsch aktuell | Hinweis |
|---:|---|---|---|
| 071 | Temperature | Temperatur |  |
| 072 | Humidity | Luftfeuchtigkeit |  |
| 073 | Dew point | Taupunkt |  |
| 074 | Pressure | Luftdruck |  |
| 075 | Cloud cover | Bewölkung |  |
| 076 | Wind | Wind |  |
| 077 | Wind speed | Windgeschwindigkeit |  |
| 078 | Wind gusts | Windböen |  |
| 079 | Gusts | Böen |  |
| 080 | Wind direction | Windrichtung |  |
| 081 | Precipitation | Niederschlag |  |
| 082 | Chance of rain | Regenwahrscheinlichkeit |  |
| 083 | Rain | Regen |  |
| 084 | Rain rate | Regenintensität |  |
| 085 | Rain today | Regen heute |  |
| 086 | Snow | Schnee |  |
| 087 | Snow rate | Schneeintensität |  |
| 088 | Snow today | Schnee heute |  |
| 089 | Sleet | Schneeregen | Je nach Datenquelle Eisregen, Schneeregen oder Graupel; Kontext prüfen. |
| 090 | UV index | UV-Index |  |
| 091 | UV Index | UV-Index |  |
| 092 | Air quality | Luftqualität |  |
| 093 | Air Quality | Luftqualität |  |
| 094 | Air quality scale | Luftqualitäts-Skala |  |
| 095 | Smoke | Rauch |  |
| 096 | Fire risk | Waldbrandgefahr |  |
| 097 | Solar | Sonneneinstrahlung | Je nach Kontext „Solar“, „Sonneneinstrahlung“ oder „Solarleistung“. |

## Bewertungen und Luftqualität

| ID | Englisch | Deutsch aktuell | Hinweis |
|---:|---|---|---|
| 098 | Good | Gut |  |
| 099 | Fair | Ordentlich | „Ordentlich“ wirkt für eine Wetter-/Luftqualitätsstufe eventuell ungewohnt. |
| 100 | Moderate | Mäßig |  |
| 101 | Poor | Schlecht |  |
| 102 | Very poor | Sehr schlecht |  |
| 103 | Unhealthy (sens.) | Ungesund (empfindliche Gruppen) | Lange Übersetzung; mögliche Platzprobleme in der Anzeige. |
| 104 | Unhealthy | Ungesund |  |
| 105 | Unhealthy for sensitive groups | Ungesund für empfindliche Gruppen | Als Chip-Label möglicherweise zu lang. |
| 106 | Very unhealthy | Sehr ungesund |  |
| 107 | Hazardous | Gefährlich |  |
| 108 | Low | Niedrig | Kontext prüfen: kann Tiefsttemperatur oder niedrige Risikostufe bedeuten. |
| 109 | Very low | Sehr niedrig |  |
| 110 | Medium | Mittel |  |
| 111 | High | Hoch | Kontext prüfen: kann Höchsttemperatur oder hohe Risikostufe bedeuten. |
| 112 | Very high | Sehr hoch |  |
| 113 | low | niedrig | Stufenbezeichnung; Kleinschreibung im Satz beachten. |
| 114 | moderate | mäßig | Stufenbezeichnung; Kleinschreibung im Satz beachten. |
| 115 | high | hoch | Stufenbezeichnung; Kleinschreibung im Satz beachten. |
| 116 | very high | sehr hoch |  |
| 117 | extreme | extrem |  |
| 118 | low risk | geringes Risiko |  |
| 119 | moderate risk | mittleres Risiko |  |
| 120 | high risk | hohes Risiko |  |
| 121 | very high risk | sehr hohes Risiko |  |
| 122 | very low | sehr niedrig |  |
| 123 | medium | mittel |  |
| 124 | No data | Keine Daten |  |

## Statusmeldungen

| ID | Englisch | Deutsch aktuell | Hinweis |
|---:|---|---|---|
| 125 | Loading… | Wird geladen … |  |
| 126 | Back | Zurück |  |
| 127 | No sun data | Keine Sonnendaten |  |
| 128 | No forecast | Keine Vorhersage |  |
| 129 | No hourly forecast for this day | Keine stündliche Vorhersage für diesen Tag |  |
| 130 | No recorded history for this day | Für diesen Tag liegen keine Verlaufsdaten vor |  |

## Visueller Editor

| ID | Englisch | Deutsch aktuell | Hinweis |
|---:|---|---|---|
| 131 | Weather entity | Wetter-Entität | Alternativ für weniger technische Sprache: „Wetter-Entität“ beibehalten oder „Wetterquelle“? |
| 132 | Name | Name |  |
| 133 | Shown under the headline when the subtitle sensor has no text. Empty: the city of your Home Assistant time zone | Wird unter der Überschrift angezeigt, wenn der Untertitel-Sensor leer ist. Ohne Eingabe wird der Ort der Home-Assistant-Zeitzone verwendet. |  |
| 134 | Forecast type | Vorhersagetyp |  |
| 135 | Daily | Täglich |  |
| 136 | Hourly | Stündlich |  |
| 137 | Twice daily | Zweimal täglich |  |
| 138 | Feels-like temperature | Gefühlte Temperatur |  |
| 139 | Appearance | Darstellung |  |
| 140 | Hide headline | Überschrift ausblenden |  |
| 141 | The icon, the condition, and the line under it | Symbol, Wetterzustand und Zeile darunter |  |
| 142 | Hide temperature | Temperatur ausblenden |  |
| 143 | Hide forecast strip | Vorhersageleiste ausblenden |  |
| 144 | Debug controls | Debug-Steuerung |  |
| 145 | Buttons for stepping through every background effect | Schaltflächen zum Durchschalten aller Hintergrundeffekte |  |
| 146 | Animations | Animationen |  |
| 147 | Drifting clouds | Ziehende Wolken |  |
| 148 | Drift with the wind, faster as it picks up; density based on cloud cover. Off: they hold still | Ziehen mit dem Wind; bei stärkerem Wind schneller. Die Dichte richtet sich nach der Bewölkung. Aus: Wolken bleiben stehen. |  |
| 149 | Drifting fog | Ziehender Nebel |  |
| 150 | Banks of fog drift with the wind. Off: they hold still | Nebelbänke ziehen mit dem Wind. Aus: Nebel bleibt stehen. |  |
| 151 | Twinkling stars | Funkelnde Sterne |  |
| 152 | At night, unless it's raining, snowing, or foggy. Off: they shine steadily | Nachts, sofern es nicht regnet, schneit oder neblig ist. Aus: Sterne leuchten gleichmäßig. |  |
| 153 | Sun glow | Sonnenlicht-Effekt |  |
| 154 | Sits where the sun is and warms toward sunset, with a slow pulse. Off: no pulse | Folgt der Sonnenposition und wird gegen Sonnenuntergang wärmer; mit langsamem Pulsieren. Aus: kein Pulsieren. |  |
| 155 | Rain and hail | Regen und Hagel |  |
| 156 | Heavier and faster with the rain rate, slanting with the wind | Je stärker der Niederschlag, desto intensiver und schneller; mit dem Wind geneigt. |  |
| 157 | Snow and sleet | Schnee und Schneeregen |  |
| 158 | Flakes sway down, drifting with the wind; more of them in heavier snow | Flocken fallen schwingend und werden vom Wind verweht; bei stärkerem Schneefall werden es mehr. |  |
| 159 | Lightning | Blitze |  |
| 160 | Only with a thunderstorm now or forecast within two hours; closer storms flash more often | Nur bei aktuellem oder innerhalb von zwei Stunden angekündigtem Gewitter; nähere Gewitter erzeugen häufigere Blitze. |  |
| 161 | Headline and sky | Überschrift und Himmel |  |
| 162 | Headline text | Überschriftentext |  |
| 163 | e.g. "Clear"; falls back to the weather state | Z. B. „Klar“; sonst wird der Zustand der Wetter-Entität verwendet. |  |
| 164 | Line under the headline | Zeile unter der Überschrift |  |
| 165 | e.g. "Clear for the hour" | Z. B. „In der nächsten Stunde klar“ |  |
| 166 | Recorded temperature, for the day chart | Gemessene Temperatur für das Tagesdiagramm |  |
| 167 | Feels-like sensor | Sensor für gefühlte Temperatur |  |
| 168 | Optional: shown instead of the weather entity's feels-like | Optional: wird anstelle der gefühlten Temperatur der Wetter-Entität verwendet. |  |
| 169 | Conditions | Wetterzustände |  |
| 170 | Recorded conditions, for the day chart's icons and summary | Aufgezeichnete Zustände für Symbole und Zusammenfassung im Tagesdiagramm |  |
| 171 | Rising/falling arrow beside the headline | Steigender oder fallender Pfeil neben der Überschrift |  |
| 172 | How cloudy the sky looks | Steuert die dargestellte Bewölkung des Himmels |  |
| 173 | Weather alerts | Wetterwarnungen |  |
| 174 | Shows a banner while there are alerts | Zeigt bei Warnungen ein Banner |  |
| 175 | Summaries | Zusammenfassungen |  |
| 176 | Near-term summary | Kurzfristige Zusammenfassung |  |
| 177 | Starts the line under the chips, and today's chart summary | Beginnt die Zeile unter den Detailfeldern und die Zusammenfassung des heutigen Diagramms |  |
| 178 | Coming days summary | Zusammenfassung der nächsten Tage |  |
| 179 | The rest of the line under the chips | Rest der Zeile unter den Detailfeldern |  |
| 180 | Precipitation type | Niederschlagsart |  |
| 181 | Rain, snow, or sleet: picks what falls | Regen, Schnee oder Schneeregen: bestimmt die Niederschlagsanimation |  |
| 182 | Sleet / freezing rain rate | Schneeregen-/Eisregenintensität |  |
| 183 | Chips and charts | Detailfelder und Diagramme |  |
| 184 | Defaults to your country's scale | Standardmäßig wird die Skala deines Landes verwendet |  |
| 185 | AQHI (Canada) | AQHI (Kanada) |  |
| 186 | CAQI (Europe) | CAQI (Europa) |  |
| 187 | Wind from the weather entity | Windwerte aus der Wetter-Entität |  |
| 188 | For when there is no wind sensor | Wenn kein Windsensor vorhanden ist |  |
| 189 | Sunlight reaching the ground (W/m²) | Sonneneinstrahlung am Boden (W/m²) |  |
| 190 | Show chips | Detailfelder anzeigen |  |
| 191 | Sunrise and sunset | Sonnenaufgang und Sonnenuntergang |  |
| 192 | Forecast strip | Vorhersageleiste |  |
| 193 | Entries shown | Angezeigte Einträge |  |
| 194 | All, Fit, or Number | Alle, automatisch passend oder Anzahl |  |
| 195 | All | Alle |  |
| 196 | Fit | Automatisch passend |  |
| 197 | Entry width | Breite pro Eintrag |  |
| 198 | Each day or hour in the strip is at least this wide; past that the strip scrolls | Jeder Tag bzw. jede Stunde ist mindestens so breit. Bei mehr Einträgen wird die Leiste scrollbar. |  |
| 199 | Back to the main view after | Zurück zur Hauptansicht nach |  |
| 200 | 0 stays on the open view | 0 lässt die geöffnete Detailansicht geöffnet |  |

## Weitere Bezeichnungen

| ID | Englisch | Deutsch aktuell | Hinweis |
|---:|---|---|---|
| 201 | None | Keine |  |
| 202 | Dim | Schwach |  |
| 203 | Strong | Stark |  |
| 204 | Very strong | Sehr stark |  |
| 205 | Extreme | Extrem |  |
| 206 | dry | trocken |  |
| 207 | comfortable | angenehm |  |
| 208 | slightly humid | leicht schwül |  |
| 209 | humid | schwül |  |
| 210 | oppressive | drückend |  |
| 211 | % lit | % beleuchtet | Eventuell „% beleuchtet“ oder „% beleuchtete Mondfläche“. |
| 212 | light | leicht |  |
| 213 | heavy | stark |  |
| 214 | very heavy | sehr stark |  |
| 215 | hazardous | gefährlich |  |
| 216 | rain | Regen |  |
| 217 | rain and snow | Regen und Schnee |  |
| 218 | sunny | sonnig |  |
| 219 | clear | klar |  |
| 220 | partly cloudy | teilweise bewölkt |  |
| 221 | cloudy | bewölkt |  |
| 222 | foggy | neblig |  |
| 223 | heavy rain | starker Regen |  |
| 224 | thunderstorms | Gewitter |  |
| 225 | snow | Schnee |  |
| 226 | sleet | Schneeregen |  |
| 227 | hail | Hagel |  |
| 228 | windy | windig |  |
| 229 | north | Norden |  |
| 230 | northeast | Nordosten |  |
| 231 | east | Osten |  |
| 232 | southeast | Südosten |  |
| 233 | south | Süden |  |
| 234 | southwest | Südwesten |  |
| 235 | west | Westen |  |
| 236 | northwest | Nordwesten |  |
| 237 | Sun protection recommended. | Sonnenschutz empfohlen. |  |
| 238 | Heat Warning (sample) | Hitzewarnung (Beispiel) |  |

---

Diese Review-Dateien bleiben zunächst **nur im Fork**. Der ursprüngliche Entwickler erhält weder die Übersetzungsliste noch einen Pull Request, außer auf ausdrücklichen Wunsch.
