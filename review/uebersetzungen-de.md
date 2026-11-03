# Übersetzungsprüfung – Spyglass Weather Card

Aktuelle deutsche Übersetzungen aus [locales/de.json](../locales/de.json) im Branch `feat/german-localization`. **238 Einträge**, davon **14 vom Nutzer bestätigt** (Stand: 03.11.2026). Das Verzeichnis `locales/` ist jetzt die führende Übersetzungsquelle; die JavaScript-Karte enthält daraus generierte Sprachdaten.

**Feedback:** Im Pull Request unter **Files changed** eine konkrete Zeile kommentieren oder die CSV in Excel bearbeiten. Platzhalter wie `{time}` und `{value}` bitte unverändert lassen. Noch nicht geprüfte Einträge sind mit „Offen“ gekennzeichnet.

## Dynamische Wettertexte

| ID | Englisch | Deutsch aktuell | Status | Hinweis |
|---:|---|---|---|---|
| 001 | night | Nacht | Offen | Kann in Debug-Anzeige vorkommen. Kontext prüfen. |
| 002 | several times, first at {time} | mehrmals, erstmals um {time} | Offen |  |
| 003 | at {first}, {second}, and {third} | um {first}, {second} und {third} | Offen |  |
| 004 | at {first} and {second} | um {first} und {second} | Offen |  |
| 005 | at {time} | um {time} | Offen |  |
| 006 | high of {value} {when}, low of {low} {lowWhen} | Höchstwert {value} {when}, Tiefstwert {low} {lowWhen} | Offen |  |
| 007 | and | und | Offen |  |
| 008 | of rain | Regen | Offen |  |
| 009 | of snow | Schnee | Offen |  |
| 010 | {condition} in the evening | abends {condition} | Offen |  |
| 011 | {condition} in the afternoon | nachmittags {condition} | Offen |  |
| 012 | {condition} in the morning | vormittags {condition} | Offen |  |
| 013 | {condition} all day | Den ganzen Tag {condition} | Offen |  |
| 014 | peaking | Maximum | Offen | Zusammen mit „UV …“ auf natürliche Formulierung prüfen. |
| 015 | peaks | Maximum | Offen | Zusammen mit „UV …“ auf natürliche Formulierung prüfen. |
| 016 | UV peaks at {value} ({level}). | Voraussichtlicher UV-Höchstwert {value} ({level}). | Offen |  |
| 017 | UV peaked at {value} ({level}). | UV-Höchstwert {value} ({level}). | Offen |  |
| 018 | UV {form} at {value} ({level}) around {time} | UV {form} bei {value} ({level}) gegen {time} | Offen | Zusammengesetzter Satz; Grammatik im angezeigten Kontext prüfen. |
| 019 | Gusts up to {value} {unit} around {time} | Böen bis {value} {unit} gegen {time} | Offen |  |
| 020 | High of {high} around {highTime}, low of {low} around {lowTime} | Höchstwert {high} gegen {highTime}, Tiefstwert {low} gegen {lowTime} | Offen |  |
| 021 | Gusts:  | Böen:  | Offen |  |
| 022 | Fire risk is {level}. | Waldbrandgefahr: {level}. | Offen |  |
| 023 | Smoke is {value} {unit}, {quality}. | Rauchbelastung: {value} {unit} ({quality}). | Offen |  |
| 024 | Today, a {range}. | Heute: {range}. | Offen |  |
| 025 | {scale} is {value}, {quality}. | {scale} liegt bei {value} ({quality}). | Offen |  |
| 026 | Smoke peaked at {value} {unit} around {time}. | Der Rauchwert erreichte gegen {time} einen Höchststand von {value} {unit}. | Offen |  |
| 027 | Sunrise in: {duration} | Sonnenaufgang in: {duration} | Offen |  |
| 028 | Chart error: {error} | Diagrammfehler: {error} | Offen |  |
| 029 | The air is close to saturation, so fog or dew is likely. | Die Luft ist nahezu gesättigt; Nebel oder Tau ist wahrscheinlich. | Offen |  |
| 030 | The air is close to saturation and below freezing, so frost is likely. | Die Luft ist nahezu gesättigt und unter dem Gefrierpunkt; Frost ist wahrscheinlich. | Offen |  |
| 031 | The air is saturated. | Die Luft ist gesättigt. | Offen |  |
| 032 | Today it ranges from {range}. | Heute bewegt er sich im Bereich {range}. | Offen |  |
| 033 | Dew point is currently {value}°, {level}. | Der Taupunkt liegt aktuell bei {value}° ({level}). | Offen |  |
| 034 | Today's peak is {value} ({level}). | Heutiger Höchstwert: {value} ({level}). | Offen |  |
| 035 | UV index is currently {value}, {level}. | Der UV-Index liegt aktuell bei {value} ({level}). | Offen |  |
| 036 | , with gusts up to {gust} {unit} | , mit Böen bis {gust} {unit} | Offen |  |
| 037 | Wind speeds are {low} to {high} {unit} | Die Windgeschwindigkeiten liegen zwischen {low} und {high} {unit} | Offen |  |
| 038 | Wind speeds were {low} to {high} {unit} | Die Windgeschwindigkeiten lagen zwischen {low} und {high} {unit} | Offen |  |
| 039 | Today, wind speeds are {low} to {high} {unit} | Heute liegen die Windgeschwindigkeiten zwischen {low} und {high} {unit} | Offen |  |
| 040 |  from the {direction} |  aus {direction} | Offen |  |
| 041 | Wind is currently {speed} {unit}{direction}.  | Aktuell weht der Wind mit {speed} {unit}{direction}.  | Offen |  |

