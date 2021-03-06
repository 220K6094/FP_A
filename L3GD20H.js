var L3GD20H = function(i2cPort,slaveAddress){
	this.i2cPort = i2cPort;
	this.i2cSlave = null;
	if ( slaveAddress ){
		this.slaveAddress = slaveAddress;
	} else {
		this.slaveAddress =  0x68;
	}
};

L3GD20H.prototype = {
	init: async function(){
		this.i2cSlave = await this.i2cPort.open(this.slaveAddress);
		await this.i2cSlave.write8(0x6b,0x00);
	},
	readTemp: async function(){
		if(this.i2cSlave == null){
			throw Error("i2cSlave Address does'nt yet open!");
		}
		var ans = await this.i2cSlave.read16(0x41);
//         var data = ((MSB << 8) + LSB)/128.0;
		var temp = ans / 340 + 36.53;
		return(temp);
	},
	read: async function(){
		if(this.i2cSlave == null){
			throw Error("i2cSlave Address does'nt yet open!");
		}
		var ans = await this.i2cSlave.read16(0x41);
		var temp = this.getVal(ans) / 340 + 36.53;
		ans = await this.i2cSlave.read16(0x43);
		/*var rx = this.getVal(ans) / 131;
		ans = await this.i2cSlave.read16(0x45);
		var ry = this.getVal(ans) / 131;
		ans = await this.i2cSlave.read16(0x47);
		var rz = this.getVal(ans) / 131;
		ans = await this.i2cSlave.read16(0x3b);*/
		var gx = this.getVal(ans) / 16384;
		ans = await this.i2cSlave.read16(0x3d);
		var gy = this.getVal(ans) / 16384;
		ans = await this.i2cSlave.read16(0x3f);
		var gz = this.getVal(ans) / 16384;
		return({
			temperature: temp,
			gx: gx,
			gy: gy,
			gz: gz
			/*rx: rx,
			ry: ry,
			rz: rz*/
		});
	},
	wake: async function(){
		if(this.i2cSlave == null){
			throw Error("i2cSlave Address does'nt yet open!");
		}
		await this.i2cSlave.write8(0x6b,0x00);
	},
	reset: async function(){ // deep sleep?
		if(this.i2cSlave == null){
			throw Error("i2cSlave Address does'nt yet open!");
		}
		await this.i2cSlave.write8(0x6b,0x80);
	},
	getVal: function( w ){
		var l = w >>> 8;
		var b = w & 0xff;
		var v = l + (b << 8);
		return new Int16Array([v])[0];
	}
};

export default L3GD20H;