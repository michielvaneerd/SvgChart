import { ChartConfigSerie } from "./types";

/**
 * SvgChart config class.
 */
class SvgChartConfig {

    static directions = {
        ltr: 'ltr',
        rtl: 'rtl'
    };

    static chartTypes = {
        line: 'line',
        bar: 'bar',
        pie: 'pie',
        donut: 'donut',
        lineAndBar: 'lineAndBar'
    };

    /**
     * @prop {String} dir - Language direction.
     * @default SvgChartConfig.directions.ltr
     */
    dir: string = SvgChartConfig.directions.ltr;

    /**
     * @prop {Array<ChartConfigSerie>} series - Series array.
     */
    series: Array<ChartConfigSerie> = null;

    /**
     * @prop {String} title - Title of chart.
     */
    title: string = null;

    /**
     * @prop {String} chartType - Chart type. Required. Possible values: line, bar, lineAndBar, pie, donut.
     */
    chartType: string = null;

    /**
     * @prop {Function} onXAxisLabelGroupSelect - Callback when x axis label is selected. Parameters are SvgChart and x axis column index.
     */
    onXAxisLabelGroupSelect: Function = null;

    /**
     * @prop {Object} padding - Padding object.
     * @example {start: 40, end: 20, top: 100, bottom: 40}
     */
    padding = {
        start: 40,
        end: 20,
        top: 100,
        bottom: 40,
        /**
         * Left will be set by code, depends on direction.
         */
        left: 40,
        /**
         * Right will be set by code, depends on direction.
         */
        right: 20
    };

    /**
     * @prop {number} paddingDefault - Default padding for space between elements.
     * @default 20
     */
    paddingDefault: number = 20;

    /**
     * @prop {number} legendWidth - Width of legend squares or circles.
     * @default 10
     */
    legendWidth: number = 10;

    /**
     * @prop {boolean} focusedValueShow - Whether the value box should be displayed when an element has focus.
     * @default true
     */
    focusedValueShow: boolean = true;

    /**
     * @prop {string} focusedValueFill - Fill color of focused value box.
     * @default black
     */
    focusedValueFill: string = 'black';

    /**
     * @prop {string} focusedValueColor - Font color of focused value box.
     * @default white
     */
    focusedValueColor: string = 'white';

    /**
     * @prop {number} focusedValuePadding - Padding of focused value box.
     * @default 6
     */
    focusedValuePadding: number = 6;

    /**
     * @prop {Function} drawOnConfig - Draw function to execute in the config phase. It receives a SvgChart and HTMLElement parameter.
     * @example function(svgChart, groupNode) {
     *     groupNode.appendChild(svgChart.el('rect', {
     *         x: 10,
     *         y: 10
     *     }));
     * }
     */
    drawOnConfig: Function = null;

    /**
     * @prop {Function} drawOnData - Draw function to execute in the chart phase. It receives a SvgChart and HTMLElement parameter.
     * @example function(svgChart, groupNode) {
     *     groupNode.appendChild(svgChart.el('rect', {
     *         x: 10,
     *         y: 10
     *     }));
     * }
     */
    drawOnData: Function = null;

    /**
     * @prop {boolean} transition - Whether the chart elements should be faded in or nor.
     * @default true
     */
    transition: boolean = true;

    /**
     * @prop {string} backgroundColor - Background color of the SVG element.
     * @default white
     */
    backgroundColor: string = 'white';

    /**
     * @prop {string} fontFamily - Font fanily for all text elements.
     * @default sans-serif
     */
    fontFamily: string = 'sans-serif';

    /**
     * @prop {string|number} titleFontSize - Fontsize for the title.
     * @default normal
     * 
     */
    titleFontSize: string|number = 'normal';

    /**
     * @prop {string} titleColor - Font color of title.
     * @default black
     */
    titleColor: string = 'black';

    /**
     * @prop {string} titleHorizontalPosition - Horizontal position of title. Can be one of: center, start, end.
     * @default center
     */
    titleHorizontalPosition: string = 'center'; // center (default); start; end

    /**
     * @prop {string} titleVerticalPosition - Vertical position of title. Can be one of: top, bottom, center.
     * @default top
     */
    titleVerticalPosition: string = 'top'; // top (default); bottom; center

    /**
     * @prop {number} maxValue - Maximum value. Required for charts with Y-axes.
     */
    maxValue: number = null;

