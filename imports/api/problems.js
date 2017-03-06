import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';

export const Problems = new Mongo.Collection('problems');

if (Meteor.isServer) {
  Problems._ensureIndex({ "title": 1 }, { unique: true });
  Problems._ensureIndex({ "title_slug": 1 }, { unique: true});

  Meteor.methods({
    // sortBy field name, desc 1 or -1
    'getProblems'(skipCount, sortBy, order) {
      const sortOption = {};
      sortOption[sortBy] = order == 'ascend' ? 1 : -1;
      return Problems.find({}, {
        fields: {_id: 1, title: 1, title_slug: 1, difficulty: 1, total_accepted: 1, total_submissions: 1},
        sort: sortOption, skip: skipCount, limit: parseInt(Meteor.settings.public.recordsPerPage)
      }).fetch();
    },
    'totalProblemCount'() {
      return Problems.find().count();
    }
  });
}
