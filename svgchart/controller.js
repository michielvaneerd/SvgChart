import { SvgChart } from "./svg.js";
import { el, prefixed } from "./utils.js";

/**
 * Abstract Controller class. Reponsible for drawing charts for specific chart types.
 */
class Controller {

    static requiredConfigWithValue = {};

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
     * 
     * @param {HTMLElement} currentSerieGroupElement Group element where the chart can be appended to.
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

    drawStart(currentSerieGroupElement) {

    }

    drawEnd(currentSerieGroupElement) {

    }

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

export { Controller };