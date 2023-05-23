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
    type?: string;
    fillGradient?: string;
}

export { ScopedEventCallback, ChartConfigSerie };