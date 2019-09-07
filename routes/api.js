/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb');
var ObjectId = require('mongodb').ObjectID;
const mongoose = require('mongoose')


const CONNECTION_STRING = process.env.DB; //MongoClient.connect(CONNECTION_STRING, function(err, db) {});
mongoose.connect(CONNECTION_STRING, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false
})


const issueSchema = new mongoose.Schema({
  issue_title: {
    type: String,
    required: true
  },
  issue_text: {
    type: String,
    required: true
  },
  created_by: {
    type: String,
    required: true
  },
  assigned_to: String,
  status_text: String,
  created_on: {
    type: Date,
    required: true
  },
  updated_on: {
  type: Date
    
},
  open:{
    type: Boolean,
    default: true
  }
})

const Issue = mongoose.model('Issue', issueSchema)




module.exports = function (app) {

  app.route('/api/issues/:project')
    
    .get(async (req, res) => {
    const filter = req.query
    const allIssues = await Issue.find()
    if (!allIssues){
      return res.status(400)
    }
    res.send(allIssues)
      
    })
    
    .post(async (req, res) => {
     const issue = new Issue(req.body)
     const now = new Date()
     issue.created_on = now
     issue.updated_on = now
     try{
       await issue.save()
       res.send(issue)
     }catch(e){
       res.status(400).send(e)
     }
    })
    
    .put(async (req, res)=> {
      const issue = await Issue.findById(req.body._id)
      if (!issue){
        console.log('no ID')
        return res.status(400).send(`could not update ${req.body._id}`)
      }
    else if (!req.body.issue_title && !req.body.issue_text &&
       !req.body.created_by && !req.body.assigned_to && !req.body.status_text && req.body.open!=='false'){
      console.log('no fields!')
      return res.status(400).send({error:'no updated field sent'})
    }
    console.log('at least one field!')
//       // id exists and a field exists
       const now = new Date()
       issue.updated_on = now
      const updates = Object.keys(req.body)
      const allowedUpdates = ['issue_title', 'issue_text', 'created_by', 'assigned_to', 'status_text', 'open']
     updates.forEach(item=> {
       if (req.body[item] && allowedUpdates.includes(item)){
           issue[item] = req.body[item]
           }
     })  
    await issue.save()
    console.log('saved')
      res.send('successfully updated')
    
    })
    
    .delete( async (req, res) => {
      try{
      
        if (!req.body._id){
          return res.status(400).send('_id error')
        }
        
        const issue = await Issue.findByIdAndDelete(req.body._id)
        if (!issue){
          return res.status(400).send('_id error')
        }
        res.send(`deleted ${req.body._id}`)
      } catch(e){
        res.status(400).send(`could not delete ${req.body._id} `)
      }
       
    });
    
}, Issue;
