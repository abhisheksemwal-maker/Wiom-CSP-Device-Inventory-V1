---
name: Wiom Netbox Inventory — Partner App Section
description: Full inventory feature — Figma analysis + functional prototype (APK) + design specs (human + AI) + GitHub repo. 9 features, bilingual, 25 edge cases.
type: project
---

## Wiom Netbox Inventory — Partner App Section

**GitHub repo:** https://github.com/abhisheksemwal-maker/Wiom-CSP-Device-Inventory-V1
**Project folder:** `C:/Users/Abhishek Semwal/wiom-inventory/`
**APK:** `C:/Users/Abhishek Semwal/wiom-inventory/Device Inventory_Semwal_V1.apk` (3.1 MB)
**Dev server:** `node server.js` → `http://localhost:8095` | Review: `http://localhost:8095/review.html`

**Figma file:** `glGzkVigsXI0wZQRUdow3t` (PA-End-to-End-V2)
**Updated section:** node `41:9450` — "Device → Net box" on page "Device Inventory (Updated)" (19,867×21,560px, 100+ frames)
**Archived section:** node `1130:10770` — "Netbox inventory various sections" on page "Cover" (8,083×1,613px, 9 frames)

**Why:** Understanding the full inventory management experience from Annu bhaiyya's perspective — what he can see, do, and where each tile leads.

**How to apply:** Use this as the source of truth for any Netbox inventory work — screen builds, UX reviews, flow mapping, or new feature design within this section.

---

### Who is the user?

**Annu bhaiyya** — a Wiom partner who runs a local cable network. He has technicians (like Rohit) who install Net Boxes at customer homes. This section is his **inventory management hub**.

---

### Landing Screen: मेरे नेट बॉक्स

**Structure:**
- **Summary hero card** (328×200, r:24, bg `#F1EDF7`, stroke `#E8E4F0`):
  - Router icon in white circle (48×48, r:50)
  - "आपके खाते में चढ़े हुए नेट बॉक्स" — total count (e.g. 50)
  - Big number: 48px Bold `#161021`
- **2×2 status grid** — each tile 156×152, r:16, tappable:

| Tile | Hindi | BG | Stroke | Taps to |
|------|-------|----|--------|---------|
| At customer's house | कस्टमर के घर पर | `#F1EDF7` | `#E8E4F0` | Bottom sheet — explanation of what this count includes |
| In office | ऑफिस में | `#F1EDF7` | `#E8E4F0` | Full screen — list of all device IDs in office |
| Pickup pending | कस्टमर से वापस लाना है | `#FFE5F6` | `#FFB2E4` | Pickup task list — service tickets with deadlines |
| Could not recover | वापस नहीं ला पाए | `#FFE9E5` | `#FF8000` | Financial consequence — locked deposit calculation |

- **Request capacity:** "आप 20 नेट बॉक्स और जारी करवा सकते हैं"
- **CTA:** "नए नेट बॉक्स मंगवाएं" (brand pink `#D9008D`, r:12)
- **Header link** (trailing): "डिवाइस का हिसाब" / "नेट बॉक्स का हिसाब" → Issuance ledger
- **Triple dot menu:** "नेट बॉक्स का हिसाब" / "सेटिंग"

---

### Tile Tap Destinations (from archived prototype)

**1. कस्टमर के घर पर → Bottom sheet (informational)**
- Title: "कस्टमर के घर में मौजूद डिवाइस"
- Shows count + explanation:
  > "यह वो डिवाइस हैं जो कस्टमर के घर पर रखें हैं और जिनका बिल भरा हुआ है।
  > या जिन कस्टमर का बिल नहीं भरा और डिवाइस पिकअप टिकट भी नहीं बनी।
  > या जिन कस्टमर से आपने अभी तक डिवाइस पिकअप नहीं किया।"
- **Key insight:** This is a COMPOSITE number — happy customers + unpaid-no-ticket + pickup-not-done. Not purely "working installs."

**2. ऑफिस में → Device ID list (full screen)**
- Title: "ऑफिस में मौजूद डिवाइस"
- Count at top: "डिवाइस की संख्या: 20"
- Scrollable list of device IDs (e.g. ID: ABC252)
- Read-only inventory check

