import { SvgChart } from "../svg.js";
import { el, prefixed } from "../utils.js";
/**
 * Abstract Controller class. Reponsible for drawing charts for specific chart types.
 */
class Controller {
    /**
     * Create new Controller class.
     * @param {SvgChart} svgChart SvgChart instance.
     */
    constructor(svgChart) {
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
    draw(currentSerieGroupElement) {
        this.drawStart(currentSerieGroupElement);
        this.config.series.forEach(function (serie, serieIndex) {
            const serieGroup = el('g', {
                dataSerie: serie.id,
                className: this.svgChart.unselectedSeries[serie.id] ? prefixed('unselected') : ''
            });
            this.drawSerie(serie, serieIndex, serieGroup);
            currentSerieGroupElement.appendChild(serieGroup);
        }, this);
        this.drawEnd(currentSerieGroupElement);
    }
    /**
     * Do things at the start of the draw for this chart.
     * @param {SVGElement} currentSerieGroupElement DOM group element.
     */
    drawStart(currentSerieGroupElement) {
    }
    /**
     * Do things at the end of the draw for this chart.
     * @param {SVGElement} currentSerieGroupElement DOM group element.
     */
    drawEnd(currentSerieGroupElement) {
    }
    /**
     * Draws chart element for this serie and attached it to the serieGroup.
     * @param {Object} serie Serie object.
     * @param {Number} serieIndex Serie index.
     * @param {SVGElement} serieGroup DOM group element for this serie.
     */
    drawSerie(serie, serieIndex, serieGroup) {
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
     * @param {Object} serie - Serie object
     */
    configSerieBefore(serie) {
        //console.log(`configSerieBefore for serie ${serie.id}`);
    }
    /**
     * Execute config things after global config things are done.
     * @param {Object} serie - Serie object
     */
    configSerieAfter(serie) {
        //console.log(`configSerieAfter for serie ${serie.id}`);
    }
}
Controller.requiredConfigWithValue = {};
export { Controller };
