import * as d3 from "d3"
import data from '../public/static/test.json'

const root = d3.hierarchy(data)

root.x0 = 0
root.y0 = 0

root.descendants().forEach((d, i) => {
  d.id = i;
  d._children = d.children;
  // if (d.depth && d.children && d.children.length > 4) d.children = null;
});

const nodeSize = 17
const width = 900
const format = d3.format(',')

const columns = [
  {
    label: "Size",
    value: d => d.value,
    format,
    x: 280
  },
  {
    label: "Count",
    value: d => d.children ? 0 : 1,
    format: (value, d) => d.children ? format(value) : "-",
    x: 340
  }
]

root.eachBefore((d, i) => {
  d.index = i++
  d.x = d.depth
  d.y = d.index * nodeSize
});

const diagonal = (d) => {
  return `M${d.source.depth * nodeSize},${d.source.index * nodeSize}
          V${d.target.index * nodeSize}
          h${nodeSize}`
}

const svg = d3.select('.list-wrapper').append("svg")
  .attr("viewBox", [-nodeSize / 2, -nodeSize * 3 / 2, width, (root.descendants().length + 1) * nodeSize])
  .attr("font-family", "sans-serif")
  .attr("font-size", 10)
  .style("overflow", "visible");

const gLink = svg.append("g")
  .attr("fill", "none")
  .attr("stroke", "#999")

const gNode = svg.append('g')
  .attr("cursor", "pointer")
  .attr("pointer-events", "all")

function update(source) {
  // console.log(source, 'root----')
  const transition = svg.transition().duration(500)

  const nodes = root.descendants();

  const node = gNode.selectAll("g").data(nodes, d => d.index)

  const nodeEnter = node.enter().append("g")
    .attr("transform", d => `translate(${source.x},${source.y})`)
    .on("click", (event, d) => {
      if (d._children) {
        d.children = d.children ? null : d._children;
      } else {
        window.alert(`name: ${d.data.name}`)
      }
      update(d)
    });

  nodeEnter.append("circle")
    .attr("cx", d => d.depth * nodeSize)
    .attr("r", 2.5)
    .attr("fill", d => d._children ? 'purple' : "#999");

  nodeEnter.append("text")
    .attr("dy", "0.32em")
    .attr("x", d => d.depth * nodeSize + 6)
    .text(d => d.data.name);

  nodeEnter.append("title")
    .text(d => d.ancestors().reverse().map(d => d.data.name).join("/"));

  for (const { value, format, x } of columns) {
    nodeEnter.append("text")
      .attr("dy", "0.32em")
      .attr("x", x)
      .attr("text-anchor", "end")
      .attr("fill", d => d.children ? "red" : "#555")
      .data(() => {
        console.log(source.copy().sum(value).descendants(), '-----')
        return source.copy().sum(value).descendants()
      })
      .text(d => {
        return format(d.value, d)
      });
  }

  node.merge(nodeEnter).transition(transition)
    .attr("transform", d => `translate(${d.x},${d.y})`)

  node.exit().transition(transition)
    .attr("transform", d => {
      return `translate(${source.x}, ${source.y})`
    })
    // .attr("fill-opacity", 0)
    // .attr("stroke-opacity", 0)
    .remove()

  const link = gLink.selectAll("path").data(root.links(), d => d.target.index)

  const linkEnter = link.enter()
    .append("path")
    .attr("d", d => {
      return `M${source.x * nodeSize},${source.y}
              V${source.y}
              h${source.x * nodeSize}`
    });

  link.merge(linkEnter).transition(transition).attr("d", diagonal);

  link.exit().transition(transition)
    .attr('d', (d) => {
      return `M${d.source.x * nodeSize},${source.y}
                V${source.y}
                h${d.source.x * nodeSize}`
    })
    .remove();

  source.eachBefore(d => {
    d.x0 = d.x;
    d.y0 = d.y;
  });
}

for (const { label, x } of columns) {
  svg.append("text")
    .attr("dy", "0.32em")
    .attr("y", -nodeSize)
    .attr("x", x)
    .attr("text-anchor", "end")
    .attr("font-weight", "bold")
    .text(label);
}

update(root)
