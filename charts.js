(function (window) {

    /**
     * Usage:
     * var chart = new Chart(domElement, config); // once
     * chart.draw(data); // everytime the data is changed, if data is null, the previous data will be used.
     */

    // General config for a chart independent on the type of chart
    var defaultConfig = {
        title: null, // String for chart title
        titleTop: 10,
        padding: {
            start: 30,
            end: 20,
            top: 20,
            bottom: 30
        },
        highlightClickedColumn: false,
        font: '12px sans-serif',
        backgroundColor: 'white',
        onClick: function (index, chartInstance) { },
        onDrawBefore: function (chartInstance) { },
        legend: false,
        legendPosition: 'top-end',
        writeXAxisLabels: true,
        writeYAxisLabels: true,
        xAxisGrid: true,
        yAxisGrid: true,
        xAxisGridColor: 'black',
        yAxisGridColor: 'black',
        xAxisGridDashed: false,
        yAxisGridDashed: false,
        xAxisStep: 1,
        yAxisStep: 10,
        yAxisMin: null, // If null, this value will be computed by taking the lowest value from all series, so if possible you should specify this
        yAxisMax: null, // If null, this value will be computed by taking the highest value from all series, so if possible you should specify this
        xAxisGridLineHalf: false, // If true, the x axis gridlines are not at the center of the x axis labels
        yAxisTitle: null, // String for the title to display
        xAxisTitle: null, // String for title to display
        lineChart: {
            width: 1,
            showPoints: false,
            pointWidth: null,
            connectNullValues: false,
            fillArea: false,
            showClickedPointValue: false,
            smooth: false
        },
        barChart: {
            spaceBetweenBars: 10
        }
    };

    var scale = window.devicePixelRatio;
    var rgbaReg = /^rgba/;
    var hexReg = /^#/;

    // ************************************************************************
    // Helper functions
    // ************************************************************************
    function getLineX(index) {
        return (index * this.computed.columnWidth) + (this.computed.columnWidth / 2) + this.config.padding.start;
    }

    function getY(value) {
        return this.chartHeight - ((value || 0) * this.computed.valueToHeight) + this.config.padding.top;
    }

    function getBarXStart(index) {
        return (index * this.computed.columnWidth) + (this.config.barChart.spaceBetweenBars / 2) + this.config.padding.start;
    }

    function gradient(a, b) {
        return (b.y - a.y) / (b.x - a.x);
    }

    function getHitItemString(item) {
        return `${item.x}-${item.y}-${item.w}-${item.h}`;
    }

    // https://stackoverflow.com/a/28056903
    function hexToRGB(hex, alpha) {
        alpha = alpha || 1;
        var r = parseInt(hex.slice(1, 3), 16),
            g = parseInt(hex.slice(3, 5), 16),
            b = parseInt(hex.slice(5, 7), 16);

        if (alpha) {
            return "rgba(" + r + ", " + g + ", " + b + ", " + alpha + ")";
        } else {
            return "rgb(" + r + ", " + g + ", " + b + ")";
        }
    }

    function colorIsRgba(color) {
        return rgbaReg.test(color);
    }

    function colorIsHex(color) {
        return hexReg.test(color);
    }

    function updateRgbAlpha(rgba, newAlpha) {
        return rgba.replace(/,([^,]+)\)$/, function (match, p1) { return ',' + newAlpha + ')'; });
    }

    function distance(x1, y1, x2, y2) {
        let xDistance = x2 - x1;
        let yDistance = y2 - y1;
        return Math.sqrt(Math.pow(xDistance, 2) + Math.pow(yDistance, 2));
    }


    // ************************************************************************
    // Constructor
    // ************************************************************************
    window.Chart = function (parent, config) {

        var me = this; // For use in closures below.

        this.computed = {}; // For computed values, like the height of a bar for 1 value, etc.
        this.selectedSeries = null; // For (de)selecting the series by clicking the legend items.
        this.selectedColumnIndex = null; // The index of the currently selected column.
        this.hittableItems = [];
        this.hittableActiveItems = {};

        var lineChartConfig = Object.assign(defaultConfig.lineChart, config.lineChart || {});
        var barChartConfig = Object.assign(defaultConfig.barChart, config.barChart || {});
        var paddingConfig = Object.assign(defaultConfig.padding, config.padding || {});
        this.config = Object.assign(defaultConfig, config);
        this.config.lineChart = lineChartConfig;
        this.config.barChart = barChartConfig;
        this.config.padding = paddingConfig;

        // Create the canvas and add it to the DOM.
        var parentRect = parent.getBoundingClientRect();
        var canvas = document.createElement('canvas');
        canvas.style.width = parentRect.width + 'px';
        canvas.style.height = parentRect.height + 'px';
        canvas.width = parentRect.width * scale;
        canvas.height = parentRect.height * scale;
        parent.appendChild(canvas);
        this.canvas = canvas;

        if (this.config.backgroundColor) {
            canvas.style.backgroundColor = this.config.backgroundColor;
        }

        this.valueDiv = document.createElement('div');
        this.valueDiv.id = "my-chart-value-div";

        var context = canvas.getContext('2d');
        context.scale(scale, scale);
        context.font = this.config.font;

        canvas.addEventListener('mousemove', function (e) {
            var pos = getMousePos.call(me, e);
            for (var i = 0; i < me.hittableItems.length; i++) {
                var item = me.hittableItems[i];
                if (pos.x > item.x && pos.x < (item.x + item.w) && pos.y > item.y && pos.y < (item.y + item.h)) {
                    me.hittableActiveItems[getHitItemString(item)] = true;
                }
            }
            me.canvas.style.cursor = Object.keys(me.hittableActiveItems).length === 0 ? 'default' : 'pointer';
            me.draw();
        });

        canvas.addEventListener('click', function (e) {

            if (me.valueDiv.parentNode) {
                me.valueDiv.parentNode.removeChild(me.valueDiv);
                me.valueDiv.innerHTML = '';
            }

            // Handle click on legend
            var pos = getMousePos.call(me, e);
            var mustDraw = false;
            for (var item of me.hittableItems) {
                if (pos.x > item.x && pos.x < (item.x + item.w) && pos.y > item.y && pos.y < (item.y + item.h)) {
                    switch (item.type) {
                        case 'legend':
                            me.selectedSeries[item.name] = !me.selectedSeries[item.name];
                            mustDraw = true;
                            break;
                        case 'column':
                            var index = getIndexForClick.call(me, pos.x, pos.y);
                            me.selectedColumnIndex = index;
                            mustDraw = true;
                            break;
                        case 'point':
                            me.valueDiv.style.left = (pos.x + 2) + "px";
                            me.valueDiv.style.top = (pos.y + 20) + "px";
                            me.valueDiv.innerHTML += '<div>' + (item.serie.title + ': ' + item.value) + '</div>';
                            break;
                        case 'bar':
                            me.valueDiv.style.left = (pos.x + 2) + "px";
                            me.valueDiv.style.top = (pos.y + 20) + "px";
                            me.valueDiv.innerHTML += '<div>' + (item.serie.title + ': ' + item.value) + '</div>';
                            break;
                    }
                }
            }
            if (mustDraw) {
                me.draw();
            }

            if (me.valueDiv.innerHTML) {
                parent.appendChild(me.valueDiv);
            }

            // Other click things
            if (me.config.onClick) {
                var index = getIndexForClick.call(me, pos.x, pos.y);
                if (index !== null) {
                    if (me.config.onClick) {
                        me.config.onClick(index, me);
                    }
                }
            }

        });

        this.context = context;
        this.chartHeight = parentRect.height - this.config.padding.top - this.config.padding.bottom;
        this.chartWidth = parentRect.width - this.config.padding.start - this.config.padding.end;
        this.parentRect = parentRect;
    };

    function getMousePos(e) {
        var canvasRect = this.canvas.getBoundingClientRect();
        return {
            x: e.clientX - canvasRect.left,
            y: e.clientY - canvasRect.top
        };
    }

    window.Chart.prototype.draw = function (data) {

        if (data) {
            this.data = data;
        }

        this.hittableItems = [];

        if (this.selectedSeries === null) {
            this.selectedSeries = {};
            this.data.series.forEach(function (serie) {
                this.selectedSeries[serie.name] = true;
            }, this);
        }

        this.computed.columnWidth = this.chartWidth / this.data.xAxis.columns.length;
        if (this.config.barChart.spaceBetweenBars === null || typeof this.config.barChart.spaceBetweenBars === 'undefined') {
            this.config.barChart.spaceBetweenBars = this.chartWidth / this.data.xAxis.columns.length / 2;
        }
        this.computed.barWidth = this.computed.columnWidth - this.config.barChart.spaceBetweenBars;

        this.config.yAxisMin = this.config.yAxisMin || 0;
        var yAxisMax = this.config.yAxisMax;
        if (yAxisMax === null || typeof yAxisMax === 'undefined') {
            yAxisMax = 0;
            this.data.series.forEach(function (serie) {
                var max = serie.values.reduce(function (a, b) {
                    return Math.max(a, b);
                }, 0);
                if (max > yAxisMax) {
                    yAxisMax = max;
                }
            });
        }
        this.config.yAxisMax = yAxisMax;

        this.computed.valueToHeight = this.chartHeight / (this.config.yAxisMax - this.config.yAxisMin);

        // Erase complete canvas
        this.context.save();
        this.context.fillStyle = this.config.backgroundColor || 'white';
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.context.restore();

        if (this.config.onDrawBefore) {
            this.config.onDrawBefore(this);
        }

        this.data.series.forEach(function (serie, index) {
            if (index === 0) {
                if (this.config.title) {
                    drawChartTitle.call(this);
                }
                if (this.config.writeXAxisLabels || this.config.xAxisGrid) {
                    drawXAxisLabels.call(this);
                }
                if (this.config.writeYAxisLabels || this.config.yAxisGrid) {
                    drawYAxisLabels.call(this);
                }
                if (this.selectedColumnIndex !== null) {
                    drawSelectedColumnIndex.call(this);
                }
                if (this.config.yAxisTitle) {
                    drawYAxisTitle.call(this);
                }
                if (this.config.xAxisTitle) {
                    drawXAxisTitle.call(this);
                }
            }
            if (!this.selectedSeries[serie.name]) {
                return;
            }
            switch (serie.type) {
                case 'line':
                    drawLineChart.call(this, serie);
                    break;
                case 'bar':
                    drawBarChart.call(this, serie);
                    break;
            }
        }, this);

        if (this.config.legend) {
            drawLegend.call(this);
        }

        this.hittableActiveItems = {};
    };

    function drawChartTitle() {
        this.context.save();
        this.context.fillStyle = 'black';
        this.context.font = "bold 16px arial";
        this.context.textAlign = "center";
        this.context.textBaseline = "top";
        this.context.fillText(this.config.title,
            this.parentRect.width / 2,
            this.config.titleTop);
        this.context.restore();
    }

    function drawXAxisTitle() {
        this.context.save();
        this.context.fillStyle = 'black';
        this.context.font = "bold 16px arial";
        this.context.textAlign = "right";
        this.context.textBaseline = "bottom";
        this.context.fillText(this.config.xAxisTitle,
            this.parentRect.width - this.config.padding.end,
            this.parentRect.height - 10);
        this.context.restore();

    };

    function drawYAxisTitle() {
        this.context.save();
        this.context.fillStyle = 'black';
        this.context.font = "bold 16px arial";
        this.context.textAlign = "left";
        this.context.textBaseline = "middle";
        var textWidth = this.context.measureText(this.config.yAxisTitle).width;
        this.context.translate(20, this.config.padding.top + textWidth);
        this.context.rotate(-(Math.PI / 2));
        this.context.fillText(this.config.yAxisTitle,
            0,
            0);
        this.context.restore();

    };

    window.Chart.prototype.updateSelectedColumnIndex = function (index) {
        this.selectedColumnIndex = index;
    }

    function drawSelectedColumnIndex() {
        this.context.save();
        this.context.fillStyle = 'rgb(255, 255, 255, 0.6)';
        var x = this.config.padding.start + (this.computed.columnWidth * this.selectedColumnIndex);
        this.context.fillRect(x, this.config.padding.top, this.computed.columnWidth, this.chartHeight);
        this.context.restore();
    }

    function getIndexForClick(x, y) {
        var xIndex = Math.floor((x - this.config.padding.start) / this.computed.columnWidth);
        if (xIndex >= 0 && xIndex < this.data.xAxis.columns.length) {
            return xIndex;
        }
        return null;
    };


    // ************************************************************************
    // Chart draw methods
    // ************************************************************************
    function drawBarChart(serie) {
        this.context.save();
        //this.context.fillStyle = serie.color;
        serie.values.forEach(function (value, index) {
            var x = getBarXStart.call(this, index);
            var y = value * this.computed.valueToHeight;
            var hitItem = {
                x: x,
                y: this.chartHeight - y + this.config.padding.top,
                w: this.computed.barWidth,
                h: y,
                type: 'bar',
                serie: serie,
                value: value
            };
            this.hittableItems.push(hitItem);
            // Kan denk ik ook met indexes, dat is denk ik ook iets meer performanr...
            this.context.fillStyle = this.hittableActiveItems[getHitItemString(hitItem)] ? updateRgbAlpha(serie.color, 0.2) : serie.color;
            this.context.fillRect(x, this.chartHeight - y + this.config.padding.top, this.computed.barWidth, y);
        }, this);
        this.context.restore();
    }

    function _drawCurves(pointsLists, ctx) {
        pointsLists.forEach(function (pointList) {
            drawCurves(pointList, ctx);
        });
    }

    // https://stackoverflow.com/questions/7054272/how-to-draw-smooth-curve-through-n-points-using-javascript-html5-canvas
    function drawCurves(points, ctx) {
        ctx.moveTo((points[0].x), points[0].y);
        for (var i = 0; i < points.length - 1; i++) {
            var x_mid = (points[i].x + points[i + 1].x) / 2;
            var y_mid = (points[i].y + points[i + 1].y) / 2;
            var cp_x1 = (x_mid + points[i].x) / 2;
            var cp_x2 = (x_mid + points[i + 1].x) / 2;
            ctx.quadraticCurveTo(cp_x1, points[i].y, x_mid, y_mid);
            ctx.quadraticCurveTo(cp_x2, points[i + 1].y, points[i + 1].x, points[i + 1].y);
        }
        ctx.stroke();
    }


    function drawLineChart(serie) {
        this.context.save();
        this.context.lineJoin = 'round';
        this.context.lineCap = 'round';
        this.context.lineWidth = this.config.lineChart.width;
        this.context.beginPath();
        this.context.strokeStyle = serie.color || 'black';
        var previousPoint = null;
        var points = [];
        var tmpPoints = [];
        var pointsLists = [];

        serie.values.forEach(function (value, index) {

            var x = getLineX.call(this, index);
            var y = getY.call(this, value);

            var point = { x: x, y: y, value: value, serie: serie };

            if (value !== null) {
                if (index === 0 || (!this.config.lineChart.connectNullValues && previousPoint.value === null)) {
                    if (index > 0) {
                        pointsLists.push(tmpPoints.slice(0));
                        tmpPoints = [];
                    }
                    if (!this.config.lineChart.smooth) {
                        this.context.moveTo(x, y);
                    }
                } else {
                    if (!this.config.lineChart.smooth) {
                        this.context.lineTo(point.x, point.y);
                    }
                }
                tmpPoints.push(point);
                points.push(point);
            }

            previousPoint = point;

        }, this);
        if (!this.config.lineChart.smooth) {
            this.context.stroke();
        }

        pointsLists.push(tmpPoints);

        if (this.config.lineChart.smooth) {
            if (this.config.lineChart.connectNullValues) {
                drawCurves(points, this.context);
            } else {
                _drawCurves(pointsLists, this.context);
            }
        }

        if (this.config.lineChart.showPoints) {
            this.context.beginPath();
            this.context.fillStyle = serie.color || 'black';
            var pointWidth = this.config.lineChart.pointWidth || (this.config.lineChart.width * 2);
            points.forEach(function (point) {
                this.context.moveTo(point.x, point.y);
                if (this.config.lineChart.showClickedPointValue) {
                    // TODO: work with real circle detection (distance <= radius)
                    // https://stackoverflow.com/questions/60367198/how-to-detect-when-mouse-is-outside-of-a-certain-circle
                    var hitItem = {
                        x: point.x - pointWidth,
                        y: point.y - pointWidth,
                        w: pointWidth * 2,
                        h: pointWidth * 2,
                        type: 'point',
                        serie: point.serie,
                        value: point.value
                    };
                    this.hittableItems.push(hitItem);
                }
                this.context.arc(point.x, point.y, this.hittableActiveItems[getHitItemString(hitItem)] ? (pointWidth + (pointWidth / 2)) : pointWidth, 0, Math.PI * 2);
            }, this);
            this.context.fill();
        }

        // if (this.config.lineChart.fillArea) {
        //     this.context.fillStyle = updateRgbAlpha(serie.color, 0.2);
        //     points.forEach(function (point, index) {

        //         if (index + 1 < points.length) {

        //             if (!this.config.lineChart.connectNullValues && (point.value === null || points[index + 1].value === null)) {
        //                 return;
        //             }

        //             var nextPoint = points[index + 1];


        //             this.context.beginPath();
        //             this.context.moveTo(point.x, getY.call(this, 0));

        //             this.context.lineTo(point.x, point.y);
        //             this.context.lineTo(nextPoint.x, nextPoint.y);
        //             this.context.lineTo(nextPoint.x, getY.call(this, 0));
        //             this.context.fill();
        //         }
        //     }, this);
        // }

        this.context.restore();
    }

    function drawLegend() {
        this.context.save();
        this.context.textAlign = 'start';
        this.context.textBaseline = 'top';
        var maxTextWidth = 0;
        var textHeight = 20;
        this.data.series.forEach(function (serie) {
            var mt = this.context.measureText(serie.title);
            var width = mt.width;
            if (width > maxTextWidth) {
                maxTextWidth = width;
            }
        }, this);
        var x = this.config.padding.start + this.chartWidth + 10;
        this.data.series.forEach(function (serie, index) {
            var y = this.config.padding.top + (index * textHeight);
            this.context.fillStyle = this.selectedSeries[serie.name] ? serie.color : (colorIsHex(serie.color) ? hexToRGB(serie.color, 0.2) : updateRgbAlpha(serie.color, 0.2));
            this.context.fillRect(x, y, 10, 10);
            this.context.fillStyle = 'rgb(0, 0, 0, ' + (this.selectedSeries[serie.name] ? 1 : 0.2) + ')';

            var mt = this.context.measureText(serie.title || serie.name);
            var hitItem = { x: x, y: y, w: mt.width + 20, h: 10, type: 'legend', name: serie.name };
            this.hittableItems.push(hitItem);
            this.context.font = this.hittableActiveItems[getHitItemString(hitItem)] ? 'bold 12px sans-serif' : '12px sans-serif';
            this.context.fillText(serie.title || serie.name, x + 20, y);
        }, this);
        this.context.restore();
    }


    // ************************************************************************
    // Draw axis labels and grids
    // ************************************************************************
    function drawXAxisLabels() {
        this.context.save();
        this.context.textAlign = 'center';
        this.context.textBaseline = 'top';
        this.context.fillStyle = 'black';
        this.context.strokeStyle = this.config.xAxisGridColor || 'rgba(0, 0, 0, 0.2)';
        if (this.config.xAxisGridDashed) {
            this.context.setLineDash([2, 2]);
        }
        this.context.lineWidth = 1;
        this.context.beginPath();
        for (var index = 0; index < this.data.xAxis.columns.length; index += this.config.xAxisStep) {
            var x = getLineX.call(this, index);
            var gridX = x;
            if (this.config.xAxisGridLineHalf) {
                gridX -= (this.computed.columnWidth / 2);
            }
            this.context.font = this.selectedColumnIndex === index ? "bold 12px sans-serif" : "12px sans-serif"; // TODO: make font in config...
            this.context.fillText(this.data.xAxis.columns[index], x, this.chartHeight + this.config.padding.top + 10);
            var lineX = Math.round(gridX) + 0.5; // needed so lines with width of 1 look clear and not blurred.
            this.context.moveTo(lineX, this.chartHeight + this.config.padding.top);
            this.context.lineTo(lineX, this.config.padding.top);
            if (this.config.highlightClickedColumn) {
                this.hittableItems.push({
                    x: lineX - (!this.config.xAxisGridLineHalf ? (this.computed.columnWidth / 2) : 0),
                    y: this.config.padding.top,
                    w: this.computed.columnWidth,
                    h: this.chartHeight,
                    type: 'column'
                });
            }
        }
        if (this.config.xAxisGrid) {
            this.context.stroke();
        }
        this.context.restore();
    }

    // TODO: reuse from drawXAxisLabels!
    function drawYAxisLabels() {
        this.context.save();
        this.context.textAlign = 'end';
        this.context.textBaseline = 'middle';
        this.context.strokeStyle = this.config.yAxisGridColor || 'rgba(0, 0, 0, 0.2)';
        this.context.lineWidth = 1;
        if (this.config.yAxisGridDashed) {
            this.context.setLineDash([2, 2]);
        }
        var curValue = this.config.yAxisMin;
        this.context.beginPath();
        while (curValue <= this.config.yAxisMax) {
            var y = this.chartHeight - (curValue * this.computed.valueToHeight) + this.config.padding.top;
            if (this.config.writeYAxisLabels) {
                this.context.fillText(curValue, this.config.padding.start - 10, y);
            }
            // Make sure y.5 if we have line width of 1!
            // see: https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Applying_styles_and_colors#a_linewidth_example
            var lineY = Math.round(y) + 0.5;
            this.context.moveTo(this.config.padding.start, lineY);
            this.context.lineTo(this.chartWidth + this.config.padding.start, lineY);
            curValue += this.config.yAxisStep;
        }
        if (this.config.yAxisGrid) {
            this.context.stroke();
        }
        this.context.restore();
    }

}(this));