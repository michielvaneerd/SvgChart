import { Controller } from "./controller";
import { LineController } from "./line_chart_controller";
import { BarController } from "./bar_chart_controller";
import { SvgChart } from "../svg";
import { SvgChartConfig } from "../config";
import { ChartConfigSerie } from "../types";

/**
 * Controller class for bar and line charts.
 */
class BarAndLineController extends Controller {

    #lineChartController: LineController;
    #barChartController: BarController;

    /**
     * @param svgChart - SvgChart instance.
     */
    constructor(svgChart: SvgChart) {
        super(svgChart);
        this.#barChartController = new BarController(svgChart);
        this.#lineChartController = new LineController(svgChart);
    }

    /** @override */
    static requiredConfigWithValue = {
        xAxisGridColumns: true
    };

    /** @override */
    onDrawSerie(serie: ChartConfigSerie, serieIndex: number, serieGroup: SVGElement) {
        const serieType = serie.type || (this.config.chartType === SvgChartConfig.chartTypes.lineAndBar ? SvgChartConfig.chartTypes.line : this.config.chartType);
        switch (serieType) {
            case SvgChartConfig.chartTypes.line:
                this.#lineChartController.onDrawSerie(serie, serieIndex, serieGroup);
                break;
            case SvgChartConfig.chartTypes.bar:
                this.#barChartController.onDrawSerie(serie, serieIndex, serieGroup);
                break;
        }
    }

    /** @override */
    onDrawStart(currentSerieGroupElement: SVGElement) {
        this.#barChartController.onDrawStart(currentSerieGroupElement);
    }

    /** @override */
    onConfigBefore() {
        this.#barChartController.onConfigBefore();
    }

    /** @override */
    onConfigSerieBefore(serie) {
        this.#barChartController.onConfigSerieBefore(serie);
    }

}

export { BarAndLineController };






