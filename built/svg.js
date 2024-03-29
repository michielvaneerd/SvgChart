var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _SvgChart_instances, _SvgChart_addSerieGroup, _SvgChart_addLegend, _SvgChart_addTitle, _SvgChart_dataBefore, _SvgChart_dataAfter, _SvgChart_onLegendToggle, _SvgChart_onLegendKeypress, _SvgChart_onLegendClick, _SvgChart_onSerieGroupTransitionend, _SvgChart_onSerieGroupBlur, _SvgChart_onSerieGroupFocus;
import { el, parent, prefixed } from "./utils.js";
import { colors } from "./colors.js";
import { LineController } from "./charts/line_chart_controller.js";
import { BarController } from "./charts/bar_chart_controller.js";
import { BarAndLineController } from "./charts/bar_and_line_chart_controller.js";
import { DonutController } from "./charts/donut_chart_controller.js";
import { PieController } from "./charts/pie_chart_controller.js";
import { SvgChartConfig, Direction } from "./config";
;
class SvgChart {
    /**
     * Set a color palette for all chart instances.
     * @param {Array<string>} colors Array of colors.
     */
    static setActiveColorPalette(colors) {
        SvgChart.activeColorPalette = colors;
    }
    /**
     * Constructor - create a new chart instance.
     * @param {HTMLElement} parent Parent DOM node the SVG element will be attached to.
     * @param {SvgChartConfig} config Configuration object.
     */
    constructor(parent, config) {
        _SvgChart_instances.add(this);
        this.onLegendClickScoped = null;
        this.onLegendKeypressScoped = null;
        this.onSerieGroupTransitionendScoped = null;
        this.onSerieGroupFocusScoped = null;
        this.onSerieGroupBlurScoped = null;
        if (!SvgChart.cssAdded) {
            SvgChart.cssAdded = true;
            // TODO: split between chart types.
            const cssRules = [
                '.' + prefixed('line-point') + ', g.' + prefixed('legend-group') + ' g, .' + prefixed('x-axis-grid-column-selectable-label') + ' { cursor: pointer; }',
                '.' + prefixed('line-point') + ':hover, circle.' + prefixed('line-point') + ':focus { stroke-width: 6; outline: none; }',
                '#' + prefixed('serie-group') + ' g { transition: opacity 0.6s; }',
                '#' + prefixed('serie-group') + ' g.' + prefixed('unselected') + ' { opacity: 0; }',
                '#' + prefixed('serie-group-current') + ' { transition: opacity 1s; opacity: 1; }',
                '#' + prefixed('serie-group-current') + '.' + prefixed('unattached') + ' { opacity: 0; }',
                'g.' + prefixed('legend-group') + ' g.' + prefixed('unselected') + ' { opacity: 0.4; }',
                'rect.' + prefixed('bar') + ':hover, path.' + prefixed('pie-piece') + ':hover { fill-opacity: 0.7; }',
                //'path.' + prefixed('pie-piece') + ':focus, rect.' + prefixed('bar') + ':focus { outline: none; stroke-width:1; stroke:white; fill-opacity:1; }'
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
     * Set the configuration for this chart instance.
     * @param {Object} config Configuration object.
     */
    setConfig(config) {
        const newConfig = new SvgChartConfig();
        this.config = Object.assign({}, newConfig, config);
        this.config.padding = Object.assign({}, newConfig.padding, this.config.padding);
        this.isLTR = this.config.dir === Direction.Ltr;
        this.config = Object.assign(this.config, SvgChart.chartTypeControllers[this.config.chartType].requiredConfigWithValue);
        if (this.isLTR) {
            this.config.padding.left = this.config.padding.start;
            this.config.padding.right = this.config.padding.end;
        }
        else {
            this.config.padding.left = this.config.padding.end;
            this.config.padding.right = this.config.padding.start;
        }
        this.controller = new SvgChart.chartTypeControllers[config.chartType](this);
        this.svg.setAttribute('direction', this.config.dir);
        // First remove event listener from a previous config if they exist.
        if (this._listenersToRemoveAfterConfigChange && this._listenersToRemoveAfterConfigChange.length) {
            this._listenersToRemoveAfterConfigChange.forEach(function (item) {
                item.node.removeEventListener(item.eventName, item.callback, item.capture);
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
        if (!this.onSerieGroupTransitionendScoped) {
            this.onSerieGroupTransitionendScoped = __classPrivateFieldGet(this, _SvgChart_instances, "m", _SvgChart_onSerieGroupTransitionend).bind(this);
        }
        if (this.config.drawOnConfig) {
            this.drawOnConfigGroup = el('g', {
                className: prefixed('draw-on-config-group')
            });
            this.svg.appendChild(this.drawOnConfigGroup);
        }
        if (this.config.title) {
            __classPrivateFieldGet(this, _SvgChart_instances, "m", _SvgChart_addTitle).call(this);
        }
        if (this.config.legend) {
            __classPrivateFieldGet(this, _SvgChart_instances, "m", _SvgChart_addLegend).call(this);
        }
        this.controller.configBefore();
        this.config.series.forEach(function (serie) {
            this.controller.configSerieBefore(serie);
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
            this.controller.configSerieAfter(serie);
        }, this);
        if (this.config.drawOnConfig) {
            this.config.drawOnConfig(this, this.drawOnConfigGroup);
        }
        if (this.config.drawOnData) {
            this.drawOnDataGroup = el('g', {
                className: prefixed('draw-on-data-group')
            });
            this.svg.appendChild(this.drawOnDataGroup);
        }
        __classPrivateFieldGet(this, _SvgChart_instances, "m", _SvgChart_addSerieGroup).call(this);
        this.controller.configAfter();
    }
    /**
     * Writing the charts.
     * @param {ChartData} data Data object.
     */
    chart(data = null) {
        if (data !== null) {
            this.data = data;
        }
        const currentSerieGroupElement = __classPrivateFieldGet(this, _SvgChart_instances, "m", _SvgChart_dataBefore).call(this);
        this.controller.draw(currentSerieGroupElement);
        __classPrivateFieldGet(this, _SvgChart_instances, "m", _SvgChart_dataAfter).call(this, currentSerieGroupElement);
        if (this.config.drawOnData) {
            this.config.drawOnData(this, this.drawOnDataGroup);
        }
    }
    // setSelectedIndex(index) {
    //     var textNodes = this.xAxisLabelsGroupElement.querySelectorAll('text.' + prefixed('x-axis-grid-column-selectable-label'));
    //     return this.#onXAxisLabelGroupSelect(textNodes.item(index));
    // }
    /**
     * Saves chart as PNG file.
     * @param {String} filename Filename.
     */
    saveAsPng(filename) {
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
        };
        img.src = image64;
    }
    getSeriePropertyColor(props, serie, serieIndex) {
        for (var i = 0; i < props.length; i++) {
            var key = props[i];
            if (serie[key]) {
                return key === 'fillGradient' ? `url(#${serie.id}-gradient)` : serie[key];
            }
        }
        if (serie.color) {
            return serie.color;
        }
        return SvgChart.activeColorPalette[serieIndex];
    }
    getSeriePointColor(serie, serieIndex) {
        return this.getSeriePropertyColor(['pointColor', 'strokeColor'], serie, serieIndex);
    }
    getSerieStrokeColor(serie, serieIndex) {
        return this.getSeriePropertyColor(['strokeColor'], serie, serieIndex);
    }
    getSerieFill(serie, serieIndex) {
        return this.getSeriePropertyColor(['fillGradient'], serie, serieIndex);
    }
    /**
     * Adds an event listener to a node and adds it to the _listenersToRemoveAfterConfigChange array as well, so we can remove them in one place.
     * @param {Node} node Node to add the listener to.
     * @param {string} eventName Name of event.
     * @param {Function} callback Function that needs to be executed.
     * @param {boolean} capture Capture or not.
     */
    addEventListener(node, eventName, callback, capture) {
        node.addEventListener(eventName, callback, capture);
        this._listenersToRemoveAfterConfigChange.push({
            node: node,
            eventName: eventName,
            callback: callback,
            capture: capture
        });
    }
}
_SvgChart_instances = new WeakSet(), _SvgChart_addSerieGroup = function _SvgChart_addSerieGroup() {
    this.serieGroupElement = el('g', {
        id: prefixed('serie-group')
    });
    this.svg.appendChild(this.serieGroupElement);
    this.addEventListener(this.serieGroupElement, 'transitionend', this.onSerieGroupTransitionendScoped, false);
    if (this.config.focusedValueShow) {
        if (!this.onSerieGroupFocusScoped) {
            this.onSerieGroupFocusScoped = __classPrivateFieldGet(this, _SvgChart_instances, "m", _SvgChart_onSerieGroupFocus).bind(this);
            this.onSerieGroupBlurScoped = __classPrivateFieldGet(this, _SvgChart_instances, "m", _SvgChart_onSerieGroupBlur).bind(this);
        }
        this.addEventListener(this.serieGroupElement, 'focus', this.onSerieGroupFocusScoped, true);
        this.addEventListener(this.serieGroupElement, 'blur', this.onSerieGroupBlurScoped, true);
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
}, _SvgChart_addLegend = function _SvgChart_addLegend() {
    const gLegend = el('g', {
        className: prefixed('legend-group')
    });
    if (this.config.legendSelect) {
        if (!this.onLegendClickScoped) {
            this.onLegendClickScoped = __classPrivateFieldGet(this, _SvgChart_instances, "m", _SvgChart_onLegendClick).bind(this);
            this.onLegendKeypressScoped = __classPrivateFieldGet(this, _SvgChart_instances, "m", _SvgChart_onLegendKeypress).bind(this);
        }
        this.addEventListener(gLegend, 'keydown', this.onLegendKeypressScoped, false);
        this.addEventListener(gLegend, 'click', this.onLegendClickScoped, false);
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
                    x = this.config.padding.start + this.chartWidth + (this.config.xAxisGridPadding * 2) + this.config.paddingDefault;
                    y = this.config.padding.top + this.config.yAxisGridPadding + (serieIndex * this.config.paddingDefault);
                }
                else {
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
            direction: this.config.dir,
            x: this.isLTR ? (x + (this.config.legendWidth * 2)) : (x - this.config.legendWidth),
            y: y + (this.config.legendWidth / 2) + 1,
            textAnchor: 'start',
            dominantBaseline: 'middle',
            fontFamily: this.config.fontFamily,
            fill: this.config.legendColor,
            fontSize: this.config.legendFontSize,
        }, document.createTextNode(serie.title));
        if (this.isLTR) {
            gSerie.appendChild(rect);
            gSerie.appendChild(text);
        }
        else {
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
            g.querySelector('rect').setAttribute('x', curX.toString());
            g.querySelector('text').setAttribute('x', (this.isLTR ? (curX + (this.config.legendWidth * 2)) : (curX - 10)).toString());
            if (this.isLTR) {
                curX += (box.width + this.config.paddingDefault);
            }
            else {
                curX -= (box.width + this.config.paddingDefault);
            }
            totalLegendWidth += (box.width + this.config.paddingDefault);
        }, this);
        if (this.isLTR) {
            curX -= this.config.paddingDefault;
            gLegend.setAttribute('transform', 'translate(' + ((this.width / 2) - (curX / 2)) + ', 0)');
        }
        else {
            totalLegendWidth -= this.config.paddingDefault;
            gLegend.setAttribute('transform', 'translate(-' + ((this.width / 2) - (totalLegendWidth / 2)) + ', 0)');
        }
    }
}, _SvgChart_addTitle = function _SvgChart_addTitle() {
    var x, y, dominantBaseline, textAnchor = null;
    switch (this.config.titleHorizontalPosition) {
        case 'end':
            x = this.width - this.config.paddingDefault;
            textAnchor = this.isLTR ? 'end' : 'start';
            break;
        case 'start':
            x = this.config.paddingDefault;
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
            y = this.height - this.config.paddingDefault;
            dominantBaseline = 'auto';
            break;
        default:
            y = this.config.paddingDefault;
            dominantBaseline = 'hanging';
            break;
    }
    this.svg.appendChild(el('text', {
        direction: this.config.dir,
        x: x,
        y: this.config.paddingDefault,
        textAnchor: textAnchor,
        dominantBaseline: dominantBaseline,
        fontFamily: this.config.fontFamily,
        fontSize: this.config.titleFontSize,
        fill: this.config.titleColor,
        className: prefixed('text-title'),
    }, document.createTextNode(this.config.title)));
}, _SvgChart_dataBefore = function _SvgChart_dataBefore() {
    if (this.serieGroupElement.firstChild) {
        this.serieGroupElement.firstChild.remove();
    }
    var currentSerieGroupElement = el('g', {
        id: prefixed('serie-group-current'),
        className: this.config.transition ? prefixed('unattached') : ''
    });
    return currentSerieGroupElement;
}, _SvgChart_dataAfter = function _SvgChart_dataAfter(currentSerieGroupElement) {
    this.serieGroupElement.appendChild(currentSerieGroupElement).getBoundingClientRect(); // getBoundingClientRect causes a reflow, so we don't have to use setTimeout to remove the class.
    if (this.config.transition) {
        currentSerieGroupElement.classList.remove(prefixed('unattached'));
    }
}, _SvgChart_onLegendToggle = function _SvgChart_onLegendToggle(target) {
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
        }
        else {
            g.classList.add(prefixed('unselected'));
            if (sg) {
                sg.classList.add(prefixed('unselected'));
            }
            this.unselectedSeries[g.dataset.serie] = true;
        }
    }
}, _SvgChart_onLegendKeypress = function _SvgChart_onLegendKeypress(e) {
    if (e.key === 'Enter') {
        __classPrivateFieldGet(this, _SvgChart_instances, "m", _SvgChart_onLegendToggle).call(this, e.target);
    }
}, _SvgChart_onLegendClick = function _SvgChart_onLegendClick(e) {
    __classPrivateFieldGet(this, _SvgChart_instances, "m", _SvgChart_onLegendToggle).call(this, e.target);
}, _SvgChart_onSerieGroupTransitionend = function _SvgChart_onSerieGroupTransitionend(e) {
    // Currently only used to add display none to it when this serie group is unselected.
    // We have to add display none, so this node doesn't make part of the UI anymore and cannot hide other nodes.
    if (e.target.classList.contains(prefixed('unselected'))) {
        e.target.setAttribute('display', 'none');
    }
}, _SvgChart_onSerieGroupBlur = function _SvgChart_onSerieGroupBlur(e) {
    var circle = e.target;
    var g = parent(circle, 'g');
    var serie = g.dataset.serie;
    if (serie) {
        // Remove the current value element.
        this.serieGroupElement.removeChild(this.valueElGroup);
    }
}, _SvgChart_onSerieGroupFocus = function _SvgChart_onSerieGroupFocus(e) {
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
        this.valueElRect.setAttribute('width', width.toString());
        this.valueElRect.setAttribute('height', height.toString());
        this.valueElText.setAttribute('x', (width / 2).toString());
        this.valueElText.setAttribute('y', (height / 2).toString());
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
};
SvgChart.cssAdded = false;
SvgChart.colorPalettes = colors;
SvgChart.activeColorPalette = colors.dutchFieldColorPalette;
SvgChart.chartTypes = {
    line: 'line',
    bar: 'bar',
    pie: 'pie',
    donut: 'donut',
    lineAndBar: 'lineAndBar'
};
SvgChart.chartTypeControllers = {
    line: LineController,
    bar: BarController,
    lineAndBar: BarAndLineController,
    pie: PieController,
    donut: DonutController
};
// Add el function to chart instance, so we can use it in the calling function, for example
// to use it in the drawOnConfig or drawOnData callbacks.
SvgChart.prototype.el = el;
export { SvgChart };
