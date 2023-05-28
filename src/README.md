# SvgChart phases

## Constructor

```ts
var chart = new SvgChart(parent: HTMLElement, config: SvgChartConfig);
```

1. Adds some CSS rules that are used for dynamic styling, like reacting to focus or hover events.
2. Create the root SVG element.
3. Calls `setConfig` with the `config` parameter.

## Method setConfig(config)

```ts
chart.setConfig(config: SvgChartConfig);
```

1. Merge the `config` with the default config.
2. Creates the `Controller` for this `chartType`.
3. Remove existing event listeners and child nodes - only applicable when this method has been called a second time or more.
4. Adds the `defs` element for gradient definitions.
5. Add title and legend.
6. Call `controller.onConfigBefore`.
7. Loop through series can for each serie:
    1. Call `controller.onConfigSerieBeforea`.
    2. Call `controller.onConfigSerieAfter`.
8. Add the `serieGroupElement` element, the focus value element and set up some event listeners.
9. Call `controller.onConfigAfter` on the controller.

## Method chart(data)

```ts
chart.chart(data);
```

1. Remove childnodes of `serieGroupElement`.
2. Create a new SVG group element, the call `controller.onDraw` with it and then attach this new element to the `serieGroupElement`.

## Method controller.onDraw(currentSerieGroupElement)

This method is called by the `chart` method.

1. Call `this.onDrawStart`.
2. Loop through the series and for each serie create a new group element and call `this.onDrawSerie` with it and add this new element to the `currentSerieGroupElement` parameter.
3. Call `this.onDrawEnd`.
