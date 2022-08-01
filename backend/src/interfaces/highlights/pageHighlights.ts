import { Document } from 'mongoose';

export default interface IPageHighlights extends Document {
    bookId: String,
    page: String,
    // highlights: Map<String, Array<Number>>
    highlights: { [nodeId: string]: Array<Array<Number>> }
}