**3. कस्टमर से वापस लाना है → Pickup task list (actionable)**
- Title: "कस्टमर से डिवाइस वापस लाने हैं"
- Service ticket cards with:
  - Dark header (`#443152`): "डिवाइस पिकअप" + device ID (WIM21047)
  - Customer: Seema Rajawat
  - Issue: "डिवाइस और ONU वापस लाना है"
  - TAT timeline: start date → deadline ("15 Aug तक डिवाइस पिकअप करें")
  - CTA: "शुरू करें" (brand pink) → launches pickup flow
- **Connects to:** PUT Netbox Recovery project

**4. वापस नहीं ला पाए → Financial consequence ("हिसाब किताब")**
- Title: "हिसाब किताब"
- Calculation:
  - A) डिवाइस जो वापस नहीं ला पाए = 2
  - B) प्रति डिवाइस लॉक्ड डिपॉजिट = ₹250
  - A × B = ₹500 locked
- Purple info box: "कस्टमर से डिवाइस वापस ला कर आप लॉक्ड डिपॉजिट वापस पाएं"
- Device details: ID + date of loss
- **Financial motivation:** recover device → get ₹250 back

**5. Header "नेट बॉक्स का हिसाब" → Issuance ledger**
- Title: "जारी किए गए डिवाइस का हिसाब"
- Batch cards: "20 डिवाइस" + timestamp
- Some have extras: "1 अतिरिक्त डिवाइस (रिप्लेसमेंट)"
- Read-only audit trail of all batches issued by Wiom

---

### Order & Delivery Flow

**Ordering new Net Boxes:**
- Bottom sheet: "आपको कितने नेट बॉक्स चाहिए?" — stepper (5 default, up to 10)
- Loading: "कृपया ठहरिए... आपकी योग्यता चेक की जा रही है"
- Success dialog: "10 नए नेट बॉक्स की रिक्वेस्ट भेज दी गई है"

**Order tracking (5 stepper states):**
1. आपके ऑर्डर पर काम चल रहा है (Ordered)
2. नेट बॉक्स पैक हो रहे हैं (Packed)
3. आपका आर्डर रास्ते में है (In-transit)
4. Order is about to arrive (near Delivered)
5. आपका आर्डर पहुंच गया है (Delivered)

- Tracker card: bg `#F1E5FF`, stroke `#6D17CE` (info purple)
- Shows: "10 नेट बॉक्स का आर्डर" + estimated delivery date
- Delivery via 3rd party (ShadowFax) — OTP handoff

**Delivery confirmation (critical gate):**
- Screen bg: `#F1EDF7` (lavender, signals importance)
- Title: "10 नेट बॉक्स की डिलीवरी कन्फर्म करें"
- Net box details card with device IDs in 3-column grid
- "और देखें" expands full list
- Checkbox CTA: "हाँ, 10 नेट बॉक्स का ऑर्डर मिल गया" (conscious confirmation)
- Help icon in header (Call Trust line)

**Escalation if delivery not confirmed:**
- **Day 0–1:** Push notification + homescreen banner with 48hr countdown
- **On task assignment:** Reminder surfaces when Annu bhaiyya assigns work
- **During installation:** Rohit gets blocked mid-ISP form: "अभी इस नेट बॉक्स को इस्तेमाल नहीं कर सकते"
- **After 48 hours:** Interceptor screen blocks entire app
  - "सेटअप में रूकावट आ सकती है!"
  - "बिना डिलीवरी कन्फर्म किये आप पार्टनर प्लस ऐप इस्तेमाल नहीं कर पाएंगे"
  - Single CTA: "डिलीवरी कन्फर्म करें" — no escape

**Dialog escalation ladder:**
Soft (call office to confirm) → Medium (can't use net box) → Hard (can't use app) → Forced (single CTA, no dismiss)

---

### Entry Points into this Section

| From | Trigger |
|------|---------|
| Settings menu | "मेरे नेट बॉक्स — नेट बॉक्स स्टेटस • नए नेट बॉक्स मंगाएं" |
| Push notification | Order status change or installation stuck |
| Homescreen banner | Pending delivery confirmation (48hr countdown) |
| Interceptor (forced) | 48hr deadline passed — app blocked |
| Installation flow | Technician hits unconfirmed Net Box ID |

---

### Design Tokens Used

