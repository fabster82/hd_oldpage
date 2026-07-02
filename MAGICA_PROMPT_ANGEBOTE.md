# Magica Prompt – FABSTERsite Angebote Hotel Dirsch

Du arbeitest im Repo `fabster82/lp_Hdirsch_neu`, Branch `fabstersite-v0.1`.

Aufgabe: Baue die Angebotsübersicht und Angebotsdetailseiten für Hotel Dirsch auf Basis dieses Datenpakets.

## Datenquelle

Verwende ausschließlich:

- `data/offers/angebote-dirsch.json`
- Bilder aus `assets/img/dirsch/offers/`
- optional lesbare Übersicht: `docs/angebote-dirsch-datenuebersicht.md`

## Zielseiten

- `/angebote` – Übersicht aller Angebote
- `/angebote/{slug}` – Detailseite je Angebot

## Design-Regeln

- Startseite ist Design-Master.
- Nutze globale FABSTERsite-Komponenten für Hero, Cards, Buttons, Pill-Navigation, Formular-Embed, Galerie/Scroller.
- Keine neuen CSS-Inseln pro Angebot.
- Kein neues experimentelles Slider-/Scroller-System.
- Restaurant und Tagungen nicht inhaltlich anfassen.

## Inhalt

- Texte nicht neu erfinden.
- Übersichtskarten aus `overview_bullets` bauen.
- Detailseiten aus `services`, `starting_price_text`, `price_notes`, `arrival_dates` bauen.
- Bilder exakt aus `image` verwenden.
- Alttexte aus `image_alt` nutzen.

## Buchung

- Wenn `booking.form_url` vorhanden ist: bestehendes OfferBooking-Formular als Buchungsbox verwenden.
- Wenn `booking.type = direct_url`: Direktlink verwenden oder Sonderfall sauber im Code markieren.
- Vorhandenes `config/offer-booking.php` und `OfferBookingRenderer` nicht kaputt machen.

## Akzeptanz

- PHP Syntaxchecks grün.
- GitHub Actions Auto-Deploy grün.
- `/angebote` erreichbar.
- alle 11 Detailseiten erreichbar.
- Bilder laden.
- Buchungsboxen funktionieren.
- Mobile Darstellung sauber.

Commit-Message-Vorschlag:

`Build offers overview and detail pages from extracted Dirsch data`
