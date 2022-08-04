import { parse } from "node-html-parser";

const ELEMENT_NODE = 1;
// If Node is Element, tree-id is the Id
// If Node is TextNode, Id defined as '<parentElement tree-id> - <xth child relative to parent>'
// Version for Node Object given by html-parser
const nodeId = function (node) {
  if (node.nodeType === ELEMENT_NODE) return node.getAttribute("tree-id");
  else {
    const parent = node.parentNode;
    let x = 0;

    let cur = node;
    while (getPrevSibling(cur)) {
      cur = getPrevSibling(cur);
      x++;
    }

    return `${parent.getAttribute("tree-id")}-${x}`;
  }
};

const getNodebyId = function (tree, nodeId) {
  if (nodeId.includes("-")) {
    // TextNode
    const parentId = nodeId.split("-")[0];
    const xthChildNum = nodeId.split("-")[1];

    const parentNode = tree.querySelectorAll(`[tree-id="${parentId}"]`)[0];
    return parentNode.childNodes[xthChildNum];
  } else return tree.querySelectorAll(`[tree-id="${nodeId}"]`)[0];
};

// Makes and empty Span Element
const makeHighlightSpan = function (node) {
  let root = node;
  while (nodeId(root) !== "0") {
    root = root.parentNode;
  }
  let highlightDiv = root.clone();
  highlightDiv.tagName = "SPAN";
  highlightDiv.rawAttrs = 'class="highlight"';
  highlightDiv.innerHTML = "";
  return highlightDiv;
};

const getPrevSibling = function (node) {
  const parent = node.parentNode;
  const children = parent.childNodes;

  // This will be used as the unquie identifier for the node
  const nodeRange = node.range;

  let i = 0;
  let child = children[0];
  while (i !== children.length) {
    if (child.range[0] === nodeRange[0] && child.range[1] === nodeRange[1]) {
      // Child equals node

      if (i - 1 < 0) return null;
      return children[i - 1];
    }

    i++;
    child = children[i];
  }

  return null;
};

// The resulting HTML after highlight spans have been added
export const getAppliedHighlightsPage = function (pageHighlights, page) {
  const tree = parse(page);
  for (var nodeId in pageHighlights) {
    const textNode = getNodebyId(tree, nodeId);
    const str = textNode.textContent;

    const parentNode = textNode.parentNode;
    const spanWrapper = makeHighlightSpan(textNode);
    spanWrapper.rawAttrs = 'class="wrapper"';

    const sortedIntervals = pageHighlights[nodeId].sort(
      ([a, b], [c, d]) => a - c || b - d
    );

    // thrid Index marks highlight or non. 1 = yes, 0 = no
    const labledSortedIntervals = sortedIntervals.map((interval) => [
      ...interval,
      1,
    ]);
    let allInvtervals = [];

    // nonHighlight Intervals between highlighted intervals
    let i = 0;
    while (i !== labledSortedIntervals.length) {
      allInvtervals.push(labledSortedIntervals[i]);
      if (i + 1 !== labledSortedIntervals.length) {
        const nonHighlightInterval = [
          labledSortedIntervals[i][1],
          labledSortedIntervals[i + 1][0],
          0,
        ];
        allInvtervals.push(nonHighlightInterval);
      }
      i++;
    }

    // nonHighlighted intervals at the start/end
    const firstInteval = labledSortedIntervals[0];
    if (firstInteval[0] !== 0) {
      const nonHighlightInterval = [0, firstInteval[0], 0];
      allInvtervals.unshift(nonHighlightInterval);
    }

    const lastInterval =
      labledSortedIntervals[labledSortedIntervals.length - 1];
    if (lastInterval[1] !== str.length) {
      const nonHighlightInterval = [lastInterval[1], str.length, 0];
      allInvtervals.push(nonHighlightInterval);
    }

    // Convert Intervals into Nodes and add to spanWrapper
    allInvtervals.forEach((interval) => {
      if (interval[2] === 1) {
        //Highlight Interval
        const highlightSpan = makeHighlightSpan(textNode);
        const newTextNode = textNode.clone();
        newTextNode.textContent = str.substring(interval[0], interval[1]);

        highlightSpan.appendChild(newTextNode);
        spanWrapper.appendChild(highlightSpan);
      }

      if (interval[2] === 0) {
        // Plain Interval
        const newTextNode = textNode.clone();
        newTextNode.textContent = str.substring(interval[0], interval[1]);

        spanWrapper.appendChild(newTextNode);
      }
    });

    parentNode.exchangeChild(textNode, spanWrapper);
  }

  return tree.toString();
};
