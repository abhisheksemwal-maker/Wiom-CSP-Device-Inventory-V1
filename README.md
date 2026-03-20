# Wiom Partner Plus — My Net Box (मेरे नेट बॉक्स)

Functional mid-fidelity prototype of the Net Box inventory management section for the Wiom Partner Plus app. Built as a single HTML file running in an Android WebView shell.

## What This Covers

### 1. Inventory Dashboard (Landing)
- Summary card showing total net boxes in partner's account (e.g. 50)
- Integrated scan CTA for recovered device verification
- 2x2 status tile grid — each tile tappable with distinct destination:
  - **कस्टमर के घर पर** → Bottom sheet explaining composite count (active + unpaid + pickup-pending)
  - **ऑफिस में** → Full device ID list with status chips (Ready / Needs charge)
  - **कस्टमर से वापस लाना है** → Pickup service ticket list with urgency badges and deadlines
  - **वापस नहीं ला पाए** → Financial consequence screen (₹250/device locked deposit calculation)
- Capacity indicator: "आप X नेट बॉक्स और जारी करवा सकते हैं"
- 3-dot menu: Net Box Ledger + Success Fund access

### 2. Order New Net Boxes
- Bottom sheet with counter (steps of 10, matching ₹2,000/10-device pricing)
- Success Fund balance shown inline with sufficient/insufficient status
- Fund debit recorded as transaction on order
- Success dialog on request submission
- CTA and capacity text hidden while active order exists

### 3. Order Tracking
- 4-step stepper: आर्डर दिया → पैक हो गए → रास्ते में → पहुंच गया
- Auto-advancing steps (8s per step for demo)
- Primary CTA "Confirm Delivery" appears only when order reaches delivered state
- Card not tappable until delivery step

### 4. Delivery Confirmation
- Dedicated screen with lavender background (signals importance)
- Dynamic device ID list matching ordered count (expandable "और देखें")
- Checkbox confirmation: "हाँ, X नेट बॉक्स का ऑर्डर मिल गया"
- On confirm: devices added to office inventory, counts updated, order cleared
- Empty state shown if no pending delivery

### 5. Delivery Escalation (Interceptor)
- After 48 hours without confirmation, interceptor blocks ALL app navigation
- Full-screen warning: "डिलीवरी कन्फर्म करें!"
- Single CTA forces user to confirm delivery before using app
- Testable via developer FAB "48hr blocker" scenario

### 6. Partner Success Fund
- Balance card with total amount and top-up CTA
- Transaction history (credits + debits with timestamps)
- Initial seed from joining fee visible as first transaction
- Top-up bottom sheet: ₹2,000/unit stepper with wallet balance check
- Insufficient balance dialog → wallet recharge prompt

### 7. On-Demand Net Box Scanning
- Live camera viewfinder (rear camera, wide-angle preferred)
- Tap "Scan" → frame freezes → horizontal scan line animates
- Result icon appears on frozen viewfinder (green check / red X)
- Bottom sheet slides up with outcome:
  - **Success**: "Device added to inventory" + device ID
  - **Fail**: attempt counter (1/3, 2/3) + retry
  - **3 fails**: photo fallback option or retry
- Photo capture fallback with exit guard dialog
- Defective device quarantine outcome
- Deterministic demo pattern: 1st session success, 2nd session fail→success, repeats
- Scan updates inventory counts in real-time (office +1, pickup -1)

### 8. Issuance Ledger (नेट बॉक्स का हिसाब)
- Batch history cards showing issued count + date
- Replacement device tracking
- Device ID chips per batch

### 9. Bilingual Support (Hindi/English)
- Language toggle in header bar (EN/हि)
- All screens fully translated — static HTML and dynamically rendered content
- Instant switch without page reload

## Project Structure

```
wiom-inventory/
├── index.html          ← Single-page prototype (all screens + JS + CSS)
├── server.js           ← Dev server with review API (port 8095)
├── review.html         ← Maverick design review tool
├── README.md
├── .gitignore
└── apk/                ← Android WebView shell
    ├── app/
    │   ├── build.gradle
    │   └── src/main/
    │       ├── AndroidManifest.xml
    │       ├── assets/index.html    ← Copy of root index.html
    │       ├── kotlin/com/wiom/inventory/MainActivity.kt
    │       └── res/
    ├── build.gradle
    ├── settings.gradle
    ├── gradle.properties
    └── gradle/wrapper/
```

## For Teammates — Integration Guide

### Option A: Use the HTML directly
The entire prototype is in `index.html`. Drop it into any WebView shell or serve it as a standalone page. No dependencies, no build step, no node_modules.

### Option B: Build the APK
```bash
# Requires: JDK 17, Android SDK
cd apk
# Create local.properties with your SDK path:
echo "sdk.dir=C:\\Users\\YourName\\AppData\\Local\\Android\\Sdk" > local.properties
# Build
JAVA_HOME="path/to/jdk17" ./gradlew assembleDebug
# APK at: app/build/outputs/apk/debug/app-debug.apk
```

### Option C: Run in browser
```bash
node server.js
# Open http://localhost:8095
# Review tool: http://localhost:8095/review.html
```

## Developer Scenarios (FAB)
A developer FAB (green dashed circle, bottom-right) provides 3 test scenarios:
- **Reset state** — Fresh demo data
- **Skip to delivered** — Jump order tracking to delivery confirmation step
- **48hr blocker** — Trigger the interceptor screen that blocks app usage

## Key Business Logic
- ₹2,000 per 10 net boxes (Success Fund deduction)
- ₹250 locked deposit per unrecovered device
- Delivery confirmation is mandatory gate — unconfirmed devices can't be used
- 48-hour escalation: soft reminder → hard app block
- Scan is the gate between "recovered" and "reusable" devices
- "At customer's home" is a composite number (active + unpaid + pickup-pending)

## Design Notes
- Mid-fidelity: functional accuracy over visual polish
- Wiom DS color tokens used where applicable
- Hindi primary, English secondary
- 360px mobile-first layout
- Camera uses getUserMedia with rear-camera preference
