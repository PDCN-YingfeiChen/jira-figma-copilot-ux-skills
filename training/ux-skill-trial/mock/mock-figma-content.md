# Mock Figma Content

> Source type: Mock validation data. This file validates Jira-Figma comparison without real Figma API access.

## File

- File name: Cart UX MVP
- Page: Cart Flow
- Platform: Mobile Web

## Frame: Cart - Default

Text layers:
- Shopping Cart
- 2 items
- Porsche Lifestyle Backpack
- Quantity
- -
- 1
- +
- Subtotal
- Continue to Checkout

Components:
- Header / Mobile
- Cart Item Card
- Quantity Stepper
- Price Summary
- Button / Primary

Evidence:
- Covers AC1: Quantity stepper exists.
- Partially covers AC2: subtotal shown, but update behavior is not documented.

## Frame: Cart - Updating Quantity

Text layers:
- Updating cart...
- Quantity is temporarily disabled

Components:
- Loading Spinner
- Quantity Stepper / Disabled
- Price Summary / Loading

Evidence:
- Covers AC3.

## Frame: Cart - Item Removed

Text layers:
- Item removed
- Undo
- Subtotal updated

Evidence:
- Covers AC6.
- Partially covers AC7 because duration is not specified.

## Frame: Cart - Empty

Text layers:
- Your cart is empty
- Continue shopping
- Continue to Checkout

Evidence:
- Conflicts with AC8 because Continue to Checkout appears enabled.

## Missing Frames / States

The Figma content does not include:

- API error state when quantity update fails
- Error message copy
- Retry action
- Long product name handling
- Out-of-stock quantity update behavior

## Comments

Designer comment: Need to confirm whether undo should remain for 5 seconds or follow global toast duration.
