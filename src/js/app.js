import * as csv from 'd3-dsv'
import * as carData from './cardata.js'
import { ScatterPlot } from './scatterplot.js'
import * as noUiSlider from 'nouislider'

let axisValues = ['curb-weight', 'highway-mpg']

// TODO: Fix colors wrapping around.
// TODO: Add filters
// TODO: Toggle legend to view multiple "types" at once
// TODO: Add toggle for lenses.
// TODO: Add magnifying glass lens.
// TODO: Allow for two circles to be selected.
// TODO: Display two selected circles in a new graph structure.

let parsedCSVData = csv.csvParse(carData.data)
let data = parsedCSVData

let plot = new ScatterPlot('#draw', data, axisValues)

var slider = document.getElementById('slider')

noUiSlider.create(slider, {
  start: [20, 80],
  connect: true,
  tooltips: true,
  range: {
    'min': 0,
    'max': 100
  },
  pips: {
    mode: 'range',
    density: 3
  }
})
function populateAxisSelection () {
  let xAxisSelection = window.document.querySelector('#xaxis-values')
  let yAxisSelection = window.document.querySelector('#yaxis-values')

  let AttributesToSkip = ['make', 'risk-factor', 'fuel-type', 'aspiration', 'num-of-doors', 'body-style', 'drive-wheels', 'engine-location', 'engine-type', 'fuel-system', 'num-of-cylinders', 'normalized-losses']

  for (let property in data[0]) {
    if (data[0].hasOwnProperty(property)) {
      let option = document.createElement('option')
      option.value = property
      option.textContent = property

      if (!AttributesToSkip.includes(property)) {
        xAxisSelection.appendChild(option)

        option = document.createElement('option')
        option.value = property
        option.textContent = property

        yAxisSelection.appendChild(option)
      }
    }
  }

  xAxisSelection.value = 'curb-weight'
  yAxisSelection.value = 'highway-mpg'
}

function registerAxisSelectionListeners () {
  let xAxisSelection = window.document.querySelector('#xaxis-values')
  let yAxisSelection = window.document.querySelector('#yaxis-values')

  xAxisSelection.addEventListener('change', function () {
    axisValues[0] = this.value
    window.document.querySelector('#draw').innerHTML = ``
    plot = new ScatterPlot('#draw', data, axisValues)
  })

  yAxisSelection.addEventListener('change', function () {
    axisValues[1] = this.value
    window.document.querySelector('#draw').innerHTML = ``
    plot = new ScatterPlot('#draw', data, axisValues)
  })
}

populateAxisSelection()
registerAxisSelectionListeners()
