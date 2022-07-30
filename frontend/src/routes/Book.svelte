<script lang="ts">
import { onMount } from "svelte";
import io, { connect } from "socket.io-client";
import { parse } from 'node-html-parser';


import {
    ALKITAB_BACKEND_PORT,
    ALKITAB_BACKEND_URL,
    currentUser,
} from "../stores";
import { text } from "svelte/internal";


const bookId = "62e425d9981f0e92f45864e9";
let pageNumber = 1;

let promise = getBook(bookId);
async function getBook(bookId: string): Promise<void> {
    console.log(pageNumber);
    console.log(`http://${ALKITAB_BACKEND_URL}:${ALKITAB_BACKEND_PORT}/api/library/book/${bookId}?page=${pageNumber}&limit=1`)
    const response = await self.fetch(
        `http://${ALKITAB_BACKEND_URL}:${ALKITAB_BACKEND_PORT}/api/library/book/${bookId}?page=${pageNumber}&limit=1`,
        {method: "GET"}
    );
    if (response.ok){
        const body = await response.json()
        console.log(body.pages)
        // postProcess(body.pages[0], []);
        localStorage.setItem('page', JSON.stringify(body.pages[0]));
        return body.pages
        
    } else {
        throw new Error("error");
    }
    
};

async function getNextPage(): Promise<void>{
    pageNumber += 1;
    promise = getBook(bookId)
}

function saveSelection() {
    if (window.getSelection) {
        var sel = window.getSelection();
        if (sel.getRangeAt && sel.rangeCount) {
            return sel.getRangeAt(0);
        }
    }
    return null;
}

function restoreSelection(range) {
    console.log("THIS is" )
    console.log(range);
    if (range) {
        if (window.getSelection) {
            var sel = window.getSelection();
            console.log(sel)
            // sel.removeAllRanges();
            sel.addRange(range);
        }
    }
}

const TEXT_NODE = 3;
const ELEMENT_NODE = 1;
// If Node is Element, tree-id is the Id
// If Node is TextNode, Id defined as '<parentElement tree-id> - <xth child relative to parent>'
    const nodeId = function(node){
    if (node.nodeType === ELEMENT_NODE) 
        return node.getAttribute("tree-id")

    else {
        const parent = node.parentNode
        let x = 0;
        let cur = parent.firstChild;
        while (cur.textContent !== node.textContent){
            x++;
            cur = cur.nextSibling
        }

        return `${parent.getAttribute("tree-id")}-${x}`;
    }
}

// const interval = setInterval(() => 
//     {   
//         console.log("SET");
//         const range = window.getSelection().getRangeAt(0);
//         let ancestorNode = range.commonAncestorContainer
//         let ancestorNodeId;
//         if (ancestorNode.getAttribute("class") === "book-page")
//             ancestorNodeId = "0";
//         else 
//             ancestorNodeId = ancestorNode.getAttribute("tree-id");

//         let startNode = range.startContainer
//         let endNode = range.endContainer

//         const condensedRange = {
//             startNode : {
//                 nodeId : nodeId(startNode),
//                 offset: range.startOffset
//             },
//             endNode : {
//                 nodeId : nodeId(endNode),
//                 offset : range.endOffset
//             },

//             ancestor :{
//                 nodeId : ancestorNodeId,
//             }
//         }

//         localStorage.setItem('selection', JSON.stringify(condensedRange));

//     }, 15000);

const interval2 = setInterval(() => 
{   

    const range = JSON.parse(localStorage.getItem('selection'))
    const page = localStorage.getItem('page')
    console.log(range);

    postProcess(page, range)

    // restoreSelection(selection)
    // highlightRange(selection);
    // console.log("RESTOR")
    // console.log(selection);
    // counter += 1
    // console.log(counter);
    // console.log(window.getSelection())
}, 5000);



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


const postProcess = function(HTMLString, range){
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

    highlightRange(tree, range2);

}

// Makes and empty Div Element
const makeHighlightDiv = function(node){
    let root = node;
    while (nodeId(root) !== "0"){
        root = root.parentNode;
    }
    let highlightDiv = root.clone();
    highlightDiv.tagName = "DIV"
    highlightDiv.rawAttrs = "class=\"highlight\""
    highlightDiv.innerHTML = "";
    return highlightDiv;

}

/*
*   _________        _________
*  |         |      |         |
*  | Element | ---> |   Text  |
*  |_________|      |_________|
*
*   AFTER HIGHLIGHT: 
*   _________        _________        _________
*  |         |      |         |      |         |
*  | Element | ---> |   Div   | ---> |   Text  |
*  |_________|      |_________|      |_________|
*
*/
const highlightNode = function(node){
    if (node.nodeType === TEXT_NODE){
        // Make an empty Div with class="highlight"
        let highlightDiv = makeHighlightDiv(node);

        // Make copy of TextNode, append Div, and switch the child.
        const parentElement = node.parentNode;
        parentElement.exchangeChild(node, highlightDiv);
        highlightDiv.appendChild(node);
    }
    if (node.nodeType === ELEMENT_NODE){
        node.childNodes.forEach(child => {  
            highlightNode(child);
        });
    }

}