## Sonne, Mond und Zeit

| ID | Englisch | Deutsch aktuell | Status | Hinweis |
|---:|---|---|---|---|
| 042 | Feels like | Gefühlt | Offen |  |
| 043 | First light | Beginn der Morgendämmerung | Offen | Astronomisch: zivile Morgendämmerung; Begriff kontextabhängig. |
| 044 | Last light | Ende der Abenddämmerung | Offen | Astronomisch: zivile Abenddämmerung; Begriff kontextabhängig. |
| 045 | Total daylight | Tageslichtdauer | Offen |  |
| 046 | Sunrise | Sonnenaufgang | Offen |  |
| 047 | Sunset | Sonnenuntergang | Offen |  |
| 048 | Solar noon | Sonnenhöchststand | Offen |  |
| 049 | Daylight | Tageslicht | Offen |  |
| 050 | Sunlight | Sonneneinstrahlung | Offen |  |
| 051 | Sun | Sonne | Offen |  |
| 052 | Moon | Mond | Offen |  |
| 053 | Moon phase | Mondphase | Offen |  |
| 054 | Full moon | Vollmond | Offen |  |
| 055 | New moon | Neumond | Offen |  |
| 056 | First quarter | Zunehmender Halbmond | Offen |  |
| 057 | Last quarter | Abnehmender Halbmond | Offen |  |
| 058 | Waxing crescent | Zunehmende Mondsichel | Offen |  |
| 059 | Waning crescent | Abnehmende Mondsichel | Offen |  |
| 060 | Waxing gibbous | Zunehmender Dreiviertelmond | Bestätigt | Übersetzung vom Nutzer am 03.11.2026 bestätigt. |
| 061 | Waning gibbous | Abnehmender Dreiviertelmond | Bestätigt | Übersetzung vom Nutzer am 03.11.2026 bestätigt. |
| 062 | Today | Heute | Offen |  |
| 063 | Tomorrow | Morgen | Offen |  |
| 064 | Yesterday | Gestern | Offen |  |
| 065 | This day | Dieser Tag | Offen |  |
| 066 | Now | Jetzt | Offen |  |
| 067 | Currently | Derzeit | Offen |  |
| 068 | tonight | heute Nacht | Offen |  |
| 069 | tomorrow | morgen | Offen |  |
| 070 | Tonight | Heute Nacht | Offen |  |

