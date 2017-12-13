describe('RequestBundler', function () {

    const $ = jQuery;
    const TESTDATA = 'TESTDATA';

    let bundler;
    let reqHandler;
    let callbacks;
    let urls;

    let generateCallbacks = (count) => {
        let callbacks = [];
        for (let i = 0; i < count; i++) {
            callbacks.push(jasmine.createSpy("callback spy"));
        }
        return callbacks;
    };

    let randomInt = (min, max) => {
        return Math.floor(Math.random() * (max - min + 1) + min);
    };

    let getReqHandler = () => {
        return jasmine.createSpy("requestHandler spy").and.callFake((url) => {
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve(TESTDATA);
                }, randomInt(200, 600));
            });
        });
    };

    beforeEach(function () {
        callbacks = generateCallbacks(10);
        reqHandler = getReqHandler();
        bundler = new RequestBundler(reqHandler);
    });

    it('should add new requests to the array of pending requests', function () {
        expect(bundler.pending.length).toBe(0);
        bundler.get('http://127.0.0.1', function () {
        });
        expect(bundler.pending.length).toBe(1);
    });

    it('should call the requestHandler with the correct url', function () {
        let url = 'http://softec.ch';
        bundler.get(url);
        expect(reqHandler).toHaveBeenCalledWith(url);
    });

    it('should execute a single callback', function (done) {
        let callback = jasmine.createSpy("callback spy").and.callFake(data => expect(data).toBe(TESTDATA));
        bundler.get('http://google.com', callback);
        setTimeout(() => {
            expect(callback).toHaveBeenCalled();
            done();
        }, 600);
    });

    it('should execute multiple callbacks', function (done) {
        let callback = jasmine.createSpy("callback spy").and.callFake(data => expect(data).toBe(TESTDATA));
        let callback2 = jasmine.createSpy("callback spy").and.callFake(data => expect(data).toBe(TESTDATA));
        let callback3 = jasmine.createSpy("callback spy").and.callFake(data => expect(data).toBe(TESTDATA));

        bundler.get('http://google.com', callback);
        bundler.get('http://google.com', callback2);
        bundler.get('http://google.com', callback3);

        setTimeout(() => {
            expect(callback).toHaveBeenCalled();
            expect(callback2).toHaveBeenCalled();
            expect(callback3).toHaveBeenCalled();
            done();
        }, 600);
    });

    it('should only request the same url once, but execute multiple callbacks', function (done) {
        bundler.get('http://google.com', callbacks[0]);
        bundler.get('http://google.com', callbacks[1]);
        bundler.get('http://google.com', callbacks[2]);

        setTimeout(() => {
            expect(reqHandler).toHaveBeenCalledTimes(1);
            done();
        }, 600);
    });

    it('should call the requestHandler once for each url and execute the provided callbacks', function (done) {
        callbacks = generateCallbacks(400);
        for (let i = 0; i < 400; i++) {
            bundler.get('http://google.com', callbacks[i]);
            bundler.get('http://softec.ch', callbacks[++i]);
            bundler.get('http://asdf.ch', callbacks[++i]);
            bundler.get('http://microsoft.com', callbacks[++i]);
        }

        setTimeout(() => {
            expect(reqHandler).toHaveBeenCalledTimes(4);
            for (let i = 0; i < 400; i++) {
                expect(callbacks[i]).toHaveBeenCalled();
            }
            done();
        }, 800);
    });

    it('should remove completed requests from the pending list', function (done) {
        bundler.get('http://google.com', callbacks[0]);
        bundler.get('http://softec.ch', callbacks[1]);

        expect(bundler.pending.length).toBe(2);
        setTimeout(() => {
            expect(bundler.pending.length).toBe(0);
            done();
        }, 800);
    });

});