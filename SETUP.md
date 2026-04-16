# Sauna App — Návod na spuštění

## Co budete potřebovat (vše zdarma)
1. Účet na **Vercel** → vercel.com (kde appka "bydlí")
2. Účet na **Supabase** → supabase.com (databáze)
3. Volitelně: účet na **Twilio** (SMS správci sauny)

---

## Krok 1 — Databáze (Supabase)

1. Jděte na [supabase.com](https://supabase.com) a vytvořte si účet
2. Vytvořte nový projekt (např. "sauna-app"), zapamatujte si heslo
3. Jděte do **SQL Editor** a vložte celý obsah souboru `supabase-schema.sql`
4. Klikněte **Run** — vytvoří se tabulky a přidají se členky
5. Jděte do **Settings → API** a zkopírujte:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role secret` → `SUPABASE_SERVICE_ROLE_KEY`

---

## Krok 2 — Push notifikace (VAPID klíče)

Spusťte v terminálu (nebo nechte vývojáře):
```bash
npx web-push generate-vapid-keys
```
Zkopírujte `Public Key` → `NEXT_PUBLIC_VAPID_PUBLIC_KEY`
a `Private Key` → `VAPID_PRIVATE_KEY`

---

## Krok 3 — Nasazení na Vercel

1. Jděte na [vercel.com](https://vercel.com) a přihlaste se přes GitHub
2. Klikněte **Add New Project** a vyberte tento repozitář
3. Před kliknutím na Deploy přidejte **Environment Variables**:

| Proměnná | Hodnota |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | z Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | z Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | z Supabase |
| `ADMIN_PIN` | váš 4místný PIN (např. 1234) |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | z kroku 2 |
| `VAPID_PRIVATE_KEY` | z kroku 2 |
| `VAPID_EMAIL` | `mailto:vas@email.cz` |
| `CRON_SECRET` | náhodný řetězec (např. `mojeHeslo123`) |

4. Klikněte **Deploy** — za 2 minuty máte URL appky

---

## Krok 4 — SMS správci (volitelné)

Pokud chcete SMS správci sauny když 6+ lidí potvrdí:
1. Vytvořte účet na [twilio.com](https://twilio.com)
2. Přidejte do Vercel Environment Variables:
   - `TWILIO_ACCOUNT_SID`
   - `TWILIO_AUTH_TOKEN`
   - `TWILIO_FROM_PHONE` (ve formátu +420...)
3. V Supabase SQL editoru zadejte číslo správce sauny:
```sql
UPDATE groups SET manager_phone = '+420xxxxxxxxx' WHERE slug = 'zeny';
UPDATE groups SET manager_phone = '+420xxxxxxxxx' WHERE slug = 'muzi';
```

---

## Krok 5 — QR kód pro saunu

1. Otevřete appku → skupina → Admin (zadejte PIN)
2. Dole uvidíte URL pro check-in, např: `https://vasaapp.vercel.app/zeny/checkin`
3. Jděte na [qr-code-generator.com](https://www.qr-code-generator.com)
4. Vložte URL, stáhněte QR kód, vytiskněte a přilepte do sauny

---

## Přidání členů mužské skupiny

V Supabase SQL editoru:
```sql
WITH g AS (SELECT id FROM groups WHERE slug = 'muzi')
INSERT INTO members (group_id, name)
SELECT g.id, m.name FROM g,
  (VALUES ('Honza'), ('Petr'), ('Karel')) AS m(name);
```

---

## Jak to funguje

- **Každou středu 8:00** — appka automaticky pošle notifikaci ženám: "Zítra sauna — přijdeš?"
- **Každý čtvrtek 8:00** — appka automaticky pošle notifikaci mužům
- **V sauně** — naskenujte QR kód → klepněte na své jméno → hotovo
- **Vyúčtování** — Admin → Vyúčtování → Zkopírovat pro WhatsApp
