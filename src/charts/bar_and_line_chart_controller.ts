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

    set xAxisLabelsGroupElement(value: SVGElement) {
        this.#barChartController.xAxisLabelsGroupElement = value;
        this.#lineChartController.xAxisLabelsGroupElement = value;
    }

    get xAxisLabelsGroupElement() {
        return this.#barChartController.xAxisLabelsGroupElement;
    }

    set xAxisGroupElement(value: SVGElement) {
        this.#barChartController.xAxisGroupElement = value;
        this.#lineChartController.xAxisGroupElement = value;
    }

    get xAxisGroupElement() {
        return this.#barChartController.xAxisGroupElement;
    }

    set selectedColumnIndex(value: number) {
        this.#barChartController.selectedColumnIndex = value;
        this.#lineChartController.selectedColumnIndex = value;
    }

    get selectedColumnIndex() {
        return this.#barChartController.selectedColumnIndex;
    }

    set barCountPerColumn(value: number) {
        this.#barChartController.barCountPerColumn = value;
    }

    get barCountPerColumn() {
        return this.#barChartController.barCountPerColumn;
    }

    set valueHeight(value: number) {
        this.#barChartController.valueHeight = value;
        this.#lineChartController.valueHeight = value;
    }

    get valueHeight() {
        return this.#barChartController.valueHeight;
    }

    get columnWidth() {
        return this.#barChartController.columnWidth;
    }

    set columnWidth(value: number) {
        this.#barChartController.columnWidth = value;
        this.#lineChartController.columnWidth = value;
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






