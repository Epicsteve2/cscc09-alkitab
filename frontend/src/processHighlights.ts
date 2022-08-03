



import { parse } from 'node-html-parser';
import mergeRanges from 'merge-ranges';

const TEXT_NODE = 3;
const ELEMENT_NODE = 1;
// If Node is Element, tree-id is the Id
// If Node is TextNode, Id defined as '<parentElement tree-id> - <xth child relative to parent>'
// Version for Node Object given by html-parser
const nodeId = function(node){
    if (node.nodeType === ELEMENT_NODE) 
        return node.getAttribute("tree-id")

    else {
        const parent = node.parentNode
        let x = 0;

        // V1
        // let cur = parent.firstChild;
        // while (cur.textContent !== node.textContent){
        //     x++;
        //     cur = cur.nextSibling
        // }

        // V2
        
        let cur = node
        while (getPrevSibling(cur)){
            cur = getPrevSibling(cur);
            x++;
        }



        return `${parent.getAttribute("tree-id")}-${x}`;
    }
}


// Version for Node Object given by DOM
const nodeId2 = function(node){
    if (node.nodeType === ELEMENT_NODE) 
        return node.getAttribute("tree-id")

    else {
        const parent = node.parentNode
        let x = 0;

        // V1
        // let cur = parent.firstChild;
        // while (cur.textContent !== node.textContent){
        //     x++;
        //     cur = cur.nextSibling
        // }

        // V2
        
        let cur = node
        while (cur.previousSibling){
            cur = cur.previousSibling;
            x++;
        }



        return `${parent.getAttribute("tree-id")}-${x}`;
    }
}


const getNodebyId = function(tree, nodeId){
    if (nodeId.includes("-")){ 
        // TextNode
        const parentId = nodeId.split("-")[0]
        const xthChildNum = nodeId.split("-")[1];

        const parentNode = tree.querySelectorAll(`[tree-id="${parentId}"]`)[0]
        return parentNode.childNodes[xthChildNum];


    } else 
        return tree.querySelectorAll(`[tree-id="${nodeId}"]`)[0]

}

const nodeContainsNode = function(node1, node2){
    if (nodeId(node1) === nodeId(node2)) return true
    if (node1.nodeType === TEXT_NODE)   return false
    if (node2.nodeType === ELEMENT_NODE) {
        const ele = node1.querySelectorAll(`[tree-id="${nodeId(node2)}"]`)
        if (ele.length !== 0) return true
        return false
    } 
    if (node2.nodeType === TEXT_NODE) {
        const parentId = nodeId(node2).split("-")[0];
        // const ele = node1.querySelectorAll(`[tree-id="${parentId}"]`)

        const tree2 = parse(node1.toString())
        const ele = tree2.querySelectorAll(`[tree-id="${parentId}"]`);

        if (ele.length !== 0) return true
        return false
    }
}


const postProcess = function(pageHighlights, HTMLString, range){
    const tree = parse(HTMLString);
    // console.log(tree);
    const startNode = getNodebyId(tree, range.startNode.nodeId)
    const endNode = getNodebyId(tree, range.endNode.nodeId)
    const ancestorNode = getNodebyId(tree, range.ancestor.nodeId)

    // console.log(startNode);
    // console.log(endNode);
    const range2 = {
        startNode : startNode,
        startOffset: range.startNode.offset,

        endNode : endNode,
        endOffset: range.endNode.offset,

        ancestorNode : ancestorNode
    }
    console.log(range2);

    return highlightRange(pageHighlights, tree, range2);

}

// Makes and empty Span Element
const makeHighlightSpan = function(node){
    let root = node;
    while (nodeId(root) !== "0"){
        root = root.parentNode;
    }
    let highlightDiv = root.clone();
    highlightDiv.tagName = "SPAN"
    highlightDiv.rawAttrs = "class=\"highlight\""
    highlightDiv.innerHTML = "";
    return highlightDiv;

}


// If Node is Ele, recur
// If Node is Text, add full highlight
const highlightNodeFull = function(node, pageHighlight){
    if (node.nodeType === TEXT_NODE){
        pageHighlight[nodeId(node)] = [[0, node.textContent.length]]
    }
    if (node.nodeType === ELEMENT_NODE){
        node.childNodes.forEach(child => {  
            highlightNodeFull(child, pageHighlight);
        });
    }

}


// Merge Parital highlights, If there is an overlap, merge into one
const highlightNodePartial = function(textNode, start, end, pageHighlights){
    const intervalSet = pageHighlights[nodeId(textNode)] ? pageHighlights[nodeId(textNode)] : []
    // console.log("IN")
    // console.log(intervalSet)
    if (end === -1) end = textNode.textContent.length

    if (textNode.nodeType === TEXT_NODE){

        intervalSet.push([start, end]);
        const mergedIntervalSet = mergeRanges(intervalSet)

        console.log(mergedIntervalSet);
        pageHighlights[nodeId(textNode)] = mergedIntervalSet;
    }

}



