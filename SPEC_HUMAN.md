# My Net Box — Design Specification (Human)
**Feature:** Device Inventory Management for Wiom Partner Plus App
**Version:** V1 | **Date:** 20 March 2026
**Author:** Abhishek Semwal (Product Design) + Claude (AI Pair)
**Figma Source:** `glGzkVigsXI0wZQRUdow3t` (PA-End-to-End-V2)

---

## 1. Context

### Who is the user?
**Annu bhaiyya** — a Wiom CSP (Channel Sales Partner) who runs a local cable network business. He manages a fleet of Net Boxes (WiFi routers), assigns technicians like Rohit to install them at customer homes, and is financially accountable for every device on his books.

### What problem does this solve?
Annu bhaiyya needs a single place to:
- Know how many devices he has and where each one is
- Order more devices when needed
- Verify returned devices before reissuing them
- Understand the financial impact of unrecovered devices
- Track incoming orders and confirm deliveries

### Entry points
| From | Trigger |
|------|---------|
| Partner Plus homescreen | "मेरे नेट बॉक्स" tile or menu item |
| Settings | "मेरे नेट बॉक्स — नेट बॉक्स स्टेटस • नए नेट बॉक्स मंगाएं" |
| Push notification | Order status change / delivery stuck |
| Homescreen banner | Pending delivery confirmation (48hr countdown) |
| Interceptor (forced) | 48hr deadline passed — blocks entire app |

---

## 2. Information Architecture

```
My Net Boxes (Landing)
├── Summary Card (total count + scan CTA)
├── Order Tracker (conditional — visible only during active order)
├── 4 Status Tiles (2×2 grid)
│   ├── At Customer's Home → Bottom sheet (informational)
│   ├── In Office → Device ID list + scan entry
│   ├── Pickup Pending → Service ticket list
│   └── Could Not Recover → Financial consequence
├── Capacity text + Order CTA
├── 3-dot Menu
│   ├── Net Box Ledger → Batch issuance history
│   └── Success Fund → Balance + top-up + transactions
└── Language toggle (Hindi ↔ English)
```

---

## 3. Screen-by-Screen Specification

### 3.1 Landing — मेरे नेट बॉक्स

**Layout (top to bottom):**
1. **App bar** — dark (`#443152`), back arrow + "मेरे नेट बॉक्स" + language toggle (EN/हि) + 3-dot menu
2. **Summary card** — rounded card (`#F1EDF7`), router icon in white circle, "आपके खाते में चढ़े हुए नेट बॉक्स" label, large count (48px bold), scan CTA button (info purple `#6D17CE`)
3. **Order tracker** — conditional, only visible when `activeOrder` exists. Purple gradient card with 4-step stepper + primary CTA when delivered
4. **Status tiles** — 2×2 grid, each 156×152px, semantically colored:
   - Green: At customer's home (healthy)
   - Blue: In office (available)
   - Orange: Pickup pending (needs action)
   - Red: Could not recover (financial impact)
5. **Capacity text** — "आप X नेट बॉक्स और जारी करवा सकते हैं"
6. **Order CTA** — outlined button, "नए नेट बॉक्स मंगवाएं"

**Conditional visibility:**
- Order tracker: shown only when `activeOrder` exists
- Capacity text + Order CTA: hidden while active order exists, reappear after delivery confirmed

**3-dot menu options:**
- नेट बॉक्स का हिसाब → Ledger screen
- सक्सेस फंड → Fund screen

---

### 3.2 Tile: At Customer's Home (Bottom Sheet)

**Type:** Informational only — no action required
**Title:** कस्टमर के घर पर
**Content:** Count + explanation text:
> "यह वो नेट बॉक्स हैं जो कस्टमर के घर पर रखें हैं — जिनका बिल भरा है, या जिनकी पिकअप टिकट नहीं बनी, या पिकअप अभी बाकी है।"

**Key insight for developers:** This is a COMPOSITE number. It includes:
- Active customers with paid bills (happy)
- Customers with unpaid bills where no pickup ticket exists yet (limbo)
- Customers where pickup is assigned but not yet done

---

### 3.3 Tile: In Office → Device ID List

