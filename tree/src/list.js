import * as d3 from "d3"
import data from '../public/static/flare.json'

const root = d3.hierarchy(data)

root.descendants().forEach((d, i) => {
  d.id = i;
  d._children = d.children;
  if (d.depth && d.children && d.children.length > 4) d.children = null;
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

function update(source) {
  root.eachBefore((d, i) => d.index = i++);
  
  const nodes = root.descendants();

  const svg = d3.select('.list-wrapper').append("svg")
    .attr("viewBox", [-nodeSize / 2, -nodeSize * 3 / 2, width, (nodes.length + 1) * nodeSize])
    .attr("font-family", "sans-serif")
    .attr("font-size", 10)
    .style("overflow", "visible");

  const link = svg.append("g")
    .attr("fill", "none")
    .attr("stroke", "#999")
    .selectAll("path")
    .data(root.links())
    .join("path")
    .attr("d", d =>{
      return `
        M${d.source.depth * nodeSize},${d.source.index * nodeSize}
        V${d.target.index * nodeSize}
        h${nodeSize}
      `});

  const node = svg.append("g")
    .selectAll("g")
    .data(nodes)
    .join("g")
    .attr("transform", d => `translate(0,${d.index * nodeSize})`)
    .attr("cursor", "pointer")
    .attr("pointer-events", "all")
    .on("click", (event, d) => {
      console.log(d, '---')
      if (d._children) {
        d.children = d.children ? null : d._children;
      } else {
        window.alert(`name: ${d.data.name}`)
      }
    });

  node.append("circle")
    .attr("cx", d => d.depth * nodeSize)
    .attr("r", 2.5)
    .attr("fill", d => d._children ? 'purple' : "#999");

  node.append("text")
    .attr("dy", "0.32em")
    .attr("x", d => d.depth * nodeSize + 6)
    .text(d => d.data.name);

  node.append("title")
    .text(d => d.ancestors().reverse().map(d => d.data.name).join("/"));

  for (const { label, value, format, x } of columns) {
    svg.append("text")
      .attr("dy", "0.32em")
      .attr("y", -nodeSize)
      .attr("x", x)
      .attr("text-anchor", "end")
      .attr("font-weight", "bold")
      .text(label);

    node.append("text")
      .attr("dy", "0.32em")
      .attr("x", x)
      .attr("text-anchor", "end")
      .attr("fill", d => d.children ? null : "#555")
      .data(root.copy().sum(value).descendants())
      .text(d => format(d.value, d));
  }
}

update(root)
