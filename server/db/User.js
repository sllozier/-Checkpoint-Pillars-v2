const Sequelize = require('sequelize');
const db = require('./db');
const {Op} = require('sequelize');

const User = db.define('user', {
  name: {
    type: Sequelize.STRING,
    unique: true,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  userType: {
    type: Sequelize.TEXT,
    defaultValue: 'STUDENT',
    allowNull: false,
    validate: {
      isIn: [['STUDENT', 'TEACHER']]
    }
  }
});

/**
 * We've created the association for you!
 *
 * A user can be related to another user as a mentor:
 *       SALLY (mentor)
 *         |
 *       /   \
 *     MOE   WANDA
 * (mentee)  (mentee)
 *
 * You can find the mentor of a user by the mentorId field
 * In Sequelize, you can also use the magic method getMentor()
 * You can find a user's mentees with the magic method getMentees()
 */

User.belongsTo(User, { as: 'mentor' });
User.hasMany(User, { as: 'mentees', foreignKey: 'mentorId' });

User.findUnassignedStudents = async function(){
  return await this.findAll({
    where: {
      userType: 'STUDENT',
      mentorId: null
    }
  })
};

User.findTeachersAndMentees = async function (){
  return await this.findAll({
    include: {
      model: User,
      as: 'mentees'
    },
    where: {
      userType: 'TEACHER'
    }
  })
}
module.exports = User;
