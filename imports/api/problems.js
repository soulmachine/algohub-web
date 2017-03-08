import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';

export const Problems = new Mongo.Collection('problems');
export const FinishedProblems = new Mongo.Collection('finished_problems');

if (Meteor.isServer) {
  Problems._ensureIndex({ "title": 1 }, { unique: true });
  Problems._ensureIndex({ "title_slug": 1 }, { unique: true});

  Meteor.methods({
    // sortBy field name, desc 1 or -1
    'getProblems'(skipCount, sortBy, order) {
      const sortOption = {};
      sortOption[sortBy] = order == 'ascend' ? 1 : -1;
      const problems = Problems.find({}, {
        fields: {_id: 1, title: 1, title_slug: 1, difficulty: 1, total_accepted: 1, total_submissions: 1},
        sort: sortOption, skip: skipCount, limit: parseInt(Meteor.settings.public.recordsPerPage)
      }).fetch();

      if(Meteor.userId()) {
        problems.forEach(problem => {
          const tmp = FinishedProblems.find({userId: Meteor.userId(), problemId: problem._id}, {fields: {_id: 1}, limit: 1}).count();
          problem["finished"] = tmp > 0;
        })
      }
      return problems;
    },
    'totalProblemCount'() {
      return Problems.find().count();
    },
    'getProblem'(title_slug) {
      return Problems.findOne({'title_slug': title_slug});
    },
  });
}
