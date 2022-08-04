import e, { NextFunction, Request, Response } from 'express';
import { RequestHandler } from 'express/ts4.0';
import multer from 'multer';
import { expect } from 'chai';
import { extname } from 'path';
import fs from 'fs';
import mongoose from 'mongoose';
import { parse } from 'node-html-parser';
import Epub from 'epub';
import path from 'path';

import User from '../models/user';
import BookT from '../models/book';
import IBook from '../interfaces/book';
import Book from '../models/book';
import { fstat } from 'fs';
import EPub from 'epub';
import { ChildProcess } from 'child_process';
import PageHighlights from '../models/pageHighlights';
import IPageHighlights from '../interfaces/highlights/pageHighlights';
import { hasAccessToBook } from '../util/book';

const NAMESPACE = 'Library Controller';

const recurProcessChapters = async function (chapters: Array<string>, book: IBook, epub: Epub, callback: () => void) {
	if (chapters.length === 0) {
		book.numPages = book.pages.length;
		const numPages = book.numPages;
		await processImage(book, epub);
		callback();
	} else {
		epub.getChapterRaw(chapters[0], async function (err: any, text: string) {
			const root = parse(text);
			const body = root.querySelector('body');
			processTree(body, book);

			await recurProcessChapters(chapters.slice(1), book, epub, callback);
		});
	}
};

const HTML_BLOCK_LIMIT = 1500;
const processTree = function (tree: any, book: IBook) {
	while (tree.toString().length > 0) {
		if (tree.toString().length <= HTML_BLOCK_LIMIT) {
			processTreeToPage2(book, tree);
			break;
		} else {
			const treeC = getBaseNode2(tree);
			getNode2(book, HTML_BLOCK_LIMIT, tree, treeC);
		}
	}
};

const getNode2 = function (book: IBook, charsLeft: number, tree: any, treeC: any) {
	for (var child of tree.childNodes) {
		if (child.toString().length <= charsLeft) {
			treeC.appendChild(child.clone());
			tree.removeChild(child);
			charsLeft -= child.toString().length;
		} else {
			if (child.nodeType === 3) {
				const leafCopy = getBaseNode2(child);
				leafCopy.rawText = leafCopy.rawText.substring(0, charsLeft);
				treeC.appendChild(leafCopy);

				child.rawText = child.rawText.substring(charsLeft);
				processTreeToPage2(book, leafCopy);
				break;
			} else {
				const childC = getBaseNode2(child);
				if (charsLeft - childC.toString().length <= 0) {
					processTreeToPage2(book, treeC);
					break;
				} else {
					treeC.appendChild(childC);
					getNode2(book, charsLeft - childC.toString().length, child, childC);
					break;
				}
			}
		}
	}
};

// Given a Tree Object, convert it to a string, and add it to pages of the book
const processTreeToPage2 = function (book: IBook, tree: any) {
	while (tree.rawTagName !== 'body') {
		tree = tree.parentNode;
	}
	addIds(tree);
	book.pages.push(tree.toString());
};

// Adds an attribute "tree-id" to all ELEMENT Nodes of the Tree Object
const addIds = function (tree: any) {
	let id = 0;
	let cur: any;
	const queue = [];
	queue.push(tree);

	while (queue.length !== 0) {
		const cur = queue.shift();
		if (cur.nodeType === 1) {
			cur.rawAttrs = cur.rawAttrs + ' tree-id=' + id++;
			cur.childNodes.forEach((child: any) => {
				queue.push(child);
			});
		}
	}
};

// Returns a copy of the Node that has all children removed
const getBaseNode2 = function (tree: any) {
	const treeC = tree.clone();
	for (var child of treeC.childNodes) {
		treeC.removeChild(child);
	}
	return treeC;
};

export const upload: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
	if (req.session.user) {
		const book = new Book({
			user: req.session.user,
			pages: [],
			title: 'Placeholder',
			coverImg: {
				id: '',
				mimeType: '',
				path: ''
			}
		});

		const files = req.files as { [fieldname: string]: Express.Multer.File[] };
		const bookPath = files.book[0].path;

		let epub = new Epub(bookPath);
		epub.parse();
		epub.on('end', async function () {
			book.title = epub.metadata.title;
			const chapters = epub.flow.map((element) => element.id);

			fs.unlink(bookPath, (err) => {
				console.log(err);
			});

			const callbackBookSaved = function () {
				res.status(200).json({ msg: 'uploaded', id: book._id });
			};

			await recurProcessChapters(chapters, book, epub, callbackBookSaved);
		});
	}
};

