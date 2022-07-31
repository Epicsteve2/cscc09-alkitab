import mongoose, { Schema } from 'mongoose';
import IHighlightRange from '../interfaces/highlights/highlightRange';
import IPageHighlights from '../interfaces/highlights/pageHighlights';

const PageHighlightsSchema: Schema = new Schema(
	{
		bookId: { type: String, required: true},
		page: { type: Number, required: true},

		highlights: {type: Array<IHighlightRange>, required : true}
	},
	{
		timestamps: true
	}
);

const PageHighlights = mongoose.model<IPageHighlights>('PageHighlights', PageHighlightsSchema);

export default PageHighlights;
