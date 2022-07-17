import { Document } from 'mongoose';

export default interface IBook extends Document {
	pages: Array<String>;
	user: String;
    sharedUsers: Array<String>;
	bookPost: String;
	numPages: Number;
	title: String;
}
