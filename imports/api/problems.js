import { Meteor } from 'meteor/meteor';
import { HTTP } from 'meteor/http'
import { Mongo } from 'meteor/mongo';

export const Problems = new Mongo.Collection('problems');
export const FinishedProblems = new Mongo.Collection('finished_problems');
export const SubmissionHistory = new Mongo.Collection('submission_history');

if (Meteor.isServer) {
  Problems._ensureIndex({ "title": 1 }, { unique: true });

  Meteor.methods({
    // sortBy field name, desc 1 or -1
    'getProblems'(skipCount, sortBy, order) {
      const sortOption = {};
      sortOption[sortBy] = order == 'ascend' ? 1 : -1;
      const problems = Problems.find({}, {
        fields: {_id: 1, title: 1, difficulty: 1, total_accepted: 1, total_submissions: 1},
        sort: sortOption, skip: skipCount, limit: parseInt(Meteor.settings.public.recordsPerPage)
      }).fetch();

      if(Meteor.userId()) {
        problems.forEach(problem => {
          const tmp = FinishedProblems.find({userId: Meteor.userId(), problemId: problem._id}, {fields: {_id: 1}, limit: 1}).count();
          problem["finished"] = tmp > 0;
        })
      }
      problems.forEach(p => {
        if(!p['total_accepted']) {
          p['total_accepted'] = 0;
        }
        if(!p['total_submissions']) {
          p['total_submissions'] = 0;
        }
      });
      return problems;
    },
    'totalProblemCount'() {
      return Problems.find().count();
    },
    'getProblem'(id) {
      return Problems.findOne({'_id': id});
    },
    'submitCode'(id, lang, code) {
      const response = HTTP.call("POST", Meteor.settings.JUDGE_URL + '/' + id + '/judge', {data: {language: lang, code, problem_id: id}});
      const judgeResult = response.data;
      if(judgeResult.status_code == 4) {
        Problems.update({_id: id}, { $inc: { total_submissions: 1, total_accepted: 1 } } )
      } else {
        Problems.update({_id: id}, { $inc: { total_submissions: 1 } } )
      }
      const submission = {user_id: Meteor.userId(), problem_id: id, language: lang, code: code, judge_result: judgeResult, createdAt: new Date()};
      const submissionId = SubmissionHistory.insert(submission);
      submission["_id"] = submissionId;
      return submission;
    }
  });
}
