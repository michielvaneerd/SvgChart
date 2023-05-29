import { el, parent, prefixed } from "./utils";
import { colors } from "./colors";
import { LineController } from "./charts/line_chart_controller";
import { BarController } from "./charts/bar_chart_controller";
import { BarAndLineController } from "./charts/bar_and_line_chart_controller";
import { DonutController } from "./charts/donut_chart_controller";
import { PieController } from "./charts/pie_chart_controller";
import { SvgChartConfig } from "./config";
import { Controller } from "./charts/controller";
import { ChartConfigSerie, ChartData, ChartEventInfo, ChartPosition, ChartType, ScopedEventCallback, StringBooleanHash } from "./types";
import { RadarController } from "./charts/radar_chart_controller";
import { BubbleController } from "./charts/bubble_chart_controller";

// Radar chart:
// https://medium.com/@brianfoody/jogging-your-geometry-memory-by-building-an-svg-radar-chart-in-react-native-4aeee555809f

/**
 * SvgChart class.
 * 
 * ```ts
 * var chart = new SvgChart();
 * ```
 */
class SvgChart {

    /**
     * Mapper for chart types and chart controllers.
     */
    static #chartTypeControllers = { ChartType: Controller };

    static {
        SvgChart.#chartTypeControllers[ChartType.Line] = LineController;
        SvgChart.#chartTypeControllers[ChartType.Bar] = BarController;
        SvgChart.#chartTypeControllers[ChartType.LineAndBar] = BarAndLineController;
        SvgChart.#chartTypeControllers[ChartType.Pie] = PieController;
        SvgChart.#chartTypeControllers[ChartType.Donut] = DonutController;
        SvgChart.#chartTypeControllers[ChartType.Radar] = RadarController;
        SvgChart.#chartTypeControllers[ChartType.Bubble] = BubbleController;
    }

    /**
     * All embedded color palettes. Set another with {@link setActiveColorPalette}.
     */
    static colorPalettes = colors;

    /**
     * Some CSS rules for synamic styles are added to the HEAD of the document.
     */
    static #cssAdded = false;

    /**
     * Current color palette. Set another one with {@link setActiveColorPalette}.
     */
    static #activeColorPalette = colors.dutchFieldColorPalette;

    /**
     * Width of parent element.
     */
    width: number;

    /**
     * Height of parent element.
     */
    height: number;

    /**
     * Width of chart without paddings.
     */
    chartWidth: number;

    /**
     * Height of chart without paddings.s
     */
    chartHeight: number;

    /**
     * The generated root SVG element.
     */
    svg: SVGElement;

    /**
     * Config object that is created in the constrructor or setConfig() methiod.
     */
    config: SvgChartConfig;

    /**
     * Controller that is in charge of drawing the chart.
     */
    #controller: Controller;

    /**
     * Hash where key = serie and value = whether it is selected or nor not.
     */
    unselectedSeries: StringBooleanHash;

    /**
     * Chart data object. Set during the chart() method.
     */
    #data: ChartData;

    /**
     * Element that contains definitions, for example for gradients.
     */
    #defsElement: SVGElement;

    /**
     * Element where the config.drawOnDarta method will paint in. Only created when config.drawOnData is specified.
     */
    #drawOnDataGroup: SVGElement;

    /**
     * Element where series will be attached to.
     */
    serieGroupElement: SVGElement;

    /**
     * SVG group element that wraps the focused value element.
     */
    focusedValueForeignObject: SVGElement;
    focusedValueDiv: HTMLElement;

    /**
     * Scoped callback to call when a legend item gets clicked.
     */
    #onLegendClickScoped: ScopedEventCallback = null;

    /**
     * Scoped callback to call when a legend items receives a keyboard ENTER press.
     */
    #onLegendKeypressScoped: ScopedEventCallback = null;
    #onSerieGroupTransitionendScoped: ScopedEventCallback = null;
    #onSerieGroupFocusScoped: ScopedEventCallback = null;
    #onSerieGroupBlurScoped: ScopedEventCallback = null;

