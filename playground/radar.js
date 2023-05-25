import { SvgChartConfig } from "../src/config";
import { SvgChart } from "../src/svg";
import { ChartType } from "../src/types";

const config = new SvgChartConfig();
config.title = 'Radar';
config.minValue = 0;
config.maxValue = 100;
config.yAxisStep = 20;
config.yAxisLabelStep = 20;
config.chartType = ChartType.Radar;
config.backgroundColor = '#FCFCFC';
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
    series: {
        humans: [12, 23, 45, 100, 45, 56],
        animals: [2, 34, 0, 67, 78, 100],
        flowers: [4, 4, 4, 37, 88, 99],
    },
    xAxis: {
        columns: [
            'sleep',
            'eat',
            'move',
            'fight',
            'other',
            'varia'
        ]
    }
};

chart.chart(chartSeries);