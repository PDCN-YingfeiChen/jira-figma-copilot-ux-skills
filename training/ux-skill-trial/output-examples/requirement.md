# Requirement Summary

## Source Status

- Mode: Mock validation
- Source type: Mock Jira issue
- Validity: Valid for Skill logic validation, not real Jira API validation

## Issue

- Key: CARTS-4572
- Title: Add cart item quantity update interaction
- Status: In Progress
- Priority: High

## UX Goal

Allow users to update product quantity directly in the cart with clear feedback, error handling, and empty-cart behavior.

## Functional Requirements

| ID | Requirement | Source | Priority |
|---|---|---|---|
| FR1 | Users can increase product quantity in the cart. | Jira | Must |
| FR2 | Users can decrease product quantity in the cart. | Jira | Must |
| FR3 | Users can remove an item when quantity reaches zero. | Jira | Must |
| FR4 | Cart total price updates after quantity changes. | Jira | Must |
| FR5 | Users see loading feedback while update is processing. | Jira | Must |
| FR6 | Users see an error message if update fails. | Jira | Must |
| FR7 | Users cannot set quantity below zero. | Jira | Must |
| FR8 | Users can undo item removal within 5 seconds. | Jira | Should |

## Open Questions

- Should undo duration follow global toast behavior or exactly 5 seconds?
- What exact error copy should be used?
