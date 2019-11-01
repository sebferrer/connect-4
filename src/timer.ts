export class Timer {
	public id: string;
	public interval: number;
	public elapsed: number;
	public tick: number;
	public enabled: boolean;
	public start: number;

	constructor(id: string, interval: number) {
		this.id = id;
		this.interval = interval;
		this.elapsed = 0;
		this.tick = 0;
		this.enabled = false;
		this.start = 0;
	}

	public enable(): void {
		if (!this.enabled) {
			this.enabled = true;
		}
	}

	public disable(): void {
		if (this.enabled) {
			this.enabled = false;
		}
	}

	// When started, add 1 tick each X interval
	// To use to an update function
	public run(): void {
		if (this.enabled) {
			this.elapsed = new Date().getTime() - this.start;
			if (this.elapsed > this.interval) {
				this.tick++;
				this.start = new Date().getTime();
			}
		}
	}

	// To use to an update function
	public nextTick(): boolean {
		return this.elapsed > this.interval;
	}

	public reset(): void {
		this.elapsed = 0;
		this.tick = 0;
		this.enabled = false;
	}

	public restart(): void {
		this.elapsed = 0;
		this.tick = 0;
		this.enabled = true;
	}
}