    #listenersToRemoveAfterConfigChange: Array<ChartEventInfo>;

    get controller() {
        return this.#controller;
    }

    get data() {
        return this.#data;
    }

    /**
     * Set a color palette for all chart instances.
     * 
     * @param colors - Array of colors.
     */
    static setActiveColorPalette(colors: Array<string>) {
        SvgChart.#activeColorPalette = colors;
    }

    /**
     * Constructor - create a new chart instance.
     * 
     * Actions during the constructor:
     * - Adding CSS rules (for dynamic styling)
     * - Create and add SVG element.
     * - Call {@link setConfig}.
     * 
     * @param parent - Parent DOM node the SVG element will be attached to.
     * @param config - Configuration object.
     */
    constructor(parent: HTMLElement, config: SvgChartConfig) {

        if (!SvgChart.#cssAdded) {
            SvgChart.#cssAdded = true;
            const cssRules = [
                '.' + prefixed('value-point') + ', g.' + prefixed('legend-group') + ' g, .' + prefixed('x-axis-grid-column-selectable-label') + ' { cursor: pointer; }',
                '.' + prefixed('value-point') + ':hover, circle.' + prefixed('value-point') + ':focus { stroke-width: 6; outline: none; }',
                '#' + prefixed('serie-group') + ' g { transition: opacity 0.6s; }',
                '#' + prefixed('serie-group') + ' g.' + prefixed('unselected') + ' { opacity: 0; }',
                '#' + prefixed('serie-group-current') + ' { transition: opacity 1s; opacity: 1; }',
                '#' + prefixed('serie-group-current') + '.' + prefixed('unattached') + ' { opacity: 0; }',
                'g.' + prefixed('legend-group') + ' g.' + prefixed('unselected') + ' { opacity: 0.4; }',
                'text.' + prefixed('x-axis-label') + '.' + prefixed('x-axis-grid-column-selectable-label') + '.' + prefixed('selected') + ' { font-weight: bold; }',
                'rect.' + prefixed('bar') + ':hover, path.' + prefixed('pie-piece') + ':hover { fill-opacity: 0.7; }',
                'path.' + prefixed('pie-piece') + ':focus, rect.' + prefixed('bar') + ':focus { outline: none; fill-opacity:1; }'
            ];
            parent.ownerDocument.head.appendChild(document.createElement("style")).innerHTML = cssRules.join("\n");
        }

        const parentRect = parent.getBoundingClientRect();

        this.width = parentRect.width;
        this.height = parentRect.height;

        this.svg = el('svg', {
            width: this.width,
            height: this.height
        });
        parent.appendChild(this.svg);

        this.setConfig(config);
    }

    /**
     * Set the configuration for this chart instance. The idea is that this method does things that need to be done
     * only once for a chart and that {@link chart} does things for drawing the charts and can happen multiple times,
     * for example if you need to display a new set of data.
     * 
     * Actions during this method:
     * - Merge config from parameter with default config.
     * - Create chart controller for this charttype.
     * - Remove all child element and event listeners for this chart (only does something when this method is called multiple times).
     * - Adding elements like title, legend, etc.
     * - Add the {@link serieGroupElement}.
     * 
     * @param config - Configuration object.
     */
    setConfig(config: SvgChartConfig) {

        // const newConfig = new SvgChartConfig();

        // this.config = Object.assign({}, newConfig, config);
        // this.config.padding = Object.assign({}, newConfig.padding, this.config.padding);

        this.config = config;
        Object.keys(SvgChart.#chartTypeControllers[this.config.chartType].requiredConfigWithValue).forEach((key) => {
            this.config[key] = SvgChart.#chartTypeControllers[this.config.chartType].requiredConfigWithValue[key];
        });
        //this.config = Object.assign(this.config, SvgChart.#chartTypeControllers[this.config.chartType].requiredConfigWithValue);

