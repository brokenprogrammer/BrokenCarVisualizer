import * as d3 from 'd3'
import * as renderQueue from './renderqueue.js'

export class ParaCoords {
  constructor (location, data) {
    this.data = data
    let margin = { top: 66, right: 110, bottom: 20, left: 188 }
    let width = document.body.clientWidth - margin.left - margin.right
    let height = 340 - margin.top - margin.bottom
    let innerHeight = height - 2
    let devicePixelRatio = window.devicePixelRatio || 1

    this.width = width
    this.height = height

    this.color = d3.scaleOrdinal()
      .range(['#5DA5B3', '#D58323', '#DD6CA7', '#54AF52', '#8C92E8', '#E15E5A', '#725D82', '#776327', '#50AB84', '#954D56', '#AB9C27', '#517C3F', '#9D5130', '#357468', '#5E9ACF', '#C47DCB', '#7D9E33', '#DB7F85', '#BA89AD', '#4C6C86', '#B59248', '#D8597D', '#944F7E', '#D67D4B', '#8F86C2'])

    let types = {
      'Number': {
        key: 'Number',
        coerce: function (d) { return +d },
        extent: d3.extent,
        within: function (d, extent, dim) { return extent[0] <= dim.scale(d) && dim.scale(d) <= extent[1] },
        defaultScale: d3.scaleLinear().range([innerHeight, 0])
      },
      'String': {
        key: 'String',
        coerce: String,
        extent: function (data) { return data.sort() },
        within: function (d, extent, dim) { return extent[0] <= dim.scale(d) && dim.scale(d) <= extent[1] },
        defaultScale: d3.scalePoint().range([0, innerHeight])
      },
      'Date': {
        key: 'Date',
        coerce: function (d) { return new Date(d) },
        extent: d3.extent,
        within: function (d, extent, dim) { return extent[0] <= dim.scale(d) && dim.scale(d) <= extent[1] },
        defaultScale: d3.scaleTime().range([0, innerHeight])
      }
    }

    let dimensions = [
      {
        key: 'make',
        description: 'Make',
        type: types['String'],
        axis: d3.axisLeft()
          .tickFormat(function (d, i) {
            return d
          })
      },
      {
        key: 'drive-wheels',
        type: types['String'],
        axis: d3.axisLeft()
          .tickFormat(function (d, i) {
            return d
          })
      },
      {
        key: 'horsepower',
        type: types['Number'],
        scale: d3.scaleSqrt().range([innerHeight, 0])
      },
      {
        key: 'num-of-doors',
        type: types['String'],
        axis: d3.axisLeft()
          .tickFormat(function (d, i) {
            return d
          })
      },
      // {
      //   key: 'risk-factor',
      //   type: types['Number'],
      //   scale: d3.scaleSqrt().range([innerHeight, 0])
      // },
      {
        key: 'price',
        type: types['Number'],
        scale: d3.scaleSqrt().range([innerHeight, 0])
      },
      {
        key: 'fuel-type',
        type: types['String'],
        axis: d3.axisLeft()
          .tickFormat(function (d, i) {
            return d
          })
      }
    ]

    this.dimensions = dimensions

    let xscale = d3.scalePoint()
      .domain(d3.range(this.dimensions.length))
      .range([0, width])

    this.xscale = xscale

    let yAxis = d3.axisLeft()

    let container = d3.select('body').append('div')
      .attr('class', 'parcoords')
      .style('width', width + margin.left + margin.right + 'px')
      .style('height', height + margin.top + margin.bottom + 'px')

    let svg = container.append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

    this.svg = svg

    let canvas = container.append('canvas')
      .attr('width', width * devicePixelRatio)
      .attr('height', height * devicePixelRatio)
      .style('width', width + 'px')
      .style('height', height + 'px')
      .style('margin-top', margin.top + 'px')
      .style('margin-left', margin.left + 'px')

    this.ctx = canvas.node().getContext('2d')
    this.ctx.globalCompositeOperation = 'darken'
    this.ctx.globalAlpha = 0.15
    this.ctx.lineWidth = 1.5
    this.ctx.scale(devicePixelRatio, devicePixelRatio)

    var output = d3.select('body').append('pre')
    this.output = output

    var axes = svg.selectAll('.axis')
      .data(this.dimensions)
      .enter().append('g')
      .attr('class', function (d) { return 'axis ' + d.key.replace(/ /g, '_') })
      .attr('transform', function (d, i) { return 'translate(' + xscale(i) + ')' })

    d3.shuffle(data)

    data.forEach(function (d) {
      dimensions.forEach(function (p) {
        d[p.key] = p.type.coerce(d[p.key])
      })

      // truncate long text strings to fit in data table
      for (var key in d) {
        if (d[key] && d[key].length > 35) d[key] = d[key].slice(0, 36)
      }
    })

    // type/dimension default setting happens here
    this.dimensions.forEach(function (dim) {
      if (!('domain' in dim)) {
      // detect domain using dimension type's extent function
        dim.domain = d3_functor(dim.type.extent)(data.map(function (d) { return d[dim.key] }))
      }
      if (!('scale' in dim)) {
      // use type's default scale for dimension
        dim.scale = dim.type.defaultScale.copy()
      }
      dim.scale.domain(dim.domain)
    })

    this.render = renderQueue.renderQueue(draw.bind(this)).rate(50)

    this.ctx.clearRect(0, 0, width, height)
    this.ctx.globalAlpha = d3.min([0.85 / Math.pow(data.length, 0.3), 1])
    this.render(data)

    axes.append('g')
      .each(function (d) {
        var renderAxis = 'axis' in d
          ? d.axis.scale(d.scale) // custom axis
          : yAxis.scale(d.scale) // default axis
        d3.select(this).call(renderAxis)
      })
      .append('text')
      .attr('class', 'title')
      .attr('text-anchor', 'start')
      .text(function (d) { return 'description' in d ? d.description : d.key })

    let b = this.brush.bind(this)
    // Add and store a brush for each axis.
    axes.append('g')
      .attr('class', 'brush')
      .each(function (d) {
        d3.select(this).call(d.brush = d3.brushY()
          .extent([[-10, 0], [10, height]])
          .on('start', brushstart.bind(this))
          .on('brush', b)
          .on('end', b)
        )
      })
      .selectAll('rect')
      .attr('x', -8)
      .attr('width', 16)

    d3.selectAll('.axis.make .tick text')
      .style('fill', function (d) {
        for (let i = 0; i < data.length; ++i) {
          if (data[i].make === d) {
            return data[i].color
          }
        }
      })

    output.text(d3.tsvFormat(data.slice(0, 24)))
  }