## Wetterwerte

| ID | Englisch | Deutsch aktuell | Status | Hinweis |
|---:|---|---|---|---|
| 071 | Temperature | Temperatur | Offen |  |
| 072 | Humidity | Luftfeuchtigkeit | Offen |  |
| 073 | Dew point | Taupunkt | Offen |  |
| 074 | Pressure | Luftdruck | Offen |  |
| 075 | Cloud cover | Bewölkung | Offen |  |
| 076 | Wind | Wind | Offen |  |
| 077 | Wind speed | Windgeschwindigkeit | Offen |  |
| 078 | Wind gusts | Windböen | Offen |  |
| 079 | Gusts | Böen | Offen |  |
| 080 | Wind direction | Windrichtung | Offen |  |
| 081 | Precipitation | Niederschlag | Offen |  |
| 082 | Chance of rain | Regenwahrscheinlichkeit | Offen |  |
| 083 | Rain | Regen | Offen |  |
| 084 | Rain rate | Regenintensität | Offen |  |
| 085 | Rain today | Regen heute | Offen |  |
| 086 | Snow | Schnee | Offen |  |
| 087 | Snow rate | Schneeintensität | Offen |  |
| 088 | Snow today | Schnee heute | Offen |  |
| 089 | Sleet | Schneeregen | Bestätigt | Übersetzung vom Nutzer am 03.11.2026 bestätigt. |
| 090 | UV index | UV-Index | Offen |  |
| 091 | UV Index | UV-Index | Offen |  |
| 092 | Air quality | Luftqualität | Offen |  |
| 093 | Air Quality | Luftqualität | Offen |  |
| 094 | Air quality scale | Luftqualitäts-Skala | Offen |  |
| 095 | Smoke | Rauch | Offen |  |
| 096 | Fire risk | Waldbrandgefahr | Offen |  |
| 097 | Solar | Sonneneinstrahlung | Bestätigt | Übersetzung vom Nutzer am 03.11.2026 bestätigt. |

## Bewertungen und Luftqualität

| ID | Englisch | Deutsch aktuell | Status | Hinweis |
|---:|---|---|---|---|
| 098 | Good | Gut | Offen |  |
| 099 | Fair | Akzeptabel | Bestätigt | Übersetzung vom Nutzer am 03.11.2026 bestätigt. |
| 100 | Moderate | Mäßig | Offen |  |
| 101 | Poor | Schlecht | Offen |  |
| 102 | Very poor | Sehr schlecht | Offen |  |
| 103 | Unhealthy (sens.) | Ungesund (sens.) | Bestätigt | Übersetzung vom Nutzer am 03.11.2026 bestätigt. |
| 104 | Unhealthy | Ungesund | Offen |  |
| 105 | Unhealthy for sensitive groups | Ungesund für empfindliche Gruppen | Bestätigt | Übersetzung vom Nutzer am 03.11.2026 bestätigt. |
| 106 | Very unhealthy | Sehr ungesund | Offen |  |
| 107 | Hazardous | Gefährlich | Offen |  |
| 108 | Low | Niedrig | Bestätigt | Übersetzung vom Nutzer am 03.11.2026 bestätigt. |
| 109 | Very low | Sehr niedrig | Offen |  |
| 110 | Medium | Mittel | Offen |  |
| 111 | High | Hoch | Bestätigt | Übersetzung vom Nutzer am 03.11.2026 bestätigt. |
| 112 | Very high | Sehr hoch | Offen |  |
| 113 | low | niedrig | Bestätigt | Übersetzung vom Nutzer am 03.11.2026 bestätigt. |
| 114 | moderate | mäßig | Bestätigt | Übersetzung vom Nutzer am 03.11.2026 bestätigt. |
| 115 | high | hoch | Bestätigt | Übersetzung vom Nutzer am 03.11.2026 bestätigt. |
| 116 | very high | sehr hoch | Offen |  |
| 117 | extreme | extrem | Offen |  |
| 118 | low risk | geringes Risiko | Offen |  |
| 119 | moderate risk | mittleres Risiko | Offen |  |
| 120 | high risk | hohes Risiko | Offen |  |
| 121 | very high risk | sehr hohes Risiko | Offen |  |
| 122 | very low | sehr niedrig | Offen |  |
| 123 | medium | mittel | Offen |  |
| 124 | No data | Keine Daten | Offen |  |