**Semantic color system:**
| State | BG | Stroke |
|-------|----|--------|
| Neutral (healthy) | `#F1EDF7` | `#E8E4F0` |
| Alert (needs pickup) | `#FFE5F6` | `#FFB2E4` |
| Warning (failed recovery) | `#FFE9E5` | `#FF8000` |
| Info/tracking | `#F1E5FF` | `#6D17CE` |
| Confirm flow | `#F1EDF7` full screen | — |

**Typography:**
| Element | Size | Weight |
|---------|------|--------|
| Big number | 48px | 700 |
| Screen title | 24px | 400 |
| Card title | 20px | 700 |
| Section heading | 16px | 700 |
| Body/label | 14px | 400–600 |
| Timestamp | 12px | 400, `#A7A1B2` |

**Layout:** 360px screens, 16px horizontal padding, 328px content cards.

---

### Naming Evolution (Old → New)

| Old | New |
|-----|-----|
| डिवाइस | नेट बॉक्स |
| मेरे डिवाइस | मेरे नेट बॉक्स |
| डिवाइस का हिसाब | नेट बॉक्स का हिसाब |
| डिवाइस जारी करवाएं | नए नेट बॉक्स मंगवाएं |
| आपको जारी किए गए डिवाइस | आपके खाते में चढ़े हुए नेट बॉक्स |
| डिवाइस कैच रेट | नेट बॉक्स कैच रेट |

---

### Happy Case Scenarios (annotated in Figma)

| HC# | Scenario |
|-----|----------|
| 15 | Partner assigns installation → delivery reminder |
| 16 | Annu bhaiyya (main partner) same reminder |
| 17 | Blocker pop-up after 48 hrs (Annu bhaiyya) |
| 18 | Same blocker (partner level) |
| 19 | Rohit uses unconfirmed net box → blocked mid-installation |
| 20 | Delivery confirmed → net box usable |

---

### Key Business Logic

1. Delivery confirmation is a **gate** — unconfirmed devices can't be used for installation
2. **₹250 locked deposit per unrecovered device** — financial consequence motivates recovery
3. "कस्टमर के घर पर" is a **composite number** — includes healthy + unpaid + pickup-pending
4. Partners have a **max quota** for net boxes ("आप 20 और जारी करवा सकते हैं")
5. Delivery via 3rd party (ShadowFax) with OTP verification
6. Device IDs have type prefixes: SY = Syrotech, GX = GX, WIM = Wiom internal
7. Escalation timeline: soft nudge → 48hr blocker → full app block
8. **Success Fund is the financial prerequisite for ordering** — can't request devices without balance

---

## Partner Success Fund (पार्टनर सक्सेस फंड)

**Figma section:** node `1130:14417` — "Sucess fund" on page "Device Inventory (Updated)"
**Screens:** 10 frames (detail screen, top-up sheets, insufficient balance dialog, settings, homepage)

### Concept

A **prepaid balance** Annu bhaiyya must maintain to order new Net Boxes.

**Lifecycle:**
1. Annu bhaiyya joins Wiom → pays a joining fee
2. A portion of that fee is credited as initial Success Fund balance (e.g. ₹20,000)
3. This seed balance is used to order Net Boxes (₹2,000 per 10 devices)
4. When fund depletes → he must top-up from his Wiom Wallet
5. If wallet is also low → he must recharge wallet first, then top-up fund

### Pricing Model

| Unit | Cost | Devices covered |
|------|------|----------------|
| 1 unit | ₹2,000 | Up to 10 devices |
| 2 units | ₹4,000 | Up to 20 devices |
| N units | ₹2,000 × N | Up to 10N devices |

### Success Fund Detail Screen

- **Header:** "पार्टनर सक्सेस फंड"
- **Balance card** (bg `#F1EDF7`):
  - "कुल अमाउंट" (label, 16px Regular)
  - **₹26,000** (24px Bold `#161021`)
  - "टॉप-अप करें" button (outlined, stroke `#D9008D`, r:8)
- **Transaction history:** "हाल ही में किए गए टॉप-अप"
  - Each row: ₹ icon + "टॉप-अप" label + amount (₹2,000 / ₹4,000) + timestamp
  - **Initial seed row:** labeled "पार्टनर सक्सेस फंड" (not "टॉप-अप") — ₹20,000
  - Math: ₹20,000 (seed) + ₹2,000 + ₹4,000 = ₹26,000 total