  brush () {
    let render = this.render
    let svg = this.svg
    let ctx = this.ctx
    let output = this.output

    render.invalidate()

    var actives = []
    svg.selectAll('.axis .brush')
      .filter(function (d) {
        return d3.brushSelection(this)
      })
      .each(function (d) {
        actives.push({
          dimension: d,
          extent: d3.brushSelection(this)
        })
      })

    var selected = this.data.filter(function (d) {
      if (actives.every(function (active) {
        var dim = active.dimension
        // test if point is within extents for each active brush
        return dim.type.within(d[dim.key], active.extent, dim)
      })) {
        return true
      }
    })

    // show ticks for active brush dimensions
    // and filter ticks to only those within brush extents
    /*
      svg.selectAll(".axis")
          .filter(function(d) {
            return actives.indexOf(d) > -1 ? true : false;
          })
          .classed("active", true)
          .each(function(dimension, i) {
            var extent = extents[i];
            d3.select(this)
              .selectAll(".tick text")
              .style("display", function(d) {
                var value = dimension.type.coerce(d);
                return dimension.type.within(value, extent, dimension) ? null : "none";
              });
          });

      // reset dimensions without active brushes
      svg.selectAll(".axis")
          .filter(function(d) {
            return actives.indexOf(d) > -1 ? false : true;
          })
          .classed("active", false)
          .selectAll(".tick text")
            .style("display", null);
      */

    ctx.clearRect(0, 0, this.width, this.height)
    ctx.globalAlpha = d3.min([0.85 / Math.pow(selected.length, 0.3), 1])
    render(selected)

    output.text(d3.tsvFormat(selected.slice(0, 24)))
  }
}

function brushstart () {
  d3.event.sourceEvent.stopPropagation()
}

function draw (d) {
  let ctx = this.ctx
  ctx.strokeStyle = d.color
  ctx.beginPath()
  var coords = project.bind(this)(d)
  coords.forEach(function (p, i) {
    // this tricky bit avoids rendering null values as 0
    if (p === null) {
      // this bit renders horizontal lines on the previous/next
      // dimensions, so that sandwiched null values are visible
      if (i > 0) {
        var prev = coords[i - 1]
        if (prev !== null) {
          ctx.moveTo(prev[0], prev[1])
          ctx.lineTo(prev[0] + 6, prev[1])
        }
      }
      if (i < coords.length - 1) {
        var next = coords[i + 1]
        if (next !== null) {
          ctx.moveTo(next[0] - 6, next[1])
        }
      }
      return
    }

    if (i === 0) {
      ctx.moveTo(p[0], p[1])
      return
    }

    ctx.lineTo(p[0], p[1])
  })
  ctx.stroke()
}

function project (d) {
  let x = this.xscale
  return this.dimensions.map(function (p, i) {
    // check if data element has property and contains a value
    if (!(p.key in d) || d[p.key] === null) {
      return null
    }

    return [x(i), p.scale(d[p.key])]
  })
}

function d3_functor (v) {
  return typeof v === 'function' ? v : function () { return v }
};
