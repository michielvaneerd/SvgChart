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
     * @prop {String} chartType - Chart type. Required. Possible values: line, bar, lineAndBar, pie, donut.
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

    /**
     * @prop {Number} paddingDefault - Default padding for space between elements.
     * @default 20
     */
    paddingDefault = 20;

    /**
     * @prop {Number} legendWidth - Width of legend squares or circles.
     * @default 10
     */
    legendWidth = 10;

    /**
     * @prop {Boolean} focusedValueShow - Whether the value box should be displayed when an element has focus.
     * @default true
     */
    focusedValueShow = true;

    /**
     * @prop {String} focusedValueFill - Fill color of focused value box.
     * @default black
     */
    focusedValueFill = 'black';

    /**
     * @prop {String} focusedValueColor - Font color of focused value box.
     * @default white
     */
    focusedValueColor = 'white';

    /**
     * @prop {Number} focusedValuePadding - Padding of focused value box.
     * @default 6
     */
    focusedValuePadding = 6;

    /**
     * @prop {Function} drawOnConfig - Draw function to execute in the config phase. It receives a SvgChart and HTMLElement parameter.
     * @example function(svgChart, groupNode) {
     *     groupNode.appendChild(svgChart.el('rect', {
     *         x: 10,
     *         y: 10
     *     }));
     * }
     */
    drawOnConfig = null;

    /**
     * @prop {Function} drawOnData - Draw function to execute in the chart phase. It receives a SvgChart and HTMLElement parameter.
     * @example function(svgChart, groupNode) {
     *     groupNode.appendChild(svgChart.el('rect', {
     *         x: 10,
     *         y: 10
     *     }));
     * }
     */
    drawOnData = null;

    /**
     * @prop {Boolean} transition - Whether the chart elements should be faded in or nor.
     * @default true
     */
    transition = true;

    /**
     * @prop {String} backgroundColor - Background color of the SVG element.
     * @default white
     */
    backgroundColor = 'white';

    /**
     * @prop {String} fontFamily - Font fanily for all text elements.
     * @default sans-serif
     */
    fontFamily = 'sans-serif';

    /**
     * @prop {String|Number} titleFontSize - Fontsize for the title.
     * @default normal
     * 
     */
    titleFontSize = 'normal';

    /**
     * @prop {String} titleColor - Font color of title.
     * @default black
     */
    titleColor = 'black';

    /**
     * @prop {String} titleHorizontalPosition - Horizontal position of title. Can be one of: center, start, end.
     * @default center
     */
    titleHorizontalPosition = 'center'; // center (default); start; end

    /**
     * @prop {String} titleVerticalPosition - Vertical position of title. Can be one of: top, bottom, center.
     * @default top
     */
    titleVerticalPosition = 'top'; // top (default); bottom; center

    /**
     * @prop {Number} maxValue - Maximum value. Required for charts with Y-axes.
     */
    maxValue = null;

    /**
     * @prop {Number} minValue - Minumum value of Y axis. Required for charts with Y-axes.
     */
    minValue = null;

    ///////////////////////////////////////////////////////////////////////////////////////////////
    // X Axis
    ///////////////////////////////////////////////////////////////////////////////////////////////

    /**
     * @prop {String} axisTitleFontSize - Font size of axes titles.
     * @default smaller
     */
    axisTitleFontSize = 'smaller';

    /**
     * @prop {String} axisLabelFontSize - Font size of axes labels.
     * @default small
     */
    axisLabelFontSize = 'small';

    // X axis
    /**
     * @prop {String} xAxisTitle - X axis title.
     */
    xAxisTitle = null;

    /**
     * @prop {Number} xAxisTitleBottom - If this is a number X, than the x axis title will be positioned X pixels from the bottom.
     * If this is null, then the title will be positioned paddingDefault pixesl from the bottom.
     */
    xAxisTitleBottom = null;

    /**
     * @prop {Number} xAxisGridLineWidth - Line width of the x axis grid.
     * @default 1
     */
    xAxisGridLineWidth = 1;

    /**
     * @prop {String} xAxisGridLineColor - Color of x axis grid lines.
     * @default #C0C0C0
     */
    xAxisGridLineColor = '#C0C0C0';

    /**
     * @prop {String} xAxisGridLineDashArray - Stroke dash array value for the x axis grid lines.
     * See {@link https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/stroke-dasharray}.
     * @default 1;1
     */
    xAxisGridLineDashArray = '1;1';

    /**
     * @prop {String} xAxisLabelColor - Font color of xaxis labels.
     * @default #A0A0A0
     */
    xAxisLabelColor = '#A0A0A0';

    /**
     * @prop {String} xAxisTitleColor - Font color of x axis title.
     * @default #A0A0A0
     */
    xAxisTitleColor = '#A0A0A0';

    /**
     * @prop {Boolean} xAxisGrid - Whether the xaxis grid should be displayed.
     * @default true
     */
    xAxisGrid = true;

    /**
     * @prop {Number} xAxisGridPadding - Outside padding for x axis grid.
     * @default 0
     */
    xAxisGridPadding = 0;

    /**
     * @prop {Boolean} xAxisLabels - Whether x axis labels should be displayed.
     * @default true
     */
    xAxisLabels = true;

    /**
     * @prop {Boolean} xAxisGridColumns - Whether the x axis labels should be below (false)
     * or between (true) the x axis grid lines. For bar charts this will always be set to true.
     * @default false
     */
    xAxisGridColumns = false;

    /**
     * @prop {Boolean} xAxisGridColumnsSelectable - Whether xAxisGridColumns should be selectable.
     * If this is true, the x axis labels can be clicked and selected.
     * @default false
     */
    xAxisGridColumnsSelectable = false;

    /**
     * @prop {Number} xAxisGridSelectedColumnOpacity - Opacity value for the selected xAxisGridColumn.
     * @default 0.2
     */
    xAxisGridSelectedColumnOpacity = 0.2;

    /**
     * @prop {String} xAxisGridColumnsSelectableColor - Background color for a selected xAxisGridColumn.
     * @default black
     */
    xAxisGridColumnsSelectableColor = 'black';

    /**
     * @prop {String} textAnchorXAxisLabels - The text anchor value for x axis labels.
     * For example if you want vertical labels that should be aligned to the x axis, you can set this to 'start'.
     * See {@link https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/text-anchor}.
     * @default middle
     */
    textAnchorXAxisLabels = 'middle';

    /**
     * @prop {Number} xAxisLabelTop - Number of pixels that the x axsis labels will be positioned from the bottom x axis grid line.
     * @default 10
     */
    xAxisLabelTop = 10;

    /**
     * @prop {Number} rotate - degrees for the x axis labels.
     * @default 0
     */
    xAxisLabelRotation = 0;

    /**
     * @prop {Number} xAxisStep - Steps between x axis grid lines.
     * @default 1
     */
    xAxisStep = 1;

    /**
     * @prop {Number} xAxisLabelStep - Steps between x axis labels.
     * @default 1
     */
    xAxisLabelStep = 1;


    ///////////////////////////////////////////////////////////////////////////////////////////////
    // Y Axis
    ///////////////////////////////////////////////////////////////////////////////////////////////

    /**
     * @prop {String} yAxisTitle - Y axis title.
     */
    yAxisTitle = null;

    /**
     * @prop {Number} yAxisTitleStart - Number of pixels the y axis labels should be positioned from the start. If this is null, this will be defaultPadding pixels.
     */
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