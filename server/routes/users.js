const router = require('express').Router();
const {
  models: { User },
} = require('../db');
const { mentorId, mentees } = require('../db/User');
const Sequelize = require('sequelize');
const { Op } = require('sequelize');
const { RowDescriptionMessage } = require('pg-protocol/dist/messages');
/**
 * All of the routes in this are mounted on /api/users
 * For instance:
 *
 * router.get('/hello', () => {...})
 *
 * would be accessible on the browser at http://localhost:3000/api/users/hello
 *
 * These route tests depend on the User Sequelize Model tests. However, it is
 * possible to pass the bulk of these tests after having properly configured
 * the User model's name and userType fields.
 */

// Add your routes here:

router.get('/unassigned', async(req, res, next) => {
  try{
    const unassignedMentee =  await User.findUnassignedStudents(mentorId);
    res.status(200).send(unassignedMentee);
  }catch(error){
    next(error);
  }
});

router.get('/teachers', async(req, res, next) => {
  try{
    const teachersAndStudents =  await User.findTeachersAndMentees(mentees);
     res.status(200).send(teachersAndStudents);
  }catch(error){
    next(error);
  }
});

router.delete('/:id', async(req, res, next) => {
  try{
    const userId = req.params.id;
    if (isNaN(userId)){
       return res.sendStatus(400);
    }
    const deleteUser = await User.destroy({
      where: {
        id: userId
      }
    })
    if(!deleteUser){
       res.sendStatus(404);
    } else if (deleteUser){
      res.sendStatus(204);
    }
  }catch(error){
    next(error);
  }
});
//^^^^ Sarah: A. if this isn't a number, there's no point of doing anything
//else with it... so do that FIRST!! DUH. 2. If you don't return your sendStatus 
//from the first if, you get a HTTP headers error. This is because code will continue
//to execute.

router.post('/', async(req, res, next) => {
  try{
      const currentUser = await User.findOne({
        where: {
          name: req.body.name
        }
      })
      if(currentUser){
        res.sendStatus(409);
      } else {
         const newUser = await User.create(req.body);
        return res.status(201).send(newUser);
      }
    }catch(error){
    next(error);
  }
});
//^^^^ variable to hold currentUser. If that user exists, send 409.
//If not, create the new user and send 201 with new user!

router.put('/:id', async(req, res, next) => {
  try{
    const user = await User.findByPk(req.params.id);
    if(!user){
      return res.sendStatus(404);
     }
    else {
     const updatedUser =  await user.update(req.body);
     return res.status(200).send(updatedUser);
    }
  }catch(error){
    next(error)
  }
})
//^^^^ variable for all users, if user does not exists, 404 status. if it does,
//then, update user and send 200 status.

router.get('/', async(req, res, next) => {
  try{
    const userName =  await User.findAll({
      where: {
        name: {
          [Sequelize.Op.iLike] : `%${req.query.name}%`
        }
      }
    });
      res.status(200).send(userName);
  }catch(error){
    next(error);
  }
});
//^^^^ find all the user-names that match the req.query.name - op.iLike 
//includes strings that are case-insensitive.

module.exports = router;
