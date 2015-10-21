_delay.prototype = Object.create(BmxMachine.prototype);
_delay.prototype.constructor=_delay;

function _delay() {

	this.type = 1;
	this.numGlobalParameters = 4;
	this.numTrackParameters = 0;
	this.numChannels = 2;

	this.buf = null;
	this.patterns = [];
	this.events = [];

	var dlength;
	var feedback;
	var dryout;
	var wetout;

	var iw;
	var len;
	var fb;
	var dry;
	var wet;
	var pan;

	var dsize = 0;
	var buf1 = null;
	var buf2 = null;
	
	this.Init = function(msd) {
		pan = 0;
		iw = 0;
		dlength = 0;
		feedback = 0;
		dryout = 0;
		wetout = 0;
		dsize = this.pMasterInfo.SamplesPerSec;
		buf1 = new Float32Array(dsize);
		buf2 = new Float32Array(dsize);
	}
	
	this.Tick = function() {

		dlength = this.gp(0, dlength);
		feedback = this.gp(1, feedback);
		dryout = this.gp(2, dryout);
		wetout = this.gp(3, wetout);

		len = dlength / 128.0;
		fb = feedback / 128.0;
		dry = dryout / 128.0;
		wet = wetout / 128.0;
	}

	this.Work = function(psamples, numsamples, channels) {
		var delta = len * dsize;
		var lbuf = pan ? buf1 : buf2;
		var rbuf = pan ? buf2 : buf1;

		for (var i = 0; i < numsamples*2;) {
			var pin = psamples[i];

			psamples[i++] = rbuf[iw] * wet + pin * dry;
			rbuf[iw] = fb * rbuf[iw];

			psamples[i++] = lbuf[iw] * wet + pin * dry;
			lbuf[iw] = pin + fb * lbuf[iw];

			iw++;

			if (iw >= delta) {
				iw = 0;
				pan = 1 - pan;
				lbuf = pan ? buf1 : buf2;
				rbuf = pan ? buf2 : buf1;
			}
		}
		return true;
	}
}
