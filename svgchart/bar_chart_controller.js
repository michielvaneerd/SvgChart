import { prefixed, directionForEach, el } from "./utils.js";
import { Controller } from "./controller.js";
import { SvgChart } from "./svg.js";
import { AxisController } from "./axis.js";

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
        if (this.svgChart.xAxisGroupElement.firstChild) {
            this.svgChart.xAxisGroupElement.removeChild(this.svgChart.xAxisGroupElement.firstChild);
        }

        if (this.config.xAxisGridColumnsSelectable) {
            if (this.svgChart.xAxisGridColumnsSelectableGroupElement.firstChild) {
                this.svgChart.xAxisGridColumnsSelectableGroupElement.firstChild.remove();
            }
        }

        if (this.svgChart.xAxisLabelsGroupElement.firstChild) {
            this.svgChart.xAxisLabelsGroupElement.removeChild(this.svgChart.xAxisLabelsGroupElement.firstChild);
        }

        // Note that for bar charts to display correctly, this.config.xAxisGridColumns MUST be true!
        const columnWidth = this.config.xAxisGridColumns
            ? (this.svgChart.chartWidth / (this.svgChart.data.xAxis.columns.length))
            : (this.svgChart.chartWidth / (this.svgChart.data.xAxis.columns.length - 1));
        const barWidth = (columnWidth - (this.config.barSpacing * (this.svgChart.barCountPerColumn + 1))) / (this.svgChart.barCountPerColumn || 1);

        // Make this available on the instance.
        this.svgChart.columnWidth = columnWidth;
        this.svgChart.barWidth = barWidth;

        this.#axisController.addXAxisLabels(columnWidth);

        this.currentBarIndex = 0;
        this.stackedBarValues = []; // value index => current value (steeds optellen)
    }

    configBefore() {

        super.configBefore();

        this.svgChart.lineAndBarSelectedColumnIndex = null;
        this.svgChart.lineAndBarValueHeight = this.svgChart.chartHeight / this.config.maxValue;
        this.svgChart.barCountPerColumn = this.config.barStacked ? 1 : 0;

        if (this.config.yAxis) {
            this.#axisController.addYAxisGrid();
        }

        if (this.config.xAxisTitle) {
            this.#axisController.addXAxisTitle();
        }

        if (this.config.yAxisTitle) {
            this.#axisController.addYAxisTitle();
        }

        if (this.config.xAxisLabels) {
            this.#axisController.addXAxisLabelsGroup();
        }

        this.svgChart.xAxisGroupElement = this.svgChart.svg.appendChild(el('g', {
            className: prefixed('x-axis-group')
        }));
    }

    configSerieBefore(serie) {

        super.configSerieBefore(serie);

        if (!this.config.barStacked && (serie.type === 'bar' || this.config.chartType === 'bar')) {
            this.svgChart.barCountPerColumn += 1;
        }

    }

}

export { BarController };






