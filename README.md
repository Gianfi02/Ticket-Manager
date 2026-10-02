# Ticket Manager

Web app per la gestione dei ticket di assistenza di un ufficio customer service.

- **Backend:** Java 21, Spring Boot 4 (REST, JPA, Validation, Security + JWT), PostgreSQL
- **Frontend:** Angular 22 (componenti standalone, signals, reactive forms), Angular Material
- **Test:** JUnit 5 + MockMvc su H2 in memoria (backend), Vitest (frontend)

```
backend/    API REST Spring Boot
frontend/   Applicazione Angular
render.yaml Configurazione per il deploy su Render
```

## Avvio in locale

### 1. Database
Crea il database su PostgreSQL:

```sql
CREATE DATABASE ticketmanager;
```

Le credenziali predefinite sono `postgres` / `postgres`. Se le tue sono diverse, impostale con variabili d'ambiente prima di avviare il backend (PowerShell):

```powershell
$env:SPRING_DATASOURCE_USERNAME = "postgres"
$env:SPRING_DATASOURCE_PASSWORD = "la-tua-password"
```

Le tabelle vengono create automaticamente all'avvio.

### 2. Backend (porta 8080)
```powershell
cd backend
.\mvnw spring-boot:run
```

### 3. Frontend (porta 4200)
```powershell
cd frontend
npm install
npx ng serve
```

Apri http://localhost:4200 e accedi con **admin / admin123**.
In sviluppo le chiamate a `/api` sono inoltrate al backend da `proxy.conf.json`.

### Test
```powershell
cd backend;  .\mvnw test
cd frontend; npx ng test --watch=false
```

## API REST

Tutti gli endpoint, eccetto login e health, richiedono l'header `Authorization: Bearer <token>`.

| Metodo | Endpoint | Descrizione |
|---|---|---|
| POST | `/api/auth/login` | Login, restituisce il token JWT |
| GET | `/api/tickets` | Elenco ticket (più recenti prima) |
| GET | `/api/tickets/{id}` | Dettaglio ticket |
| POST | `/api/tickets` | Crea ticket (stato APERTO) |
| PUT | `/api/tickets/{id}` | Modifica ticket (non consentito se CHIUSO) |
| PATCH | `/api/tickets/{id}/take-charge` | APERTO → IN_CARICO |
| PATCH | `/api/tickets/{id}/close` | IN_CARICO → CHIUSO |
| DELETE | `/api/tickets/{id}` | Elimina ticket |
| GET | `/api/health` | Stato del servizio |

Codici di errore: `400` dati non validi (con `fieldErrors` per campo), `401` non autenticato, `404` ticket inesistente, `409` operazione non consentita nello stato attuale.

## Copertura dei requisiti

| Requisito | Implementazione |
|---|---|
| RF01 Autenticazione | `AuthController`, `JwtService`, `SecurityConfig`; frontend `Login`, `authGuard`, `authInterceptor`, logout nella toolbar |
| RF02 Creazione | `POST /api/tickets`, ID auto-generato, stato APERTO, data di creazione; `TicketForm` |
| RF03 Elenco | `TicketList`: tabella su desktop, schede su mobile |
| RF04 Ricerca/filtri | `ticket-filter.ts`: ricerca per ID o titolo, filtro per stato e priorità |
| RF05 Dettaglio | `TicketDetail` |
| RF06 Presa in carico | `PATCH .../take-charge` |
| RF07 Aggiornamento | `PUT /api/tickets/{id}`, aggiorna la data dell'ultima modifica |
| RF08 Chiusura | `PATCH .../close`, data di chiusura; ticket chiuso non modificabile (409) |
| RF09 Ticket chiusi | Viste "Da gestire / Chiusi / Tutti"; righe chiuse attenuate e barrate |
| RF10 Eliminazione | `DELETE`, dialog di conferma |
| RF11 Errori | `GlobalExceptionHandler` (backend), `errorMessage()` + snackbar/box di errore (frontend) |
| RF12 Validazione | Bean Validation su `TicketRequest` + validatori equivalenti nel form Angular |

## Deploy su Render (piano gratuito)

1. Pubblica il progetto su un repository GitHub.
2. Su Render scegli **New → Blueprint** e seleziona il repository: `render.yaml` crea
   - `ticketmanager-db`: database PostgreSQL gratuito (scade dopo 30 giorni)
   - `ticketmanager-backend`: Web Service Docker (`backend/Dockerfile`), già collegato al database
   - `ticketmanager-frontend`: Static Site con rewrite `/*` → `/index.html`
3. Durante la creazione inserisci:
   - `ADMIN_PASSWORD`: la password dell'amministratore
   - `CORS_ALLOWED_ORIGINS`: l'URL del frontend, ad esempio `https://ticketmanager-frontend.onrender.com`

   Le credenziali del database e `JWT_SECRET` vengono impostate automaticamente.
4. Se l'URL del backend è diverso da `https://ticketmanager-backend.onrender.com`, aggiorna `frontend/src/environments/environment.ts` e rifai il deploy del frontend.

**Nota:** sul piano gratuito il backend va in pausa dopo circa 15 minuti senza richieste. La prima richiesta successiva impiega circa un minuto. Prima di una demo apri `/api/health` per riattivarlo.
