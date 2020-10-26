
var sql = require("mssql");
//var convert = require('xml-js');
var dateFormat = require('dateformat');

var dbConnectionConfig = {

	database: "ProcessModelerDB",
	options: {
		enableArithAbort: true,
		encrypt: false,
	},
	port: 1433,
	user: 'sa',
	password: "1",
	server: 'LCSC18V139\\SQLEXPRESS',
};

sql.on('error', err => {
	// ... error handler
});


var ModeltableName = "PROCESSMODEL";
var ModelRepostableName = "PROCESSMODELREPOSITORY";



//sql Qurey
var sqlSelectModelQurey = 'select * from ' + ModeltableName + ' where MODELID=@MODELID order by upddttm';
var sqlUpdateModelQuery = 'update ' + ModeltableName + ' set MODEL_XML=@XML where MODELID=@MODELID';

var sqlDeleteModelQuery = 'delete from ' + ModeltableName + ' where MODELID=@id';
var sqlInsertModelQuery = 'insert into ' + ModeltableName + '(MODELCATID, MODELID, PROCESSID, MODEL_XML, INSUSER, INSDTTM, UPDUSER, UPDDTTM)'
	+ ' values (@MODELCATID, @MODELID, @PROCESSID, @MODEL_XML, @INSUSER, @INSDTTM, @UPDUSER, @UPDDTTM)';
var sqlSelectModelIDQurey = 'select top(1) MODELID from ' + ModeltableName + ' where (convert(varchar(8), INSDTTM, 112) = convert(varchar(8), getdate(), 112))' + ' order by (MODELID) DESC'

var sqlSelectModelReposIDQurey = 'select top(1) * from ' + ModelRepostableName + ' where MODELID=@MODELID order by (REPOSID) DESC'


var sqlInsertModelQuery_Dev = 'insert into ' + ModeltableName + '(MODELCATID, MODELTYPE, MODELID, MODELNAME, MODELDESC,  PROCESSID, MODEL_XML, MODELID_PR, MODELID_PR_NODEID, INSUSER, INSDTTM, UPDUSER, UPDDTTM)'
	+ ' values (@MODELCATID, @MODELTYPE, @MODELID, @MODELNAME, @MODELDESC, @PROCESSID, @MODEL_XML, @MODELID_PR, @MODELID_PR_NODEID, @INSUSER, @INSDTTM, @UPDUSER, @UPDDTTM)';

var sqlInsertModelReposQuery = 'insert into ' + ModelRepostableName + '(MODELID, REPOSID, MODEL_NODEID, REPOSNAME, REPOSINFO)'
	+ ' values (@MODELID, @REPOSID, @MODEL_NODEID, @REPOSNAME, @REPOSINFO)';

function ExcuteSQLSelectModel(params, callback) {
	var connection = sql.connect(dbConnectionConfig, function (err) {
		if (err) {
			return console.error('error is', err);
		}

		var ps = new sql.PreparedStatement(connection);
		ps.input('MODELID', sql.NVarChar);

		ps.prepare(sqlSelectModelQurey, function (err, recordsets) {
			ps.execute({ MODELID: params.MODELID }, function (err, recordset) {
				ps.unprepare(function (err) {
					if (err !== null) {
						console.log(err);
					}
				});
				return callback(recordset);
			});
		});
	});
}

function ExcuteSQLSelectModelbyPromises(params, callback) {

	sql.connect(dbConnectionConfig).then(pool => {
		// Query		    
		return pool.request()
			//.input('MODELID', sql.NVarChar, params.MODELID)
			.input('MODELID', sql.NVarChar, params.MODELID)
			.query(sqlSelectModelQurey)

	}).then(result => {
		console.dir(result);

		return callback(result);
	}).catch(err => {
		console.dir(err);
		// ... error checks
	})
}


function ExcuteSQLSelectModelReposbyPromises(params, callback) {

	sql.connect(dbConnectionConfig).then(pool => {
		// Query		    
		return pool.request()
			//.input('MODELID', sql.NVarChar, params.MODELID)
			.input('MODELID', sql.NVarChar, params.MODELID)
			.query(sqlSelectModelReposIDQurey)

	}).then(result => {
		console.log(sqlSelectModelReposIDQurey);
		console.dir(result.recordset[0]);
		return callback(result);
	}).catch(err => {
		console.dir(err);
		// ... error checks
	})
}


//All file List from db
var allFileList = 'select * from ' + ModelRepostableName + ' where MODELID=@MODELID order by (REPOSID) DESC'

function ExcuteSQLSelectAllFileList(params, callback) {

	sql.connect(dbConnectionConfig).then(pool => {
		// Query		    
		return pool.request()
			//.input('MODELID', sql.NVarChar, params.MODELID)
			.input('MODELID', sql.NVarChar, params.MODELID)
			.query(allFileList)

	}).then(result => {
		console.dir(result.recordset[0]);
		return callback(result);
	}).catch(err => {
		console.dir(err);
		// ... error checks
	})
}