**Title:** ऑफिस में मौजूद नेट बॉक्स
**Content:**
- Count header: "नेट बॉक्स की संख्या: X"
- Scrollable list of device cards, each showing: router icon + device ID (e.g. SY25201) + status chip (Ready / Needs Charge)
- Info box: "ये नेट बॉक्स आपके ऑफिस में हैं और नए कनेक्शन के लिए तैयार हैं।"
- Scan CTA at bottom: "नेट बॉक्स स्कैन करें"

---

### 3.4 Tile: Pickup Pending → Service Ticket List

**Title:** कस्टमर से वापस लाना है
**Content:** List of pickup service tickets, sorted by urgency (fewest days first).

Each ticket card:
- **Header** (dark `#443152`): Ticket ID + Device ID + days remaining badge
- **Body:** Customer name, address
- **CTA:** "शुरू करें" (launches pickup flow — separate feature)

**Urgency badge colors:**
- ≤5 days: Red (urgent)
- 6-10 days: Orange (warning)
- >10 days: Green (normal)

---

### 3.5 Tile: Could Not Recover → Financial Consequence

**Title:** हिसाब किताब
**Content:**
- Warning banner: "₹X,XXX लॉक्ड डिपॉजिट" (large, red)
- Calculation: `count × ₹250 = total locked`
- Info box: "कस्टमर से नेट बॉक्स वापस ला कर आप लॉक्ड डिपॉजिट वापस पा सकते हैं।"
- Device list: ID + date marked as not-recovered

**Business rule:** ₹250 is deducted per unrecovered device from the partner's deposit. Recovering the device releases the locked amount.

---

### 3.6 Order New Net Boxes

**Trigger:** "नए नेट बॉक्स मंगवाएं" CTA on landing

**Bottom sheet content:**
- Title: "आपको कितने नेट बॉक्स चाहिए?"
- Counter: steps of 10 (min 10, max 50)
- Cost display: "10 नेट बॉक्स = ₹2,000 (सक्सेस फंड से)"
- Fund balance card: shows current Success Fund balance + sufficient/insufficient status
- CTA: "रिक्वेस्ट भेजें"

**Pricing:** ₹2,000 per 10 devices (1 unit). Always multiples of 10.

**On submit:**
- Deduct cost from Success Fund
- Record debit transaction in fund history
- Show success dialog
- Create order → tracker appears on landing
- Hide Order CTA + capacity text

**If fund insufficient:** Show "वॉलेट बैलेंस कम है" dialog → "वॉलेट रिचार्ज करें" or "कैंसिल करें"

---

### 3.7 Order Tracking

**Displayed as:** Card on landing screen (not a separate screen)

**4-step stepper:**
1. आर्डर दिया (Ordered)
2. पैक हो गए (Packed)
3. रास्ते में (In Transit)
4. पहुंच गया (Delivered)

**Step indicators:** Small circles (20px). Completed = green + check. Active = brand pink. Future = grey outline with number.

**When delivered (step 4):**
- Primary CTA button appears: "डिलीवरी कन्फर्म करें"
- Tapping goes to Confirm Delivery screen

**Before delivered:** Card is not tappable — shows status only.

---

### 3.8 Delivery Confirmation

**Screen background:** Lavender (`#F1EDF7`) — deliberately different from normal screens to signal importance.

**Content:**
- Title: "X नेट बॉक्स की डिलीवरी कन्फर्म करें"
- Device ID card (expandable): shows first 3 IDs + "और X देखें" toggle
- Help icon in header (Call Trust line)

**CTA (pinned bottom):**
- Checkbox row: "हाँ, X नेट बॉक्स का ऑर्डर मिल गया"
- On check: 600ms delay → devices added to office inventory → counts updated → order cleared → return to landing

**Empty state (no active order):** "कोई पेंडिंग डिलीवरी नहीं है" with illustration

---

### 3.9 Delivery Escalation (Interceptor)

**Trigger:** `deliveryPendingHours > 48`

**Behavior:** Intercepts ALL navigation. No back button, no escape.

