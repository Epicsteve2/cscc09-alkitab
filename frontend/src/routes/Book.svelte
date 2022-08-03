<script lang="ts">
  export let bookId: string;
  export let pageNumberUrl: string;

  import { Spinner } from "sveltestrap";
  import { getBook, updateHighlights, API_URL} from "../api-service";
  

  import { onMount } from "svelte";
  import io, { Socket } from "socket.io-client";

  import { parse } from 'node-html-parser';
  import mergeRanges from 'merge-ranges';

  import {
    ALKITAB_BACKEND_PORT,
    ALKITAB_BACKEND_URL,
  } from "../stores";

  let pageNumber = parseInt(pageNumberUrl);
  let getBookPromise = getBook(bookId, pageNumber);

  async function getNextPage(): Promise<void> {
    pageNumber += 1;
    getBookPromise = getBook(bookId, pageNumber);
  }

  async function getPreviousPage(): Promise<void> {
    if (pageNumber > 1) {
      pageNumber -= 1;
      getBookPromise = getBook(bookId, pageNumber);
    }
  }




  // Socket 
  const socket = io(API_URL);
  onMount(() => {
     socket.connect();
  
     socket.emit("ENTER BOOK ROOM", bookId, "ANDY");
  
     socket.on("JOINED_ROOM", (json)=>{
         console.log(`someone of socketId:${json.socketId} and username ${json.user} has joined the room`)
     })
     
     // Receiving newHighlights from Room
     socket.on("NEW_HIGHLIGHTS", (json) => {
        console.log("new highlights recieved")
        console.log(json)
        if (json.page === pageNumber){
            const updatedHighlights = json.pageHighlights;
            const page = localStorage.getItem('page');

            console.log("UPDATED") 
            console.log(updatedHighlights);
             // Update DOM to show new highlights
            addHighlights(updatedHighlights, page);

            // Also save it to localStorage
            localStorage.setItem('highlights', JSON.stringify(updatedHighlights));
        }

       

     })
  })


  const sendHighlightsToRoom = function (pageHighlights){
    console.log("BEING SEND")
    console.log(bookId, pageNumber, pageHighlights)
    socket.emit("UPDATED_HIGHLIGHTS", bookId, pageNumber, pageHighlights);
  }
















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


    } else {
        // Element Node
        return tree.querySelectorAll(`[tree-id="${nodeId}"]`)[0]
    }
        

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

        const tree2 = parse(node1.toString())
        const ele = tree2.querySelectorAll(`[tree-id="${parentId}"]`);

        if (ele.length !== 0) return true
        return false
    }
}


