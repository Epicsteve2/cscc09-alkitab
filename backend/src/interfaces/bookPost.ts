import { Document } from 'mongoose';

export default interface IBookPost extends Document {
	bookName: Array<String>;
    numberOfOwners: Number
}