**Content:**
- Warning icon (80px, orange)
- "डिलीवरी कन्फर्म करें!"
- "आपका ऑर्डर 48+ घंटे पहले पहुंचा है। बिना डिलीवरी कन्फर्म किये आप पार्टनर प्लस ऐप इस्तेमाल नहीं कर पाएंगे।"
- Single CTA: "कन्फर्म करें" → goes to Confirm Delivery screen

**Escalation timeline (from Figma):**
- Day 0-1: Push notification + homescreen banner
- On task assignment: Soft reminder
- During installation: Technician blocked mid-flow
- After 48 hours: Full app block (this screen)

---

### 3.10 Partner Success Fund

**Screen title:** पार्टनर सक्सेस फंड

**Content:**
- Balance card: "कुल अमाउंट" + large amount (e.g. ₹26,000) + "टॉप-अप करें" button
- Transaction history: list of credit/debit rows with date, description, amount

**Transaction types:**
- Credit: Top-up from wallet, initial seed from joining fee
- Debit: Net box orders

**Top-up bottom sheet:**
- "₹2,000 में 10 नेट बॉक्स तक"
- Unit stepper (1-10 units)
- Shows wallet balance
- If wallet insufficient → dialog with "वॉलेट रिचार्ज करें"

**Money flow:**
```
Joining fee → Success Fund seed (₹20,000)
                ↓ used for ordering
Wallet → Top-up Success Fund → Order devices
```

---

### 3.11 On-Demand Net Box Scanning

**Purpose:** Verify recovered devices before reissuing. Moves device from "pickup pending" to "in office".

**Camera viewfinder screen:**
- Live rear camera feed (wide-angle, 1280×720)
- Dark overlay with transparent rectangular cutout
- Instruction: "नेट बॉक्स ID को स्कैनर के बीच में रखें"
- CTA: "स्कैन शुरू करें"

**Scan sequence (all on same screen):**
1. **Live view** — camera running, waiting for user to position device
2. **Tap scan** → frame freezes (canvas captures last video frame)
3. **Scanning** → horizontal scan line animates left-to-right (2 seconds)
4. **Result icon** appears on frozen viewfinder (green check or red X)
5. **Bottom sheet slides up** with result details

**Success outcome:**
- "स्कैन सफल!" + device ID
- "ठीक है" CTA → device added to office, counts updated

**Fail outcome:**
- "स्कैन ढंग से नहीं हो पाया" + attempt count (1/3, 2/3)
- "दोबारा कोशिश करें" → restarts live camera

**After 3 failures:**
- "3 बार स्कैन फेल हो गया"
- Two options: "नेट बॉक्स की फोटो लें" (photo fallback) or "दोबारा स्कैन करें"

**Photo fallback:**
- Camera screen for manual photo capture
- On submit: device verified from photo → added to inventory OR marked defective
- Exit guard: "बिना फोटो सबमिट किये वापस जाना चाहते हैं?"

**Defective outcome:**
- "इस नेट बॉक्स को अलग से संभाल कर रखें"
- "आपकी बताई समस्या को हम वेरीफाई करके इसका समाधान करेंगे"
- Device quarantined — Wiom resolves remotely

---

### 3.12 Issuance Ledger

**Title:** जारी किए गए नेट बॉक्स का हिसाब
**Content:** Batch history cards, each showing:
- Count: "20 नेट बॉक्स"
- Date: "30 Jun'24"
- Extra (if any): "+1 अतिरिक्त (रिप्लेसमेंट)"
- Device ID chips

Read-only audit trail — no actions.

---

### 3.13 Bilingual Support

**Toggle:** "EN" / "हि" button in header bar
**Scope:** All screens — static HTML text + dynamically rendered content
**Behavior:** Instant switch, no page reload
**Default:** Hindi

---

## 4. Edge Cases

### 4.1 Ordering
| Edge Case | Expected Behavior |
|-----------|-------------------|
| Partner at max capacity (70 devices) | Capacity text shows "0 नेट बॉक्स और जारी करवा सकते हैं", Order CTA should be disabled |
| Fund balance exactly equals order cost | Allow order, balance goes to ₹0 |
| Fund balance is ₹0 | Show insufficient dialog immediately on CTA tap |
| Order placed while previous order in transit | Not possible — Order CTA hidden during active order |
| Network failure during order submission | Show error toast, do not deduct fund. Retry option |
| Partner kills app mid-order | Order not created. Fund not deducted. Idempotent |

