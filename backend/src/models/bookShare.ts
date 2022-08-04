import IBookShare from '../interfaces/bookShare';
import mongoose, { Schema } from 'mongoose';

const BookShareSchema: Schema = new Schema(
	{
		bookId: { type: String, required: true },
		sharer: { type: String, required: true },
		sharee: { type: String, required: true }
	},
	{
		timestamps: true
	}
);

const BookShare = mongoose.model<IBookShare>('BookShare', BookShareSchema);

export default BookShare;
