import { prefixed, el } from "../utils.js";
import { Controller } from "./controller.js";
import { LineController } from "./line_chart_controller.js";
import { BarController } from "./bar_chart_controller.js";
import { SvgChart } from "../svg.js";

/**
 * Controller class for bar and line charts.
 * @extends Controller
 */
class BarAndLineController extends Controller {

    #lineChartController = null;
    #barChartController = null;

    /**
     * @param {SvgChart} svgChart SvgChart instance.
     */
    constructor(svgChart) {
        super(svgChart);
        this.#barChartController = new BarController(svgChart);
        this.#lineChartController = new LineController(svgChart);
    }

    static requiredConfigWithValue = {
        xAxisGridColumns: true
    };

    drawSerie(serie, serieIndex, serieGroup) {
        const serieType = serie.type || (this.config.chartType === SvgChart.chartTypes.lineAndBar ? SvgChart.chartTypes.line : this.config.chartType);
        switch (serieType) {
            case SvgChart.chartTypes.line:
                this.#lineChartController.drawSerie(serie, serieIndex, serieGroup);
                break;
            case SvgChart.chartTypes.bar:
                this.#barChartController.drawSerie(serie, serieIndex, serieGroup);
                break;
        }
    }

    drawStart(currentSerieGroupElement) {
        this.#barChartController.drawStart(currentSerieGroupElement);
    }

    configBefore() {
        this.#barChartController.configBefore();
    }

    configSerieBefore(serie) {
        this.#barChartController.configSerieBefore(serie);
    }

}

export { BarAndLineController };