const highlightRange = function(pageHighlight, tree, range){

    // Highlight all nodes inbetween range
    buildUp(range.startNode, range.ancestorNode, pageHighlight)
    buildDown(range.startNode, range.ancestorNode, range.endNode, pageHighlight)

    //Highlight Start and End nodes 
    if (nodeId(range.startNode) === nodeId(range.endNode)){
        highlightNodePartial(range.startNode, range.startOffset, range.endOffset, pageHighlight)
    } else {
        highlightNodePartial(range.startNode, range.startOffset, -1, pageHighlight)
        highlightNodePartial(range.endNode, 0, range.endOffset, pageHighlight)
    }   
    

    return (tree.toString());

    
}

const buildUp = function(startNode, commonAncestor, pageHighlight){
    let cur = startNode
    while(nodeId(cur) !== nodeId(commonAncestor)){
        const childContainingStart = cur.childNodes.filter(child => nodeContainsNode(child, startNode))

        if (childContainingStart.length !== 0){
            let curNode = childContainingStart[0];
            while(getNextSibling(curNode)){
                curNode = getNextSibling(curNode);
                highlightNodeFull(curNode, pageHighlight);
            }
        }
        
        cur = cur.parentNode
    }
}

const buildDown = function(startNode, Ancestor, endNode, pageHighlight){
    let cur = Ancestor
    while(nodeId(cur) !== nodeId(endNode)){
        // console.log(cur);
        const childContainingStart = cur.childNodes.filter(child => nodeContainsNode(child, startNode))
        const childContainingEnd  = cur.childNodes.filter(child => nodeContainsNode(child, endNode))[0]
        // console.log(cur.childNodes[20]);
        // console.log(endNode);
        // console.log(nodeContainsNode(cur.childNodes[20], endNode));
        // console.log(cur.childNodes[20].toString())
        // const parent = childContainingStart[0].parentNode
        // let child = parent.firstChild
        // console.log(child.range)
        // while (child.nextSibling){
        //     console.log(child);
        //     console.log(child.range)
        //     child = child.nextSibling;
        // }       
        // console.log(childContainingStart);
        if (childContainingStart.length !== 0){
            let curNode = childContainingStart[0];
            while(nodeId(curNode) !== nodeId(childContainingEnd)){
                curNode = getNextSibling(curNode);
                if (nodeId(curNode) !== nodeId(childContainingEnd))
                    highlightNodeFull(curNode, pageHighlight);
            }
        } else {
            let curNode = childContainingEnd;
            while(getPrevSibling(curNode)){
                curNode = getPrevSibling(curNode);
                highlightNodeFull(curNode, pageHighlight);
            }
        }

        cur = childContainingEnd;
    }
}



// Since node.nextSibling only seems to work for Element nodes 
// and not Text nodes (great...), Custom nextSiblings and Prevsiblings needed

const getNextSibling = function(node){
    const parent = node.parentNode;
    const children = parent.childNodes

    // This will be used as the unquie identifier for the node
    const nodeRange = node.range
    
    let i = 0
    let child = children[0];
    while(i !== children.length){
        

        if (child.range[0] === nodeRange[0] && child.range[1] === nodeRange[1]){
            // Child equals node

            if (i+1 >= children.length) return null
            return children[i+1];
        }

        i++;
        child = children[i]
    }

    console.log("SHOULD NOT REACH");
    return null
}

const getPrevSibling = function(node){
    
    const parent = node.parentNode;
    const children = parent.childNodes

    // This will be used as the unquie identifier for the node
    const nodeRange = node.range
    
    let i = 0
    let child = children[0];
    while(i !== children.length){
        

        if (child.range[0] === nodeRange[0] && child.range[1] === nodeRange[1]){
            // Child equals node

            if (i-1 < 0) return null
            return children[i-1];
        }

        i++;
        child = children[i]
    }

    console.log("SHOULD NOT REACH");
    return null
}






















// const addHighlights = function(pageHighlights, page){
//     const tree = parse(page);
//     for (var nodeId in pageHighlights){
//         const textNode = getNodebyId(tree, nodeId);
//         const str = textNode.textContent;

//         const parentNode = textNode.parentNode;
//         const spanWrapper = makeHighlightSpan(textNode)
//         spanWrapper.rawAttrs = "";

//         const sortedIntervals = pageHighlights[nodeId].sort(([a, b], [c, d]) => c - a || b - d);

//         // thrid Index marks highlight or non. 1 = yes, 0 = no
//         const labledSortedIntervals = sortedIntervals.map(interval => [...interval, 1])
//         let allInvtervals = []

