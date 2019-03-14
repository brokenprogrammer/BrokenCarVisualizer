import * as csv from 'd3-dsv'
import * as carData from './cardata.js'
import { ScatterPlot } from './scatterplot.js'
import * as paracoords from './paralellcoordinates.js'

let axisValues = ['curb-weight', 'highway-mpg']
let selectedData = []

let parsedCSVData = csv.csvParse(carData.data)
let data = parsedCSVData

let plot = new ScatterPlot('#draw', data, axisValues, bubbleSelectionListener)

let par = new paracoords.ParaCoords('', selectedData)

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
    plot = new ScatterPlot('#draw', data, axisValues, bubbleSelectionListener)
  })

  yAxisSelection.addEventListener('change', function () {
    axisValues[1] = this.value
    window.document.querySelector('#draw').innerHTML = ``
    plot = new ScatterPlot('#draw', data, axisValues, bubbleSelectionListener)
  })
}

function bubbleSelectionListener (data, selected) {
  // TODO: push if doesnt exist else remove it off the selected Data, could be done through boolean value passed as 2nd argument.
  if (selected) {
    selectedData.push(data)
  } else {
    let index = selectedData.indexOf(data)
    selectedData.splice(index, 1)
  }

  window.document.querySelector('.parcoords').remove()
  window.document.querySelector('pre').remove()
  par = new paracoords.ParaCoords('', selectedData)
}

populateAxisSelection()
registerAxisSelectionListeners()
