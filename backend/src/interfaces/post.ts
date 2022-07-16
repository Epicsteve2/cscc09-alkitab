import { Document } from 'mongoose';

export default interface IPost extends Document {
	bookName: Array<String>;
    numberOfOwners: Number
}
