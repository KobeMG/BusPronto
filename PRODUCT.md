# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary: UCR students on the San Pedro campus, rushing between classes, who open the app to see when the next internal or external bus leaves so they don't miss it. Secondary (evidenced, not confirmed): staff and the broader campus community browsing events, cinema, and allies.

## Product Purpose

BusPronto answers one question instantly: "¿cuánto falta para el próximo bus?" It aggregates UCR internal (free) and external bus schedules — Alajuela, Heredia, Alajuelita, Coronado, Desamparados, San Juan de Dios, Pavas, Tibás — into one place with a live countdown, so students stop searching scattered PDFs and stop guessing. Success means a student never misses a bus they could have caught.

## Positioning

The live countdown ("cronómetro en vivo") is the meaningfully different mechanism: instead of a timetable, the app shows seconds remaining to the next bus, updates the tab title with minutes remaining, and sits one tap from the home screen as an installable PWA. Independent and free, not an official UCR or transport-company product.

## Operating Context

- Used on mobile, often between classes, on campus Wi-Fi and cellular; must load instantly and stay readable outdoors on a phone screen.
- PWA installable to the home screen; web push notifications for schedule changes and delays.
- Data is maintained by an admin panel (login-protected) backed by Supabase: schedules, stops, alerts, events, cinema, ads/aliados, suggestions, users.
- Spanish-language throughout; Costa Rica locale.

## Capabilities and Constraints

- Internal bus routes: select a stop, see live countdown + full schedule by day, free (Tarifa: GRATUITO).
- External bus routes: 8 destinations, each with stops and fares.
- Bus alerts: active alerts surfaced via bell + push notifications.
- Secondary surfaces: Cine Universitario cartelera (in-person + Zoom), Semana U events agenda by day, sponsors/aliados with ads and business links, configuration (install, notifications, share, about).
- Admin: schedules, events, alerts, cinema, aliados, suggestions, users, push notifications, password.
- QR redirect routes (`/qr/:stopId`) point physical stop signage to the live stop page.
- Constraint: independent and informational only — not an official UCR or transport-company app (stated disclaimer in Configuración).
- Constraint: AGPL-3.0 licensed.
- Open decision: none material beyond the confirmed scope above.

## Brand Commitments

- Name: BusPronto. Tagline: "La grandeza nace de pequeños comienzos."
- Creator identity: Kobe Moya (Kode Creative), surfaced in Configuración's "Acerca de" with social/contact links.
- Voice: informal, friendly, Spanish ("¿cuánto falta para el próximo bus?").
- The independent, non-official disclaimer must remain visible.

## Evidence on Hand

- Real schedule data lives in Supabase (tables + views `v_salidas_*`, `v_horarios_*`), not the repo; the repo holds queries only.
- Live surfaces with confirmed copy: Home, Internal/External routes, BusStop/ExternalBusStop, Cinema, Eventos, Aliados, Configuración, Admin.
- Absence future work must not fabricate: no user testimonials, no ridership/usage benchmarks, no official UCR endorsement.

## Product Principles

1. The answer is the countdown, not the timetable — lead with "next bus in X".
2. One tap from open to answer; anything slower fails the rushing student.
3. Independent and honest: never imply official UCR or transport-company status.
4. Buses are the core; campus extras (cinema, events, allies) serve without crowding it.
5. Works where students actually are: mobile, weak signal, installable, offline-tolerant.

## Accessibility & Inclusion

No product-specific requirement established beyond general mobile readability outdoors.
