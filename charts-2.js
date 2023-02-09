(function (window) {

    // Catmull–Rom spline (4 points)
    // https://dev.to/ndesmic/splines-from-scratch-catmull-rom-3m66 
    // https://codepen.io/tkdave/pen/BjNGdx
    // https://github.com/gdenisov/cardinal-spline-js

    var scale = window.devicePixelRatio;

    // ************************************************************************
    // Helper functions
    // ************************************************************************
    function getLineX(valueIndex, lineConfig, config) {
        return (valueIndex * config.columnWidth) + (config.columnWidth / 2) + config.padding.start;
    }

    function getY(value, chartHeight, lineOrBarConfig, config) {
        return chartHeight - ((value || 0) * lineOrBarConfig.oneSeriesValueHeight) + config.padding.top;
    }

    function getBarXStart(valueIndex, barConfig, config) {
        return (valueIndex * config.columnWidth) + (barConfig.spaceBetweenBars / 2) + config.padding.start;
    }

    function gradient(a, b) {
        return (b.y - a.y) / (b.x - a.x);
    }

    // Start Spline
    var SPLINE_STEPS = 50, X = 0, Y = 1, T = 2;
    function spline(p0, p1, p2, p3, t) {
        return 0.5 * ((2 * p1) + t * ((-p0 + p2) + t * ((2 * p0 - 5 * p1 + 4 * p2 - p3) + t * (-p0 + 3 * p1 - 3 * p2 + p3))));
    }

    // Update the path with distance stamps for each coordinate
    function getSplinePath(path) {
        // don't touch original config data
        var path2 = path.slice(0);

        // calculate distances (like time stamps for each point on the path)
        var d = 0;
        path2.forEach(function (p1, i) {
            if (i > 0) {
                var p0 = path2[i - 1];
                d += distance(p0, p1);
            }
            // add distance/time stamp to pt (assuming fixed speed for now)
            p1[T] = d;
        });
        return path2;
    }

    // find the index for the last point/keyframe before the percent
    function getSplineIndexForPercent(path, percent) {
        // uses pre-computed distances
        var path_dist = path.slice(-1)[0][T];
        var current_dist = percent * path_dist;
        var point_idx = -1;
        var n = path.length;
        // find most recently passed keyframe
        for (var i = 0; i < n; i++) {
            // find last keyframe
            if (path[i][T] <= current_dist) {
                point_idx = i;
            } else {
                continue;
            }
        }

        return point_idx;
    }

    function distance(p1, p2) {
        var dx = p2[X] - p1[X];
        var dy = p2[Y] - p1[Y];
        return Math.sqrt(dx * dx + dy * dy);
    }
    // End Spline

    // https://stackoverflow.com/a/28056903
    function hexToRGB(hex, alpha) {
        var r = parseInt(hex.slice(1, 3), 16),
            g = parseInt(hex.slice(3, 5), 16),
            b = parseInt(hex.slice(5, 7), 16);

        if (alpha) {
            return "rgba(" + r + ", " + g + ", " + b + ", " + alpha + ")";
        } else {
            return "rgb(" + r + ", " + g + ", " + b + ")";
        }
    }

    var rgbaReg = /^rgba/;
    var hexReg = /^#/;

    function colorIsRgba(color) {
        return rgbaReg.test(color);
    }

    function colorIsHex(color) {
        return hexReg.test(color);
    }

    function updateRgbAlpha(rgba, newAlpha) {
        return rgba.replace(/,([^,]+)\)$/, function (match, p1) { return ',' + newAlpha + ')'; });
    }


    // ************************************************************************
    // Constructor
    // ************************************************************************
    window.Chart = function (parent, config, data) {

        var me = this;

        this._hittableItems = {}; // for hitregion detection, we store the object together with the coordinates.
        this.selectedSeries = {}; // from this.data.series, name => true|false
        data.series.forEach(function(serie) {
            this.selectedSeries[serie.name] = true;
        }, this);

        this.selectedIndex = null;

        this.config = this._getConfig(config);

        var parentRect = parent.getBoundingClientRect();
        var parentWidth = parentRect.width;
        var parentHeight = parentRect.height;

        var canvas = document.createElement('canvas');
        canvas.style.width = parentWidth + 'px';
        canvas.style.height = parentHeight + 'px';
        canvas.width = parentWidth * scale;
        canvas.height = parentHeight * scale;
        parent.appendChild(canvas);
        this.canvas = canvas;

        if (this.config.backgroundColor) {
            canvas.style.backgroundColor = this.config.backgroundColor;
        }

        var context = canvas.getContext('2d');
        context.scale(scale, scale);

        canvas.addEventListener('click', function (e) {

            // Handle click on legend
            var pos = me.getMousePos(e);
            for (var key in me._hittableItems) {
                var item = me._hittableItems[key];
                if (pos.x > item.x && pos.x < (item.x + item.w) && pos.y > item.y && pos.y < (item.y + item.h)) {
                    me.selectedSeries[key] = !me.selectedSeries[key];
                    me.draw();
                    return;
                }
            }

            // Other click things
            if (me.config.onClick || me.config.highlightClicked) {
                var index = me.getIndexForClick(e.offsetX);
                if (me.config.highlightClicked) {
                    me.selectedIndex = index;
                    me.draw();
                }
                if (index !== null) {
                    if (me.config.onClick) {
                        me.config.onClick(index, me);
                    }
                }
            }


        });

        // Get highest series value if not given;
        // Update color to rgba if given in hex.
        var maxSeriesValue = config.maxSeriesValue;
        var minSeriesValue = config.minSeriesValue || 0;
        if (typeof maxSeriesValue === 'undefined') {
            maxSeriesValue = 0;
            data.series.forEach(function (serie) {
                if (serie.color && colorIsHex(serie.color)) {
                    serie.color = hexToRGB(serie.color, 1);
                }
                var max = serie.values.reduce(function (a, b) {
                    return Math.max(a, b);
                }, 0);
                if (max > maxSeriesValue) {
                    maxSeriesValue = max;
                }
            });
        }

        // Set general props we need in multiple methods
        this.data = data;
        this.maxSeriesValue = maxSeriesValue;
        this.minSeriesValue = minSeriesValue;
        this.context = context;
        this.chartHeight = parentHeight - this.config.padding.top - this.config.padding.bottom;
        this.chartWidth = parentWidth - this.config.padding.start - this.config.padding.end;
        this.parentWidth = parentWidth;

        this.config.columnWidth = this.chartWidth / data.xAxis.columns.length;

    };

    window.Chart.prototype.getMousePos = function(e) {
        var r = this.canvas.getBoundingClientRect();
        return {
            x: e.clientX - r.left,
            y: e.clientY - r.top
        };
    }

    window.Chart.prototype.draw = function () {

        this._hittableItems = {};

        this.context.font = "12px sans-serif";

        this.context.save();

        if (this.config.backgroundColor) {
            this.context.fillStyle = this.config.backgroundColor;
        } else {
            this.context.fillStyle = 'white';
        }
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.context.restore();

        if (this.config.onDrawBefore) {
            this.config.onDrawBefore(this);
        }

        var firstWritten = false;

        this.data.series.forEach(function (serie, serieIndex) {

            if (!this.selectedSeries[serie.name]) {
                return;
            }

            var typeConfig = null;
            var typeFunc = null;
            switch (serie.type) {
                case 'line':
                    typeConfig = this._getLineConfig(this.config.line, serie.config);
                    typeFunc = this._drawLineChart;
                    break;
                case 'bar':
                    typeConfig = this._getBarConfig(this.config.bar, serie.config);
                    typeFunc = this._drawBarChart;
                    break;
            }
            if (!firstWritten) {
                firstWritten = true;
                if (this.config.writeXAxisLabels) {
                    this._drawXAxisLabels(typeConfig);
                }
                if (this.config.writeYAxisLabels) {
                    this._drawYAxisLabels(typeConfig);
                }
            }
            // Draw over gridlines, but below line or bar.
            if (this.selectedIndex !== null) {
                this._drawSelectedIndex();
            }
            typeFunc.call(this, serie, typeConfig);
        }, this);

        if (this.config.legend) {
            this._drawLegend();
        }
    };

    window.Chart.prototype._drawSelectedIndex = function () {
        this.context.save();
        this.context.fillStyle = 'rgb(255, 255, 255, 0.05)';
        var x = this.config.padding.start + (this.config.columnWidth * this.selectedIndex);
        this.context.fillRect(x, this.config.padding.top, this.config.columnWidth, this.chartHeight);
        this.context.restore();
    }

    window.Chart.prototype.getIndexForClick = function (pos) {
        var index = Math.floor((pos - this.config.padding.start) / this.config.columnWidth);
        if (index >= 0 && index < this.data.xAxis.columns.length) {
            return index;
        }
        return null;
    };


    // ************************************************************************
    // Private chart draw methods
    // ************************************************************************
    window.Chart.prototype._drawBarChart = function (serie, barConfig) {
        //barConfig = Object.assign(this._getBarConfig(barConfig), serie.config || {});
        this.context.save();
        this.context.fillStyle = serie.color;
        serie.values.forEach(function (value, valueIndex, values) {
            var x = getBarXStart(valueIndex, barConfig, this.config);
            //console.log('Bar ' + valueIndex + " = " + x);
            var y = value * barConfig.oneSeriesValueHeight;
            //console.log('Bar: ' + this.data.xAxis.columns[valueIndex] + ' = ' + value);
            this.context.fillRect(x, this.chartHeight - y + this.config.padding.top, barConfig.barWidth, y);
        }, this);
        this.context.restore();
        return barConfig;
    };

    // window.Chart.prototype._drawLineChartSpline = function (serie, lineConfig) {
    //     this.context.save();
    //     this.context.lineJoin = 'round';
    //     this.context.lineCap = 'round';
    //     this.context.lineWidth = lineConfig.lineWidth;
    //     this.context.strokeStyle = serie.color;
    //     var path = [];
    //     serie.values.forEach(function (value, valueIndex, values) {
    //         var x = getLineX(valueIndex, lineConfig, this.config);
    //         var y = getY(value, this.chartHeight, lineConfig, this.config);
    //         path.push([x, y]);
    //     }, this);
    //     path = getSplinePath(path);
    //     var start_pct = 0;
    //     var end_pct = 1.0;
    //     start_pct = Math.max(0, Math.min(start_pct, 1.0));
    //     end_pct = Math.max(0, Math.min(end_pct, 1.0));

    //     var p, x, y, i, j;
    //     var p0, p1, p2, p3;
    //     var n = path.length;
    //     var path_dist = path.slice(-1)[0][T];
    //     var start_dist = start_pct * path_dist;
    //     var end_dist = end_pct * path_dist;

    //     // starting and ending indexes
    //     var start_idx = getSplineIndexForPercent(path, start_pct);
    //     var end_idx = getSplineIndexForPercent(path, end_pct);

    //     this.context.beginPath();

    //     var t = start_dist;

    //     for (i = start_idx; i < Math.min(end_idx + 1, n); i++) {
    //         p = path[i];
    //         x = p[X];
    //         y = p[Y];
    //         p0 = path[Math.max(0, (i - 1))];
    //         p1 = path[i];
    //         p2 = path[Math.min((i + 1), n - 1)];
    //         p3 = path[Math.min((i + 2), n - 1)];

    //         // find pct to start at
    //         var sub_start_pct = 0;
    //         var sub_end_pct = 1.0;
    //         var steps = SPLINE_STEPS;
    //         var seg_len = (p2[T] - p1[T]);
    //         if (i == start_idx) {
    //             sub_start_pct = (start_dist - p1[T]) / seg_len;
    //         }
    //         if (i == end_idx && start_idx != n) {
    //             sub_end_pct = (end_dist - p1[T]) / seg_len;
    //         }

    //         // render catmull-rom spline curve
    //         var first_point = true,
    //             qx, qy;
    //         for (j = sub_start_pct; j <= sub_end_pct; j += (1.0 / steps)) {
    //             t = (path[i][T] + seg_len * j);
    //             qx = spline(p0[X], p1[X], p2[X], p3[X], j);
    //             qy = spline(p0[Y], p1[Y], p2[Y], p3[Y], j);
    //             if (first_point) {
    //                 this.context.moveTo(qx, qy);
    //                 first_point = false;
    //             } else {
    //                 this.context.lineTo(qx, qy);
    //             }
    //         }
    //         // make sure we complete the line
    //         qx = spline(p0[X], p1[X], p2[X], p3[X], sub_end_pct);
    //         qy = spline(p0[Y], p1[Y], p2[Y], p3[Y], sub_end_pct);

    //         this.context.lineTo(qx, qy);

    //     }
    //     this.context.stroke();
    // };

    // https://stackoverflow.com/a/39559854
    window.Chart.prototype._drawLineChart = function (serie, lineConfig) {
        //lineConfig = Object.assign(this._getLineConfig(lineConfig), serie.config || {});
        this.context.save();
        this.context.lineJoin = 'round';
        this.context.lineCap = 'round';
        this.context.lineWidth = lineConfig.lineWidth;
        // if (lineConfig.smoothCurves) {
        //     this.context.globalAlpha = 0.4;
        // }
        // If f = 0, this will be a straight line
        var f = 0.3;
        //var t = 0.6;
        var t = 0.6;
        this.context.beginPath();
        this.context.strokeStyle = serie.color;
        var valueLastIndex = serie.values.length - 1;
        var m = 0;
        var dx1 = 0;
        var dy1 = 0;
        var dx2 = 0;
        var dy2 = 0;
        var preP = null;
        var points = [];
        serie.values.forEach(function (value, valueIndex, values) {

            var x = getLineX(valueIndex, lineConfig, this.config);
            //console.log('Line ' + valueIndex + " = " + x);
            //var y = this.chartHeight - ((value || 0) * lineConfig.oneSeriesValueHeight) + this.config.padding.top;
            var y = getY(value, this.chartHeight, lineConfig, this.config);

            var point = { x: x, y: y, value: value };

            if (!lineConfig.connectNullValues && value === null) {
                points.push(point);
                // TODO: Fill area?
                preP = null;
                return;
            }

            //console.log('Line: ' + this.data.xAxis.columns[valueIndex] + ' = ' + value);
            if (valueIndex === 0 || preP === null) {
                this.context.moveTo(x, y);
                preP = { x: x, y: y };
            } else {
                var curP = { x: x, y: y };
                if (lineConfig.smoothCurves) {
                    if (valueIndex < valueLastIndex) {

                        var nexP = { x: getLineX(valueIndex + 1, lineConfig, this.config), y: values[valueIndex + 1] * lineConfig.oneSeriesValueHeight };
                        m = gradient(preP, nexP);
                        dx2 = (nexP.x - curP.x) * -f;
                        dy2 = dx2 * m * t;
                    } else {
                        dx2 = 0;
                        dy2 = 0;
                    }
                    this.context.bezierCurveTo(preP.x - dx1, preP.y - dy1, curP.x + dx2, curP.y + dy2, curP.x, curP.y);
                    point.bezier = {
                        cp1x: preP.x - dx1,
                        cp1y: preP.y - dy1,
                        cp2x: curP.x + dx2,
                        cp2y: curP.y + dy2,
                        x: curP.x,
                        y: curP.y
                    };
                    dx1 = dx2;
                    dy1 = dy2;
                } else {
                    this.context.lineTo(x, y);
                }
                preP = curP;
            }

            points.push(point);

        }, this);
        this.context.stroke();
        //this.context.fillStyle = 'rgba(255, 255, 130, 200)';
        //this.context.fill();

        if (lineConfig.points) {
            this.context.beginPath();
            this.context.fillStyle = serie.color;
            points.forEach(function (point) {
                if (point.value === null) {
                    return;
                }
                this.context.moveTo(point.x, point.y);
                this.context.arc(point.x, point.y, lineConfig.pointWidth || (lineConfig.lineWidth * 2), 0, Math.PI * 2);
            }, this);
            this.context.fill();
        }

        if (lineConfig.fillArea) {
            //this.context.fillStyle = serie.color;
            //this.context.fillStyle = 'rgba(245, 40, 145, 0.4)';
            this.context.fillStyle = updateRgbAlpha(serie.color, 0.2);
            points.forEach(function (point, index) {

                if (index + 1 < points.length) {

                    if (!lineConfig.connectNullValues && (point.value === null || points[index + 1].value === null)) {
                        return;
                    }

                    var nextPoint = points[index + 1];

                    //console.log('Area voor ' + index + ' en value ' + point.value + ' en x = ' + point.x);
                    this.context.beginPath();
                    this.context.moveTo(point.x, getY(0, this.chartHeight, lineConfig, this.config));

                    this.context.lineTo(point.x, point.y);

                    if (lineConfig.smoothCurves) {
                        this.context.bezierCurveTo(nextPoint.bezier.cp1x, nextPoint.bezier.cp1y, nextPoint.bezier.cp2x, nextPoint.bezier.cp2y, nextPoint.bezier.x, nextPoint.bezier.y);
                    } else {
                        this.context.lineTo(nextPoint.x, nextPoint.y);
                    }
                    this.context.lineTo(nextPoint.x, getY(0, this.chartHeight, lineConfig, this.config));
                    this.context.fill();
                }
            }, this);
            //this.context.fill();
        }

        this.context.restore();
        return lineConfig;
    };


    // TODO: placement, for now end top
    window.Chart.prototype._drawLegend = function () {
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
        var x = this.parentWidth - maxTextWidth - 10;
        this.data.series.forEach(function (serie, index) {
            var y = this.config.padding.top + (index * textHeight);
            this.context.fillStyle = this.selectedSeries[serie.name] ? serie.color : (colorIsHex(serie.color) ? hexToRGB(serie.color, 0.2) : updateRgbAlpha(serie.color, 0.2));
            this.context.fillRect(x - 20, y, 10, 10);
            this.context.fillStyle = 'rgb(0, 0, 0, ' + (this.selectedSeries[serie.name] ? 1 : 0.2) + ')';
            this.context.fillText(serie.title, x, y);
            var mt = this.context.measureText(serie.title);
            this._hittableItems[serie.title] = { x: x - 20, y: y, w: mt.width + 20, h: 10 };
        }, this);
        this.context.restore();
    };


    // ************************************************************************
    // Draw axis labels
    // ************************************************************************
    window.Chart.prototype._drawXAxisLabels = function (lineOrBarConfig) {
        this.context.save();
        this.context.textAlign = 'center';
        this.context.textBaseline = 'middle';
        this.context.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        this.context.lineWidth = 1;
        //this.context.setLineDash([2, 2]);
        this.context.beginPath();
        for (var index = 0; index < this.data.xAxis.columns.length; index += this.config.xAxisStep) {
            var x = getLineX(index, lineOrBarConfig, this.config);
            var gridX = x;
            if (this.config.xAxisGridLineHalf) {
                gridX -= (this.config.columnWidth / 2);
            }
            if (this.selectedIndex === index) {
                this.context.save();
                this.context.font = "bold 12px sans-serif";
            }
            this.context.fillText(this.data.xAxis.columns[index], x, this.chartHeight + this.config.padding.top + (this.config.padding.bottom / 2));
            if (this.selectedIndex === index) {
                this.context.restore();
            }
            var lineX = Math.round(gridX) + 0.5;
            this.context.moveTo(lineX, this.chartHeight + this.config.padding.top);
            this.context.lineTo(lineX, this.config.padding.top);
        }
        this.context.stroke();
        this.context.restore();
    };

    window.Chart.prototype._drawYAxisLabels = function (lineOrBarConfig) {
        this.context.save();
        this.context.textAlign = 'end';
        this.context.textBaseline = 'middle';
        this.context.strokeStyle = 'rgba(175, 177, 194, 0.54)';
        this.context.lineWidth = 1;
        this.context.setLineDash([2, 2]);
        var curValue = this.minSeriesValue;
        this.context.beginPath();
        while (curValue <= this.maxSeriesValue) {
            var y = this.chartHeight - (curValue * lineOrBarConfig.oneSeriesValueHeight) + this.config.padding.top;
            this.context.fillText(curValue, this.config.padding.start / 2, y);
            // Write line?
            // Make sure y.5 if we have line width of 1!
            // see: https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Applying_styles_and_colors#a_linewidth_example
            var lineY = Math.round(y) + 0.5;
            this.context.moveTo(this.config.padding.start, lineY);
            this.context.lineTo(this.chartWidth + this.config.padding.start, lineY);
            curValue += this.config.yAxisStep;
        }
        this.context.stroke();
        this.context.restore();
    };





    // ************************************************************************
    // Private config methods
    // ************************************************************************
    window.Chart.prototype._getConfig = function (config) {
        if (!config) config = {};
        return Object.assign({
            padding: {
                start: 10,
                end: 10,
                top: 10,
                bottom: 10
            },
            writeXAxisLabels: true,
            yAxisStep: 1,
            yAxisGrid: true,
            xAxisGrid: false,
            xAxisStep: 1,
            legend: false,
        }, config);
    };

    window.Chart.prototype._getBarConfig = function (barConfig, serieConfig) {
        if (!barConfig) barConfig = {};
        if (!serieConfig) serieConfig = {};

        var spaceBetweenBars = ('spaceBetweenBars' in serieConfig)
            ? serieConfig.spaceBetweenBars
            :
            (('spaceBetweenBars' in barConfig)
                ? barConfig.spaceBetweenBars
                : this.chartWidth / this.data.xAxis.columns.length / 2);
        return Object.assign({
            oneSeriesValueHeight: this.chartHeight / (this.maxSeriesValue - this.minSeriesValue),
            barWidth: this.config.columnWidth - spaceBetweenBars,
            spaceBetweenBars: spaceBetweenBars
        }, barConfig, serieConfig);
    };

    window.Chart.prototype._getLineConfig = function (lineConfig, serieConfig) {
        if (!lineConfig) lineConfig = {};
        if (!serieConfig) serieConfig = {};
        return Object.assign({
            smoothCurves: false,
            oneSeriesValueHeight: this.chartHeight / (this.maxSeriesValue - this.minSeriesValue),
            lineWidth: 1,
            points: false,
            connectNullValues: false,
            pointWidth: null,
            fillArea: false
        }, lineConfig, serieConfig);
    };

}(this));