const highlightNodePartial = function(textNode, start, end){
    if (textNode.nodeType === TEXT_NODE){
        const str = textNode.textContent
        if (end === -1) end = str.length

        let wrapingDiv = makeHighlightDiv(textNode);
        wrapingDiv.rawAttrs = "";
        let highlightDiv = makeHighlightDiv(textNode);

        
        if (end !== str.length && start !== 0){
            // CASE [Text, DIV, Text]
            let leftText = textNode.clone();
            let middleText = textNode.clone();
            let rightText = textNode.clone();

            leftText.innerHTML = str.substring(0, start)
            middleText.innerHTML = str.substring(start, end)
            rightText.innerHTML = str.substring(end, str.length)

            highlightDiv.appendChild(middleText);
            wrapingDiv.appendChild(leftText)
            wrapingDiv.appendChild(highlightDiv);
            wrapingDiv.appendChild(rightText);
        } else if (end === str.length && start !== 0) {
            // CASE [TEXT, DIV]
            let leftText = textNode.clone();
            let rightText = textNode.clone();
            leftText.innerHTML = str.substring(0, start)
            rightText.innerHTML = str.substring(start, end);

            highlightDiv.appendChild(rightText)
            wrapingDiv.appendChild(leftText)
            wrapingDiv.appendChild(highlightDiv)
        } else if (end !== str.length && start === 0) {
            // CASE [DIV, TEXT]
            let leftText = textNode.clone();
            let rightText = textNode.clone();
            leftText.innerHTML = str.substring(start, end)
            rightText.innerHTML = str.substring(end, str.length);

            highlightDiv.appendChild(leftText);
            wrapingDiv.appendChild(highlightDiv)
            wrapingDiv.appendChild(rightText)
        } else {
            // CASE [DIV]
            let middleText = textNode.clone()
            middleText.innerHTML = str;
            highlightDiv.appendChild(middleText)
            wrapingDiv.appendChild(highlightDiv)
        }

    }
    

}



const highlightRange = function(tree, range){

    // Highlight all nodes inbetween range
    buildUp(range.startNode, range.ancestorNode)
    buildDown(range.startNode, range.ancestorNode, range.endNode)

    //Highlight Start and End nodes 
    if (nodeId(range.startNode) === nodeId(range.endNode)){
        highlightNodePartial(range.startNode, range.startOffset, range.endOffset)
    } else {
        highlightNodePartial(range.startNode, range.startOffset, -1)
        highlightNodePartial(range.endNode, 0, range.endOffset)
    }   
    
    console.log(tree.toString());

    
}

const buildUp = function(startNode, commonAncestor){
    let cur = startNode
    while(nodeId(cur) !== nodeId(commonAncestor)){
        const childContainingStart = cur.childNodes.filter(child => nodeContainsNode(child, startNode))

        if (childContainingStart.length !== 0){
            let curNode = childContainingStart[0];
            while(curNode.nextSibling){
                curNode = curNode.nextSibling;
                highlightNode(curNode);
            }
        }
        
        cur = cur.parentNode
    }
}

const buildDown = function(startNode, Ancestor, endNode){
    let cur = Ancestor
    while(nodeId(cur) !== nodeId(endNode)){
        // console.log(cur);
        const childContainingStart = cur.childNodes.filter(child => nodeContainsNode(child, startNode))
        const childContainingEnd  = cur.childNodes.filter(child => nodeContainsNode(child, endNode))[0]
        // console.log(cur.childNodes[20]);
        // console.log(endNode);
        // console.log(nodeContainsNode(cur.childNodes[20], endNode));
        // console.log(cur.childNodes[20].toString())

        
        // console.log(childContainingStart);
        if (childContainingStart.length !== 0){
            let curNode = childContainingStart[0];
            while(nodeId(curNode) !== nodeId(childContainingEnd)){
                curNode = curNode.nextSibling;
                if (nodeId(curNode) !== nodeId(childContainingEnd))
                    highlightNode(curNode);
            }
        } else {
            let curNode = childContainingEnd;
            while(curNode.previousSibling){
                curNode = curNode.previousSibling;
                highlightNode(curNode);
            }
        }

        cur = childContainingEnd;
    }
}


























</script>


{#await promise}
	<p>...waiting</p>
{:then pages}
<p class="book-page" tree-id="0">{@html pages[0]}</p>
{:catch error}
	<p style="color: red">{error.message}</p>
{/await}

<button class="btn btn-warning " type="button" on:click={getNextPage}>
Next Page</button>