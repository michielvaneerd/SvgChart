import { ChartConfigSerie, ChartType, XAxisColumnSelectedCallback, DrawCallback } from "./types";

/**
 * SvgChart config class.
 */
class SvgChartConfig {

    /**
     * Get direction string to use for dom direction attribute.
     * 
     * @param config Config object.
     * @returns Attribute value.
     */
    static getDirection(config: SvgChartConfig) : string {
        return config.ltr ? 'ltr' : 'rtl';
    }

    /**
     * Whether language direction is ltr.
     */
    ltr: boolean = true;

    /**
     * Series array.
     */
    series: Array<ChartConfigSerie> = null;

    /**
     * Title of chart.
     */
    title: string = null;

    /**
     * Chart type.
     */
    chartType: ChartType = null;

    /**
     * Callback when x axis label is selected. Parameters are SvgChart and x axis column index.
     */
    onXAxisLabelGroupSelect: XAxisColumnSelectedCallback = null;

    /**
     * Padding object.
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
     * Default padding for space between elements.
     */
    paddingDefault: number = 20;

    /**
     * Width of legend squares or circles.
     */
    legendWidth: number = 10;

    /**
     * Whether the value box should be displayed when an element has focus.
     */
    focusedValueShow: boolean = true;

    /**
     * Fill color of focused value box.
     */
    focusedValueFill: string = 'black';

    /**
     * Font color of focused value box.
     */
    focusedValueColor: string = 'white';

    /**
     * Padding of focused value box.
     */
    focusedValuePadding: number = 6;

    /**
     * Draw function to execute in the config phase. It receives a SvgChart and HTMLElement parameter.
     * 
     * @example function(svgChart, groupNode) {
     *     groupNode.appendChild(svgChart.el('rect', {
     *         x: 10,
     *         y: 10
     *     }));
     * }
     */
    drawOnConfig: DrawCallback = null;

    /**
     * Draw function to execute in the chart phase. It receives a SvgChart and HTMLElement parameter.
     * 
     * @example function(svgChart, groupNode) {
     *     groupNode.appendChild(svgChart.el('rect', {
     *         x: 10,
     *         y: 10
     *     }));
     * }
     */
    drawOnData: DrawCallback = null;

    /**
     * transition - Whether the chart elements should be faded in or nor.
     */
    transition: boolean = true;

    /**
     * Background color of the SVG element.
     */
    backgroundColor: string = 'white';

    /**
     * Font fanily for all text elements.
     */
    fontFamily: string = 'sans-serif';

    /**
     * Fontsize for the title.
     */
    titleFontSize: string|number = 'normal';

    /**
     * Font color of title.
     */
    titleColor: string = 'black';

    /**
     * Horizontal position of title. Can be one of: center, start, end.
     */
    titleHorizontalPosition: string = 'center'; // center (default); start; end

    /**
     * Vertical position of title. Can be one of: top, bottom, center.
     */
    titleVerticalPosition: string = 'top'; // top (default); bottom; center

    /**
     * Maximum value. Required for charts with Y-axes.
     */
    maxValue: number = null;

    /**
     * Minumum value of Y axis. Required for charts with Y-axes.
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
     * Font color of x axis title.
     */
    xAxisTitleColor: string = '#A0A0A0';

    /**
     * Whether the xaxis grid should be displayed.
     */
    xAxisGrid: boolean = true;

    /**
     * Outside padding for x axis grid.
     */
    xAxisGridPadding: number = 0;

    /**
     * Whether x axis labels should be displayed.
     */
    xAxisLabels: boolean = true;

    /**
     * Whether the x axis labels should be below (false)
     * or between (true) the x axis grid lines. For bar charts this will always be set to true.
     */
    xAxisGridColumns: boolean = false;

    /**
     * Whether xAxisGridColumns should be selectable.
     * If this is true, the x axis labels can be clicked and selected.
     */
    xAxisGridColumnsSelectable: boolean = false;

    /**
     * Opacity value for the selected xAxisGridColumn.
     */
    xAxisGridSelectedColumnOpacity: number = 0.2;

    /**
     * Background color for a selected xAxisGridColumn.
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
     * Whether line charts should be filled or not.
     */
    lineChartFilled: boolean = false;

    /**
     * Whether the lines should display points or not.
     */
    points: boolean = true;

    ///////////////////////////////////////////////////////////////////////////////////////////////
    // Bar charts
    ///////////////////////////////////////////////////////////////////////////////////////////////
    
    /**
     * Opacity of bars.
     */
    barFillOpacity: number = 0.5;

    /**
     * Spacing in pixels between bars.
     */
    barSpacing: number = 4;

    /**
     * Width of bar border.
     */
    barStrokeWidth: number = 1;

    /**
     * Whether bars should be stacked.
     */
    barStacked: boolean = false;

    ///////////////////////////////////////////////////////////////////////////////////////////////
    // Pie and donut charts
    ///////////////////////////////////////////////////////////////////////////////////////////////

    /**
     * Opacity of pie and donut charts.
     */
    pieFillOpacity: number = 0.6;

    /**
     * With of donuts. Of not given a default value is used.
     */
    donutWidth: number = null;

    /**
     * Stroke color for pie charts.
     */
    pieStroke: string = 'white';

    /**
     * Width of stroke for pie charts. If this is 0, no stroke is painted.
     */
    pieStrokeWidth: number = 2;

    /**
     * Stroke color for donut charts.
     */
    donutStroke: string = 'white';

    /**
     * Width of stroke for donut charts. If this is 0, no stroke is painted.
     */
    donutStrokeWidth: number = 2;
};

export { SvgChartConfig };