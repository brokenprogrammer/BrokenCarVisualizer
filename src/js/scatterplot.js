import * as d3 from 'd3'

export class ScatterPlot {
  constructor (location, data, axes) {
    let margin = { top: 30, right: 50, bottom: 40, left: 40 }
    let width = 960 - margin.left - margin.right
    let height = 500 - margin.top - margin.bottom

    let svg = d3.select('#draw')
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

    let xScale = d3.scaleLinear().range([0, width])
    let yScale = d3.scaleLinear().range([height, 0])

    let radius = d3.scaleSqrt().range([1, 5])

    let xAxis = d3.axisBottom().scale(xScale)
    let yAxis = d3.axisLeft().scale(yScale)

    let color = d3.scaleOrdinal(d3.schemeCategory20)

    data.forEach(function (d) {
      d.price = +d.price
      d.horsepower = +d.horsepower
      d.bore = +d.bore
      d.stroke = +d.stroke
      d['peak-rpm'] = +d['peak-rpm']
    })

    xScale.domain(d3.extent(data, function (d) {
      return d[axes[0]]
    })).nice()

    yScale.domain(d3.extent(data, function (d) {
      return d[axes[1]]
    })).nice()

    radius.domain(d3.extent(data, function (d) {
      return d['risk-factor']
    })).nice()

    svg.append('g')
      .attr('transform', 'translate(0, ' + height + ')')
      .attr('class', 'x axis')
      .call(xAxis)

    svg.append('g')
      .attr('transform', 'translate(0,0)')
      .attr('class', 'y axis')
      .call(yAxis)

    console.log(xScale(1))
    console.log(yScale(2))

    let bubble = svg.selectAll('.bubble')
      .data(data)
      .enter().append('circle')
      .attr('class', 'bubble')
      .attr('cx', function (d) { return xScale(parseFloat(d[axes[0]])) })
      .attr('cy', function (d) { return yScale(parseFloat(d[axes[1]])) })
      .attr('r', function (d) { return radius(parseInt(Math.abs(d['risk-factor'])) * 2) })
      .style('fill', function (d) { return color(d.make) })

    bubble.append('title')
      .attr('x', function (d) { return radius(parseInt(Math.abs(d['risk-factor'])) * 2) })
      .text(function (d) {
        return d.make
      })

    // Axis labels
    svg.append('text')
      .attr('x', 10)
      .attr('y', 10)
      .attr('class', 'label')
      .text(axes[0])

    svg.append('text')
      .attr('x', width - 60)
      .attr('y', height - 10)
      .attr('class', 'label')
      .text(axes[1])

    // Legend for all the different colors
    let legend = svg.selectAll('legend')
      .data(color.domain())
      .enter().append('g')
      .attr('class', 'legend')
      .attr('transform', function (d, i) { return 'translate(0, ' + i * 10 + ')' })

    legend.append('rect')
      .attr('x', width)
      .attr('width', 7)
      .attr('height', 7)
      .style('fill', color)

    legend.append('text')
      .attr('x', width - 6)
      .attr('y', 5)
      .attr('dy', '.1em')
      .style('text-anchor', 'end')
      .style('font-size', '10px')
      .text(function (d) { return d })

    legend.on('click', function (type) {
      d3.selectAll('.bubble')
        .style('opacity', 0.15)
        .filter(function (d) {
          return d.make === type
        })
        .style('opacity', 1)
    })
  }
}
