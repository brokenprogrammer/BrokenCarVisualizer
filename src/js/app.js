import * as csv from 'd3-dsv'
import * as carData from './cardata.js'
import { ScatterPlot } from './scatterplot.js'
import * as paracoords from './paralellcoordinates.js'

let axisValues = ['curb-weight', 'highway-mpg']
let selectedData = []

let parsedCSVData = csv.csvParse(carData.data, function (d) {
  if (d.price.includes('?')) {
    d.price = 0
  } else {
    d.price = +d.price
  }

  if (d.horsepower.includes('?')) {
    d.horsepower = 0
  } else {
    d.horsepower = +d.horsepower
  }

  d.bore = +d.bore
  d.stroke = +d.stroke

  if (d['peak-rpm'].includes('?')) {
    d['peak-rpm'] = 0
  } else {
    d['peak-rpm'] = +d['peak-rpm']
  }

  if (d['normalized-losses'].includes('?')) {
    d['normalized-losses'] = 0
  } else {
    d['normalized-losses'] = +d['normalized-losses']
  }

  if (d['num-of-doors'].includes('?')) {
    d['num-of-doors'] = 'Missing Data'
  }

  return {
    price: d.price,
    'risk-factor': d['risk-factor'],
    'normalized-losses': d['normalized-losses'],
    make: d.make,
    'fuel-type': d['fuel-type'],
    aspiration: d.aspiration,
    'num-of-doors': d['num-of-doors'],
    'body-style': d['body-style'],
    'drive-wheels': d['drive-wheels'],
    'engine-location': d['engine-location'],
    'wheel-base': +d['wheel-base'],
    length: +d.length,
    width: +d.width,
    height: +d.height,
    'curb-weight': +d['curb-weight'],
    'engine-type': d['engine-type'],
    'num-of-cylinders': d['num-of-cylinders'],
    'engine-size': +d['engine-size'],
    'fuel-system': d['fuel-system'],
    bore: +d.bore,
    stroke: +d.stroke,
    'compression-ratio': +d['compression-ratio'],
    horsepower: d.horsepower,
    'peak-rpm': +d['peak-rpm'],
    'city-mpg': +d['city-mpg'],
    'highway-mpg': +d['highway-mpg']
  }
})
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
  if (selected) {
    selectedData.push(data)
  } else {
    let index = selectedData.indexOf(data)
    selectedData.splice(index, 1)
  }

  window.document.querySelector('.parcoords').remove()
  par = new paracoords.ParaCoords('', selectedData)
}

populateAxisSelection()
registerAxisSelectionListeners()
