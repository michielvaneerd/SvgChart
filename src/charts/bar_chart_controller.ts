import { prefixed, directionForEach, el } from "../utils";
import { Controller } from "./controller";
import { SvgChart } from "../svg";
import { XYHorVertAxisController } from "../x_y_hor_vert_axis";
import { ChartConfigSerie, ChartType } from "../types";

/**
 * Controller class for bar and line charts.
 */
export class BarController extends Controller {

    svgChart: SvgChart;

    // Shared with line and bar
    axisController: XYHorVertAxisController;

    #barCountPerColumn: number;
    currentBarIndex: number;
    stackedBarValues: object;
    barWidth: number;

    set barCountPerColumn(value: number) {
        this.#barCountPerColumn = value;
    }

    get barCountPerColumn() {
        return this.#barCountPerColumn;
    }

    /**
     * @param svgChart - SvgChart instance.
     */
    constructor(svgChart: SvgChart, axisController?: XYHorVertAxisController) {
        super(svgChart);
        if (axisController) {
            this.axisController = axisController;
        } else {
            this.axisController = new XYHorVertAxisController(svgChart);
        }
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
                x = this.config.padding.left + this.config.xAxisGridPadding + (valueIndex * this.axisController.columnWidth) + this.config.barSpacing;
                y = this.config.padding.top + this.config.yAxisGridPadding + this.svgChart.chartHeight - (value * this.axisController.valueHeight) - (this.stackedBarValues[valueIndex] * this.axisController.valueHeight);
                height = this.config.padding.top + this.config.yAxisGridPadding + this.svgChart.chartHeight - (value * this.axisController.valueHeight);
                this.stackedBarValues[valueIndex] = this.stackedBarValues[valueIndex] += value;
            } else {
                x = this.config.padding.left + this.config.xAxisGridPadding + (valueIndex * this.axisController.columnWidth) + (this.barWidth * this.currentBarIndex) + (this.config.barSpacing * (this.currentBarIndex + 1));
                if (isNaN(x)) {
                    console.log(this.currentBarIndex);
                }
                height = y = this.config.padding.top + this.config.yAxisGridPadding + this.svgChart.chartHeight - (value * this.axisController.valueHeight);
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
                dataIndex: valueIndex,
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

        this.axisController.onDrawStart();
        
        const barWidth = (this.axisController.columnWidth - (this.config.barSpacing * (this.barCountPerColumn + 1))) / (this.barCountPerColumn || 1);

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
        //onConfigBeforeBarAndLine(this.svgChart, this.axisController);
        this.barCountPerColumn = this.config.barStacked ? 1 : 0;
        this.axisController.onConfigBefore();
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
