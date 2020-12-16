const express = require('express')
const router = new express.Router()
const Task = require('../models/task')
const auth = require('../middleware/auth')

router.post('/tasks', auth, (req, resp)=>{
    // const task = new Task(req.body)
    const task = new Task({
        ...req.body,
        owner: req.user._id
    })

    task.save().then(result=>{
        resp.status(201).send(result)
    }).catch(error=>{
        resp.status(400).send(error);
    })
})

// New Approach
// Get Tasks.
router.get('/tasks', auth, async (req, resp)=> {    
    const match = {}
    var limit = 10;
    var skip = 10;
    const sort = {}
    if (req.query.limit){
        limit = parseInt(req.query.limit)
    }
    if (req.query.skip){
        skip = parseInt(req.query.skip)
    }
    if ( req.query.completed){
        match.completed = req.query.completed === 'true'
    }
    if (req.query.sortBy){
        const parts = req.query.sortBy.split(':')
        sort[parts[0]] = parts[1] === 'asc' ? 1 : -1
        console.log(sort)
    }
    try {
        // Approach One.
        // const tasks = await Task.find({owner: req.user._id})
        await req.user.populate({path: 'tasks', match, 
        options : {
            limit:limit,
            skip: skip,
            sort: {
                createdAt: -1
            }
        }
    }).execPopulate()
        resp.send(req.user.tasks)    
    } catch (error) {
        resp.status(500).send()
    }    
})

// Older Approach
// Get Tasks
router.get('/tasksss', (req, resp)=>{
    Task.find(req.body).then(results =>{
        resp.send(results)
    }).catch(error => {
        resp.status(500).send()
    })
})

// fetch taks by id, Using Old Method.
router.get('/taskss/:id', (req, resp)=>{
    Task.findById(req.params.id).then(result=>{
        console.log('Result ' + result)
        if (!result)
            return resp.status(404).send('Task not found!!')

        resp.send(result)
    }).catch(error => {
        console.log('Error ' + error)
        resp.status(500).send()
    })
})

// fetch taks by id, Using new Method.
router.get('/tasks/:id', auth, async (req, resp)=> {
    const _id = req.params.id
    try {
        const task = await Task.findOne({_id, owner: req.user._id})
        console.log('Task ' + task)
        if (!task)
            return resp.status(404).send('Task not found!!')

        resp.send(task)
            
    } catch (error) {
        console.log('Error ' + error)
        resp.status(500).send('There was an error getting the task.')
        
    }
})

// Update Task by Id.
router.patch('/tasks/:id', auth, async (req, resp)=>{

    const updates = Object.keys(req.body)
    const allowedUpdates = ['description', 'completed']

    const isValidOperation = updates.every(update=>allowedUpdates.includes(update))
    if (!isValidOperation){
        return resp.status(400).send({error : 'Invalid Updates'})
    }
    try {
        const task = await Task.findOne({_id:req.params.id, owner: req.user._id })
        if (!task){
            return resp.status(404).send()
        }

        updates.forEach(update=>{
            task[update] = req.body[update]
        })

        await task.save()
        return resp.send(task)
            
    } catch (error) {
        resp.status(501).send(error)
    }
})

router.delete('/tasks/:id', auth, async (request, response)=>{
    try {
        const task = await Task.findOneAndDelete({_id:request.params.id, owner: request.user._id})
        if (!task){
            return response.status(404).send('Unable to find the task to delete')
        }
        return response.send(task)
    } catch (error) {
        return response.status(500).send(error + 'There was a problem deleting a task.')
    }

})

module.exports = router