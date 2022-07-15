import IBookTree from '../interfaces/bookTree';
import { DictTree } from '../util/bookTree';
import mongoose, { Schema } from 'mongoose';

const BookTreeSchema: Schema = new Schema(
	{
		chapters: { type: Array<String>, required: true },
		trees: { type: [] as DictTree[], required: true }
	},
	{
		timestamps: true
	}
);

const BookTree = mongoose.model<IBookTree>('BookTree', BookTreeSchema);

export default BookTree;
