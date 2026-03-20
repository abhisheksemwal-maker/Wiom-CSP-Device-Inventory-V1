# My Net Box — AI Implementation Specification
**For:** Claude, Cursor, Copilot, or any AI code assistant
**Feature:** Device Inventory Management — Wiom Partner Plus App
**Version:** V1 | **Date:** 20 March 2026

---

## 1. Data Model

```typescript
interface InventoryState {
  // Counts (must always satisfy: total = atCustomer + atOffice + toPickup + notRecovered)
  total: number;          // All devices assigned to this partner
  atCustomer: number;     // Installed at customer homes (composite: active + unpaid + pending-pickup)
  atOffice: number;       // Physically in partner's office, ready for installation
  toPickup: number;       // Recovery assigned but not yet picked up
  notRecovered: number;   // Recovery failed — device lost/unreturnable

  // Device lists
  officeDevices: OfficeDevice[];
  pickupTickets: PickupTicket[];
  notRecoveredDevices: NotRecoveredDevice[];

  // Order state (null = no active order)
  activeOrder: Order | null;
  deliveryPending: boolean;
  deliveryPendingHours: number;   // Hours since delivery. >48 triggers interceptor

  // Financial
  fundBalance: number;            // Success Fund balance in ₹
  walletBalance: number;          // Wiom Wallet balance in ₹
  transactions: Transaction[];

  // Issuance history
  batches: Batch[];

  // Scanner state
  scanFails: number;              // Reset to 0 on success or session change
  scanSessionCount: number;       // Increments per completed scan. Even=success path, Odd=fail-first path

  // UI state
  currentLang: 'hi' | 'en';
  confirmExpanded: boolean;
  reqCount: number;               // Order counter value (multiples of 10)
  topupUnits: number;             // Top-up unit counter (1-10)
}

interface OfficeDevice {
  id: string;           // e.g. "SY25201", "GX35204"
  status: 'ok' | 'charge';
}

interface PickupTicket {
  id: string;           // Ticket ID e.g. "WIM21047"
  customer: string;
  address: string;
  days: number;         // Days remaining for pickup deadline
  device: string;       // Device ID
}

interface NotRecoveredDevice {
  id: string;
  customer: string;
  date: string;         // Date marked as not-recovered
  amount: number;       // Locked deposit per device (always 250)
}

interface Order {
  count: number;        // Number of devices ordered (multiples of 10)
  step: number;         // 0=Ordered, 1=Packed, 2=InTransit, 3=Delivered
  date: string;         // Estimated delivery or status text
}

interface Transaction {
  date: string;
  desc: string;         // "टॉप-अप" | "सक्सेस फंड (जॉइनिंग)" | "X नेट बॉक्स ऑर्डर"
  amount: number;
  type: 'credit' | 'debit';
}

interface Batch {
  date: string;
  count: number;
  extra: number;        // Replacement devices (0 if none)
  devices: string[];    // Device IDs in this batch
}
```

---

## 2. Screen Map

| Screen ID | Name | Entry Points | Back Target |
|-----------|------|-------------|-------------|
| `s1` | Landing (Dashboard) | App launch, all back navigations | App exit |
| `s3` | Office Device List | Tile "ऑफिस में" on s1 | s1 |
| `s4` | Pickup Task List | Tile "कस्टमर से वापस लाना है" on s1 | s1 |
| `s5` | Financial Consequence | Tile "वापस नहीं ला पाए" on s1 | s1 |
| `s6` | Confirm Delivery | Order tracker CTA (step>=3), Interceptor | s1 |
| `s7` | Success Fund | 3-dot menu | s1 |
| `s8` | Scanner | Summary card scan CTA, Office list scan CTA | `scanFrom` (s1 or s3) |
| `s11` | Photo Capture | Scan fail dialog (after 3 fails) | Exit guard → scanFrom |
| `s12` | Defective Outcome | Photo submit (defective result) | s1 |
| `s16` | Issuance Ledger | 3-dot menu | s1 |
| `s17` | Interceptor | Auto (deliveryPendingHours > 48) | Not dismissable |

### Overlays (Bottom Sheets)

