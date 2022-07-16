import IBook from '../interfaces/book';
import IUser from '../interfaces/user';
import mongoose, { Schema } from 'mongoose';

const BookSchema: Schema = new Schema(
	{
		user: { type: String, required: true},
		sharedUsers: { type: Array<String> },
		pages: { type: Array<String>, required: true },
	},
	{
		timestamps: true
	}
);

const Book = mongoose.model<IBook>('Book', BookSchema);

export default Book;
