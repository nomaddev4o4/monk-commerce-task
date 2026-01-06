# Monk Commerce — Frontend Developer Task (React + TypeScript)

This repo is my submission for the Monk Commerce Frontend Developer task. It implements an “Add Products” page where a store owner can build a list of products, pick products/variants from a modal, apply discounts, and reorder items.

## Live demo

- **Netlify URL**: _add your link here_

## Tech stack

- **React 19 + TypeScript**
- **Vite** (dev/build)
- **CSS Modules** (styling)
- **Native HTML5 drag & drop** (reordering)
- **No third-party UI/DnD libraries**: kept it simple on purpose (only React + built-in browser APIs)

## Setup (run locally)

1. Install deps:

```bash
npm install
```

2. Create a `.env` file in the project root:

- **`VITE_API_BASE_URL`**: `stageapi.monkcommerce.app`
- **`VITE_API_KEY`**: the `x-api-key` shared in the task email

3. Start dev server:

```bash
npm run dev
```

## Scripts

- **`npm run dev`**: start Vite dev server
- **`npm run build`**: typecheck + production build
- **`npm run preview`**: preview production build locally
- **`npm run lint`**: run ESLint

## What’s implemented (mapped to the task)

### Product list

- **Selected products list** with numbering
- **Remove product** with “✕” (hidden when there’s only one product in the list)
- **Show/Hide variants** toggle only when a product has more than 1 selected variant
- **Discounts**
  - Product-level “Add Discount” → enter value + choose `% Off` / `Flat Off`
  - Variant-level “Add Discount” → enter value + choose `% Off` / `Flat Off`
- **Reorder**
  - Drag & drop to reorder products
  - Drag & drop to reorder variants within a product

### Product picker modal

- Opens from the product row edit icon
- **Search** by product name with a small debounce (so it doesn’t spam the API while typing)
- **Multi-select** products and variants
- **Replacement behavior**: when editing product at index `i`, confirming replaces that item with all newly selected products (the list expands/shrinks accordingly)
- **Scroll pagination**: loads 10 at a time; when you scroll near the bottom, it fetches the next page
- Basic loading + error + empty states

## Project structure (high level)

- `src/components/product-list/` — selected list UI, discounts, drag/drop
- `src/components/product-picker/` — modal UI, search, pagination, selection
- `src/services/products.api.ts` — API calls
- `src/types/product.type.ts` — shared types

## Thought process / approach

### 1) Data model decisions

I kept the “picker selection” model separate from the “selected list” model on purpose:

- The picker uses a lightweight `{ productId, variantIds[] }` structure because it’s easy to toggle checkboxes.
- The selected list stores the full product object plus UI state (show/hide variants, discount inputs, etc.). That lets the list render without constantly looking things up.

Discounts are stored in two places:

- **Product discount** directly on the product row
- **Variant discounts** in a `variantsWithDiscount` map keyed by `variantId` so each variant can have its own state without searching arrays repeatedly.

### 2) Editing = “replace” behavior

The core requirement is: if the user edits product #2 and selects products #4 and #5, then #2 should be replaced and the list becomes `1,4,5,3`.

To make that predictable, the list component tracks an `editingIndex`, and on confirm it uses `splice(editingIndex, 1, ...newProducts)`.

### 3) Preventing duplicates while editing

When the picker opens, previously selected products are treated as “locked” so the user can only add **new** products during that edit session. This avoids accidental duplicates and keeps the replace behavior simple.

### 4) Pagination + search

I implemented:

- **Scroll-based pagination** (10 items per fetch)
- A simple **debounce** for search input
- “Load more” state so the UI doesn’t flicker on the initial load vs subsequent loads

### 5) Drag & drop choice

I went with native HTML5 drag/drop since the requirements are fairly small (reorder in one list + nested list). The main upside is no extra dependencies; the downside is it’s not as smooth on touch devices and it’s not keyboard-accessible by default.

### 6) Component modularity + state management tradeoff

I kept the UI fairly modular (separate components for the list rows, variant rows, modal, etc.) to make it easier to reason about and to keep the JSX readable.

For state management, I intentionally didn’t add any external state library. All state lives in the parent list component and gets passed down via props/callbacks. That keeps the dependency surface small, but it does come with some sacrifice in code quality: there’s a bit more prop-drilling and “wiring” code than I’d want in a larger app.

## Known gaps / what I’d improve next

- **Accessibility**: better keyboard support/focus management in the modal and for reordering.
- **Less manual styling**: TailwindCSS would speed up iteration and keep styles more consistent.
- **Touch + accessibility for drag & drop**: a library like `dnd-kit` would be more consistent across devices and easier to make keyboard-friendly.
- **State management**: if this grew further, I’d switch to a reducer + context, or a small store (like Zustand) to cut down prop drilling and make updates easier to follow.
- **Variant availability**: Figma shows an “available” count per variant, but the provided API response doesn’t include it (no `variant.count`). In the picker UI I show **N/A** as a fallback.
- **State persistence**: persist the selected list (localStorage or API) so refresh doesn’t wipe it.
