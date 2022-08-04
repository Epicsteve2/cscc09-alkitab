import { Document } from 'mongoose';

export default interface IBookShare extends Document {
	bookId: String;
	sharer: String;
	sharee: String;
}
