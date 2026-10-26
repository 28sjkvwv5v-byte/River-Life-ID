# Riverfly Field Recorder v4 — iPhone + Android

This is an installable web app (PWA) using the eight taxa, abundance scores, and site trigger fields from the supplied Riverfly Partnership RMI form. It provides offline field recording, automatic Open-Meteo weather (online), manual weather fallback, interactive OpenStreetMap GPS map (tiles online), Comber HydrometCloud gauge reference and manual timestamped gauge entry, GPS, local visit storage, photo previews, CSV/JSON export and **online AI photo suggestions** through a Netlify serverless function.

## Publish on Netlify

1. Create a free Netlify account at https://app.netlify.com/ . Put the **contents of this `riverfly_app` folder** in a GitHub repository (the `index.html` and `netlify.toml` should be at its root).
2. In Netlify choose **Add new project → Import an existing project**, select that repository, and deploy. Publish directory is `.` and functions directory is `netlify/functions` (both set in `netlify.toml`). The generated `https://...netlify.app` address is your app.
3. Create an OpenAI API key at https://platform.openai.com/api-keys and enable billing as required. In **Netlify → Project configuration → Environment variables**, add `OPENAI_API_KEY` with the secret value. Set its scope to Functions if offered. Trigger a fresh deployment. **Never paste the API key into the app or a public GitHub repository.** API image analysis can incur usage charges.
4. On iPhone open the HTTPS URL in **Safari → Share → Add to Home Screen**. On Android open in **Chrome → menu → Install app** (or Add to Home screen). Open once while online to cache the app shell. Allow camera and location permissions when prompted.
5. Test AI while online by choosing a clear photograph and pressing **Suggest groups and counts**. The function calls OpenAI's vision model; it returns suggested visible counts, not certified IDs or whole-sample totals. Verify each count before accepting. If an error says AI not configured, check the Netlify environment variable and redeploy.

**Important:** Drag-and-drop static hosting alone may not deploy the function; use Git-based Netlify deployment. No hosted app or API account has been created by this package.

## Offline behaviour and data protection

Field forms and previously cached app pages work without connectivity after first successful online load. AI requires connectivity. Records are stored **only in the current phone's browser local storage**, not synchronized across devices. Export CSV or JSON regularly and back up securely. Photos are previewed in the app but are **not retained in saved records or exports**. Photos selected for AI are transmitted to the configured server and OpenAI for analysis. Do not upload personal/sensitive photos. For professional deployment, add access controls, request quotas, consent/privacy notice, and data retention policy; this starter function does not provide user authentication or rate limiting.

## Field protocol and limitations

The form has eight groups: cased caddisfly; caseless caddisfly; mayfly (Ephemeridae); blue-winged olive (Ephemerellidae); flat-bodied stone clinger (Heptageniidae); olives (Baetidae); stoneflies (Plecoptera); freshwater shrimp. Counts 1–9 score 1, 10–99 score 2, 100–999 score 3, and 1000+ score 4; zero scores 0 in the app. The form recommends estimated counts to nearest 10, 100 or 1000 for larger samples. AI estimates individual visible organisms, which may differ from the sample's verified count. Missing groups must not be treated as verified zeroes. Trigger comparison is informational only; follow your RMI coordinator's procedure.

## Testing checklist

- Save a site, date, recorder, GPS and weather offline; confirm the record remains after closing and reopening the app.
- Verify counts of 0, 1, 9, 10, 99, 100, 999, 1000 give scores 0, 1, 1, 2, 2, 3, 3, 4.
- Photograph a known single specimen, then a tray with 5–10 separated specimens. Compare AI predictions against independently verified human identifications and counts; document false positives, missed insects, overlaps and lighting effects.
- Check AI failure with airplane mode: field entry and save should still work.
- Export CSV/JSON and open them to confirm visit details. Repeat on both Android and iPhone; they do **not** sync automatically.

## Known gaps before production use

Automatic HydrometCloud gauge ingestion (no verified API endpoint), persistent photo storage, cross-device synchronization, secure account sign-in, offline AI, validation of AI accuracy against representative RMI images, and operational protections such as authentication/rate limiting are not yet included. This is a functional pilot, not a validated scientific identification system.

## Version 4: map, weather, Enler gauge

- **GPS map:** Click Get GPS, grant permission, and the marker follows the sampling coordinates. Leaflet/OpenStreetMap tiles require internet; offline GPS coordinate capture still works. The map script is CDN-hosted, so the map itself may be unavailable offline.
- **Local weather:** After GPS, press Import local weather. This uses Open-Meteo current model conditions (not a calibrated local station), filling temperature and weather and recording timestamp, precipitation, cloud, wind, humidity in `weather_meta` for JSON export; CSV includes source and time. You can edit temperature/weather manually. Requires internet.
- **River height:** The Comber (DfI Rivers) water-level sensor is at 54.554632, -5.745349, logger ID 0000205020, 15-minute interval, unit m. Press View current gauge reading to open HydrometCloud, select Comber, then copy the reading and its measurement time into the app. The screenshot's 0.614 m at 2026-10-26 16:30 is historical and is deliberately NOT prefilled. The source is stored as manual. No automated HydrometCloud ingestion is claimed because a supported machine-readable API has not been verified.
- **Deploy:** Unzip and upload the *contents* of `riverfly_app` to the root of your GitHub repo. Netlify should detect `netlify.toml`; publish directory `.` and functions `netlify/functions`. The online AI function still needs `OPENAI_API_KEY` configured privately in Netlify.
- **Privacy:** GPS is only used in the browser and sent to Open-Meteo when you press Import local weather; weather requests include coordinates. Browser records are local to each phone.
