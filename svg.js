(function () {

    const defaultConfig = {
        padding: {
            left: 20,
            right: 20,
            top: 20,
            bottom: 20
        },
        transition: true,
        maxValue: 100,
        minValue: 0,
        yAxisStep: 10,
        legend: true,
        legendSelect: true,
        yAxis: true,
        yAxisGrid: true,
        yAxisLabels: true,
        xAxisGrid: true,
        xAxisGridPadding: 0,
        yAxisGridPadding: 0,
        xAxisLabels: true,
        xAxisGridColumns: true, // we have now columns we can select / deselect instead of just x axis lines, so it is similar to bar charts, also good if you use bar charts in teh same chart!
        xAxisGridColumnsSelectable: true,
        connectNullValues: false,
        lineCurved: true,
        lineChartFilled: false,
        pointRadius: 3,
        points: true,
        barSpacing: 4,
        barStrokeWidth: 1,
        barStacked: false,
        xAxisLabelTop: 30,
        showValueOnFocus: true
    };

    // TOOD: in construcor zaken regelen die ALTIJD moeten, ongeacht welke chart type je ehbt
    // In config() de zaken die per chart kunnen verschillen, nijv. als je pie chart met andere series wil laten zien, dan moet je dus ook de legend updaten
    // EN dan de data() zoals nu.

    // Note:
    // 1) If you want to save the SVG to a PNG (by writing it to a CANVAS element), we have to set the styling by attributes
    // instead of using CSS! So we accept these properties and only set them when available. But users can also use CSS. So
    // it's up to the user.

    // Pie:
    // https://marian-caikovski.medium.com/drawing-sectors-and-pie-charts-with-svg-paths-b99b5b6bf7bd
    // https://piechartssvg.onrender.com/
    // Donougt:
    // https://dev.to/mustapha/how-to-create-an-interactive-svg-donut-chart-using-angular-19eo ==> waarom je NIET met stroke-dasharray moet werken ==> namelijk NIET interactief te maken. ==> zowel pie als donut charts! ==> dus deze pakken!
    // https://stackoverflow.com/questions/5736398/how-to-calculate-the-svg-path-for-an-arc-of-a-circle

    const ns = 'http://www.w3.org/2000/svg';
    const attributesCamelCaseToDashRegex = /[A-Z]/g;
    const valueElPadding = 6;

    //const retroMetroColorPalette = ["#ea5545", "#f46a9b", "#ef9b20", "#edbf33", "#ede15b", "#bdcf32", "#87bc45", "#27aeef", "#b33dc6"];
    const dutchFieldColorPalette = ["#e60049", "#0bb4ff", "#50e991", "#e6d800", "#9b19f5", "#ffa300", "#dc0ab4", "#b3d4ff", "#00bfa0"];
    //const riverNightsColorPalette = ["#b30000", "#7c1158", "#4421af", "#1a53ff", "#0d88e6", "#00b7c7", "#5ad45a", "#8be04e", "#ebdc78"];
    const springPastelsColorPalette = ["#fd7f6f", "#7eb0d5", "#b2e061", "#bd7ebe", "#ffb55a", "#ffee65", "#beb9db", "#fdcce5", "#8bd3c7"];

    const defaultColorPalette = dutchFieldColorPalette;

    window.SvgChart = function (parent, config, id) {

        this.id = id;

        // Based on types we must do some things. For example: for pie types we don't need to draw x and y axis grid lines. etc.
        // But it is also possible to combine charts, like line and bars... so then set 2 types
        // It's up to the user to DON'T set 2 incompatible types like pie and line.
        // We can use type = line as a group of (possible) config options.

        // Initialize variables
        this.parent = parent;
        this.config = Object.assign({}, defaultConfig, config);
        this.config.padding = Object.assign({}, defaultConfig.padding, this.config.padding);

        this._data = null;
        this.unselectedSeries = {};
        this.selectedColumnIndex = null; // maybe only for line and bar because pie and donut only have 1 column...

        const parentRect = parent.getBoundingClientRect();

        this.width = parentRect.width;
        this.height = parentRect.height;
        this.chartWidth = this.width - this.config.padding.left - this.config.padding.right - (this.config.xAxisGridPadding * 2); // todo: yAxisGridPadding alleen voor line and bar charts
        this.chartHeight = this.height - this.config.padding.top - this.config.padding.bottom - (this.config.yAxisGridPadding * 2); // todo: yAxisGridPadding alleen voor line and bar charts

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

        switch (this.config.chartType) {
            case SvgChart.types.bar:
            case SvgChart.types.line:
            case SvgChart.types.lineAndBar:
                initLineAndBar.call(this);
                break;
            case SvgChart.types.pie:
                initPie.call(this);
                break;
        }

        // TODO: for all chart types?
        this.onSerieGroupTransitionendScoped = scopedFunction(this, onSerieGroupTransitionend);

        if (this.config.title) {
            this.addTitle();
        }

        if (this.config.legend) {
            this.addLegend();
        }



        this.serieGroupElement = el('g', {
            id: 'my-serie-group'
        });
        this.serieGroupElement.addEventListener('transitionend', this.onSerieGroupTransitionendScoped);
        this.svg.appendChild(this.serieGroupElement);

        if (this.config.showValueOnFocus) {

            this.onSerieGroupFocusScoped = scopedFunction(this, onSerieGroupFocus);
            this.onSerieGroupBlurScoped = scopedFunction(this, onSerieGroupBlur);

            this.serieGroupElement.addEventListener('focus', this.onSerieGroupFocusScoped, true);
            this.serieGroupElement.addEventListener('blur', this.onSerieGroupBlurScoped, true);

            this.valueElGroup = el('g', {
                className: 'my-value-element-group'
            });
            this.valueElRect = el('rect', {
                fill: this.config.focusedValueFill || 'black'
            });
            this.valueElText = el('text', {
                textAnchor: 'middle',
                dominantBaseline: 'middle',
                fontFamily: this.config.fontFamily,
                fontSize: 'smaller',
                fill: this.config.focusedValueColor || 'white'
            }, document.createTextNode(''));
            this.valueElGroup.appendChild(this.valueElRect);
            this.valueElGroup.appendChild(this.valueElText);
        }

    };

    function initPie() {

    }

    function initLineAndBar() {
        this.valueHeight = this.chartHeight / this.config.maxValue;
        this.barCount = 0;
        this.config.series.forEach(function (serie) {
            switch (serie.type) {
                case 'bar':
                    this.barCount += 1;
                    break;
            }
        }, this);
        if (this.config.barStacked) {
            this.barCount = 1;
        }

        if (this.config.yAxis) {
            this.addYAxisGrid();
        }
        if (this.config.xAxisTitle) {
            this.addXAxisTitle();
        }

        if (this.config.yAxisTitle) {
            this.addYAxisTitle();
        }
        if (this.config.xAxisLabels) {
            this.xAxisLabelsGroupElement = el('g', {
                className: 'my-x-axis-label-group'
            });
            if (this.config.xAxisGridColumnsSelectable) {
                this.onXAxisLabelGroupClickScoped = scopedFunction(this, onXAxisLabelGroupClick);
                this.onXAxisLabelGroupKeypressScoped = scopedFunction(this, onXAxisLabelGroupKeypress);
                this.xAxisLabelsGroupElement.addEventListener('click', this.onXAxisLabelGroupClickScoped);
                this.xAxisLabelsGroupElement.addEventListener('keypress', this.onXAxisLabelGroupKeypressScoped);
                // Group element that wraps the rects that indicates a selected column for line and bar charts.
                this.xAxisGridColumnsSelectableGroupElement = el('g', {
                    className: 'my-x-axis-columns-selectable-group'
                });
                this.svg.appendChild(this.xAxisGridColumnsSelectableGroupElement);
            }
            this.svg.appendChild(this.xAxisLabelsGroupElement);
        }

        // Only for line and bar charts
        this.xAxisLineGroupElement = el('g', {
            className: 'my-x-axis-group'
        });
        this.svg.appendChild(this.xAxisLineGroupElement);
    }

    window.SvgChart.types = {
        line: 'line',
        bar: 'bar',
        lineAndBar: 'lineAndBar',
        pie: 'pie'
    };

    window.SvgChart.prototype.addLegend = function () {
        var gLegend = el('g', {
            className: 'my-legend-group'
        });
        if (this.config.legendSelect) {
            this.onLegendClickScoped = scopedFunction(this, onLegendClick);
            this.onLegendKeypressScoped = scopedFunction(this, onLegendKeypress);
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
                fill: serie.color || defaultColorPalette[serieIndex]
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
    };

    window.SvgChart.prototype.addYAxisTitle = function () {
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
    };

    window.SvgChart.prototype.addXAxisTitle = function () {
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
    };

    window.SvgChart.prototype.addTitle = function () {
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
    };

    window.SvgChart.prototype.addYAxisGrid = function () {
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
    }

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
            var serieItem = this.config.series.find((item) => item.id === serie);

            this.valueElText.replaceChild(document.createTextNode(serieItem.title + ': ' + circle.dataset.value), this.valueElText.firstChild);
            this.serieGroupElement.appendChild(this.valueElGroup);
            var box = this.valueElText.getBBox();
            var width = box.width + (valueElPadding * 2);
            var height = box.height + (valueElPadding * 2);
            this.valueElRect.setAttribute('width', width);
            this.valueElRect.setAttribute('height', height);
            this.valueElText.setAttribute('x', width / 2);
            this.valueElText.setAttribute('y', height / 2);

            var x = (circle.getAttribute('cx') || (parseFloat(circle.getAttribute('x')) + (circle.getAttribute('width') / 2))) - (width / 2);
            var y = (circle.getAttribute('cy') || circle.getAttribute('y')) - 10 - height;
            this.valueElGroup.setAttribute('transform', 'translate(' + x + ', ' + y + ')');

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

    // For pie and donut
    function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
        var angleInRadians = (angleInDegrees - 90) * Math.PI / 180;
        return {
            x: centerX + (radius * Math.cos(angleInRadians)),
            y: centerY + (radius * Math.sin(angleInRadians))
        };
    }

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
    // For pie and donut

    function dataPie() {

        var radius = 100;
        var centerX = this.config.padding.left + ((this.chartWidth - this.config.padding.right) / 2);
        var centerY = this.config.padding.top + ((this.chartHeight - this.config.padding.bottom) / 2);

        var c1 = el('circle', {
            cx: centerX,
            cy: centerY,
            r: radius,
            fill: 'red',
            fillOpacity: 0.1
        });
        this.serieGroupElement.appendChild(c1);

        this.serieGroupElement.appendChild(el('path', {
            d: describeArcPie(centerX, centerY, radius, 0, 90).join(' '),
            fill: 'green'
        }));
        this.serieGroupElement.appendChild(el('path', {
            d: describeArcPie(centerX, centerY, radius, 90, 200).join(' '),
            fill: 'red'
        }));
        this.serieGroupElement.appendChild(el('path', {
            d: describeArcPie(centerX, centerY, radius, 200, 310).join(' '),
            fill: 'pink'
        }));
        this.serieGroupElement.appendChild(el('path', {
            d: describeArcPie(centerX, centerY, radius, 310, 360).join(' '),
            fill: 'olive'
        }));

        // this.serieGroupElement.appendChild(el('path', {
        //     d: describeArcDonut(centerX, centerY, radius - 40, 40, 0, 90).join(' '),
        //     fill: 'purple'
        // }));
        // this.serieGroupElement.appendChild(el('path', {
        //     d: describeArcDonut(centerX, centerY, radius - 40, 40, 90, 200).join(' '),
        //     fill: 'orange'
        // }));
        // this.serieGroupElement.appendChild(el('path', {
        //     d: describeArcDonut(centerX, centerY, radius - 40, 40, 200, 310).join(' '),
        //     fill: 'gray'
        // }));

    }

    function dataLineAndBar() {
        if (this.xAxisLineGroupElement.firstChild) {
            this.xAxisLineGroupElement.removeChild(this.xAxisLineGroupElement.firstChild);
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
            ? (this.chartWidth / (this._data.xAxis.columns.length))
            : (this.chartWidth / (this._data.xAxis.columns.length - 1));
        const barWidth = (columnWidth - (this.config.barSpacing * (this.barCount + 1))) / (this.barCount || 1);

        // Draw xAxis lines
        var currentXAxisLineGroupElement = el('g');

        var currentXAxisLabelsGroupElement = el('g', {
            className: 'my-x-axis-label-group-current'
        });


        var currentXAxisGridColumnsSelectableGroupElement = (this.config.xAxisGridColumnsSelectable) ? el('g') : null;
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
                var xlg = el('g', {
                    transform: `translate(${this.config.padding.left + this.config.xAxisGridPadding + (colIndex * columnWidth) + (this.config.xAxisGridColumns ? (columnWidth / 2) : 0)} ${this.chartHeight + this.config.padding.top + (this.config.yAxisGridPadding * 2) + (this.config.xAxisLabelTop || 10)})`
                });
                xlg.appendChild(el('text', {
                    textAnchor: 'middle',
                    dominantBaseline: 'hanging',
                    fontFamily: this.config.fontFamily || '',
                    fontSize: this.config.fontSizeAxisLabel || '',
                    fill: this.config.xAxisLabelColor || '',
                    tabindex: this.config.xAxisGridColumnsSelectable ? 0 : null,
                    className: 'my-x-axis-label ' + (this.config.xAxisGridColumnsSelectable ? 'my-x-axis-grid-column-selectable-label' : ''),
                    transform: this.config.xAxisLabelRotation ? `rotate(${this.config.xAxisLabelRotation})` : ''
                }, document.createTextNode(colValue)));
                currentXAxisLabelsGroupElement.appendChild(xlg);
            }
        }, this);
        if (this.config.xAxisGrid && this.config.xAxisGridColumns) {
            addXAxisLine.call(this, currentXAxisLineGroupElement, this.config.padding.left + this.config.xAxisGridPadding + (this._data.xAxis.columns.length * columnWidth));
        }
        this.xAxisLineGroupElement.appendChild(currentXAxisLineGroupElement);
        this.config.xAxisGridColumnsSelectable && this.xAxisGridColumnsSelectableGroupElement.appendChild(currentXAxisGridColumnsSelectableGroupElement);
        this.xAxisLabelsGroupElement.appendChild(currentXAxisLabelsGroupElement);

        var currentSerieGroupElement = el('g', {
            id: 'my-serie-group-current',
            className: this.config.transition ? 'unattached' : ''
        });

        var currentBarIndex = 0;
        var stackedBarValues = []; // value index => current value (steeds optellen)

        this.config.series.forEach(function (serie, serieIndex) {

            var serieGroup = el('g', {
                dataSerie: serie.id,
                className: this.unselectedSeries[serie.id] ? 'unselected' : ''
            });

            switch (serie.type) {
                case 'line':
                    {
                        var nonNullPoints = [[]]; // Array of arrays, each array consists only of NON NULL points, used for smoot lines when not connecting NULL values and for filled lines charts when not connecting null points
                        var flatNonNullPoints = [];
                        this._data.series[serie.id].forEach(function (value, valueIndex, values) {
                            var x = this.config.padding.left + this.config.xAxisGridPadding + (valueIndex * columnWidth) + (this.config.xAxisGridColumns ? (columnWidth / 2) : 0);
                            var y = this.config.padding.top + this.config.yAxisGridPadding + this.chartHeight - (value * this.valueHeight);

                            if (value === null) {
                                if (nonNullPoints[nonNullPoints.length - 1].length > 0 && valueIndex + 1 < values.length) {
                                    nonNullPoints.push([]);
                                }
                            } else {
                                nonNullPoints[nonNullPoints.length - 1].push({ x: x, y: y, value: value });
                                flatNonNullPoints.push({ x: x, y: y, value: value });
                            }
                        }, this);

                        var paths = [];

                        if (this.config.connectNullValues) {

                            // Loop through flatNonNullPoints

                            let path = this.config.lineCurved ? getCurvedPathFromPoints.call(this, flatNonNullPoints) : getStraightPathFromPoints.call(this, flatNonNullPoints);
                            if (path.length > 0) {
                                paths.push(path);
                            }

                        } else {

                            // Loop through nonNullPoints

                            nonNullPoints.forEach(function (currentNonNullPoints) {
                                if (currentNonNullPoints.length > 0) {
                                    let path = this.config.lineCurved ? getCurvedPathFromPoints.call(this, currentNonNullPoints) : getStraightPathFromPoints.call(this, currentNonNullPoints);
                                    if (path.length > 0) {
                                        paths.push(path);
                                    }
                                }
                            }, this);

                        }

                        paths.forEach(function (path) {
                            serieGroup.appendChild(el('path', {
                                d: path.join(' '),
                                fill: this.config.lineChartFilled ? (serie.color || defaultColorPalette[serieIndex]) : 'none',
                                fillOpacity: 0.4,
                                stroke: (serie.color || defaultColorPalette[serieIndex]),
                                strokeWidth: this.config.lineWidth || '',
                                className: 'my-line'
                            }));
                        }, this);

                        if (this.config.points) {
                            flatNonNullPoints.forEach(function (point) {
                                serieGroup.appendChild(el('circle', {
                                    cx: point.x,
                                    cy: point.y,
                                    r: this.config.pointRadius,
                                    zIndex: 1,
                                    fill: (serie.color || defaultColorPalette[serieIndex]),
                                    stroke: (serie.color || defaultColorPalette[serieIndex]),
                                    dataValue: point.value,
                                    className: 'my-line-point',
                                    tabindex: this.config.showValueOnFocus ? 0 : null
                                }));
                            }, this);
                        }
                    }
                    break;
                case 'bar':
                    {
                        this._data.series[serie.id].forEach(function (value, valueIndex) {

                            var x = null;
                            var y = null;
                            var height = null;
                            if (this.config.barStacked) {
                                if (!stackedBarValues[valueIndex]) stackedBarValues[valueIndex] = this.config.minValue;
                                x = this.config.padding.left + this.config.xAxisGridPadding + (valueIndex * columnWidth) + this.config.barSpacing;
                                y = this.config.padding.top + this.config.yAxisGridPadding + this.chartHeight - (value * this.valueHeight) - (stackedBarValues[valueIndex] * this.valueHeight);
                                height = this.config.padding.top + this.config.yAxisGridPadding + this.chartHeight - (value * this.valueHeight);
                                stackedBarValues[valueIndex] = stackedBarValues[valueIndex] += value;
                            } else {
                                x = this.config.padding.left + this.config.xAxisGridPadding + (valueIndex * columnWidth) + (barWidth * currentBarIndex) + (this.config.barSpacing * (currentBarIndex + 1));
                                height = y = this.config.padding.top + this.config.yAxisGridPadding + this.chartHeight - (value * this.valueHeight);
                            }

                            serieGroup.appendChild(el('rect', {
                                x: x,
                                y: y,
                                width: barWidth,
                                height: this.chartHeight + this.config.padding.top + this.config.yAxisGridPadding - height,
                                fill: (serie.color || defaultColorPalette[serieIndex]),
                                className: 'my-bar',
                                fillOpacity: this.config.barFillOpacity || '',
                                strokeWidth: this.config.barStrokeWidth || 0,
                                stroke: (serie.color || defaultColorPalette[serieIndex]),
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
            currentSerieGroupElement.classList.remove('unattached');
        }
    }

    window.SvgChart.prototype.data = function (data = null) {

        if (data !== null) {
            this._data = data;
        }

        switch (this.config.chartType) {
            case SvgChart.types.lineAndBar:
            case SvgChart.types.bar:
            case SvgChart.types.line:
                dataLineAndBar.call(this);
                break;
            case SvgChart.types.pie:
                dataPie.call(this);
                break;
        }

    };

    function getCurvedPathFromPoints(points) {
        path = ['M ' + points[0].x + ' ' + points[0].y];
        for (var i = 0; i < points.length - 1; i++) {
            var x_mid = (points[i].x + points[i + 1].x) / 2;
            var y_mid = (points[i].y + points[i + 1].y) / 2;
            var cp_x1 = (x_mid + points[i].x) / 2;
            var cp_x2 = (x_mid + points[i + 1].x) / 2;
            path.push(`Q ${cp_x1} ${points[i].y}, ${x_mid} ${y_mid}`);
            path.push(`Q ${cp_x2} ${points[i + 1].y} ${points[i + 1].x} ${points[i + 1].y}`);
        }
        closePath.call(this, path, points);
        return path;
    }

    function closePath(path, points) {
        if (this.config.lineChartFilled && points.length > 1) {
            path.push(`L ${points[points.length - 1].x} ${this.config.padding.top + this.config.yAxisGridPadding + this.chartHeight}`);
            path.push(`L ${points[0].x} ${this.config.padding.top + this.config.yAxisGridPadding + this.chartHeight}`);
            path.push(`L ${points[0].x} ${points[0].y}`);
            path.push('Z');
        }
    }

    function getStraightPathFromPoints(points) {
        path = [];
        points.forEach(function (point, pointIndex) {
            if (pointIndex === 0) {
                path.push(`M ${point.x} ${point.y}`);
            } else {
                path.push(`L ${point.x} ${point.y}`);
            }
        });
        closePath.call(this, path, points);
        return path;
    }

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

}());