        if (this.config.ltr) {
            this.config.padding.left = this.config.padding.start;
            this.config.padding.right = this.config.padding.end;
        } else {
            this.config.padding.left = this.config.padding.end;
            this.config.padding.right = this.config.padding.start;
        }

        this.#controller = new SvgChart.#chartTypeControllers[config.chartType](this);

        this.svg.setAttribute('direction', SvgChartConfig.getDirection(this.config));

        // First remove event listener from a previous config if they exist.
        if (this.#listenersToRemoveAfterConfigChange && this.#listenersToRemoveAfterConfigChange.length) {
            this.#listenersToRemoveAfterConfigChange.forEach((item) => {
                item.node.removeEventListener(item.eventName, item.callback, item.capture);
            });
        }
        this.#listenersToRemoveAfterConfigChange = [];

        // And then remove child nodes from a previous config if they exist.
        while (this.svg.childNodes.length) {
            this.svg.firstChild.remove();
        }

        this.#data = null;
        this.unselectedSeries = {} as StringBooleanHash;

        this.chartWidth = this.width - this.config.padding.start - this.config.padding.end - (this.config.xAxisGridPadding * 2);
        this.chartHeight = this.height - this.config.padding.top - this.config.padding.bottom - (this.config.yAxisGridPadding * 2);

        if (this.config.backgroundColor) {
            this.svg.style.backgroundColor = this.config.backgroundColor;
        }
        this.#defsElement = el('defs');
        this.svg.appendChild(this.#defsElement);

        if (!this.#onSerieGroupTransitionendScoped) {
            this.#onSerieGroupTransitionendScoped = this.#onSerieGroupTransitionend.bind(this);
        }

        let drawOnConfigGroup = this.config.drawOnConfig ? this.svg.appendChild(el('g', {
            className: prefixed('draw-on-config-group')
        })) : null;

        if (this.config.title) {
            this.#addTitle();
        }

        if (this.config.legend) {
            this.#addLegend();
        }

        this.controller.onConfigBefore();

        this.config.series.forEach((serie) => {

            this.controller.onConfigSerieBefore(serie);

            if (serie.fillGradient) {
                var lg = el('linearGradient', {
                    id: serie.id + '-gradient',
                    x1: 0,
                    x2: 0,
                    y1: 0,
                    y2: 1
                });
                lg.appendChild(el('stop', {
                    offset: "0%",
                    stopColor: serie.fillGradient[0]
                }));
                lg.appendChild(el('stop', {
                    offset: "100%",
                    stopColor: serie.fillGradient[1]
                }));
                this.#defsElement.appendChild(lg);
            }

            this.controller.onConfigSerieAfter(serie);

        });

        if (this.config.drawOnConfig) {
            this.config.drawOnConfig(this, drawOnConfigGroup);
        }

        if (this.config.drawOnData) {
            this.#drawOnDataGroup = el('g', {
                className: prefixed('draw-on-data-group')
            });
            this.svg.appendChild(this.#drawOnDataGroup);
        }

        this.#addSerieGroup();

        this.controller.onConfigAfter();

    }

    /**
     * Writing the chart data.
     * 
     * @param data - Data object.
     */
    chart(data: ChartData = null) {

        if (data !== null) {
            this.#data = data;
        }

        if (this.serieGroupElement.firstChild) {
            this.serieGroupElement.firstChild.remove();
        }
        const currentSerieGroupElement = el('g', {
            id: prefixed('serie-group-current'),
            className: this.config.transition ? prefixed('unattached') : ''
        });

        this.controller.onDraw(currentSerieGroupElement);

        this.serieGroupElement.appendChild(currentSerieGroupElement);

        if (this.config.transition) {
            // getBoundingClientRect causes a reflow, so we don't have to use setTimeout to remove the class.
            currentSerieGroupElement.getBoundingClientRect();
            currentSerieGroupElement.classList.remove(prefixed('unattached'));
        }

        if (this.config.drawOnData) {
            this.config.drawOnData(this, this.#drawOnDataGroup);
        }

    }

    // setSelectedIndex(index) {
    //     var textNodes = this.xAxisLabelsGroupElement.querySelectorAll('text.' + prefixed('x-axis-grid-column-selectable-label'));
    //     return this.#onXAxisLabelGroupSelect(textNodes.item(index));
    // }

    /**
     * Saves chart as PNG file.
     * 
     * @param filename - Filename.
     */
    saveAsPng(filename: string) {
        var rect = this.svg.getBoundingClientRect();
        var canvas = document.createElement('canvas');
        canvas.setAttribute('width', rect.width.toString());
        canvas.setAttribute('height', rect.height.toString());
        var ctx = canvas.getContext('2d');
        ctx.fillStyle = this.svg.style.backgroundColor;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        var img = new Image();
        var data = '<svg xmlns="http://www.w3.org/2000/svg">' + this.svg.innerHTML + '</svg>';
        var parser = new DOMParser();
        var result = parser.parseFromString(data, 'text/xml');
        var inlineSVG = result.getElementsByTagName("svg")[0];
        inlineSVG.setAttribute('width', rect.width.toString());
        inlineSVG.setAttribute('height', rect.height.toString());
        var svg64 = btoa(new XMLSerializer().serializeToString(inlineSVG));
        var image64 = 'data:image/svg+xml;base64,' + svg64;
        img.onload = function () {
            ctx.drawImage(img, 0, 0, rect.width, rect.height);
            window.URL.revokeObjectURL(image64);
            var png_img = canvas.toDataURL("image/png");
            const createEl = document.createElement('a');
            createEl.href = png_img;
            createEl.download = filename;
            createEl.click();
            createEl.remove();
        }
        img.src = image64;
    }

    /**
     * Add serie group element. This is a SVG group element where the series data will be attached to.
     */
    #addSerieGroup() {
        this.serieGroupElement = el('g', {
            id: prefixed('serie-group')
        });
        this.svg.appendChild(this.serieGroupElement);
        this.addEventListener(this.serieGroupElement, 'transitionend', this.#onSerieGroupTransitionendScoped, false);

        if (this.config.focusedValueShow) {

            if (!this.#onSerieGroupFocusScoped) {
                this.#onSerieGroupFocusScoped = this.#onSerieGroupFocus.bind(this);
                this.#onSerieGroupBlurScoped = this.#onSerieGroupBlur.bind(this);
            }

            this.addEventListener(this.serieGroupElement, 'focus', this.#onSerieGroupFocusScoped, true);
            this.addEventListener(this.serieGroupElement, 'blur', this.#onSerieGroupBlurScoped, true);

            this.focusedValueForeignObject = el('foreignObject');
            this.focusedValueDiv = document.createElementNS('http://www.w3.org/1999/xhtml', 'div');
            this.focusedValueDiv.style.position = 'absolute';
            this.focusedValueDiv.style.backgroundColor = this.config.focusedCSSValueFill;
            this.focusedValueDiv.style.fontFamily = this.config.fontFamily;
            this.focusedValueDiv.style.fontSize = 'smaller';
            this.focusedValueDiv.style.color = this.config.focusedCSSValueColor;
            this.focusedValueDiv.style.padding = this.config.focusedCSSValuePadding.toString();
            this.focusedValueForeignObject.style.overflow = 'visible';
            this.focusedValueForeignObject.appendChild(this.focusedValueDiv);

        }
    }

    /**
     * Add legend.
     */
    #addLegend() {

        const gLegend = el('g', {
            className: prefixed('legend-group')
        });

        if (this.config.legendSelect) {
            if (!this.#onLegendClickScoped) {
                this.#onLegendClickScoped = this.#onLegendClick.bind(this);
                this.#onLegendKeypressScoped = this.#onLegendKeypress.bind(this);
            }
            this.addEventListener(gLegend, 'keydown', this.#onLegendKeypressScoped, false);
            this.addEventListener(gLegend, 'click', this.#onLegendClickScoped, false);
        }

        this.config.series.forEach((serie, serieIndex) => {

            const gSerie = el('g', {
                dataSerie: serie.id,
                tabindex: this.config.legendSelect ? 0 : null
            });

            let x = 0, y = 0;

            switch (this.config.legendPosition) {
                case ChartPosition.Top:
                    y = this.config.legendTop ? this.config.legendTop : (this.config.padding.top / 2);
                    break;
                case ChartPosition.Bottom:
                    y = this.config.legendBottom ? this.config.legendBottom : (this.height - (this.config.padding.bottom / 2));
                    break;
                case ChartPosition.End:
                    if (this.config.ltr) {
                        x = this.config.padding.start + this.chartWidth + (this.config.xAxisGridPadding * 2) + this.config.paddingDefault;
                        y = this.config.padding.top + this.config.yAxisGridPadding + (serieIndex * this.config.paddingDefault);
                    } else {
                        x = (this.config.xAxisGridPadding * 2) + this.config.padding.end - this.config.paddingDefault - this.config.legendWidth;
                        y = this.config.padding.top + this.config.yAxisGridPadding + (serieIndex * this.config.paddingDefault);
                    }
                    break;
            }

            const rect = el('rect', {
                x: x,
                y: y,
                rx: this.config.legendCircle ? this.config.legendWidth : 0,
                ry: this.config.legendCircle ? this.config.legendWidth : 0,
                width: this.config.legendWidth,
                height: this.config.legendWidth,
                fill: this.getSerieFill(serie, serieIndex)
            });

            const text = el('text', {
                direction: SvgChartConfig.getDirection(this.config),
                x: this.config.ltr ? (x + (this.config.legendWidth * 2)) : (x - this.config.legendWidth),
                y: y + (this.config.legendWidth / 2) + 1, // + 1 don't know why
                textAnchor: 'start',
                dominantBaseline: 'middle',
                fontFamily: this.config.fontFamily,
                fill: this.config.legendColor,
                fontSize: this.config.legendFontSize,
            }, document.createTextNode(serie.title));


            if (this.config.ltr) {
                gSerie.appendChild(rect);
                gSerie.appendChild(text);
            } else {
                gSerie.appendChild(text);
                gSerie.appendChild(rect);
            }
            gLegend.appendChild(gSerie);
        });

        this.svg.appendChild(gLegend);

        if ([ChartPosition.Top, ChartPosition.Bottom].indexOf(this.config.legendPosition) > -1) {

            // Measure the text so we can place the rects and texts next to each other
            // and center the complete legend row.

            let totalLegendWidth = 0;
            let curX = this.config.ltr ? 0 : (this.width - this.config.legendWidth);
            gLegend.querySelectorAll('g').forEach((g) => {
                const box = g.getBBox();
                g.querySelector('rect').setAttribute('x', curX.toString());
                g.querySelector('text').setAttribute('x', (this.config.ltr ? (curX + (this.config.legendWidth * 2)) : (curX - 10)).toString());
                if (this.config.ltr) {
                    curX += (box.width + this.config.paddingDefault);
                } else {
                    curX -= (box.width + this.config.paddingDefault);
                }
                totalLegendWidth += (box.width + this.config.paddingDefault);
            });
            if (this.config.ltr) {
                curX -= this.config.paddingDefault;
                gLegend.setAttribute('transform', 'translate(' + ((this.width / 2) - (curX / 2)) + ', 0)');
            } else {
                totalLegendWidth -= this.config.paddingDefault;
                gLegend.setAttribute('transform', 'translate(-' + ((this.width / 2) - (totalLegendWidth / 2)) + ', 0)');
            }

        }

    }

    /**
     * Add chart title.
     */
    #addTitle() {
        var x: number, y: number, dominantBaseline: string, textAnchor: string = null;
        switch (this.config.titleHorizontalPosition) {
            case ChartPosition.End:
                x = this.width - this.config.paddingDefault;
                textAnchor = this.config.ltr ? 'end' : 'start';
                break;
            case ChartPosition.Start:
                x = this.config.paddingDefault;
                textAnchor = this.config.ltr ? 'start' : 'end';
                break;
            default:
                x = this.width / 2;
                textAnchor = 'middle';
                break;
        }
        switch (this.config.titleVerticalPosition) {
            case ChartPosition.Center:
                y = this.height / 2;
                dominantBaseline = 'middle';
                break;
            case ChartPosition.Bottom:
                y = this.height - this.config.paddingDefault;
                dominantBaseline = 'auto';
                break;
            default:
                y = this.config.paddingDefault;
                dominantBaseline = 'hanging';
                break;
        }
        this.svg.appendChild(el('text', {
            direction: SvgChartConfig.getDirection(this.config),
            x: x,
            y: this.config.paddingDefault,
            textAnchor: textAnchor,
            dominantBaseline: dominantBaseline,
            fontFamily: this.config.fontFamily,
            fontSize: this.config.titleFontSize,
            fill: this.config.titleColor,
            className: prefixed('text-title'),
        }, document.createTextNode(this.config.title)));
    }

    /**
     * Get the color or gradient for this serie for a specific property.
     * 
     * @param props - 
     * @param serie - Serie object.
     * @param serieIndex - Serie index.
     * @returns Color or gradient.
     */
    getSeriePropertyColor(props: Array<any>, serie: ChartConfigSerie, serieIndex: number): string {
        for (var i = 0; i < props.length; i++) {
            var key = props[i];
            if (serie[key]) {
                return key === 'fillGradient' ? `url(#${serie.id}-gradient)` : serie[key];
            }
        }
        if (serie.color) {
            return serie.color;
        }
        return SvgChart.#activeColorPalette[serieIndex];
    }

    /**
     * Get the point color or gradient for this serie.
     * 
     * @param serie - Serie object.
     * @param serieIndex - Serie index.
     * @returns Color or gradient.
     */
    getSeriePointColor(serie: ChartConfigSerie, serieIndex: number): string {
        return this.getSeriePropertyColor(['pointColor', 'strokeColor'], serie, serieIndex);
    }

    /**
     * Get the stroke color or gradient for this serie.
     * 
     * @param serie - Serie object.
     * @param serieIndex - Serie index.
     * @returns Color or gradient.
     */
    getSerieStrokeColor(serie: ChartConfigSerie, serieIndex: number): string {
        return this.getSeriePropertyColor(['strokeColor'], serie, serieIndex);
    }

    /**
     * Get the fill color or gradient for this serie.
     * 
     * @param serie - Serie object.
     * @param serieIndex - Serie index.
     * @returns Color or gradient.
     */
    getSerieFill(serie: ChartConfigSerie, serieIndex: number): string {
        return this.getSeriePropertyColor(['fillGradient'], serie, serieIndex);
    }

    /**
     * Adds an event listener to a node and adds it to the #listenersToRemoveAfterConfigChange array as well, so we can remove them in one place.
     * 
     * @param node - Node to add the listener to.
     * @param eventName - Name of event.
     * @param callback - Function that needs to be executed.
     * @param capture - Capture or not.
     */
    addEventListener(node: Node, eventName: string, callback: EventListenerOrEventListenerObject, capture: boolean) {
        node.addEventListener(eventName, callback, capture);
        this.#listenersToRemoveAfterConfigChange.push({
            node: node,
            eventName: eventName,
            callback: callback,
            capture: capture
        });
    }


    /**
     * When legend gets toggled (selected / deselected).
     * @param {SVGElement} target Legend node that gets toggled.
     */
    #onLegendToggle(target: SVGElement) {
        var g = parent(target, 'g');
        if (g && g.dataset.serie) {
            var sg = this.serieGroupElement.querySelector('g[data-serie="' + g.dataset.serie + '"]');
            if (this.unselectedSeries[g.dataset.serie]) {
                if (sg) {
                    sg.setAttribute('display', 'inline'); // This is the default apparently and MUST be set before we change the unselected class, otherwise the transition won't be started
                    sg.classList.remove(prefixed('unselected'));
                }
                g.classList.remove(prefixed('unselected'));
                delete this.unselectedSeries[g.dataset.serie];
            } else {
                g.classList.add(prefixed('unselected'));
                if (sg) {
                    sg.classList.add(prefixed('unselected'));
                }
                this.unselectedSeries[g.dataset.serie] = true;
            }
        }
    }

    /**
     * When a key is pressed on a focussed legend node.
     * @param {Event} e Event object.
     */
    #onLegendKeypress(e: KeyboardEvent) {
        if (e.key === 'Enter') {
            this.#onLegendToggle(e.target as SVGElement);
        }
    }

    /**
     * When a focussed legend node is clicked.
     * @param {Event} e Event object.
     */
    #onLegendClick(e: Event) {
        this.#onLegendToggle(e.target as SVGElement);
    }

    /**
     * When the tranisiton of a serie group has ended.
     * 
     * @param e - Event object.
     */
    #onSerieGroupTransitionend(e: Event) {
        const target = e.target as SVGElement;
        // Currently only used to add display none to it when this serie group is unselected.
        // We have to add display none, so this node doesn't make part of the UI anymore and cannot hide other nodes.
        if (target.classList.contains(prefixed('unselected'))) {
            target.setAttribute('display', 'none');
        }
    }

    /**
     * When a serie group node is blurred (this means loses focus).
     * 
     * @param e - Event object.
     */
    #onSerieGroupBlur(e: Event) {
        var circle = e.target as SVGElement;
        var g = parent(circle, 'g');
        var serie = g.dataset.serie;
        if (serie) {
            // Remove the current value element.
            //this.serieGroupElement.removeChild(this.focusedValueEl);
        }
    }

    /**
     * When a serie group node gets focussed.
     * 
     * @param e - Event object.
     */
    #onSerieGroupFocus(e: Event) {
        var circle = e.target as SVGElement;
        var g = parent(circle, 'g');
        var serie = g.dataset.serie;
        if (serie) {
            var serieItemIndex = this.config.series.findIndex((item) => item.id === serie);
            var serieItem = this.config.series[serieItemIndex];
            this.focusedValueDiv.innerHTML = this.config.focusedValueCallback
                ? this.config.focusedValueCallback(serieItem, circle.dataset.value)
                : serieItem.title + '<hr style="border-color:' + this.getSerieFill(serieItem, serieItemIndex) + '">' + circle.dataset.value;
            this.serieGroupElement.appendChild(this.focusedValueForeignObject);
            const width = this.focusedValueDiv.clientWidth;
            const height = this.focusedValueDiv.clientHeight;
            this.focusedValueForeignObject.setAttribute('width', width.toString());
            this.focusedValueForeignObject.setAttribute('height', height.toString());

            const type = serieItem.type || this.config.chartType;
            let x: number, y: number = null;
            switch (type) {
                case ChartType.Line:
                case ChartType.Bar:
                case ChartType.LineAndBar:
                case ChartType.Radar:
                case ChartType.Bubble:
                    x = (parseFloat(circle.getAttribute('cx')) || (parseFloat(circle.getAttribute('x')) + (parseFloat(circle.getAttribute('width')) / 2))) - (width / 2);
                    y = (parseFloat(circle.getAttribute('cy')) || parseFloat(circle.getAttribute('y'))) - 10 - height;
                    break;
                case ChartType.Pie:
                case ChartType.Donut:
                    var d = circle.getAttribute('d').split(' ');
                    x = parseFloat(d[1].trim());
                    y = parseFloat(d[2].trim());
                    break;
            }
            this.focusedValueForeignObject.setAttribute('transform', 'translate(' + x + ', ' + y + ')');
        }
    }

}

export { SvgChart };