function getNewReposID(id, callback) {

	var params = { MODELID : id };

	ExcuteSQLSelectModelReposbyPromises(params, function (result) {
		console.log(result);
		if (result.rowsAffected != 0) {
			var data = result.recordset[0].REPOSID;
			//var cnt = data.split('REPOS');
			console.log(data);
			var cnt	= data.substr(5,5);
			console.log(cnt);

		}
		else {
			var cnt = '00001'
		}

		var zero5 = new Padder(5);
		var newcnt = zero5.pad(Number(cnt) + 1);
		console.log(newcnt);
		var newID = "REPOS" + newcnt;

		console.log(newID);

		return callback(newID);

	});
}

function getNewModelID(callback) {
	ExecuteNonQuery(sqlSelectModelIDQurey, function (result) {
		if (result.rowsAffected != 0) {
			//console.log(result);
			var data = result.recordset[0].MODELID;

			var temp = data.split('_');

			//console.log(temp);

			var cnt = temp[0].substring(0, 7);
			cnt = temp[0].split('MOD');
		}
		else {
			var cnt = '00001'
		}

		var now = new Date();
		var zero5 = new Padder(5);
		var newcnt = zero5.pad(Number(cnt[1]) + 1);
		var day = dateFormat(now, "yyyymmdd-hhMMss");
		var newID = "MOD" + newcnt + '_' + day;

		console.log(newID);

		return callback(newID);

	});

	//return callback(newModelID);
	//	return  callback();

}



//  Number.prototype.padLeft = function (n,str){
//	    return Array(n-String(this).length+1).join(str||'0')+this;
//	}
function Padder(len, pad) {
	if (len === undefined) {
		len = 1;
	} else if (pad === undefined) {
		pad = '0';
	}

	var pads = '';
	while (pads.length < len) {
		pads += pad;
	}

	this.pad = function (what) {
		var s = what.toString();
		return pads.substring(0, pads.length - s.length) + s;
	};
}


// Model  
function ExcuteSQLUpdateModel(params , callback) {
	var connection = sql.connect(dbConnectionConfig, function (err) {
		if (err) {
			return console.error('error is', err);
		}

		var ps = new sql.PreparedStatement(connection);
		ps.input('MODEL_XML', sql.Xml);
		ps.input('MODELID', sql.NVarChar);

		// Xml TO Json
		//		 var xmlToJson = convert.xml2json(XML, {compact: true, spaces: 4});
		//		 console.log(xmlToJson);

		ps.prepare(sqlUpdateModelQuery, function (err) {
			ps.execute({ MODEL_XML: params.MODEL_XML, MODELID: params.MODELID }, function (err, result) {
				ps.unprepare(function (err) {
					if (err !== null) {
						console.log(err);
					}
				});
				return callback(result);
			});
		});
	});
}

function ExcuteSQLUpdateModelbyPromises(params, callback) {

	sql.connect(dbConnectionConfig).then(pool => {
		// Query		    
		return pool.request()
			.input('MODEL_XML', sql.Xml, params.MODEL_XML)
			.input('MODELID', sql.NVarChar, params.MODELID)
			.input('MODELNAME', sql.NVarChar, params.MODELNAME)
			.input('MODELDESC', sql.NVarChar, params.MODELDESC)			
			.query('update PROCESSMODEL set MODEL_XML=@MODEL_XML , MODELNAME=@MODELNAME , MODELDESC=@MODELDESC where MODELID=@MODELID')
	}).then(result => {
		console.dir(result);
		return callback(result.rowsAffected);
	}).catch(err => {
		console.dir(err);
		// ... error checks
	});
}

sqlUpdateModelQuery_Dev = 'update ' + ModeltableName + ' set MODELNAME=@MODELNAME, MODELDESC=@MODELDESC, MODEL_XML=@MODEL_XML, MODELID_PR=@MODELID_PR, MODELID_PR_NODEID=@MODELID_PR_NODEID where MODELID=@MODELID';

function ExcuteSQLUpdateModelParams(params, callback) {
	var now = new Date();
	sql.connect(dbConnectionConfig).then(pool => {
		// Query		    
		return pool.request()
			.input('MODELID', sql.NVarChar, params.MODELID)
			.input('MODEL_XML', sql.Xml, params.MODEL_XML)
			.input('MODELNAME', sql.NVarChar, params.MODELNAME)
			.input('MODELDESC', sql.NVarChar, params.MODELDESC)
			.input('MODELID_PR', sql.NVarChar, params.MODELID_PR)
			.input('MODELID_PR_NODEID', sql.NVarChar, params.MODELID_PR_NODEID)
			.input('UPDUSER', sql.NVarChar, params.UPDUSER)
			.input('UPDDTTM', sql.DateTimeOffset, now)
			.query(sqlUpdateModelQuery_Dev)
	}).then(result => {
		console.dir(result);
		return callback(result.rowsAffected);
	}).catch(err => {
		console.dir(err);
		// ... error checks
	});
}



