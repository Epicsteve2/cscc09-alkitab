
export class HTMLTree {
    children: Array<HTMLTree>;
    nodeType: number;
    // HTML;
    stringLenght: number;
    rawText;
    tag;
    rawAttrs;

    constructor(tree: any){
        this.children = tree.childNodes.map((childNode: any) => new HTMLTree(childNode));
        this.nodeType = tree.nodeType;
        this.stringLenght = tree.toString().length
        if (tree.nodeType === 3)
            this.rawText = tree.toString();
        this.tag = tree.tagName
        this.rawAttrs = tree.rawAttrs;
    }

}