### 4.2 Delivery
| Edge Case | Expected Behavior |
|-----------|-------------------|
| Partial delivery (8 of 10 received) | Current design: all-or-nothing confirmation. Future: partial confirmation with missing device reporting |
| Damaged device in delivery | Current: confirm all, then scan each. Scan will flag defective ones individually |
| Partner confirms then disputes | Need backend audit trail. Confirmation timestamp + device IDs logged |
| App killed during confirmation animation | Confirmation should be server-committed before UI update. Currently client-only — needs backend |
| Multiple deliveries pending | Current: one active order at a time. Future: queue support |
| Interceptor triggered while technician is mid-installation | Interceptor should allow s6 (confirm) + scan flow. Currently blocks all except s6/s17 |

### 4.3 Scanning
| Edge Case | Expected Behavior |
|-----------|-------------------|
| Camera permission denied | Show "कैमरा उपलब्ध नहीं है" with videocam_off icon. Offer photo upload as alternative |
| Camera hardware failure | Same as permission denied — graceful fallback to photo |
| Device already in partner's inventory | Show "यह नेट बॉक्स पहले से आपकी इन्वेंटरी में है" — no duplicate add |
| Device belongs to a different partner | Show "यह नेट बॉक्स आपके खाते में नहीं है" — block with contact support CTA |
| Device is blacklisted/stolen | Show "यह नेट बॉक्स ब्लॉक किया गया है — कृपया ऑफिस से संपर्क करें" |
| Rapid consecutive scans (same device) | Debounce — ignore duplicate scan within 5 seconds |
| App backgrounded during scan | Cancel scan, reset to live viewfinder on resume |
| Low light / blurry image | Scan will fail → 3-fail photo fallback handles this naturally |
| Scan succeeds but server rejects | Show error "सर्वर से कन्फर्म नहीं हो पाया" with retry |

### 4.4 Success Fund
| Edge Case | Expected Behavior |
|-----------|-------------------|
| Wallet balance changes between sheet open and submit | Re-check balance on submit, not just on sheet open |
| Top-up amount exceeds wallet | Show insufficient dialog |
| Concurrent top-ups from multiple devices | Server-side should handle with optimistic locking |
| Fund balance goes negative (race condition) | Server rejects, show error. Client should never show negative |

### 4.5 General
| Edge Case | Expected Behavior |
|-----------|-------------------|
| Offline mode | Landing should load from cached data. Order/scan/top-up require network — show offline indicator |
| Session timeout | Redirect to login. Preserve last screen for deep-link back |
| Language switch mid-flow (e.g. during scan) | All visible text updates immediately. Scanner messages update on next state change |
| Very long device ID list (100+ devices in office) | Paginate or virtual scroll. Current: renders all — acceptable up to ~50 |
| Partner with 0 devices (new partner) | All tiles show 00. Summary shows 0. Show onboarding prompt: "अपना पहला ऑर्डर दें" |
| RTL text rendering | Not applicable — Hindi is LTR. English is LTR |

---

## 5. Naming Convention

| Old (Figma archived) | Current | English |
|---------------------|---------|---------|
| डिवाइस | नेट बॉक्स | Net Box |
| मेरे डिवाइस | मेरे नेट बॉक्स | My Net Boxes |
| डिवाइस का हिसाब | नेट बॉक्स का हिसाब | Net Box Ledger |
| डिवाइस जारी करवाएं | नए नेट बॉक्स मंगवाएं | Order New Net Boxes |
| डिवाइस कैच रेट | नेट बॉक्स कैच रेट | Net Box Catch Rate |

---

## 6. Figma References

| Section | Node ID | Page |
|---------|---------|------|
| Updated screens | `41:9450` | Device Inventory (Updated) |
| Archived tiles (clickable) | `1130:10770` | Cover |
| Success Fund | `1130:14417` | Device Inventory (Updated) |
| On-demand scanning | `1131:11115` | Device Inventory (Updated) |
| File | `glGzkVigsXI0wZQRUdow3t` | PA-End-to-End-V2 |
