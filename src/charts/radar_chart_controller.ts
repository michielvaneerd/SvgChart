import { SvgChartConfig } from "../config";
import { ChartConfigSerie } from "../types";
import { el, polarToCartesian, prefixed } from "../utils";
import { Controller } from "./controller";

/**
 * Class for displaying radar charts.
 */
class RadarController extends Controller {

    #radius: number;
    #centerX: number;
    #centerY: number;
    #seriesCount: number;
    #degreeSteps: number;
    #radiusByXStep: number;

    /**
     * Draws chart element for this serie and attached it to the serieGroup. Overrides base class method.
     * 
     * @override
     * 
     * @param serie - Serie object.
     * @param serieIndex - Serie index.
     * @param serieGroup - DOM group element for this serie.
     */
    onDrawSerie(serie: ChartConfigSerie, serieIndex: number, serieGroup: SVGElement) {

        super.onDrawSerie(serie, serieIndex, serieGroup);

        let points = [];
        this.svgChart.data.series[serie.id].forEach((value, index) => {
            const curRadius = this.#radiusByXStep * value;
            const point = polarToCartesian(this.#centerX, this.#centerY, curRadius, this.#degreeSteps * index);
            points.push(`${point.x}, ${point.y}`);
            serieGroup.appendChild(el('circle', {
                cx: point.x,
                cy: point.y,
                r: this.config.pointRadius,
                fill: this.svgChart.getSerieFill(serie, serieIndex),
                tabindex: this.config.focusedValueShow ? 0 : null,
                zIndex: 1,
                dataValue: value,
                className: prefixed('value-point'),
                stroke: this.svgChart.getSeriePointColor(serie, serieIndex)
            }));
        });
        serieGroup.appendChild(el('polygon', {
            points: points.join(' '),
            stroke: this.svgChart.getSerieStrokeColor(serie, serieIndex),
            fill: this.svgChart.getSerieFill(serie, serieIndex),
            fillOpacity: this.config.radarFillOpacity,
            strokeWidth: this.config.radarStrokeWidth,
        }));
    }

    onConfigBefore(): void {

        super.onConfigBefore();

        this.svgChart.xAxisGroupElement = this.svgChart.svg.appendChild(el('g', {
            className: prefixed('x-axis-group')
        }));
    }

    /**
     * Do things at the start of the draw for this chart.
     * 
     * @override
     * 
     * @param currentSerieGroupElement - DOM group element.
     */
    onDrawStart(currentSerieGroupElement: SVGElement) {

        super.onDrawStart(currentSerieGroupElement);

        this.#drawAxis();
    }

    #drawAxis() {
        this.#radius = this.svgChart.chartHeight / 2;
        this.#centerX = this.svgChart.width / 2;
        this.#centerY = this.svgChart.chartHeight / 2 + this.svgChart.config.padding.top;
        var gAxis = el('g', {
            className: prefixed('axis-group')
        });

        this.#seriesCount = this.svgChart.data.xAxis.columns.length;
        this.#degreeSteps = 360 / this.#seriesCount;
        this.#radiusByXStep = this.#radius / (Math.abs(this.config.minValue) + this.config.maxValue);

        for (let curYStep = this.config.minValue; curYStep <= this.config.maxValue; curYStep += this.config.yAxisStep) {

            const curRadius = this.#radiusByXStep * curYStep;

            let polylinePoints = [];
            let firstPoint = null;

            this.svgChart.data.xAxis.columns.forEach((column, index) => {

                const angle = this.#degreeSteps * index;

                const point = polarToCartesian(this.#centerX, this.#centerY, curRadius, angle);

                if (index === 0) {
                    firstPoint = point;
                }

                polylinePoints.push(`${point.x}, ${point.y}`);

                if (curYStep === this.config.maxValue) {

                    let dominantBaseline: string = null;
                    if (angle === 0) {
                        dominantBaseline = 'auto';
                    } else if (angle <= 90) {
                        dominantBaseline = 'middle';
                    } else if (angle < 270) {
                        dominantBaseline = 'hanging';
                    } else {
                        dominantBaseline = 'middle';
                    }

                    gAxis.appendChild(el('text', {
                        x: angle === 0 || angle === 180 ? point.x : (angle < 180 ? (point.x + 10) : point.x - this.config.paddingDefault),
                        y: angle === 0 ? point.y - this.config.paddingDefault : (angle === 180 ? (point.y + this.config.paddingDefault) : point.y),
                        direction: SvgChartConfig.getDirection(this.config),
                        textAnchor: angle === 0 || angle === 180 ? 'middle' : (angle < 180 ? 'start' : 'end'),
                        dominantBaseline: dominantBaseline,
                        fontFamily: this.config.fontFamily || '',
                        fontSize: this.config.axisLabelFontSize || '',
                        fontWeight: 'normal',
                        fill: this.config.xAxisLabelColor || '',
                    }, document.createTextNode(column)));
                    gAxis.appendChild(el('line', {
                        x1: this.#centerX,
                        y1: this.#centerY,
                        x2: point.x,
                        y2: point.y,
                        className: prefixed('axis-grid-line'),
                        stroke: this.config.xAxisGridLineColor,
                        strokeWidth: this.config.xAxisGridLineWidth,
                        strokeDasharray: this.config.xAxisGridLineDashArray,
                    }));
                }
            });

            gAxis.appendChild(el('polygon', {
                points: polylinePoints.join(' '),
                fill: 'transparent',
                className: prefixed('axis-grid-line'),
                stroke: this.config.xAxisGridLineColor,
                strokeWidth: this.config.xAxisGridLineWidth,
                strokeDasharray: this.config.xAxisGridLineDashArray,
            }));

            if (curYStep % this.config.yAxisLabelStep === 0) {
                gAxis.appendChild(el('text', {
                    x: firstPoint.x,
                    y: firstPoint.y,
                    direction: SvgChartConfig.getDirection(this.config),
                    textAnchor: 'middle',
                    dominantBaseline: 'middle',
                    fontFamily: this.config.fontFamily || '',
                    fontSize: this.config.axisLabelFontSize || '',
                    fontWeight: 'normal',
                    fill: this.config.xAxisLabelColor || '',
                }, document.createTextNode(curYStep.toString())));
            }

        }

        this.svgChart.xAxisGroupElement.appendChild(gAxis);
    }

}

export { RadarController };