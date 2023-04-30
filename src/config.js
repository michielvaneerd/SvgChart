/**
 * SvgChart config class.
 */
class SvgChartConfig {

    /**
     * @prop {String} dir - Language direction.
     * @default ltr
     */
    dir = 'ltr';

    /**
     * @prop {String} chartType - Chart type. Possible values: line, bar, lineAndBar, pie, donut.
     */
    chartType = null;

    /**
     * @prop {Object} padding - Padding object.
     * @example {start: 40, end: 20, top: 100, bottom: 40}
     */
    padding = {
        start: 40,
        end: 20,
        top: 100,
        bottom: 40
    };

    paddingNormal = 20;
    legendWidth = 10;
    focusedValuePadding = 6;

    transition = true;

    backgroundColor = 'white';

    fontFamily = 'sans-serif';

    titleFontSize = 'normal';

    titleColor = 'black';

    titleHorizontalPosition = 'center'; // center (default); start; end

    titleVerticalPosition = 'top'; // top (default); bottom; center

    showValueOnFocus = true;
    focusedValueFill = 'black';
    focusedValueColor = 'white';

    // ???
    maxValue = null;
    minValue = null;

    // Axis
    axisTitleFontSize = 'smaller';
    axisLabelFontSize = 'small';

    // X axis
    xAxisTitle = null;
    xAxisTitleBottom = null; // if this is <> null; then this will be the X start position of the 
    xAxisGridLineWidth = 1;
    xAxisGridLineColor = '#C0C0C0';
    xAxisGridLineDashArray = '1;1';
    xAxisLabelColor = '#A0A0A0';
    xAxisTitleColor = '#A0A0A0';
    xAxisGrid = true;
    xAxisGridPadding = 0;
    xAxisLabels = true;
    xAxisGridColumns = false; // we have now columns we can select / deselect instead of just x axis lines; so it is similar to bar charts; also good if you use bar charts in teh same chart!
    xAxisGridColumnsSelectable = false;
    xAxisGridColumnsSelectableColor = 'black';
    textAnchorXAxisLabels = 'middle'; // If you want X axis labels that are vertical (xAxisLabelRotation = 90); then this should be 'start' if you want them aligned to the x axis.
    xAxisLabelTop = 10;
    xAxisLabelRotation = null;
    xAxisStep = 1; // how many steps between x axis grid lines
    xAxisLabelStep = 1; // how many steps between labels x axis

    // Y axis
    yAxisTitle = null;
    yAxisTitleStart = null; // if this is <> null; then this will be the X start position of the Y axis title.
    yAxisGridLineWidth = 1;
    yAxisGridLineColor = '#C0C0C0';
    yAxisGridLineDashArray = '1;1';
    yAxisLabelColor = '#A0A0A0';
    yAxisTitleColor = '#A0A0A0';
    yAxisStep = 10; // how many steps between y axis grid lines
    yAxisLabelStep = 10; // how many steps between labels y axis
    yAxis = true;
    yAxisGrid = true;
    yAxisLabels = true;
    yAxisGridPadding = 0;

    // Legend
    legendFontSize = 'smaller';
    legendCircle = false;
    legend = true;
    legendSelect = true;
    legendPosition = 'bottom'; // end;  bottom; top ; NOTE no start!
    legendBottom = null;
    legendTop = null; // top position; if null; default position for legendPosition is used.

    // Line charts
    lineWidth = 2;
    pointRadius = 2;
    connectNullValues = false;
    lineCurved = true;
    lineChartFilled = false;
    points = true;

    // Bar charts
    barFillOpacity = 0.5;
    barSpacing = 4;
    barStrokeWidth = 1;
    barStacked = false;

    // Pie and donut
    pieFillOpacity = 0.6;
    donutWidth = 80;
};

export { SvgChartConfig };