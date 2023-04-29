import { prefixed, directionForEach, el } from "./utils.js";
import { Controller } from "./controller.js";
import { SvgChart } from "./svg.js";
import { AxisController } from "./axis.js";
import { configBefore as barAndLineConfigBefore, drawStart as barAndLineDrawStart } from "./bar_and_line_utils.js";

/**
 * Controller class for bar and line charts.
 * @extends Controller
 */
class BarController extends Controller {

    #axisController = null;

    /**
     * 
     * @param {SvgChart} svgChart SvgChart instance.
     */
    constructor(svgChart) {
        super(svgChart);
        this.#axisController = new AxisController(svgChart);
    }

    static requiredConfigWithValue = {
        xAxisGridColumns: true
    };

    drawSerie(serie, serieIndex, serieGroup) {
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
                x = this.config.padding.left + this.config.xAxisGridPadding + (valueIndex * this.svgChart.columnWidth) + (this.svgChart.barWidth * this.currentBarIndex) + (this.config.barSpacing * (this.currentBarIndex + 1));
                if (isNaN(x)) {
                    console.log(this.currentBarIndex);
                }
                height = y = this.config.padding.top + this.config.yAxisGridPadding + this.svgChart.chartHeight - (value * this.svgChart.lineAndBarValueHeight);
            }

            serieGroup.appendChild(el('rect', {
                x: x,
                y: y,
                width: this.svgChart.barWidth,
                height: this.svgChart.chartHeight + this.config.padding.top + this.config.yAxisGridPadding - height,
                fill: this.svgChart.getSerieFill(serie, serieIndex),
                className: prefixed('bar'),
                fillOpacity: this.config.barFillOpacity || '',
                strokeWidth: this.config.barStrokeWidth || 0,
                stroke: this.svgChart.getSerieStrokeColor(serie, serieIndex),
                dataValue: value,
                tabindex: this.config.showValueOnFocus ? 0 : null
            }));

        });

        this.currentBarIndex += 1;
    }

    drawStart(currentSerieGroupElement) {
        
        barAndLineDrawStart(this.svgChart, this.#axisController, currentSerieGroupElement);
        const barWidth = (this.svgChart.columnWidth - (this.config.barSpacing * (this.svgChart.barCountPerColumn + 1))) / (this.svgChart.barCountPerColumn || 1);

        this.svgChart.barWidth = barWidth;

        this.currentBarIndex = 0;
        this.stackedBarValues = []; // value index => current value (steeds optellen)
    }

    configBefore() {
        super.configBefore();
        barAndLineConfigBefore(this.svgChart, this.#axisController);
    }

    configSerieBefore(serie) {
        super.configSerieBefore(serie);
        if (!this.config.barStacked && (serie.type === SvgChart.chartTypes.bar || this.config.chartType === SvgChart.chartTypes.bar)) {
            this.svgChart.barCountPerColumn += 1;
        }
    }

}

export { BarController };






