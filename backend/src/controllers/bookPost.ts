import { NextFunction, Request, Response } from 'express';
import { RequestHandler } from 'express/ts4.0';
import BookPost from '../models/bookPost';

const NAMESPACE = 'BookPost Controller';

export const makeNewPost: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
    const newPost = new BookPost({
        bookName: req.body.bookName,
        numberOfOwners: 1
    })

    newPost.save();
}

