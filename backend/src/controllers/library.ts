import { NextFunction, Request, Response } from 'express';
import { RequestHandler } from 'express/ts4.0';
import multer from 'multer';
import { expect } from "chai";
import { extname } from 'path';
import { parse } from 'node-html-parser';
import Epub from "epub";



import  {HTMLTree} from '../util/htmlTree';

const NAMESPACE = 'Library Controller';

export const upload: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
    // expect(req.files.book, "file needed").to.exist;
    const files = req.files as { [fieldname: string]: Express.Multer.File[]};
    const bookPath = files.book[0].path

    let epub = new Epub(bookPath);
    epub.parse();
    epub.on("end", async function () {
        const chapters = epub.flow.map(element => element.id);
        epub.getChapterRaw(chapters[1], function(err, text){
            console.log(text.substring(0,1000))
            const mockText = "<body><p>hello it<i> jds jdks</i> fdsf</p><i> fdslk</i></body>"
            const root = parse(mockText);
            const body = root.querySelector("body");
            const bodyT = new HTMLTree(body)
            console.log(bodyT)
            console.log(bodyT.children[0])
            console.log(bodyT.children[1])
            // console.log(body)
            
          });
        
    });

    
};

