import { SvgChartConfig } from "../config";
import { ChartConfigSerie } from "../types";
import { SvgChart } from "../svg";
import { el, prefixed } from "../utils";

/**
 * Abstract Controller class. Reponsible for drawing charts for specific chart types.
 */
class Controller {

    svgChart: SvgChart;
    config: SvgChartConfig;

    static requiredConfigWithValue = {};

    /**
     * Create new Controller class.
     * 
     * @param svgChart - SvgChart instance.
     */
    constructor(svgChart: SvgChart) {
        if (new.target === Controller) {
            throw new Error('Controller class cannot be directly instanstiated.');
        }
        this.svgChart = svgChart;
        this.config = this.svgChart.config;
    }

    /**
     * Returns HTML string to display when an item has received focus.
     * 
     * @param configSerie - Config serie for which to display the value.
     * @param serieIndex - Index of the serie.
     * @param dataIndex - Index of the data.
     * @returns The HTML string to display.
     */
    onFocusedValueDisplay(configSerie: ChartConfigSerie, serieIndex: number, dataIndex: number): string {
        return configSerie.title + ': ' + this.svgChart.data.series[configSerie.id][dataIndex] + '<hr style="margin-bottom:0; border: 2px solid ' + this.svgChart.getSerieStrokeColor(configSerie, serieIndex) + '">';
    }

    /**
     * Draws chart.
     * 
     * Calls:
     * - {@link onDrawStart} - Called once at the beginning of the drawing.
     * - {@link onDrawSerie} - Called for each serie.
     * - {@link onDrawEnd} - Called once at the end of the drawing.
     * 
     * @param currentSerieGroupElement - Group element where the chart can be appended to.
     */
    onDraw(currentSerieGroupElement: SVGElement) {
        this.onDrawStart(currentSerieGroupElement);
        this.config.series.forEach((serie, serieIndex) => {
            const serieGroup = el('g', {
                dataSerie: serie.id,
                className: this.svgChart.unselectedSeries[serie.id] ? prefixed('unselected') : ''
            });
            this.onDrawSerie(serie, serieIndex, serieGroup);
            currentSerieGroupElement.appendChild(serieGroup);
        });
        this.onDrawEnd(currentSerieGroupElement);
    }

    /**
     * Do things at the start of the draw for this chart.
     * 
     * @param currentSerieGroupElement - DOM group element.
     */
    onDrawStart(currentSerieGroupElement: SVGElement) {

    }

    /**
     * Do things at the end of the draw for this chart.
     * 
     * @param currentSerieGroupElement - DOM group element.
     */
    onDrawEnd(currentSerieGroupElement: SVGElement) {

    }

    /**
     * Draws chart element for this serie and attached it to the serieGroup.
     * 
     * @param serie - Serie object.
     * @param serieIndex - Serie index.
     * @param serieGroup - DOM group element for this serie.
     */
    onDrawSerie(serie: ChartConfigSerie, serieIndex: number, serieGroup: SVGElement) { }

    /**
     * Execute config things before global config things are done.
     */
    onConfigBefore() { }

    /**
     * Execute config things after global config things are done.
     */
    onConfigAfter() { }

    /**
     * Execute serie config things before global config serie things are done.
     * 
     * @param serie - Serie object
     */
    onConfigSerieBefore(serie: ChartConfigSerie) { }

    /**
     * Execute config things after global config things are done.
     * 
     * @param serie - Serie object
     */
    onConfigSerieAfter(serie: ChartConfigSerie) { }

}

export { Controller };