export class ImageBank {

	public buffer: any;
	public pictures: { [key: string]: HTMLImageElement };
	public unload: number;

	private _loaded: boolean;
	public get loaded(): boolean { return this._loaded; }

	public list: string[] = [
		"assets/img/red.png",
		"assets/img/yellow.png",
		"assets/img/red2.png",
		"assets/img/yellow2.png",
		"assets/img/grey.png",
		"assets/img/corporate/1.png",
		"assets/img/corporate/2.png",
		"assets/img/corporate/4.png"
	];

	constructor() {
		this.buffer = new Array();
		this.pictures = {};
		this._loaded = false;
	}

	public loadImages(): Promise<void> {
		// Already loaded, do nothing
		if (this._loaded) {
			return Promise.resolve();
		}
		return Promise.all(this.list.map(path =>
			new Promise<HTMLImageElement>((resolve, reject) => {
				const image = new Image();
				image.addEventListener("load", e => {
					this.pictures[path] = image;
					resolve();
				});
				image.addEventListener("error", e => reject(new Error(`Failed to load image '${path}'`)));
				image.src = path;
			})
		)).then(() => {
			this._loaded = true;
		});
	}
}