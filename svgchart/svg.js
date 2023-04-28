import { el, parent, prefixed, directionForEach, describeArcPie, describeArcDonut } from "./utils.js";
import { colors } from "./colors.js";
import { defaultConfig } from "./config.js";

// Mapper between chart type and some required config properties.
const chartTypeInfo = {
    line: {},
    bar: {
        requiredConfigWithValue: { // Hiermee kun je bepaalde waardes in de config vast zetten bij deze type chart.
            xAxisGridColumns: true
        }
    },
    lineAndBar: {
        requiredConfigWithValue: {
            xAxisGridColumns: true
        }
    },
    pie: {},
    donut: {}
};


class SvgChart {

    static #cssAdded = false;
    static colorPalettes = colors;
    static #activeColorPalette = colors.dutchFieldColorPalette;

    #onLegendClickScoped = null;
    #onLegendKeypressScoped = null;
    #onSerieGroupTransitionendScoped = null;
    #onSerieGroupFocusScoped = null;
    #onSerieGroupBlurScoped = null;
    #onXAxisLabelGroupClickScoped = null;
    #onXAxisLabelGroupKeypressScoped = null;

    /**
     * Set a color palette for all chart instances.
     * @param {Array} colors Array of colors.
     */
    static setActiveColorPalette(colors) {
        SvgChart.#activeColorPalette = colors;
    }