## Statusmeldungen

| ID | Englisch | Deutsch aktuell | Status | Hinweis |
|---:|---|---|---|---|
| 125 | Loading… | Wird geladen … | Offen |  |
| 126 | Back | Zurück | Offen |  |
| 127 | No sun data | Keine Sonnendaten | Offen |  |
| 128 | No forecast | Keine Vorhersage | Offen |  |
| 129 | No hourly forecast for this day | Keine stündliche Vorhersage für diesen Tag | Offen |  |
| 130 | No recorded history for this day | Für diesen Tag liegen keine Verlaufsdaten vor | Offen |  |

## Visueller Editor

| ID | Englisch | Deutsch aktuell | Status | Hinweis |
|---:|---|---|---|---|
| 131 | Weather entity | Wetter-Entität | Bestätigt | Übersetzung vom Nutzer am 03.11.2026 bestätigt. |
| 132 | Name | Name | Offen |  |
| 133 | Shown under the headline when the subtitle sensor has no text. Empty: the city of your Home Assistant time zone | Wird unter der Überschrift angezeigt, wenn der Untertitel-Sensor leer ist. Ohne Eingabe wird der Ort der Home-Assistant-Zeitzone verwendet. | Offen |  |
| 134 | Forecast type | Vorhersagetyp | Offen |  |
| 135 | Daily | Täglich | Offen |  |
| 136 | Hourly | Stündlich | Offen |  |
| 137 | Twice daily | Zweimal täglich | Offen |  |
| 138 | Feels-like temperature | Gefühlte Temperatur | Offen |  |
| 139 | Appearance | Darstellung | Offen |  |
| 140 | Hide headline | Überschrift ausblenden | Offen |  |
| 141 | The icon, the condition, and the line under it | Symbol, Wetterzustand und Zeile darunter | Offen |  |
| 142 | Hide temperature | Temperatur ausblenden | Offen |  |
| 143 | Hide forecast strip | Vorhersageleiste ausblenden | Offen |  |
| 144 | Debug controls | Debug-Steuerung | Offen |  |
| 145 | Buttons for stepping through every background effect | Schaltflächen zum Durchschalten aller Hintergrundeffekte | Offen |  |
| 146 | Animations | Animationen | Offen |  |
| 147 | Drifting clouds | Ziehende Wolken | Offen |  |
| 148 | Drift with the wind, faster as it picks up; density based on cloud cover. Off: they hold still | Ziehen mit dem Wind; bei stärkerem Wind schneller. Die Dichte richtet sich nach der Bewölkung. Aus: Wolken bleiben stehen. | Offen |  |
| 149 | Drifting fog | Ziehender Nebel | Offen |  |
| 150 | Banks of fog drift with the wind. Off: they hold still | Nebelbänke ziehen mit dem Wind. Aus: Nebel bleibt stehen. | Offen |  |
| 151 | Twinkling stars | Funkelnde Sterne | Offen |  |
| 152 | At night, unless it's raining, snowing, or foggy. Off: they shine steadily | Nachts, sofern es nicht regnet, schneit oder neblig ist. Aus: Sterne leuchten gleichmäßig. | Offen |  |
| 153 | Sun glow | Sonnenlicht-Effekt | Offen |  |
| 154 | Sits where the sun is and warms toward sunset, with a slow pulse. Off: no pulse | Folgt der Sonnenposition und wird gegen Sonnenuntergang wärmer; mit langsamem Pulsieren. Aus: kein Pulsieren. | Offen |  |
| 155 | Rain and hail | Regen und Hagel | Offen |  |
| 156 | Heavier and faster with the rain rate, slanting with the wind | Je stärker der Niederschlag, desto intensiver und schneller; mit dem Wind geneigt. | Offen |  |
| 157 | Snow and sleet | Schnee und Schneeregen | Offen |  |
| 158 | Flakes sway down, drifting with the wind; more of them in heavier snow | Flocken fallen schwingend und werden vom Wind verweht; bei stärkerem Schneefall werden es mehr. | Offen |  |
| 159 | Lightning | Blitze | Offen |  |
| 160 | Only with a thunderstorm now or forecast within two hours; closer storms flash more often | Nur bei aktuellem oder innerhalb von zwei Stunden angekündigtem Gewitter; nähere Gewitter erzeugen häufigere Blitze. | Offen |  |
| 161 | Headline and sky | Überschrift und Himmel | Offen |  |
| 162 | Headline text | Überschriftentext | Offen |  |
| 163 | e.g. "Clear"; falls back to the weather state | Z. B. „Klar“; sonst wird der Zustand der Wetter-Entität verwendet. | Offen |  |
| 164 | Line under the headline | Zeile unter der Überschrift | Offen |  |
| 165 | e.g. "Clear for the hour" | Z. B. „In der nächsten Stunde klar“ | Offen |  |
| 166 | Recorded temperature, for the day chart | Gemessene Temperatur für das Tagesdiagramm | Offen |  |
| 167 | Feels-like sensor | Sensor für gefühlte Temperatur | Offen |  |
| 168 | Optional: shown instead of the weather entity's feels-like | Optional: wird anstelle der gefühlten Temperatur der Wetter-Entität verwendet. | Offen |  |
| 169 | Conditions | Wetterzustände | Offen |  |
| 170 | Recorded conditions, for the day chart's icons and summary | Aufgezeichnete Zustände für Symbole und Zusammenfassung im Tagesdiagramm | Offen |  |
| 171 | Rising/falling arrow beside the headline | Steigender oder fallender Pfeil neben der Überschrift | Offen |  |
| 172 | How cloudy the sky looks | Steuert die dargestellte Bewölkung des Himmels | Offen |  |
| 173 | Weather alerts | Wetterwarnungen | Offen |  |
| 174 | Shows a banner while there are alerts | Zeigt bei Warnungen ein Banner | Offen |  |
| 175 | Summaries | Zusammenfassungen | Offen |  |
| 176 | Near-term summary | Kurzfristige Zusammenfassung | Offen |  |
| 177 | Starts the line under the chips, and today's chart summary | Beginnt die Zeile unter den Detailfeldern und die Zusammenfassung des heutigen Diagramms | Offen |  |
| 178 | Coming days summary | Zusammenfassung der nächsten Tage | Offen |  |
| 179 | The rest of the line under the chips | Rest der Zeile unter den Detailfeldern | Offen |  |
| 180 | Precipitation type | Niederschlagsart | Offen |  |
| 181 | Rain, snow, or sleet: picks what falls | Regen, Schnee oder Schneeregen: bestimmt die Niederschlagsanimation | Offen |  |
| 182 | Sleet / freezing rain rate | Schneeregen-/Eisregenintensität | Offen |  |
| 183 | Chips and charts | Detailfelder und Diagramme | Offen |  |
| 184 | Defaults to your country's scale | Standardmäßig wird die Skala deines Landes verwendet | Offen |  |
| 185 | AQHI (Canada) | AQHI (Kanada) | Offen |  |
| 186 | CAQI (Europe) | CAQI (Europa) | Offen |  |
| 187 | Wind from the weather entity | Windwerte aus der Wetter-Entität | Offen |  |
| 188 | For when there is no wind sensor | Wenn kein Windsensor vorhanden ist | Offen |  |
| 189 | Sunlight reaching the ground (W/m²) | Sonneneinstrahlung am Boden (W/m²) | Offen |  |
| 190 | Show chips | Detailfelder anzeigen | Offen |  |
| 191 | Sunrise and sunset | Sonnenaufgang und Sonnenuntergang | Offen |  |
| 192 | Forecast strip | Vorhersageleiste | Offen |  |
| 193 | Entries shown | Angezeigte Einträge | Offen |  |
| 194 | All, Fit, or Number | Alle, automatisch passend oder Anzahl | Offen |  |
| 195 | All | Alle | Offen |  |
| 196 | Fit | Automatisch passend | Offen |  |
| 197 | Entry width | Breite pro Eintrag | Offen |  |
| 198 | Each day or hour in the strip is at least this wide; past that the strip scrolls | Jeder Tag bzw. jede Stunde ist mindestens so breit. Bei mehr Einträgen wird die Leiste scrollbar. | Offen |  |
| 199 | Back to the main view after | Zurück zur Hauptansicht nach | Offen |  |
| 200 | 0 stays on the open view | 0 lässt die geöffnete Detailansicht geöffnet | Offen |  |