    /**
     * @prop {number} minValue - Minumum value of Y axis. Required for charts with Y-axes.
     */
    minValue: number = null;

    ///////////////////////////////////////////////////////////////////////////////////////////////
    // X Axis
    ///////////////////////////////////////////////////////////////////////////////////////////////

    /**
     * Font size of axes titles.
     */
    axisTitleFontSize: string = 'smaller';

    /**
     * Font size of axes labels.
     */
    axisLabelFontSize: string = 'small';

    // X axis
    /**
     * X axis title.
     */
    xAxisTitle: string = null;

    /**
     * If this is a number X, than the x axis title will be positioned X pixels from the bottom.
     * If this is null, then the title will be positioned paddingDefault pixesl from the bottom.
     */
    xAxisTitleBottom: number = null;

    /**
     * Line width of the x axis grid.
     */
    xAxisGridLineWidth: number = 1;

    /**
     * Color of x axis grid lines.
     */
    xAxisGridLineColor: string = '#C0C0C0';

    /**
     * Stroke dash array value for the x axis grid lines.
     * See {@link https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/stroke-dasharray}.
     */
    xAxisGridLineDashArray: string = '1 1';

    /**
     * Font color of xaxis labels.
     */
    xAxisLabelColor: string = '#A0A0A0';

    /**
     * @prop {string} xAxisTitleColor - Font color of x axis title.
     * @default #A0A0A0
     */
    xAxisTitleColor: string = '#A0A0A0';

    /**
     * @prop {boolean} xAxisGrid - Whether the xaxis grid should be displayed.
     * @default true
     */
    xAxisGrid: boolean = true;

    /**
     * @prop {number} xAxisGridPadding - Outside padding for x axis grid.
     * @default 0
     */
    xAxisGridPadding: number = 0;

    /**
     * @prop {boolean} xAxisLabels - Whether x axis labels should be displayed.
     * @default true
     */
    xAxisLabels: boolean = true;

    /**
     * @prop {boolean} xAxisGridColumns - Whether the x axis labels should be below (false)
     * or between (true) the x axis grid lines. For bar charts this will always be set to true.
     * @default false
     */
    xAxisGridColumns: boolean = false;

    /**
     * @prop {boolean} xAxisGridColumnsSelectable - Whether xAxisGridColumns should be selectable.
     * If this is true, the x axis labels can be clicked and selected.
     * @default false
     */
    xAxisGridColumnsSelectable: boolean = false;

    /**
     * @prop {number} xAxisGridSelectedColumnOpacity - Opacity value for the selected xAxisGridColumn.
     * @default 0.2
     */
    xAxisGridSelectedColumnOpacity: number = 0.2;

    /**
     * @prop {string} xAxisGridColumnsSelectableColor - Background color for a selected xAxisGridColumn.
     * @default black
     */
    xAxisGridColumnsSelectableColor: string = 'black';

    /**
     * The text anchor value for x axis labels.
     * For example if you want vertical labels that should be aligned to the x axis, you can set this to 'start'.
     * See {@link https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/text-anchor}.
     */
    textAnchorXAxisLabels: string = 'middle';

    /**
     * Number of pixels that the x axsis labels will be positioned from the bottom x axis grid line.
     */
    xAxisLabelTop: number = 10;

    /**
     * Degrees for the x axis labels.
     */
    xAxisLabelRotation: number = 0;

    /**
     * Steps between x axis grid lines.
     */
    xAxisStep: number = 1;

    /**
     * Steps between x axis labels.
     */
    xAxisLabelStep: number = 1;


    ///////////////////////////////////////////////////////////////////////////////////////////////
    // Y Axis
    ///////////////////////////////////////////////////////////////////////////////////////////////

    /**
     * @prop {string} yAxisTitle - Y axis title.
     */
    yAxisTitle: string = null;

    /**
     *  Number of pixels the y axis labels should be positioned from the start. If this is null, this will be defaultPadding pixels.
     */
    yAxisTitleStart: number = null; // if this is <> null; then this will be the X start position of the Y axis title.

    /**
     * Line width of the y axis grid.
     */
    yAxisGridLineWidth: number = 1;

    /**
     * Color of y axis grid lines.
     */
    yAxisGridLineColor: string = '#C0C0C0';

    /**
     * Stroke dash array value for the y axis grid lines.
     * See {@link https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/stroke-dasharray}.
     */
    yAxisGridLineDashArray: string = '1 1';

    /**
     * Font color of y axis labels.
     */
    yAxisLabelColor: string = '#A0A0A0';

