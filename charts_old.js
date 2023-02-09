(function (win) {

    var Graph = win.Graph = function (graphType, canvas, data, config) {
        this.graphType = graphType;
        this.canvas = canvas;
        this.data = data;
        this.config = config;
        this.init();
    };

    Graph.prototype.init = function () {

        var maxValue, i, j, values, seriesValue;

        this.context = this.canvas.getContext("2d");
        this.dataLength = this.data.length;
        this.dataValuesLength = this.data[0].values.length;
        this.canvasHeight = this.canvas.height;
        this.canvasWidth = this.canvas.width;

        this.config.paddingRight = this.config.paddingRight || 10;
        this.config.paddingLeft = this.config.paddingLeft || 30;
        this.config.paddingTop = this.config.paddingTop || 10;
        this.config.paddingBottom = this.config.paddingBottom || 10;
        this.config.legendRightPadding = this.config.legendRightPadding || 10;
        this.config.fillStyle = this.config.fillStyle || "#ffffff";
        this.config.gridStrokeStyle = this.config.gridStrokeStyle || "#c0c0c0";
        this.config.labelColor = this.config.labelColor || "#000000";
        this.config.xLabelFillStyle = this.config.xLabelFillStyle || "#404040";
        this.config.yLabelFillStyle = this.config.yLabelFillStyle || this.config.xLabelFillStyle;

        this.config.series = this.config.series || [];

        this.plotTop = this.config.paddingTop;
        this.plotLeft = this.config.paddingLeft;
        this.plotHeight = this.canvasHeight - this.plotTop - this.config.paddingBottom;
        this.plotWidth = this.canvasWidth - this.config.paddingRight - this.config.paddingLeft;

        if (this.config.maxValue === undefined) {
            maxValue = 0;
            for (i = 0; i < this.dataLength; i++) {
                values = this.data[i].values;
                seriesValue = 0;
                for (j = 0; j < values.length; j++) {
                    if (values[j] > maxValue) {
                        maxValue = values[j];
                    }
                    seriesValue += values[j];
                }
                if (this.config.stacked && seriesValue > maxValue) {
                    maxValue = seriesValue;
                }
            }
            this.config.maxValue = maxValue;
        }

        this.valuePixelRatio = this.plotHeight / this.config.maxValue;

        this["init" + this.graphType]();

    };

    Graph.prototype.drawGridAndValues = function () {

        var ctx = this.context,
            gridValue = this.config.gridValue || Math.floor(this.config.maxValue / 10),
            currentValue = 0,
            x, y;

        ctx.save();

        ctx.textAlign = "right";
        ctx.textBaseline = "middle";
        ctx.strokeStyle = this.config.gridStrokeStyle;
        ctx.fillStyle = this.config.labelColor;
        ctx.lineWidth = 1;

        // De grootste waarde voor yTicks gebruik je om deze te positioneren op de x as
        var maxWidthWidth = ctx.measureText(this.config.maxValue.toString()).width;

        while (currentValue <= this.config.maxValue) {
            y = Math.floor(this.plotHeight + this.plotTop - (this.valuePixelRatio * currentValue)) + 0.5;
            ctx.moveTo(this.plotLeft, y);
            ctx.lineTo(this.plotLeft + this.plotWidth, y);
            ctx.fillText(currentValue, this.yTicksLeft + (this.yTicksWidth / 2) + maxWidthWidth / 2, y);
            currentValue += gridValue;
        }

        ctx.stroke();

        ctx.restore();

    };

    Graph.prototype.drawTitle = function () {
        var ctx = this.context;

        ctx.save();

        ctx.font = "bold 16px arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(this.config.title, this.plotLeft + (this.plotWidth / 2), this.config.paddingTop / 2);

        ctx.restore();
    };

    // Legend: als this.config.series.labels is gezet, dan deze gebruiken, anders de data labels
    Graph.prototype.drawLegend = function () {

        var ctx = this.context,
            maxTextWidth = 0,
            legendData = this.config.series.length ? this.config.series : this.data,
            i, d, legendWidth, x, y;

        ctx.save();

        for (i = 0; i < legendData.length; i++) {
            var d = legendData[i];
            var w = ctx.measureText(d.legendLabel || d.label).width;
            if (w > maxTextWidth) {
                maxTextWidth = w;
            }
        }
        legendWidth = maxTextWidth + 40;
        x = this.canvasWidth - legendWidth - this.config.legendRightPadding;
        y = 10;
        // Draw legend container
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(x, y, legendWidth, legendData.length * 20 + 10);

        // Draw labels
        for (i = 0; i < legendData.length; i++) {
            d = legendData[i];
            ctx.fillStyle = d.fillStyle;
            ctx.fillRect(x + 10, 20 + (i * 20), 10, 10);
            ctx.fillStyle = "black";
            ctx.textBaseline = "middle";
            ctx.fillText(d.legendLabel || d.label, x + 30, 20 + (i * 20) + 5);
        }

        ctx.restore();

    };

    Graph.prototype.draw = function () {

        this.context.save();

        this.context.fillStyle = this.config.fillStyle;
        this.context.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

        this.context.restore();

        if (this.config.title) {
            this.drawTitle();
        }

        this["draw" + this.graphType]();

        if (this.config.legend) {
            this.drawLegend();
        }

        if (this.config.fileName) {
            var url = this.canvas.toDataURL();
            var a = document.createElement("a");
            a.className = "graphCanvas";
            a.href = url;
            if (this.canvas.id) {
                a.setAttribute("data-canvasid", this.canvas.id);
            }
            var img = document.createElement("img");
            img.src = url;
            a.setAttribute("download", this.config.fileName);
            a.appendChild(img);
            this.canvas.parentNode.replaceChild(a, this.canvas);
        }

    };

    // LINES
    Graph.prototype.initLine = function () {
        if (this.config.barSpacing === undefined) {
            this.config.barSpacing = 10;
        }
        if (this.config.barWidth === undefined) {
            this.config.barWidth =
                (this.plotWidth - ((this.dataLength - 1) * this.config.barSpacing))
                / this.dataLength;
        }
        this.xTicksHeight = this.config.paddingBottom;
        this.xTicksTop = this.plotTop + this.plotHeight;
        if (this.config.xLabel) {
            this.xTicksHeight = this.xLabelHeight = this.config.paddingBottom / 2;
            this.xLabelTop = this.xTicksTop + this.xTicksHeight;
        }
        this.yTicksWidth = this.config.paddingLeft;
        this.yTicksLeft = 0;
        if (this.config.yLabel) {
            this.yTicksWidth = this.yLabelWidth = this.config.paddingLeft / 2;
            this.yLabelLeft = 0;
            this.yTicksLeft = this.yLabelWidth;
        }
        if (this.config.strokeStyle === undefined) {
            this.config.strokeStyle = "black";
        }
        if (this.config.lineWidth === undefined) {
            this.config.lineWidth = 4;
        }
    };



    Graph.prototype.drawLine = function () {

        var ctx = this.context,
            previousX = null, previousY = null,
            seriesSpacing = this.config.seriesSpacing || 10,
            barWidth = this.config.barWidth,
            halfBarWidth = barWidth / 2,
            i, j, h, d, x, y, dx, dValue, dTotalValue, dTotalHeight, shadowValue;

        if (this.dataValuesLength > 1 && !this.config.stacked) {
            barWidth = this.config.barWidth / this.dataValuesLength;
            barWidth -= seriesSpacing / 2;
        }

        this.drawGridAndValues();

        ctx.save();

        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.strokeStyle = this.config.strokeStyle;
        ctx.lineWidth = this.config.lineWidth;
        ctx.lineJoin = "miter";

        var valuesToDraw = [];

        for (j = 0; j < this.dataValuesLength; j++) {

            ctx.beginPath();

            for (i = 0; i < this.dataLength; i++) {

                d = this.data[i];
                //if (d.strokeStyles && d.strokeStyles.length) {
                //  ctx.strokeStyle = d.strokeStyles[j];
                //}
                if (this.config.series && this.config.series.length && this.config.series[j].fillStyle) {
                    ctx.strokeStyle = this.config.series[j].fillStyle;
                }

                dx = this.plotLeft + (i * (this.config.barWidth + this.config.barSpacing));
                dValue = 0;
                dTotalValue = 0;

                if (this.dataValuesLength > 1 && this.config.stacked) {
                    for (j = 0; j < d.values.length; j++) {
                        dTotalValue += d.values[j];
                    }
                }





                h = d.values[j] * this.valuePixelRatio;
                x = this.plotLeft + (i * (this.config.barWidth + this.config.barSpacing));
                y = this.plotTop + this.plotHeight - h;
                //if (this.dataValuesLength > 1) {
                //if (!this.config.stacked) {
                //    x += (j * (barWidth + seriesSpacing));
                //} else {
                //    y -= (dValue * this.valuePixelRatio)
                //}
                //}

                dValue += d.values[j];

                // Hiermee kun je ook nog de bar tekenen zodat je ze beide hebt:
                // ctx.fillRect(x,
                // y,
                // barWidth,
                // h);
                var realx = x + halfBarWidth;

                if (i == 0) {
                    ctx.moveTo(realx, y);
                } else {
                    ctx.lineTo(realx, y);
                }


                if (this.config.showValues) {
                    switch (this.config.showValues) {
                        case "inside":

                            valuesToDraw.push({
                                text: d.values[j],
                                x: x + halfBarWidth,
                                y: y + (h / 2)
                            });
                            break;
                        case "above": // fallthrough
                        default:

                            valuesToDraw.push({
                                text: d.values[j],
                                x: x + halfBarWidth,
                                y: y - 5
                            });
                            break;
                    }
                }

                if (d.label !== undefined && j === 0) {
                    ctx.fillText(d.label,
                        dx + (this.config.barWidth / 2),
                        this.xTicksTop + (this.xTicksHeight / 2));
                }

            }

            ctx.stroke();

        }

        valuesToDraw.forEach(function (v) {
            ctx.fillText(v.text, v.x, v.y);
        });

        if (this.config.xLabel) {
            ctx.save();
            ctx.fillStyle = this.config.xLabelFillStyle;
            ctx.font = "bold 12px arial";
            ctx.textAlign = "right";
            ctx.textBaseline = "middle";
            ctx.fillText(this.config.xLabel,
                this.plotLeft + this.plotWidth,
                this.xLabelTop + (this.xLabelHeight / 2));
            ctx.restore();
        }

        if (this.config.yLabel) {
            ctx.save();
            ctx.fillStyle = this.config.yLabelFillStyle;
            ctx.font = "bold 12px arial";
            ctx.textAlign = "left";
            ctx.textBaseline = "middle";
            var textWidth = ctx.measureText(this.config.yLabel).width;
            ctx.translate(this.yLabelWidth / 2, this.plotTop + textWidth);
            ctx.rotate(-(Math.PI / 2));
            ctx.fillText(this.config.yLabel,
                0,
                0);
            ctx.restore();
        }

        ctx.restore();

    };

    // BAR
    Graph.prototype.initBar = function () {
        if (this.config.barSpacing === undefined) {
            this.config.barSpacing = 10;
        }
        if (this.config.barWidth === undefined) {
            this.config.barWidth =
                (this.plotWidth - ((this.dataLength - 1) * this.config.barSpacing))
                / this.dataLength;
        }
        this.xTicksHeight = this.config.paddingBottom;
        this.xTicksTop = this.plotTop + this.plotHeight;
        if (this.config.xLabel) {
            this.xTicksHeight = this.xLabelHeight = this.config.paddingBottom / 2;
            this.xLabelTop = this.xTicksTop + this.xTicksHeight;
        }
        this.yTicksWidth = this.config.paddingLeft;
        this.yTicksLeft = 0;
        if (this.config.yLabel) {
            this.yTicksWidth = this.yLabelWidth = this.config.paddingLeft / 2;
            this.yLabelLeft = 0;
            this.yTicksLeft = this.yLabelWidth;
        }
    };



    Graph.prototype.drawBar = function () {

        var ctx = this.context,
            seriesSpacing = this.config.seriesSpacing || 10,
            barWidth = this.config.barWidth,
            i, j, h, d, x, y, dx, dValue, dTotalValue, dTotalHeight, shadowValue;

        ctx.save();

        if (this.dataValuesLength > 1 && !this.config.stacked) {
            barWidth = this.config.barWidth / this.dataValuesLength;
            barWidth -= seriesSpacing / 2;
        }



        this.drawGridAndValues();

        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        var valuesToDraw = [];

        for (i = 0; i < this.dataLength; i++) {

            d = this.data[i];

            dx = this.plotLeft + (i * (this.config.barWidth + this.config.barSpacing));
            dValue = 0;
            dTotalValue = 0;

            if (this.dataValuesLength > 1 && this.config.stacked) {
                for (j = 0; j < d.values.length; j++) {
                    dTotalValue += d.values[j];
                }
            }

            for (j = 0; j < d.values.length; j++) {

                ctx.save();

                h = d.values[j] * this.valuePixelRatio;
                x = this.plotLeft + (i * (this.config.barWidth + this.config.barSpacing));
                y = this.plotTop + this.plotHeight - h;
                if (this.dataValuesLength > 1) {
                    if (!this.config.stacked) {
                        x += (j * (barWidth + seriesSpacing));
                    } else {
                        y -= (dValue * this.valuePixelRatio)
                    }
                }

                dValue += d.values[j];

                if (dTotalValue || !this.config.stacked) {
                    shadowValue = dTotalValue || d.values[j];
                    ctx.save();
                    ctx.fillStyle = "#666";
                    ctx.shadowColor = "#666";
                    ctx.shadowOffsetX = 4;
                    ctx.shadowOffsetY = 2;
                    ctx.shadowBlur = 8;
                    dTotalHeight = shadowValue * this.valuePixelRatio;
                    ctx.fillRect(x,
                        this.plotTop + this.plotHeight - dTotalHeight,
                        barWidth,
                        dTotalHeight);
                    dTotalValue = 0; // zodat deze NIET meer wordt getekend!
                    ctx.restore();
                }



                ctx.fillStyle = (this.config.series.length && this.config.series[j].fillStyle)
                    || d.fillStyle;

                ctx.fillRect(x,
                    y,
                    barWidth,
                    h);

                ctx.restore();


                if (this.config.showValues) {
                    switch (this.config.showValues) {
                        case "inside":

                            valuesToDraw.push({
                                text: d.values[j],
                                x: x + (this.config.barWidth / 2),
                                y: y + (h / 2)
                            });
                            break;
                        case "above": // fallthrough
                        default:

                            valuesToDraw.push({
                                text: d.values[j],
                                x: x + (this.config.barWidth / 2),
                                y: y - 5
                            });
                            break;
                    }
                }

            }

            if (d.label !== undefined) {
                ctx.fillText(d.label,
                    dx + (this.config.barWidth / 2),
                    this.xTicksTop + (this.xTicksHeight / 2));
            }
        }

        valuesToDraw.forEach(function (v) {
            ctx.fillText(v.text, v.x, v.y);
        });

        if (this.config.xLabel) {
            ctx.fillStyle = this.config.xLabelFillStyle;
            ctx.font = "bold 12px arial";
            ctx.textAlign = "right";
            ctx.textBaseline = "middle";
            ctx.fillText(this.config.xLabel,
                this.plotLeft + this.plotWidth,
                this.xLabelTop + (this.xLabelHeight / 2));
        }

        if (this.config.yLabel) {
            ctx.save();
            ctx.fillStyle = this.config.yLabelFillStyle;
            ctx.font = "bold 12px arial";
            ctx.textAlign = "left";
            ctx.textBaseline = "middle";
            var textWidth = ctx.measureText(this.config.yLabel).width;
            ctx.translate(this.yLabelWidth / 2, this.plotTop + textWidth);
            ctx.rotate(-(Math.PI / 2));
            ctx.fillText(this.config.yLabel,
                0,
                0);
            ctx.restore();
        }

        ctx.restore();

    };


    // PIE
    Graph.prototype.initPie = function () {
        this.total = 0;
        for (var i = 0; i < this.data.length; i++) {
            this.total += this.data[i].values[0];
        }
    };


    Graph.prototype.drawPie = function () {
        var centerX = this.plotLeft + (this.plotWidth / 2);
        var centerY = this.plotTop + (this.plotHeight / 2);
        var ctx = this.context;
        ctx.save();
        var lastend = 0;

        ctx.save();
        // shadow
        ctx.fillStyle = "#666";
        ctx.shadowColor = "#666";
        ctx.shadowOffsetX = 4;
        ctx.shadowOffsetY = 2;
        ctx.shadowBlur = 8;
        ctx.arc(centerX, centerY, this.plotHeight / 2, 0, (Math.PI / 180) * 360);
        ctx.fill();
        ctx.restore();

        for (var i = 0; i < this.data.length; i++) {

            var d = this.data[i];
            var angleToAdd = Math.PI * 2 * (d.values[0] / this.total);

            ctx.fillStyle = d.fillStyle;
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, this.plotHeight / 2,
                lastend,
                lastend + angleToAdd,
                false);
            ctx.lineTo(centerX, centerY);
            ctx.fill();
            lastend += angleToAdd;
        }

        ctx.restore();
    };

}(this));