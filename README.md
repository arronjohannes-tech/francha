# ServiceFlow Restaurant ERP

Ein responsives Restaurant-Dashboard für Umsatz, Bestellungen, Lager,
Personal und tägliche Aufgaben.

## In VS Code starten

Voraussetzungen:

- Node.js 22 oder neuer
- VS Code
- Git

Projektordner in VS Code öffnen und anschließend im integrierten Terminal:

```bash
npm ci
npm run dev
```

Danach die angezeigte lokale Adresse im Browser öffnen.

Alternativ: In VS Code `Strg/Cmd + Shift + B` drücken und
**ServiceFlow: Produktions-Build** auswählen. Über **Ausführen und Debuggen**
kann die App samt Entwicklungsserver direkt im Browser gestartet werden.

## Wichtige Dateien

| Datei | Zweck |
| --- | --- |
| `app/page.tsx` | Dashboard, Beispieldaten und Interaktionen |
| `app/globals.css` | Farben, Typografie und globale Styles |
| `app/layout.tsx` | Seitentitel und Metadaten |
| `db/schema.ts` | Drizzle-Datenmodell für Restaurantbetrieb und Lager |
| `drizzle/` | Generierte SQLite-/D1-Migrationen |
| `.vscode/` | Editor-, Build- und Debug-Konfiguration |
| `.openai/hosting.json` | Verbindung zur veröffentlichten Sites-App |

## Befehle

```bash
npm run dev       # Entwicklungsserver
npm run build     # Produktions-Build
npm run lint      # Code-Prüfung
npm test          # Build und Tests
```

## Technik

- React 19 und TypeScript
- Vinext/Vite
- Tailwind CSS 4
- Lucide Icons
- Cloudflare-kompatibler Sites-Build

Die Übersichtsseite enthält weiterhin Demo-KPIs; die produktiven API-Routen
und das D1-Schema sind vorbereitet. Die nächsten Dashboard-Abfragen können
damit schrittweise die statischen Beispieldaten ersetzen.

## Datenmodell

Das MVP-Schema in `db/schema.ts` unterstützt mehrere Restaurants und enthält:

- Restaurants, Benutzer und Rollen (`restaurants`, `users`, `restaurant_users`)
- Kategorien und Produkte mit Preis-/Steuer-Snapshots
- Tische, Bestellungen, Bestellpositionen und Zahlungen
- Zutaten, Rezepturen und unveränderliche Lagerbewegungen

Geldbeträge werden als Centwerte gespeichert. Lagerbestände werden aus
`stock_movements` berechnet, damit Zu- und Abgänge nachvollziehbar bleiben.
Neue Migrationen können mit `npx drizzle-kit generate` erzeugt werden.

## Authentifizierung

Die API unterstützt Registrierung, Anmeldung und Abmeldung über
HttpOnly-Sessions. Für produktive Deployments muss `AUTH_SECRET` als
Umgebungsvariable gesetzt werden. Der erste Aufruf von
`POST /api/auth/register` legt einen Besitzer und ein Restaurant an.
