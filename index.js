let chart;
let intenseSentences = [    // Randomly display one during physics activation.
    'Oi, dette blir spennende...',
    'Nå skjer det...',
    'Tror du at du vinner?',
    'Not Gryffindor...',
    'Me...me...me...'
];

window.addEventListener('DOMContentLoaded', () => {
    const button = document.getElementById('play');
    button.addEventListener('click', e => {
        button.disabled = true;
        const intenseSentence = intenseSentences[
            Math.floor(Math.random()* intenseSentences.length)
        ];

        chart.setTitle( {
            text:  'Vi er i gang'
        });

        // Tweakable variables might be customized by the user in future update
        let physics = {
            force: 0,
            angleVel: 0,
            strength: 0.003, // tweakable
            drag: 0.98,     // tweakable
            threshold: 2,   // tweakable
            targ: 0,
            isActive: false
        };

        // How many degrees to spin for each iteration
        let diff = 25 + Math.random() * 10,
            startAngle = chart.series[0].options.startAngle;

        let t = setInterval(() => {
            if (!physics.isActive) {

                startAngle += diff;
                if (startAngle > 360) {
                    startAngle -= 360;
                }
                diff *= 0.98;
                chart.series[0].update({ startAngle });

                if (diff < physics.threshold) {
                    physics.isActive = true;
                    physics.targ = startAngle;
                    physics.angleVel = physics.threshold * 0.98;
                    physics.angle = startAngle;
                }
            } else {    // spring physics
                physics.force = physics.targ - physics.angle;
                physics.force *= physics.strength;
                physics.angleVel *= physics.drag;
                physics.angleVel += physics.force;
                physics.angle += physics.angleVel;
                chart.setTitle( {
                    text:  intenseSentence
                });
                chart.series[0].update({ startAngle: physics.angle });

                if (    // Comming to a stop (approximate, but subtle)
                    physics.angleVel < 0.001 &&
                    physics.angleVel > -0.001 &&
                    (physics.targ - physics.angle) < 0.018 &&
                    (physics.targ - physics.angle) > -0.018
                ) {
                    physics.targ = physics.angle;
                    physics.angle = 0;
                    findWinner();
                    clearInterval(t);
                    button.disabled = false;
                }
            }
        }, 25);
    });
    // Create the chart
    chart = Highcharts.chart('container', {

        chart: {
            animation: false
        },

        title: {
            text: 'Lykkehjulet'
        },

        data: {
            googleSpreadsheetKey: '1lNehtsWatVeS-fjNYXSCzI7aDjm0Z2dp_tJ79pi2yDw',
            parsed: function (columns) {
                const activeColumn = columns.findIndex(column => column[0] === 'aktiv');
                const endRow = columns[0].indexOf(null);

                let i = columns.length;
                for (i; i >= 0; i--) {
                    if (i !== activeColumn && i !== 0) {
                        columns.splice(i, 1);
                    } else {
                        columns[i].splice(endRow, 1000);
                    }
                }
            },

            complete: function (options) {
                button.disabled = false;
                options.series[0].data = options.series[0].data.filter(d => {
                    return d[1] !== null;
                });
                options.series[0].data = options.series[0].data.sort((a, b) => Math.random() - 0.5);
            }
        },

        series: [{
            type: 'pie',
            dataLabels: {
                distance: -20
            },
            startAngle: 360 * Math.random()
        }]

    });

    chart.renderer.path([
            ['M', chart.chartWidth / 2 - 10, chart.plotTop - 5],
            ['L', chart.chartWidth / 2 + 10, chart.plotTop - 5],
            ['L', chart.chartWidth / 2, chart.plotTop + 10],
            ['Z']
        ])
        .attr({
            fill: 'black'
        })
        .add();
});

const radToDeg = r => r * 180 / Math.PI;

const findWinner = () => {
    const data = chart.series[0].data,
        winThreshold = 360 - 360 / data.length;
    let startAngle;

    for (let i in data) {
        startAngle = radToDeg(data[i].shapeArgs.start) + 90;
        if (startAngle > 360) {
            startAngle -= 360;
        }
        if (startAngle > winThreshold) {
            chart.setTitle( {
                text:  'Den heldige er ' + data[i].name + '!!!'
            });
        }
    }
}