| ID | Type | Trigger |
|----|------|---------|
| `bsCustomerHome` | Bottom Sheet | Tile "कस्टमर के घर पर" |
| `bsRequest` | Bottom Sheet | "नए नेट बॉक्स मंगवाएं" CTA |
| `bsTopup` | Bottom Sheet | "टॉप-अप करें" button on s7 |

### Overlays (Dialogs)

| ID | Trigger |
|----|---------|
| `ovReqSuccess` | Successful order submission |
| `ovInsufficient` | Fund or wallet balance too low |
| `ovPickupPlaceholder` | "शुरू करें" on pickup ticket |
| `ovPhotoExit` | Back button on photo capture screen |

---

## 3. Navigation Rules

```
function navigate(targetId):
  // INTERCEPTOR GUARD — highest priority
  if state.deliveryPending AND state.deliveryPendingHours > 48:
    if targetId NOT IN ['s6', 's17']:
      targetId = 's17'  // Redirect to interceptor

  // Standard navigation
  hideAllScreens()
  show(targetId)
  pushToNavStack(targetId)

  // Screen-specific init
  switch targetId:
    's1': refreshLanding()
    's3': renderOfficeList()
    's4': renderPickupList()
    's5': renderFailScreen()
    's6': renderConfirmDelivery()
    's7': renderFund()
    's8': resetScanner()  // Starts camera
    's16': renderLedger()
```

---

## 4. State Machines

### 4.1 Order Lifecycle

```
States: NONE → ORDERED → PACKED → IN_TRANSIT → DELIVERED → CONFIRMED

Transitions:
  NONE → ORDERED:
    trigger: submitRequest()
    guard: fundBalance >= cost
    action: fundBalance -= cost, create activeOrder{step:0}, add debit transaction
    ui: hide orderCTA + capacityText, show orderSection

  ORDERED → PACKED → IN_TRANSIT → DELIVERED:
    trigger: server push (simulated via setTimeout in prototype)
    action: activeOrder.step++
    ui: stepper updates, CTA appears at step 3

  DELIVERED → CONFIRMED:
    trigger: toggleConfirmCb() checkbox checked
    guard: activeOrder exists AND step >= 3
    action: atOffice += order.count, total += order.count,
            add devices to officeDevices[],
            activeOrder = null, deliveryPending = false
    ui: return to s1, show orderCTA + capacityText again
```

### 4.2 Delivery Escalation

```
States: NOT_PENDING → SOFT_REMINDER → HARD_BLOCK

Transitions:
  NOT_PENDING → SOFT_REMINDER:
    trigger: order reaches step 3 (DELIVERED)
    action: deliveryPending = true, deliveryPendingHours = 0
    ui: push notification, homescreen banner

  SOFT_REMINDER → HARD_BLOCK:
    trigger: deliveryPendingHours > 48
    action: interceptor guard activates in navigate()
    ui: s17 interceptor screen blocks ALL navigation except s6

  HARD_BLOCK → NOT_PENDING:
    trigger: delivery confirmed (checkbox on s6)
    action: deliveryPending = false, deliveryPendingHours = 0
    ui: interceptor removed, normal navigation restored
```

### 4.3 Scanner

```
States: IDLE → LIVE → SCANNING → RESULT_SUCCESS → RESULT_FAIL → PHOTO_FALLBACK → DEFECTIVE

Transitions:
  IDLE → LIVE:
    trigger: navigate to s8
    action: startCamera(), show live viewfinder

  LIVE → SCANNING:
    trigger: "स्कैन शुरू करें" CTA
    action: freezeFrame(), show scan line animation

  SCANNING → RESULT_SUCCESS:
    trigger: 2s timeout + success condition
    condition: (scanSessionCount % 2 === 0) OR (scanSessionCount % 2 === 1 AND scanFails > 0)
    action: show green check on viewfinder, slide up success bottom sheet
    ui: device ID shown, "ठीक है" CTA

  SCANNING → RESULT_FAIL:
    trigger: 2s timeout + fail condition
    action: scanFails++, show red X on viewfinder, slide up fail bottom sheet
    ui: attempt counter shown

  RESULT_FAIL → LIVE (retry):
    trigger: "दोबारा कोशिश करें" CTA
    guard: scanFails < 3
    action: restart camera

  RESULT_FAIL → PHOTO_FALLBACK:
    trigger: scanFails >= 3, user taps "नेट बॉक्स की फोटो लें"
    action: navigate to s11 (photo capture)

  RESULT_SUCCESS → IDLE:
    trigger: "ठीक है" CTA
    action: atOffice++, toPickup--, add device to officeDevices, scanSessionCount++, stopCamera()
    ui: navigate to scanFrom (s1 or s3)

  PHOTO_FALLBACK → RESULT_SUCCESS:
    trigger: photo submit + 80% probability
    action: same as scan success

  PHOTO_FALLBACK → DEFECTIVE:
    trigger: photo submit + 20% probability
    action: navigate to s12
    ui: quarantine message, "बाकी नेट बॉक्स मैनेज करें" CTA
```

