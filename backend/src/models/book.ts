import IBook from '../interfaces/book';
import mongoose, { Schema } from 'mongoose';

const BookSchema: Schema = new Schema(
	{
		user: { type: String, required: true },

		title: { type: String, required: true },

		pages: { type: Array<String>, required: true },
		numPages: { type: Number },

		coverImg: {
			id: { type: String, required: true },
			mimeType: { type: String, required: true },
			path: { type: String, required: true }
		}
	},
	{
		timestamps: true
	}
);

const Book = mongoose.model<IBook>('Book', BookSchema);

export default Book;
