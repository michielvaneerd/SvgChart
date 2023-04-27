Two phases:

1. Config - things that have to be done only once, for example setting title, paddings of chart, etc.
2. Data - things that need to be done for every new data that's being visualised.

For each phase, there are things that need to be done for ALL chart types, and things that need to be done for only specific chart types.

# Once (in constructor)

- Adding CSS rules to head.
- Adding SVG element to DOM.

# In  config

- Merging config
- Add direction attribute to SVG
- Remove previous listeners (only if setConfig is called multiple times)
- Remove child nodes (only if setConfig is called multiple times)
- Get chart width and height
- Add DEFS node (for gradient defines)
- Add .draw-before-group GROUP (only if config.drawBefore is set)
- Add title if config.title is set
- Add legend if config.legend is set

Only for lineAndBar:

- addYAxisGrid if config.yAxis is true
- addXAxisTitle if config.xAxisTitle is set
- addYAxisTitle if this.config.yAxisTitle is set
- addXAxisLabelsGroup if config.xAxisLabels is true
- add .x-axis-group GROUP element (also for bars, these lines are the x axis lines!)
- add some properties to the chart like barCount.

Now loop through the series:

- count bars if chart type = bar
- add gradients to the DEFS element

Again for all:

- call drawBefore if config.drawBefore is set.
- Add .serie-group GROUP.

## For pie

## For donut

## For pie and donut
