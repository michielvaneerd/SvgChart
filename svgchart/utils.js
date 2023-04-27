/**
 * SVG namespace.
 */
const ns = 'http://www.w3.org/2000/svg';

/**
 * Regex we use to convert from dash to camelcase.
 */
const attributesCamelCaseToDashRegex = /[A-Z]/g;

/**
 * String we use to prefix all class names and ID names.
 */
const classNamePrefix = 'svg-chart-';

/**
 * Add CSS rules to the HEAD tag.
 * @param {Array} rules CSS rules to add.
 */
function addCssRules(rules) {
    document.head.appendChild(document.createElement("style")).innerHTML = rules.join("\n");
}

/**
 * Creates a new HTML element.
 * @param {String} name Tag name for new HTML element.
 * @param {Object} [attributes] Key value pair of attributes to set.
 * @param {HTMLElement} [child] Child node to add to new HTML element.
 * @returns {HTMLElement} The new HTML element.
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

/**
 * Searches up from currentElement until an element is found with the parentName. 
 * @param {HTMLE} currentElement HTML element to search up from.
 * @param {String} parentName Tag name of element to search for.
 * @returns {HTMLElement|null} Found HTML element or null.
 */
function parent(currentElement, parentName) {
    var el = currentElement;
    while (el && el.nodeName.toLowerCase() !== parentName.toLowerCase()) {
        el = el.parentNode;
    }
    return el;
}

/**
 * Returns the className with prefix.
 * @param {String} className Class name to prefix.
 * @returns {String} Classname with prefix.
 */
function prefixed(className) {
    return classNamePrefix + className;
}

/**
 * Loop through items in normal (isRTL = true) or reversed (isRTL = false) order and call the callback for each item.
 * @param {Object} instance Instance of object that will be this in the callback.
 * @param {Array} items Array of items to loop through.
 * @param {Boolean} isRTL Whether it is left-to-right or right-to-left.
 * @param {Function} callback Callback function. Arguments it receives: {Any} item, {Number} index, {Array} items
 */
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

/**
 * Convert polar to cartesian point.
 * @param {Number} centerX Center x.
 * @param {Number} centerY Center y.
 * @param {Number} radius Radius of arc.
 * @param {Number} angleInDegrees Angle in degrees.
 * @returns {Object} Point.
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
 * @param {Number} x X point.
 * @param {Number} y Y point.
 * @param {Number} radius Radius of arc.
 * @param {Number} startAngle Start angle.
 * @param {Number} endAngle End angle.
 * @returns {Array} Array of path coordinates.
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
 * @param {Number} x X point.
 * @param {Number} y Y point.
 * @param {Number} radius Radius of arc.
 * @param {Number} spread Spread of the donut.
 * @param {Number} startAngle Start angle.
 * @param {Number} endAngle End angle.
 * @returns {Array} Array of path coordinates.
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

export { addCssRules, el, parent, prefixed, directionForEach, describeArcPie, describeArcDonut };