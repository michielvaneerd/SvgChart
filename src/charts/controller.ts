import { SvgChartConfig, ChartConfigSerie } from "../config";
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
     * @param {SvgChart} svgChart SvgChart instance.
     */
    constructor(svgChart: SvgChart) {
        if (new.target === Controller) {
            throw new Error('Controller class cannot be directly instanstiated.');
        }
        this.svgChart = svgChart;
        this.config = this.svgChart.config;
    }

    /**
     * Draws chart.
     * @param {SVGElement} currentSerieGroupElement Group element where the chart can be appended to.
     */
    draw(currentSerieGroupElement: SVGElement) {
        this.drawStart(currentSerieGroupElement);
        this.config.series.forEach((serie, serieIndex) => {
            const serieGroup = el('g', {
                dataSerie: serie.id,
                className: this.svgChart.unselectedSeries[serie.id] ? prefixed('unselected') : ''
            });
            this.drawSerie(serie, serieIndex, serieGroup);
            currentSerieGroupElement.appendChild(serieGroup);
        });
        this.drawEnd(currentSerieGroupElement);
    }

    /**
     * Do things at the start of the draw for this chart.
     * @param {SVGElement} currentSerieGroupElement DOM group element.
     */
    drawStart(currentSerieGroupElement: SVGElement) {

    }

    /**
     * Do things at the end of the draw for this chart.
     * @param {SVGElement} currentSerieGroupElement DOM group element.
     */
    drawEnd(currentSerieGroupElement: SVGElement) {

    }

    /**
     * Draws chart element for this serie and attached it to the serieGroup.
     * @param {ChartConfigSerie} serie Serie object.
     * @param {number} serieIndex Serie index.
     * @param {SVGElement} serieGroup DOM group element for this serie.
     */
    drawSerie(serie: ChartConfigSerie, serieIndex: number, serieGroup: SVGElement) {

    }

    /**
     * Execute config things before global config things are done.
     */
    configBefore() {
        //console.log('configBefore');
    }

    /**
     * Execute config things after global config things are done.
     */
    configAfter() {
        //console.log('configAfter');
    }

    /**
     * Execute serie config things before global config serie things are done.
     * @param {ChartConfigSerie} serie - Serie object
     */
    configSerieBefore(serie: ChartConfigSerie) {
        //console.log(`configSerieBefore for serie ${serie.id}`);
    }

    /**
     * Execute config things after global config things are done.
     * @param {ChartConfigSerie} serie - Serie object
     */
    configSerieAfter(serie: ChartConfigSerie) {
        //console.log(`configSerieAfter for serie ${serie.id}`);
    }

}

export { Controller };