//         // nonHighlight Intervals between highlighted intervals
//         let i = 0;
//         while (i !== labledSortedIntervals.length){
//             allInvtervals.push(labledSortedIntervals[i])
//             if (i+1 !== labledSortedIntervals.length){
//                 const nonHighlightInterval = [labledSortedIntervals[i][1], labledSortedIntervals[i+1][0], 0]
//                 allInvtervals.push(nonHighlightInterval);
//             }
//             i++;
//         }

//         // nonHighlighted intervals at the start/end
//         const firstInteval = labledSortedIntervals[0];
//         if (firstInteval[0] !== 0){
//             const nonHighlightInterval = [0, firstInteval[0], 0]
//             allInvtervals.unshift(nonHighlightInterval)
//         }

//         const lastInterval = labledSortedIntervals[labledSortedIntervals.length - 1];
//         if (lastInterval[1] !== str.length){
//             const nonHighlightInterval = [lastInterval[1], str.length, 0]
//             allInvtervals.push(nonHighlightInterval)
//         }

//         console.log("FOR ID " + nodeId);
//         console.log(allInvtervals);

        
//         // Convert Intervals into Nodes and add to spanWrapper
//         allInvtervals.forEach(interval => {
//             if (interval[2] === 1){
//                 //Highlight Interval
//                 const highlightSpan = makeHighlightSpan(textNode);
//                 const newTextNode = textNode.clone();
//                 newTextNode.textContent = str.substring(interval[0], interval[1])

//                 highlightSpan.appendChild(newTextNode);
//                 spanWrapper.appendChild(highlightSpan);
//             }

//             if (interval[2] === 0){
//                 // Plain Interval
//                 const newTextNode = textNode.clone();
//                 newTextNode.textContent = str.substring(interval[0], interval[1])

//                 spanWrapper.appendChild(newTextNode);
//             }
//         })

        
        
//         parentNode.exchangeChild(textNode, spanWrapper)
        
//         // spanEle.appendChild(node)
//     }

//     console.log(tree.toString());

//     async function treeString(tree) {
//         const arr = []
//         arr.push(tree.toString())
//         return arr
        
//     };

//     getBookPromise = treeString(tree)


// }


// The resulting HTML after highlight spans have been added
export const getAppliedHighlightsPage = function(pageHighlights, page){
    const tree = parse(page);
    for (var nodeId in pageHighlights){
        const textNode = getNodebyId(tree, nodeId);
        const str = textNode.textContent;

        const parentNode = textNode.parentNode;
        const spanWrapper = makeHighlightSpan(textNode)
        spanWrapper.rawAttrs = "class=\"wrapper\"";

        const sortedIntervals = pageHighlights[nodeId].sort(([a, b], [c, d]) => a - c || b - d);

        // thrid Index marks highlight or non. 1 = yes, 0 = no
        const labledSortedIntervals = sortedIntervals.map(interval => [...interval, 1])
        let allInvtervals = []

        // nonHighlight Intervals between highlighted intervals
        let i = 0;
        while (i !== labledSortedIntervals.length){
            allInvtervals.push(labledSortedIntervals[i])
            if (i+1 !== labledSortedIntervals.length){
                const nonHighlightInterval = [labledSortedIntervals[i][1], labledSortedIntervals[i+1][0], 0]
                allInvtervals.push(nonHighlightInterval);
            }
            i++;
        }

        // nonHighlighted intervals at the start/end
        const firstInteval = labledSortedIntervals[0];
        if (firstInteval[0] !== 0){
            const nonHighlightInterval = [0, firstInteval[0], 0]
            allInvtervals.unshift(nonHighlightInterval)
        }

        const lastInterval = labledSortedIntervals[labledSortedIntervals.length - 1];
        if (lastInterval[1] !== str.length){
            const nonHighlightInterval = [lastInterval[1], str.length, 0]
            allInvtervals.push(nonHighlightInterval)
        }

        
        // Convert Intervals into Nodes and add to spanWrapper
        allInvtervals.forEach(interval => {
            if (interval[2] === 1){
                //Highlight Interval
                const highlightSpan = makeHighlightSpan(textNode);
                const newTextNode = textNode.clone();
                newTextNode.textContent = str.substring(interval[0], interval[1])

                highlightSpan.appendChild(newTextNode);
                spanWrapper.appendChild(highlightSpan);
            }

            if (interval[2] === 0){
                // Plain Interval
                const newTextNode = textNode.clone();
                newTextNode.textContent = str.substring(interval[0], interval[1])

                spanWrapper.appendChild(newTextNode);
            }
        })

        
        
        parentNode.exchangeChild(textNode, spanWrapper)
        
        // spanEle.appendChild(node)
    }

    return tree.toString()

}

