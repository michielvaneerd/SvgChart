import { prefixed, directionForEach, el } from "../utils";
import { Controller } from "./controller";
import { SvgChart } from "../svg";
import { AxisController } from "../axis";
import { configBefore as barAndLineConfigBefore, drawStart as barAndLineDrawStart } from "../bar_and_line_utils";
import { SvgChartConfig, ChartConfigSerie } from "../config";

/**
 * Controller class for bar and line charts.
 * @extends Controller
 */
class BarController extends Controller {

    svgChart: SvgChart;
    currentBarIndex: number;
    stackedBarValues: object;
    barWidth: number;

    #axisController = null;

    /**
     * @param {SvgChart} svgChart SvgChart instance.
     */
    constructor(svgChart: SvgChart) {
        super(svgChart);
        this.#axisController = new AxisController(svgChart);
    }

    /**
     * Required config property values for this type of chart.
     */
    static requiredConfigWithValue = {
        xAxisGridColumns: true
    };

    /**
     * Draws chart element for this serie and attached it to the serieGroup.
     * @param {ChartConfigSerie} serie Serie object.
     * @param {number} serieIndex Serie index.
     * @param {HTMLElement} serieGroup DOM group element for this serie.
     */
    drawSerie(serie: ChartConfigSerie, serieIndex: number, serieGroup: SVGElement) {
        directionForEach(this, this.svgChart.data.series[serie.id], this.svgChart.isLTR, function (value, valueIndex) {

            var x = null;
            var y = null;
            var height = null;
            if (this.config.barStacked) {
                if (!this.stackedBarValues[valueIndex]) {
                    this.stackedBarValues[valueIndex] = this.config.minValue
                };
                x = this.config.padding.left + this.config.xAxisGridPadding + (valueIndex * this.svgChart.columnWidth) + this.config.barSpacing;
                y = this.config.padding.top + this.config.yAxisGridPadding + this.svgChart.chartHeight - (value * this.svgChart.lineAndBarValueHeight) - (this.stackedBarValues[valueIndex] * this.svgChart.lineAndBarValueHeight);
                height = this.config.padding.top + this.config.yAxisGridPadding + this.svgChart.chartHeight - (value * this.svgChart.lineAndBarValueHeight);
                this.stackedBarValues[valueIndex] = this.stackedBarValues[valueIndex] += value;
            } else {
                x = this.config.padding.left + this.config.xAxisGridPadding + (valueIndex * this.svgChart.columnWidth) + (this.barWidth * this.currentBarIndex) + (this.config.barSpacing * (this.currentBarIndex + 1));
                if (isNaN(x)) {
                    console.log(this.currentBarIndex);
                }
                height = y = this.config.padding.top + this.config.yAxisGridPadding + this.svgChart.chartHeight - (value * this.svgChart.lineAndBarValueHeight);
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
     * @param {HTMLElement} currentSerieGroupElement DOM group element.
     */
    drawStart(currentSerieGroupElement: SVGElement) {

        barAndLineDrawStart(this.svgChart, this.#axisController, currentSerieGroupElement);
        const barWidth = (this.svgChart.columnWidth - (this.config.barSpacing * (this.svgChart.barCountPerColumn + 1))) / (this.svgChart.barCountPerColumn || 1);

        this.barWidth = barWidth;

        this.currentBarIndex = 0;
        this.stackedBarValues = {}; // value index => current value (steeds optellen)
    }

    /**
     * Execute config things before global config things are done.
     */
    configBefore() {
        super.configBefore();
        barAndLineConfigBefore(this.svgChart, this.#axisController);
    }

    /**
     * Execute serie config things before global config serie things are done.
     * @param {ChartConfigSerie} serie - Serie object
     */
    configSerieBefore(serie: ChartConfigSerie) {
        super.configSerieBefore(serie);
        if (!this.config.barStacked && (serie.type === SvgChartConfig.chartTypes.bar || this.config.chartType === SvgChartConfig.chartTypes.bar)) {
            this.svgChart.barCountPerColumn += 1;
        }
    }

}

export { BarController };






