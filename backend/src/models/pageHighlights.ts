import mongoose, { Schema } from 'mongoose';
import IPageHighlights from '../interfaces/highlights/pageHighlights';

const PageHighlightsSchema: Schema = new Schema(
	{
		bookId: { type: String, required: true },
		page: { type: Number, required: true },

		// highlights: {type: Map, of: Array<Number>, required: true}
		highlights: { type: {}, required: true }
	},
	{
		timestamps: true
	}
);

const PageHighlights = mongoose.model<IPageHighlights>('PageHighlights', PageHighlightsSchema);

export default PageHighlights;
