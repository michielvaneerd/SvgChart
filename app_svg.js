function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min);
}

var chartInfo = {
    chart1: {
        config: {
            chartType: 'line',
            title: 'Basic line chart',
            minValue: 0,
            maxValue: 100,
            legendPosition: 'top',
            legendTop: 60,
            padding: {
                right: 40
            },
            series: [
                {
                    id: 'train',
                    title: 'Train',
                    type: 'line'
                },
                {
                    id: 'car',
                    title: 'Car',
                    type: 'line'
                }
            ]
        },
        data: null,
        chart: null
    },
    chart2: {
        config: {
            chartType: 'bar',
            xAxisGridColumns: true,
            title: 'Basic bar chart',
            minValue: 0,
            maxValue: 100,
            legendPosition: 'top',
            legendTop: 60,
            padding: {
                right: 40
            },
            series: [
                {
                    id: 'train',
                    title: 'Train',
                    type: 'bar'
                },
                {
                    id: 'car',
                    title: 'Car',
                    type: 'bar'
                }
            ]
        },
        data: null,
        chart: null
    },
    chart3: {
        config: {
            chartType: 'pie',
            title: 'Basic pie chart',
            legendPosition: 'top',
            legendTop: 60,
            series: [
                {
                    id: 'train',
                    title: 'Train'
                },
                {
                    id: 'car',
                    title: 'Car'
                },
                {
                    id: 'bike',
                    title: 'Bike'
                },
                {
                    id: 'feet',
                    title: 'Feet'
                }
            ]
        },
        data: null,
        chart: null
    }
};

function setChartData(id) {
    var isPieOrDonut = ['pie', 'donut'].indexOf(chartInfo[id].config.chartType) !== -1;
    var serieData = {};
    chartInfo[id].config.series.forEach(function(serie) {
        serieData[serie.id] = !isPieOrDonut ? Array(7).fill(1).map(item => getRandomIntInclusive(0, 100)) : getRandomIntInclusive(0, 100);
    });
    chartInfo[id].data = {
        series: serieData,
        xAxis: {
            columns: isPieOrDonut ? ['mon'] : ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']
        }
    };
}

function doChart(id) {
    setChartData(id);
    if (chartInfo[id].chart === null) {
        chartInfo[id].chart = new SvgChart(document.getElementById(id), chartInfo[id].config);
        document.getElementById(id + 'RandomDataButton').addEventListener('click', function() {
            doChart(id);
        });
    } else {
        chartInfo[id].chart.setConfig(chartInfo[id].config);
    }
    chartInfo[id].chart.chart(chartInfo[id].data);
    document.getElementById(id + 'CodeConfig').innerText = JSON.stringify(chartInfo[id].config, null, 2);
    document.getElementById(id + 'CodeData').innerText = JSON.stringify(chartInfo[id].data, null, 2);
}

doChart('chart1');
doChart('chart2');
doChart('chart3');
