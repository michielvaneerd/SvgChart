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
}

/**
 * Possible type of charts.
 */
enum ChartType {
    Line,
    Bar,
    LineAndBar,
    Pie,
    Donut
}

export { ScopedEventCallback, ChartConfigSerie, ChartType };