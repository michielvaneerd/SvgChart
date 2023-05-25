(() => {
  var __accessCheck = (obj, member, msg) => {
    if (!member.has(obj))
      throw TypeError("Cannot " + msg);
  };
  var __privateGet = (obj, member, getter) => {
    __accessCheck(obj, member, "read from private field");
    return getter ? getter.call(obj) : member.get(obj);
  };
  var __privateAdd = (obj, member, value) => {
    if (member.has(obj))
      throw TypeError("Cannot add the same private member more than once");
    member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
  };
  var __privateSet = (obj, member, value, setter) => {
    __accessCheck(obj, member, "write to private field");
    setter ? setter.call(obj, value) : member.set(obj, value);
    return value;
  };
  var __privateMethod = (obj, member, method) => {
    __accessCheck(obj, member, "access private method");
    return method;
  };

  // src/utils.ts
  var ns = "http://www.w3.org/2000/svg";
  var attributesCamelCaseToDashRegex = /[A-Z]/g;
  var classNamePrefix = "svg-chart-";
  function el(name, attributes = {}, child = null) {
    var el2 = document.createElementNS(ns, name);
    Object.keys(attributes).forEach((key) => {
      if (attributes[key] === null) {
        return;
      }
      switch (key) {
        case "className":
          if (attributes[key]) {
            el2.classList.add(...attributes[key].trim().split(" "));
          }
          break;
        default:
          el2.setAttribute(key.replace(attributesCamelCaseToDashRegex, "-$&").toLowerCase(), attributes[key]);
          break;
      }
    });
    if (child) {
      el2.appendChild(child);
    }
    return el2;
  }
  function parent(currentElement, parentName) {
    var el2 = currentElement;
    while (el2 && el2.nodeName.toLowerCase() !== parentName.toLowerCase()) {
      el2 = el2.parentNode;
    }
    return el2;
  }
  function prefixed(className) {
    return classNamePrefix + className;
  }
  function directionForEach(instance, items, isRTL, callback) {
    if (isRTL) {
      const length = items.length;
      for (let i = 0; i < length; i++) {
        callback.call(instance, items[i], i, items);
      }
    } else {
      const maxIndex = items.length - 1;
      for (let i = maxIndex; i >= 0; i--) {
        callback.call(instance, items[i], maxIndex - i, items);
      }
    }
  }
  function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
    var angleInRadians = (angleInDegrees - 90) * Math.PI / 180;
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians)
    };
  }

  // src/colors.ts
  var colors = {
    dutchFieldColorPalette: ["#e60049", "#0bb4ff", "#50e991", "#e6d800", "#9b19f5", "#ffa300", "#dc0ab4", "#b3d4ff", "#00bfa0"],
    retroMetroColorPalette: ["#ea5545", "#f46a9b", "#ef9b20", "#edbf33", "#ede15b", "#bdcf32", "#87bc45", "#27aeef", "#b33dc6"],
    riverNightsColorPalette: ["#b30000", "#7c1158", "#4421af", "#1a53ff", "#0d88e6", "#00b7c7", "#5ad45a", "#8be04e", "#ebdc78"],
    springPastelsColorPalette: ["#fd7f6f", "#7eb0d5", "#b2e061", "#bd7ebe", "#ffb55a", "#ffee65", "#beb9db", "#fdcce5", "#8bd3c7"]
  };

  // src/charts/controller.ts
  var _Controller = class {
    /**
     * Create new Controller class.
     * 
     * @param svgChart - SvgChart instance.
     */
    constructor(svgChart) {
      if (new.target === _Controller) {
        throw new Error("Controller class cannot be directly instanstiated.");
      }
      this.svgChart = svgChart;
      this.config = this.svgChart.config;
    }
    /**
     * Draws chart.
     * 
     * @param currentSerieGroupElement - Group element where the chart can be appended to.
     */
    onDraw(currentSerieGroupElement) {
      this.onDrawStart(currentSerieGroupElement);
      this.config.series.forEach((serie, serieIndex) => {
        const serieGroup = el("g", {
          dataSerie: serie.id,
          className: this.svgChart.unselectedSeries[serie.id] ? prefixed("unselected") : ""
        });
        this.onDrawSerie(serie, serieIndex, serieGroup);
        currentSerieGroupElement.appendChild(serieGroup);
      });
      this.onDrawEnd(currentSerieGroupElement);
    }
    /**
     * Do things at the start of the draw for this chart.
     * 
     * @param currentSerieGroupElement - DOM group element.
     */
    onDrawStart(currentSerieGroupElement) {
    }
    /**
     * Do things at the end of the draw for this chart.
     * 
     * @param currentSerieGroupElement - DOM group element.
     */
    onDrawEnd(currentSerieGroupElement) {
    }
    /**
     * Draws chart element for this serie and attached it to the serieGroup.
     * 
     * @param serie - Serie object.
     * @param serieIndex - Serie index.
     * @param serieGroup - DOM group element for this serie.
     */
    onDrawSerie(serie, serieIndex, serieGroup) {
    }
    /**
     * Execute config things before global config things are done.
     */
    onConfigBefore() {
    }
    /**
     * Execute config things after global config things are done.
     */
    onConfigAfter() {
    }
    /**
     * Execute serie config things before global config serie things are done.
     * 
     * @param serie - Serie object
     */
    onConfigSerieBefore(serie) {
    }
    /**
     * Execute config things after global config things are done.
     * 
     * @param serie - Serie object
     */
    onConfigSerieAfter(serie) {
    }
  };
  var Controller = _Controller;
  Controller.requiredConfigWithValue = {};

  // src/types.ts
  var ChartType = /* @__PURE__ */ ((ChartType3) => {
    ChartType3[ChartType3["Line"] = 0] = "Line";
    ChartType3[ChartType3["Bar"] = 1] = "Bar";
    ChartType3[ChartType3["LineAndBar"] = 2] = "LineAndBar";
    ChartType3[ChartType3["Pie"] = 3] = "Pie";
    ChartType3[ChartType3["Donut"] = 4] = "Donut";
    ChartType3[ChartType3["Radar"] = 5] = "Radar";
    return ChartType3;
  })(ChartType || {});

  // src/config.ts
  var SvgChartConfig = class {
    constructor() {
      /**
       * Whether language direction is ltr.
       */
      this.ltr = true;
      /**
       * Series array.
       */
      this.series = null;
      /**
       * Title of chart.
       */
      this.title = null;
      /**
       * Chart type.
       */
      this.chartType = null;
      /**
       * Callback when x axis label is selected. Parameters are SvgChart and x axis column index.
       */
      this.onXAxisLabelGroupSelect = null;
      /**
       * Padding object.
       */
      this.padding = {
        start: 40,
        end: 20,
        top: 100,
        bottom: 40,
        /**
         * Left will be set by code, depends on direction.
         */
        left: 40,
        /**
         * Right will be set by code, depends on direction.
         */
        right: 20
      };
      /**
       * Default padding for space between elements.
       */
      this.paddingDefault = 20;
      /**
       * Width of legend squares or circles.
       */
      this.legendWidth = 10;
      /**
       * Whether the value box should be displayed when an element has focus.
       */
      this.focusedValueShow = true;
      /**
       * Fill color of focused value box.
       */
      this.focusedValueFill = "black";
      /**
       * Font color of focused value box.
       */
      this.focusedValueColor = "white";
      /**
       * Padding of focused value box.
       */
      this.focusedValuePadding = 6;
      /**
       * Draw function to execute in the config phase. It receives a SvgChart and HTMLElement parameter.
       * 
       * @example function(svgChart, groupNode) {
       *     groupNode.appendChild(svgChart.el('rect', {
       *         x: 10,
       *         y: 10
       *     }));
       * }
       */
      this.drawOnConfig = null;
      /**
       * Draw function to execute in the chart phase. It receives a SvgChart and HTMLElement parameter.
       * 
       * @example function(svgChart, groupNode) {
       *     groupNode.appendChild(svgChart.el('rect', {
       *         x: 10,
       *         y: 10
       *     }));
       * }
       */
      this.drawOnData = null;
      /**
       * transition - Whether the chart elements should be faded in or nor.
       */
      this.transition = true;
      /**
       * Background color of the SVG element.
       */
      this.backgroundColor = "white";
      /**
       * Font fanily for all text elements.
       */
      this.fontFamily = "sans-serif";
      /**
       * Fontsize for the title.
       */
      this.titleFontSize = "normal";
      /**
       * Font color of title.
       */
      this.titleColor = "black";
      /**
       * Horizontal position of title. Can be one of: center, start, end.
       */
      this.titleHorizontalPosition = 6 /* Center */;
      // center (default); start; end
      /**
       * Vertical position of title. Can be one of: top, bottom, center.
       */
      this.titleVerticalPosition = 0 /* Top */;
      // top (default); bottom; center
      /**
       * Maximum value. Required for charts with Y-axes.
       */
      this.maxValue = null;
      /**
       * Minumum value of Y axis. Required for charts with Y-axes.
       */
      this.minValue = null;
      ///////////////////////////////////////////////////////////////////////////////////////////////
      // X Axis
      ///////////////////////////////////////////////////////////////////////////////////////////////
      /**
       * Font size of axes titles.
       */
      this.axisTitleFontSize = "smaller";
      /**
       * Font size of axes labels.
       */
      this.axisLabelFontSize = "small";
      // X axis
      /**
       * X axis title.
       */
      this.xAxisTitle = null;
      /**
       * If this is a number X, than the x axis title will be positioned X pixels from the bottom.
       * If this is null, then the title will be positioned paddingDefault pixesl from the bottom.
       */
      this.xAxisTitleBottom = null;
      /**
       * Line width of the x axis grid.
       */
      this.xAxisGridLineWidth = 1;
      /**
       * Color of x axis grid lines.
       */
      this.xAxisGridLineColor = "#C0C0C0";
      /**
       * Stroke dash array value for the x axis grid lines.
       * See {@link https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/stroke-dasharray}.
       */
      this.xAxisGridLineDashArray = "1 1";
      /**
       * Font color of xaxis labels.
       */
      this.xAxisLabelColor = "#A0A0A0";
      /**
       * Font color of x axis title.
       */
      this.xAxisTitleColor = "#A0A0A0";
      /**
       * Whether the xaxis grid should be displayed.
       */
      this.xAxisGrid = true;
      /**
       * Outside padding for x axis grid.
       */
      this.xAxisGridPadding = 0;
      /**
       * Whether x axis labels should be displayed.
       */
      this.xAxisLabels = true;
      /**
       * Whether the x axis labels should be below (false)
       * or between (true) the x axis grid lines. For bar charts this will always be set to true.
       */
      this.xAxisGridColumns = false;
      /**
       * Whether xAxisGridColumns should be selectable.
       * If this is true, the x axis labels can be clicked and selected.
       */
      this.xAxisGridColumnsSelectable = false;
      /**
       * Opacity value for the selected xAxisGridColumn.
       */
      this.xAxisGridSelectedColumnOpacity = 0.2;
      /**
       * Background color for a selected xAxisGridColumn.
       */
      this.xAxisGridColumnsSelectableColor = "black";
      /**
       * The text anchor value for x axis labels.
       * For example if you want vertical labels that should be aligned to the x axis, you can set this to 'start'.
       * See {@link https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/text-anchor}.
       */
      this.textAnchorXAxisLabels = "middle";
      /**
       * Number of pixels that the x axsis labels will be positioned from the bottom x axis grid line.
       */
      this.xAxisLabelTop = 10;
      /**
       * Degrees for the x axis labels.
       */
      this.xAxisLabelRotation = 0;
      /**
       * Steps between x axis grid lines.
       */
      this.xAxisStep = 1;
      /**
       * Steps between x axis labels.
       */
      this.xAxisLabelStep = 1;
      ///////////////////////////////////////////////////////////////////////////////////////////////
      // Y Axis
      ///////////////////////////////////////////////////////////////////////////////////////////////
      /**
       * @prop {string} yAxisTitle - Y axis title.
       */
      this.yAxisTitle = null;
      /**
       *  Number of pixels the y axis labels should be positioned from the start. If this is null, this will be defaultPadding pixels.
       */
      this.yAxisTitleStart = null;
      // if this is <> null; then this will be the X start position of the Y axis title.
      /**
       * Line width of the y axis grid.
       */
      this.yAxisGridLineWidth = 1;
      /**
       * Color of y axis grid lines.
       */
      this.yAxisGridLineColor = "#C0C0C0";
      /**
       * Stroke dash array value for the y axis grid lines.
       * See {@link https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/stroke-dasharray}.
       */
      this.yAxisGridLineDashArray = "1 1";
      /**
       * Font color of y axis labels.
       */
      this.yAxisLabelColor = "#A0A0A0";
      /**
       * Font color of y axis title.
       */
      this.yAxisTitleColor = "#A0A0A0";
      /**
       * Steps between y axis grid lines.
       */
      this.yAxisStep = 10;
      // how many steps between y axis grid lines
      /**
       * Steps between y axis labels.
       */
      this.yAxisLabelStep = 10;
      // how many steps between labels y axis
      //yAxis = true;
      /**
       * Whether the y axis grid should be displayed.
       */
      this.yAxisGrid = true;
      /**
       * Whether y axis labels should be displayed.
       */
      this.yAxisLabels = true;
      /**
       * Outside padding for y axis grid.
       */
      this.yAxisGridPadding = 0;
      ///////////////////////////////////////////////////////////////////////////////////////////////
      // Legend
      ///////////////////////////////////////////////////////////////////////////////////////////////
      /**
       * Font size for legend labels.
       */
      this.legendFontSize = "smaller";
      /**
       * Font color of legend labels.
       */
      this.legendColor = "black";
      /**
       * Whether legends should be squares (false) or circles (true)
       */
      this.legendCircle = false;
      /**
       * @prop {boolean} legend - Whether legends should be displayed.
       */
      this.legend = true;
      /**
       * Whether clicking on a legend hides and shows a the serie.
       */
      this.legendSelect = true;
      /**
       * Position of legend. Possible values: bottom, top, end.
       */
      this.legendPosition = 0 /* Top */;
      /**
       * If not null, number of pixels the legend should be positioned from the bottom. Otherwise a default number of pixels will be used.
       */
      this.legendBottom = null;
      /**
       * @prop {number} legendTop - If not null, number of pixels the legend should be positioned from the top. Otherwise a default number of pixels will be used.
       */
      this.legendTop = null;
      ///////////////////////////////////////////////////////////////////////////////////////////////
      // Line charts
      ///////////////////////////////////////////////////////////////////////////////////////////////
      /**
       * Width of line for line charts.
       */
      this.lineWidth = 2;
      /**
       * Radius of line points for line charts.
       */
      this.pointRadius = 2;
      /**
       * Whether null values should be connected or not.
       */
      this.connectNullValues = false;
      /**
       * Whether lines should be curved or not.
       */
      this.lineCurved = true;
      /**
       * Whether line charts should be filled or not.
       */
      this.lineChartFilled = false;
      /**
       * Whether the lines should display points or not.
       */
      this.points = true;
      ///////////////////////////////////////////////////////////////////////////////////////////////
      // Bar charts
      ///////////////////////////////////////////////////////////////////////////////////////////////
      /**
       * Opacity of bars.
       */
      this.barFillOpacity = 0.5;
      /**
       * Spacing in pixels between bars.
       */
      this.barSpacing = 4;
      /**
       * Width of bar border.
       */
      this.barStrokeWidth = 1;
      /**
       * Whether bars should be stacked.
       */
      this.barStacked = false;
      ///////////////////////////////////////////////////////////////////////////////////////////////
      // Pie and donut charts
      ///////////////////////////////////////////////////////////////////////////////////////////////
      /**
       * Opacity of pie and donut charts.
       */
      this.pieFillOpacity = 0.6;
      /**
       * With of donuts. Of not given a default value is used.
       */
      this.donutWidth = null;
      /**
       * Stroke color for pie charts.
       */
      this.pieStroke = "white";
      /**
       * Width of stroke for pie charts. If this is 0, no stroke is painted.
       */
      this.pieStrokeWidth = 2;
      /**
       * Stroke color for donut charts.
       */
      this.donutStroke = "white";
      /**
       * Width of stroke for donut charts. If this is 0, no stroke is painted.
       */
      this.donutStrokeWidth = 2;
    }
    /**
     * Get direction string to use for dom direction attribute.
     * 
     * @param config Config object.
     * @returns Attribute value.
     */
    static getDirection(config) {
      return config.ltr ? "ltr" : "rtl";
    }
  };

  // src/axis.ts
  var _onXAxisLabelGroupClickScoped, _onXAxisLabelGroupKeypressScoped, _addXAxisLine, addXAxisLine_fn, _onXAxisLabelGroupClick, onXAxisLabelGroupClick_fn, _onXAxisLabelGroupSelect, onXAxisLabelGroupSelect_fn, _onXAxisLabelGroupKeypress, onXAxisLabelGroupKeypress_fn;
  var AxisController = class {
    /**
     * @param svgChart SvgChart instance.
     */
    constructor(svgChart) {
      /**
       * Draws an X axis line.
       * 
       * @param parent - Parent element where to attach the line to.
       * @param x X position.
       */
      __privateAdd(this, _addXAxisLine);
      /**
       * When a label on the x axis receives a click when focussed.
       * 
       * @param e Event object.
       */
      __privateAdd(this, _onXAxisLabelGroupClick);
      /**
       * Display the selected column indicator and fires the onXAxisLabelGroupSelect callback (if defined).
       * 
       * @param label - Node (x axis label) that is selected.
       */
      __privateAdd(this, _onXAxisLabelGroupSelect);
      /**
       * When a X axis label receives a ENTER key event.
       * 
       * @param e Keyboard event.
       */
      __privateAdd(this, _onXAxisLabelGroupKeypress);
      __privateAdd(this, _onXAxisLabelGroupClickScoped, void 0);
      __privateAdd(this, _onXAxisLabelGroupKeypressScoped, void 0);
      this.svgChart = svgChart;
      this.config = svgChart.config;
    }
    /**
     * Add Y axis grid lines and labels.
     */
    addYAxisGridAndLabels() {
      var gYAxis = el("g", {
        className: prefixed("y-axis-group")
      });
      const absMinValue = Math.abs(this.config.minValue);
      var currentYAxisValue = this.config.minValue;
      var currentYAxisLabelValue = this.config.minValue;
      while (currentYAxisValue <= this.config.maxValue || currentYAxisLabelValue <= this.config.maxValue) {
        if (this.config.yAxisGrid && currentYAxisValue <= this.config.maxValue) {
          let y = this.config.padding.top + this.config.yAxisGridPadding + this.svgChart.chartHeight - (currentYAxisValue + absMinValue) * this.svgChart.lineAndBarValueHeight;
          gYAxis.appendChild(el("line", {
            x1: this.config.padding.left,
            y1: y,
            x2: this.config.padding.left + this.svgChart.chartWidth + this.config.xAxisGridPadding * 2,
            y2: y,
            className: prefixed("y-axis-grid-line"),
            stroke: this.config.yAxisGridLineColor || "",
            strokeWidth: this.config.yAxisGridLineWidth || "",
            strokeDasharray: this.config.yAxisGridLineDashArray || ""
          }));
        }
        currentYAxisValue += this.config.yAxisStep;
        if (this.config.yAxisLabels && currentYAxisLabelValue <= this.config.maxValue) {
          let y = this.config.padding.top + this.config.yAxisGridPadding + this.svgChart.chartHeight - (currentYAxisLabelValue + absMinValue) * this.svgChart.lineAndBarValueHeight;
          gYAxis.appendChild(el("text", {
            direction: SvgChartConfig.getDirection(this.config),
            x: this.config.ltr ? this.config.padding.left - 10 : this.config.padding.left + this.svgChart.chartWidth + 10,
            y,
            textAnchor: "end",
            dominantBaseline: "middle",
            fontFamily: this.config.fontFamily || "",
            fontSize: this.config.axisLabelFontSize || "",
            className: prefixed("y-axis-label"),
            fill: this.config.yAxisLabelColor || ""
          }, document.createTextNode(currentYAxisLabelValue.toString())));
        }
        currentYAxisLabelValue += this.config.yAxisLabelStep;
      }
      this.svgChart.svg.appendChild(gYAxis);
    }
    /**
     * Add X axis grid lines and labels.
     * 
     * @param columnWidth - Width of each column.
     */
    addXAxisGridAndLabels(columnWidth) {
      var currentXAxisGroupElement = el("g");
      var currentXAxisLabelsGroupElement = el("g", {
        className: prefixed("x-axis-label-group-current")
      });
      var currentXAxisGridColumnsSelectableGroupElement = this.config.xAxisGridColumnsSelectable ? el("g") : null;
      directionForEach(this, this.svgChart.data.xAxis.columns, this.config.ltr, (colValue, colIndex) => {
        if (this.config.xAxisGrid) {
          const x = this.config.padding.left + this.config.xAxisGridPadding + colIndex * columnWidth;
          if (colIndex === 0 || (colIndex + 0) % this.config.xAxisStep === 0) {
            __privateMethod(this, _addXAxisLine, addXAxisLine_fn).call(this, currentXAxisGroupElement, x);
          }
          if (this.config.xAxisGridColumnsSelectable) {
            currentXAxisGridColumnsSelectableGroupElement.appendChild(el("rect", {
              x,
              y: this.config.padding.top + this.config.yAxisGridPadding,
              width: columnWidth,
              height: this.svgChart.chartHeight,
              className: prefixed("x-axis-grid-column-selectable"),
              fillOpacity: 0,
              fill: this.config.xAxisGridColumnsSelectableColor
            }));
          }
        }
        if (this.config.xAxisLabels && (colIndex + 0) % this.config.xAxisLabelStep === 0) {
          var xlg = el("g", {
            transform: `translate(${this.config.padding.left + this.config.xAxisGridPadding + colIndex * columnWidth + (this.config.xAxisGridColumns ? columnWidth / 2 : 0)} ${this.svgChart.chartHeight + this.config.padding.top + this.config.yAxisGridPadding * 2 + this.config.xAxisLabelTop})`
          });
          xlg.appendChild(el("text", {
            direction: SvgChartConfig.getDirection(this.config),
            textAnchor: this.config.textAnchorXAxisLabels || "middle",
            dominantBaseline: "hanging",
            fontFamily: this.config.fontFamily || "",
            fontSize: this.config.axisLabelFontSize || "",
            fontWeight: "normal",
            fill: this.config.xAxisLabelColor || "",
            tabindex: this.config.xAxisGridColumnsSelectable ? 0 : null,
            className: prefixed("x-axis-label") + " " + (this.config.xAxisGridColumnsSelectable ? prefixed("x-axis-grid-column-selectable-label") : ""),
            transform: `rotate(${this.config.xAxisLabelRotation})`
          }, document.createTextNode(colValue.toString())));
          currentXAxisLabelsGroupElement.appendChild(xlg);
        }
      });
      if (this.config.xAxisGrid && this.config.xAxisGridColumns) {
        __privateMethod(this, _addXAxisLine, addXAxisLine_fn).call(this, currentXAxisGroupElement, this.config.padding.left + this.config.xAxisGridPadding + this.svgChart.data.xAxis.columns.length * columnWidth);
      }
      this.svgChart.xAxisGroupElement.appendChild(currentXAxisGroupElement);
      this.config.xAxisGridColumnsSelectable && this.svgChart.xAxisGridColumnsSelectableGroupElement.appendChild(currentXAxisGridColumnsSelectableGroupElement);
      this.svgChart.xAxisLabelsGroupElement.appendChild(currentXAxisLabelsGroupElement);
    }
    /**
     * Draws the X axis title.
     */
    addXAxisTitle() {
      var x = this.config.ltr ? this.svgChart.width - this.config.padding.right - this.config.xAxisGridPadding : this.config.padding.left;
      this.svgChart.svg.appendChild(el("text", {
        direction: SvgChartConfig.getDirection(this.config),
        x,
        y: this.svgChart.height - (this.config.xAxisTitleBottom !== null ? this.config.xAxisTitleBottom : this.config.paddingDefault),
        textAnchor: "end",
        dominantBaseline: "auto",
        fontFamily: this.config.fontFamily || "",
        fontSize: this.config.axisTitleFontSize || "",
        fill: this.config.xAxisTitleColor || "",
        className: prefixed("text-x-axis-title")
      }, document.createTextNode(this.config.xAxisTitle)));
    }
    /**
     * Draws the Y axis title.
     */
    addYAxisTitle() {
      var yAxisTitleG = el("g");
      var x = 0;
      if (this.config.ltr) {
        x = this.config.yAxisTitleStart ? this.config.yAxisTitleStart : this.config.paddingDefault;
      } else {
        x = this.config.yAxisTitleStart ? this.svgChart.width - this.config.yAxisTitleStart : this.svgChart.width - this.config.paddingDefault;
      }
      yAxisTitleG.setAttribute("transform", "translate(" + x + ", " + (this.config.padding.top + this.config.yAxisGridPadding) + ")");
      var yAxisTitleEl = el("text", {
        direction: SvgChartConfig.getDirection(this.config),
        textAnchor: "end",
        dominantBaseline: "hanging",
        fontFamily: this.config.fontFamily || "",
        fontSize: this.config.axisTitleFontSize || "",
        fill: this.config.yAxisTitleColor || "",
        className: prefixed("text-y-axis-title")
      }, document.createTextNode(this.config.yAxisTitle));
      yAxisTitleEl.setAttribute("transform", this.config.ltr ? "rotate(-90)" : "rotate(90)");
      yAxisTitleG.appendChild(yAxisTitleEl);
      this.svgChart.svg.appendChild(yAxisTitleG);
    }
    /**
     * Adds group for x axis labels.
     */
    addXAxisLabelsGroup() {
      this.svgChart.xAxisLabelsGroupElement = el("g", {
        className: prefixed("x-axis-label-group")
      });
      if (this.config.xAxisGridColumnsSelectable) {
        if (!__privateGet(this, _onXAxisLabelGroupClickScoped)) {
          __privateSet(this, _onXAxisLabelGroupClickScoped, __privateMethod(this, _onXAxisLabelGroupClick, onXAxisLabelGroupClick_fn).bind(this));
          __privateSet(this, _onXAxisLabelGroupKeypressScoped, __privateMethod(this, _onXAxisLabelGroupKeypress, onXAxisLabelGroupKeypress_fn).bind(this));
        }
        this.svgChart.addEventListener(this.svgChart.xAxisLabelsGroupElement, "click", __privateGet(this, _onXAxisLabelGroupClickScoped), false);
        this.svgChart.addEventListener(this.svgChart.xAxisLabelsGroupElement, "keydown", __privateGet(this, _onXAxisLabelGroupKeypressScoped), false);
        this.svgChart.xAxisGridColumnsSelectableGroupElement = this.svgChart.svg.appendChild(el("g", {
          className: prefixed("x-axis-columns-selectable-group")
        }));
      }
      this.svgChart.svg.appendChild(this.svgChart.xAxisLabelsGroupElement);
    }
  };
  _onXAxisLabelGroupClickScoped = new WeakMap();
  _onXAxisLabelGroupKeypressScoped = new WeakMap();
  _addXAxisLine = new WeakSet();
  addXAxisLine_fn = function(parent2, x) {
    parent2.appendChild(el("line", {
      x1: x,
      y1: this.config.padding.top,
      x2: x,
      y2: this.svgChart.chartHeight + this.config.padding.top + this.config.yAxisGridPadding * 2,
      className: prefixed("x-axis-grid-line"),
      stroke: this.config.xAxisGridLineColor || "",
      strokeWidth: this.config.xAxisGridLineWidth || "",
      strokeDasharray: this.config.xAxisGridLineDashArray || ""
    }));
  };
  _onXAxisLabelGroupClick = new WeakSet();
  onXAxisLabelGroupClick_fn = function(e) {
    __privateMethod(this, _onXAxisLabelGroupSelect, onXAxisLabelGroupSelect_fn).call(this, e.target);
  };
  _onXAxisLabelGroupSelect = new WeakSet();
  onXAxisLabelGroupSelect_fn = function(label) {
    var textNodes = this.svgChart.xAxisLabelsGroupElement.querySelectorAll("text." + prefixed("x-axis-grid-column-selectable-label"));
    var rects = this.svgChart.xAxisGridColumnsSelectableGroupElement.querySelectorAll("rect." + prefixed("x-axis-grid-column-selectable"));
    for (var i = 0; i < textNodes.length; i++) {
      if (textNodes[i] === label) {
        this.svgChart.lineAndBarSelectedColumnIndex = i;
        textNodes[i].classList.add(prefixed("selected"));
        rects[i].classList.add(prefixed("selected"));
        rects[i].setAttribute("fill-opacity", this.config.xAxisGridSelectedColumnOpacity.toString());
        if (this.config.onXAxisLabelGroupSelect) {
          this.config.onXAxisLabelGroupSelect(this.svgChart, this.svgChart.lineAndBarSelectedColumnIndex);
        }
      } else {
        textNodes[i].classList.remove(prefixed("selected"));
        rects[i].classList.remove(prefixed("selected"));
        rects[i].setAttribute("fill-opacity", "0");
      }
    }
  };
  _onXAxisLabelGroupKeypress = new WeakSet();
  onXAxisLabelGroupKeypress_fn = function(e) {
    if (e.key === "Enter") {
      __privateMethod(this, _onXAxisLabelGroupSelect, onXAxisLabelGroupSelect_fn).call(this, e.target);
    }
  };

  // src/charts/bar_and_line_utils.ts
  function onDrawStartBarAndLine(svgChart, axisController, currentSerieGroupElement) {
    if (svgChart.xAxisGroupElement.firstChild) {
      svgChart.xAxisGroupElement.removeChild(svgChart.xAxisGroupElement.firstChild);
    }
    if (svgChart.config.xAxisGridColumnsSelectable) {
      if (svgChart.xAxisGridColumnsSelectableGroupElement.firstChild) {
        svgChart.xAxisGridColumnsSelectableGroupElement.firstChild.remove();
      }
    }
    if (svgChart.xAxisLabelsGroupElement.firstChild) {
      svgChart.xAxisLabelsGroupElement.removeChild(svgChart.xAxisLabelsGroupElement.firstChild);
    }
    const columnWidth = svgChart.config.xAxisGridColumns ? svgChart.chartWidth / svgChart.data.xAxis.columns.length : svgChart.chartWidth / (svgChart.data.xAxis.columns.length - 1);
    svgChart.columnWidth = columnWidth;
    axisController.addXAxisGridAndLabels(columnWidth);
  }
  function onConfigBeforeBarAndLine(svgChart, axisController) {
    svgChart.lineAndBarSelectedColumnIndex = null;
    svgChart.lineAndBarValueHeight = svgChart.chartHeight / (Math.abs(svgChart.config.minValue) + svgChart.config.maxValue);
    svgChart.barCountPerColumn = svgChart.config.barStacked ? 1 : 0;
    if (svgChart.config.yAxisGrid) {
      axisController.addYAxisGridAndLabels();
    }
    if (svgChart.config.xAxisTitle) {
      axisController.addXAxisTitle();
    }
    if (svgChart.config.yAxisTitle) {
      axisController.addYAxisTitle();
    }
    if (svgChart.config.xAxisLabels) {
      axisController.addXAxisLabelsGroup();
    }
    svgChart.xAxisGroupElement = svgChart.svg.appendChild(el("g", {
      className: prefixed("x-axis-group")
    }));
  }

  // src/charts/line_chart_controller.ts
  var _axisController, _getCurvedPathFromPoints, getCurvedPathFromPoints_fn, _closePath, closePath_fn, _getStraightPathFromPoints, getStraightPathFromPoints_fn;
  var LineController = class extends Controller {
    /**
     * @param svgChart - SvgChart instance.
     */
    constructor(svgChart) {
      super(svgChart);
      /**
       * Helper function to get a curved path from an array of points.
       * 
       * @param points - Array of points.
       * @returns Array of curved path coordinates.
       */
      __privateAdd(this, _getCurvedPathFromPoints);
      /**
       * Closes path for filled line charts.
       * 
       * @param path - Array of path coordinates
       * @param points - Array of points
       */
      __privateAdd(this, _closePath);
      /**
       * Helper function to get a straight path for line charts.
       * 
       * @param points - Array of points.
       * @returns Array of path coordinates.
       */
      __privateAdd(this, _getStraightPathFromPoints);
      __privateAdd(this, _axisController, void 0);
      __privateSet(this, _axisController, new AxisController(svgChart));
    }
    /**
     * Draws chart element for this serie and attached it to the serieGroup. Overrides base class method.
     * 
     * @override
     * 
     * @param serie - Serie object.
     * @param serieIndex - Serie index.
     * @param serieGroup - DOM group element for this serie.
     */
    onDrawSerie(serie, serieIndex, serieGroup) {
      var nonNullPoints = [[]];
      var flatNonNullPoints = [];
      const absMinValue = Math.abs(this.config.minValue);
      directionForEach(this, this.svgChart.data.series[serie.id], this.config.ltr, (value, valueIndex, values) => {
        var x = this.config.padding.left + this.config.xAxisGridPadding + valueIndex * this.svgChart.columnWidth + (this.config.xAxisGridColumns ? this.svgChart.columnWidth / 2 : 0);
        var y = this.config.padding.top + this.config.yAxisGridPadding + this.svgChart.chartHeight - (value + absMinValue) * this.svgChart.lineAndBarValueHeight;
        if (value === null) {
          if (nonNullPoints[nonNullPoints.length - 1].length > 0 && valueIndex + 1 < values.length) {
            nonNullPoints.push([]);
          }
        } else {
          nonNullPoints[nonNullPoints.length - 1].push({ x, y, value });
          flatNonNullPoints.push({ x, y, value });
        }
      });
      var paths = [];
      if (this.config.connectNullValues) {
        let path = this.config.lineCurved ? __privateMethod(this, _getCurvedPathFromPoints, getCurvedPathFromPoints_fn).call(this, flatNonNullPoints) : __privateMethod(this, _getStraightPathFromPoints, getStraightPathFromPoints_fn).call(this, flatNonNullPoints);
        if (path.length > 0) {
          paths.push(path);
        }
      } else {
        nonNullPoints.forEach((currentNonNullPoints) => {
          if (currentNonNullPoints.length > 0) {
            let path = this.config.lineCurved ? __privateMethod(this, _getCurvedPathFromPoints, getCurvedPathFromPoints_fn).call(this, currentNonNullPoints) : __privateMethod(this, _getStraightPathFromPoints, getStraightPathFromPoints_fn).call(this, currentNonNullPoints);
            if (path.length > 0) {
              paths.push(path);
            }
          }
        });
      }
      paths.forEach((path) => {
        serieGroup.appendChild(el("path", {
          d: path.join(" "),
          fill: this.config.lineChartFilled ? this.svgChart.getSerieFill(serie, serieIndex) : "none",
          fillOpacity: 0.4,
          stroke: this.svgChart.getSerieStrokeColor(serie, serieIndex),
          strokeWidth: this.config.lineWidth || "",
          className: prefixed("line")
        }));
      });
      if (this.config.points) {
        flatNonNullPoints.forEach((point) => {
          serieGroup.appendChild(el("circle", {
            cx: point.x,
            cy: point.y,
            r: this.config.pointRadius,
            zIndex: 1,
            fill: this.svgChart.getSeriePointColor(serie, serieIndex),
            stroke: this.svgChart.getSeriePointColor(serie, serieIndex),
            dataValue: point.value,
            className: prefixed("line-point"),
            tabindex: this.config.focusedValueShow ? 0 : null
          }));
        });
      }
    }
    /**
     * Do things at the start of the draw for this chart.
     * 
     * @override
     * 
     * @param currentSerieGroupElement - DOM group element.
     */
    onDrawStart(currentSerieGroupElement) {
      onDrawStartBarAndLine(this.svgChart, __privateGet(this, _axisController), currentSerieGroupElement);
    }
    /**
     * Execute config things before global config things are done.
     * 
     * @override
     */
    onConfigBefore() {
      super.onConfigBefore();
      onConfigBeforeBarAndLine(this.svgChart, __privateGet(this, _axisController));
    }
  };
  _axisController = new WeakMap();
  _getCurvedPathFromPoints = new WeakSet();
  getCurvedPathFromPoints_fn = function(points) {
    let path = ["M " + points[0].x + " " + points[0].y];
    for (var i = 0; i < points.length - 1; i++) {
      var x_mid = (points[i].x + points[i + 1].x) / 2;
      var y_mid = (points[i].y + points[i + 1].y) / 2;
      var cp_x1 = (x_mid + points[i].x) / 2;
      var cp_x2 = (x_mid + points[i + 1].x) / 2;
      path.push(`Q ${cp_x1} ${points[i].y}, ${x_mid} ${y_mid}`);
      path.push(`Q ${cp_x2} ${points[i + 1].y} ${points[i + 1].x} ${points[i + 1].y}`);
    }
    __privateMethod(this, _closePath, closePath_fn).call(this, path, points);
    return path;
  };
  _closePath = new WeakSet();
  closePath_fn = function(path, points) {
    if (this.config.lineChartFilled && points.length > 1) {
      path.push(`L ${points[points.length - 1].x} ${this.config.padding.top + this.config.yAxisGridPadding + this.svgChart.chartHeight}`);
      path.push(`L ${points[0].x} ${this.config.padding.top + this.config.yAxisGridPadding + this.svgChart.chartHeight}`);
      path.push(`L ${points[0].x} ${points[0].y}`);
      path.push("Z");
    }
  };
  _getStraightPathFromPoints = new WeakSet();
  getStraightPathFromPoints_fn = function(points) {
    let path = [];
    points.forEach((point, pointIndex) => {
      if (pointIndex === 0) {
        path.push(`M ${point.x} ${point.y}`);
      } else {
        path.push(`L ${point.x} ${point.y}`);
      }
    });
    __privateMethod(this, _closePath, closePath_fn).call(this, path, points);
    return path;
  };

  // src/charts/bar_chart_controller.ts
  var _axisController2;
  var BarController = class extends Controller {
    /**
     * @param svgChart - SvgChart instance.
     */
    constructor(svgChart) {
      super(svgChart);
      __privateAdd(this, _axisController2, void 0);
      __privateSet(this, _axisController2, new AxisController(svgChart));
    }
    /**
     * Draws chart element for this serie and attached it to the serieGroup.
     * 
     * @override
     * 
     * @param serie - Serie object.
     * @param serieIndex - Serie index.
     * @param serieGroup - DOM group element for this serie.
     */
    onDrawSerie(serie, serieIndex, serieGroup) {
      directionForEach(this, this.svgChart.data.series[serie.id], this.config.ltr, (value, valueIndex) => {
        var x = null;
        var y = null;
        var height = null;
        if (this.config.barStacked) {
          if (!this.stackedBarValues[valueIndex]) {
            this.stackedBarValues[valueIndex] = this.config.minValue;
          }
          ;
          x = this.config.padding.left + this.config.xAxisGridPadding + valueIndex * this.svgChart.columnWidth + this.config.barSpacing;
          y = this.config.padding.top + this.config.yAxisGridPadding + this.svgChart.chartHeight - value * this.svgChart.lineAndBarValueHeight - this.stackedBarValues[valueIndex] * this.svgChart.lineAndBarValueHeight;
          height = this.config.padding.top + this.config.yAxisGridPadding + this.svgChart.chartHeight - value * this.svgChart.lineAndBarValueHeight;
          this.stackedBarValues[valueIndex] = this.stackedBarValues[valueIndex] += value;
        } else {
          x = this.config.padding.left + this.config.xAxisGridPadding + valueIndex * this.svgChart.columnWidth + this.barWidth * this.currentBarIndex + this.config.barSpacing * (this.currentBarIndex + 1);
          if (isNaN(x)) {
            console.log(this.currentBarIndex);
          }
          height = y = this.config.padding.top + this.config.yAxisGridPadding + this.svgChart.chartHeight - value * this.svgChart.lineAndBarValueHeight;
        }
        serieGroup.appendChild(el("rect", {
          x,
          y,
          width: this.barWidth,
          height: this.svgChart.chartHeight + this.config.padding.top + this.config.yAxisGridPadding - height,
          fill: this.svgChart.getSerieFill(serie, serieIndex),
          className: prefixed("bar"),
          fillOpacity: this.config.barFillOpacity || "",
          strokeWidth: this.config.barStrokeWidth || 0,
          stroke: this.svgChart.getSerieStrokeColor(serie, serieIndex),
          dataValue: value,
          tabindex: this.config.focusedValueShow ? 0 : null
        }));
      });
      this.currentBarIndex += 1;
    }
    /**
     * Do things at the start of the draw for this chart.
     * 
     * @override
     * 
     * @param currentSerieGroupElement - DOM group element.
     */
    onDrawStart(currentSerieGroupElement) {
      onDrawStartBarAndLine(this.svgChart, __privateGet(this, _axisController2), currentSerieGroupElement);
      const barWidth = (this.svgChart.columnWidth - this.config.barSpacing * (this.svgChart.barCountPerColumn + 1)) / (this.svgChart.barCountPerColumn || 1);
      this.barWidth = barWidth;
      this.currentBarIndex = 0;
      this.stackedBarValues = {};
    }
    /**
     * Execute config things before global config things are done.
     * 
     * @override
     */
    onConfigBefore() {
      super.onConfigBefore();
      onConfigBeforeBarAndLine(this.svgChart, __privateGet(this, _axisController2));
    }
    /**
     * Execute serie config things before global config serie things are done.
     * 
     * @override
     * 
     * @param serie - Serie object
     */
    onConfigSerieBefore(serie) {
      super.onConfigSerieBefore(serie);
      if (!this.config.barStacked && (serie.type === 1 /* Bar */ || this.config.chartType === 1 /* Bar */)) {
        this.svgChart.barCountPerColumn += 1;
      }
    }
  };
  _axisController2 = new WeakMap();
  /** @override */
  BarController.requiredConfigWithValue = {
    xAxisGridColumns: true
  };

  // src/charts/bar_and_line_chart_controller.ts
  var _lineChartController, _barChartController;
  var BarAndLineController = class extends Controller {
    /**
     * @param svgChart - SvgChart instance.
     */
    constructor(svgChart) {
      super(svgChart);
      __privateAdd(this, _lineChartController, void 0);
      __privateAdd(this, _barChartController, void 0);
      __privateSet(this, _barChartController, new BarController(svgChart));
      __privateSet(this, _lineChartController, new LineController(svgChart));
    }
    /** @override */
    onDrawSerie(serie, serieIndex, serieGroup) {
      const serieType = serie.type || (this.config.chartType === 2 /* LineAndBar */ ? 0 /* Line */ : this.config.chartType);
      switch (serieType) {
        case 0 /* Line */:
          __privateGet(this, _lineChartController).onDrawSerie(serie, serieIndex, serieGroup);
          break;
        case 1 /* Bar */:
          __privateGet(this, _barChartController).onDrawSerie(serie, serieIndex, serieGroup);
          break;
      }
    }
    /** @override */
    onDrawStart(currentSerieGroupElement) {
      __privateGet(this, _barChartController).onDrawStart(currentSerieGroupElement);
    }
    /** @override */
    onConfigBefore() {
      __privateGet(this, _barChartController).onConfigBefore();
    }
    /** @override */
    onConfigSerieBefore(serie) {
      __privateGet(this, _barChartController).onConfigSerieBefore(serie);
    }
  };
  _lineChartController = new WeakMap();
  _barChartController = new WeakMap();
  /** @override */
  BarAndLineController.requiredConfigWithValue = {
    xAxisGridColumns: true
  };

  // src/charts/donut_or_pie_utils.ts
  function drawPieOrDonut(svgChart, currentSerieGroupElement, describeArcCallback) {
    var radius = svgChart.chartHeight / 2;
    var centerX = svgChart.width / 2;
    var centerY = svgChart.chartHeight / 2 + svgChart.config.padding.top;
    var total = 0;
    for (let key in svgChart.data.series) {
      total += svgChart.data.series[key];
    }
    var totalToDegree = 360 / total;
    var currentTotal = 0;
    svgChart.config.series.forEach((serie, serieIndex) => {
      var serieGroup = el("g", {
        dataSerie: serie.id,
        className: svgChart.unselectedSeries[serie.id] ? prefixed("unselected") : ""
      });
      const value = svgChart.data.series[serie.id];
      var startAngle = currentTotal * totalToDegree;
      currentTotal += value;
      var endAngle = currentTotal * totalToDegree;
      var path = describeArcCallback(centerX, centerY, radius, startAngle, endAngle);
      serieGroup.appendChild(el("path", {
        d: path.join(" "),
        fill: svgChart.getSerieFill(serie, serieIndex),
        fillOpacity: svgChart.config.pieFillOpacity || 1,
        className: prefixed("pie-piece"),
        tabindex: 0,
        stroke: svgChart.config[ChartType[svgChart.config.chartType].toLowerCase() + "Stroke"],
        strokeWidth: svgChart.config[ChartType[svgChart.config.chartType].toLowerCase() + "StrokeWidth"],
        dataValue: value
      }));
      currentSerieGroupElement.appendChild(serieGroup);
    });
  }

  // src/charts/donut_chart_controller.ts
  var DonutController = class extends Controller {
    /**
     * Draw donut chart.
     * 
     * @override
     * 
     * @param currentSerieGroupElement - Current serie group element.
     */
    onDraw(currentSerieGroupElement) {
      const donutWidth = this.config.donutWidth || this.svgChart.chartHeight / 4;
      drawPieOrDonut(this.svgChart, currentSerieGroupElement, (centerX, centerY, radius, startAngle, endAngle) => {
        return describeArcDonut(centerX, centerY, radius - donutWidth, donutWidth, startAngle, endAngle);
      });
    }
  };
  function describeArcDonut(x, y, radius, spread, startAngle, endAngle) {
    var innerStart = polarToCartesian(x, y, radius, endAngle);
    var innerEnd = polarToCartesian(x, y, radius, startAngle);
    var outerStart = polarToCartesian(x, y, radius + spread, endAngle);
    var outerEnd = polarToCartesian(x, y, radius + spread, startAngle);
    var largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    var d = [
      "M",
      outerStart.x,
      outerStart.y,
      "A",
      radius + spread,
      radius + spread,
      0,
      largeArcFlag,
      0,
      outerEnd.x,
      outerEnd.y,
      "L",
      innerEnd.x,
      innerEnd.y,
      "A",
      radius,
      radius,
      0,
      largeArcFlag,
      1,
      innerStart.x,
      innerStart.y,
      "L",
      outerStart.x,
      outerStart.y,
      "Z"
    ];
    return d;
  }

  // src/charts/pie_chart_controller.ts
  var PieController = class extends Controller {
    /**
     * Draws pie chart.
     * 
     * @override
     * 
     * @param currentSerieGroupElement - Current serie group element.
     */
    onDraw(currentSerieGroupElement) {
      drawPieOrDonut(this.svgChart, currentSerieGroupElement, (centerX, centerY, radius, startAngle, endAngle) => {
        return describeArcPie(centerX, centerY, radius, startAngle, endAngle);
      });
    }
  };
  function describeArcPie(x, y, radius, startAngle, endAngle) {
    var start = polarToCartesian(x, y, radius, endAngle);
    var end = polarToCartesian(x, y, radius, startAngle);
    var arcSweep = endAngle - startAngle <= 180 ? "0" : "1";
    var d = [
      "M",
      start.x,
      start.y,
      "A",
      radius,
      radius,
      0,
      arcSweep,
      0,
      end.x,
      end.y,
      "L",
      x,
      y,
      "L",
      start.x,
      start.y
    ];
    return d;
  }

  // src/svg.ts
  var _chartTypeControllers, _cssAdded, _activeColorPalette, _defsElement, _drawOnConfigGroup, _drawOnDataGroup, _onLegendClickScoped, _onLegendKeypressScoped, _onSerieGroupTransitionendScoped, _onSerieGroupFocusScoped, _onSerieGroupBlurScoped, _listenersToRemoveAfterConfigChange, _addSerieGroup, addSerieGroup_fn, _addLegend, addLegend_fn, _addTitle, addTitle_fn, _dataBefore, dataBefore_fn, _dataAfter, dataAfter_fn, _onLegendToggle, onLegendToggle_fn, _onLegendKeypress, onLegendKeypress_fn, _onLegendClick, onLegendClick_fn, _onSerieGroupTransitionend, onSerieGroupTransitionend_fn, _onSerieGroupBlur, onSerieGroupBlur_fn, _onSerieGroupFocus, onSerieGroupFocus_fn;
  var _SvgChart = class {
    /**
     * Constructor - create a new chart instance.
     * @param parent - Parent DOM node the SVG element will be attached to.
     * @param config - Configuration object.
     */
    constructor(parent2, config) {
      /**
       * Add serie group element. This is a SVG group element where the series data will be attached to.
       */
      __privateAdd(this, _addSerieGroup);
      /**
       * Add legend.
       */
      __privateAdd(this, _addLegend);
      /**
       * Add chart title.
       */
      __privateAdd(this, _addTitle);
      /**
       * Things we need to do for all chart types before we start visualise the data.
       * 
       * @returns The current serie group element.
       */
      __privateAdd(this, _dataBefore);
      /**
       * Things we need to do for all chart types after we visualised the data.
       * 
       * @param currentSerieGroupElement - The current serie group element we got from #dataBefore().
       */
      __privateAdd(this, _dataAfter);
      /**
       * When legend gets toggled (selected / deselected).
       * @param {SVGElement} target Legend node that gets toggled.
       */
      __privateAdd(this, _onLegendToggle);
      /**
       * When a key is pressed on a focussed legend node.
       * @param {Event} e Event object.
       */
      __privateAdd(this, _onLegendKeypress);
      /**
       * When a focussed legend node is clicked.
       * @param {Event} e Event object.
       */
      __privateAdd(this, _onLegendClick);
      /**
       * When the tranisiton of a serie group has ended.
       * 
       * @param e - Event object.
       */
      __privateAdd(this, _onSerieGroupTransitionend);
      /**
       * When a serie group node is blurred (this means loses focus).
       * 
       * @param e - Event object.
       */
      __privateAdd(this, _onSerieGroupBlur);
      /**
       * When a serie group node gets focussed.
       * 
       * @param e - Event object.
       */
      __privateAdd(this, _onSerieGroupFocus);
      /**
       * Element that contains definitions, for example for gradients.
       */
      __privateAdd(this, _defsElement, void 0);
      /**
       * Element where the config.drawOnConfig method will paint in. Only created when config.drawOnConfig is specified.
       */
      __privateAdd(this, _drawOnConfigGroup, void 0);
      /**
       * Element where the config.drawOnDarta method will paint in. Only created when config.drawOnData is specified.
       */
      __privateAdd(this, _drawOnDataGroup, void 0);
      /**
       * Scoped callback to call when a legend item gets clicked.
       */
      __privateAdd(this, _onLegendClickScoped, null);
      /**
       * Scoped callback to call when a legend items receives a keyboard ENTER press.
       */
      __privateAdd(this, _onLegendKeypressScoped, null);
      __privateAdd(this, _onSerieGroupTransitionendScoped, null);
      __privateAdd(this, _onSerieGroupFocusScoped, null);
      __privateAdd(this, _onSerieGroupBlurScoped, null);
      __privateAdd(this, _listenersToRemoveAfterConfigChange, void 0);
      if (!__privateGet(_SvgChart, _cssAdded)) {
        __privateSet(_SvgChart, _cssAdded, true);
        const cssRules = [
          "." + prefixed("line-point") + ", g." + prefixed("legend-group") + " g, ." + prefixed("x-axis-grid-column-selectable-label") + " { cursor: pointer; }",
          "." + prefixed("line-point") + ":hover, circle." + prefixed("line-point") + ":focus { stroke-width: 6; outline: none; }",
          "#" + prefixed("serie-group") + " g { transition: opacity 0.6s; }",
          "#" + prefixed("serie-group") + " g." + prefixed("unselected") + " { opacity: 0; }",
          "#" + prefixed("serie-group-current") + " { transition: opacity 1s; opacity: 1; }",
          "#" + prefixed("serie-group-current") + "." + prefixed("unattached") + " { opacity: 0; }",
          "g." + prefixed("legend-group") + " g." + prefixed("unselected") + " { opacity: 0.4; }",
          "text." + prefixed("x-axis-label") + "." + prefixed("x-axis-grid-column-selectable-label") + "." + prefixed("selected") + " { font-weight: bold; }",
          "rect." + prefixed("bar") + ":hover, path." + prefixed("pie-piece") + ":hover { fill-opacity: 0.7; }",
          "path." + prefixed("pie-piece") + ":focus, rect." + prefixed("bar") + ":focus { outline: none; fill-opacity:1; }"
        ];
        parent2.ownerDocument.head.appendChild(document.createElement("style")).innerHTML = cssRules.join("\n");
      }
      const parentRect = parent2.getBoundingClientRect();
      this.width = parentRect.width;
      this.height = parentRect.height;
      this.svg = el("svg", {
        width: this.width,
        height: this.height
      });
      parent2.appendChild(this.svg);
      this.setConfig(config);
    }
    /**
     * Set a color palette for all chart instances.
     * 
     * @param colors - Array of colors.
     */
    static setActiveColorPalette(colors2) {
      __privateSet(_SvgChart, _activeColorPalette, colors2);
    }
    /**
     * Set the configuration for this chart instance.
     * 
     * @param config - Configuration object.
     */
    setConfig(config) {
      const newConfig = new SvgChartConfig();
      this.config = Object.assign({}, newConfig, config);
      this.config.padding = Object.assign({}, newConfig.padding, this.config.padding);
      this.config = Object.assign(this.config, __privateGet(_SvgChart, _chartTypeControllers)[this.config.chartType].requiredConfigWithValue);
      if (this.config.ltr) {
        this.config.padding.left = this.config.padding.start;
        this.config.padding.right = this.config.padding.end;
      } else {
        this.config.padding.left = this.config.padding.end;
        this.config.padding.right = this.config.padding.start;
      }
      this.controller = new (__privateGet(_SvgChart, _chartTypeControllers))[config.chartType](this);
      this.svg.setAttribute("direction", SvgChartConfig.getDirection(this.config));
      if (__privateGet(this, _listenersToRemoveAfterConfigChange) && __privateGet(this, _listenersToRemoveAfterConfigChange).length) {
        __privateGet(this, _listenersToRemoveAfterConfigChange).forEach((item) => {
          item.node.removeEventListener(item.eventName, item.callback, item.capture);
        });
      }
      __privateSet(this, _listenersToRemoveAfterConfigChange, []);
      while (this.svg.childNodes.length) {
        this.svg.firstChild.remove();
      }
      this.data = null;
      this.unselectedSeries = {};
      this.chartWidth = this.width - this.config.padding.start - this.config.padding.end - this.config.xAxisGridPadding * 2;
      this.chartHeight = this.height - this.config.padding.top - this.config.padding.bottom - this.config.yAxisGridPadding * 2;
      if (this.config.backgroundColor) {
        this.svg.style.backgroundColor = this.config.backgroundColor;
      }
      __privateSet(this, _defsElement, el("defs"));
      this.svg.appendChild(__privateGet(this, _defsElement));
      if (!__privateGet(this, _onSerieGroupTransitionendScoped)) {
        __privateSet(this, _onSerieGroupTransitionendScoped, __privateMethod(this, _onSerieGroupTransitionend, onSerieGroupTransitionend_fn).bind(this));
      }
      if (this.config.drawOnConfig) {
        __privateSet(this, _drawOnConfigGroup, el("g", {
          className: prefixed("draw-on-config-group")
        }));
        this.svg.appendChild(__privateGet(this, _drawOnConfigGroup));
      }
      if (this.config.title) {
        __privateMethod(this, _addTitle, addTitle_fn).call(this);
      }
      if (this.config.legend) {
        __privateMethod(this, _addLegend, addLegend_fn).call(this);
      }
      this.controller.onConfigBefore();
      this.config.series.forEach((serie) => {
        this.controller.onConfigSerieBefore(serie);
        if (serie.fillGradient) {
          var lg = el("linearGradient", {
            id: serie.id + "-gradient",
            x1: 0,
            x2: 0,
            y1: 0,
            y2: 1
          });
          lg.appendChild(el("stop", {
            offset: "0%",
            stopColor: serie.fillGradient[0]
          }));
          lg.appendChild(el("stop", {
            offset: "100%",
            stopColor: serie.fillGradient[1]
          }));
          __privateGet(this, _defsElement).appendChild(lg);
        }
        this.controller.onConfigSerieAfter(serie);
      });
      if (this.config.drawOnConfig) {
        this.config.drawOnConfig(this, __privateGet(this, _drawOnConfigGroup));
      }
      if (this.config.drawOnData) {
        __privateSet(this, _drawOnDataGroup, el("g", {
          className: prefixed("draw-on-data-group")
        }));
        this.svg.appendChild(__privateGet(this, _drawOnDataGroup));
      }
      __privateMethod(this, _addSerieGroup, addSerieGroup_fn).call(this);
      this.controller.onConfigAfter();
    }
    /**
     * Writing the charts.
     * 
     * @param data - Data object.
     */
    chart(data = null) {
      if (data !== null) {
        this.data = data;
      }
      const currentSerieGroupElement = __privateMethod(this, _dataBefore, dataBefore_fn).call(this);
      this.controller.onDraw(currentSerieGroupElement);
      __privateMethod(this, _dataAfter, dataAfter_fn).call(this, currentSerieGroupElement);
      if (this.config.drawOnData) {
        this.config.drawOnData(this, __privateGet(this, _drawOnDataGroup));
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
    saveAsPng(filename) {
      var rect = this.svg.getBoundingClientRect();
      var canvas = document.createElement("canvas");
      canvas.setAttribute("width", rect.width.toString());
      canvas.setAttribute("height", rect.height.toString());
      var ctx = canvas.getContext("2d");
      ctx.fillStyle = this.svg.style.backgroundColor;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      var img = new Image();
      var data = '<svg xmlns="http://www.w3.org/2000/svg">' + this.svg.innerHTML + "</svg>";
      var parser = new DOMParser();
      var result = parser.parseFromString(data, "text/xml");
      var inlineSVG = result.getElementsByTagName("svg")[0];
      inlineSVG.setAttribute("width", rect.width.toString());
      inlineSVG.setAttribute("height", rect.height.toString());
      var svg64 = btoa(new XMLSerializer().serializeToString(inlineSVG));
      var image64 = "data:image/svg+xml;base64," + svg64;
      img.onload = function() {
        ctx.drawImage(img, 0, 0, rect.width, rect.height);
        window.URL.revokeObjectURL(image64);
        var png_img = canvas.toDataURL("image/png");
        const createEl = document.createElement("a");
        createEl.href = png_img;
        createEl.download = filename;
        createEl.click();
        createEl.remove();
      };
      img.src = image64;
    }
    getSeriePropertyColor(props, serie, serieIndex) {
      for (var i = 0; i < props.length; i++) {
        var key = props[i];
        if (serie[key]) {
          return key === "fillGradient" ? `url(#${serie.id}-gradient)` : serie[key];
        }
      }
      if (serie.color) {
        return serie.color;
      }
      return __privateGet(_SvgChart, _activeColorPalette)[serieIndex];
    }
    getSeriePointColor(serie, serieIndex) {
      return this.getSeriePropertyColor(["pointColor", "strokeColor"], serie, serieIndex);
    }
    getSerieStrokeColor(serie, serieIndex) {
      return this.getSeriePropertyColor(["strokeColor"], serie, serieIndex);
    }
    getSerieFill(serie, serieIndex) {
      return this.getSeriePropertyColor(["fillGradient"], serie, serieIndex);
    }
    /**
     * Adds an event listener to a node and adds it to the #listenersToRemoveAfterConfigChange array as well, so we can remove them in one place.
     * 
     * @param node - Node to add the listener to.
     * @param eventName - Name of event.
     * @param callback - Function that needs to be executed.
     * @param capture - Capture or not.
     */
    addEventListener(node, eventName, callback, capture) {
      node.addEventListener(eventName, callback, capture);
      __privateGet(this, _listenersToRemoveAfterConfigChange).push({
        node,
        eventName,
        callback,
        capture
      });
    }
  };
  var SvgChart = _SvgChart;
  _chartTypeControllers = new WeakMap();
  _cssAdded = new WeakMap();
  _activeColorPalette = new WeakMap();
  _defsElement = new WeakMap();
  _drawOnConfigGroup = new WeakMap();
  _drawOnDataGroup = new WeakMap();
  _onLegendClickScoped = new WeakMap();
  _onLegendKeypressScoped = new WeakMap();
  _onSerieGroupTransitionendScoped = new WeakMap();
  _onSerieGroupFocusScoped = new WeakMap();
  _onSerieGroupBlurScoped = new WeakMap();
  _listenersToRemoveAfterConfigChange = new WeakMap();
  _addSerieGroup = new WeakSet();
  addSerieGroup_fn = function() {
    this.serieGroupElement = el("g", {
      id: prefixed("serie-group")
    });
    this.svg.appendChild(this.serieGroupElement);
    this.addEventListener(this.serieGroupElement, "transitionend", __privateGet(this, _onSerieGroupTransitionendScoped), false);
    if (this.config.focusedValueShow) {
      if (!__privateGet(this, _onSerieGroupFocusScoped)) {
        __privateSet(this, _onSerieGroupFocusScoped, __privateMethod(this, _onSerieGroupFocus, onSerieGroupFocus_fn).bind(this));
        __privateSet(this, _onSerieGroupBlurScoped, __privateMethod(this, _onSerieGroupBlur, onSerieGroupBlur_fn).bind(this));
      }
      this.addEventListener(this.serieGroupElement, "focus", __privateGet(this, _onSerieGroupFocusScoped), true);
      this.addEventListener(this.serieGroupElement, "blur", __privateGet(this, _onSerieGroupBlurScoped), true);
      this.valueElGroup = el("g", {
        className: prefixed("value-element-group")
      });
      this.valueElRect = el("rect", {
        fill: this.config.focusedValueFill || "black"
      });
      this.valueElText = el("text", {
        direction: SvgChartConfig.getDirection(this.config),
        textAnchor: "middle",
        dominantBaseline: "middle",
        fontFamily: this.config.fontFamily,
        fontSize: "smaller",
        fill: this.config.focusedValueColor || "white"
      }, document.createTextNode(""));
      this.valueElGroup.appendChild(this.valueElRect);
      this.valueElGroup.appendChild(this.valueElText);
    }
  };
  _addLegend = new WeakSet();
  addLegend_fn = function() {
    const gLegend = el("g", {
      className: prefixed("legend-group")
    });
    if (this.config.legendSelect) {
      if (!__privateGet(this, _onLegendClickScoped)) {
        __privateSet(this, _onLegendClickScoped, __privateMethod(this, _onLegendClick, onLegendClick_fn).bind(this));
        __privateSet(this, _onLegendKeypressScoped, __privateMethod(this, _onLegendKeypress, onLegendKeypress_fn).bind(this));
      }
      this.addEventListener(gLegend, "keydown", __privateGet(this, _onLegendKeypressScoped), false);
      this.addEventListener(gLegend, "click", __privateGet(this, _onLegendClickScoped), false);
    }
    this.config.series.forEach((serie, serieIndex) => {
      const gSerie = el("g", {
        dataSerie: serie.id,
        tabindex: this.config.legendSelect ? 0 : null
      });
      let x = 0, y = 0;
      switch (this.config.legendPosition) {
        case 0 /* Top */:
          y = this.config.legendTop ? this.config.legendTop : this.config.padding.top / 2;
          break;
        case 2 /* Bottom */:
          y = this.config.legendBottom ? this.config.legendBottom : this.height - this.config.padding.bottom / 2;
          break;
        case 1 /* End */:
          if (this.config.ltr) {
            x = this.config.padding.start + this.chartWidth + this.config.xAxisGridPadding * 2 + this.config.paddingDefault;
            y = this.config.padding.top + this.config.yAxisGridPadding + serieIndex * this.config.paddingDefault;
          } else {
            x = this.config.xAxisGridPadding * 2 + this.config.padding.end - this.config.paddingDefault - this.config.legendWidth;
            y = this.config.padding.top + this.config.yAxisGridPadding + serieIndex * this.config.paddingDefault;
          }
          break;
      }
      const rect = el("rect", {
        x,
        y,
        rx: this.config.legendCircle ? this.config.legendWidth : 0,
        ry: this.config.legendCircle ? this.config.legendWidth : 0,
        width: this.config.legendWidth,
        height: this.config.legendWidth,
        fill: this.getSerieFill(serie, serieIndex)
      });
      const text = el("text", {
        direction: SvgChartConfig.getDirection(this.config),
        x: this.config.ltr ? x + this.config.legendWidth * 2 : x - this.config.legendWidth,
        y: y + this.config.legendWidth / 2 + 1,
        // + 1 don't know why
        textAnchor: "start",
        dominantBaseline: "middle",
        fontFamily: this.config.fontFamily,
        fill: this.config.legendColor,
        fontSize: this.config.legendFontSize
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
    if ([0 /* Top */, 2 /* Bottom */].indexOf(this.config.legendPosition) > -1) {
      let totalLegendWidth = 0;
      let curX = this.config.ltr ? 0 : this.width - this.config.legendWidth;
      gLegend.querySelectorAll("g").forEach((g) => {
        const box = g.getBBox();
        g.querySelector("rect").setAttribute("x", curX.toString());
        g.querySelector("text").setAttribute("x", (this.config.ltr ? curX + this.config.legendWidth * 2 : curX - 10).toString());
        if (this.config.ltr) {
          curX += box.width + this.config.paddingDefault;
        } else {
          curX -= box.width + this.config.paddingDefault;
        }
        totalLegendWidth += box.width + this.config.paddingDefault;
      });
      if (this.config.ltr) {
        curX -= this.config.paddingDefault;
        gLegend.setAttribute("transform", "translate(" + (this.width / 2 - curX / 2) + ", 0)");
      } else {
        totalLegendWidth -= this.config.paddingDefault;
        gLegend.setAttribute("transform", "translate(-" + (this.width / 2 - totalLegendWidth / 2) + ", 0)");
      }
    }
  };
  _addTitle = new WeakSet();
  addTitle_fn = function() {
    var x, y, dominantBaseline, textAnchor = null;
    switch (this.config.titleHorizontalPosition) {
      case 1 /* End */:
        x = this.width - this.config.paddingDefault;
        textAnchor = this.config.ltr ? "end" : "start";
        break;
      case 3 /* Start */:
        x = this.config.paddingDefault;
        textAnchor = this.config.ltr ? "start" : "end";
        break;
      default:
        x = this.width / 2;
        textAnchor = "middle";
        break;
    }
    switch (this.config.titleVerticalPosition) {
      case 6 /* Center */:
        y = this.height / 2;
        dominantBaseline = "middle";
        break;
      case 2 /* Bottom */:
        y = this.height - this.config.paddingDefault;
        dominantBaseline = "auto";
        break;
      default:
        y = this.config.paddingDefault;
        dominantBaseline = "hanging";
        break;
    }
    this.svg.appendChild(el("text", {
      direction: SvgChartConfig.getDirection(this.config),
      x,
      y: this.config.paddingDefault,
      textAnchor,
      dominantBaseline,
      fontFamily: this.config.fontFamily,
      fontSize: this.config.titleFontSize,
      fill: this.config.titleColor,
      className: prefixed("text-title")
    }, document.createTextNode(this.config.title)));
  };
  _dataBefore = new WeakSet();
  dataBefore_fn = function() {
    if (this.serieGroupElement.firstChild) {
      this.serieGroupElement.firstChild.remove();
    }
    var currentSerieGroupElement = el("g", {
      id: prefixed("serie-group-current"),
      className: this.config.transition ? prefixed("unattached") : ""
    });
    return currentSerieGroupElement;
  };
  _dataAfter = new WeakSet();
  dataAfter_fn = function(currentSerieGroupElement) {
    this.serieGroupElement.appendChild(currentSerieGroupElement).getBoundingClientRect();
    if (this.config.transition) {
      currentSerieGroupElement.classList.remove(prefixed("unattached"));
    }
  };
  _onLegendToggle = new WeakSet();
  onLegendToggle_fn = function(target) {
    var g = parent(target, "g");
    if (g && g.dataset.serie) {
      var sg = this.serieGroupElement.querySelector('g[data-serie="' + g.dataset.serie + '"]');
      if (this.unselectedSeries[g.dataset.serie]) {
        if (sg) {
          sg.setAttribute("display", "inline");
          sg.classList.remove(prefixed("unselected"));
        }
        g.classList.remove(prefixed("unselected"));
        delete this.unselectedSeries[g.dataset.serie];
      } else {
        g.classList.add(prefixed("unselected"));
        if (sg) {
          sg.classList.add(prefixed("unselected"));
        }
        this.unselectedSeries[g.dataset.serie] = true;
      }
    }
  };
  _onLegendKeypress = new WeakSet();
  onLegendKeypress_fn = function(e) {
    if (e.key === "Enter") {
      __privateMethod(this, _onLegendToggle, onLegendToggle_fn).call(this, e.target);
    }
  };
  _onLegendClick = new WeakSet();
  onLegendClick_fn = function(e) {
    __privateMethod(this, _onLegendToggle, onLegendToggle_fn).call(this, e.target);
  };
  _onSerieGroupTransitionend = new WeakSet();
  onSerieGroupTransitionend_fn = function(e) {
    const target = e.target;
    if (target.classList.contains(prefixed("unselected"))) {
      target.setAttribute("display", "none");
    }
  };
  _onSerieGroupBlur = new WeakSet();
  onSerieGroupBlur_fn = function(e) {
    var circle = e.target;
    var g = parent(circle, "g");
    var serie = g.dataset.serie;
    if (serie) {
      this.serieGroupElement.removeChild(this.valueElGroup);
    }
  };
  _onSerieGroupFocus = new WeakSet();
  onSerieGroupFocus_fn = function(e) {
    var circle = e.target;
    var g = parent(circle, "g");
    var serie = g.dataset.serie;
    if (serie) {
      var serieItem = this.config.series.find((item) => item.id === serie);
      this.valueElText.replaceChild(document.createTextNode(serieItem.title + ": " + circle.dataset.value), this.valueElText.firstChild);
      this.serieGroupElement.appendChild(this.valueElGroup);
      var box = this.valueElText.getBBox();
      var width = box.width + this.config.focusedValuePadding * 2;
      var height = box.height + this.config.focusedValuePadding * 2;
      this.valueElRect.setAttribute("width", width.toString());
      this.valueElRect.setAttribute("height", height.toString());
      this.valueElText.setAttribute("x", (width / 2).toString());
      this.valueElText.setAttribute("y", (height / 2).toString());
      const type = serieItem.type || this.config.chartType;
      let x, y = null;
      switch (type) {
        case 0 /* Line */:
        case 1 /* Bar */:
        case 2 /* LineAndBar */:
          x = (parseFloat(circle.getAttribute("cx")) || parseFloat(circle.getAttribute("x")) + parseFloat(circle.getAttribute("width")) / 2) - width / 2;
          y = (parseFloat(circle.getAttribute("cy")) || parseFloat(circle.getAttribute("y"))) - 10 - height;
          break;
        case 3 /* Pie */:
        case 4 /* Donut */:
          var d = circle.getAttribute("d").split(" ");
          x = parseFloat(d[1].trim());
          y = parseFloat(d[2].trim());
          break;
      }
      this.valueElGroup.setAttribute("transform", "translate(" + x + ", " + y + ")");
    }
  };
  /**
   * Mapper for chart types and chart controllers.
   */
  __privateAdd(SvgChart, _chartTypeControllers, { ChartType: Controller });
  (() => {
    __privateGet(_SvgChart, _chartTypeControllers)[0 /* Line */] = LineController;
    __privateGet(_SvgChart, _chartTypeControllers)[1 /* Bar */] = BarController;
    __privateGet(_SvgChart, _chartTypeControllers)[2 /* LineAndBar */] = BarAndLineController;
    __privateGet(_SvgChart, _chartTypeControllers)[3 /* Pie */] = PieController;
    __privateGet(_SvgChart, _chartTypeControllers)[4 /* Donut */] = DonutController;
  })();
  /**
   * All embedded color palettes. Set another with {@link setActiveColorPalette}.
   */
  SvgChart.colorPalettes = colors;
  /**
   * Some CSS rules for synamic styles are added to the HEAD of the document.
   */
  __privateAdd(SvgChart, _cssAdded, false);
  /**
   * Current color palette. Set another one with {@link setActiveColorPalette}.
   */
  __privateAdd(SvgChart, _activeColorPalette, colors.dutchFieldColorPalette);

  // playground/radar.js
  alert("Hoi");
})();
//# sourceMappingURL=radar-bundle.js.map
