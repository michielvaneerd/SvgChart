import { prefixed, el } from "./utils.js";
import { Controller } from "./controller.js";
import { LineController } from "./line_chart_controller.js";
import { BarController } from "./bar_chart_controller.js";
import { SvgChart } from "./svg.js";
import { AxisController } from "./axis.js";


/**
 * Controller class for bar and line charts.
 * @extends Controller
 */
class BarAndLineController extends Controller {

    #axisController = null;
    #lineChartController = null;
    #barChartController = null;

    /**
     * 
     * @param {SvgChart} svgChart SvgChart instance.
     */
    constructor(svgChart) {
        super(svgChart);
        this.#axisController = new AxisController(svgChart);
        this.#barChartController = new BarController(svgChart);
        this.#lineChartController = new LineController(svgChart);
    }

    static requiredConfigWithValue = {
        xAxisGridColumns: true
    };

    drawSerie(serie, serieIndex, serieGroup) {
        const serieType = serie.type || (this.config.chartType === 'lineAndBar' ? 'line' : this.config.chartType);
        switch (serieType) {
            case 'line':
                this.#lineChartController.drawSerie(serie, serieIndex, serieGroup);
                break;
            case 'bar':
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






