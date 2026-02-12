# Product Requirements Document: BENCHmark MVP

## Overview

**Product Name:** BENCHmark\
**Problem Statement:** Serious gym lifters need a fast, clean macro
tracking app without essential features hidden behind paywalls.\
**MVP Goal:** Build a production-quality web app you use daily and 3+
lifters adopt within 1 month.\
**Target Launch:** 2 weeks

------------------------------------------------------------------------

# Target Users

## Primary User Profile

**Who:** Serious gym lifter (training 4--6x per week)\
**Tech Level:** Comfortable with apps, not technical\
**Goals:**\
- Track calories and macros precisely\
- Hit protein targets daily\
- Adjust intake for bulk/cut phases

**Main Problem:**\
Existing apps are cluttered, slow, or lock useful features behind
subscriptions.

**Current Solution:**\
MyFitnessPal or similar macro trackers.

**Why They'll Switch to BENCHmark:** - Cleaner interface\
- Faster logging\
- No core functionality behind paywalls\
- Built specifically with lifters in mind

------------------------------------------------------------------------

# User Journey

## Core Story

User finishes a meal → opens BENCHmark → sees current daily calories +
macros → searches for food → logs serving → totals update instantly →
closes app confident they're on track.

## Key Touchpoints

1.  **Arrival:**\
    User opens app after eating.

2.  **Dashboard (Home):**

    -   Total calories today
    -   Protein / carbs / fats
    -   Color-coded progress bars

3.  **Food Search:**

    -   Search bar with autocomplete
    -   Select serving
    -   Add to today

4.  **Daily Core Loop:** Eat → Log → View totals → Adjust intake

5.  **Retention Trigger:** Speed + clarity + no paywall friction

------------------------------------------------------------------------

# MVP Features

## 1. Food Search

-   Search database
-   Add serving size
-   Log calories/macros

**Success Criteria:** - Reliable search - Editable serving size -
Instant logging

------------------------------------------------------------------------

## 2. Auto-Calculation of Macros

-   Updates totals instantly
-   Handles edits/deletions correctly

------------------------------------------------------------------------

## 3. Totals Quantified

-   Show macros per food
-   Show daily totals
-   Progress bars toward goals

------------------------------------------------------------------------

## 4. Daily Logs

-   Log per day
-   Reset totals each new day
-   View/edit past days

------------------------------------------------------------------------

# Not in MVP (Future Versions)

-   Payment system
-   Coaching
-   Native mobile app
-   Social features
-   AI food recommendations

------------------------------------------------------------------------

# Success Metrics

## Short-Term (1 Month)

-   Personal daily use
-   3 active lifters
-   Fast logging (\<15 seconds per meal)
-   \< 1 bug per day

## Medium-Term (3 Months)

-   Fully replace MyFitnessPal
-   1,000 searchable foods
-   Production stability

------------------------------------------------------------------------

# UI/UX Direction

**Style:** Minimal, black & white, light theme\
**Accent:** Color-coded progress bars\
**Design Values:** Simplicity, speed, clarity

------------------------------------------------------------------------

# Key Screens

1.  Dashboard\
2.  Food Search\
3.  Log History\
4.  Settings/Profile

------------------------------------------------------------------------

# Technical Considerations

-   Web app (mobile responsive)
-   Email/password authentication
-   \< 2 second page load
-   Search under 300ms perceived delay
-   Support \~1,000 users
-   Budget under \$50/month

------------------------------------------------------------------------

# MVP Completion Checklist

-   [ ] Food search functional
-   [ ] Macro totals accurate
-   [ ] Historical logs saved
-   [ ] Authentication secure
-   [ ] Mobile responsive
-   [ ] Deployed production instance

------------------------------------------------------------------------

*Created: BENCHmark MVP PRD*
