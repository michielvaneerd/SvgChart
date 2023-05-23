import { ChartPoint } from "./svg";

/**
 * Callback function that is called by the {@link directionForEach} function.
 */
type DirectionForEachCallback = (item: any, index: number, items: Array<any>) => void;

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
 * Creates a new HTML element.
 * 
 * @param name Tag name for new HTML element.
 * @param attributes - Key value pair of attributes to set.
 * @param child - Child node to add to new HTML element.
 * @returns The new HTML element.
 */
function el(name: string, attributes: object = {}, child: Node = null): SVGElement {
    var el = document.createElementNS(ns, name);
    Object.keys(attributes).forEach((key) => {
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
                //el.setAttribute(key.replaceAll(attributesCamelCaseToDashRegex, "-$&").toLowerCase(), attributes[key]);
                el.setAttribute(key.replace(attributesCamelCaseToDashRegex, "-$&").toLowerCase(), attributes[key]);
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
 * 
 * @param currentElement - HTML element to search up from.
 * @param parentName - Tag name of element to search for.
 * @returns Found HTML element or null.
 */
function parent(currentElement: SVGElement, parentName: string): SVGElement | null {
    var el = currentElement;
    while (el && el.nodeName.toLowerCase() !== parentName.toLowerCase()) {
        el = el.parentNode as SVGElement;
    }
    return el;
}

/**
 * Returns the className with prefix.
 * 
 * @param className - Class name to prefix.
 * @returns Classname with prefix.
 */
function prefixed(className: string): string {
    return classNamePrefix + className;
}

/**
 * Loop through items in normal (isRTL = true) or reversed (isRTL = false) order and call the callback for each item.
 * 
 * @param instance - Instance of object that will be this in the callback.
 * @param items - Array of items to loop through.
 * @param isRTL - Whether it is left-to-right or right-to-left.
 * @param callback - Callback function that is called for each array item.
 */
function directionForEach(instance: object, items: Array<any>, isRTL: boolean, callback: DirectionForEachCallback) {
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
 * 
 * @param centerX - Center x.
 * @param centerY - Center y.
 * @param radius - Radius of arc.
 * @param angleInDegrees - Angle in degrees.
 * @returns ChartPoint.
 */
function polarToCartesian(centerX: number, centerY: number, radius: number, angleInDegrees: number): ChartPoint {
    var angleInRadians = (angleInDegrees - 90) * Math.PI / 180;
    return {
        x: centerX + (radius * Math.cos(angleInRadians)),
        y: centerY + (radius * Math.sin(angleInRadians))
    };
}

export { el, parent, prefixed, directionForEach, polarToCartesian, DirectionForEachCallback };