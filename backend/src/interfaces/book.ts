import { Document } from 'mongoose';

export default interface IBook extends Document {
	pages: Array<String>;
	user: String;
	bookPost: String;
	numPages: Number;
	title: String;
	coverImg: {
		id: String,
		mimeType: String,
		path: String,
	}
}