---

## 5. Business Rules

| Rule | Logic | Enforcement |
|------|-------|-------------|
| Pricing | ₹2,000 per 10 devices. Always multiples of 10 | `cost = (reqCount / 10) * 2000` |
| Fund gate | Cannot order if fundBalance < cost | Check on submit, show insufficient dialog |
| Wallet gate | Cannot top-up if walletBalance < topupCost | Check on submit, show insufficient dialog |
| Deposit lock | ₹250 per unrecovered device | `lockedAmount = notRecovered * 250` |
| Max capacity | Partner has a max device quota (e.g. 70) | `remaining = maxCapacity - total` |
| Single active order | Only one order at a time | Order CTA hidden during active order |
| Delivery gate | Unconfirmed devices cannot be used for installation | Interceptor at 48hrs |
| Scan gate | Recovered device must be scanned before reissue | Scan moves device from pickup → office |
| Count invariant | `total = atCustomer + atOffice + toPickup + notRecovered` | Enforce after every mutation |

---

## 6. API Contracts (Expected)

### GET /partner/{id}/inventory
```json
{
  "total": 50,
  "atCustomer": 35,
  "atOffice": 6,
  "toPickup": 4,
  "notRecovered": 5,
  "officeDevices": [{"id": "SY25201", "status": "ok"}, ...],
  "pickupTickets": [{"id": "WIM21047", "customer": "Seema Rajawat", "address": "...", "daysLeft": 3, "device": "SY25180"}, ...],
  "notRecoveredDevices": [{"id": "SY25100", "customer": "Manoj Tiwari", "date": "2024-07-14", "lockedAmount": 250}, ...],
  "maxCapacity": 70
}
```

### POST /partner/{id}/order
```json
// Request
{"count": 10}

// Response (success)
{"orderId": "ORD-2026-001", "count": 10, "step": 0, "estimatedDelivery": "2026-03-27", "fundDeducted": 2000}

// Response (insufficient fund)
{"error": "INSUFFICIENT_FUND", "required": 2000, "available": 1000}
```

### POST /partner/{id}/delivery/confirm
```json
// Request
{"orderId": "ORD-2026-001"}

// Response
{"confirmed": true, "devicesAdded": ["SY25301", "SY25302", ...], "newOfficeCount": 16}
```

### POST /partner/{id}/scan
```json
// Request
{"deviceId": "SY25201", "method": "camera_scan" | "photo_upload", "imageBase64": "..."}

// Response (success)
{"status": "ADDED_TO_INVENTORY", "deviceId": "SY25201"}

// Response (already exists)
{"status": "ALREADY_IN_INVENTORY", "deviceId": "SY25201"}

// Response (wrong partner)
{"status": "NOT_YOUR_DEVICE", "deviceId": "SY25201", "assignedTo": "Partner XYZ"}

// Response (blacklisted)
{"status": "BLACKLISTED", "deviceId": "SY25201"}

// Response (defective)
{"status": "DEFECTIVE", "deviceId": "SY25201", "ticketId": "TKT-001"}

// Response (unrecognized)
{"status": "SCAN_FAILED", "reason": "Could not read device ID from image"}
```

### GET /partner/{id}/fund
```json
{
  "balance": 26000,
  "walletBalance": 3000,
  "transactions": [
    {"date": "2024-06-30", "desc": "Top-up", "amount": 2000, "type": "credit"},
    {"date": "2024-06-30", "desc": "Joining seed", "amount": 20000, "type": "credit"}
  ]
}
```