    /**
     * Constructor - create a new chart instance.
     * @param {HTMLElement} parent Parent DOM node the SVG element will be attached to.
     * @param {Object} config Configuration object.
     */
    constructor(parent, config) {

        if (!SvgChart.#cssAdded) {
            SvgChart.#cssAdded = true;
            const cssRules = [
                '.' + prefixed('line-point') + ', g.' + prefixed('legend-group') + ' g, .' + prefixed('x-axis-grid-column-selectable-label') + ' { cursor: pointer; }',
                '.' + prefixed('line-point') + ':hover, circle.' + prefixed('line-point') + ':focus { stroke-width: 6; outline: none; }',
                '#' + prefixed('serie-group') + ' g { transition: opacity 0.6s; }',
                '#' + prefixed('serie-group') + ' g.' + prefixed('unselected') + ' { opacity: 0; }',
                '#' + prefixed('serie-group-current') + ' { transition: opacity 1s; opacity: 1; }',
                '#' + prefixed('serie-group-current') + '.' + prefixed('unattached') + ' { opacity: 0; }',
                'g.' + prefixed('legend-group') + ' g.' + prefixed('unselected') + ' { opacity: 0.4; }',
                'rect.' + prefixed('bar') + ':hover, path.' + prefixed('pie-piece') + ':hover { fill-opacity: 0.7; }',
                'path.' + prefixed('pie-piece') + ':focus, rect.' + prefixed('bar') + ':focus { outline: none; stroke-width:1; stroke:white; fill-opacity:1; }'
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
     * Set the configuration for this chart instance.
     * @param {Object} config Configuration object.
     */
    setConfig(config) {

        this.config = Object.assign({}, defaultConfig, config);
        this.config.padding = Object.assign({}, defaultConfig.padding, this.config.padding);

        this.isLTR = this.config.dir === 'ltr';

        this.config = Object.assign(this.config, chartTypeInfo[this.config.chartType].requiredConfigWithValue);

        if (this.isLTR) {
            this.config.padding.left = this.config.padding.start;
            this.config.padding.right = this.config.padding.end;
        } else {
            this.config.padding.left = this.config.padding.end;
            this.config.padding.right = this.config.padding.start;
        }
        this.svg.setAttribute('direction', this.config.dir);

        // First remove event listener from a previous config if they exist.
        if (this._listenersToRemoveAfterConfigChange && this._listenersToRemoveAfterConfigChange.length) {
            this._listenersToRemoveAfterConfigChange.forEach(function (item) {
                item[0].removeEventListener(item[1], item[2], item[3]);
            });
        }
        this._listenersToRemoveAfterConfigChange = [];

        // And then remove child nodes from a previous config if they exist.
        while (this.svg.childNodes.length) {
            this.svg.firstChild.remove();
        }

        this.data = null;
        this.unselectedSeries = {};

        this.chartWidth = this.width - this.config.padding.start - this.config.padding.end - (this.config.xAxisGridPadding * 2);
        this.chartHeight = this.height - this.config.padding.top - this.config.padding.bottom - (this.config.yAxisGridPadding * 2);

        if (this.config.backgroundColor) {
            this.svg.style.backgroundColor = this.config.backgroundColor;
        }
        this.defsElement = el('defs');
        this.svg.appendChild(this.defsElement);

        if (!this.#onSerieGroupTransitionendScoped) {
            this.#onSerieGroupTransitionendScoped = this.#onSerieGroupTransitionend.bind(this);
        }

        if (this.config.drawBefore) {
            this.drawBeforeGroup = el('g', {
                className: prefixed('draw-before-group')
            });
            this.svg.appendChild(this.drawBeforeGroup);
        }

        if (this.config.title) {
            this.#addTitle();
        }

        if (this.config.legend) {
            this.#addLegend();
        }

        switch (this.config.chartType) {
            case 'line':
            case 'bar':
            case 'lineAndBar':
                {
                    this.lineAndBarSelectedColumnIndex = null;
                    this.lineAndBarValueHeight = this.chartHeight / this.config.maxValue;
                    this.barCountPerColumn = this.config.barStacked ? 1 : 0;

                    if (this.config.yAxis) {
                        this.#addYAxisGrid();
                    }

                    if (this.config.xAxisTitle) {
                        this.#addXAxisTitle();
                    }

                    if (this.config.yAxisTitle) {
                        this.#addYAxisTitle();
                    }

                    if (this.config.xAxisLabels) {
                        this.#addXAxisLabelsGroup();
                    }

                    this.xAxisGroupElement = this.svg.appendChild(el('g', {
                        className: prefixed('x-axis-group')
                    }));
                }
                break;
        }

        this.config.series.forEach(function (serie, serieIndex) {

            if (!this.config.barStacked && (serie.type === 'bar' || this.config.chartType === 'bar')) {
                this.barCountPerColumn += 1;
            }

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
                this.defsElement.appendChild(lg);
            }
        }, this);

        if (this.config.drawBefore) {
            this.config.drawBefore(this, this.drawBeforeGroup);
        }

        this.#addSerieGroup();

        if (this.config.drawAfter) {
            this.drawAfterGroup = el('g', {
                className: prefixed('draw-after-group')
            });
            this.svg.appendChild(this.drawAfterGroup);
        }

    }

    /**
     * Writing the charts.
     * @param {Array} data Data array.
     */
    chart(data = null) {

        if (data !== null) {
            this.data = data;
        }

        const currentSerieGroupElement = this.#dataBefore();

        switch (this.config.chartType) {
            case 'lineAndBar':
            case 'bar':
            case 'line':
                this.#dataLineAndBar(currentSerieGroupElement);
                break;
            case 'pie':
            case 'donut':
                this.#dataPieAndDonut(currentSerieGroupElement);
                break;
        }

        this.#dataAfter(currentSerieGroupElement);

        if (this.config.drawAfter) {
            this.config.drawAfter(this, this.drawAfterGroup);
        }

    }

    setSelectedIndex(index) {
        var textNodes = this.xAxisLabelsGroupElement.querySelectorAll('text.' + prefixed('x-axis-grid-column-selectable-label'));
        return this.#onXAxisLabelGroupSelect(textNodes.item(index));
    }

    /**
     * Saves chart as PNG file.
     * @param {String} filename Filename.
     */
    saveAsPng(filename) {
        var rect = this.svg.getBoundingClientRect();
        var canvas = document.createElement('canvas');
        canvas.setAttribute('width', rect.width);
        canvas.setAttribute('height', rect.height);
        var ctx = canvas.getContext('2d');
        ctx.fillStyle = this.svg.style.backgroundColor;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        var img = new Image();
        var data = '<svg xmlns="http://www.w3.org/2000/svg">' + this.svg.innerHTML + '</svg>';
        console.log(data);
        var parser = new DOMParser();
        var result = parser.parseFromString(data, 'text/xml');
        var inlineSVG = result.getElementsByTagName("svg")[0];
        inlineSVG.setAttribute('width', rect.width);
        inlineSVG.setAttribute('height', rect.height);
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

    #addSerieGroup() {
        this.serieGroupElement = el('g', {
            id: prefixed('serie-group')
        });
        this.svg.appendChild(this.serieGroupElement);
        this.#addEventListener(this.serieGroupElement, 'transitionend', this.#onSerieGroupTransitionendScoped, false);

        if (this.config.showValueOnFocus) {
            if (!this.#onSerieGroupFocusScoped) {
                this.#onSerieGroupFocusScoped = this.#onSerieGroupFocus.bind(this);
                this.#onSerieGroupBlurScoped = this.#onSerieGroupBlur.bind(this);
            }

            this.#addEventListener(this.serieGroupElement, 'focus', this.#onSerieGroupFocusScoped, true);
            this.#addEventListener(this.serieGroupElement, 'blur', this.#onSerieGroupBlurScoped, true);

            this.valueElGroup = el('g', {
                className: prefixed('value-element-group')
            });
            this.valueElRect = el('rect', {
                fill: this.config.focusedValueFill || 'black'
            });
            this.valueElText = el('text', {
                direction: this.config.dir,
                textAnchor: 'middle',
                dominantBaseline: 'middle',
                fontFamily: this.config.fontFamily,
                fontSize: 'smaller',
                fill: this.config.focusedValueColor || 'white'
            }, document.createTextNode(''));
            this.valueElGroup.appendChild(this.valueElRect);
            this.valueElGroup.appendChild(this.valueElText);
        }
    }

    #addLegend() {

        const gLegend = el('g', {
            className: prefixed('legend-group')
        });

        if (this.config.legendSelect) {
            if (!this.#onLegendClickScoped) {
                this.#onLegendClickScoped = this.#onLegendClick.bind(this);
                this.#onLegendKeypressScoped = this.#onLegendKeypress.bind(this);
            }
            this.#addEventListener(gLegend, 'keypress', this.#onLegendKeypressScoped, false);
            this.#addEventListener(gLegend, 'click', this.#onLegendClickScoped, false);
        }

        this.config.series.forEach(function (serie, serieIndex) {

            const gSerie = el('g', {
                dataSerie: serie.id,
                tabindex: this.config.legendSelect ? 0 : null
            });

            let x = 0, y = 0;

            switch (this.config.legendPosition) {
                case 'top':
                    y = this.config.legendTop ? this.config.legendTop : (this.config.padding.top / 2);
                    break;
                case 'bottom':
                    y = this.config.legendBottom ? this.config.legendBottom : (this.height - (this.config.padding.bottom / 2));
                    break;
                case 'end':
                    if (this.isLTR) {
                        x = this.config.padding.start + this.chartWidth + (this.config.xAxisGridPadding * 2) + this.config.paddingNormal;
                        y = this.config.padding.top + this.config.yAxisGridPadding + (serieIndex * this.config.paddingNormal);
                    } else {
                        x = (this.config.xAxisGridPadding * 2) + this.config.padding.end - this.config.paddingNormal - this.config.legendWidth;
                        y = this.config.padding.top + this.config.yAxisGridPadding + (serieIndex * this.config.paddingNormal);
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
                fill: this.#getSerieFill(serie, serieIndex)
            });

            const text = el('text', {
                direction: this.config.dir,
                x: this.isLTR ? (x + (this.config.legendWidth * 2)) : (x - this.config.legendWidth),
                y: y + (this.config.legendWidth / 2) + 1, // + 1 don't know why
                textAnchor: 'start',
                dominantBaseline: 'middle',
                fontFamily: this.config.fontFamily || '',
                fontSize: this.config.legendFontSize || '',
            }, document.createTextNode(serie.title));


            if (this.isLTR) {
                gSerie.appendChild(rect);
                gSerie.appendChild(text);
            } else {
                gSerie.appendChild(text);
                gSerie.appendChild(rect);
            }
            gLegend.appendChild(gSerie);
        }, this);

        this.svg.appendChild(gLegend);

        if (['top', 'bottom'].indexOf(this.config.legendPosition) > -1) {

            // Measure the text so we can place the rects and texts next to each other
            // and center the complete legend row.

            let totalLegendWidth = 0;
            let curX = this.isLTR ? 0 : (this.width - this.config.legendWidth);
            gLegend.querySelectorAll('g').forEach(function (g) {
                const box = g.getBBox();
                g.querySelector('rect').setAttribute('x', curX);
                g.querySelector('text').setAttribute('x', this.isLTR ? (curX + (this.config.legendWidth * 2)) : (curX - 10));
                if (this.isLTR) {
                    curX += (box.width + this.config.paddingNormal);
                } else {
                    curX -= (box.width + this.config.paddingNormal);
                }
                totalLegendWidth += (box.width + this.config.paddingNormal);
            }, this);
            if (this.isLTR) {
                curX -= this.config.paddingNormal;
                gLegend.setAttribute('transform', 'translate(' + ((this.width / 2) - (curX / 2)) + ', 0)');
            } else {
                totalLegendWidth -= this.config.paddingNormal;
                gLegend.setAttribute('transform', 'translate(-' + ((this.width / 2) - (totalLegendWidth / 2)) + ', 0)');
            }

        }

    }

    #addTitle() {

        var x, y, dominantBaseline, textAnchor = null;
        switch (this.config.titleHorizontalPosition) {
            case 'end':
                x = this.width - this.config.paddingNormal;
                textAnchor = this.isLTR ? 'end' : 'start';
                break;
            case 'start':
                x = this.config.paddingNormal;
                textAnchor = this.isLTR ? 'start' : 'end';
                break;
            default:
                x = this.width / 2;
                textAnchor = 'middle';
                break;
        }
        switch (this.config.titleVerticalPosition) {
            case 'center':
                y = this.height / 2;
                dominantBaseline = 'middle';
                break;
            case 'bottom':
                y = this.height - this.config.paddingNormal;
                dominantBaseline = 'auto';
                break;
            default:
                y = this.config.paddingNormal;
                dominantBaseline = 'hanging';
                break;
        }
        this.svg.appendChild(el('text', {
            direction: this.config.dir,
            x: x,
            y: this.config.paddingNormal,
            textAnchor: textAnchor,
            dominantBaseline: dominantBaseline,
            fontFamily: this.config.fontFamily || '',
            fontSize: this.config.titleFontSize || '',
            fill: this.config.titleColor || '',
            className: prefixed('text-title'),
        }, document.createTextNode(this.config.title)));
    }