function ExcuteSQLInsertModel(params, callback) {
	// console.log(params);
	var connection = sql.connect(dbConnectionConfig, function (err) {
		if (err) {
			return console.error('error is', err);
		}

		var ps = new sql.PreparedStatement(connection);
		ps.input('MODELCATID', sql.NVarChar);
		ps.input('MODELID', sql.NVarChar);
		ps.input('PROCESSID', sql.NVarChar);
		ps.input('MODEL_XML', sql.Xml);
		ps.input('INSUSER', sql.NVarChar);
		ps.input('INSDTTM', sql.DateTimeOffset);
		ps.input('UPDUSER', sql.NVarChar);
		ps.input('UPDDTTM', sql.DateTimeOffset);
		ps.input('REPOSIGRUPID', sql.NVarChar);


		getNewModelID(function (result) {
			console.log(result);
		});


		ps.prepare(sqlUpdateModelQuery, function (err) {

			var now = new Date();
			ps.execute({
				MODELCATID: params.MODELCATID, MODELID: result, PROCESSID: params.PROCESSID, MODEL_XML: params.MODEL_XML,
				INSUSER: params.INSUSER, INSDTTM: now, UPDUSER: params.UPDUSER, UPDDTTM: now, REPOSIGRUPID: ''
			}, function (err, result) {
				ps.unprepare(function (err) {
					if (err !== null) {
						console.log(err);
					}
				});
				return callback(result);
			});
		});



		// params.MODELID = getNewModelID();

		// console.log(params.MODELID);


	});
}


function ExcuteSQLInsertModelRepository(params, callback) {
	getNewReposID(params.MODELID, function (result) {
		console.log(result);
		var now = new Date();
		sql.connect(dbConnectionConfig).then(pool => {
			// Query		    
			return pool.request()
				.input('MODELID', sql.NVarChar, params.MODELID)
				.input('REPOSID', sql.NVarChar, result)
				.input('MODEL_NODEID', sql.NVarChar, params.MODEL_NODEID)
				.input('REPOSNAME', sql.NVarChar, params.REPOSNAME)
				.input('REPOSDESC', sql.NVarChar, params.REPOSDESC)
				.input('REPOSINFO', sql.NVarChar, params.REPOSINFO)

				.query(sqlInsertModelReposQuery)

		}).then(result => {
			// console.dir(result);
			return callback(result);
		}).catch(err => {
			console.dir(err);
			// ... error checks
		});
	});
}


function ExcuteSQLInsertModelbyPromises(params, callback) {
	getNewModelID(function (newModelID) {
		//	 console.log(result);    
		var now = new Date();
		sql.connect(dbConnectionConfig).then(pool => {
			// Query		    
			return pool.request()
				.input('MODELCATID', sql.NVarChar, params.MODELCATID)
				.input('MODELTYPE', sql.NVarChar, params.MODELTYPE)
				.input('MODELID', sql.NVarChar, newModelID)
				.input('MODELNAME', sql.NVarChar, params.MODELNAME)
				.input('MODELDESC', sql.NVarChar, params.MODELDESC)
				.input('PROCESSID', sql.NVarChar, params.PROCESSID)
				.input('MODEL_XML', sql.Xml, params.MODEL_XML)
				.input('MODELID_PR', sql.Xml, params.MODELID_PR)
				.input('MODELID_PR_NODEID', sql.Xml, params.MODELID_PR_NODEID)
				.input('INSUSER', sql.NVarChar, params.INSUSER)
				.input('INSDTTM', sql.DateTimeOffset, now)
				.input('UPDUSER', sql.NVarChar, params.UPDUSER)
				.input('UPDDTTM', sql.DateTimeOffset, now)
				.query(sqlInsertModelQuery_Dev)

		}).then(result => {
			// console.dir(result);
			return callback(result, newModelID);
		}).catch(err => {
			console.dir(err);
			// ... error checks
		});
	});
}

function ExcuteSQLDeleteModelbyPromises(params, callback) {

	sql.connect(dbConnectionConfig).then(pool => {
		// Query		    
		return pool.request()
			.input('MODELID', sql.NVarChar, params.MODELID)
			//.query(sqlDeleteModelQuery)
			.execute('SP_BPMM_MODELER_DELETE_MODEL')
	}).then(result => {
		console.dir(result);
		return callback(result.rowsAffected);
	}).catch(err => {
		console.dir(err);
		// ... error checks
	});
}

function ExecuteNonQuery(sqlQurey, callback) {
	sql.connect(dbConnectionConfig).then(pool => {

		// Query	
		return pool.request().query(sqlQurey)
	}).then(result => {
		//  console.dir(result);
		callback(result);
	}).catch(err => {
		console.dir(err);
	})
}


module.exports = {
	NonQuery: ExecuteNonQuery,
	SelectModel: ExcuteSQLSelectModelbyPromises,
	SelectModelRepos: ExcuteSQLSelectModelReposbyPromises,
	UpdateModel: ExcuteSQLUpdateModelbyPromises,
	InsertModel: ExcuteSQLInsertModelbyPromises,
	DeleteModel: ExcuteSQLDeleteModelbyPromises,
	UdataModelParams: ExcuteSQLUpdateModelParams,
	InsertModelRepos: ExcuteSQLInsertModelRepository,

	//FileList...
	SelectAllFileList : ExcuteSQLSelectAllFileList
};