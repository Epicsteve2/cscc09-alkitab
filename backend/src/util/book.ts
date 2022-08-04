import Book from '../models/book';
import BookShare from '../models/bookShare';
import User from '../models/user';

export const hasAccessToBook = async function (username: string, bookId: string) {
	const book = await Book.findById(bookId);
	const sharedRelation = await BookShare.findOne({ $and: [{ sharee: username }, { bookId: bookId }] });

	if ((book && book.user === username) || sharedRelation) {
		return true;
	}
	return false;
};

export const userExists = async function (username: string) {
	const user = await User.findOne({ username: username });
	if (user) return true;
	return false;
};
