function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function getRandomNumbersSummedUpTo(count, maxSum) {
    let sum = maxSum;
    const numbers = [];
    for (let i = 0; i < count - 1; i++) {
        const randomNumber = Math.floor(Math.random() * sum);
        sum -= randomNumber < 0 ? 0 : randomNumber;
        numbers.push(randomNumber < 0 ? 0 : randomNumber);
    }
    numbers.push(sum);
    return numbers;
}

var chartInfo = {
    chartBasicLine: {
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
                },
                {
                    id: 'car',
                    title: 'Car',
                }
            ]
        },
        data: null,
        chart: null
    },
    chartBasicBar: {
        config: {
            chartType: 'bar',
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
                },
                {
                    id: 'car',
                    title: 'Car',
                }
            ]
        },
        data: null,
        chart: null
    },
    chartStackedBar: {
        config: {
            chartType: 'bar',
            title: 'Stacked bar chart',
            legendPosition: 'top',
            minValue: 0,
            maxValue: 100,
            legendTop: 60,
            barSpacing: 20,
            barStacked: true,
            series: [
                {
                    id: 'train',
                    title: 'Train',
                },
                {
                    id: 'car',
                    title: 'Car',
                },
                {
                    id: 'bike',
                    title: 'Bike',
                },
                {
                    id: 'feet',
                    title: 'Feet',
                }
            ]
        },
        data: null,
        chart: null,
        dataFunc: function (id) {
            var numbers = [];
            var serieData = {};
            for (let i = 0; i < 7; i++) {
                //serieData[serie.id] = getRandomNumbersSummedUpTo(7, 100);
                numbers.push(getRandomNumbersSummedUpTo(4, 100));
            };
            chartInfo[id].config.series.forEach(function (serie) {
                serieData[serie.id] = [];
            });
            numbers.forEach(function(numberArray) {
                chartInfo[id].config.series.forEach(function (serie, serieIndex) {
                    serieData[serie.id].push(numberArray[serieIndex]);
                });
            });
            chartInfo[id].data = {
                series: serieData,
                xAxis: {
                    columns: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']
                }
            };
        }
    },
    chartBasicPie: {
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
    },
    chartBasicDonut: {
        config: {
            chartType: 'donut',
            title: 'Basic donut chart',
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
    },
    chartBarAndLine: {
        config: {
            chartType: 'lineAndBar',
            title: 'Bar and line chart',
            legendPosition: 'top',
            legendTop: 60,
            minValue: 0,
            maxValue: 100,
            barSpacing: 10,
            series: [
                {
                    id: 'train',
                    title: 'Train',
                },
                {
                    id: 'car',
                    title: 'Car',
                },
                {
                    id: 'bike',
                    title: 'Bike',
                    type: 'bar'
                },
                {
                    id: 'feet',
                    title: 'Feet',
                    type: 'bar'
                }
            ]
        },
        data: null,
        chart: null,
    }
};

function setChartData(id) {
    var isPieOrDonut = ['pie', 'donut'].indexOf(chartInfo[id].config.chartType) !== -1;
    var serieData = {};
    chartInfo[id].config.series.forEach(function (serie) {
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
    chartInfo[id].dataFunc ? chartInfo[id].dataFunc(id) : setChartData(id);
    if (chartInfo[id].chart === null) {
        chartInfo[id].chart = new SvgChart(document.getElementById(id), chartInfo[id].config);
        document.getElementById(id + 'RandomDataButton').addEventListener('click', function () {
            doChart(id);
        });
    } else {
        chartInfo[id].chart.setConfig(chartInfo[id].config);
    }
    chartInfo[id].chart.chart(chartInfo[id].data);
    document.getElementById(id + 'CodeConfig').innerText = JSON.stringify(chartInfo[id].config, null, 2);
    document.getElementById(id + 'CodeData').innerText = JSON.stringify(chartInfo[id].data, null, 2);
}

doChart('chartBasicLine');
doChart('chartBasicBar');
doChart('chartStackedBar');
doChart('chartBasicPie');
doChart('chartBasicDonut');
doChart('chartBarAndLine');
