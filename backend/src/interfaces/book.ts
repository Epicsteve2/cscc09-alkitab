import { Document } from 'mongoose';

export default interface IBook extends Document {
	pages: Array<string>;
	user: String;
    sharedUsers: Array<String>;
}