### POST /partner/{id}/fund/topup
```json
// Request
{"amount": 2000}

// Response (success)
{"newFundBalance": 28000, "newWalletBalance": 1000}

// Response (insufficient wallet)
{"error": "INSUFFICIENT_WALLET", "required": 2000, "available": 1000}
```

### GET /partner/{id}/ledger
```json
{
  "batches": [
    {"date": "2024-06-30", "count": 20, "extra": 0, "devices": ["SY25201", "SY25202", ...]},
    {"date": "2024-05-15", "count": 20, "extra": 1, "devices": ["SY25180", ...]}
  ]
}
```

---

## 7. Edge Case Matrix

### 7.1 Critical (must handle in production)

| ID | Scenario | Current Behavior | Required Behavior |
|----|----------|-----------------|-------------------|
| E01 | Camera permission denied | Shows "कैमरा उपलब्ध नहीं है" | Correct. Also offer "फोटो अपलोड करें" as alternative |
| E02 | Scan device already in inventory | Adds duplicate | Must check against officeDevices[].id before adding. Show "पहले से इन्वेंटरी में है" |
| E03 | Scan device belongs to another partner | Adds to inventory (no server check) | Server must validate ownership. Show "यह नेट बॉक्स आपके खाते में नहीं है" |
| E04 | Network failure during order/confirm/scan | No handling (client-only) | Show error toast + retry. Never mutate local state before server confirms |
| E05 | Partner at max capacity orders more | CTA still enabled if fund sufficient | Disable CTA when remaining capacity = 0. Show "आपकी अधिकतम सीमा पूरी हो गई है" |
| E06 | Fund balance exactly 0 | "रिक्वेस्ट भेजें" shows insufficient dialog | Correct behavior |
| E07 | Partial delivery | Not supported | Future: allow checking received IDs against expected IDs. Report missing. |
| E08 | Concurrent operations from multiple devices | No protection | Server-side: optimistic locking on fund balance, order state, inventory counts |

### 7.2 Important (should handle)

| ID | Scenario | Required Behavior |
|----|----------|-------------------|
| E09 | App backgrounded during camera scan | Cancel scan timer, reset to IDLE state on resume |
| E10 | Device ID in scan photo is unreadable | SCAN_FAILED response → 3-fail photo fallback flow handles this |
| E11 | Very long device list (100+ in office) | Paginate (20 per page) or virtual scroll |
| E12 | Partner with 0 devices (new partner) | All tiles show "00". Show onboarding: "अपना पहला ऑर्डर दें" with arrow to Order CTA |
| E13 | Wallet changes between top-up sheet open and submit | Re-fetch wallet balance on submit, not just on sheet open |
| E14 | Language switch mid-scanner | Scan messages update on next state transition. Bottom sheet text updates on render |
| E15 | Interceptor during technician installation flow | Allow navigation to s6 and s8 (scan) from interceptor. Currently only s6 allowed |

### 7.3 Polish (nice to have)

| ID | Scenario | Required Behavior |
|----|----------|-------------------|
| E16 | Offline mode | Cache last inventory state. Show stale data indicator. Block mutations |
| E17 | Pull-to-refresh on landing | Re-fetch inventory from server |
| E18 | Scan animation feels slow/fast | Make scan duration configurable (currently 2000ms) |
| E19 | Rapid consecutive scans | Debounce scan CTA — disable for 5s after each scan result |

---

## 8. Localization Strings

All user-facing strings must support Hindi (primary) and English (secondary). Use the `t(hi, en)` helper pattern:

```javascript
function t(hi, en) { return currentLang === 'hi' ? hi : en; }
```

### Complete String Table

