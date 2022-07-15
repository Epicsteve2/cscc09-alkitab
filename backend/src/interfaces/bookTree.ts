import { Document } from 'mongoose';
import { DictTree } from '../util/bookTree';
import { HTMLTree } from '../util/htmlTree';

export default interface IBookTree extends Document {
	chapters: Array<string>;
	trees: Array<DictTree>;
}
