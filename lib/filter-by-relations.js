const _ = require('underscore');
const traverse = require('traverse');
const debug = require('debug')('loopback:mixins:filter-by-relations');
const Bluebird = require('bluebird');

/**
 * Example:
 * filter = {where: { <RelationName>: <RelationWhere> }}
 */

module.exports = (Model, options) => {
	Model.observe('access', async (ctx) => {
		const name = Model.definition.name;
		debug("%s: ( %j )", name, ctx.query);
		let relations = Model.definition.settings.relations || {};
		let tasks = [];
		traverse.forEach(ctx.query.where, function (value) {
			let context = this;
			let key = this.key;
			let relation = relations[key];
			let parentRelation = context.parent ? relations[context.parent.key] : false;
			if (relation && !parentRelation) {
				debug("%s.%s ( %j )", name, key, value, context.parent.key);
				// debug("Relation definition: %j", relation);
				let nestedWhere;
				tasks.push((async () => {
					let relFound = await Model.app.models[relation.model].find({ where: value });
					debug("%s.%s == %j", name, key, relFound);
					if (relation.through) {
						let relTroughWhere = {
							[relation.keyThrough]: { inq: _.pluck(relFound, "id") }
						};
						debug("relTroughWhere:", Model.definition.name, key, relTroughWhere);
						let relThroughFound = await Model.app.models[relation.through].find({ where: relTroughWhere });
						debug("relThroughFound:", Model.definition.name, key, relThroughFound);
						nestedWhere = { id: { inq: _.pluck(relThroughFound, relation.foreignKey) } };
					} else if (relation.type == "belongsTo") {
						nestedWhere = { [relation.foreignKey]: { inq: _.pluck(relFound, "id") } };
					} else {
						nestedWhere = { id: { inq: _.pluck(relFound, relation.foreignKey) } };
					}

					context.delete();
					let parentNode = _.clone(context.parent.node);
					_.each(context.parent.node, (val, key) => { delete context.parent.node[key] });
					context.parent.node.and = [parentNode, nestedWhere].filter(o => !_.isEmpty(o));
					debug("%s.%s => %j", name, key, nestedWhere);
				}));
			}
		});
		if (tasks.length) {
			await Bluebird.each(tasks, task => task());
			debug("Changed query: %j", ctx.query);
		}
	});
};
