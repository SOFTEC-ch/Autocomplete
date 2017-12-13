class RequestBundler {

    constructor(requestHandler) {
        this.data = [];
        this.pending = [];
        this.requestHandler = requestHandler;
    }

    get(url, callback) {
        let existingData = this.data.filter(x => x.url === url);
        let existingRequest = this.pending.filter(x => x.url === url);

        if (existingData && existingData.length) {
            callback(existingData[0]);
        } else if (existingRequest && existingRequest.length) {
            existingRequest[0].callbacks.push(callback);
        } else {
            this.pending.push({
                url,
                request: this.requestHandler(url).then(data => this._handleCallbacks(url, data)),
                callbacks: [callback]
            });
        }
    }

    _handleCallbacks(url, data) {
        let cached = this.data.filter(x => x.url === url);
        if (cached) {
            cached = data;
        }

        let req = this.pending.filter(x => x.url === url);
        if (req) {
            req[0].callbacks.forEach(callback => callback(data));
            this.pending = this.pending.filter(x => x.url !== url);     // remove from pending requests
        }
    }
}