const express = require('express');
const router = express.Router();
const db = require('../db/db.js');
const addslashes = require('../db/addslashes.js');
const conf = require('../config.js');

const sql = require('../db/sql/adhocSql.js')

// Post adhoc template (Insert)
router.post('/', function (req, res, next) {
	let vname = req.body.name ? addslashes(req.body.name) : "";
	let vcontent = req.body.content ? addslashes(req.body.content) : "";
	let viid = req.body.iid ? addslashes(req.body.iid) : "";
	let viname = req.body.iname ? addslashes(req.body.iname) : "";
	let vcname = req.body.cname ? addslashes(req.body.cname) : "";
	let vmodule = req.body.module ? addslashes(req.body.module) : "";
	let varg = req.body.argument ? addslashes(req.body.argument) : "";
	let vforks = req.body.forks ? addslashes(req.body.forks) : "";
	let vlimits = req.body.limits ? addslashes(req.body.limits) : "";
	let vverb = req.body.verb ? addslashes(req.body.verb) : "";
	let vvariables = req.body.variables ? addslashes(req.body.variables) : "---";
	let vuse_yn = req.body.use_yn ? addslashes(req.body.use_yn) : "Y";

	// console.log('#####req.body.variables : ##' + req.body.variables);
	// console.log('#####addslashes(req.body.variables) : ##' + addslashes(req.body.variables));

	let stringQuery = sql.post(vname, vcontent, viid, viname, vcname, vmodule, varg, vforks, vlimits, vverb, vvariables, vuse_yn)

	db.iquery(stringQuery, [], (err, rows) => {
		if (err) {
			return next(err);
		}

		if (rows.rowCount < 1) {
			res.json(db.resultMsg('840', req.body));
		} else {
			delete req.body.mpw;
			res.json(db.resultMsg('200', req.body));
		}
	});
});

/* PUT adhoc template (Update) */
router.put('/', function (req, res, next) {
	let vseq = req.query.seq ? addslashes(req.query.seq) : "";
	let vname = req.body.name ? addslashes(req.body.name) : "";
	let vcontent = req.body.content ? addslashes(req.body.content) : "";
	let viid = req.body.iid ? addslashes(req.body.iid) : "";
	let viname = req.body.iname ? addslashes(req.body.iname) : "";
	let vcname = req.body.cname ? addslashes(req.body.cname) : "";
	let vmodule = req.body.module ? addslashes(req.body.module) : "";
	let varg = req.body.argument ? addslashes(req.body.argument) : "";
	let vforks = req.body.forks ? addslashes(req.body.forks) : "";
	let vlimits = req.body.limits ? addslashes(req.body.limits) : "";
	let vverb = req.body.verb ? addslashes(req.body.verb) : "";
	let vvariables = req.body.variables ? addslashes(req.body.variables) : "---";
	let vuse_yn = req.body.use_yn ? addslashes(req.body.use_yn) : "Y";

	if (vseq) {
		if (isNaN(vseq) === false) {
			let stringQuery = sql.update(vname, vcontent, viid, viname, vcname, vmodule, varg, vforks, vlimits, vverb, vvariables, vuse_yn, vseq)

			db.iquery(stringQuery, [], (err, rows) => {
				if (err) {
					return next(err);
				}

				if (rows.rowCount < 1) {
					res.json(db.resultMsg('840', req.body));
				} else {
					res.json(db.resultMsg('200', req.body));
				}
			});
		} else {
			console.log("Type error! Please input Integer type ID!!");
			res.json(db.resultMsg('820', req.body));
		}
	} else {
		console.log("Job template ID does not exist!!");
		res.json(db.resultMsg('820', req.body));
	}

});

/* DELETE adhoc template (delete) */
router.delete('/', function (req, res, next) {
	let vseq = req.query.seq ? addslashes(req.query.seq) : "";

	if (vseq) {
		if (typeof vseq === 'string') {
			let stringQuery = sql.delete(vseq)

			db.iquery(stringQuery, [], (err, rows) => {
				if (err) {
					return next(err);
				}

				if (rows.rowCount < 1) {
					res.json(db.resultMsg('840', req.body));
				} else {
					res.json(db.resultMsg('200', req.body));
				}
			});

		} else {
			console.log("Type error! Please input String type ID!!");
			res.json(db.resultMsg('820', req.body));
		}
	} else {
		console.log("ADHOC ID does not exist!!");
		res.json(db.resultMsg('820', req.body));
	}

});

/* GET adhoc template (SELECT ONE) */
router.get('/o', (req, res, next) => {
	let vseq = req.query.seq ? addslashes(req.query.seq) : "";

	if (vseq) {
		if (isNaN(vseq) === false) {
			let stringQuery = sql.getOneRow(vseq)

			db.query(stringQuery, [], (err, rows) => {
				if (err) {
					return next(err);
				}
				if (rows.rowCount < 1) {
					res.json(db.resultMsg('602', rows.rows[0]));
				} else {
					res.json(db.resultMsg('200', rows.rows[0]));
				}
			});
		} else {
			console.log("Type error! Please input Integer type ID!!");
			res.json(db.resultMsg('820', req.body));
		}
	} else {
		console.log("Job template ID does not exist!!");
		res.json(db.resultMsg('820', req.body));
	}

});

/* GET adhoc template listing. */
router.get('/', function (req, res, next) {
	let vdata = {};
	let vpage = req.query.page ? addslashes(req.query.page) : "";
	let vpageSize = req.query.pageSize ? addslashes(req.query.pageSize) : "";
	let vname = req.query.name ? addslashes(req.query.name) : "";

	if (vpage == "" || vpage < 1) {
		vpage = 1;
	}
	if (vpageSize == "" || vpageSize < 1) {
		vpageSize = 15;
	}
	let vstart = (vpage - 1) * vpageSize;

	let stringQuery = sql.getList(vname)

	let imsi = db.iquery(stringQuery, [], (err, rows) => {
		if (err) {
			return next(err);
		}

		totalCount(req).then(function (result) {
			vdata['rowCount'] = rows.rowCount;
			vdata['totalCount'] = result;
			vdata['page'] = vpage;
			vdata['pageSize'] = vpageSize;
			vdata['list'] = rows.rows;

			if (vdata.rowCount < 1) {
				res.json(db.resultMsg('602', rows.rows));
			} else {
				// console.log(db.resultMsg('200', vdata));
				res.json(db.resultMsg('200', vdata));
			}
		}).catch(function (err) {
			if (err) {
				console.log(err);
			}
		});
	});
});


function totalCount(req) {
	let vdata = {};
	let vname = req.query.name ? addslashes(req.query.name) : "";

	let stringQuery = sql.totalCount(vname)

	return new Promise(function (resolve, reject) {
		db.query(stringQuery, [], (err, rows) => {
			if (err) {
				return reject(err);
			}
			// console.log("total func: " + rows.rows[0].total);
			resolve(rows.rows[0].total);

		});
	});
}

module.exports = router;