(function () {

    // Note:
    // 1) If you want to save the SVG to a PNG (by writing it to a CANVAS element), we have to set the styling by attributes
    // instead of using CSS! So we accept these properties and only set them when available. But users can also use CSS. So
    // it's up to the user.

    const ns = 'http://www.w3.org/2000/svg';
    const attributesCamelCaseToDashRegex = /[A-Z]/g;
    const valueElWidth = 60;
    const valueElHeight = 26;

    window.SvgChart = function (parent, config) {

        // Initialize variables
        this.parent = parent;
        this.config = config;
        this._data = null;
        this.unselectedSeries = {};
        this.selectedColumnIndex = null;
        this.xAxisLineGroupElement = null; // g element

        const parentRect = parent.getBoundingClientRect();

        this.width = parentRect.width;
        this.height = parentRect.height;
        this.chartWidth = this.width - this.config.padding.left - this.config.padding.right - (this.config.xAxisGridPadding * 2);
        this.chartHeight = this.height - this.config.padding.top - this.config.padding.bottom - (this.config.yAxisGridPadding * 2);

        // Add SVG element to parent
        this.svg = el('svg', {
            width: this.width,
            height: this.height,
            className: 'my-svg'
        })
        if (this.config.backgroundColor) {
            this.svg.style.backgroundColor = this.config.backgroundColor;
        }
        this.parent.appendChild(this.svg);

        this.valueHeight = this.chartHeight / this.config.maxValue;

        // Create functions that are binded to this, so we can easily add or remove them.
        this.onXAxisLabelGroupClickScoped = scopedFunction(this, onXAxisLabelGroupClick);
        this.onXAxisLabelGroupKeypressScoped = scopedFunction(this, onXAxisLabelGroupKeypress);
        this.onSerieGroupFocusScoped = scopedFunction(this, onSerieGroupFocus);
        this.onSerieGroupBlurScoped = scopedFunction(this, onSerieGroupBlur);
        this.onSerieGroupTransitionendScoped = scopedFunction(this, onSerieGroupTransitionend);
        this.onLegendClickScoped = scopedFunction(this, onLegendClick);
        this.onLegendKeypressScoped = scopedFunction(this, onLegendKeypress);

        this.focusedValueWidth = this.config.focusedValueWidth || valueElWidth;
        this.focusedValueHeight = this.config.focusedValueHeight || valueElHeight;

    };

    // longstanding bug in Firefox - we MUST use the DOMParser() method: https://bugzilla.mozilla.org/show_bug.cgi?id=700533
    window.SvgChart.prototype.saveAsPng = function (filename) {
        var rect = this.svg.getBoundingClientRect();
        var canvas = document.createElement('canvas');
        canvas.setAttribute('width', rect.width);
        canvas.setAttribute('height', rect.height);
        var ctx = canvas.getContext('2d');
        ctx.fillStyle = this.config.backgroundColor;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        var img = new Image();
        var data = '<svg xmlns="http://www.w3.org/2000/svg">' + this.svg.innerHTML + '</svg>';
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
    };

    function onLegendToggle(target) {
        var g = parent(target, 'g');
        if (g && g.dataset.serie) {
            var sg = this.serieGroupElement.querySelector('g[data-serie="' + g.dataset.serie + '"]');
            if (this.unselectedSeries[g.dataset.serie]) {
                sg.setAttribute('display', 'inline'); // This is the default apparently
                g.classList.remove('unselected');
                sg.classList.remove('unselected');
                delete this.unselectedSeries[g.dataset.serie];
            } else {
                g.classList.add('unselected');
                sg.classList.add('unselected');
                this.unselectedSeries[g.dataset.serie] = true;
            }
        }
    }

    function onLegendKeypress(e) {
        if (e.keyCode === 13) {
            onLegendToggle.call(this, e.target);
        }
    }

    function onLegendClick(e) {
        onLegendToggle.call(this, e.target);
    }

    window.SvgChart.prototype.init = function () {

        var me = this;

        // Get some things from the series that we only need to do once but for this we need the series
        this.barCount = 0;
        this.lineCount = 0;
        this.config.series.forEach(function (serie) {
            switch (serie.type) {
                case 'line':
                    this.lineCount += 1;
                    break;
                case 'bar':
                    this.barCount += 1;
                    break;
            }
        }, this);

        var gYAxis = el('g', {
            className: 'my-y-axis-group'
        });
        var currentYAxisValue = this.config.minValue;
        while (currentYAxisValue <= this.config.maxValue) {
            var y = this.config.padding.top + this.config.yAxisGridPadding + this.chartHeight - (currentYAxisValue * this.valueHeight);
            if (this.config.yAxisGrid) {
                gYAxis.appendChild(el('line', {
                    x1: this.config.padding.left,
                    y1: y,
                    x2: this.config.padding.left + this.chartWidth + (this.config.xAxisGridPadding * 2),
                    y2: y,
                    className: 'my-y-axis-grid-line',
                    stroke: this.config.yAxisGridLineColor || '',
                    strokeWidth: this.config.yAxisGridLineWidth || '',
                    strokeDasharray: this.config.yAxisGridLineDashArray || '',
                }));
            }
            if (this.config.yAxisLabels) {
                gYAxis.appendChild(el('text', {
                    x: this.config.padding.left - 10,
                    y: y,
                    textAnchor: 'end',
                    dominantBaseline: 'middle',
                    fontFamily: this.config.fontFamily || '',
                    fontSize: this.config.fontSizeAxisLabel || '',
                    className: 'my-y-axis-label',
                    fill: this.config.yAxisLabelColor || ''
                }, document.createTextNode(currentYAxisValue)));
            }
            currentYAxisValue += this.config.yAxisStep;
        }
        this.svg.appendChild(gYAxis);

        if (this.config.title) {
            this.svg.appendChild(el('text', {
                x: this.width / 2,
                y: 20,
                textAnchor: 'middle',
                dominantBaseline: 'hanging',
                fontFamily: this.config.fontFamily || '',
                fontSize: this.config.fontSizeTitle || '',
                fill: this.config.titleColor || '',
                className: 'my-text-title',
            }, document.createTextNode(this.config.title)));
        }

        if (this.config.xAxisTitle) {
            this.svg.appendChild(el('text', {
                x: this.width - this.config.padding.right - this.config.xAxisGridPadding,
                y: this.height - 20,
                textAnchor: 'end',
                dominantBaseline: 'auto',
                fontFamily: this.config.fontFamily || '',
                fontSize: this.config.fontSizeAxisTitle || '',
                fill: this.config.xAxisTitleColor || '',
                className: 'my-text-x-axis-title'
            }, document.createTextNode(this.config.xAxisTitle)));
        }

        if (this.config.yAxisTitle) {
            var yAxisTitleG = el('g');
            yAxisTitleG.setAttribute('transform', 'translate(20, ' + (this.config.padding.top + this.config.yAxisGridPadding) + ')');
            var yAxisTitleEl = el('text', {
                textAnchor: 'end',
                dominantBaseline: 'hanging',
                fontFamily: this.config.fontFamily || '',
                fontSize: this.config.fontSizeAxisTitle || '',
                fill: this.config.yAxisTitleColor || '',
                className: 'my-text-y-axis-title'
            }, document.createTextNode(this.config.yAxisTitle));
            yAxisTitleEl.setAttribute('transform', 'rotate(-90)');
            yAxisTitleG.appendChild(yAxisTitleEl);
            this.svg.appendChild(yAxisTitleG);
        }

        if (this.config.legend) {
            var gLegend = el('g', {
                className: 'my-legend-group'
            });
            if (this.config.legendSelect) {
                gLegend.addEventListener('keypress', this.onLegendKeypressScoped);
                gLegend.addEventListener('click', this.onLegendClickScoped);
            }
            this.config.series.forEach(function (serie, serieIndex) {
                var gSerie = el('g', {
                    dataSerie: serie.id,
                    tabindex: 0
                });
                gSerie.appendChild(el('rect', {
                    x: this.config.padding.left + this.chartWidth + (this.config.xAxisGridPadding * 2) + 20,
                    y: this.config.padding.top + this.config.yAxisGridPadding + (serieIndex * 20),
                    width: 10,
                    height: 10,
                    fill: serie.color
                }));
                gSerie.appendChild(el('text', {
                    x: this.config.padding.left + this.chartWidth + (this.config.xAxisGridPadding * 2) + 40,
                    y: this.config.padding.top + this.config.yAxisGridPadding + (serieIndex * 20) + 5,
                    textAnchor: 'start',
                    dominantBaseline: 'middle',
                    fontFamily: this.config.fontFamily || '',
                    fontSize: this.config.fontSizeLegend || '',
                }, document.createTextNode(serie.title)));
                gLegend.appendChild(gSerie);
            }, this);
            this.svg.appendChild(gLegend);
        }

        this.xAxisGridColumnsSelectableGroupElement = el('g', {
            className: 'my-x-axis-columns-selectable-group'
        });
        this.svg.appendChild(this.xAxisGridColumnsSelectableGroupElement);

        this.xAxisLineGroupElement = el('g', {
            className: 'my-x-axis-group'
        });
        this.svg.appendChild(this.xAxisLineGroupElement);

        this.xAxisLabelsGroupElement = el('g', {
            className: 'my-x-axis-label-group'
        });
        this.xAxisLabelsGroupElement.addEventListener('click', this.onXAxisLabelGroupClickScoped);
        this.xAxisLabelsGroupElement.addEventListener('keypress', this.onXAxisLabelGroupKeypressScoped);
        this.svg.appendChild(this.xAxisLabelsGroupElement);

        this.serieGroupElement = el('g', {
            id: 'my-serie-group'
        });
        this.serieGroupElement.addEventListener('focus', this.onSerieGroupFocusScoped, true);
        this.serieGroupElement.addEventListener('blur', this.onSerieGroupBlurScoped, true);
        this.serieGroupElement.addEventListener('transitionend', this.onSerieGroupTransitionendScoped);
        this.svg.appendChild(this.serieGroupElement);

        this.valueElGroup = el('g', {
            className: 'my-value-element-group'
        });
        this.valueElRect = el('rect', {
            fill: this.config.focusedValueFill || 'black',
            width: this.focusedValueWidth,
            height: this.focusedValueHeight
        });
        this.valueElText = el('text', {
            textAnchor: 'middle',
            dominantBaseline: 'middle',
            x: this.focusedValueWidth / 2,
            y: this.focusedValueHeight / 2,
            fontFamily: this.config.fontFamily,
            fontSize: 'smaller',
            fill: this.config.focusedValueColor || 'white'
        }, document.createTextNode(''));
        this.valueElGroup.appendChild(this.valueElRect);
        this.valueElGroup.appendChild(this.valueElText);
    };

    // Volgens mij kan ik deze ook gebruiken in de pad, want daar heb je : Q x1 y1, x y
    // // https://stackoverflow.com/questions/7054272/how-to-draw-smooth-curve-through-n-points-using-javascript-html5-canvas
    function getCurvedPathFromPoints(points, flatPoints) {
        var path = [];
        if (this.config.connectNullValues) {
            path.push('M ' + flatPoints[0].x + ' ' + flatPoints[0].y);
            for (var i = 0; i < flatPoints.length - 1; i++) {
                var x_mid = (flatPoints[i].x + flatPoints[i + 1].x) / 2;
                var y_mid = (flatPoints[i].y + flatPoints[i + 1].y) / 2;
                var cp_x1 = (x_mid + flatPoints[i].x) / 2;
                var cp_x2 = (x_mid + flatPoints[i + 1].x) / 2;
                path.push(`Q ${cp_x1} ${flatPoints[i].y}, ${x_mid} ${y_mid}`);
                path.push(`Q ${cp_x2} ${flatPoints[i + 1].y} ${flatPoints[i + 1].x} ${flatPoints[i + 1].y}`);
            }
        } else {
            points.forEach(function (nonNullPoints) {
                if (nonNullPoints.length > 0) {
                    path.push('M ' + nonNullPoints[0].x + ' ' + nonNullPoints[0].y);
                    for (var i = 0; i < nonNullPoints.length - 1; i++) {
                        var x_mid = (nonNullPoints[i].x + nonNullPoints[i + 1].x) / 2;
                        var y_mid = (nonNullPoints[i].y + nonNullPoints[i + 1].y) / 2;
                        var cp_x1 = (x_mid + nonNullPoints[i].x) / 2;
                        var cp_x2 = (x_mid + nonNullPoints[i + 1].x) / 2;
                        path.push(`Q ${cp_x1} ${nonNullPoints[i].y}, ${x_mid} ${y_mid}`);
                        path.push(`Q ${cp_x2} ${nonNullPoints[i + 1].y} ${nonNullPoints[i + 1].x} ${nonNullPoints[i + 1].y}`);
                    }
                }
            });
        }

        return path;
    }

    function onSerieGroupTransitionend(e) {
        if (e.target.classList.contains('unselected')) {
            e.target.setAttribute('display', 'none');
        }
    }

    function onSerieGroupBlur(e) {
        var circle = e.target;
        var g = parent(circle, 'g');
        var serie = g.dataset.serie;
        if (serie) {
            this.serieGroupElement.removeChild(this.valueElGroup);
        }
    }

    function onSerieGroupFocus(e) {
        var circle = e.target;
        var g = parent(circle, 'g');
        var serie = g.dataset.serie;
        if (serie) {
            var x = (circle.getAttribute('cx') || (parseFloat(circle.getAttribute('x')) + (circle.getAttribute('width') / 2))) - (this.focusedValueWidth / 2);
            var y = (circle.getAttribute('cy') || circle.getAttribute('y')) - 10 - this.focusedValueHeight;
            this.valueElGroup.setAttribute('transform', 'translate(' + x + ', ' + y + ')');
            this.valueElText.replaceChild(document.createTextNode(circle.dataset.value), this.valueElText.firstChild);
            this.serieGroupElement.appendChild(this.valueElGroup);
        }
    }

    function onXAxisLabelGroupKeypress(e) {
        if (e.keyCode === 13) {
            onXAxisLabelGroupSelect.call(this, e.target);
        }
    }

    function onXAxisLabelGroupSelect(target) {
        var textNodes = this.xAxisLabelsGroupElement.querySelectorAll('text.my-x-axis-grid-column-selectable-label');
        var rects = this.xAxisGridColumnsSelectableGroupElement.querySelectorAll('rect.my-x-axis-grid-column-selectable');
        for (var i = 0; i < textNodes.length; i++) {
            if (textNodes[i] === target) {
                this.selectedColumnIndex = i;
                textNodes[i].classList.add('selected');
                rects[i].classList.add('selected');
            } else {
                textNodes[i].classList.remove('selected');
                rects[i].classList.remove('selected');
            }
        }
    }

    function onXAxisLabelGroupClick(e) {
        onXAxisLabelGroupSelect.call(this, e.target);
    }

    function addXAxisLine(parent, x) {
        parent.appendChild(el('line', {
            x1: x,
            y1: this.config.padding.top,
            x2: x,
            y2: this.chartHeight + this.config.padding.top + (this.config.yAxisGridPadding * 2),
            className: 'my-x-axis-grid-line',
            stroke: this.config.xAxisGridLineColor || '',
            strokeWidth: this.config.xAxisGridLineWidth || '',
            strokeDasharray: this.config.xAxisGridLineDashArray || '',
        }));
    }

    window.SvgChart.prototype.data = function (data = null) {

        var me = this;

        if (data !== null) {
            this._data = data;
        }

        if (this.xAxisLineGroupElement.firstChild) {
            this.xAxisLineGroupElement.removeChild(this.xAxisLineGroupElement.firstChild);
        }

        if (this.serieGroupElement.firstChild) {
            this.serieGroupElement.removeChild(this.serieGroupElement.firstChild);
        }

        if (this.xAxisGridColumnsSelectableGroupElement.firstChild) {
            this.xAxisGridColumnsSelectableGroupElement.removeChild(this.xAxisGridColumnsSelectableGroupElement.firstChild);
        }

        if (this.xAxisLabelsGroupElement.firstChild) {
            this.xAxisLabelsGroupElement.removeChild(this.xAxisLabelsGroupElement.firstChild);
        }

        // Note that for bar charts to display correctly, this.config.xAxisGridColumns MUST be true!
        const columnWidth = this.config.xAxisGridColumns
            ? (this.chartWidth / (this._data.xAxis.columns.length))
            : (this.chartWidth / (this._data.xAxis.columns.length - 1));
        const barWidth = (columnWidth - (this.config.barSpacing * (this.barCount + 1))) / (this.barCount || 1); // TODO: somewhere define 20

        // Draw xAxis lines
        var currentXAxisLineGroupElement = el('g');

        var currentXAxisLabelsGroupElement = el('g', {
            className: 'my-x-axis-label-group-current'
        });


        var currentXAxisGridColumnsSelectableGroupElement = el('g');
        this._data.xAxis.columns.forEach(function (colValue, colIndex) {
            if (this.config.xAxisGrid) {
                const x = this.config.padding.left + this.config.xAxisGridPadding + (colIndex * columnWidth);
                addXAxisLine.call(this, currentXAxisLineGroupElement, x);
                if (this.config.xAxisGridColumnsSelectable) {
                    currentXAxisGridColumnsSelectableGroupElement.appendChild(el('rect', {
                        x: x,
                        y: this.config.padding.top + this.config.yAxisGridPadding,
                        width: columnWidth,
                        height: this.chartHeight,
                        className: 'my-x-axis-grid-column-selectable',
                        fillOpacity: 0 // We need to set this here, otherwise this will show when drawn to canvas
                    }));
                }
            }
            if (this.config.xAxisLabels) {
                currentXAxisLabelsGroupElement.appendChild(el('text', {
                    x: this.config.padding.left + this.config.xAxisGridPadding + (colIndex * columnWidth) + (this.config.xAxisGridColumns ? (columnWidth / 2) : 0),
                    y: this.chartHeight + this.config.padding.top + (this.config.yAxisGridPadding * 2) + 10,
                    textAnchor: 'middle',
                    dominantBaseline: 'hanging',
                    fontFamily: this.config.fontFamily || '',
                    fontSize: this.config.fontSizeAxisLabel || '',
                    fill: this.config.xAxisLabelColor || '',
                    tabindex: 0,
                    className: 'my-x-axis-label ' + (this.config.xAxisGridColumnsSelectable ? 'my-x-axis-grid-column-selectable-label' : '')
                }, document.createTextNode(colValue)));
            }
        }, this);
        if (this.config.xAxisGrid && this.config.xAxisGridColumns) {
            addXAxisLine.call(this, currentXAxisLineGroupElement, this.config.padding.left + this.config.xAxisGridPadding + (this._data.xAxis.columns.length * columnWidth));
        }
        this.xAxisLineGroupElement.appendChild(currentXAxisLineGroupElement);
        this.xAxisGridColumnsSelectableGroupElement.appendChild(currentXAxisGridColumnsSelectableGroupElement);
        this.xAxisLabelsGroupElement.appendChild(currentXAxisLabelsGroupElement);

        var currentSerieGroupElement = el('g', {
            id: 'my-serie-group-current',
            className: this.config.transition ? 'unattached' : ''
        });

        var currentBarIndex = 0;

        this.config.series.forEach(function (serie) {

            var serieGroup = el('g', {
                dataSerie: serie.id,
                className: this.unselectedSeries[serie.id] ? 'unselected' : ''
            });

            switch (serie.type) {
                case 'line':
                    {
                        var path = [];
                        var flatPoints = []; // Array of all points in one array.
                        var points = [[]]; // Array of arrays, each array consists only of NON NULL points, used for smoot lines when not connecting NULL values
                        var weHaveSeenNonNullPoint = false;
                        var previousValue = null;
                        this._data.series[serie.id].forEach(function (value, valueIndex) {
                            var x = this.config.padding.left + this.config.xAxisGridPadding + (valueIndex * columnWidth) + (this.config.xAxisGridColumns ? (columnWidth / 2) : 0);
                            var y = this.config.padding.top + this.config.yAxisGridPadding + this.chartHeight - (value * this.valueHeight);


                            if (valueIndex === 0 || (!this.config.connectNullValues && (value === null || previousValue === null)) || !weHaveSeenNonNullPoint) {
                                path.push(`M ${x} ${y}`);
                            } else {
                                if (value !== null) {
                                    path.push(`L ${x} ${y}`);
                                }
                            }
                            if (value === null) {
                                if (points[points.length - 1].length > 0) {
                                    points.push([]);
                                }
                            } else {
                                weHaveSeenNonNullPoint = true;
                                points[points.length - 1].push({ x: x, y: y, value: value });
                                flatPoints.push({ x: x, y: y, value: value });
                            }
                            previousValue = value;
                        }, this);
                        if (this.config.curved) {
                            serieGroup.appendChild(el('path', {
                                d: getCurvedPathFromPoints.call(this, points, flatPoints).join(' '),
                                fill: 'none',
                                className: 'my-line',
                                stroke: serie.color,
                                strokeWidth: this.config.lineWidth || ''
                            }));
                        } else {
                            serieGroup.appendChild(el('path', {
                                d: path.join(' '),
                                fill: 'none',
                                stroke: serie.color,
                                strokeWidth: this.config.lineWidth || '',
                                className: 'my-line'
                            }));
                        }
                        if (this.config.points) {
                            flatPoints.forEach(function (point) {
                                serieGroup.appendChild(el('circle', {
                                    cx: point.x,
                                    cy: point.y,
                                    r: this.config.pointRadius,
                                    zIndex: 1,
                                    fill: serie.color,
                                    stroke: serie.color,
                                    dataValue: point.value,
                                    className: 'my-line-point',
                                    tabindex: 0
                                }));
                            }, this);
                        }
                    }
                    break;
                case 'bar':
                    {
                        this._data.series[serie.id].forEach(function (value, valueIndex) {

                            var x = this.config.padding.left + this.config.xAxisGridPadding + (valueIndex * columnWidth) + (barWidth * currentBarIndex) + (this.config.barSpacing * (currentBarIndex + 1));
                            var y = this.config.padding.top + this.config.yAxisGridPadding + this.chartHeight - (value * this.valueHeight);

                            serieGroup.appendChild(el('rect', {
                                x: x,
                                y: y,
                                width: barWidth,
                                height: this.chartHeight + this.config.padding.top + this.config.yAxisGridPadding - y,
                                fill: serie.color,
                                className: 'my-bar',
                                fillOpacity: this.config.barFillOpacity || '',
                                strokeWidth: this.config.barStrokeWidth || 0,
                                stroke: serie.color,
                                dataValue: value,
                                tabindex: 0
                            }));

                        }, this);

                        currentBarIndex += 1;

                    }
                    break;
            }

            currentSerieGroupElement.appendChild(serieGroup);
        }, this);
        this.serieGroupElement.appendChild(currentSerieGroupElement).getBoundingClientRect(); // getBoundingClientRect causes a reflow, so we don't have to use setTimeout to remove the class.
        if (this.config.transition) {
            //var timeout = setTimeout(function () {
            //    clearTimeout(timeout);
            currentSerieGroupElement.classList.remove('unattached');
            //}, 1); // 0 doesn't work on first load, 1 does (Chrome)
        }
    };

    function scopedFunction(me, func) {
        return (function (arg) {
            func.call(me, arg);
        });
    }

    function parent(currentElement, parentName) {
        var el = currentElement;
        while (el && el.nodeName.toLowerCase() !== parentName.toLowerCase()) {
            el = el.parentNode;
        }
        return el;
    }

    function el(name, attributes = {}, child = null) {
        var el = document.createElementNS(ns, name);
        Object.keys(attributes).forEach(function (key) {
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

}());