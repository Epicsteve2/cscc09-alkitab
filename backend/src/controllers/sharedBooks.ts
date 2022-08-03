import { NextFunction, Request, Response } from 'express';
import { RequestHandler } from 'express/ts4.0';
import BookShare from '../models/bookShare';
import Book from '../models/book';

const NAMESPACE = 'SharedBooks Controller';

export const addShareRelationship: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
	const newShare = new BookShare({
		bookId: req.body.bookId,
		sharer: req.session.user || req.body.sharer,
		sharee: req.body.sharee
	});

	newShare.save();

	res.status(200).json({ msg: 'relation added' });
};

export const getSharedBooks: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
    const limit = req.query.limit ? Number(req.query.limit) : 5;
    const username = req.session.user || req.query.user

    const sharedRelations = await BookShare.find({sharee: username}).select('bookId').limit(limit);
    const bookIds = sharedRelations.map(realtion => realtion.bookId);
    const books = await Book.find({ _id : { $in : bookIds }}).select('-pages').limit(limit);
    console.log(books);




    return res.status(200).json({books : books})


}


