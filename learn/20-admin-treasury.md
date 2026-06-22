# app/(admin)/treasury.tsx — Financial Overview

## What This Screen Does

Shows the SACCO's complete financial picture: total savings, disbursed loans, repayments collected, outstanding balance, collection rate, and a hand-drawn SVG line chart of monthly trends.

---

## This is the Most Technical Screen in the App

It contains:
- Live API data
- Manual SVG chart (no charting library)
- Portfolio health metrics with progress bars

---

## The SVG Line Chart

```tsx
import Svg, { Polyline, Line, Text as SvgText, Polygon } from "react-native-svg";
```

You drew this chart from scratch using SVG primitives. Here's how it works:

### Coordinate System

```tsx
const CHART_W = SCREEN_W - 40 - 32;  // screen padding + card padding
const CHART_H = 140;
const PADDING = { top: 12, bottom: 28, left: 40, right: 12 };

const plotW = CHART_W - PADDING.left - PADDING.right;
const plotH = CHART_H - PADDING.top - PADDING.bottom;
```

SVG coordinates start at (0,0) in the top-left corner. `PADDING` creates a margin inside the SVG for axis labels. `plotW` and `plotH` are the actual drawing area.

### Mapping Data to Pixels

```tsx
const toX = (i: number) => PADDING.left + (i / Math.max(monthlyData.length - 1, 1)) * plotW;
const toY = (v: number) => PADDING.top + plotH - ((v - minVal) / (maxVal - minVal)) * plotH;
```

`toX` maps a data index (0, 1, 2...) to an x pixel position. With 6 months, index 0 → left edge, index 5 → right edge.

`toY` maps a value to a y pixel. **Note:** SVG y increases downward, but charts conventionally show higher values at the top. So the formula subtracts from `plotH` to flip it.

`Math.max(monthlyData.length - 1, 1)` prevents division by zero when there's only 1 data point.

### Drawing Lines

```tsx
const collectionsPoints = monthlyData.map((d, i) => `${toX(i)},${toY(d.collections)}`).join(" ");

<Polyline
  points={collectionsPoints}
  fill="none"
  stroke={colors.primary}
  strokeWidth={2}
/>
```

`Polyline` draws connected line segments. `points` is a string like `"40,120 90,80 140,100"`. The map produces the array of coordinate strings, `.join(" ")` puts spaces between them.

### Filled Area

```tsx
const areaPoints =
  `${toX(0)},${PADDING.top + plotH} ` +           // bottom-left
  monthlyData.map((d, i) => `${toX(i)},${toY(d.collections)}`).join(" ") +
  ` ${toX(monthlyData.length - 1)},${PADDING.top + plotH}`;  // bottom-right

<Polygon points={areaPoints} fill={colors.primary + "18"} />
```

The filled area is a `Polygon` that starts at bottom-left, traces the line, then goes to bottom-right. This creates the area fill below the line.

---

### EMPTY Constant for Initial State

```tsx
const EMPTY: TreasuryData = {
  totalSavings: 0,
  totalDisbursed: 0,
  ...
  monthlyData: [],
  recentTransactions: [],
};

const [data, setData] = useState<TreasuryData>(EMPTY);
```

`EMPTY` is a typed zero-state object. Using it as the initial state means the component always has the right shape of data, even before the API responds. No need for `data?.totalSavings ?? 0` throughout the template — you can just use `data.totalSavings` directly because it's never null.

---

### Collection Rate Progress Bar

```tsx
<View style={[styles.healthBar, { backgroundColor: colors.border }]}>
  <View style={[styles.healthFill, { width: `${collectionRate}%` as any, backgroundColor: colors.success }]} />
</View>
```

A progress bar built from two nested Views — a container and a filler. `width: \`${collectionRate}%\`` sets width as a percentage of the parent. The `as any` cast is needed because TypeScript's React Native types don't accept template literal strings for `width` even though React Native supports it.

---

## What a Junior Dev Typically Misses

- **SVG y-axis inversion** — forgetting that SVG y=0 is at the top, not the bottom, causes charts to be upside down
- **Division by zero in `toX`** — `Math.max(..., 1)` is the defensive guard for single-data-point cases
- **Percentage width as string** — React Native does support `"50%"` for width/height, but TypeScript's types are stricter; `as any` is a pragmatic workaround

---

## Best Practices

✅ `EMPTY` typed initial state avoids null checks  
✅ Hand-drawn SVG chart has no external dependency  
✅ Month labels formatted for locale (`"en-UG"`)  
⚠️ The chart doesn't handle edge cases like all-zero data gracefully — could show a flat line rather than the "not enough data" message
