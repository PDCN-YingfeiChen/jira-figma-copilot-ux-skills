# User Flow

## Source Status

- Mode: Mock validation

## Main Flow

| Step | Actor | Action | System Response | Related Requirement |
|---|---|---|---|---|
| 1 | User | Opens cart page | System displays cart items and quantity steppers | AC1 |
| 2 | User | Taps plus/minus | System disables stepper and shows updating state | AC3 |
| 3 | System | Receives success | Quantity and subtotal update | AC2 |
| 4 | User | Continues to checkout | System proceeds if cart has items | AC8 |

## Error Flow

Quantity update fails → restore previous value → show error message → allow retry.

## Required Screens

- Cart - Default
- Cart - Updating Quantity
- Cart - Error
- Cart - Item Removed
- Cart - Empty