    /**
     * Main function to visualise data for line or bar chart types.
     * @param {HTMLElement} currentSerieGroupElement The current serie group element
     */
    #dataLineAndBar(currentSerieGroupElement) {

        if (this.xAxisGroupElement.firstChild) {
            this.xAxisGroupElement.removeChild(this.xAxisGroupElement.firstChild);
        }

        if (this.config.xAxisGridColumnsSelectable) {
            if (this.xAxisGridColumnsSelectableGroupElement.firstChild) {
                this.xAxisGridColumnsSelectableGroupElement.firstChild.remove();
            }
        }

        if (this.xAxisLabelsGroupElement.firstChild) {
            this.xAxisLabelsGroupElement.removeChild(this.xAxisLabelsGroupElement.firstChild);
        }

        // Note that for bar charts to display correctly, this.config.xAxisGridColumns MUST be true!
        const columnWidth = this.config.xAxisGridColumns
            ? (this.chartWidth / (this.data.xAxis.columns.length))
            : (this.chartWidth / (this.data.xAxis.columns.length - 1));
        const barWidth = (columnWidth - (this.config.barSpacing * (this.barCountPerColumn + 1))) / (this.barCountPerColumn || 1);

        // Make this available on the instance.
        this.columnWidth = columnWidth;
        this.barWidth = barWidth;

