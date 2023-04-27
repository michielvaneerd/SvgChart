(function () {

    // Note: private members should be commented with //, public members with jsdoc.

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Private constants
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    /**
     * Default constant values.
     * @constant
     * @private
     * @memberof SvgChart
     * @type {object}
     * @default
     */
    const defaultConstants = {
        paddingStart: 40,
        paddingEnd: 20,
        paddingTop: 100,
        paddingBottom: 40,
        paddingNormal: 20,
        legendWidth: 10,
        // Padding of the currently focussed value element
        focusedValuePadding: 6
    };

    /**
     * String we use to prefix all class names and ID names.
     */
    const classNamePrefix = 'svg-chart-';

    /**
     * Mapper between chartType and config functions (functions that we need to execute once for each config) for each phase (before, after, serie).
     */
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

    /**
     * SVG namespace.
     */
    const ns = 'http://www.w3.org/2000/svg';

    /**
     * Regex we use to convert from dash to camelcase.
     */
    const attributesCamelCaseToDashRegex = /[A-Z]/g;

    /**
     * Some color palettes.
     */
    const dutchFieldColorPalette = ["#e60049", "#0bb4ff", "#50e991", "#e6d800", "#9b19f5", "#ffa300", "#dc0ab4", "#b3d4ff", "#00bfa0"];
    const retroMetroColorPalette = ["#ea5545", "#f46a9b", "#ef9b20", "#edbf33", "#ede15b", "#bdcf32", "#87bc45", "#27aeef", "#b33dc6"];
    const riverNightsColorPalette = ["#b30000", "#7c1158", "#4421af", "#1a53ff", "#0d88e6", "#00b7c7", "#5ad45a", "#8be04e", "#ebdc78"];
    const springPastelsColorPalette = ["#fd7f6f", "#7eb0d5", "#b2e061", "#bd7ebe", "#ffb55a", "#ffee65", "#beb9db", "#fdcce5", "#8bd3c7"];

    /**
     * Our default color palette.
     */
    const defaultColorPalette = dutchFieldColorPalette;

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Public main functions
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    class SvgChart {

        static #cssAdded = false;

        #onLegendClickScoped = null;
        #onLegendKeypressScoped = null;
        #onSerieGroupTransitionendScoped = null;
        #onSerieGroupFocusScoped = null;
        #onSerieGroupBlurScoped = null;
        #onXAxisLabelGroupClickScoped = null;
        #onXAxisLabelGroupKeypressScoped = null;

        static defaultConfig = {

            dir: 'ltr',

            chartType: null,

            padding: {
                start: defaultConstants.paddingStart,
                end: defaultConstants.paddingEnd,
                top: defaultConstants.paddingTop,
                bottom: defaultConstants.paddingBottom
            },

            transition: true,

            backgroundColor: 'white',

            fontFamily: 'sans-serif',

            titleFontSize: 'normal',

            titleColor: 'black',

            titleHorizontalPosition: 'center', // center (default), start, end

            titleVerticalPosition: 'top', // top (default), bottom, center

            showValueOnFocus: true,
            focusedValueFill: 'black',
            focusedValueColor: 'white',

            // ???
            maxValue: null,
            minValue: null,

            // Axis
            axisTitleFontSize: 'smaller',
            axisLabelFontSize: 'small',

            // X axis
            xAxisTitle: null,
            xAxisTitleBottom: null, // if this is <> null, then this will be the X start position of the 
            xAxisGridLineWidth: 1,
            xAxisGridLineColor: '#C0C0C0',
            xAxisGridLineDashArray: '1,1',
            xAxisLabelColor: '#A0A0A0',
            xAxisTitleColor: '#A0A0A0',
            xAxisGrid: true,
            xAxisGridPadding: 0,
            xAxisLabels: true,
            xAxisGridColumns: false, // we have now columns we can select / deselect instead of just x axis lines, so it is similar to bar charts, also good if you use bar charts in teh same chart!
            xAxisGridColumnsSelectable: false,
            xAxisGridColumnsSelectableColor: 'black',
            textAnchorXAxisLabels: 'middle', // If you want X axis labels that are vertical (xAxisLabelRotation = 90), then this should be 'start' if you want them aligned to the x axis.
            xAxisLabelTop: 10,
            xAxisLabelRotation: null,
            xAxisStep: 1, // how many steps between x axis grid lines
            xAxisLabelStep: 1, // how many steps between labels x axis

            // Y axis
            yAxisTitle: null,
            yAxisTitleStart: null, // if this is <> null, then this will be the X start position of the Y axis title.
            yAxisGridLineWidth: 1,
            yAxisGridLineColor: '#C0C0C0',
            yAxisGridLineDashArray: '1,1',
            yAxisLabelColor: '#A0A0A0',
            yAxisTitleColor: '#A0A0A0',
            yAxisStep: 10, // how many steps between y axis grid lines
            yAxisLabelStep: 10, // how many steps between labels y axis
            yAxis: true,
            yAxisGrid: true,
            yAxisLabels: true,
            yAxisGridPadding: 0,

            // Legend
            legendFontSize: 'smaller',
            legendCircle: false,
            legend: true,
            legendSelect: true,
            legendPosition: 'bottom', // end,  bottom, top , NOTE no start!
            legendBottom: null,
            legendTop: null, // top position, if null, default position for legendPosition is used.

            // Line charts
            lineWidth: 2,
            pointRadius: 2,
            connectNullValues: false,
            lineCurved: true,
            lineChartFilled: false,
            points: true,

            // Bar charts
            barFillOpacity: 0.5,
            barSpacing: 4,
            barStrokeWidth: 1,
            barStacked: false,

            // Pie and donut
            pieFillOpacity: 0.6,
        };

        constructor(parent, config) {

            if (!SvgChart.#cssAdded) {
                SvgChart.#cssAdded = true;
                addCss();
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

        setConfig(config) {

            this.config = Object.assign({}, SvgChart.defaultConfig, config);
            this.config.padding = Object.assign({}, SvgChart.defaultConfig.padding, this.config.padding);

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

        chart(data = null) {

            if (data !== null) {
                this.data = data;
            }

            switch (this.config.chartType) {
                case 'lineAndBar':
                case 'bar':
                case 'line':
                    this.#dataLineAndBar();
                    break;
                case 'pie':
                case 'donut':
                    this.#dataPieAndDonut();
                    break;
            }

            if (this.config.drawAfter) {
                this.config.drawAfter(this, this.drawAfterGroup);
            }

        }

        setSelectedIndex(index) {
            var textNodes = this.xAxisLabelsGroupElement.querySelectorAll('text.' + prefixed('x-axis-grid-column-selectable-label'));
            return this.#onXAxisLabelGroupSelect(textNodes.item(index));
        }

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
                            x = this.config.padding.start + this.chartWidth + (this.config.xAxisGridPadding * 2) + defaultConstants.paddingNormal;
                            y = this.config.padding.top + this.config.yAxisGridPadding + (serieIndex * defaultConstants.paddingNormal);
                        } else {
                            x = (this.config.xAxisGridPadding * 2) + this.config.padding.end - defaultConstants.paddingNormal - defaultConstants.legendWidth;
                            y = this.config.padding.top + this.config.yAxisGridPadding + (serieIndex * defaultConstants.paddingNormal);
                        }
                        break;
                }

                const rect = el('rect', {
                    x: x,
                    y: y,
                    rx: this.config.legendCircle ? defaultConstants.legendWidth : 0,
                    ry: this.config.legendCircle ? defaultConstants.legendWidth : 0,
                    width: defaultConstants.legendWidth,
                    height: defaultConstants.legendWidth,
                    fill: getSerieFill.call(this, serie, serieIndex),
                    // stroke: getSerieStrokeColor.call(this, serie, serieIndex),
                    // strokeWidth: 1
                });

                const text = el('text', {
                    direction: this.config.dir,
                    x: this.isLTR ? (x + (defaultConstants.legendWidth * 2)) : (x - defaultConstants.legendWidth),
                    y: y + (defaultConstants.legendWidth / 2) + 1, // + 1 don't know why
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
                let curX = this.isLTR ? 0 : (this.width - defaultConstants.legendWidth);
                gLegend.querySelectorAll('g').forEach(function (g) {
                    const box = g.getBBox();
                    g.querySelector('rect').setAttribute('x', curX);
                    g.querySelector('text').setAttribute('x', this.isLTR ? (curX + (defaultConstants.legendWidth * 2)) : (curX - 10));
                    if (this.isLTR) {
                        curX += (box.width + defaultConstants.paddingNormal);
                    } else {
                        curX -= (box.width + defaultConstants.paddingNormal);
                    }
                    totalLegendWidth += (box.width + defaultConstants.paddingNormal);
                }, this);
                if (this.isLTR) {
                    curX -= defaultConstants.paddingNormal;
                    gLegend.setAttribute('transform', 'translate(' + ((this.width / 2) - (curX / 2)) + ', 0)');
                } else {
                    totalLegendWidth -= defaultConstants.paddingNormal;
                    gLegend.setAttribute('transform', 'translate(-' + ((this.width / 2) - (totalLegendWidth / 2)) + ', 0)');
                }

            }

        }

        /**
     * Adds title.
     */
        #addTitle() {

            var x, y, dominantBaseline, textAnchor = null;
            switch (this.config.titleHorizontalPosition) {
                case 'end':
                    x = this.width - defaultConstants.paddingNormal;
                    textAnchor = this.isLTR ? 'end' : 'start';
                    break;
                case 'start':
                    x = defaultConstants.paddingNormal;
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
                    y = this.height - defaultConstants.paddingNormal;
                    dominantBaseline = 'auto';
                    break;
                default:
                    y = defaultConstants.paddingNormal;
                    dominantBaseline = 'hanging';
                    break;
            }
            this.svg.appendChild(el('text', {
                direction: this.config.dir,
                x: x,
                y: defaultConstants.paddingNormal,
                textAnchor: textAnchor,
                dominantBaseline: dominantBaseline,
                fontFamily: this.config.fontFamily || '',
                fontSize: this.config.titleFontSize || '',
                fill: this.config.titleColor || '',
                className: prefixed('text-title'),
            }, document.createTextNode(this.config.title)));
        }

        /**
     * Main function to draw line and bar charts
     */
        #dataLineAndBar() {
            if (this.xAxisGroupElement.firstChild) {
                this.xAxisGroupElement.removeChild(this.xAxisGroupElement.firstChild);
            }

            if (this.serieGroupElement.firstChild) {
                this.serieGroupElement.removeChild(this.serieGroupElement.firstChild);
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
            // Somehow make this available in drawBefore...
            //this.columnWidth = columnWidth;
            //this.barWidth = barWidth;

            this.#addXAxisLabels(columnWidth);

            var currentSerieGroupElement = el('g', {
                id: prefixed('serie-group-current'),
                className: this.config.transition ? prefixed('unattached') : ''
            });

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

                            dirForEach(this, this.data.series[serie.id], this.config.dir, function (value, valueIndex, values) {
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
                                    fill: this.config.lineChartFilled ? getSerieFill.call(this, serie, serieIndex) : 'none',
                                    fillOpacity: 0.4,
                                    //stroke: (serie.color || defaultColorPalette[serieIndex]),
                                    stroke: getSerieStrokeColor.call(this, serie, serieIndex),
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
                                        fill: getSeriePointColor.call(this, serie, serieIndex),
                                        stroke: getSeriePointColor.call(this, serie, serieIndex),
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
                            dirForEach(this, this.data.series[serie.id], this.config.dir, function (value, valueIndex) {

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
                                    fill: getSerieFill.call(this, serie, serieIndex),
                                    className: prefixed('bar'),
                                    fillOpacity: this.config.barFillOpacity || '',
                                    strokeWidth: this.config.barStrokeWidth || 0,
                                    stroke: getSerieStrokeColor.call(this, serie, serieIndex),
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
            this.serieGroupElement.appendChild(currentSerieGroupElement).getBoundingClientRect(); // getBoundingClientRect causes a reflow, so we don't have to use setTimeout to remove the class.
            if (this.config.transition) {
                currentSerieGroupElement.classList.remove(prefixed('unattached'));
            }
        }

        /**
     * Main function to draw pie and donut charts.
     */
        #dataPieAndDonut() {

            var radius = this.chartHeight / 2;
            var centerX = this.width / 2;
            var centerY = this.chartHeight / 2 + this.config.padding.top;

            if (this.serieGroupElement.firstChild) {
                this.serieGroupElement.firstChild.remove();
            }

            var currentSerieGroupElement = el('g', {
                id: prefixed('serie-group-current'),
                className: this.config.transition ? prefixed('unattached') : ''
            });

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
                    fill: getSerieFill.call(this, serie, serieIndex),
                    fillOpacity: this.config.pieFillOpacity || 1,
                    className: prefixed('pie-piece'),
                    tabindex: 0,
                    dataValue: value
                }));

                currentSerieGroupElement.appendChild(serieGroup);

            }, this);

            this.serieGroupElement.appendChild(currentSerieGroupElement).getBoundingClientRect(); // getBoundingClientRect causes a reflow, so we don't have to use setTimeout to remove the class.
            if (this.config.transition) {
                currentSerieGroupElement.classList.remove(prefixed('unattached'));
            }

        }

        /**
     * Draw x axis labels
     */
        #addXAxisLabels(columnWidth) {
            // Draw xAxis lines
            var currentXAxisGroupElement = el('g');

            var currentXAxisLabelsGroupElement = el('g', {
                className: prefixed('x-axis-label-group-current')
            });

            var currentXAxisGridColumnsSelectableGroupElement = (this.config.xAxisGridColumnsSelectable) ? el('g') : null;
            dirForEach(this, this.data.xAxis.columns, this.config.dir, function (colValue, colIndex) {
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
                x = this.config.yAxisTitleStart ? this.config.yAxisTitleStart : defaultConstants.paddingNormal;
            } else {
                x = this.config.yAxisTitleStart ? (this.width - this.config.yAxisTitleStart) : (this.width - defaultConstants.paddingNormal);
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
                y: this.height - (this.config.xAxisTitleBottom != null ? this.config.xAxisTitleBottom : defaultConstants.paddingNormal),
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
                var width = box.width + (defaultConstants.focusedValuePadding * 2);
                var height = box.height + (defaultConstants.focusedValuePadding * 2);
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
         * @param {Node} target Node (x axis label) that is selected.
         */
        #onXAxisLabelGroupSelect(target) {
            var textNodes = this.xAxisLabelsGroupElement.querySelectorAll('text.' + prefixed('x-axis-grid-column-selectable-label'));
            var rects = this.xAxisGridColumnsSelectableGroupElement.querySelectorAll('rect.' + prefixed('x-axis-grid-column-selectable'));
            for (var i = 0; i < textNodes.length; i++) {
                if (textNodes[i] === target) {
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




    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Private main functions during config
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////




























    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Private functions that don't require a chart instance
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////


    /**
     * Convert polar to cartesian point.
     * @param {Int} centerX Center x.
     * @param {Int} centerY Center y.
     * @param {Int} radius Radius of arc.
     * @param {Int} angleInDegrees Angle in degrees.
     * @returns Object point.
     */
    function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
        var angleInRadians = (angleInDegrees - 90) * Math.PI / 180;
        return {
            x: centerX + (radius * Math.cos(angleInRadians)),
            y: centerY + (radius * Math.sin(angleInRadians))
        };
    }

    /**
     * Get path for pie.
     * @param {Int} x X point.
     * @param {Int} y Y point.
     * @param {Int} radius Radius of arc.
     * @param {Int} startAngle Start angle.
     * @param {Int} endAngle End angle.
     * @returns Array of path coordinates.
     */
    function describeArcPie(x, y, radius, startAngle, endAngle) {
        var start = polarToCartesian(x, y, radius, endAngle);
        var end = polarToCartesian(x, y, radius, startAngle);

        var arcSweep = endAngle - startAngle <= 180 ? "0" : "1";

        var d = [
            "M", start.x, start.y,
            "A", radius, radius, 0, arcSweep, 0, end.x, end.y,
            "L", x, y,
            "L", start.x, start.y
        ];

        return d;
    }

    /**
     * Get path for donut.
     * @param {Int} x X point.
     * @param {Int} y Y point.
     * @param {Int} radius Radius of arc.
     * @param {Int} spread Spread of the donut.
     * @param {Int} startAngle Start angle.
     * @param {Int} endAngle End angle.
     * @returns Array of path coordinates.
     */
    function describeArcDonut(x, y, radius, spread, startAngle, endAngle) {
        var innerStart = polarToCartesian(x, y, radius, endAngle);
        var innerEnd = polarToCartesian(x, y, radius, startAngle);
        var outerStart = polarToCartesian(x, y, radius + spread, endAngle);
        var outerEnd = polarToCartesian(x, y, radius + spread, startAngle);

        var largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

        var d = [
            "M", outerStart.x, outerStart.y,
            "A", radius + spread, radius + spread, 0, largeArcFlag, 0, outerEnd.x, outerEnd.y,
            "L", innerEnd.x, innerEnd.y,
            "A", radius, radius, 0, largeArcFlag, 1, innerStart.x, innerStart.y,
            "L", outerStart.x, outerStart.y, "Z"
        ];

        return d;
    }










    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Event handler callbacks
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////













    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Private functions
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////


    /**
     * Returns a forEach function that travels an array based on the this.config.dir value.
     * If ltr ==> forEach
     * If rtl ==> inversed forEach
     */
    function dirForEach(chartInstance, items, dir, callback) {
        if (dir === 'ltr') {
            const length = items.length;
            for (let i = 0; i < length; i++) {
                callback.call(chartInstance, items[i], i, items);
            }
        } else {
            const maxIndex = items.length - 1;
            for (let i = maxIndex; i >= 0; i--) {
                callback.call(chartInstance, items[i], maxIndex - i, items);
            }
        }
    }

    /**
     * Gets first color or gradient that is defined for one of the properties for this serie.
     * @param {Array} props Array with properties to search for.
     * @param {Object} serie Serie object.
     * @param {Int} serieIndex Index of serie.
     * @returns First matched color or gradient.
     */
    function getSeriePropertyColor(props, serie, serieIndex) {
        for (var i = 0; i < props.length; i++) {
            var key = props[i];
            if (serie[key]) {
                return key === 'fillGradient' ? `url(#${serie.id}-gradient)` : serie[key];
            }
        }
        if (serie.color) {
            return serie.color;
        }
        return defaultColorPalette[serieIndex];
    }

    /**
     * Gets color or gradient for point in line chart.
     * @param {Object} serie Serie object.
     * @param {Int} serieIndex Serie index.
     * @returns First matched color or gradient.
     */
    function getSeriePointColor(serie, serieIndex) {
        return getSeriePropertyColor(['pointColor', 'strokeColor'], serie, serieIndex);
    }

    /**
     * Gets color or gradient for stroke.
     * @param {Object} serie Serie object.
     * @param {Int} serieIndex Serie index.
     * @returns First matched color or gradient.
     */
    function getSerieStrokeColor(serie, serieIndex) {
        return getSeriePropertyColor(['strokeColor'], serie, serieIndex);
    }

    /**
     * Gets color or gradient for fill.
     * @param {Object} serie Serie object.
     * @param {Int} serieIndex Serie index.
     * @returns First matched color or gradient.
     */
    function getSerieFill(serie, serieIndex) {
        return getSeriePropertyColor(['fillGradient'], serie, serieIndex);
    }

    /**
     * Adds a prefix to the classname.
     * @param {String} className Class name.
     * @returns Classname with prefix.
     */
    function prefixed(className) {
        return classNamePrefix + className;
    }

    /**
     * Searches for (parent) node with the provided name, starting with the current node.
     * @param {Node} currentElement Node to start the search.
     * @param {String} parentName Node name of parent.
     * @returns Found node or null if nothing is found.
     */
    function parent(currentElement, parentName) {
        var el = currentElement;
        while (el && el.nodeName.toLowerCase() !== parentName.toLowerCase()) {
            el = el.parentNode;
        }
        return el;
    }



    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Public functions
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    /**
     * Creates a new SVG node.
     * @param {String} name Name of new node.
     * @param {Object} attributes Attributes as key value pairs.
     * @param {Node} child Optional child node that should be appended to the newle created node.
     * @returns Newly created node.
     */
    function el(name, attributes = {}, child = null) {
        var el = document.createElementNS(ns, name);
        Object.keys(attributes).forEach(function (key) {
            if (attributes[key] === null) {
                return;
            }
            switch (key) {
                case 'className':
                    if (attributes[key]) {
                        el.classList.add(...attributes[key].trim().split(' '));
                    }
                    break;
                default:
                    el.setAttribute(key.replaceAll(attributesCamelCaseToDashRegex, "-$&").toLowerCase(), attributes[key]);
                    break;
            }
        });
        if (child) {
            el.appendChild(child);
        }
        return el;
    }
    // Make it a public function as well, can be used in for example beforeDraw callback to add new nodes to the SVG node.
    SvgChart.prototype.el = el;



    // Init - do something with side effects!

    function addCss() {
        document.head.appendChild(document.createElement("style")).innerHTML = [
            '.' + prefixed('line-point') + ', g.' + prefixed('legend-group') + ' g, .' + prefixed('x-axis-grid-column-selectable-label') + ' { cursor: pointer; }',
            '.' + prefixed('line-point') + ':hover, circle.' + prefixed('line-point') + ':focus { stroke-width: 6; outline: none; }',
            '#' + prefixed('serie-group') + ' g { transition: opacity 0.6s; }',
            '#' + prefixed('serie-group') + ' g.' + prefixed('unselected') + ' { opacity: 0; }',
            '#' + prefixed('serie-group-current') + ' { transition: opacity 1s; opacity: 1; }',
            '#' + prefixed('serie-group-current') + '.' + prefixed('unattached') + ' { opacity: 0; }',
            'g.' + prefixed('legend-group') + ' g.' + prefixed('unselected') + ' { opacity: 0.4; }',
            'rect.' + prefixed('bar') + ':hover, path.' + prefixed('pie-piece') + ':hover { fill-opacity: 0.7; }',
            'path.' + prefixed('pie-piece') + ':focus, rect.' + prefixed('bar') + ':focus { outline: none; stroke-width:1; stroke:white; fill-opacity:1; }'
        ].join("\n");
    }

    window.SvgChart = SvgChart;


}());