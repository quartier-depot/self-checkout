class EventEmitter {
    private readonly _events: {};

    constructor() {
        this._events = {};
    }

    on(e:any, f:any) {
        // @ts-ignore
        this._events[e] = this._events[e] || [];
        // @ts-ignore
        this._events[e].push(f);
    }

    emit(e:any, ...args:any[]) {
        // @ts-ignore
        let fs = this._events[e];
        if (fs) {
            fs.forEach((f:any) => {
                setTimeout(() => f(...args), 0);
            });
        }
    }        
}

export default EventEmitter;