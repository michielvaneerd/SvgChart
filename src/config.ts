interface ChartConfigSerie {
    id: string;
    title: string;
    type?: string;
    fillGradient?: string;
}

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
     * @prop {string} axisTitleFontSize - Font size of axes titles.
     * @default smaller
     */
    axisTitleFontSize: string = 'smaller';

    /**
     * @prop {string} axisLabelFontSize - Font size of axes labels.
     * @default small
     */
    axisLabelFontSize: string = 'small';

    // X axis
    /**
     * @prop {string} xAxisTitle - X axis title.
     */
    xAxisTitle: string = null;

    /**
     * @prop {Number} xAxisTitleBottom - If this is a number X, than the x axis title will be positioned X pixels from the bottom.
     * If this is null, then the title will be positioned paddingDefault pixesl from the bottom.
     */
    xAxisTitleBottom: number = null;

    /**
     * @prop {number} xAxisGridLineWidth - Line width of the x axis grid.
     * @default 1
     */
    xAxisGridLineWidth: number = 1;

    /**
     * @prop {string} xAxisGridLineColor - Color of x axis grid lines.
     * @default #C0C0C0
     */
    xAxisGridLineColor: string = '#C0C0C0';

    /**
     * @prop {string} xAxisGridLineDashArray - Stroke dash array value for the x axis grid lines.
     * See {@link https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/stroke-dasharray}.
     * @default 1 1
     */
    xAxisGridLineDashArray: string = '1 1';

    /**
     * @prop {string} xAxisLabelColor - Font color of xaxis labels.
     * @default #A0A0A0
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
     * @prop {string} textAnchorXAxisLabels - The text anchor value for x axis labels.
     * For example if you want vertical labels that should be aligned to the x axis, you can set this to 'start'.
     * See {@link https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/text-anchor}.
     * @default middle
     */
    textAnchorXAxisLabels: string = 'middle';

    /**
     * @prop {number} xAxisLabelTop - Number of pixels that the x axsis labels will be positioned from the bottom x axis grid line.
     * @default 10
     */
    xAxisLabelTop: number = 10;

    /**
     * @prop {number} rotate - degrees for the x axis labels.
     * @default 0
     */
    xAxisLabelRotation: number = 0;

    /**
     * @prop {number} xAxisStep - Steps between x axis grid lines.
     * @default 1
     */
    xAxisStep: number = 1;

    /**
     * @prop {number} xAxisLabelStep - Steps between x axis labels.
     * @default 1
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
     * @prop {number} yAxisTitleStart - Number of pixels the y axis labels should be positioned from the start. If this is null, this will be defaultPadding pixels.
     */
    yAxisTitleStart: number = null; // if this is <> null; then this will be the X start position of the Y axis title.

    /**
     * @prop {number} yAxisGridLineWidth - Line width of the y axis grid.
     * @default 1
     */
    yAxisGridLineWidth: number = 1;

    /**
     * @prop {string} yAxisGridLineColor - Color of y axis grid lines.
     * @default #C0C0C0
     */
    yAxisGridLineColor: string = '#C0C0C0';

    /**
     * @prop {string} yAxisGridLineDashArray - Stroke dash array value for the y axis grid lines.
     * See {@link https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/stroke-dasharray}.
     * @default 1 1
     */
    yAxisGridLineDashArray: string = '1 1';

    /**
     * @prop {string} yAxisLabelColor - Font color of y axis labels.
     * @default #A0A0A0
     */
    yAxisLabelColor: string = '#A0A0A0';

    /**
     * @prop {string} yAxisTitleColor - Font color of y axis title.
     * @default #A0A0A0
     */
    yAxisTitleColor: string = '#A0A0A0';

    /**
     * @prop {number} yAxisStep - Steps between y axis grid lines.
     * @default 10
     */
    yAxisStep: number = 10; // how many steps between y axis grid lines

    /**
     * @prop {number} yAxisLabelStep - Steps between y axis labels.
     * @default 10
     */
    yAxisLabelStep: number = 10; // how many steps between labels y axis


    //yAxis = true;

    /**
     * @prop {boolean} yAxisGrid - Whether the y axis grid should be displayed.
     * @default true
     */
    yAxisGrid: boolean = true;

    /**
     * @prop {boolean} yAxisLabels - Whether y axis labels should be displayed.
     * @default true
     */
    yAxisLabels: boolean = true;

    /**
     * @prop {number} yAxisGridPadding - Outside padding for y axis grid.
     * @default 0
     */
    yAxisGridPadding: number = 0;

    ///////////////////////////////////////////////////////////////////////////////////////////////
    // Legend
    ///////////////////////////////////////////////////////////////////////////////////////////////

    /**
     * @prop {string} legendFontSize - Font size for legend labels.
     * @default smaller
     */
    legendFontSize: string = 'smaller';

    /**
     * @prop {string} legendColor - Font color of legend labels.
     * @default black
     */
    legendColor: string = 'black';

    /**
     * @prop {boolean} legendCircle - Whether legends should be squares (false) or circles (true)
     * @default false
     */
    legendCircle: boolean = false;

    /**
     * @prop {boolean} legend - Whether legends should be displayed.
     * @default true
     */
    legend: boolean = true;

    /**
     * @prop {boolean} legendSelect - Whether clicking on a legend hides and shows a the serie.
     * @default true
     */
    legendSelect: boolean = true;

    /**
     * @prop {string} legendPosition - Position of legend. Possible values: bottom, top, end.
     * @default top
     */
    legendPosition: string = 'top';

    /**
     * @prop {number} legendBottom - If not null, number of pixels the legend should be positioned from the bottom. Otherwise a default number of pixels will be used.
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
     * @prop {number} lineWidth - Width of line for line charts.
     * @default 2
     */
    lineWidth: number = 2;

    /**
     * @prop {number} pointRadius - Radius of line points for line charts.
     * @default 2
     */
    pointRadius: number = 2;

    /**
     * @prop {boolean} connectNullValues - Whether null values should be connected or not.
     * @default false
     */
    connectNullValues: boolean = false;

    /**
     * @prop {boolean} lineCurved - Whether lines should be curved or not.
     * @default true
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

export { SvgChartConfig, ChartConfigSerie };