### Top-Up Bottom Sheet

- Title: "अपनी जरूरत अनुसार टॉप-अप करें" (24px Bold)
- **Unit card** (stroke `#E8E4F0`, r:16):
  - Unit price: ₹2,000
  - Multiplier stepper: `– N +`
  - Total: "कुल : ₹2,000" (or ₹4,000 etc.)
  - Mapping: "इतने पैसे में 10 डिवाइस तक जारी होंगे"
- **Wallet balance shown:** "आपका वॉलेट बैलेंस : ₹3000" (14px SemiBold)
- **Insufficient balance warning** (red `#E01E00`, 12px):
  - "टॉप-अप करने के लिए आपका वॉलेट बैलेंस कम है"
  - Shows when total > wallet balance (e.g. ₹4,000 needed, ₹3,000 available)
- **CTA:** "टॉप-अप करें" (brand pink `#D9008D`, r:16)

### Insufficient Balance Dialog

- Warning icon in orange circle (bg `#FFE9E5`, 96×96)
- "टॉप-अप करने के लिए आपका वॉलेट बैलेंस कम है" (24px Bold)
- **Primary CTA:** "वॉलेट रिचार्ज करें" (brand pink) → wallet recharge flow
- **Secondary CTA:** "कैंसिल करें" (bg `#FFE5F6`, text `#D9008D`) → back to fund detail

### Prototype Flow

```
Homescreen → menu → Settings
                      ↓
              "पार्टनर सक्सेस फंड" tile
              (subtitle: "टॉप-अप करें और बिज़नेस बढ़ायें")
                      ↓
              Success Fund Detail (balance ₹26,000 + history)
                      ↓ "टॉप-अप करें"
              Top-Up Sheet (₹2,000/unit × stepper)
                      ↓ if wallet sufficient
              Top-up processed → balance updated
                      ↓ if wallet insufficient
              Dialog: "वॉलेट रिचार्ज करें" / "कैंसिल करें"
```

### Connection to Netbox Inventory

The Netbox Inventory "order new devices" flow and Success Fund are **two sides of the same action:**

| Inventory section (old) | With Success Fund |
|------------------------|-------------------|
| "आपको कितने नेट बॉक्स चाहिए?" (count-based) | "अपनी जरूरत अनुसार टॉप-अप करें" (money-based) |
| "रिक्वेस्ट भेजें" | "टॉप-अप करें" |
| No financial gate | ₹2,000 per 10 devices + wallet balance check |
| Direct request | Fund balance → if low, wallet → if low, recharge wallet first |

### Settings Menu Entry

"पार्टनर सक्सेस फंड" is a **separate tile** in Partner Settings, distinct from "मेरे डिवाइस":
- Title: "पार्टनर सक्सेस फंड"
- Subtitle: "टॉप-अप करें और बिज़नेस बढ़ायें"
- Icon: ₹ symbol (same as Bill Payment but different context)

### Money Flow Summary

```
Joining fee (one-time)
    ↓ partial credit
Success Fund seed (₹20,000)
    ↓ used for ordering
Net Box orders (₹2,000 = 10 devices)
    ↓ when depleted
Wiom Wallet → Top-up Success Fund
    ↓ if wallet empty
Bank/UPI → Recharge Wallet → Top-up Fund → Order devices
```

---

## On Demand Scanning (डिवाइस ID स्कैन)

**Figma section:** node `1131:11115` — "On demand scanning" on page "Device Inventory (Updated)"
**Screens:** 85 frames (scanner, scan states, photo fallback, dialogs, device status outcomes)

### What It Solves

Annu bhaiyya has **recovered devices on his desk**. He needs to verify which ones are reusable for new installations. The scan checks a device's ID/QR and either:
- Moves it to "ऑफिस में" (ready to reissue)
- Flags it as defective (quarantined for Wiom to resolve)

**Evidence — count change after scan:**
| Bucket | Before | After |
|--------|--------|-------|
| ऑफिस में | 05 | 06 (+1) |
| कस्टमर से वापस लाना है | 05 | 04 (-1) |

### Happy Path Flow

