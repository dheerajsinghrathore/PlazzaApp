# Plazza take-home notes

## Assumptions

- The PDF referred to an attached `catalog.json`, but no separate catalog file was present with the provided PDF or in the project. I transcribed the 14 row catalog table embedded in the brief into `src/features/catalog/data/catalog.json`.
- `SAVE10` applies to the item total before delivery, rounds to the nearest rupee, and is capped at ₹100. Coupon discounts cannot exceed the item total.
- Delivery is ₹40 when the item total is below ₹499 and free at ₹499 or above. `FREEDEL` waives the fee at any item total.
- `FIRST100` applies at an item total of at least ₹200. It becomes used when Place Order is pressed and remains used across restarts.
- Location permission is foreground only. The displayed coordinates are generic delivery coordinates; no address lookup or backend is used.

## Design decisions and trade-offs

- Catalog search and coupon evaluation are synchronous local domain functions. Redux owns cart lines, the active coupon and one-time coupon usage.
- Coupon definitions live in the `couponRules` registry. The bill calculator and cart reducer consume those definitions, so another rule can be added without changing cart mechanics.
- AsyncStorage stores one versioned document and validates its shape, catalog IDs, quantities and coupon codes before restoring state. Older keys from the first implementation are migrated where valid.
- A short local search delay provides a visible loading state. Permission status is refreshed when the app returns to the foreground; blocked status is retained because Android may report a previously blocked permission as denied on a later check.
- Place Order is a mock flow: it clears the cart and records one-time coupon use without sending data to a service.

## What I would improve with more time

- Exercise the permission denial, permanent denial, Settings return and coordinate flows on multiple Android 13+ devices and OEM variants.
- Add UI-level tests for permission and checkout interactions, and add a more complete accessibility pass for screen reader focus and touch targets.
- Add a real order confirmation and server-backed account-level coupon usage if the app had a backend.

## AI use

AI assistance was used to inspect the starter project, scaffold feature modules and tests, and compare the app against the take-home brief. The first implementation used a generic catalog and coupon thresholds; after reading the PDF, those assumptions were rejected and replaced with the brief's catalog, ₹40/₹499 delivery rule, coupon eligibility and one-time use behavior. TypeScript, lint, unit tests and an Android debug build were run to review the changes.
