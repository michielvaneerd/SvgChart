import { Controller } from "./controller";
import { LineController } from "./line_chart_controller";
import { BarController } from "./bar_chart_controller";
import { SvgChart } from "../svg";
import { ChartConfigSerie, ChartType } from "../types";

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
        const serieType = serie.type || (this.config.chartType === ChartType.LineAndBar ? ChartType.Line : this.config.chartType);
        switch (serieType) {
            case ChartType.Line:
                this.#lineChartController.onDrawSerie(serie, serieIndex, serieGroup);
                break;
            case ChartType.Bar:
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






