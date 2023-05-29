import { XYHorVertAxisController } from "../x_y_hor_vert_axis";
import { SvgChart } from "../svg";
import { Controller } from "./controller";
import { ChartConfigSerie } from "../types";
import { directionForEach, el, prefixed } from "../utils";

export class BubbleController extends Controller {

    axisController: XYHorVertAxisController;

    #radiusPerZValue: number;

    /**
     * @param svgChart - SvgChart instance.
     */
    constructor(svgChart: SvgChart) {
        super(svgChart);
        this.axisController = new XYHorVertAxisController(svgChart);
    }

    /**
     * Execute config things before global config things are done.
     * 
     * @override
     */
    onConfigBefore() {
        super.onConfigBefore();
        this.axisController.onConfigBefore();
    }

    /**
     * Do things at the start of the draw for this chart.
     * 
     * @override
     * 
     * @param currentSerieGroupElement - DOM group element.
     */
    onDrawStart(currentSerieGroupElement: SVGElement) {
        super.onDrawStart(currentSerieGroupElement);
        this.axisController.onDrawStart();
        const maxRadius = this.config.bubbleMaxRadius || (this.svgChart.chartWidth / this.svgChart.data.xAxis.columns.length / 2);
        this.#radiusPerZValue = maxRadius / this.config.bubbleMaxZValue;
    }

    /**
     * Draws chart element for this serie and attached it to the serieGroup. Overrides base class method.
     * 
     * @override
     * 
     * @param serie - Serie object.
     * @param serieIndex - Serie index.
     * @param serieGroup - DOM group element for this serie.
     */
    onDrawSerie(serie: ChartConfigSerie, serieIndex: number, serieGroup: SVGElement) {
        const absMinValue = Math.abs(this.config.minValue);
        directionForEach(this, this.svgChart.data.series[serie.id], this.config.ltr, (value: Array<number>, valueIndex: number, values: Array<Array<number>>) => {
            const x = this.config.padding.left + this.config.xAxisGridPadding + (valueIndex * this.axisController.columnWidth) + (this.config.xAxisGridColumns ? (this.axisController.columnWidth / 2) : 0);
            const y = this.config.padding.top + this.config.yAxisGridPadding + this.svgChart.chartHeight - ((value[0] + absMinValue) * this.axisController.valueHeight);
            serieGroup.appendChild(el('circle', {
                cx: x,
                cy: y,
                r: this.#radiusPerZValue * value[1],
                zIndex: 1,

                fill: this.svgChart.getSerieFill(serie, serieIndex),
                //className: prefixed('bar'),
                fillOpacity: this.config.bubbleFillOpacity || '',
                strokeWidth: this.config.bubbleStrokeWidth || 0,
                stroke: this.svgChart.getSerieStrokeColor(serie, serieIndex),
                dataIndex: valueIndex,
                className: prefixed('value-point'),
                tabindex: this.config.focusedValueShow ? 0 : null
            }));
        });
    }

}
