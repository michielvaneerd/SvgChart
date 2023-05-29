import { SvgChartConfig } from "../src/config";
import { SvgChart } from "../src/svg";
import { ChartType } from "../src/types";

const config = new SvgChartConfig();
config.title = 'Bubble';
config.minValue = 0;
config.maxValue = 100;
//config.bubbleStrokeWidth = 2;
//config.bubbleFillOpacity = .2
config.chartType = ChartType.Bubble;
config.xAxisGridPadding = 20;
config.yAxisGridPadding = 20;
//config.focusedValueCallback = (serie, value) => '<strong>Serie</strong>: ' + serie.title + '<br> en value ' + value;

//config.backgroundColor = '#FCFCFC';
config.series = [
    {
        id: 'humans',
        title: 'Humans'
    },
    {
        id: 'animals',
        title: 'Animals'
    },
    {
        id: 'flowers',
        title: 'Flowers'
    },
];

const chart = new SvgChart(document.getElementById('chart'), config);

const chartSeries = {
    // Each point: [y, radius]
    series: {
        humans: [
            [12, 34],
            [23, 40],
            [45, 100,],
            [45, 56],
            [45, 56],
            [45, 56],
            [10, 34]
        ],
        animals: [
            [15, 4],
            [3, 40],
            [65, 100,],
            [34, 16],
            [18, 89],
            [5, 6],
            [12, 4]
        ],
        flowers: [
            [2, 3],
            [3, 4],
            [5, 10,],
            [5, 6],
            [5, 6],
            [5, 6],
            [1, 4]
        ],
    },
    xAxis: {
        columns: [
            'mon',
            'tue',
            'wed',
            'thu',
            'fri',
            'sat',
            'sun'
        ]
    }
};

chart.chart(chartSeries);