    /**
     * Font color of y axis title.
     */
    yAxisTitleColor: string = '#A0A0A0';

    /**
     * Steps between y axis grid lines.
     */
    yAxisStep: number = 10; // how many steps between y axis grid lines

    /**
     * Steps between y axis labels.
     */
    yAxisLabelStep: number = 10; // how many steps between labels y axis


    //yAxis = true;

    /**
     * Whether the y axis grid should be displayed.
     */
    yAxisGrid: boolean = true;

    /**
     * Whether y axis labels should be displayed.
     */
    yAxisLabels: boolean = true;

    /**
     * Outside padding for y axis grid.
     */
    yAxisGridPadding: number = 0;

    ///////////////////////////////////////////////////////////////////////////////////////////////
    // Legend
    ///////////////////////////////////////////////////////////////////////////////////////////////

    /**
     * Font size for legend labels.
     */
    legendFontSize: string = 'smaller';

    /**
     * Font color of legend labels.
     */
    legendColor: string = 'black';

    /**
     * Whether legends should be squares (false) or circles (true)
     */
    legendCircle: boolean = false;

    /**
     * @prop {boolean} legend - Whether legends should be displayed.
     */
    legend: boolean = true;

    /**
     * Whether clicking on a legend hides and shows a the serie.
     */
    legendSelect: boolean = true;

    /**
     * Position of legend. Possible values: bottom, top, end.
     */
    legendPosition: string = 'top';

    /**
     * If not null, number of pixels the legend should be positioned from the bottom. Otherwise a default number of pixels will be used.
     */
    legendBottom: number = null;

    /**
     * @prop {number} legendTop - If not null, number of pixels the legend should be positioned from the top. Otherwise a default number of pixels will be used.
     */
    legendTop: number = null;

    ///////////////////////////////////////////////////////////////////////////////////////////////
    // Line charts
    ///////////////////////////////////////////////////////////////////////////////////////////////
    /**
     * Width of line for line charts.
     */
    lineWidth: number = 2;

    /**
     * Radius of line points for line charts.
     */
    pointRadius: number = 2;

    /**
     * Whether null values should be connected or not.
     */
    connectNullValues: boolean = false;

    /**
     * Whether lines should be curved or not.
     */
    lineCurved: boolean = true;

    /**
     * @prop {boolean} lineChartFilled - Whether line charts should be filled or not.
     * @default false
     */
    lineChartFilled: boolean = false;

    /**
     * @prop {boolean} points - Whether the lines should display points or not.
     * @default true
     */
    points: boolean = true;

    ///////////////////////////////////////////////////////////////////////////////////////////////
    // Bar charts
    ///////////////////////////////////////////////////////////////////////////////////////////////
    
    /**
     * @prop {number} barFillOpacity - Opacity of bars.
     * @default 0.5
     */
    barFillOpacity: number = 0.5;

    /**
     * @prop {number} barSpacing - Spacing in pixels between bars.
     * @default 4
     */
    barSpacing: number = 4;

    /**
     * @prop {number} barStrokeWidth - Width of bar border.
     * @default 1
     */
    barStrokeWidth: number = 1;

    /**
     * @prop {boolean} barStacked - Whether bars should be stacked.
     * @default false
     */
    barStacked: boolean = false;

    ///////////////////////////////////////////////////////////////////////////////////////////////
    // Pie and donut charts
    ///////////////////////////////////////////////////////////////////////////////////////////////

    /**
     * @prop {number} pieFillOpacity - Opacity of pie and donut charts.
     * @default 0.6
     */
    pieFillOpacity: number = 0.6;

    /**
     * @prop {number} donutWidth - With of donuts. Of not given a default value is used.
     */
    donutWidth: number = null;

    /**
     * @prop {string} pieStroke - Stroke color for pie charts.
     * @default white
     */
    pieStroke: string = 'white';

    /**
     * @prop {number} pieStrokeWidth - Width of stroke for pie charts. If this is 0, no stroke is painted.
     * @default 2
     */
    pieStrokeWidth: number = 2;

    /**
     * @prop {string} donutStroke - Stroke color for donut charts.
     * @default white
     */
    donutStroke: string = 'white';

    /**
     * @prop {number} donutStrokeWidth - Width of stroke for donut charts. If this is 0, no stroke is painted.
     * @default 2
     */
    donutStrokeWidth: number = 2;
};

export { SvgChartConfig };