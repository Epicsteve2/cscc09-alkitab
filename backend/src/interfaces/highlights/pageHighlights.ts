import { Document } from 'mongoose';
import IHighlightRange from './highlightRange';

export default interface IPageHighlights extends Document {
    bookId: String,
    page: String,
    highlights: Array<IHighlightRange>,
}
