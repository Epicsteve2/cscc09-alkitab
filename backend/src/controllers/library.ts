import e, { NextFunction, Request, Response } from 'express';
import { RequestHandler } from 'express/ts4.0';
import multer from 'multer';
import { expect } from "chai";
import { extname } from 'path';
import fs from 'fs';
import mongoose from 'mongoose';
import { parse } from 'node-html-parser';
import Epub from "epub";
import path from "path"


import User from '../models/user';
import BookT from '../models/book';
import IBook from '../interfaces/book';
import Book from '../models/book';
import { fstat } from 'fs';
import EPub from 'epub';
import { ChildProcess } from 'child_process';

const NAMESPACE = 'Library Controller';



const recurProcessChapters = async function(chapters: Array<string>, book: IBook, epub: Epub, callback: () => void){
    if (chapters.length === 0){
       book.numPages = book.pages.length;
       const numPages = book.numPages;
       await processImage(book, epub)
    //    await book.save();
       callback();
       console.log(numPages);
       console.log("SAVEDSAEVD")
    } else {
        epub.getChapterRaw(chapters[0], async function(err: any, text: string){
            const root = parse(text);
            const body = root.querySelector("body");
            console.log(body?.toString().substring(0,500)+"\n"+ body?.rawTagName+ "\n\n\n")
            console.log("chapter:"+chapters[0])
            processTree(body, book);
            
            await recurProcessChapters(chapters.slice(1), book, epub, callback)
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
    addIds(tree);
    book.pages.push(tree.toString())
}

const addIds = function(tree:any){
    let id=0;
    let cur:any
    const queue = [];
    queue.push(tree);

    while(queue.length !== 0){
        const cur = queue.shift();
        if (cur.nodeType === 1){
            cur.rawAttrs = cur.rawAttrs + " tree-id=" + (id++);
            cur.childNodes.forEach((child: any) => {
                queue.push(child);
            });
        }
    }

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
        user: req.session.user || req.body.username ,
        pages: [],
        bookPost: req.body.bookPost || "Mock",
        title: "Placeholder",
        coverImg : {
            id : "",
            mimeType: "",
            path: ""
        }
    });

    
    const files = req.files as { [fieldname: string]: Express.Multer.File[]};
    const bookPath = files.book[0].path

    let epub = new Epub(bookPath);
    epub.parse();
    epub.on("end", async function () {

        book.title = epub.metadata.title;
        const chapters = epub.flow.map(element => element.id);  



        fs.unlink(bookPath, (err) =>{
            console.log(err);
        });


        const callbackBookSaved = function(){
            res.status(200).json({msg:"uploaded", id:book._id})
        }


        await recurProcessChapters(chapters, book, epub, callbackBookSaved);
    });

    
};

const recurProcessImages = async function(imagesIds: Array<string>, epub:any, bookId:string, firstImage:boolean, book:IBook){
    if (imagesIds.length == 0){
        await book.save()
        return 0;
    } else {
        epub.getImage(imagesIds[0], (err: any, img: any, mimeType: any) => {
            if (err) console.log(err)
            console.log(img);
            console.log(mimeType)

            if (firstImage){
                book.coverImg = {id:"", mimeType: "", path: ""};
                book.coverImg.id = imagesIds[0];
                book.coverImg.mimeType = mimeType;
                book.coverImg.path = path.join('uploads', bookId, imagesIds[0]);
            }
                
            
            
            fs.promises.mkdir(path.join('uploads', bookId), { recursive: true }).then(() =>{
                fs.writeFile(path.join('uploads', bookId, imagesIds[0]), img, (err => {
                    console.log(err)
                }));

            })

            recurProcessImages(imagesIds.slice(1), epub, bookId, false, book);


        })
    }

}

const processImage = async function(book:IBook, epub:any) {
    const bookId = book._id.toString();

    const regex = new RegExp('image*');

    const imageIds = Object.keys(epub.manifest).filter(id => {
        const manifest:any = epub.manifest;
        const value:any = manifest[id];
        if (regex.test(value['media-type']))
            return true
        else 
            return false
    })

    console.log(imageIds);
    await recurProcessImages(imageIds, epub, bookId, true, book);

}

export const upload2: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
    // expect(req.files.book, "file needed").to.exist;
    const book = new Book({
        user: req.session.user || req.body.username ,
        sharedUsers: [],
        pages: [],
        bookPost: req.body.bookPost || "Mock",
        title: "Placeholder"
    });

    
    const files = req.files as { [fieldname: string]: Express.Multer.File[]};
    const bookPath = files.book[0].path

    let epub = new Epub(bookPath);
    epub.parse();
    epub.on("end", async function () {

        book.title = epub.metadata.title;
        const chapters = epub.flow.map(element => element.id);  
        
        console.log(epub.manifest);

        const regex = new RegExp('image*');

        const imageIds = Object.keys(epub.manifest).filter(id => {
            const manifest:any = epub.manifest;
            const value:any = manifest[id];
            if (regex.test(value['media-type']))
                return true
            else 
                return false
        })

        console.log(imageIds);
        recurProcessImages(imageIds, epub, "7777878", true, book);

        fs.unlink(bookPath, (err) =>{
            // console.log(err);
        });

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
   
    const textnode:any = parse("<p class=\"calibr1 calir2\" alt=\"dsfjlk\">hello</p>").firstChild
    textnode.rawAttrs = textnode.rawAttrs + " tree-id=1"
    console.log(textnode)
    console.log(textnode.toString())

    res.status(200).json("lol")
};

export const getBook: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
    const page = req.query.page ? Number(req.query.page) : 0;
    const limit = req.query.limit ? Number(req.query.limit) : 1;
    const bookId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(bookId)) return res.status(400).json({msg:"Invalid ID"})

    const book =  await Book.findById(bookId);
    if (book){
        console.log("found");
        res.status(200).json({pages: book.pages.slice(page, page+limit)})
    } else {
        res.status(404).json({msg:"not found"})
    }

};

export const getCoverImage: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
    const book =  await Book.findById(req.params.id);
    if (book){
        const coverImg = book.coverImg;
        res.setHeader("Content-Type", coverImg.mimeType.toString())
        res.sendFile(coverImg.path.toString(), {root: __dirname+"/../../"});
    } else {
        res.status(404).json({msg:"not found"})
    }

};


export const getLibrary: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
    const limit = req.query.limit ? Number(req.query.limit) : 5;
    const username = req.session.user || req.query.user

    const books = await Book.find({user: username}).select('-pages').limit(limit);

    res.status(200).json(books);

};





