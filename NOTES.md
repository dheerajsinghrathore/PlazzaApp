# Plazza take-home notes

## Assumptions

- The brief referred to an attached `catalog.json`, but no separate catalog file was provided, so I transcribed its 14-row table into `src/features/catalog/data/catalog.json`. The current working copy also includes a Shelcal 500 entry.
- `SAVE10` applies to the item total before delivery, rounds to the nearest rupee, and is capped at ₹100. Coupon discounts cannot exceed the item total.
- Delivery is ₹40 when the item total is below ₹499 and free at ₹499 or above. `FREEDEL` waives the fee at any item total.
- `FIRST100` applies at an item total of at least ₹200. It becomes used when Place Order is pressed and remains used across restarts.
- Location permission is foreground only. Native reverse geocoding displays city and district; when device location is off, the permission card links to location settings. Coordinates and addresses are not sent to an app backend.

## Design decisions and trade-offs

- Redux Toolkit owns cart lines, the active coupon, one-time coupon usage and recent searches. Permission state is managed separately by the permission provider.
- Coupon rules and validation live in `src/features/cart/domain/couponRules.ts`; bill totals and delivery calculations live in `src/features/cart/domain/cartLogic.ts`.
- AsyncStorage stores the cart and recent searches together in one versioned document. Restoration validates catalog IDs, quantities and coupon codes; valid data under the earlier storage keys is migrated.
- Debounced name-or-salt searches are recorded as recent searches, capped at five, and restored from persistence on startup.
- A shared color palette in `src/theme/colors.ts` keeps screens and controls visually consistent. Permission UI distinguishes blocked permissions (Settings) from denied permissions (retry).
- The location label uses the platform geocoder through `react-native-geocoder-reborn`, avoiding a third-party HTTP geocoding API key.
- A short local search delay provides a visible loading state. Permission status is refreshed when the app returns to the foreground; blocked status is retained because Android may report a previously blocked permission as denied on a later check.
- Place Order is a mock flow: it clears the cart and records one-time coupon use without sending data to a service.

## What I would improve with more time

- Exercise the permission denial, permanent denial, device-location toggle, Settings return and reverse-geocoding flows on multiple Android 13+ devices and OEM variants.
- Expand UI-level tests from permission states, quantity limits and the empty-cart state to search and checkout interactions; add a more complete accessibility pass for screen reader focus and touch targets.
- Add a real order confirmation and server-backed account-level coupon usage if the app had a backend.

## AI use

AI was prompted to inspect the React Native starter, implement the take-home brief, and add tests. An initial generic catalog and guessed coupon thresholds were rejected after comparing them with the brief; I rewrote the catalog and coupon/bill rules to match its specified items, ₹40/₹499 delivery rule, coupon eligibility and one-time use. I also reviewed the generated permission and quantity-limit UI against denied, blocked, mixed-permission and max-quantity states, tightened the empty-cart state, verified persisted recent searches, and added device-location settings and native reverse-geocoding behavior. TypeScript, lint, 10 test suites (26 tests) and an Android debug build were used to validate the result.
