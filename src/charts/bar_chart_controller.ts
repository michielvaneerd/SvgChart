import { prefixed, directionForEach, el } from "../utils";
import { Controller } from "./controller";
import { SvgChart } from "../svg";
import { AxisController } from "../axis";
import { onDrawStartBarAndLine, onConfigBeforeBarAndLine } from "./bar_and_line_utils";
import { ChartConfigSerie, ChartType } from "../types";

/**
 * Controller class for bar and line charts.
 */
class BarController extends Controller {

    svgChart: SvgChart;
    currentBarIndex: number;
    stackedBarValues: object;
    barWidth: number;
    #valueHeight: number;
    #columnWidth: number;
    #barCountPerColumn: number;

    #axisController: AxisController;

    set barCountPerColumn(value: number) {
        this.#barCountPerColumn = value;
    }

    get barCountPerColumn() {
        return this.#barCountPerColumn;
    }

    set valueHeight(value: number) {
        this.#valueHeight = value;
    }

    get valueHeight() {
        return this.#valueHeight;
    }

    get columnWidth() {
        return this.#columnWidth;
    }

    set columnWidth(value: number) {
        this.#columnWidth = value;
    }

    /**
     * @param svgChart - SvgChart instance.
     */
    constructor(svgChart: SvgChart) {
        super(svgChart);
        this.#axisController = new AxisController(svgChart);
    }

    /** @override */
    static requiredConfigWithValue = {
        xAxisGridColumns: true
    };

    /**
     * Draws chart element for this serie and attached it to the serieGroup.
     * 
     * @override
     * 
     * @param serie - Serie object.
     * @param serieIndex - Serie index.
     * @param serieGroup - DOM group element for this serie.
     */
    onDrawSerie(serie: ChartConfigSerie, serieIndex: number, serieGroup: SVGElement) {
        directionForEach(this, this.svgChart.data.series[serie.id], this.config.ltr, (value: number, valueIndex: number) => {

            var x = null;
            var y = null;
            var height = null;
            if (this.config.barStacked) {
                if (!this.stackedBarValues[valueIndex]) {
                    this.stackedBarValues[valueIndex] = this.config.minValue
                };
                x = this.config.padding.left + this.config.xAxisGridPadding + (valueIndex * this.columnWidth) + this.config.barSpacing;
                y = this.config.padding.top + this.config.yAxisGridPadding + this.svgChart.chartHeight - (value * this.valueHeight) - (this.stackedBarValues[valueIndex] * this.valueHeight);
                height = this.config.padding.top + this.config.yAxisGridPadding + this.svgChart.chartHeight - (value * this.valueHeight);
                this.stackedBarValues[valueIndex] = this.stackedBarValues[valueIndex] += value;
            } else {
                x = this.config.padding.left + this.config.xAxisGridPadding + (valueIndex * this.columnWidth) + (this.barWidth * this.currentBarIndex) + (this.config.barSpacing * (this.currentBarIndex + 1));
                if (isNaN(x)) {
                    console.log(this.currentBarIndex);
                }
                height = y = this.config.padding.top + this.config.yAxisGridPadding + this.svgChart.chartHeight - (value * this.valueHeight);
            }

            serieGroup.appendChild(el('rect', {
                x: x,
                y: y,
                width: this.barWidth,
                height: this.svgChart.chartHeight + this.config.padding.top + this.config.yAxisGridPadding - height,
                fill: this.svgChart.getSerieFill(serie, serieIndex),
                className: prefixed('bar'),
                fillOpacity: this.config.barFillOpacity || '',
                strokeWidth: this.config.barStrokeWidth || 0,
                stroke: this.svgChart.getSerieStrokeColor(serie, serieIndex),
                dataValue: value,
                tabindex: this.config.focusedValueShow ? 0 : null
            }));

        });

        this.currentBarIndex += 1;
    }

    /**
     * Do things at the start of the draw for this chart.
     * 
     * @override
     * 
     * @param currentSerieGroupElement - DOM group element.
     */
    onDrawStart(currentSerieGroupElement: SVGElement) {

        onDrawStartBarAndLine(this.svgChart, this.#axisController, currentSerieGroupElement);
        const barWidth = (this.columnWidth - (this.config.barSpacing * (this.barCountPerColumn + 1))) / (this.barCountPerColumn || 1);

        this.barWidth = barWidth;

        this.currentBarIndex = 0;
        this.stackedBarValues = {}; // value index => current value (steeds optellen)
    }

    /**
     * Execute config things before global config things are done.
     * 
     * @override
     */
    onConfigBefore() {
        super.onConfigBefore();
        onConfigBeforeBarAndLine(this.svgChart, this.#axisController);
    }

    /**
     * Execute serie config things before global config serie things are done.
     * 
     * @override
     * 
     * @param serie - Serie object
     */
    onConfigSerieBefore(serie: ChartConfigSerie) {
        super.onConfigSerieBefore(serie);
        if (!this.config.barStacked && (serie.type === ChartType.Bar || this.config.chartType === ChartType.Bar)) {
            this.barCountPerColumn += 1;
        }
    }

}

export { BarController };






