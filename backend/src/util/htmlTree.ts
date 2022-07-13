
export class HTMLTree {
    children;
    nodeType: number;
    // HTML;

    rawText;
    tag;
    attributes;


    constructor(tree: any){
        this.children = tree.childNodes.map((childNode: any) => new HTMLTree(childNode));
        this.nodeType = tree.nodeType;
        if (tree.nodeType === 3)
            this.rawText = tree.toString();
        this.tag = tree.tagName
        this.attributes = tree.attributes
    }

}