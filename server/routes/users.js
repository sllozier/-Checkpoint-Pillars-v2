const router = require('express').Router();
const {
  models: { User },
} = require('../db');
const { mentorId, mentees } = require('../db/User');

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
})

module.exports = router;
