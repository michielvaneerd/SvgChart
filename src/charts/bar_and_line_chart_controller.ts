import { Controller } from "./controller";
import { LineController } from "./line_chart_controller";
import { BarController } from "./bar_chart_controller";
import { SvgChart } from "../svg";
import { ChartConfigSerie, SvgChartConfig } from "../config";

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
    constructor(svgChart: SvgChart) {
        super(svgChart);
        this.#barChartController = new BarController(svgChart);
        this.#lineChartController = new LineController(svgChart);
    }

    static requiredConfigWithValue = {
        xAxisGridColumns: true
    };

    drawSerie(serie: ChartConfigSerie, serieIndex: number, serieGroup: SVGElement) {
        const serieType = serie.type || (this.config.chartType === SvgChartConfig.chartTypes.lineAndBar ? SvgChartConfig.chartTypes.line : this.config.chartType);
        switch (serieType) {
            case SvgChartConfig.chartTypes.line:
                this.#lineChartController.drawSerie(serie, serieIndex, serieGroup);
                break;
            case SvgChartConfig.chartTypes.bar:
                this.#barChartController.drawSerie(serie, serieIndex, serieGroup);
                break;
        }
    }

    drawStart(currentSerieGroupElement: SVGElement) {
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






