# Mock Jira Issue

> Source type: Mock validation data. This file validates Skill logic without real Jira API access.

## Issue

- Key: CARTS-4572
- Title: Add cart item quantity update interaction
- Status: In Progress
- Priority: High
- Labels: cart, checkout, ux, mvp

## Business Background

Users need to adjust item quantities directly in the shopping cart before checkout. The current cart flow requires users to remove and re-add products when they want to change quantity, which creates friction and may reduce checkout conversion.

## User Problem

As a user, I want to update product quantity directly in the shopping cart so that I can review and adjust my order before checkout without leaving the cart page.

## Functional Requirements

1. Users can increase product quantity in the cart.
2. Users can decrease product quantity in the cart.
3. Users can remove an item when quantity reaches zero.
4. Cart total price updates immediately after quantity changes.
5. Users see a loading state while the quantity update is processing.
6. Users see an error message if the quantity update fails.
7. Users cannot set quantity below zero.
8. Users can undo item removal within a short time window.

## Acceptance Criteria

- AC1: Quantity stepper is available for each cart item.
- AC2: Cart total updates after each successful quantity change.
- AC3: Loading state is shown while update request is processing.
- AC4: Error state is shown if update request fails.
- AC5: Users cannot reduce quantity below zero.
- AC6: When quantity reaches zero, the item is removed from cart.
- AC7: Users can undo item removal within 5 seconds.
- AC8: Checkout button is disabled when cart is empty.

## Constraints

- Must reuse existing design system components where possible.
- Must support mobile web first.
- Must not introduce a new cart page architecture.

## Comments

### PM Comment

The main priority is reducing friction before checkout. Please keep the quantity update interaction simple and fast.

### Engineering Comment

Backend update may take up to 1 second. Please account for loading and failure states.

### UX Lead Comment

Please make sure empty cart and undo removal behavior are included in the design review.
