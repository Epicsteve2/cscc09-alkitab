import e, { NextFunction, Request, Response } from 'express';
import { RequestHandler } from 'express/ts4.0';
import multer from 'multer';
import { expect } from "chai";
import { extname } from 'path';
import { parse } from 'node-html-parser';
import Epub from "epub";



import BookT from '../models/book';
import IBook from '../interfaces/book';
import Book from '../models/book';

const NAMESPACE = 'Library Controller';



const recurProcessChapters = async function(chapters: Array<string>, book: IBook, epub: Epub){
    if (chapters.length === 0){
       book.save();
       console.log("SAVEDSAEVD")
    } else {
        epub.getChapterRaw(chapters[0], async function(err: any, text: string){
            const root = parse(text);
            const body = root.querySelector("body");
            console.log(body?.toString().substring(0,500)+"\n"+ body?.rawTagName+ "\n\n\n")
            console.log("chapter:"+chapters[0])
            processTree(body, book);
            
            recurProcessChapters(chapters.slice(1), book, epub)
        });
    }

}

const processTree = function(tree:any, book:IBook){
    while (tree.toString().length > 0){
        if (tree.toString().length <= 1000){
            processTreeToPage2(book, tree)
            break;
        }
        else {
            const treeC = getBaseNode2(tree)
            // console.log("BASE" + treeC.toString())
            getNode2(book, 1000, tree, treeC);
        }
            
    }
    
}

const getNode2 = function(book: IBook, charsLeft:number, tree:any, treeC:any){
    // const child = tree.childNodes[0]
    // console.log("LEFTINIT" + charsLeft);
    for (var child of tree.childNodes){
        // console.log("LEFTLOOP"+ charsLeft)
        // console.log("child is " + child.toString())
        if (child.toString().length <= charsLeft){
            treeC.appendChild(child.clone())
            tree.removeChild(child)
            charsLeft -= child.toString().length;
            // console.log("ADDED child:" + child.toString() + ":with length:"+ child.toString().length)
        } else {
            if (child.nodeType === 3){
                const leafCopy = getBaseNode2(child)
                leafCopy.rawText = leafCopy.rawText.substring(0, charsLeft);
                treeC.appendChild(leafCopy);

                child.rawText = child.rawText.substring(charsLeft);
                processTreeToPage2(book, leafCopy);
                break;
            } else {
                const childC = getBaseNode2(child);
                if (charsLeft - childC.toString().length <= 0){
                    processTreeToPage2(book, treeC);
                    break;
                } else {
                    treeC.appendChild(childC)
                    getNode2(book, charsLeft - childC.toString().length, child, childC)
                    break;
                }   
                
            }
        }
        

    }
}

const processTreeToPage2 = function(book: IBook, tree:any){
    while (tree.rawTagName !== 'body'){
        tree = tree.parentNode;
    }
    console.log("\n")
    console.log(tree.toString())
    book.pages.push(tree.toString())
    console.log("\n")

}

const getBaseNode2 = function(tree:any){
    const treeC = tree.clone()
    for (var child of treeC.childNodes){
        treeC.removeChild(child)
    }
    return treeC;
}


export const upload: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
    // expect(req.files.book, "file needed").to.exist;
    const book = new Book({
        user: req.body.username,
        sharedUsers: [],
        pages: []
    });
    
    const files = req.files as { [fieldname: string]: Express.Multer.File[]};
    const bookPath = files.book[0].path

    let epub = new Epub(bookPath);
    epub.parse();
    epub.on("end", async function () {
        const chapters = epub.flow.map(element => element.id);
        

        // epub.getChapterRaw(chapters[1], async function(err: any, text: string){
        //     const root = parse(text);
        //     const body = root.querySelector("body");
        //     // console.log(body)
        //     console.log(body?.toString())
        //     // if (body)
        //     // body.parentNode = undefined;
        //     console.log("THIS IS BEFORE\n\n")
        //     processTree(body);
            
        // });

        
        recurProcessChapters(chapters, book, epub);


    });

    
};


export const test: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
    // expect(req.files.book, "file needed").to.exist;

    const text = `<html>
    1daniel<p class=\"calibr1 calir2\" alt=\"dsfjlk\"> charile <i> foxtrot</i> tango</p><i class=\"fontX\"> bob</i>
    2daniel<p class=\"calibr1 calir2\" alt=\"dsfjlk\"> charile <i> foxtrot</i> tango</p><i class=\"fontX\"> bob</i>
    3daniel<p class=\"calibr1 calir2\" alt=\"dsfjlk\"> charile <i> foxtrot</i> tango</p><i class=\"fontX\"> bob</i>
    4daniel<p class=\"calibr1 calir2\" alt=\"dsfjlk\"> charile <i> foxtrot</i> tango</p><i class=\"fontX\"> bob</i>
    5daniel<p class=\"calibr1 calir2\" alt=\"dsfjlk\"> charile <i> foxtrot</i> tango</p><i class=\"fontX\"> bob</i>
    6daniel<p class=\"calibr1 calir2\" alt=\"dsfjlk\"> charile <i> foxtrot</i> tango</p><i class=\"fontX\"> bob</i>
    7daniel<p class=\"calibr1 calir2\" alt=\"dsfjlk\"> charile <i> foxtrot</i> tango</p><i class=\"fontX\"> bob</i>
    8daniel<p class=\"calibr1 calir2\" alt=\"dsfjlk\"> charile <i> foxtrot</i> tango</p><i class=\"fontX\"> bob</i>
    9daniel<p class=\"calibr1 calir2\" alt=\"dsfjlk\"> charile <i> foxtrot</i> tango</p><i class=\"fontX\"> bob</i>
    Adaniel<p class=\"calibr1 calir2\" alt=\"dsfjlk\"> charile <i> foxtrot</i> tango</p><i class=\"fontX\"> bob</i>
    Bdaniel<p class=\"calibr1 calir2\" alt=\"dsfjlk\"> charile <i> foxtrot</i> tango</p><i class=\"fontX\"> bob</i>
    Cdaniel<p class=\"calibr1 calir2\" alt=\"dsfjlk\"> charile <i> foxtrot</i> tango</p><i class=\"fontX\"> bob</i>
    Ddaniel<p class=\"calibr1 calir2\" alt=\"dsfjlk\"> charile <i> foxtrot</i> tango</p><i class=\"fontX\"> bob</i>
    Edaniel<p class=\"calibr1 calir2\" alt=\"dsfjlk\"> charile <i> foxtrot</i> tango</p><i class=\"fontX\"> bob</i>
    Fdaniel<p class=\"calibr1 calir2\" alt=\"dsfjlk\"> charile <i> foxtrot</i> tango</p><i class=\"fontX\"> bob</i>
    Gdaniel<p class=\"calibr1 calir2\" alt=\"dsfjlk\"> charile <i> foxtrot</i> tango</p><i class=\"fontX\"> bob</i>
    Hdaniel<p class=\"calibr1 calir2\" alt=\"dsfjlk\"> charile <i> foxtrot</i> tango</p><i class=\"fontX\"> bob</i>
    </html>
`;
    const root = parse(text);
    const textnode = parse("hello").firstChild
    // console.log(textnode.childNodes[0]);
    // processTree(root.firstChild);

        
        
    
   




    
};
