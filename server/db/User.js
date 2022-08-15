const Sequelize = require('sequelize');
const db = require('./db');
const { DataTypes } = require('sequelize');

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
  },
  isStudent:{
    type: DataTypes.VIRTUAL,
    get(){
      if(`${this.userType}` === 'STUDENT'){
        return true
      } else {
        return false
      }
    }
  },
  isTeacher:{
    type: DataTypes.VIRTUAL,
    get(){
      if(`${this.userType}` === 'TEACHER'){
        return true
      } else {
        return false
      }
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
};
//^^^^ returns all teachers assinged mentees in an array.
User.beforeUpdate(person => {
  if(person.userType === 'TEACHER' || person.mentees.length < 0 && person.mentorId === null){
    return person
  }
  
})
module.exports = User;