## Weitere Bezeichnungen

| ID | Englisch | Deutsch aktuell | Status | Hinweis |
|---:|---|---|---|---|
| 201 | None | Keine | Offen |  |
| 202 | Dim | Schwach | Offen |  |
| 203 | Strong | Stark | Offen |  |
| 204 | Very strong | Sehr stark | Offen |  |
| 205 | Extreme | Extrem | Offen |  |
| 206 | dry | trocken | Offen |  |
| 207 | comfortable | angenehm | Offen |  |
| 208 | slightly humid | leicht schwül | Offen |  |
| 209 | humid | schwül | Offen |  |
| 210 | oppressive | drückend | Offen |  |
| 211 | % lit | % beleuchtet | Bestätigt | Übersetzung vom Nutzer am 03.11.2026 bestätigt. |
| 212 | light | leicht | Offen |  |
| 213 | heavy | stark | Offen |  |
| 214 | very heavy | sehr stark | Offen |  |
| 215 | hazardous | gefährlich | Offen |  |
| 216 | rain | Regen | Offen |  |
| 217 | rain and snow | Regen und Schnee | Offen |  |
| 218 | sunny | sonnig | Offen |  |
| 219 | clear | klar | Offen |  |
| 220 | partly cloudy | teilweise bewölkt | Offen |  |
| 221 | cloudy | bewölkt | Offen |  |
| 222 | foggy | neblig | Offen |  |
| 223 | heavy rain | starker Regen | Offen |  |
| 224 | thunderstorms | Gewitter | Offen |  |
| 225 | snow | Schnee | Offen |  |
| 226 | sleet | Schneeregen | Offen |  |
| 227 | hail | Hagel | Offen |  |
| 228 | windy | windig | Offen |  |
| 229 | north | Norden | Offen |  |
| 230 | northeast | Nordosten | Offen |  |
| 231 | east | Osten | Offen |  |
| 232 | southeast | Südosten | Offen |  |
| 233 | south | Süden | Offen |  |
| 234 | southwest | Südwesten | Offen |  |
| 235 | west | Westen | Offen |  |
| 236 | northwest | Nordwesten | Offen |  |
| 237 | Sun protection recommended. | Sonnenschutz empfohlen. | Offen |  |
| 238 | Heat Warning (sample) | Hitzewarnung (Beispiel) | Offen |  |

---

Diese Review-Dateien liegen ausschließlich im Fork. Es wurde kein Pull Request beim ursprünglichen Repository eingereicht.