| Key | Hindi | English |
|-----|-------|---------|
| screen_title | मेरे नेट बॉक्स | My Net Boxes |
| summary_label | आपके खाते में चढ़े हुए नेट बॉक्स | Net boxes in your account |
| scan_cta | स्कैन करें | Scan |
| tile_at_customer | कस्टमर के घर पर | At customer's home |
| tile_in_office | ऑफिस में | In office |
| tile_pickup | कस्टमर से वापस लाना है | Pickup pending |
| tile_not_recovered | वापस नहीं ला पाए | Could not recover |
| capacity_text | आप {n} नेट बॉक्स और जारी करवा सकते हैं | You can get {n} more net boxes issued |
| order_cta | नए नेट बॉक्स मंगवाएं | Order New Net Boxes |
| order_tracking | ऑर्डर ट्रैकिंग | Order Tracking |
| step_ordered | आर्डर दिया | Ordered |
| step_packed | पैक हो गए | Packed |
| step_transit | रास्ते में | In Transit |
| step_delivered | पहुंच गया | Delivered |
| confirm_delivery | डिलीवरी कन्फर्म करें | Confirm Delivery |
| confirm_title | {n} नेट बॉक्स की डिलीवरी कन्फर्म करें | Confirm delivery of {n} net boxes |
| confirm_checkbox | हाँ, {n} नेट बॉक्स का ऑर्डर मिल गया | Yes, I received {n} net boxes |
| confirm_empty | कोई पेंडिंग डिलीवरी नहीं है | No pending delivery |
| netbox_detail | नेट बॉक्स डिटेल | Net Box Details |
| see_more | और {n} देखें | See {n} more |
| see_less | कम देखें | See less |
| office_title | ऑफिस में मौजूद नेट बॉक्स | Net Boxes in Office |
| office_count | नेट बॉक्स की संख्या | Number of net boxes |
| device_ready | तैयार | Ready |
| device_charge | चार्ज करें | Needs charge |
| office_info | ये नेट बॉक्स आपके ऑफिस में हैं और नए कनेक्शन के लिए तैयार हैं। | These net boxes are in your office and ready for new connections. |
| scan_netbox | नेट बॉक्स स्कैन करें | Scan Net Box |
| pickup_title | कस्टमर से वापस लाना है | Pickup Pending |
| pickup_customer | कस्टमर | Customer |
| pickup_address | पता | Address |
| pickup_start | शुरू करें | Start Pickup |
| pickup_days | {n} दिन | {n} days |
| financial_title | हिसाब किताब | Account Summary |
| locked_deposit | लॉक्ड डिपॉजिट | Locked Deposit |
| financial_info | कस्टमर से नेट बॉक्स वापस ला कर आप लॉक्ड डिपॉजिट वापस पा सकते हैं। | Recover the net box from customer to unlock your deposit. |
| device_details | डिवाइस डिटेल्स | Device Details |
| fund_title | पार्टनर सक्सेस फंड | Partner Success Fund |
| fund_total | कुल अमाउंट | Total Amount |
| fund_topup_cta | टॉप-अप करें | Top Up |
| fund_recent | हाल ही में किए गए टॉप-अप | Recent Top-ups |
| fund_topup_title | बैलेंस बढ़ाएं | Top Up Balance |
| fund_topup_info | ₹2,000 में 10 नेट बॉक्स तक | ₹2,000 for up to 10 net boxes |
| wallet_balance | वॉलेट बैलेंस | Wallet balance |
| fund_balance_label | सक्सेस फंड बैलेंस | Success Fund Balance |
| fund_sufficient | ✓ पर्याप्त बैलेंस | ✓ Sufficient balance |
| fund_insufficient | ✗ बैलेंस कम है | ✗ Low balance |
| request_title | आपको कितने नेट बॉक्स चाहिए? | How many net boxes do you need? |
| request_submit | रिक्वेस्ट भेजें | Send Request |
| request_success | रिक्वेस्ट भेज दी गई | Request Sent |
| insufficient_title | वॉलेट बैलेंस कम है | Low Wallet Balance |
| insufficient_desc | टॉप-अप करने के लिए आपका वॉलेट बैलेंस कम है | Your wallet balance is too low to top up |
| recharge_wallet | वॉलेट रिचार्ज करें | Recharge Wallet |
| cancel | कैंसिल करें | Cancel |
| ok | ठीक है | Okay |
| scanner_title | नेट बॉक्स स्कैन | Scan Net Box |
| scanner_instruction | नेट बॉक्स ID को स्कैनर के बीच में रखें | Place net box ID inside the scanner |
| scanner_start | स्कैन शुरू करें | Start Scan |
| scanning | डिवाइस ID की जांच हो रही है... | Verifying device ID... |
| scan_success | स्कैन सफल! | Scan Successful! |
| scan_added | यह नेट बॉक्स आपकी इन्वेंटरी में जोड़ दिया गया है | This net box has been added to your inventory |
| scan_fail | स्कैन ढंग से नहीं हो पाया | Scan was not successful |
| scan_attempt | कोशिश | Attempt |
| scan_retry | दोबारा कोशिश करें | Try Again |
| scan_3fail | 3 बार स्कैन फेल हो गया | Scan failed 3 times |
| scan_photo_prompt | नेट बॉक्स की साफ़ फोटो लें ताकि ID पहचानी जा सके | Take a clear photo of the net box to identify it |
| take_photo | नेट बॉक्स की फोटो लें | Take Photo |
| try_scan_again | दोबारा स्कैन करें | Try Scanning Again |
| photo_title | नेट बॉक्स फोटो | Net Box Photo |
| photo_instruction | नेट बॉक्स की साफ़ फोटो खींचें | Take a clear photo of the net box |
| photo_hint | नेट बॉक्स ID साफ़ दिखनी चाहिए | Net box ID should be clearly visible |
| photo_identified | फोटो से पहचान हुई! | Identified from Photo! |
| photo_exit_title | बिना फोटो सबमिट किये वापस जाना चाहते हैं? | Go back without submitting photo? |
| photo_exit_desc | डिवाइस की फोटो व्योम भेजे बिना यह डिवाइस आप लौटा नहीं पाएंगे | You can't return this device without submitting its photo |
| continue | काम जारी रखें | Continue |
| manage_others | बाकी नेट बॉक्स मैनेज करें | Manage Other Net Boxes |
| defective_title | इस नेट बॉक्स को अलग से संभाल कर रखें | Keep this net box aside |
| defective_desc | आपकी बताई समस्या को हम वेरीफाई करके इसका समाधान करेंगे | We'll verify the issue and resolve it soon |
| interceptor_title | डिलीवरी कन्फर्म करें! | Confirm Delivery! |
| interceptor_desc | आपका ऑर्डर 48+ घंटे पहले पहुंचा है। बिना डिलीवरी कन्फर्म किये आप पार्टनर प्लस ऐप इस्तेमाल नहीं कर पाएंगे। | Your order arrived over 48 hours ago. You cannot use the Partner Plus app without confirming delivery. |
| confirm_now | कन्फर्म करें | Confirm Now |
| ledger_title | जारी किए गए नेट बॉक्स का हिसाब | Issued Net Boxes Ledger |
| netboxes | नेट बॉक्स | net boxes |
| extra_replacement | अतिरिक्त (रिप्लेसमेंट) | extra (replacement) |
| loading_camera | कैमरा लोड हो रहा है... | Loading camera... |
| camera_unavailable | कैमरा उपलब्ध नहीं है | Camera not available |
| customer_home_info | यह वो नेट बॉक्स हैं जो कस्टमर के घर पर रखें हैं — जिनका बिल भरा है, या जिनकी पिकअप टिकट नहीं बनी, या पिकअप अभी बाकी है। | These are net boxes installed at customers' homes — either active with paid bills, or with no pickup ticket raised yet, or pickup still pending. |
| got_it | समझ गया | Got it |
| pickup_flow | पिकअप फ्लो | Pickup Flow |
| coming_soon | यह फ्लो अभी बनाया जा रहा है। जल्द उपलब्ध होगा। | This flow is being built. Coming soon. |
| menu_ledger | नेट बॉक्स का हिसाब | Net Box Ledger |
| menu_fund | सक्सेस फंड | Success Fund |

---

## 9. Device ID Format

| Prefix | Device Type | Example |
|--------|------------|---------|
| SY | Syrotech | SY25201 |
| GX | GX | GX35204 |
| WIM | Wiom internal (tickets) | WIM21047 |

Pattern: `[A-Z]{2,3}[0-9]{5}`

---

## 10. Prototype Demo Patterns

For deterministic demo behavior (no random failures confusing stakeholders):

**Scan pattern:** `scanSessionCount % 2`
- Even sessions (0, 2, 4...): First scan succeeds
- Odd sessions (1, 3, 5...): First scan fails → retry succeeds

**Order progression:** Auto-advance steps via setTimeout
- Step 0→1: 8 seconds
- Step 1→2: 8 seconds
- Step 2→3: 8 seconds
- Total: 24 seconds from order to delivered

**Photo fallback outcome:** 80% success, 20% defective (random)

These patterns reset on page reload. Use developer FAB to jump to specific states.