const recurProcessImages = async function (imagesIds: Array<string>, epub: any, bookId: string, firstImage: boolean, book: IBook) {
	if (imagesIds.length == 0) {
		await book.save();
		return 0;
	} else {
		epub.getImage(imagesIds[0], (err: any, img: any, mimeType: any) => {
			if (err) console.log(err);
			console.log(img);
			console.log(mimeType);

			if (firstImage) {
				book.coverImg = { id: '', mimeType: '', path: '' };
				book.coverImg.id = imagesIds[0];
				book.coverImg.mimeType = mimeType;
				book.coverImg.path = path.join('uploads', bookId, imagesIds[0]);
			}

			fs.promises.mkdir(path.join('uploads', bookId), { recursive: true }).then(() => {
				fs.writeFile(path.join('uploads', bookId, imagesIds[0]), img, (err) => {
					console.log(err);
				});
			});

			recurProcessImages(imagesIds.slice(1), epub, bookId, false, book);
		});
	}
};

const processImage = async function (book: IBook, epub: any) {
	const bookId = book._id.toString();

	const regex = new RegExp('image*');

	const imageIds = Object.keys(epub.manifest).filter((id) => {
		const manifest: any = epub.manifest;
		const value: any = manifest[id];
		if (regex.test(value['media-type'])) return true;
		else return false;
	});

	console.log(imageIds);
	await recurProcessImages(imageIds, epub, bookId, true, book);
};

export const getBook: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
	const page = req.query.page ? Number(req.query.page) : 0;
	const limit = req.query.limit ? Number(req.query.limit) : 1;
	const bookId = req.params.id;

	if (!mongoose.Types.ObjectId.isValid(bookId)) return res.status(400).json({ msg: 'Invalid ID' });
	if (req.session.user) {
		if (!(await hasAccessToBook(req.session.user, bookId))) return res.status(403).json({ msg: 'No access to book' });
	}

	const book = await Book.findById(bookId);
	if (book) {
		console.log('found');
		res.status(200).json({ pages: book.pages.slice(page, page + limit) });
	} else {
		res.status(404).json({ msg: 'not found' });
	}
};

export const getBookDetails: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
	const bookId = req.params.id;

	if (!mongoose.Types.ObjectId.isValid(bookId)) return res.status(400).json({ msg: 'Invalid ID' });
	if (req.session.user) {
		if (!(await hasAccessToBook(req.session.user, bookId))) return res.status(403).json({ msg: 'No access to book' });
	}

	const book = await Book.findById(bookId).select('-pages');
	if (book) {
		res.status(200).json({ book: book });
	} else {
		res.status(404).json({ msg: 'not found' });
	}
};

export const getCoverImage: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
	const bookId = req.params.id;

	if (!mongoose.Types.ObjectId.isValid(bookId)) return res.status(400).json({ msg: 'Invalid ID' });
	if (req.session.user) {
		if (!(await hasAccessToBook(req.session.user, bookId))) return res.status(403).json({ msg: 'No access to book' });
	}

	const book = await Book.findById(req.params.id);
	if (book) {
		const coverImg = book.coverImg;
		res.setHeader('Content-Type', coverImg.mimeType.toString());
		res.sendFile(coverImg.path.toString(), { root: __dirname + '/../../' });
	} else {
		res.status(404).json({ msg: 'not found' });
	}
};

export const getLibrary: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
	const limit = req.query.limit ? Number(req.query.limit) : 5;
	const username = req.session.user;

	const books = await Book.find({ user: username }).select('-pages').limit(limit);

	res.status(200).json(books);
};

export const getPageHighlights: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
	const bookId = req.params.bookId;
	const page = req.params.page;

	if (!mongoose.Types.ObjectId.isValid(bookId)) return res.status(400).json({ msg: 'Invalid ID' });
	if (req.session.user) {
		if (!(await hasAccessToBook(req.session.user, bookId))) return res.status(403).json({ msg: 'No access to book' });
	}

	const pageHighlights = await PageHighlights.findOne({ $and: [{ bookId: bookId }, { page: page }] });
	if (pageHighlights) {
		res.status(200).json({ bookId: bookId, page: page, pageHighlights: pageHighlights.highlights });
	} else {
		res.status(200).json({ bookId: bookId, page: page, pageHighlights: {} });
	}
};

export const handleUpdateHighlight: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
	const bookId = req.params.bookId;
	const page = Number(req.params.page);
	const pageHighlights = req.body.pageHighlights;

	if (!mongoose.Types.ObjectId.isValid(bookId)) return res.status(400).json({ msg: 'Invalid ID' });
	if (req.session.user) {
		if (!(await hasAccessToBook(req.session.user, bookId))) return res.status(403).json({ msg: 'No access to book' });
	}

	await updateHighlight(bookId, page, pageHighlights);
	res.status(200).json({ msg: 'highlight for page has been saved' });
};

const updateHighlight = async function (bookId: String, page: number, updatedPageHighlights: { [nodeId: string]: Array<Array<Number>> }) {
	const pageHighlights = await PageHighlights.findOne({ $and: [{ bookId: bookId }, { page: page }] });
	if (pageHighlights) {
		pageHighlights.highlights = updatedPageHighlights;
		await pageHighlights.save();
	} else {
		const newPageHighlights = new PageHighlights({
			bookId: bookId,
			page: page,
			highlights: updatedPageHighlights
		});

		await newPageHighlights.save();
		// res.status(200).json({msg: "highlight for page has been saved"})
	}
};