        this.#addXAxisLabels(columnWidth);

        var currentBarIndex = 0;
        var stackedBarValues = []; // value index => current value (steeds optellen)

        this.config.series.forEach(function (serie, serieIndex) {

            var serieGroup = el('g', {
                dataSerie: serie.id,
                className: this.unselectedSeries[serie.id] ? prefixed('unselected') : ''
            });

            var serieType = serie.type || (this.config.chartType === 'lineAndBar' ? 'line' : this.config.chartType);

            switch (serieType) {
                case 'line':
                    {
                        var nonNullPoints = [[]]; // Array of arrays, each array consists only of NON NULL points, used for smoot lines when not connecting NULL values and for filled lines charts when not connecting null points
                        var flatNonNullPoints = [];

                        directionForEach(this, this.data.series[serie.id], this.isLTR, function (value, valueIndex, values) {
                            var x = this.config.padding.left + this.config.xAxisGridPadding + (valueIndex * columnWidth) + (this.config.xAxisGridColumns ? (columnWidth / 2) : 0);
                            var y = this.config.padding.top + this.config.yAxisGridPadding + this.chartHeight - (value * this.lineAndBarValueHeight);

                            if (value === null) {
                                if (nonNullPoints[nonNullPoints.length - 1].length > 0 && valueIndex + 1 < values.length) {
                                    nonNullPoints.push([]);
                                }
                            } else {
                                nonNullPoints[nonNullPoints.length - 1].push({ x: x, y: y, value: value });
                                flatNonNullPoints.push({ x: x, y: y, value: value });
                            }
                        });

                        var paths = [];

                        if (this.config.connectNullValues) {

                            // Loop through flatNonNullPoints

                            let path = this.config.lineCurved ? this.#getCurvedPathFromPoints(flatNonNullPoints) : this.#getStraightPathFromPoints(flatNonNullPoints);
                            if (path.length > 0) {
                                paths.push(path);
                            }

                        } else {

                            // Loop through nonNullPoints

                            nonNullPoints.forEach(function (currentNonNullPoints) {
                                if (currentNonNullPoints.length > 0) {
                                    let path = this.config.lineCurved ? this.#getCurvedPathFromPoints(currentNonNullPoints) : this.#getStraightPathFromPoints(currentNonNullPoints);
                                    if (path.length > 0) {
                                        paths.push(path);
                                    }
                                }
                            }, this);

                        }

                        paths.forEach(function (path) {
                            serieGroup.appendChild(el('path', {
                                d: path.join(' '),
                                fill: this.config.lineChartFilled ? this.#getSerieFill(serie, serieIndex) : 'none',
                                fillOpacity: 0.4,
                                stroke: this.#getSerieStrokeColor(serie, serieIndex),
                                strokeWidth: this.config.lineWidth || '',
                                className: prefixed('line')
                            }));
                        }, this);

                        if (this.config.points) {
                            flatNonNullPoints.forEach(function (point) {
                                serieGroup.appendChild(el('circle', {
                                    cx: point.x,
                                    cy: point.y,
                                    r: this.config.pointRadius,
                                    zIndex: 1,
                                    fill: this.#getSeriePointColor(serie, serieIndex),
                                    stroke: this.#getSeriePointColor(serie, serieIndex),
                                    dataValue: point.value,
                                    className: prefixed('line-point'),
                                    tabindex: this.config.showValueOnFocus ? 0 : null
                                }));
                            }, this);
                        }
                    }
                    break;
                case 'bar':
                    {
                        directionForEach(this, this.data.series[serie.id], this.isLTR, function (value, valueIndex) {

                            var x = null;
                            var y = null;
                            var height = null;
                            if (this.config.barStacked) {
                                if (!stackedBarValues[valueIndex]) stackedBarValues[valueIndex] = this.config.minValue;
                                x = this.config.padding.left + this.config.xAxisGridPadding + (valueIndex * columnWidth) + this.config.barSpacing;
                                y = this.config.padding.top + this.config.yAxisGridPadding + this.chartHeight - (value * this.lineAndBarValueHeight) - (stackedBarValues[valueIndex] * this.lineAndBarValueHeight);
                                height = this.config.padding.top + this.config.yAxisGridPadding + this.chartHeight - (value * this.lineAndBarValueHeight);
                                stackedBarValues[valueIndex] = stackedBarValues[valueIndex] += value;
                            } else {
                                x = this.config.padding.left + this.config.xAxisGridPadding + (valueIndex * columnWidth) + (barWidth * currentBarIndex) + (this.config.barSpacing * (currentBarIndex + 1));
                                height = y = this.config.padding.top + this.config.yAxisGridPadding + this.chartHeight - (value * this.lineAndBarValueHeight);
                            }

                            serieGroup.appendChild(el('rect', {
                                x: x,
                                y: y,
                                width: barWidth,
                                height: this.chartHeight + this.config.padding.top + this.config.yAxisGridPadding - height,
                                fill: this.#getSerieFill(serie, serieIndex),
                                className: prefixed('bar'),
                                fillOpacity: this.config.barFillOpacity || '',
                                strokeWidth: this.config.barStrokeWidth || 0,
                                stroke: this.#getSerieStrokeColor(serie, serieIndex),
                                dataValue: value,
                                tabindex: this.config.showValueOnFocus ? 0 : null
                            }));

                        });

                        currentBarIndex += 1;

                    }
                    break;
            }

            currentSerieGroupElement.appendChild(serieGroup);
        }, this);
    }

    /**
     * Things we need to do for all chart types before we start visualise the data.
     * @returns {HTMLElement} The current serie group element.
     */
    #dataBefore() {
        if (this.serieGroupElement.firstChild) {
            this.serieGroupElement.firstChild.remove();
        }
        var currentSerieGroupElement = el('g', {
            id: prefixed('serie-group-current'),
            className: this.config.transition ? prefixed('unattached') : ''
        });
        return currentSerieGroupElement;
    }

    /**
     * Things we need to do for all chart types after we visualised the data.
     * @param {HTMLElement} currentSerieGroupElement The current serie group element we got from #dataBefore().
     */
    #dataAfter(currentSerieGroupElement) {
        this.serieGroupElement.appendChild(currentSerieGroupElement).getBoundingClientRect(); // getBoundingClientRect causes a reflow, so we don't have to use setTimeout to remove the class.
        if (this.config.transition) {
            currentSerieGroupElement.classList.remove(prefixed('unattached'));
        }
    }

    /**
     * Main function to visualise data for pie or donut chart types.
     * @param {HTMLElement} currentSerieGroupElement The current serie group element
     */
    #dataPieAndDonut(currentSerieGroupElement) {

        var radius = this.chartHeight / 2;
        var centerX = this.width / 2;
        var centerY = this.chartHeight / 2 + this.config.padding.top;

        var total = 0;
        for (let key in this.data.series) {
            total += this.data.series[key];
        }

        var totalToDegree = 360 / total;
        var currentTotal = 0;

        this.config.series.forEach(function (serie, serieIndex) {
            var serieGroup = el('g', {
                dataSerie: serie.id,
                className: this.unselectedSeries[serie.id] ? prefixed('unselected') : ''
            });

            const value = this.data.series[serie.id];

            var startAngle = currentTotal * totalToDegree;
            currentTotal += value;
            var endAngle = currentTotal * totalToDegree;
            var path = this.config.chartType === 'pie' ? describeArcPie(centerX, centerY, radius, startAngle, endAngle) : describeArcDonut(centerX, centerY, radius - 40, 40, startAngle, endAngle);
            serieGroup.appendChild(el('path', {
                d: path.join(' '),
                fill: this.#getSerieFill(serie, serieIndex),
                fillOpacity: this.config.pieFillOpacity || 1,
                className: prefixed('pie-piece'),
                tabindex: 0,
                dataValue: value
            }));

            currentSerieGroupElement.appendChild(serieGroup);

        }, this);

    }

    #addXAxisLabels(columnWidth) {
        // Draw xAxis lines
        var currentXAxisGroupElement = el('g');

        var currentXAxisLabelsGroupElement = el('g', {
            className: prefixed('x-axis-label-group-current')
        });

        var currentXAxisGridColumnsSelectableGroupElement = (this.config.xAxisGridColumnsSelectable) ? el('g') : null;
        directionForEach(this, this.data.xAxis.columns, this.isLTR, function (colValue, colIndex) {
            if (this.config.xAxisGrid) {
                const x = this.config.padding.left + this.config.xAxisGridPadding + (colIndex * columnWidth);
                if (colIndex === 0 || ((colIndex + 0) % this.config.xAxisStep === 0)) {
                    this.#addXAxisLine(currentXAxisGroupElement, x);
                }
                if (this.config.xAxisGridColumnsSelectable) {
                    currentXAxisGridColumnsSelectableGroupElement.appendChild(el('rect', {
                        x: x,
                        y: this.config.padding.top + this.config.yAxisGridPadding,
                        width: columnWidth,
                        height: this.chartHeight,
                        className: prefixed('x-axis-grid-column-selectable'),
                        fillOpacity: 0,
                        fill: this.config.xAxisGridColumnsSelectableColor
                    }));
                }
            }
            if (this.config.xAxisLabels && ((colIndex + 0) % this.config.xAxisLabelStep === 0)) {
                var xlg = el('g', {
                    transform: `translate(${this.config.padding.left + this.config.xAxisGridPadding + (colIndex * columnWidth) + (this.config.xAxisGridColumns ? (columnWidth / 2) : 0)} ${this.chartHeight + this.config.padding.top + (this.config.yAxisGridPadding * 2) + (this.config.xAxisLabelTop || 10)})`
                });
                xlg.appendChild(el('text', {
                    direction: this.config.dir,
                    textAnchor: this.config.textAnchorXAxisLabels || 'middle',
                    dominantBaseline: 'hanging',
                    fontFamily: this.config.fontFamily || '',
                    fontSize: this.config.axisLabelFontSize || '',
                    fontWeight: 'normal',
                    fill: this.config.xAxisLabelColor || '',
                    tabindex: this.config.xAxisGridColumnsSelectable ? 0 : null,
                    className: prefixed('x-axis-label') + ' ' + (this.config.xAxisGridColumnsSelectable ? prefixed('x-axis-grid-column-selectable-label') : ''),
                    transform: this.config.xAxisLabelRotation ? `rotate(${this.config.xAxisLabelRotation})` : ''
                }, document.createTextNode(colValue)));
                currentXAxisLabelsGroupElement.appendChild(xlg);
            }
        });
        if (this.config.xAxisGrid && this.config.xAxisGridColumns) {
            this.#addXAxisLine(currentXAxisGroupElement, this.config.padding.left + this.config.xAxisGridPadding + (this.data.xAxis.columns.length * columnWidth));
        }
        this.xAxisGroupElement.appendChild(currentXAxisGroupElement);
        this.config.xAxisGridColumnsSelectable && this.xAxisGridColumnsSelectableGroupElement.appendChild(currentXAxisGridColumnsSelectableGroupElement);
        this.xAxisLabelsGroupElement.appendChild(currentXAxisLabelsGroupElement);
    }


    /**
     * Adds group for x axis labels.
     */
    #addXAxisLabelsGroup() {
        this.xAxisLabelsGroupElement = el('g', {
            className: prefixed('x-axis-label-group')
        });
        if (this.config.xAxisGridColumnsSelectable) {
            if (!this.#onXAxisLabelGroupClickScoped) {
                this.#onXAxisLabelGroupClickScoped = this.#onXAxisLabelGroupClick.bind(this);
                this.#onXAxisLabelGroupKeypressScoped = this.#onXAxisLabelGroupKeypress.bind(this);
            }
            this.#addEventListener(this.xAxisLabelsGroupElement, 'click', this.#onXAxisLabelGroupClickScoped, false);
            this.#addEventListener(this.xAxisLabelsGroupElement, 'keypress', this.#onXAxisLabelGroupKeypressScoped, false);
            // Group element that wraps the rects that indicates a selected column for line and bar charts.
            this.xAxisGridColumnsSelectableGroupElement = this.svg.appendChild(el('g', {
                className: prefixed('x-axis-columns-selectable-group')
            }));
        }
        this.svg.appendChild(this.xAxisLabelsGroupElement);
    }

    /**
     * Adds x axis title.
     */
    #addYAxisTitle() {
        var yAxisTitleG = el('g');
        // By default: x is 20 pixels from start border
        var x = 0;
        if (this.isLTR) {
            x = this.config.yAxisTitleStart ? this.config.yAxisTitleStart : this.config.paddingNormal;
        } else {
            x = this.config.yAxisTitleStart ? (this.width - this.config.yAxisTitleStart) : (this.width - this.config.paddingNormal);
        }
        yAxisTitleG.setAttribute('transform', 'translate(' + x + ', ' + (this.config.padding.top + this.config.yAxisGridPadding) + ')');
        var yAxisTitleEl = el('text', {
            direction: this.config.dir,
            textAnchor: 'end',
            dominantBaseline: 'hanging',
            fontFamily: this.config.fontFamily || '',
            fontSize: this.config.axisTitleFontSize || '',
            fill: this.config.yAxisTitleColor || '',
            className: prefixed('text-y-axis-title')
        }, document.createTextNode(this.config.yAxisTitle));
        yAxisTitleEl.setAttribute('transform', this.isLTR ? 'rotate(-90)' : 'rotate(90)');
        yAxisTitleG.appendChild(yAxisTitleEl);
        this.svg.appendChild(yAxisTitleG);
    }

    #addXAxisTitle() {
        var x = this.isLTR ? (this.width - this.config.padding.right - this.config.xAxisGridPadding) : (this.config.padding.left);
        this.svg.appendChild(el('text', {
            direction: this.config.dir,
            x: x,
            y: this.height - (this.config.xAxisTitleBottom != null ? this.config.xAxisTitleBottom : this.config.paddingNormal),
            textAnchor: 'end',
            dominantBaseline: 'auto',
            fontFamily: this.config.fontFamily || '',
            fontSize: this.config.axisTitleFontSize || '',
            fill: this.config.xAxisTitleColor || '',
            className: prefixed('text-x-axis-title')
        }, document.createTextNode(this.config.xAxisTitle)));
    }

    #addYAxisGrid() {
        var gYAxis = el('g', {
            className: prefixed('y-axis-group')
        });
        var currentYAxisValue = this.config.minValue;
        var currentYAxisLabelValue = this.config.minValue;
        while (currentYAxisValue <= this.config.maxValue || currentYAxisLabelValue <= this.config.maxValue) {
            if (this.config.yAxisGrid && currentYAxisValue <= this.config.maxValue) {
                let y = this.config.padding.top + this.config.yAxisGridPadding + this.chartHeight - (currentYAxisValue * this.lineAndBarValueHeight);
                gYAxis.appendChild(el('line', {
                    x1: this.config.padding.left,
                    y1: y,
                    x2: this.config.padding.left + this.chartWidth + (this.config.xAxisGridPadding * 2),
                    y2: y,
                    className: prefixed('y-axis-grid-line'),
                    stroke: this.config.yAxisGridLineColor || '',
                    strokeWidth: this.config.yAxisGridLineWidth || '',
                    strokeDasharray: this.config.yAxisGridLineDashArray || '',
                }));
            }
            currentYAxisValue += this.config.yAxisStep;
            if (this.config.yAxisLabels && currentYAxisLabelValue <= this.config.maxValue) {
                let y = this.config.padding.top + this.config.yAxisGridPadding + this.chartHeight - (currentYAxisLabelValue * this.lineAndBarValueHeight);
                gYAxis.appendChild(el('text', {
                    direction: this.config.dir,
                    x: this.isLTR ? (this.config.padding.left - 10) : (this.config.padding.left + this.chartWidth + 10),
                    y: y,
                    textAnchor: 'end',
                    dominantBaseline: 'middle',
                    fontFamily: this.config.fontFamily || '',
                    fontSize: this.config.axisLabelFontSize || '',
                    className: prefixed('y-axis-label'),
                    fill: this.config.yAxisLabelColor || ''
                }, document.createTextNode(currentYAxisLabelValue)));
            }
            currentYAxisLabelValue += this.config.yAxisLabelStep;
        }
        this.svg.appendChild(gYAxis);
    }

    #addXAxisLine(parent, x) {
        parent.appendChild(el('line', {
            x1: x,
            y1: this.config.padding.top,
            x2: x,
            y2: this.chartHeight + this.config.padding.top + (this.config.yAxisGridPadding * 2),
            className: prefixed('x-axis-grid-line'),
            stroke: this.config.xAxisGridLineColor || '',
            strokeWidth: this.config.xAxisGridLineWidth || '',
            strokeDasharray: this.config.xAxisGridLineDashArray || '',
        }));
    }

    /**
     * Helper function to get a curved path from an array of points.
     * @param {Array} points Array of points.
     * @returns Array of curved path coordinates.
     */
    #getCurvedPathFromPoints(points) {
        let path = ['M ' + points[0].x + ' ' + points[0].y];
        for (var i = 0; i < points.length - 1; i++) {
            var x_mid = (points[i].x + points[i + 1].x) / 2;
            var y_mid = (points[i].y + points[i + 1].y) / 2;
            var cp_x1 = (x_mid + points[i].x) / 2;
            var cp_x2 = (x_mid + points[i + 1].x) / 2;
            path.push(`Q ${cp_x1} ${points[i].y}, ${x_mid} ${y_mid}`);
            path.push(`Q ${cp_x2} ${points[i + 1].y} ${points[i + 1].x} ${points[i + 1].y}`);
        }
        this.#closePath(path, points);
        return path;
    }

    /**
     * Closes path for filled line charts.
     * @param {Array} path Array of path coordinates
     * @param {Array} points Array of points
     */
    #closePath(path, points) {
        if (this.config.lineChartFilled && points.length > 1) {
            path.push(`L ${points[points.length - 1].x} ${this.config.padding.top + this.config.yAxisGridPadding + this.chartHeight}`);
            path.push(`L ${points[0].x} ${this.config.padding.top + this.config.yAxisGridPadding + this.chartHeight}`);
            path.push(`L ${points[0].x} ${points[0].y}`);
            path.push('Z');
        }
    }

    /**
     * Helper function to get a straight path for line charts.
     * @param {Array} points Array of points.
     * @returns Array of path coordinates.
     */
    #getStraightPathFromPoints(points) {
        let path = [];
        points.forEach(function (point, pointIndex) {
            if (pointIndex === 0) {
                path.push(`M ${point.x} ${point.y}`);
            } else {
                path.push(`L ${point.x} ${point.y}`);
            }
        });
        this.#closePath(path, points);
        return path;
    }



    #getSeriePropertyColor(props, serie, serieIndex) {
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

    #getSeriePointColor(serie, serieIndex) {
        return this.#getSeriePropertyColor(['pointColor', 'strokeColor'], serie, serieIndex);
    }

    #getSerieStrokeColor(serie, serieIndex) {
        return this.#getSeriePropertyColor(['strokeColor'], serie, serieIndex);
    }

    #getSerieFill(serie, serieIndex) {
        return this.#getSeriePropertyColor(['fillGradient'], serie, serieIndex);
    }

    /**
     * Adds an event listener to a node and adds it to the _listenersToRemoveAfterConfigChange array as well, so we can remove them in one place.
     * @param {Node} node Node to add the listener to.
     * @param {String} eventName Name of event.
     * @param {Function} callback Function that needs to be executed.
     * @param {Boolean} capture Capture or not.
     */
    #addEventListener(node, eventName, callback, capture) {
        node.addEventListener(eventName, callback, capture);
        this._listenersToRemoveAfterConfigChange.push([node, eventName, callback, capture]);
    }


    /**
     * When legend gets toggled (selected / deselected).
     * @param {Node} target Legend node that gets toggled.
     */
    #onLegendToggle(target) {
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
    #onLegendKeypress(e) {
        if (e.keyCode === 13) {
            this.#onLegendToggle(e.target);
        }
    }

    /**
     * When a focussed legend node is clicked.
     * @param {Event} e Event object.
     */
    #onLegendClick(e) {
        this.#onLegendToggle(e.target);
    }

    /**
     * When the tranisiton of a serie group has ended.
     * @param {Event} e Event object.
     */
    #onSerieGroupTransitionend(e) {
        // Currently only used to add display none to it when this serie group is unselected.
        // We have to add display none, so this node doesn't make part of the UI anymore and cannot hide other nodes.
        if (e.target.classList.contains(prefixed('unselected'))) {
            e.target.setAttribute('display', 'none');
        }
    }

    /**
     * When a serie group node is blurred (this means loses focus).
     * @param {Event} e Event object.
     */
    #onSerieGroupBlur(e) {
        var circle = e.target;
        var g = parent(circle, 'g');
        var serie = g.dataset.serie;
        if (serie) {
            // Remove the current value element.
            this.serieGroupElement.removeChild(this.valueElGroup);
        }
    }

    /**
     * When a serie group node gets focussed.
     * @param {Event} e Event object.
     */
    #onSerieGroupFocus(e) {
        var circle = e.target;
        var g = parent(circle, 'g');
        var serie = g.dataset.serie;
        if (serie) {
            var serieItem = this.config.series.find((item) => item.id === serie);
            this.valueElText.replaceChild(document.createTextNode(serieItem.title + ': ' + circle.dataset.value), this.valueElText.firstChild);
            this.serieGroupElement.appendChild(this.valueElGroup);
            var box = this.valueElText.getBBox();
            var width = box.width + (this.config.focusedValuePadding * 2);
            var height = box.height + (this.config.focusedValuePadding * 2);
            this.valueElRect.setAttribute('width', width);
            this.valueElRect.setAttribute('height', height);
            this.valueElText.setAttribute('x', width / 2);
            this.valueElText.setAttribute('y', height / 2);

            var type = serieItem.type || this.config.chartType;
            var x, y = null;
            switch (type) {
                case 'line':
                case 'bar':
                case 'lineAndBar':
                    x = (circle.getAttribute('cx') || (parseFloat(circle.getAttribute('x')) + (circle.getAttribute('width') / 2))) - (width / 2);
                    y = (circle.getAttribute('cy') || circle.getAttribute('y')) - 10 - height;
                    break;
                case 'pie':
                case 'donut':
                    var d = circle.getAttribute('d').split(' ');
                    x = d[1].trim();
                    y = d[2].trim();
                    break;
            }
            this.valueElGroup.setAttribute('transform', 'translate(' + x + ', ' + y + ')');
        }
    }

    /**
     * When a label on the x axis receives a keypress when focussed.
     * @param {Event} e Event object.
     */
    #onXAxisLabelGroupKeypress(e) {
        if (e.keyCode === 13) {
            this.#onXAxisLabelGroupSelect(e.target);
        }
    }

    /**
     * When a label on the x axis receives a click when focussed.
     * @param {Event} e Event object.
     */
    #onXAxisLabelGroupClick(e) {
        this.#onXAxisLabelGroupSelect(e.target);
    }

    /**
     * Display the selected column indicator and fires the onXAxisLabelGroupSelect callback (if defined).
     * @param {HTMLElement} label Node (x axis label) that is selected.
     */
    #onXAxisLabelGroupSelect(label) {
        var textNodes = this.xAxisLabelsGroupElement.querySelectorAll('text.' + prefixed('x-axis-grid-column-selectable-label'));
        var rects = this.xAxisGridColumnsSelectableGroupElement.querySelectorAll('rect.' + prefixed('x-axis-grid-column-selectable'));
        for (var i = 0; i < textNodes.length; i++) {
            if (textNodes[i] === label) {
                this.lineAndBarSelectedColumnIndex = i;
                textNodes[i].classList.add(prefixed('selected'));
                textNodes[i].setAttribute('font-weight', 'bold');
                rects[i].classList.add(prefixed('selected'));
                rects[i].setAttribute('fill-opacity', 0.2);
                if (this.config.onXAxisLabelGroupSelect) {
                    this.config.onXAxisLabelGroupSelect(this, this.lineAndBarSelectedColumnIndex);
                }
            } else {
                textNodes[i].classList.remove(prefixed('selected'));
                rects[i].classList.remove(prefixed('selected'));
                rects[i].setAttribute('fill-opacity', 0);
                textNodes[i].setAttribute('font-weight', 'normal');
            }
        }
    }

}

// Add el function to chart instance, so we can use it in the calling function, for example
// to use it in the drawBefore or drawAfter callbacks.
SvgChart.prototype.el = el;

export { SvgChart };
