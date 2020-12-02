import * as d3 from "d3"
import d3tip from 'd3-tip'
import data from '../public/static/flare.json'

const width = 900
const dx = 10
const dy = 900/6
let margin = {
  top: 10,
  bottom: 10,
  left: 60,
  right: 10
}

const diagonal = d3.linkHorizontal().x(d => d.y).y(d => d.x)
const tree = d3.tree().nodeSize([dx, dy])

const root = d3.hierarchy(data);

root.x0 = dy / 2;
root.y0 = 0;
root.descendants().forEach((d, i) => {
  d.id = i;
  d._children = d.children;
  // if (d.depth && d.data.name.length !== 7) d.children = null;
  if (d.depth && d.children && d.children.length > 4) d.children = null;
});

const tip = d3tip()
      .attr('class', 'd3-tip')
      .offset([-8, 0])
      .html(
        (d) => {
          return (
            `
              <div class="mb-5">name: ${d.data.name}</div> 
              ${d.data.value ? `<div class="mb-5">value: ${d.data.value}</div> ` : ''}
            `
          )
        }
      );

const svg = d3.select("#tree-svg")
  .attr("viewBox", [0, 0, width, dx])
  .style("font", "12px sans-serif")
  .style("user-select", "none")

const gLink = svg.append("g")
  .attr("fill", "none")
  .attr("stroke", "purple")
  .attr("stroke-opacity", 0.4)
  .attr("stroke-width", 1);

const gNode = svg.append("g")
  .attr("cursor", "pointer")
  .attr("pointer-events", "all")

gNode.call(tip)

function update(source) {
  const duration = 200;
  const nodes = root.descendants().reverse();
  const links = root.links();

  // Compute the new tree layout.
  tree(root);

  let left = root;
  let right = root;
  root.eachBefore(node => {
    if (node.x < left.x) left = node;
    if (node.x > right.x) right = node;
  });

  const height = right.x - left.x + margin.top + margin.bottom;

  const transition = svg.transition()
    .duration(duration)
    .attr("viewBox", [-margin.left, left.x - margin.top, width, height])
    .tween("resize", window.ResizeObserver ? null : () => () => svg.dispatch("toggle"));

  // Update the nodes…
  const node = gNode.selectAll("g").data(nodes, d => d.id);

  // Enter any new nodes at the parent's previous position.
  const nodeEnter = node.enter().append("g")
    .attr("transform", d => `translate(${source.y0},${source.x0})`)
    .attr("fill-opacity", 0)
    .attr("stroke-opacity", 0)
    .on('mouseover', function(event, d) {
      tip.show(d, this)
    })
    .on('mouseout', function(event, d) {
      tip.hide(d, this)
    })
    .on("click", (event, d) => {
      if (d._children) {
        d.children = d.children ? null : d._children;
      } else {
        window.alert(`name: ${d.data.name}`)
      }
      update(d);
    });

  nodeEnter.append("circle")
    .attr("r", 2.5)
    .attr("fill", d => d._children ? "green" : "#999")
    .attr("stroke-width", 10)

  nodeEnter.append("text")
    .attr("dy", "0.31em")
    .attr("x", d => d._children ? -6 : 6)
    .attr("text-anchor", d => d._children ? "end" : "start")
    .text(d => d.data.name)
    .clone(true).lower()
    .attr("stroke-linejoin", "round")
    .attr("stroke-width", 3)
    .attr("stroke", "white")

  // Transition nodes to their new position.
  node.merge(nodeEnter).transition(transition)
    .attr("transform", d => `translate(${d.y},${d.x})`)
    .attr("fill-opacity", 1)
    .attr("stroke-opacity", 1);

  // Transition exiting nodes to the parent's new position.
  node.exit().transition(transition).remove()
    .attr("transform", d => `translate(${source.y},${source.x})`)
    .attr("fill-opacity", 0)
    .attr("stroke-opacity", 0);

  // Update the links…
  const link = gLink.selectAll("path").data(links, d => d.target.id);
    
  // Enter any new links at the parent's previous position.
  const linkEnter = link.enter().append("path")
    .attr("d", d => {
      const o = { x: source.x0, y: source.y0 };
      return diagonal({ source: o, target: o });
    });

  // Transition links to their new position.
  link.merge(linkEnter).transition(transition)
    .attr("d", diagonal);

  // Transition exiting nodes to the parent's new position.
  link.exit().transition(transition).remove()
    .attr("d", d => {
      const o = { x: source.x, y: source.y };
      return diagonal({ source: o, target: o });
    });

  // Stash the old positions for transition.
  root.eachBefore(d => {
    d.x0 = d.x;
    d.y0 = d.y;
  });
}

update(root);