const postProcess = function(pageHighlights, HTMLString, range, isHighlight){
    const tree = parse(HTMLString);

    const startNode = getNodebyId(tree, range.startNode.nodeId)
    const endNode = getNodebyId(tree, range.endNode.nodeId)
    const ancestorNode = getNodebyId(tree, range.ancestor.nodeId)

    const range2 = {
        startNode : startNode,
        startOffset: range.startNode.offset,

        endNode : endNode,
        endOffset: range.endNode.offset,

        ancestorNode : ancestorNode
    }

    return highlightRange(pageHighlights, tree, range2, isHighlight);

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
const highlightNodeFull = function(node, pageHighlight, isHighlight){
    if (node.nodeType === TEXT_NODE){
        if (isHighlight){
            pageHighlight[nodeId(node)] = [[0, node.textContent.length]]
        } else {
            delete pageHighlight[nodeId(node)]
        } 
    }
    if (node.nodeType === ELEMENT_NODE){
        node.childNodes.forEach(child => {  
            highlightNodeFull(child, pageHighlight, isHighlight);
        });
    }

}


// Merge Parital highlights or remove partial highlights
const highlightNodePartial = function(textNode, start, end, pageHighlights, isHighlight){

    const intervalSet = pageHighlights[nodeId(textNode)] ? pageHighlights[nodeId(textNode)] : []
    if (end === -1) end = textNode.textContent.length

    if (textNode.nodeType === TEXT_NODE){
    
    // Merge the interval
    if (isHighlight){
        intervalSet.push([start, end]);
        const mergedIntervalSet = mergeRanges(intervalSet)

        pageHighlights[nodeId(textNode)] = mergedIntervalSet;
    

    // Remove all overlap with interval
    } else {
        const newIntervalSet = []
        intervalSet.forEach(interval => {

            // CASE no overlap
            // UnhighlightInt :  |------------|
            // highlightInt   :                     |----------|
            // NewHighlightInt:                     |----------|
            if (interval[1] <= start || interval[0] >= end){
                newIntervalSet.push(interval);
            } 
            // CASE Complete Coverage
            // UnhighlightInt :  |-----------------------------------|
            // highlightInt   :          |------------------|
            // NewHighlightInt:                  
            if (interval[0] >= start && interval[1] <= end){
                // Do not add highlight as its been 'removed'
            }

            // CASE
            // UnhighlightInt :  |----------------|
            // highlightInt   :          |------------------|
            // NewHighlightInt:                   |---------|
            if (interval[0] >= start && interval[0] < end &&  interval[1] > end){
                newIntervalSet.push([end, interval[1]])
            }

            // CASE
            // UnhighlightInt :             |----------------|
            // highlightInt   :  |------------------|
            // NewHighlightInt:  |---------|
            if (interval[0] < start && interval[1] <= end && interval[1] > start){
                newIntervalSet.push([interval[0], start])
            }

            // CASE
            // UnhighlightInt :             |----------------|
            // highlightInt   :  |------------------------------------|
            // NewHighlightInt:  |---------|                 |--------|
            if (interval[0] < start && interval[1] > end){
                newIntervalSet.push([interval[0], start])
                newIntervalSet.push([end, interval[1]]);
            }

            if (newIntervalSet.length == 0){
                delete pageHighlights[nodeId(textNode)]
            } else {
                pageHighlights[nodeId(textNode)] = newIntervalSet;
            }
           
        })
    }
        
    }

}



const highlightRange = function(pageHighlight, tree, range, isHighlight){

    // Highlight all nodes inbetween range
    buildUp(range.startNode, range.ancestorNode, pageHighlight, isHighlight)
    buildDown(range.startNode, range.ancestorNode, range.endNode, pageHighlight, isHighlight)

    //Highlight Start and End nodes 
    if (nodeId(range.startNode) === nodeId(range.endNode)){
        highlightNodePartial(range.startNode, range.startOffset, range.endOffset, pageHighlight, isHighlight)
    } else {
        highlightNodePartial(range.startNode, range.startOffset, -1, pageHighlight, isHighlight)
        highlightNodePartial(range.endNode, 0, range.endOffset, pageHighlight, isHighlight)
    }   
    
    // console.log(tree.toString());

    return (tree.toString());

    
}

const buildUp = function(startNode, commonAncestor, pageHighlight, isHighlight){
    let cur = startNode
    while(nodeId(cur) !== nodeId(commonAncestor)){
        const childContainingStart = cur.childNodes.filter(child => nodeContainsNode(child, startNode))

        if (childContainingStart.length !== 0){
            let curNode = childContainingStart[0];
            while(getNextSibling(curNode)){
                curNode = getNextSibling(curNode);
                highlightNodeFull(curNode, pageHighlight, isHighlight);
            }
        }
        
        cur = cur.parentNode
    }
}

const buildDown = function(startNode, Ancestor, endNode, pageHighlight, isHighlight){
    let cur = Ancestor
    while(nodeId(cur) !== nodeId(endNode)){
        const childContainingStart = cur.childNodes.filter(child => nodeContainsNode(child, startNode))
        const childContainingEnd  = cur.childNodes.filter(child => nodeContainsNode(child, endNode))[0]

        if (childContainingStart.length !== 0){
            let curNode = childContainingStart[0];
            while(nodeId(curNode) !== nodeId(childContainingEnd)){
                curNode = getNextSibling(curNode);
                if (nodeId(curNode) !== nodeId(childContainingEnd))
                    highlightNodeFull(curNode, pageHighlight, isHighlight);
            }
        } else {
            let curNode = childContainingEnd;
            while(getPrevSibling(curNode)){
                curNode = getPrevSibling(curNode);
                highlightNodeFull(curNode, pageHighlight, isHighlight);
            }
        }

        cur = childContainingEnd;
    }
}


// Node Object for html parser's TextNode.nextSibling dosen't work
// Custom nextSiblings and Prevsiblings needed
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

    return null
}


















const mergeHighlights = function (pageHighlights, range, HTMLpage, isHighlight){
    postProcess(pageHighlights, HTMLpage, range, isHighlight)
    console.log(pageHighlights);

}


// Running this function will update the page based on pageHighlights passed in
const addHighlights = function(pageHighlights, page){
    const tree = parse(page);
    for (var nodeId in pageHighlights){
        const textNode = getNodebyId(tree, nodeId);
        const str = textNode.textContent;

        const parentNode = textNode.parentNode;
        const spanWrapper = makeHighlightSpan(textNode)
        spanWrapper.rawAttrs = "class=\"wrapper\"";

        const sortedIntervals = pageHighlights[nodeId].sort(([a, b], [c, d]) => a - c || b - d);
        // thrid Index marks highlight or no-highlight. 1 = yes, 0 = no
        const labledSortedIntervals = sortedIntervals.map(interval => [...interval, 1])
        let allInvtervals = []


        // no-highlight Intervals between highlighted intervals
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
        
    }


    async function treeString(tree) {
        const arr = []
        arr.push(tree.toString())
        return arr
        
    };

    getBookPromise = treeString(tree)


}

