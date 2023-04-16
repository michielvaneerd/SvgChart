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

var htmlDir = document.documentElement.getAttribute('dir') || 'ltr';

var chartInfo = {
    chartBasicLine: {
        config: {
            chartType: 'line',
            dir: htmlDir,
            title: 'Basic line chart',
            minValue: 0,
            maxValue: 100,
            legendPosition: 'end',
            xAxisTitle: 'Days',
            yAxisTitle: 'Count',
            //legendTop: 60,
            padding: {
                end: 100,
                start: 120,
                top: 50,
                bottom: 70
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
        //data: null,
        data: {
            series: {
                train: [34, 56, 78, 34, 78, 89, 100],
                car: [44, 23, 56, 23, 67, 34, 67],
                //bike: Array(7).fill(1).map(item => getRandomIntInclusive(0, 100))
            },
            xAxis: {
                columns: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']
            }
        },
        chart: null
    },
    chartBasicBar: {
        config: {
            chartType: 'bar',
            dir: htmlDir,
            title: 'Basic bar chart',
            minValue: 0,
            maxValue: 100,
            legendPosition: 'top',
            legendTop: 60,
            padding: {
                end: 40
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
            dir: htmlDir,
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
            dir: htmlDir,
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
            dir: htmlDir,
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
            dir: htmlDir,
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
    },
    chartCustom: {
        config: {
            padding: {
                bottom: 70,
                start: 80
            },
            chartType: 'line',
            dir: htmlDir,
            title: 'Custom line chart',
            legendPosition: 'top',
            legendTop: 60,
            xAxisTitle: 'Days',
            yAxisTitle: 'Count',
            xAxisTitleColor: 'black',
            yAxisTitleColor: 'black',
            minValue: 0,
            maxValue: 100,
            barSpacing: 10,
            xAxisGridColumnsSelectable: true,
            xAxisGridColumnsSelectableColor: 'red',
            xAxisGridColumns: true,
            lineCurved: false,
            onXAxisLabelGroupSelect: function(chart, index) {
                var serieValues = [];
                Object.keys(chart.data.series).forEach(function(serie) {
                    serieValues.push(`${serie} = ${chart.data.series[serie][index]}`);
                });
                document.getElementById('chartCustomCodeInfo').innerHTML = `Clicked on '${chart.data.xAxis.columns[index]}' with values: ${serieValues.join(", ")}`;
            },
            drawBefore: function(chart, groupNode) {
                groupNode.appendChild(chart.el('rect', {
                    x: chart.config.padding.left,
                    y: chart.config.padding.top,
                    width: chart.chartWidth,
                    height: chart.lineAndBarValueHeight * 20,
                    fill: 'darkgreen',
                    fillOpacity: 0.2
                }));
                groupNode.appendChild(chart.el('rect', {
                    x: chart.config.padding.left,
                    y: chart.config.padding.top + (chart.lineAndBarValueHeight * 20),
                    width: chart.chartWidth,
                    height: chart.lineAndBarValueHeight * 40,
                    fill: 'orange',
                    fillOpacity: 0.2
                }));
                groupNode.appendChild(chart.el('rect', {
                    x: chart.config.padding.left,
                    y: chart.config.padding.top + (chart.lineAndBarValueHeight * 60),
                    width: chart.chartWidth,
                    height: chart.lineAndBarValueHeight * 40,
                    fill: 'red',
                    fillOpacity: 0.2
                }));
            },
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
                }
            ]
        },
        data: null,
        chart: null,
        onNewDataFunc: function() {
            document.getElementById('chartCustomCodeInfo').innerHTML = 'Click a day to see details! ';
        }
    },
    chartDynamic: {
        config: {
            padding: {
                bottom: 70,
                start: 80
            },
            chartType: 'line',
            dir: htmlDir,
            title: 'Dynamic chart',
            legendPosition: 'top',
            legendTop: 60,
            xAxisTitle: 'Days',
            yAxisTitle: 'Count',
            xAxisTitleColor: 'black',
            yAxisTitleColor: 'black',
            minValue: 0,
            maxValue: 100,
            barSpacing: 10,
            xAxisGridColumnsSelectable: true,
            xAxisGridColumnsSelectableColor: 'red',
            xAxisGridColumns: true,
            lineCurved: true,
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
                }
            ]
        },
        data: {
            series: {
                train: Array(7).fill(1).map(item => getRandomIntInclusive(0, 100)),
                car: Array(7).fill(1).map(item => getRandomIntInclusive(0, 100)),
                bike: Array(7).fill(1).map(item => getRandomIntInclusive(0, 100))
            },
            xAxis: {
                columns: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']
            }
        },
        chart: null
    }
};

Function.prototype.toJSON = function() {
    return this.toString().replace(/\n/g, "<br>");
}

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
    if (chartInfo[id].onNewDataFunc) {
        chartInfo[id].onNewDataFunc();
    }
    if (!chartInfo[id].data) {
        chartInfo[id].dataFunc ? chartInfo[id].dataFunc(id) : setChartData(id);
    }
    if (chartInfo[id].chart === null) {
        chartInfo[id].chart = new SvgChart(document.getElementById(id), chartInfo[id].config);
        document.getElementById(id + 'RandomDataButton').addEventListener('click', function () {
            doChart(id);
        });
    } else {
        chartInfo[id].chart.setConfig(chartInfo[id].config);
    }
    chartInfo[id].chart.chart(chartInfo[id].data);
    document.getElementById(id + 'CodeConfig').innerHTML = JSON.stringify(chartInfo[id].config, null, 2);
    document.getElementById(id + 'CodeData').innerHTML = JSON.stringify(chartInfo[id].data, null, 2);
}

function dynamicChart() {
    
    if (!chartInfo['chartDynamic'].chart) {
        document.getElementById('chartDynamicConfig').value = JSON.stringify(chartInfo['chartDynamic'].config, null, 2);
        document.getElementById('chartDynamicData').value = JSON.stringify(chartInfo['chartDynamic'].data, null, 2);
        document.getElementById('chartDynamicExecuteButton').addEventListener('click', dynamicChart);
    }
    
    const config = JSON.parse(document.getElementById('chartDynamicConfig').value);
    const data = JSON.parse(document.getElementById('chartDynamicData').value);

    if (!chartInfo['chartDynamic'].chart) {
        chartInfo['chartDynamic'].chart = new SvgChart(document.getElementById('chartDynamic'), config);
    } else {
        chartInfo['chartDynamic'].chart.setConfig(config);
    }
    chartInfo['chartDynamic'].chart.chart(data);
}

doChart('chartBasicLine');
doChart('chartBasicBar');
doChart('chartStackedBar');
doChart('chartBasicPie');
doChart('chartBasicDonut');
doChart('chartBarAndLine');
doChart('chartCustom');
dynamicChart();