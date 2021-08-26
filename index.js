Highcharts.setOptions({
    colors: ['#D3F898', '#BDC8F9', '#F694C1', '#EDE7B1', '#A9DEF9']
});

let chart;
let intenseSentences = [    // Randomly display one during physics activation.
    'Oi, dette blir spennende...',
    'Nå skjer det...',
    'Tror du at du vinner?',
    'Not Gryffindor...',
    'Me...me...me...'
];

window.addEventListener('DOMContentLoaded', () => {
    const strengthSlider = document.getElementById('strength'),
        dragSlider = document.getElementById('drag'),
        lengthSlider = document.getElementById('length'),
        hurrySlider = document.getElementById('hurry'),
        button = document.getElementById('play');
    let t;

    button.addEventListener('click', e => {
        if (t) {
            clearInterval(t);
        }
        button.disabled = true;
        const intenseSentence = intenseSentences[
            Math.floor(Math.random()* intenseSentences.length)
        ];

        chart.setTitle( {
            text:  'Vi er i gang'
        });

        // Physics with three customizable variables that change behaviour.
        let physics = {
            force: 0,
            angleVel: 0,
            angle: 0,
            prevAngle: 0,  // only used to calculate winner
            strength: 0.003 + strengthSlider.value / 10000, // tweakable
            drag: 0.98 + dragSlider.value / 1000,     // tweakable
            threshold: 2 + lengthSlider.value / 10,   // tweakable
            targ: 0,
            isActive: false
        };

        // the current winner at which the wheel changes direction.
        let currentWinner = -1,
            foundPossibleWinner = false;

        const hurry = Math.sqrt(Math.pow(hurrySlider.value, 2));

        // How many degrees to spin for each iteration
        let diff = 25 + Math.random() * 50,
            startAngle = chart.series[0].options.startAngle;

        t = setInterval(() => {
            if (!physics.isActive) {

                startAngle += diff;
                if (startAngle > 360) {
                    startAngle -= 360;
                }
                diff *= 0.99;
                chart.series[0].update({ startAngle });

                if (diff < physics.threshold) {
                    physics.isActive = true;
                    physics.targ = startAngle;
                    physics.angleVel = physics.threshold * 0.99;
                    physics.angle = startAngle;
                    chart.setTitle( {
                        text: intenseSentence
                    });
                }
            } else { // spring physics
                physics.prevAngle = physics.angle;
                physics.force = physics.targ - physics.angle;
                physics.force *= physics.strength;
                physics.angleVel *= physics.drag;
                physics.angleVel += physics.force;
                physics.angle += physics.angleVel;
                chart.series[0].update({ startAngle: physics.angle });

                /*
                    Sometimes it's obvious when an item is about to win.
                    Instead of waiting for the wheel to come to a complete stop
                    we can calculate this earlier.

                    Once the wheel changes direction we select a temporary
                    winner. When the wheel changes direction a second time,
                    we check whether the temporary winner got
                    selected again. This MUST happen consecutively.
                */
                if (physics.prevAngle >= physics.angle && currentWinner < 0) {
                    currentWinner = findWinner(chart.series[0].data);
                    foundPossibleWinner = true;
                } else if (
                    physics.prevAngle <= physics.angle &&
                    foundPossibleWinner
                ) {
                    const nextWinner = findWinner(chart.series[0].data);
                    if (currentWinner == nextWinner) {
                        chart.setTitle( {
                            text:  'The winner is ' +
                                chart.series[0].data[currentWinner].name + '!'
                        });
                        foundPossibleWinner = false;
                        button.disabled = false;
                    } else {
                        currentWinner = -1;
                        foundPossibleWinner = false;
                    }
                }
            }
        }, hurry);
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
            googleAPIKey: 'AIzaSyCrqWMjYCqixgDg_vQB745FRJ53pMFb57s',
            googleSpreadsheetKey: '1lNehtsWatVeS-fjNYXSCzI7aDjm0Z2dp_tJ79pi2yDw',
            error: console.error,
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

const findWinner = data => {
    const winThreshold = 360 - 360 / data.length;
    let startAngle;

    for (let i in data) {
        startAngle = radToDeg(data[i].shapeArgs.start) + 90;
        if (startAngle > 360) {
            startAngle -= 360;
        }
        if (startAngle > winThreshold) {
            return i;
        }
    }
    return -1;
}