// 1: selection is for highlighting,
// 0: selection is to remove highlights
const makeHighlight = function(isHighlight:boolean){
    if (window.getSelection().anchorNode){
        const range = window.getSelection().getRangeAt(0);

        let startNodeId;
        let startNodeOffset;
        let endNodeId;
        let endNodeOffset;
        let ancestorNodeId;


        let ancestorNode:any = range.commonAncestorContainer
        let startNode = range.startContainer
        let endNode = range.endContainer

        
        // If ancestorNode is a SPAN, the ancestor in the oringinal page would be the parent of spanWrapper
        if (ancestorNode.nodeType === TEXT_NODE && ancestorNode.parentNode.tagName === "SPAN" && !ancestorNode.parentNode.hasAttribute("tree-id")){
            ancestorNodeId = nodeIdSpan(startNode)
        }
        else {
            while (ancestorNode.tagName === "SPAN" && !ancestorNode.hasAttribute("tree-id")){
                ancestorNode = ancestorNode.parentNode;
            } 
            ancestorNodeId = nodeId2(ancestorNode);
        }
       

        // Start/End nodes only work with the nonHighlighted pages version
        // Since the user is selecting on a page with highlights/spans,
        // we need to convert it as if their selection was being made on a page without spans
        if (startNode.parentElement.tagName === "SPAN" && !startNode.parentElement.hasAttribute('tree-id')){
            startNodeOffset = convertSelectionWithoutSpan(startNode, range.startOffset);
            startNodeId = nodeIdSpan(startNode)
        } else {
            startNodeId = nodeId2(startNode);
            startNodeOffset = range.startOffset
        }

        if (endNode.parentElement.tagName === "SPAN" && !endNode.parentElement.hasAttribute('tree-id')){
            endNodeOffset = convertSelectionWithoutSpan(endNode, range.endOffset);
            endNodeId = nodeIdSpan(endNode)
        } else {
            endNodeId = nodeId2(endNode);
            endNodeOffset = range.endOffset
        }

        

        const condensedRange = {
            startNode : {
                nodeId : startNodeId,
                offset: startNodeOffset
            },
            endNode : {
                nodeId : endNodeId,
                offset : endNodeOffset
            },

            ancestor :{
                nodeId : ancestorNodeId,
            }
        }


        const page = localStorage.getItem('page');
        const pageHighlights = JSON.parse(localStorage.getItem('highlights'));


        // Given the highlighted range, updated the pageHighlights
        mergeHighlights(pageHighlights, condensedRange, page, isHighlight);

        console.log("PAGEHIGHLIGHT AFTER UNHIGLIGHT")
        console.log(pageHighlights);

        // Update DOM to show new highlights
        addHighlights(pageHighlights, page);

        // Send updated highlights to server
        updateHighlights(bookId, pageNumber, pageHighlights);

        // Send updated highlights to the room
        sendHighlightsToRoom(pageHighlights);

        // Also save it to localStorage
        localStorage.setItem('highlights', JSON.stringify(pageHighlights));



    } else {
        console.log("No text selected")
    }
    

}

const clickRemoveHighlight = function(){
    makeHighlight(false);
}

const clickAddHighlights = function(){
    makeHighlight(true);
}

// The span wrapper's id is equal to textNode id in unHighlighted version of the page
const nodeIdSpan = function(node){
    let spanWrapper = node.parentNode;
    while (spanWrapper.getAttribute('class') !== 'wrapper'){
        spanWrapper = spanWrapper.parentNode
    }

    const parent = spanWrapper.parentNode
    let x = 0;
    
    let cur = spanWrapper
    while (cur.previousSibling){
        cur = cur.previousSibling;
        x++;
    }
    
    return `${parent.getAttribute("tree-id")}-${x}`;
}

const convertSelectionWithoutSpan = function(textNode, offset){
    // Textnode is currently in a span
    const parent = textNode.parentNode;
    let spanWrapper;
    let nodeContainingTextNode;
    if (parent.getAttribute('class') === 'wrapper'){
        spanWrapper = parent;
        nodeContainingTextNode = textNode;
    } else if (parent.getAttribute('class') === 'highlight'){
        spanWrapper = parent.parentNode
        nodeContainingTextNode = parent;
    } 

    let convertedOffset = 0;
    let child = spanWrapper.firstChild
    while (!child.isSameNode(nodeContainingTextNode)){
        convertedOffset += child.textContent.length
        child = child.nextSibling
    }
    convertedOffset += offset;

    return convertedOffset;
}









</script>

<div
  class="container text-centering pt-5 d-flex flex-column"
  id="book-container"
>
  <div class="" tree-id="0" >
    {#await getBookPromise}
      <p>Loading... <Spinner /></p>
    {:then pages}
      {@html pages[0]}
    {/await}
  </div>
  <div
    class="pt-auto mt-auto mb-4 d-flex justify-content-between align-items-center"
  >
    <button
      disabled={pageNumber <= 1}
      class="btn btn-warning"
      type="button"
      on:click={getPreviousPage}
    >
      Previous Page</button
    >
    <p class="mt-auto mb-0">Page: {pageNumber}/idk lol</p>
    <button class="btn btn-warning" type="button" on:click={getNextPage}>
      Next Page</button
    >

    <button class="btn btn-warning " type="button" on:click={clickAddHighlights}>
        Highlight</button>

    <button class="btn btn-warning " type="button" on:click={clickRemoveHighlight}>
        Unhighlight</button>

  </div>
</div>

<style lang="scss">
  #book-container {
    min-height: 87vh;
  }

  :global(.highlight){
        text-decoration: underline;
    }


</style>
