import IBook from '../interfaces/book';
import mongoose, { Schema } from 'mongoose';

const BookSchema: Schema = new Schema(
	{
		user: { type: String, required: true},

		bookPost: { type: String, required: true},
		title: { type: String, required: true},

		pages: { type: Array<String>, required: true },
		numPages: { type: Number },
	},
	{
		timestamps: true
	}
);

const Book = mongoose.model<IBook>('Book', BookSchema);

export default Book;
