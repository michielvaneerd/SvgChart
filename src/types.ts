import { SvgChart } from "./svg";

/**
 * Function that are scoped to a specific `this` object and that is called when an event happens.
 */
type ScopedEventCallback = (e: Event) => void;

/**
 * Serie object that is used in the config phase.
 */
type ChartConfigSerie = {
    id: string;
    title: string;
    type?: ChartType;
    fillGradient?: string;
    color?: string;
}

/**
 * Possible type of charts.
 */
enum ChartType {
    Line,
    Bar,
    LineAndBar,
    Pie,
    Donut,
    Radar,
    Bubble
}

/**
 * Data object with series data and columns.
 */
interface ChartData {
    /**
     * Series are objects with key = serie ID and value = an array of numbers or an an array of array of numbers (for example for bubble charts for the 2d and 3th dimension because for this chart we have 3 dimensions)
     */
    series: { [key: string]: [number] |  [[number]]},
    /**
     * For most charts we need colums to display on the X axis, but for example for pie and donut charts we don't need them.
     */
    xAxis?: { columns: string[] };
};

/**
 * Data point with x and y values.
 */
interface ChartPoint {
    x: number;
    y: number;
}

/**
 * Object with information about an event for a specific node.
 */
interface ChartEventInfo {
    node: Node;
    eventName: string;
    callback: EventListenerOrEventListenerObject;
    capture: boolean;
}

/**
 * Hash with string as key and boolean as value.
 */
type StringBooleanHash = {
    [key: string]: boolean;
}

/**
 * Callback function that is getting called when a X axis label is selected.
 */
type XAxisColumnSelectedCallback = (svgChart: SvgChart, selectedIndex: number) => void;

/**
 * Callback function that is getting called at a specific point during the chart drawing.
 */
type DrawCallback = (svgChart: SvgChart, groupNode: SVGElement) => void;

/**
 * Callback function that needs to return the HTML string to display when an item received focus.
 */
type FocusedValueCallback = (serie: ChartConfigSerie, serieIndex: number, dataIndex: number) => string;

/**
 * Position enum.
 */
enum ChartPosition {
    Top,
    End,
    Bottom,
    Start,
    Left,
    Right,
    Center
}


export {
    ScopedEventCallback,
    ChartConfigSerie,
    ChartType,
    ChartData,
    ChartPoint,
    ChartEventInfo,
    StringBooleanHash,
    XAxisColumnSelectedCallback,
    DrawCallback,
    ChartPosition,
    FocusedValueCallback
};