```
Landing → tap scan CTA → Gif tutorial (first time only)
    ↓
Scanner: "डिवाइस ID को स्कैनर के बीच में रखें"
    ↓ tap "स्कैन शुरू करें"
Scanning: "डिवाइस ID की जांच हो रही है..."
    ↓ success
Bottom sheet: "यह डिवाइस आपकी इन्वेंटरी में जोड़ दिया गया है"
    ↓ "ठीक है"
Back to Landing (counts updated)
```

Alternative success message (after delivery confirmation):
> "यह डिवाइस अब इस्तेमाल के लिए तैयार है" (ready for use)

### Scan Fail Path (3 retries max)

```
Attempt 1 → "स्कैन ढंग से नहीं हो पाया"
    ↓ auto
Attempt 2 → "स्कैन ढंग से नहीं हो पाया" + "दोबारा कोशिश करें"
    ↓ tap retry
Attempt 3 → fail
    ↓ after 3rd fail
Dialog: "डिवाइस ID स्कैन नहीं हो पाई"
    ├── "डिवाइस की फोटो लें" → Photo fallback path
    └── "दोबारा स्कैन करें" → Back to scanner
```

### Photo Fallback (after 3 scan failures)

```
Camera: "डिवाइस की साफ़ फोटो खीचें, डिवाइस ID और QR को वेरीफाई किया जायेगा"
    ↓ shutter + submit
Either: "यह डिवाइस आपकी इन्वेंटरी में जोड़ दिया गया है"
Or: "इस डिवाइस को अलग से संभाल कर रखें" (defective → quarantined)
```

### Exit Guard

If user tries to leave photo screen without submitting:
> "बिना फोटो सबमिट किये वापस जाना चाहते हैं?"
> "डिवाइस की फोटो व्योम भेजे बिना यह डिवाइस आप लौटा नहीं पाएंगे"
- "काम जारी रखें" → back to photo
- "बाकी डिवाइस मैनेज करें" → back to landing

### Defective Device Outcome

> "इस डिवाइस को अलग से संभाल कर रखें"
> "आपकी बताई समस्या को हम वेरीफाई करके इसका समाधान करेंगे"

Device quarantined — Wiom verifies issue remotely. Partner keeps it aside.

### Scan's Role in the Inventory Model

| From bucket | To bucket | Via |
|-------------|-----------|-----|
| कस्टमर से वापस लाना है | ऑफिस में | Successful scan (device reusable) |
| कस्टमर से वापस लाना है | Quarantined | Scan detects issue (defective) |
| ऑफिस में | Ready for installation | Scan confirms functional |

**The scan is the gate between "recovered" and "reusable."** Without it, a recovered device stays in limbo.

### Screen Types

| Screen | Copy | Role |
|--------|------|------|
| Expert Device ID Capture | "डिवाइस ID को स्कैनर के बीच में रखें" | Scanner viewfinder |
| Expert Device ID Capture_Start | "डिवाइस ID की जांच हो रही है" | Scanning in progress |
| Expert Device ID Capture_Start (fail) | "स्कैन ढंग से नहीं हो पाया" | Failed state + retry |
| Dialog (3 fails) | "डिवाइस ID स्कैन नहीं हो पाई" | Fallback options |
| Device ID Confirmation | "डिवाइस की साफ़ फोटो खीचें" | Photo capture fallback |
| Pending Pop up | "बिना फोटो सबमिट किये वापस जाना चाहते हैं?" | Exit guard |
| Device Status (added) | "यह डिवाइस आपकी इन्वेंटरी में जोड़ दिया गया है" | Success |
| Device Status (ready) | "यह डिवाइस अब इस्तेमाल के लिए तैयार है" | Success (post-confirmation) |
| Variation 2 (defective) | "इस डिवाइस को अलग से संभाल कर रखें" | Quarantine |
| Gif Container | Tutorial animation | First-time onboarding |

### UX Context (from annotation)

- **User:** Annu bhaiyya — "व्योम परिवार का एक सदस्य"
- **Scenario:** "अन्नू भैय्या के पास 2-3 राउटर वापस आए थे और वो देखना चाहते हैं कि कौन सा राउटर वो नए कनेक्शन के लिए अपने टेक्नीशि[न को दे सकते हैं]"
- **Edge cases tagged:** First time user, Error case
- **UX copy update note:** "Uxcopy improvement for Successful scan bottom sheet messaging — 24 october 2025"
