import { NextFunction, Request, Response } from 'express';
import { RequestHandler } from 'express/ts4.0';
import IBookPost from '../interfaces/bookPost';
import BookPost from '../models/bookPost';

const NAMESPACE = 'BookPost Controller';

export const makeNewPost: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
    const newPost = new BookPost({
        bookName: req.body.bookName,
        numberOfOwners: 1
    })

    newPost.save();

    res.status(200).json({newPosting: newPost});
}

export const incrOwners: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id
    const bookPost: any = await BookPost.findById(id);

    bookPost.numberOfOwners++;
    bookPost.save();

    res.status(200).json({posting: bookPost});

}

export const getBookPosts: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
    const limit = req.query.limit ? Number(req.query.limit) : 5;

    const posts = await BookPost.find({}).sort({bookName: 'asc'}).limit(limit);

    res.status(200).json({posts: posts});
}

