import e, { NextFunction, Request, Response } from 'express';
import { RequestHandler } from 'express/ts4.0';
import multer from 'multer';
import { expect } from "chai";
import { extname } from 'path';
import { parse } from 'node-html-parser';
import Epub from "epub";



import  {HTMLTree} from '../util/htmlTree';
import BookTree from '../models/bookTree';
import { DictTree } from '../util/bookTree';
import IBookTree from '../interfaces/bookTree';

const NAMESPACE = 'Library Controller';

// const chapterToTree = async function(epub: Epub, chapter: string): Promise<HTMLTree>{
//     let bodyT:HTMLTree;

//     await new Promise<void>((resolve, reject) => {
//         epub.getChapterRaw(chapter, function(err: any, text: string){
//             const root = parse(text);
//             const body = root.querySelector("body");
//             bodyT = new HTMLTree(body)
//             resolve();
//         });
//     }).then(() =>{
//         return bodyT;}
//     )
    


// }











const recurProcessChapters = function(chapters: Array<string>, bookTree: IBookTree, epub: Epub){
    if (chapters.length === 0){
       bookTree.save()
    } else {
        epub.getChapterRaw(chapters[0], async function(err: any, text: string){
            const root = parse(text);
            const body = root.querySelector("body");
            processTree(body);
            const bodyT = new HTMLTree(body)
            const bookDictTree: DictTree = {
                chapter: chapters[0],
                tree: bodyT
            }
            bookTree.trees.push(bookDictTree);
            recurProcessChapters(chapters.slice(1), bookTree, epub)
        });
    }

}

const processTree = function(tree:any){
    let pages = {}
    const treeC = getBaseNode2(tree)
    getNode2(500, tree, treeC);
}

const getNode2 = function(charsLeft:number, tree:any, treeC:any){
    // const child = tree.childNodes[0]
    for (var child of tree.childNodes){
        if (child.toString().length <= charsLeft){
            treeC.appendChild(child.clone())
            tree.removeChild(child)
            charsLeft -= child.toString().length;
        } else {
            if (child.nodeType === 3){
                const leafCopy = getBaseNode2(child)
                leafCopy.rawText = leafCopy.rawText.substring(0, charsLeft);
                treeC.appendChild(leafCopy);

                child.rawText = child.rawText.substring(charsLeft);
                processTreeToPage2(leafCopy);
            } else {
                const childC = getBaseNode2(child);
                treeC.appendChild(childC)
                getNode2(charsLeft - childC.toString().length, child, childC)
            }
        }
        

    }
}

const processTreeToPage2 = function(tree:any){

}

const getBaseNode2 = function(tree:any){
    const treeC = tree.clone()
    for (var child of treeC){
        treeC.removeChild(child)
    }
    return treeC;
}


// const recrProcessTrees = function(bookTrees:Array<DictTree>, pages:Array<string>){
//     if (bookTrees.length === 0){
//         return pages;
//     } else{
//         pages = processTreeToPage(bookTrees[0].tree, pages)
//     }
// }

// const processTreeToPage = function(tree: HTMLTree, pages:Array<string>){
//     const treeC = getBaseBranchNode(tree);
//     recurGetNode(500, tree, treeC);
//     const children = tree.children;
    
//     const curChild = tree.children[0]
//     if (curChild.nodeType === 3){
//         if curChild.stringLenght < 
//     }

// }

// const recurGetNode = function(charsLeft:number, node:HTMLTree, nodeC){

//     const curChild = node.children[0];
//     if (curChild.nodeType === 3){
//         if (curChild.stringLenght <= charsLeft){
            
//         }
//     }

// }

const getBaseBranchNode = function(tree: HTMLTree){
    let stringRep = "<" + tree.tag.toLowerCase() + " " + tree.rawAttrs + "></"+ tree.tag.toLowerCase() + ">";
    console.log(stringRep);
    const node = parse(stringRep);
    const node2 = node.querySelector(tree.tag.toLowerCase())
    return node2
}

const recrAddAttrs = function(stringRep:string, attributes: {}){
    if (Object.keys(attributes).length === 0)
        return stringRep;
    
    else {

    }

}

export const upload: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
    // expect(req.files.book, "file needed").to.exist;
    const files = req.files as { [fieldname: string]: Express.Multer.File[]};
    const bookPath = files.book[0].path

    let epub = new Epub(bookPath);
    epub.parse();
    epub.on("end", async function () {
        const chapters = epub.flow.map(element => element.id);
        const newBookTree = new BookTree({
            chapters: chapters
        });

        recurProcessChapters(chapters, newBookTree, epub);

        // setTimeout(function(){
        //     const pages = []
        //     console.log(newBookTree);
        //     recrProcessTrees(newBookTree.trees, pages);
        // }, 1000);

    });

    
};

const getBase = function(tree:HTMLTree){
    tree.children = [];
    return tree;
}

export const test: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
    // expect(req.files.book, "file needed").to.exist;

    const text = "<html>daniel<p class=\"calibr1 calir2\" alt=\"dsfjlk\"> charile <i> foxtrot</i> tango</p><i class=\"fontX\"> bob</i></html>"
    const root = parse(text);
    const textnode = parse("hello").firstChild
    // console.log(textnode.childNodes[0]);
    const bodyT = new HTMLTree(root.childNodes[0]);
    textnode.rawText = textnode.rawText.substring(0,3);
    console.log(textnode);

    // const bodyC = getBaseBranchNode(bodyT.children[1]);
    // const bodyC2 = getBaseBranchNode(bodyT.children[2]);
    // console.log(bodyC);
    // console.log(bodyC2);
    // bodyC2?.appendChild(textnode);
    // if (bodyC)
    //     if (bodyC2){
    //         bodyC2.appendChild(textnode)
    //         bodyC.appendChild(bodyC2)
    //     }
        
        
    
    // console.log(bodyC);
    // console.log(bodyC?.toString())

    // console.log(bodyT);
    // console.log(bodyT.children[1])
    // console.log(Object.keys(bodyT.children[1].attributes))
    // for (const key in bodyT.children[1].attributes){
    //     console.log(key)
    //     console.log(bodyT.children[1].attributes[key])
    // }
    // const strRep = "<p"  
    // const attrsStringRep = Object.keys(bodyT.children[1].attributes).map(attr => {
    //     return `${attr}=\"${bodyT.children[1].attributes[attr]}\"`
    // })

    // const fin = attrsStringRep.reduce(
    //     (strRep, attrStringRep) => `${strRep} ${attrStringRep}`,
    //     strRep
    // )
    // const fin2 = `${fin}><\\p>`
    // console.log(fin2);




    
};
