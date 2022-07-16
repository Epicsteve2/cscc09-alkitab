import IBookPost from '../interfaces/user';
import mongoose, { Schema } from 'mongoose';

const BookPostSchema: Schema = new Schema(
	{
		bookName: { type: String, required: true },
		numberOfOwners: { type: Number, required: true }

	},
	{
		timestamps: true
	}
);

const BookPost = mongoose.model<IBookPost>('BookPost', BookPostSchema);

export default BookPost;
