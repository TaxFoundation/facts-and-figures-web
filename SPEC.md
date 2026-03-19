# Facts and Figures Web - Improvement Suggestions

## Context

- The app is used **entirely as an iframe embed** on taxfoundation.org
- Primary audience: general public and journalists using it as a
  quick-reference / pocket guide; policy researchers use it less
- **2026 launch is imminent** - only quick wins should be tackled now
- Historical year-over-year data and chart/map visualizations are
  planned for **next year (2027)**
- Styled Components should eventually be replaced with a more modern
  styling approach

---

## 1. Quick, Easy Wins (do now, before launch)

### 1a. Fix console errors from styled-components

There are styled-components warnings about unknown props being passed to
DOM elements (e.g., `ascending`, `orderedBy` on `<th>`). These should use
transient props (prefix with `$`) to prevent them from being forwarded to
the DOM. There are also React DOM nesting warnings that should be
investigated.

### 1b. Add horizontal scroll for wide tables on mobile

Tables with many columns (e.g., Table 7 - "Percentage of Total from Each
Source" with 6 columns) overflow the viewport on mobile and get clipped
with no way to see the hidden data. Wrapping the table in a container with
`overflow-x: auto` would make the full table accessible on small screens.

### 1c. Fix truncated dropdown option text

Some table names in the dropdown are cut off (e.g., "Table 33 - Property
Taxes Paid as a Percentage of" and "Table 34 - State & Local Property Tax
Collections per"). The full titles should be visible or the dropdown should
accommodate longer text.

### 1d. Add a "Download All Tables" button

There is already a combined `facts-and-figures.xlsx` file generated in
`public/data/`. A prominent link to download the full workbook (in addition
to individual table downloads) would be useful for researchers who want all
the data at once.

### 1e. Improve sort indicator visibility

The current sort arrows on column headers in state tables are small and
easy to miss. Making them slightly larger, bolder, or adding a subtle
background highlight to the sorted column would make the active sort more
obvious.

### 1f. Add a visible label or hint for sortable columns

First-time users may not realize columns are sortable. A subtle "Click to
sort" tooltip or a cursor change alone isn't enough - consider adding a
small instructional note above the table (e.g., "Click column headers to
sort") that could be dismissed or hidden after first interaction.

---

## 2. UI/UX Improvements (post-launch)

### 2a. URL-based table selection (deep linking)

Currently the selected table is only stored in React state. Using a URL
hash or query parameter (e.g., `#table=3` or `?table=3`) would allow
embeds to link directly to a specific table. This is important for the
embed use case - blog posts about specific tax topics could deep link to
the relevant table.

### 2b. Group the table dropdown by category

The dropdown has 43 tables in a flat list, which is overwhelming. Grouping
them with `<optgroup>` labels by topic (e.g., "Income Taxes," "Sales &
Excise Taxes," "Property Taxes," "Debt & Pensions," "Demographics") would
make finding a specific table much faster.

### 2c. Improve mobile layout

Beyond the horizontal scroll fix (1b), consider:
- Making the dropdown full-width on mobile (it already appears to be, but
  the text gets clipped)
- Reducing font sizes slightly on small screens for better table fit
- Adding a sticky header row so users can see column names while scrolling
  through 50+ state rows

### 2d. Add smooth transitions between tables

When switching tables, the content jumps instantly. A subtle fade or
slide transition would make the experience feel more polished, especially
when the table structure changes dramatically (e.g., switching from a
3-column states table to a complex bracket table).

### 2e. Highlight the "United States" / national average row

In state tables, the "United States" row is the national benchmark but
looks the same as state rows. Giving it a distinct style (bold text,
different background, or a bottom border separator) would help users
quickly identify the reference point.

### 2f. Add a "Back to top" affordance

Tables like Table 11 (State Individual Income Tax Rates) are extremely
long. A floating "back to top" button or a sticky table selector at the top
would help users navigate without scrolling all the way back up.

### 2g. Migrate away from Styled Components

Styled Components is aging and adds runtime overhead. Consider migrating
to CSS Modules, vanilla CSS with custom properties, or a zero-runtime
solution like vanilla-extract. This would also eliminate the console
warnings about transient props.

---

## 3. Possible New Features (next year / 2027)

### 3a. State search / filter

For state tables, add a search box that lets users quickly filter to
specific states (e.g., type "Cal" to show only California). This would be
much faster than scrolling through all 50 states, especially on mobile.

### 3b. State comparison mode

Allow users to select 2-5 states and view them side-by-side across
multiple tables. This is a common use case for journalists comparing tax
structures between states.

### 3c. Choropleth map visualization

For state-level data with numeric values and rankings, display an
interactive US map colored by value (e.g., heat map of tax collections per
capita). This would be a major visual enhancement and is the kind of
content that gets shared on social media.

### 3d. Data visualization / charts

Add optional bar charts or sparklines alongside the tabular data. For
example, Table 1 (State Tax Collections per Capita) could show a horizontal
bar chart ranked by value. Libraries like Recharts or D3 could power this.

### 3e. Year-over-year comparison

Once historical data from past editions of the Excel workbook is gathered,
allow users to compare a state's data across years. Even showing "change
from last year" as a column would add significant analytical value.

### 3f. CSV download option

In addition to the Excel download, offer a CSV download option. Many
journalists and data analysts prefer CSV for import into spreadsheets or
analysis tools.

### 3g. Embed configurator

Provide a simple embed code generator where editors can select a specific
table and get a copy-paste snippet that deep links to it (ties into
improvement 2a).

### 3h. Accessibility improvements

- Add `aria-sort` attributes to sorted column headers
- Ensure all interactive elements have visible focus indicators
- Add `aria-live` region to announce table changes to screen readers
- Verify color contrast ratios meet WCAG AA standards (the light blue
  alternating rows against white text may be borderline)
